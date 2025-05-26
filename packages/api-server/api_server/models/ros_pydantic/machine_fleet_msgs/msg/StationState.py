# This is a generated file, do not edit

from typing import Annotated

import pydantic


class StationState(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    station_name: str
    mode: Annotated[int, pydantic.Field(ge=0, le=255)]
