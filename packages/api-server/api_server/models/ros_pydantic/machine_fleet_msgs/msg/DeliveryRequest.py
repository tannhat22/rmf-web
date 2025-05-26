# This is a generated file, do not edit

from typing import Annotated

import pydantic

from .DeliveryParams import DeliveryParams as machine_fleet_msgs_msg_DeliveryParams


class DeliveryRequest(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    fleet_name: str
    robot_name: str
    start_time: Annotated[int, pydantic.Field(ge=0, le=4294967295)]
    requester: str
    delivery_params: list[machine_fleet_msgs_msg_DeliveryParams]
