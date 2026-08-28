"""
Operator and dashboard view of the mutex groups held on behalf of systems
outside RMF.

Zones are asked for and given back through /vendor_mutex, which speaks the
vendor's own dialect. What is left here is what an operator needs: seeing who
holds what, and taking a zone back by hand.

Mounted behind `user_dep` like the rest of the operator api, so only a logged in
dashboard user reaches it. /vendor_mutex is the one part of this feature that
stays open, because the vendor cannot carry a token.
"""

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException

from api_server.logging import LoggerAdapter, get_logger
from api_server.models import MutexGroupStates, MutexLease
from api_server.mutex_broker import MutexBroker, get_mutex_broker
from api_server.rmf_io.events import RmfEvents, get_rmf_events

router = APIRouter(tags=["MutexGroups"])


@router.get("/leases", response_model=list[MutexLease])
async def get_leases(
    broker: Annotated[MutexBroker, Depends(get_mutex_broker)],
):
    """Every zone this server currently holds for a third party system."""
    return broker.leases()


@router.post("/groups/{group}/force_release", response_model=MutexLease)
async def force_release_group(
    group: str,
    broker: Annotated[MutexBroker, Depends(get_mutex_broker)],
    logger: Annotated[LoggerAdapter, Depends(get_logger)],
):
    """
    Take a mutex group back from the third party system holding it. This is the
    counterpart of `/fleets/{name}/unlock_mutex_group`, which can only release a
    group held by an RMF robot.

    The third party robot is not in the traffic schedule, so RMF has no idea
    where it is and nothing else is keeping it apart from RMF robots. Releasing
    while it is still inside the area removes the only thing holding them apart.
    Confirm it has left before calling this.

    404 if this server holds no lease on the group. That includes the case where
    an RMF robot holds it, use the fleets endpoint for that.
    """
    lease = broker.force_release(group)
    if lease is None:
        raise HTTPException(
            404,
            f"no lease from this server holds mutex group {group}, an RMF robot "
            "may hold it instead",
        )
    logger.warning(
        f"operator force released mutex group {group} from robot "
        f"{lease.agv_code} (task {lease.task_code}, "
        f"held {lease.held_for_seconds:.1f}s)"
    )
    return lease


@router.get("/states", response_model=MutexGroupStates)
async def get_mutex_group_states(
    rmf_events: Annotated[RmfEvents, Depends(get_rmf_events)],
):
    """
    Who holds what, straight from the RMF supervisor, robots and third parties
    alike. `claimant` is a traffic participant id, or 2**64-1 when the group is
    free. Kept for diagnosing a stuck zone from outside the dashboard.
    """
    states = rmf_events.mutex_group_states.value
    if states is None:
        raise HTTPException(503, "no mutex group states received yet")
    return states
