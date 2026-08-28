"""
Keeps third party leases honest.

When a caller polls for its own lease, the polling is the proof that it is still
there, and a lease that stops being polled lapses on its own. The vendor fleet
cannot poll: it asks for a zone, is told to proceed, and then says nothing at
all until it reaches the exit point. Nothing in that exchange would ever reveal
a robot that broke down halfway through, and the zone would sit locked until the
hold ceiling ran out, with RMF robots waiting the whole time.

So the proof is gathered from the other side instead. The watchdog asks the
vendor's own fleet manager after each robot, and renews or releases on the
answer. Losing sight of a robot is itself an answer: after enough sweeps without
it appearing at all, the zone goes back to RMF, on the grounds that a robot we
cannot see is a robot we cannot coordinate with.

How much that answer is worth is a judgement for the site, so the check is
optional. Their status says what the robot is doing, never where it is standing,
and reads the same between two tasks in the middle of a zone as it does back at
the robot's home point. With `vendor_check_agv_status` off there is no polling at
all, and a lease then ends only when their release callback arrives or the hold
ceiling runs out. The watchdog still runs either way: telling their robot to
continue once a zone is granted is its other job, and that one is never optional.
"""

import asyncio
import contextlib
import uuid

from api_server.app_config import app_config
from api_server.fast_io.singleton_dep import singleton_dep
from api_server.logging import default_logger
from api_server.mutex_broker import MutexBroker, MutexLeaseNotFound, get_mutex_broker
from api_server.vendor_client import VendorClient, VendorRobotState, get_vendor_client


class VendorWatchdog:
    def __init__(
        self,
        broker: MutexBroker,
        client: VendorClient,
        *,
        period: float,
        check_status: bool,
        max_failures: int,
        continue_retries: int,
        continue_retry_delay: float,
        logger=None,
    ):
        self._broker = broker
        self._client = client
        self._period = period
        self._check_status = check_status
        self._max_failures = max_failures
        self._continue_retries = continue_retries
        self._continue_retry_delay = continue_retry_delay
        self._logger = logger or default_logger
        self._failures: dict[str, int] = {}
        self._loop_task: asyncio.Task | None = None

    async def __aenter__(self):
        if not self._client.configured:
            self._logger.warning(
                "no vendor url configured, third party mutex leases will rely on "
                "the hold ceiling alone"
            )
            return self
        self._broker.add_grant_listener(self._on_granted)
        self._loop_task = asyncio.create_task(self._run())
        if self._check_status:
            self._logger.info(
                f"vendor watchdog started, checking robot status every "
                f"{self._period}s"
            )
        else:
            self._logger.info(
                "vendor watchdog started without status checking, leases will "
                "end on the vendor's release callback or the hold ceiling"
            )
        return self

    async def __aexit__(self, *exc):
        if self._loop_task is not None:
            self._loop_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._loop_task
        await self._client.aclose()

    # ------------------------------------------------------------- on granted
    async def _on_granted(self, lease) -> None:
        """
        A zone became ours. Until the vendor hears about it their robot is
        parked at the waiting point, so this is worth retrying hard.
        """
        if lease.agv_code is None:
            return

        # One reqCode for the whole attempt, reused by every retry: RCS-2000
        # takes a changed reqCode as a brand new request rather than a repeat.
        req_code = uuid.uuid4().hex[:32]
        for attempt in range(1, self._continue_retries + 1):
            try:
                await self._client.continue_task(lease.agv_code, req_code)
                return
            except Exception as e:  # pylint: disable=broad-except
                self._logger.warning(
                    f"continue_task for robot {lease.agv_code} failed "
                    f"({attempt}/{self._continue_retries}): {e}"
                )
                if attempt < self._continue_retries:
                    await asyncio.sleep(self._continue_retry_delay * attempt)

        # Their robot is never going to be told to move, so it will never reach
        # the exit point and never release. Holding the zone on its behalf only
        # blocks RMF robots for nothing.
        self._logger.error(
            f"gave up telling vendor robot {lease.agv_code} to continue, "
            f"releasing mutex group [{lease.group}]"
        )
        with contextlib.suppress(MutexLeaseNotFound):
            self._broker.release_by_agv(
                lease.agv_code, "vendor could not be told to continue"
            )

    # ----------------------------------------------------------------- loop
    async def _run(self) -> None:
        while True:
            await asyncio.sleep(self._period)
            try:
                await self._sweep()
            except Exception as e:  # pylint: disable=broad-except
                # One bad sweep must not end the watchdog, or every later lease
                # loses its only liveness check.
                self._logger.error(f"vendor watchdog sweep failed: {e}")

    async def _sweep(self) -> None:
        leases = [lease for lease in self._broker.leases() if lease.agv_code]
        live_codes = {lease.agv_code for lease in leases}
        for stale in set(self._failures) - live_codes:
            del self._failures[stale]

        if not leases:
            return

        if not self._check_status:
            # Nothing is going to prove these leases alive, so their ttl would
            # only end them on a timer that means nothing. Renewing leaves the
            # hold ceiling and the vendor's release callback as the two things
            # that end a lease, which is what switching the check off asks for.
            for lease in leases:
                with contextlib.suppress(MutexLeaseNotFound):
                    self._broker.renew_by_agv(lease.agv_code)
            return

        # getAgvStatus takes the whole list at once, so the whole sweep is
        # one round trip however many robots are queueing.
        states = await self._client.get_agv_states([l.agv_code for l in leases])
        for lease in leases:
            self._check(lease, states.get(lease.agv_code, VendorRobotState.unknown))

    def _check(self, lease, state: VendorRobotState) -> None:
        agv_code = lease.agv_code

        if state is VendorRobotState.active:
            self._failures.pop(agv_code, None)
            with contextlib.suppress(MutexLeaseNotFound):
                self._broker.renew_by_agv(agv_code)
            return

        if state is VendorRobotState.released:
            self._logger.info(
                f"vendor robot {agv_code} is somewhere the zone is not, "
                f"releasing mutex group [{lease.group}]"
            )
            with contextlib.suppress(MutexLeaseNotFound):
                self._broker.release_by_agv(agv_code, "vendor robot left the area")
            self._failures.pop(agv_code, None)
            return

        failures = self._failures.get(agv_code, 0) + 1
        self._failures[agv_code] = failures
        if failures >= self._max_failures:
            self._logger.error(
                f"vendor has not reported robot {agv_code} for {failures} "
                f"sweeps, releasing mutex group [{lease.group}]"
            )
            with contextlib.suppress(MutexLeaseNotFound):
                self._broker.release_by_agv(agv_code, "lost sight of vendor robot")
            self._failures.pop(agv_code, None)
        else:
            self._logger.warning(
                f"vendor robot {agv_code} unreadable "
                f"({failures}/{self._max_failures})"
            )


@singleton_dep
@contextlib.asynccontextmanager
async def get_vendor_watchdog():
    async with VendorWatchdog(
        get_mutex_broker(),
        get_vendor_client(),
        period=app_config.vendor_watchdog_seconds,
        check_status=app_config.vendor_check_agv_status,
        max_failures=app_config.vendor_max_state_failures,
        continue_retries=app_config.vendor_continue_retries,
        continue_retry_delay=app_config.vendor_continue_retry_delay_seconds,
    ) as watchdog:
        yield watchdog
