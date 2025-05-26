# This is a generated file, do not edit

from typing import Annotated

import pydantic

from .DeliveryItem import DeliveryItem as machine_fleet_msgs_msg_DeliveryItem


class DeliveryParams(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    pickup_place_name: str
    pickup_dispenser: str
    pickup_items: machine_fleet_msgs_msg_DeliveryItem
    dropoff_place_name: str
    dropoff_ingestor: str
    dropoff_items: machine_fleet_msgs_msg_DeliveryItem
