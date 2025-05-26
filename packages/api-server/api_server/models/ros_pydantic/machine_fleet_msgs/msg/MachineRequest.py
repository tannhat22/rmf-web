# This is a generated file, do not edit

from typing import Annotated

import pydantic

from ...builtin_interfaces.msg.Time import Time as builtin_interfaces_msg_Time
from .DeviceMode import DeviceMode as machine_fleet_msgs_msg_DeviceMode


class MachineRequest(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    time: builtin_interfaces_msg_Time
    machine_name: str
    request_type: Annotated[int, pydantic.Field(ge=0, le=255)]
    request_mode: machine_fleet_msgs_msg_DeviceMode
    request_id: str
