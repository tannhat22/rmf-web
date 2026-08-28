"""
Outbound calls to the third party fleet manager, a Hikrobot RCS-2000.

Their robots cannot poll us, so the traffic runs the other way: we tell them
when a zone is theirs, and we ask them whether the robot is still out there.

Three things about their protocol shape this module. Every call is a POST with a
JSON body, including the reads. Success is reported in the body as `code: "0"`,
not in the http status, so a 200 carrying `code: "1"` is a failure. And a request
that is retried has to carry the same `reqCode`, otherwise they treat it as a
new request.
"""

import enum
import uuid
from datetime import datetime

import httpx

from api_server.app_config import app_config
from api_server.fast_io.singleton_dep import singleton_dep
from api_server.logging import default_logger

# Appendix A of their developer guide.
RCS_OK = "0"


class VendorCallFailed(Exception):
    """RCS-2000 answered, and said no."""


class VendorRobotState(enum.Enum):
    """What their system says about a robot, reduced to what we act on."""

    # Somewhere we have to assume is still the zone. This is the default for
    # every status we are not certain about, faults included: a robot that has
    # broken down reports its fault from wherever it stopped, which may be the
    # middle of the zone.
    active = "active"
    # Somewhere a zone is not, so the zone can go back to RMF at once.
    released = "released"
    # We could not get an answer, or they no longer report the robot at all.
    # Distinct from released because one bad request is not proof of anything;
    # the watchdog only acts after several in a row.
    unknown = "unknown"


class VendorClient:
    def __init__(
        self,
        base_url: str,
        *,
        continue_task_path: str,
        agv_status_path: str,
        client_code: str,
        token_code: str,
        released_states: list[str],
        timeout: float,
        logger=None,
    ):
        self._base_url = base_url.rstrip("/")
        self._continue_task_path = continue_task_path
        self._agv_status_path = agv_status_path
        self._client_code = client_code
        self._token_code = token_code
        self._released = set(released_states)
        self._logger = logger or default_logger
        self._client = httpx.AsyncClient(timeout=timeout)

    @property
    def configured(self) -> bool:
        """False when no vendor url is set, which disables the integration."""
        return bool(self._base_url)

    async def aclose(self) -> None:
        await self._client.aclose()

    # --------------------------------------------------------------- outbound
    async def continue_task(self, agv_code: str, req_code: str) -> None:
        """
        Tell RCS-2000 the robot may proceed.

        Addressed to the robot rather than to its task: their guide allows
        either, and only one of wbCode, agvCode, taskCode and podCode may be
        set on a call. A robot that queued for a zone can have moved on to
        another task by the time the zone is granted, so its task code is not
        safe to quote back at them; its robot id is.

        `req_code` must stay the same across retries of the same attempt, so the
        caller owns it rather than this method. Raises on any failure so the
        caller can retry; a robot is standing still until this lands.
        """
        body = self._envelope(req_code)
        body["agvCode"] = agv_code
        await self._post(self._continue_task_path, body)
        self._logger.info(f"told vendor robot {agv_code} to continue")

    async def get_agv_states(self, agv_codes: list[str]) -> dict[str, VendorRobotState]:
        """
        Ask after the robots we are holding zones for.

        getAgvStatus takes the whole list at once, so the sweep is one round
        trip however many robots are queueing.

        Never raises: an unreachable fleet manager is reported as every robot
        being `unknown` and left for the watchdog to weigh up. A robot they do
        not mention is `unknown` too, not released — we would rather hold a zone
        we no longer need than open one that is still occupied.

        One robot id they do not recognise fails the whole call rather than
        just its own entry ("Incorrect robot number list"), which lands here as
        every robot being unknown. That is the right answer anyway: an id we
        made up is an id we cannot coordinate with, and the ids come from their
        own callbacks, so it should not happen without something being wrong.
        """
        if not agv_codes:
            return {}

        body = self._envelope(uuid.uuid4().hex[:32])
        body["robots"] = agv_codes
        try:
            answer = await self._post(self._agv_status_path, body)
        except Exception as e:  # pylint: disable=broad-except
            self._logger.warning(f"could not read vendor robot states: {e}")
            return {code: VendorRobotState.unknown for code in agv_codes}

        states = {code: VendorRobotState.unknown for code in agv_codes}
        # On the failure above `data` comes back as "" rather than a list, so
        # this stays defensive about what it is iterating over.
        for entry in answer.get("data") or []:
            if not isinstance(entry, dict):
                continue
            code = entry.get("robotCode")
            if code in states:
                states[code] = self._read_state(
                    code, entry.get("status"), entry.get("statusStr")
                )
        return states

    # ---------------------------------------------------------------- helpers
    def _envelope(self, req_code: str) -> dict:
        """The bookkeeping fields every RCS-2000 request carries."""
        body = {
            "reqCode": req_code,  # random
            "reqTime": datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            "clientCode": self._client_code,
        }
        # tokenCode is optional on their side and not every deployment issues
        # one, so it is left out entirely rather than sent empty.
        if self._token_code:
            body["tokenCode"] = self._token_code
        return body

    async def _post(self, path: str, body: dict) -> dict:
        resp = await self._client.post(f"{self._base_url}{path}", json=body)
        resp.raise_for_status()
        answer = resp.json()
        # The http status only says the message arrived. Whether they accepted
        # it is in the body.
        code = str(answer.get("code", ""))
        if code != RCS_OK:
            raise VendorCallFailed(
                f"{path} returned code {code}: {answer.get('message')}"
            )
        return answer

    def _read_state(self, agv_code: str, raw, label=None) -> VendorRobotState:
        # They report the robot but not what it is standing next to, so the
        # only statuses worth acting on are the ones that place it somewhere a
        # zone is not. Everything else holds, and that deliberately includes
        # every fault: a robot reporting "pallet recognition failed" is standing
        # exactly where it failed, which may be the middle of the zone. Their
        # live statuses also run well past the ones their guide lists, so
        # holding is the only safe default for a code we have never seen.
        if raw is None:
            return VendorRobotState.unknown
        status = str(raw).strip()
        if status in self._released:
            self._logger.info(
                f"vendor robot {agv_code} reports status {status} "
                f"({label or 'no description'}), which is outside any zone"
            )
            return VendorRobotState.released
        return VendorRobotState.active


@singleton_dep
def get_vendor_client():
    return VendorClient(
        app_config.vendor_base_url,
        continue_task_path=app_config.vendor_continue_task_path,
        agv_status_path=app_config.vendor_agv_status_path,
        client_code=app_config.vendor_client_code,
        token_code=app_config.vendor_token_code,
        released_states=app_config.vendor_agv_released_states,
        timeout=app_config.vendor_request_timeout_seconds,
    )
