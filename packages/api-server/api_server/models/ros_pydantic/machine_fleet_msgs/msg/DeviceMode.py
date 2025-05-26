# This is a generated file, do not edit

from typing import Annotated

import pydantic


class DeviceMode(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    mode: Annotated[int, pydantic.Field(ge=0, le=255)]
