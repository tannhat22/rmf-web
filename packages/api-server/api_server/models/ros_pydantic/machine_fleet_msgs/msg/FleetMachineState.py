# This is a generated file, do not edit

from typing import Annotated

import pydantic

from .MachineState import MachineState as machine_fleet_msgs_msg_MachineState


class FleetMachineState(pydantic.BaseModel):
    model_config = pydantic.ConfigDict(from_attributes=True)

    machines: list[machine_fleet_msgs_msg_MachineState]
