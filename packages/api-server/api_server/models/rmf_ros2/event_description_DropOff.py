# generated by datamodel-codegen:
#   filename:  event_description_DropOff.json

from __future__ import annotations

from pydantic import BaseModel, Field

from . import event_description_PayloadTransfer


class DropOffEventDescription(BaseModel):
    __root__: event_description_PayloadTransfer.ItemTransferEventDescription = Field(
        ..., title="Drop Off Event Description"
    )
