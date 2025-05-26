# This is a generated file, do not edit

from typing import Annotated

import pydantic

from ..msg.DeviceMode import DeviceMode as machine_fleet_msgs_msg_DeviceMode


class Machine_Request(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    request_type: Annotated[int, pydantic.Field(ge=0, le=255)]
    request_mode: machine_fleet_msgs_msg_DeviceMode
