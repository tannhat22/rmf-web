#!/bin/bash
source /opt/ros/humble/setup.bash
source ~/rmf_ws/install/setup.bash
cd /home/tannhat/nhat_ws/monorepo/rmf-web/packages/api-server
rm -rf run && mkdir -p run/cache
export PATH="$HOME/.local/bin:$PATH"
RMF_API_SERVER_CONFIG=mysql_local_config.py ../../scripts/pipenv run python -m api_server
