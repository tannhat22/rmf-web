# This is a generated file, do not edit

from typing import Annotated

import pydantic

from ...builtin_interfaces.msg.Time import Time as builtin_interfaces_msg_Time
from .StationState import StationState as machine_fleet_msgs_msg_StationState


class FleetStationState(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    time: builtin_interfaces_msg_Time
    pickup_stations: list[machine_fleet_msgs_msg_StationState]
    dropoff_stations: list[machine_fleet_msgs_msg_StationState]
