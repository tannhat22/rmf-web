from typing import Annotated

from fastapi import Depends, HTTPException
from reactivex import operators as rxops

from api_server.fast_io import FastIORouter, SubscriptionRequest
from api_server.gateway import RmfGateway, get_rmf_gateway
from api_server.models import StationRequest, StationState
from api_server.repositories import RmfRepository
from api_server.rmf_io import get_rmf_events

router = FastIORouter(tags=["Stations"])


@router.get("/{station_name}/state", response_model=StationState)
async def get_station_state(
    station_name: str, rmf_repo: Annotated[RmfRepository, Depends(RmfRepository)]
):
    """
    Available in socket.io
    """
    station_state = await rmf_repo.get_station_state(station_name)
    if station_state is None:
        raise HTTPException(status_code=404)
    return station_state


@router.sub("/{station_name}/state", response_model=StationState)
async def sub_station_state(req: SubscriptionRequest, station_name: str):
    user = req.user
    obs = get_rmf_events().station_states.pipe(
        rxops.filter(lambda x: x.station_name == station_name)
    )
    station_state = await get_station_state(station_name, RmfRepository(user))
    if station_state:
        return obs.pipe(rxops.start_with(station_state))
    return obs


@router.post("/{station_name}/request")
def post_station_request(
    station_name: str,
    station_request: StationRequest,
    rmf_gateway: Annotated[RmfGateway, Depends(get_rmf_gateway)],
):
    rmf_gateway.request_station(
        station_name,
        station_request.station_type,
        station_request.station_mode,
    )
