from typing import Annotated

from pydantic import BaseModel, Field

from . import tortoise_models as ttm


class StationState(BaseModel):
    station_name: str
    mode: Annotated[int, Field(ge=0, le=255)]

    @staticmethod
    def from_tortoise(tortoise: ttm.StationState) -> "StationState":
        return StationState.model_validate(tortoise.data)


class StationRequest(BaseModel):
    station_type: int = Field(
        ...,
        description="https://github.com/tannhat22/machine_fleet/blob/rmf-jazzy/machine_fleet_msgs/msg/StationRequest.msg",  # pylint: disable=line-too-long
    )
    station_mode: int = Field(
        ...,
        description="https://github.com/tannhat22/machine_fleet/blob/rmf-jazzy/machine_fleet_msgs/msg/StationRequest.msg",  # pylint: disable=line-too-long
    )
