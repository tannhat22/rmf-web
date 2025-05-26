# This is a generated file, do not edit

from typing import Annotated

import pydantic

from ...builtin_interfaces.msg.Time import Time as builtin_interfaces_msg_Time


class StationRequest(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    time: builtin_interfaces_msg_Time
    machine_name: str
    station_name: str
    station_type: Annotated[int, pydantic.Field(ge=0, le=255)]
    mode: Annotated[int, pydantic.Field(ge=0, le=255)]
