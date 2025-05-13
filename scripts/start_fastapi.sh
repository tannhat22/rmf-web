#!/bin/bash
source /opt/ros/jazzy/setup.bash
source ~/rmf_ws/install/setup.bash
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
export CYCLONEDDS_URI="<CycloneDDS><Discovery><ParticipantIndex>auto</ParticipantIndex><MaxAutoParticipantIndex>100</MaxAutoParticipantIndex></Discovery><Domain><General><NetworkInterfaceAddress>wlp2s0</NetworkInterfaceAddress></General></Domain></CycloneDDS>"
cd /home/amr-server/nhat_ws/rmf-web/packages/api-server/
rm -rf run && mkdir -p run/cache
export PATH="$HOME/.local/bin:$PATH"
RMF_API_SERVER_CONFIG=mysql_local_config.py ../../.venv/bin/pipenv run python -m api_server