import enum

from pydantic import BaseModel, ConfigDict, Field

from .ros_pydantic import rmf_fleet_msgs

MutexGroupAssignment = rmf_fleet_msgs.msg.MutexGroupAssignment
MutexGroupStates = rmf_fleet_msgs.msg.MutexGroupStates

# The supervisor reports an unheld group with the max uint64 value, see
# `Unclaimed` in rmf_fleet_adapter/StandardNames.hpp.
MUTEX_UNCLAIMED = 2**64 - 1


class MutexLeaseState(str, enum.Enum):
    waiting = "waiting"
    granted = "granted"


class MutexLease(BaseModel):
    lease_id: str
    group: str
    requester: str
    agv_code: str | None = Field(
        None,
        description="The third party robot the lease was opened for, and the "
        "key the lease is tracked by. That system never sees the lease id, and "
        "its robot id is the one handle in the exchange that cannot change "
        "while the robot is inside the zone.",
    )
    task_code: str | None = Field(
        None,
        description="Whichever of that system's tasks the robot was running "
        "when we last heard from it. Refreshed on every callback and reported "
        "for the operator's benefit only; one robot can run several tasks "
        "without leaving the zone, so this is no use as a key.",
    )
    state: MutexLeaseState
    expires_in_seconds: float = Field(
        ...,
        description="Seconds left before the lease is dropped. The watchdog "
        "resets this every time the third party system confirms the task is "
        "still running, so it only runs out when they stop answering.",
    )
    held_for_seconds: float = Field(
        ...,
        description="Seconds since the lease was created, granted or not.",
    )
    max_hold_seconds: float = Field(
        ...,
        description="Hard ceiling on the lifetime of the lease. RMF robots wait "
        "for a mutex group indefinitely, so a lease is force released at this "
        "point however alive the task still looks.",
    )


class AgvCallback(BaseModel):
    """
    What the vendor's fleet manager posts to us.

    Their deployment sends more fields than their manual lists, and the manual
    itself is inconsistent in places, so this deliberately names only what we
    act on and keeps everything else untouched. Rejecting a callback because it
    carried a field we had never heard of would leave one of their robots
    standing at a waiting point.

    Field names follow their wire format rather than ours; the aliases keep
    python naming on this side.
    """

    model_config = ConfigDict(extra="allow", populate_by_name=True)

    req_code: str = Field("", alias="reqCode")
    task_code: str = Field("", alias="taskCode")
    robot_code: str = Field("", alias="robotCode")
    position_code: str = Field("", alias="currentPositionCode")
    method: str = ""


class AgvCallbackResponse(BaseModel):
    """
    Their side reads success from `code` in the body, not from the http status,
    and matches the answer to the request through `reqCode`.
    """

    model_config = ConfigDict(populate_by_name=True)

    code: str = "0"
    message: str = "successful"
    req_code: str = Field("", alias="reqCode")
