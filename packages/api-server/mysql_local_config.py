import os

from sqlite_local_config import config

here = os.path.dirname(__file__)
run_dir = f"{here}/run"

config.update(
    {
        "db_url": "mysql://tannhat:Tannhatamr@123@127.0.0.1:3306/rmfvdmdatabase",
        "cache_directory": f"{run_dir}/cache",  # The directory where cached files should be stored.
    }
)
