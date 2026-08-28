"""
Lets an agent outside of RMF hold an RMF mutex group.

The mutex group supervisor drops a claim that has not been refreshed for ten
seconds, and the third party fleet cannot keep a two second heartbeat going: it
asks for a zone, is told to proceed, and then says nothing until it reaches the
far side. So the broker holds a lease on its behalf and does the heartbeat,
while the watchdog watches the robot through the fleet's own manager. A lease
that stops being proven alive lapses and the zone goes back to RMF.

Leases are keyed by the third party's robot id. Their task code cannot be used:
a robot that has locked a zone may run several tasks without leaving it, so the
code it quotes on the way out is often not the one it quoted on the way in.

The broker knows nothing about that fleet's protocol. It deals in leases, and
tells whoever registered a grant listener when one is granted.
"""

import asyncio
import contextlib
import time
import uuid
from collections.abc import Awaitable, Callable
from dataclasses import dataclass

from builtin_interfaces.msg import Time as RosTime

from api_server.app_config import app_config
from api_server.fast_io.singleton_dep import singleton_dep
from api_server.gateway import RmfGateway, get_rmf_gateway
from api_server.logging import default_logger
from api_server.models import (
    MUTEX_UNCLAIMED,
    MutexGroupStates,
    MutexLease,
    MutexLeaseState,
)
from api_server.rmf_io.events import RmfEvents, get_rmf_events


class MutexLeaseNotFound(Exception):
    """The lease never existed, or has since lapsed."""


# Called once, on the event loop, when a lease turns from waiting to granted.
# The broker stays unaware of who is waiting for that news; the third party
# adapter registers itself here to make its callback.
GrantListener = Callable[[MutexLease], Awaitable[None]]


@dataclass
class _Lease:
    lease_id: str
    group: str
    requester: str
    # Fixed for the lifetime of the lease. The supervisor orders its queue by
    # claim time and treats a changed claim time as a brand new claim, so
    # refreshing this on every heartbeat would send us to the back of the queue
    # forever.
    claim_time: RosTime
    # One per lease rather than one for the whole server. The supervisor's
    # deadlock breaker groups every claim by claimant and only fires when two
    # claimants want the identical set of more than one group, so giving each
    # lease its own id keeps our sets at size one and out of that path
    # altogether. Sharing one id would merge concurrent tasks into a single
    # multi-group claim and put us right back in it.
    claimant: int
    ttl: float
    created_at: float
    expires_at: float
    max_hold_until: float
    granted: bool = False
    # Only set for leases opened for a third party robot. That system never
    # sees the lease id, so its robot id is the handle it is tracked by. Unlike
    # its task code, the robot id holds still for as long as the robot is in
    # the zone.
    agv_code: str | None = None
    # Whichever of their tasks the robot was last known to be running. Carried
    # for reporting only, and refreshed rather than relied on.
    task_code: str | None = None

    @property
    def tag(self) -> str:
        """How this lease is named in a log line."""
        if self.agv_code is None:
            return f"lease {self.lease_id[:8]}"
        if self.task_code:
            return f"robot {self.agv_code} on task {self.task_code}"
        return f"robot {self.agv_code}"

    def snapshot(self, now: float) -> MutexLease:
        return MutexLease(
            lease_id=self.lease_id,
            group=self.group,
            requester=self.requester,
            agv_code=self.agv_code,
            task_code=self.task_code,
            state=(
                MutexLeaseState.granted if self.granted else MutexLeaseState.waiting
            ),
            expires_in_seconds=max(0.0, self.expires_at - now),
            held_for_seconds=now - self.created_at,
            max_hold_seconds=self.max_hold_until - self.created_at,
        )


class MutexBroker:
    def __init__(
        self,
        gateway: RmfGateway,
        rmf_events: RmfEvents,
        *,
        claimant_id: int,
        default_ttl: float,
        max_hold: float,
        heartbeat_period: float,
        logger=None,
    ):
        self._gateway = gateway
        self._rmf_events = rmf_events
        # Counts up from the configured base, one per lease. Restarting resets
        # it, which is harmless: the supervisor replaces a claim when the same
        # claimant asks again, and our own grant check matches on claim time as
        # well as claimant.
        self._next_claimant = claimant_id
        self._default_ttl = default_ttl
        self._max_hold = max_hold
        self._heartbeat_period = heartbeat_period
        self._logger = logger or default_logger
        self._leases: dict[str, _Lease] = {}
        # One group can carry several leases at once. The supervisor is already
        # a queue keyed by claim time and RMF robots line up on it every day, so
        # letting our leases line up there too puts everyone in one queue rather
        # than building a second one here that RMF cannot see.
        self._by_group: dict[str, set[str]] = {}
        self._by_agv: dict[str, str] = {}
        self._heartbeat_task: asyncio.Task | None = None
        self._subscription = None
        self._grant_listeners: list[GrantListener] = []
        # The event loop only holds weak references to tasks, so a grant
        # notification would otherwise be collectable halfway through.
        self._pending: set[asyncio.Task] = set()

    # ------------------------------------------------------------- lifecycle
    async def __aenter__(self):
        self._subscription = self._rmf_events.mutex_group_states.subscribe(
            self._on_states
        )
        self._heartbeat_task = asyncio.create_task(self._heartbeat_loop())
        self._logger.info(
            f"mutex broker started, claimant ids from {self._next_claimant}, "
            f"heartbeat every {self._heartbeat_period}s"
        )
        return self

    async def __aexit__(self, *exc):
        if self._heartbeat_task is not None:
            self._heartbeat_task.cancel()
            with contextlib.suppress(asyncio.CancelledError):
                await self._heartbeat_task
        # Release before the ros context goes away. Skipping this would leave
        # every group we hold locked until the supervisor times us out, which is
        # ten seconds of RMF robots waiting for a server that has already gone.
        for lease in list(self._leases.values()):
            self._publish(lease, lock=False)
            self._logger.info(
                f"released mutex group [{lease.group}] held by {lease.tag} "
                f"on shutdown (lease {lease.lease_id})"
            )
        self._leases.clear()
        self._by_group.clear()
        self._by_agv.clear()
        for task in list(self._pending):
            task.cancel()
        if self._subscription is not None:
            self._subscription.dispose()

    # ------------------------------------------------------------------- api
    def add_grant_listener(self, listener: GrantListener) -> None:
        self._grant_listeners.append(listener)

    def acquire(
        self,
        group: str,
        requester: str,
        agv_code: str | None = None,
        task_code: str | None = None,
    ) -> MutexLease:
        now = time.monotonic()
        ttl = self._default_ttl
        claimant = self._next_claimant
        self._next_claimant += 1
        lease = _Lease(
            lease_id=uuid.uuid4().hex,
            group=group,
            requester=requester,
            claim_time=self._gateway.now(),
            claimant=claimant,
            ttl=ttl,
            created_at=now,
            expires_at=now + ttl,
            max_hold_until=now + self._max_hold,
            agv_code=agv_code,
            task_code=task_code,
        )
        self._leases[lease.lease_id] = lease
        self._by_group.setdefault(group, set()).add(lease.lease_id)
        if agv_code is not None:
            self._by_agv[agv_code] = lease.lease_id
        # Claim straight away rather than waiting for the next heartbeat, the
        # queue is ordered by claim time and every second of delay is a second
        # of losing to whoever asks next.
        self._publish(lease, lock=True)
        self._logger.info(
            f"[{requester}] is claiming mutex group [{group}] for {lease.tag} "
            f"(lease {lease.lease_id}, ttl {ttl}s)"
        )
        return lease.snapshot(now)

    # ------------------------------------------------------- keyed by robot
    def find_by_agv(self, agv_code: str) -> MutexLease | None:
        lease_id = self._by_agv.get(agv_code)
        if lease_id is None:
            return None
        return self._leases[lease_id].snapshot(time.monotonic())

    def renew_by_agv(self, agv_code: str) -> MutexLease:
        """
        Push a lease's expiry back without reading it through the http api.

        A third party that cannot poll has no way to prove it is still there, so
        the watchdog proves it on their behalf by asking their own system about
        the robot, and calls this when the answer is good.
        """
        lease = self._require_agv(agv_code)
        now = time.monotonic()
        lease.expires_at = now + lease.ttl
        return lease.snapshot(now)

    def release_by_agv(self, agv_code: str, reason: str = "released by robot") -> None:
        self._drop(self._require_agv(agv_code), reason)

    def note_task_code(self, agv_code: str, task_code: str | None) -> None:
        """
        Record which of their tasks the robot is on now.

        The robot can start a new task without leaving the zone, so the code it
        arrived under goes stale while the lease is still perfectly valid. This
        keeps the logs and the dashboard talking about the task it is actually
        running. It is never a key, so a lease that has already lapsed is
        nothing to complain about.
        """
        if not task_code:
            return
        lease_id = self._by_agv.get(agv_code)
        if lease_id is not None:
            self._leases[lease_id].task_code = task_code

    def _require_agv(self, agv_code: str) -> _Lease:
        lease_id = self._by_agv.get(agv_code)
        if lease_id is None:
            raise MutexLeaseNotFound(agv_code)
        return self._leases[lease_id]

    def force_release(self, group: str) -> MutexLease | None:
        """
        Take a group back from whoever leased it, by group name rather than by
        lease id, so an operator can act on what the dashboard shows them.

        Only the lease actually holding the group is cut; any of ours still
        queueing behind it keep their place, since taking a group back from its
        occupant is not a reason to throw the queue away.

        Returns the lease that was cut short, or None if none of ours holds the
        group. Holding no lease is not an error here: an RMF robot may be the
        one holding it, and that is released through
        `/fleets/{name}/unlock_mutex_group` instead.
        """
        holder = next((l for l in self._leases_for_group(group) if l.granted), None)
        if holder is None:
            return None
        lease = holder
        snapshot = lease.snapshot(time.monotonic())
        self._drop(lease, "force released by operator")
        return snapshot

    def leases(self) -> list[MutexLease]:
        now = time.monotonic()
        return [lease.snapshot(now) for lease in self._leases.values()]

    # -------------------------------------------------------------- internal
    def _publish(self, lease: _Lease, *, lock: bool) -> None:
        self._gateway.request_mutex_group(
            lease.group, lease.claimant, lease.claim_time, lock
        )

    def _drop(self, lease: _Lease, reason: str) -> None:
        self._publish(lease, lock=False)
        self._leases.pop(lease.lease_id, None)
        queued = self._by_group.get(lease.group)
        if queued is not None:
            queued.discard(lease.lease_id)
            if not queued:
                del self._by_group[lease.group]
        if lease.agv_code is not None and (
            self._by_agv.get(lease.agv_code) == lease.lease_id
        ):
            del self._by_agv[lease.agv_code]
        self._logger.info(
            f"released mutex group [{lease.group}] for {lease.tag} "
            f"({reason}, lease {lease.lease_id})"
        )

    def _on_states(self, states: MutexGroupStates | None) -> None:
        if states is None:
            return
        for assignment in states.assignments:
            # Several of our leases can be queueing for one group, so every one
            # of them is checked against the assignment. At most one can match,
            # and the rest are told they are still waiting.
            for lease in self._leases_for_group(assignment.group):
                self._apply_assignment(lease, assignment)

    def _leases_for_group(self, group: str) -> list[_Lease]:
        return [
            self._leases[lease_id]
            for lease_id in self._by_group.get(group, ())
            if lease_id in self._leases
        ]

    def _apply_assignment(self, lease: _Lease, assignment) -> None:
        # Matching on claim time as well as claimant is what makes this safe
        # against the transient local replay: subscribing hands us up to a
        # hundred past states in one burst, and a state left over from an
        # earlier run of this server would otherwise look like a live grant.
        granted = (
            assignment.claimant == lease.claimant
            and assignment.claim_time.sec == lease.claim_time.sec
            and assignment.claim_time.nanosec == lease.claim_time.nanosec
        )
        if granted and not lease.granted:
            self._logger.info(
                f"{lease.tag} locked mutex group [{lease.group}] "
                f"after {time.monotonic() - lease.created_at:.1f}s"
            )
            self._notify_granted(lease)
        elif lease.granted and not granted:
            holder = (
                "nobody"
                if assignment.claimant == MUTEX_UNCLAIMED
                else f"claimant #{assignment.claimant}"
            )
            self._logger.warning(
                f"{lease.tag} lost mutex group [{lease.group}] to {holder}"
            )
        lease.granted = granted

    def _notify_granted(self, lease: _Lease) -> None:
        if not self._grant_listeners:
            return
        snapshot = lease.snapshot(time.monotonic())
        for listener in self._grant_listeners:
            task = asyncio.create_task(self._run_listener(listener, snapshot))
            self._pending.add(task)
            task.add_done_callback(self._pending.discard)

    async def _run_listener(self, listener: GrantListener, lease: MutexLease) -> None:
        # A listener that raises must not take the broker down with it, nor stop
        # the other listeners from hearing about the same grant.
        try:
            await listener(lease)
        except Exception as e:  # pylint: disable=broad-except
            self._logger.error(
                f"grant listener failed for mutex group [{lease.group}] held "
                f"by robot {lease.agv_code}: {e}"
            )

    async def _heartbeat_loop(self) -> None:
        while True:
            await asyncio.sleep(self._heartbeat_period)
            now = time.monotonic()
            for lease in list(self._leases.values()):
                if now >= lease.max_hold_until:
                    self._drop(
                        lease,
                        f"held longer than the {self._max_hold}s ceiling, "
                        "RMF robots would wait for it forever",
                    )
                elif now >= lease.expires_at:
                    self._drop(lease, f"not polled for {lease.ttl}s")
                else:
                    self._publish(lease, lock=True)


@singleton_dep
@contextlib.asynccontextmanager
async def get_mutex_broker():
    async with MutexBroker(
        get_rmf_gateway(),
        get_rmf_events(),
        claimant_id=app_config.mutex_claimant_id,
        default_ttl=app_config.mutex_default_ttl_seconds,
        max_hold=app_config.mutex_max_hold_seconds,
        heartbeat_period=app_config.mutex_heartbeat_seconds,
    ) as broker:
        yield broker
