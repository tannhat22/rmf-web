# This is a generated file, do not edit

from typing import Annotated

import pydantic

from ...builtin_interfaces.msg.Time import Time as builtin_interfaces_msg_Time
from .DeviceMode import DeviceMode as machine_fleet_msgs_msg_DeviceMode
from .StationState import StationState as machine_fleet_msgs_msg_StationState


class MachineState(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    machine_time: builtin_interfaces_msg_Time
    machine_name: str
    machine_mode: Annotated[int, pydantic.Field(ge=0, le=255)]
    request_pickup: bool
    dispenser_mode: machine_fleet_msgs_msg_DeviceMode
    dispenser_request_id: str
    request_dropoff: bool
    ingestor_mode: machine_fleet_msgs_msg_DeviceMode
    ingestor_request_id: str
    station_states: list[machine_fleet_msgs_msg_StationState]
