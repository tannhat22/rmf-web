# pylint: disable=line-too-long
config = {
    # ip or hostname to bind the socket to, this only applies when running the server in
    # standalone mode.
    "host": "10.7.11.9",
    # port to bind to, this only applies when running the server in standalone mode.
    "port": 8000,
    "db_url": "sqlite://:memory:",
    # url that rmf-server is being served on.
    # When being a proxy, this must be the url that rmf-server is mounted on.
    # E.g. https://example.com/rmf/api/v1
    "public_url": "http://10.7.11.9:8000",
    "cache_directory": "run/cache",  # The directory where cached files should be stored.
    "log_level": "WARNING",  # https://docs.python.org/3.8/library/logging.html#levels
    # a user that is automatically given admin privileges, note that this does not guarantee that the user exists in the identity provider.
    "builtin_admin": "admin",
    # path to a PEM encoded RSA public key which is used to verify JWT tokens, if the path is relative, it is based on the working dir.
    # "jwt_public_key": None,
    "jwt_public_key": "/home/tannhat/nhat_ws/projects/rmf-web/packages/api-server/jwt_key/keycloak-public.key",
    # jwt secret, this is mutually exclusive with `jwt_public_key`.
    # "jwt_secret": "rmfisawesome",
    "jwt_secret": None,
    # url to the oidc endpoint, used to authenticate rest requests, it should point to the well known endpoint, e.g.
    # http://10.7.11.9:8080/auth/realms/rmf-web/.well-known/openid-configuration.
    # NOTE: This is ONLY used for documentation purposes, the "jwt_public_key" will be the
    # only key used to verify a token.
    # "oidc_url": None,
    "oidc_url": "http://10.7.11.9:8080/realms/rmf-web/.well-known/openid-configuration",
    # Audience the access token is meant for. Can also be an array.
    # Used to verify the "aud" claim.
    # "aud": "rmf_api_server",
    "aud": "account",
    # url or string that identifies the entity that issued the jwt token
    # Used to verify the "iss" claim
    # "iss": "stub",
    "iss": "http://10.7.11.9:8080/realms/rmf-web",
    # list of arguments passed to the ros node, "--ros-args" is automatically prepended to the list.
    # e.g.
    #   Run with sim time: ["-p", "use_sim_time:=true"]
    "ros_args": [],
    # Timezone at which the scheduler will operate in. This must be the same
    # as the system timezone, as well as the client UI timezone. Cross-timezone
    # scheduling is currently not supported.
    "timezone": "UTC",
    # Giá trị mutex_claimant_id bắt đầu để gán cho vendor
    "mutex_claimant_id": 1000000000,
    "mutex_default_ttl_seconds": 30.0,
    "mutex_max_hold_seconds": 1800.0,
    "mutex_heartbeat_seconds": 2.0,
    "vendor_base_url": "http://10.7.11.107:8181",
    "vendor_continue_task_path": "/rcms/services/rest/hikRpcService/continueTask",
    "vendor_agv_status_path": "/rcms/services/rest/hikRpcService/getAgvStatus",
    "vendor_check_agv_status": False,
    # Sent as clientCode on every call, so their logs can tell who is calling.
    "vendor_client_code": "rmf_api_server",
    # Sent as tokenCode. RCS-2000 issues this; leave empty if their deployment
    # does not check it.
    "vendor_token_code": "",
    "vendor_request_timeout_seconds": 5.0,
    "vendor_watchdog_seconds": 10.0,
    "vendor_max_state_failures": 3,
    "vendor_continue_retries": 5,
    "vendor_continue_retry_delay_seconds": 1.0,
    "vendor_agv_released_states": ["7", "9"],
    "vendor_point_to_mutex_group": {
        "P_COE_WAIT": "zone_coe",
    },
}
