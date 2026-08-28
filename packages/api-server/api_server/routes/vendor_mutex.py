"""
Where the vendor's fleet manager asks for, and gives back, a shared zone.

Both ends of the zone arrive at one url as the same `agvCallback` body; which
end it is comes from the `method` field, ACQUIRE or RELEASE.

The two ends are matched to each other by `robotCode`, not by `taskCode`. A
robot that has locked a zone can finish one task and start another without
leaving it, so the code it quotes on the way out is often not the one it quoted
on the way in; its robot id is the one field in the exchange that holds still.

SECURITY: mounted without authentication, unlike /mutex_groups next door, which
sits behind the dashboard login. Their fleet manager posts from a task template
and has nowhere to put a keycloak token, so this url has to stay open. Keep it
on a closed network.
"""

from typing import Annotated

from fastapi import APIRouter, Depends

from api_server.app_config import app_config
from api_server.logging import LoggerAdapter, get_logger
from api_server.models import AgvCallback, AgvCallbackResponse
from api_server.mutex_broker import MutexBroker, MutexLeaseNotFound, get_mutex_broker

router = APIRouter(tags=["VendorMutex"])

# Their side reads this out of the body; the http status only tells them the
# message arrived.
RCS_OK = "0"
RCS_FAIL = "1"

METHOD_ACQUIRE = "ACQUIRE"
METHOD_RELEASE = "RELEASE"


def _ok(callback: AgvCallback, message: str = "successful") -> AgvCallbackResponse:
    return AgvCallbackResponse(code=RCS_OK, message=message, req_code=callback.req_code)


def _fail(callback: AgvCallback, message: str) -> AgvCallbackResponse:
    return AgvCallbackResponse(
        code=RCS_FAIL, message=message[:64], req_code=callback.req_code
    )


@router.post("/agv_callback", response_model=AgvCallbackResponse)
async def vendor_agv_callback(
    callback: AgvCallback,
    broker: Annotated[MutexBroker, Depends(get_mutex_broker)],
    logger: Annotated[LoggerAdapter, Depends(get_logger)],
):
    """
    One url for both ends of a shared zone, told apart by `method`.
    """
    if not callback.robot_code:
        # Without it there is nothing to file the lease under, and nothing to
        # address the continueTask call to either.
        logger.error(f"vendor callback without a robotCode: {callback}")
        return _fail(callback, "robotCode is required")

    method = callback.method.strip().upper()
    if method == METHOD_ACQUIRE:
        return _acquire(callback, broker, logger)
    if method == METHOD_RELEASE:
        return _release(callback, broker, logger)

    # Nothing else will move their robot on if this was meant to be an acquire,
    # so this has to be loud rather than a quiet 422.
    logger.error(
        f"vendor callback with unknown method [{callback.method}] from robot "
        f"{callback.robot_code}, expected {METHOD_ACQUIRE} or {METHOD_RELEASE}"
    )
    return _fail(callback, f"unknown method {callback.method}")


def _acquire(
    callback: AgvCallback, broker: MutexBroker, logger: LoggerAdapter
) -> AgvCallbackResponse:
    """
    Their robot has reached a waiting point and wants the zone beyond it.

    Answers immediately, before the zone is actually ours: an RMF robot may be
    holding it and their fleet manager gives up on a slow answer. Their robot
    stays where it is until we call continueTask, which happens the moment the
    zone is granted.
    """
    group = app_config.vendor_point_to_mutex_group.get(callback.position_code)
    if not group:
        # Nothing else will move their robot on, so this has to be loud.
        logger.error(
            f"vendor point [{callback.position_code}] is not mapped to any mutex "
            f"group, robot {callback.robot_code} will wait there until an "
            f"operator intervenes (task {callback.task_code})"
        )
        return _fail(callback, f"unmapped point {callback.position_code}")

    existing = broker.find_by_agv(callback.robot_code)
    if existing is not None and existing.group == group:
        # Their fleet manager retries a failed connection up to five times with
        # the same payload, so arriving twice for one zone is normal rather than
        # an error. Answering yes to the repeat keeps them from retrying further.
        # The task code is taken from the repeat rather than the original: if
        # the robot has moved on to another task in the meantime, the newer one
        # is the one worth reporting.
        broker.note_task_code(callback.robot_code, callback.task_code)
        logger.info(
            f"vendor re-sent acquire for robot {callback.robot_code}, already "
            f"holding a lease on [{group}] in state {existing.state.value}"
        )
        return _ok(callback, "already queued")

    if existing is not None:
        # A different zone means the robot has moved on to its next leg without
        # its release for the last one reaching us. It cannot be at this waiting
        # point and still inside the previous zone, so the old lease is stale
        # and holding it would block RMF robots for nothing.
        logger.warning(
            f"vendor robot {callback.robot_code} is asking for [{group}] while "
            f"still holding [{existing.group}]; its release never arrived, "
            f"releasing the old zone now"
        )
        broker.release_by_agv(callback.robot_code, "robot moved on without releasing")

    # Several of their robots can be queueing for one zone at the same time.
    # Each gets its own lease and its own place in the supervisor's queue, which
    # is the same queue RMF robots line up in, so they are all served in the
    # order they asked.
    lease = broker.acquire(
        group,
        callback.robot_code,
        agv_code=callback.robot_code,
        task_code=callback.task_code,
    )

    logger.info(
        f"vendor robot {callback.robot_code} is queueing for mutex group "
        f"[{group}] at [{callback.position_code}] (task {callback.task_code}, "
        f"lease {lease.lease_id})"
    )
    return _ok(callback)


def _release(
    callback: AgvCallback, broker: MutexBroker, logger: LoggerAdapter
) -> AgvCallbackResponse:
    """
    Their robot has left the zone.

    Matched by robot rather than by point, so an exit point that nobody
    remembered to put in the mapping still releases correctly.
    """
    # Whatever it is running now is what the release should be logged against,
    # and it is quite likely not what it arrived on.
    broker.note_task_code(callback.robot_code, callback.task_code)
    try:
        broker.release_by_agv(callback.robot_code, "vendor reached its exit point")
    except MutexLeaseNotFound:
        # Either a retry of a release we already handled, or a lease that timed
        # out from under them. Both mean the zone is free, which is what they
        # asked for, so telling them it failed would only make them retry.
        logger.info(
            f"vendor robot {callback.robot_code} released but no lease was open"
        )
        return _ok(callback, "no lease open")

    logger.info(
        f"vendor robot {callback.robot_code} released its mutex group at "
        f"[{callback.position_code}] (task {callback.task_code})"
    )
    return _ok(callback)
