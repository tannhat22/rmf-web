import asyncio
from datetime import datetime, timedelta, timezone
from logging import Logger, LoggerAdapter

import schedule
from tortoise.expressions import Q
from tortoise.transactions import in_transaction

from .models import tortoise_models as ttm

# How much task history is kept, anything older is dropped by the cleanup job.
TASK_RETENTION_DAYS = 30

# Tasks removed per transaction. Deleting everything in one statement would hold
# a lock over the whole table on mysql for as long as it takes.
DELETE_BATCH_SIZE = 500

# A task in one of these is still going, it is never dropped no matter how old
# the row is. Everything else (completed, failed, canceled, killed, skipped,
# error) is done with and safe to remove.
ACTIVE_STATUSES = [
    "uninitialized",
    "blocked",
    "queued",
    "standby",
    "underway",
    "delayed",
]

# Run daily, at a time when the fleet is unlikely to be busy. Server local time.
CLEANUP_TIME = "06:30"


def _stale_task_states(cutoff: datetime):
    # `request_time` is set when the task is booked and `start_time` when it
    # begins, either one dates the task. Rows carrying neither cannot be aged so
    # they are left alone.
    outside_window = Q(unix_millis_request_time__lt=cutoff) | Q(
        unix_millis_request_time__isnull=True, unix_millis_start_time__lt=cutoff
    )
    # `status` is nullable, so the "not active" half has to spell out the null
    # case, `not_in` alone would silently drop those rows from the result.
    not_running = Q(status__isnull=True) | Q(status__not_in=ACTIVE_STATUSES)
    return ttm.TaskState.filter(outside_window).filter(not_running)


async def delete_stale_tasks(logger: Logger | LoggerAdapter) -> int:
    """
    Deletes task history older than `TASK_RETENTION_DAYS`, returns how many
    tasks were removed.

    Removes the task state, its request and its event log. Everything hanging
    off those (labels, phases, events and their logs) goes with them through the
    `on delete cascade` tortoise puts on the foreign keys.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=TASK_RETENTION_DAYS)
    deleted = 0

    while True:
        task_ids = (
            await _stale_task_states(cutoff)
            .limit(DELETE_BATCH_SIZE)
            .values_list("id_", flat=True)
        )
        if not task_ids:
            break

        async with in_transaction():
            await ttm.TaskEventLog.filter(pk__in=task_ids).delete()
            await ttm.TaskRequest.filter(pk__in=task_ids).delete()
            await ttm.TaskState.filter(pk__in=task_ids).delete()

        deleted += len(task_ids)

    if deleted:
        logger.info(
            f"task cleanup: deleted {deleted} tasks older than "
            f"{TASK_RETENTION_DAYS} days (cutoff {cutoff.isoformat()})"
        )
    else:
        logger.info(
            f"task cleanup: nothing older than {TASK_RETENTION_DAYS} days to delete"
        )
    return deleted


def schedule_task_cleanup(
    scheduler: schedule.Scheduler,
    logger: Logger | LoggerAdapter,
) -> set[asyncio.Task]:
    """
    Registers the daily cleanup job and kicks off one run immediately, so a
    server that keeps restarting before `CLEANUP_TIME` still gets cleaned up.

    The returned set holds the running jobs. The caller has to keep it alive:
    the event loop only holds weak references, so dropping it lets a cleanup be
    garbage collected halfway through.
    """
    running: set[asyncio.Task] = set()

    async def run() -> None:
        try:
            await delete_stale_tasks(logger)
        except Exception as e:  # pylint: disable=broad-except
            # never let a failed cleanup take the scheduler down with it
            logger.error(f"task cleanup failed: {e}")

    def spawn() -> None:
        task = asyncio.create_task(run())
        running.add(task)
        task.add_done_callback(running.discard)

    scheduler.every().day.at(CLEANUP_TIME).do(spawn)
    spawn()

    logger.info(
        f"scheduled task cleanup daily at {CLEANUP_TIME}, "
        f"keeping {TASK_RETENTION_DAYS} days of history"
    )
    return running
