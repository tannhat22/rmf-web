import importlib.util
import os
import sys
import urllib.parse
from dataclasses import dataclass
from dataclasses import field as dc_field
from importlib.abc import Loader
from typing import Any, cast


@dataclass
class AppConfig:
    host: str
    port: int
    db_url: str
    public_url: urllib.parse.ParseResult
    cache_directory: str
    log_level: str
    builtin_admin: str
    jwt_public_key: str | None
    jwt_secret: str | None
    oidc_url: str | None
    aud: str
    iss: str
    ros_args: list[str]
    timezone: str
    mutex_claimant_id: int = 1 << 40
    mutex_default_ttl_seconds: float = 30.0
    mutex_max_hold_seconds: float = 300.0
    mutex_heartbeat_seconds: float = 2.0
    vendor_base_url: str = ""
    vendor_continue_task_path: str = "/rcms/services/rest/hikRpcService/continueTask"
    vendor_agv_status_path: str = "/rcms/services/rest/hikRpcService/getAgvStatus"
    vendor_check_agv_status: bool = True
    vendor_client_code: str = "rmf_web"
    vendor_token_code: str = ""
    vendor_request_timeout_seconds: float = 5.0
    vendor_watchdog_seconds: float = 10.0
    vendor_max_state_failures: int = 3
    vendor_continue_retries: int = 5
    vendor_continue_retry_delay_seconds: float = 1.0
    vendor_agv_released_states: list[str] = dc_field(default_factory=lambda: ["7", "9"])
    vendor_point_to_mutex_group: dict[str, str] = dc_field(default_factory=dict)

    def __post_init__(self):
        self.public_url = urllib.parse.urlparse(cast(str, self.public_url))


def load_config(config_file: str) -> AppConfig:
    spec = importlib.util.spec_from_file_location("config", config_file)
    if spec is None:
        raise FileNotFoundError(f"Could not find config file '{config_file}'")
    module = importlib.util.module_from_spec(spec)
    loader = spec.loader
    if not isinstance(loader, Loader):
        raise RuntimeError("unable to load module")
    sys.path.append(os.path.dirname(config_file))
    loader.exec_module(module)
    config = AppConfig(**cast(Any, module).config)
    if "RMF_API_SERVER_LOG_LEVEL" in os.environ:
        config.log_level = os.environ["RMF_API_SERVER_LOG_LEVEL"]
    return config


app_config = load_config(
    os.environ.get(
        "RMF_API_SERVER_CONFIG",
        f"{os.path.dirname(__file__)}/default_config.py",
    )
)
