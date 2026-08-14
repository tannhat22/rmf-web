#!/bin/bash
# Thiết lập môi trường ROS dùng chung cho các script trong thư mục này.
# File này để `source`, không chạy trực tiếp:
#
#   SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
#   source "$SCRIPT_DIR/env.sh"
#
# Đổi card mạng cho DDS: sửa mặc định bên dưới, hoặc đặt biến trước khi gọi.

# Card mạng mà CycloneDDS bind vào. Tên card khác nhau tuỳ máy, xem bằng:
#   ip -o -4 addr show
export DDS_INTERFACE="${DDS_INTERFACE:-wlp0s20f3}"

source /opt/ros/jazzy/setup.bash
source "$HOME/rmf_ws/install/setup.bash"
source /usr/share/colcon_cd/function/colcon_cd.sh
export _colcon_cd_root=/opt/ros/jazzy/
source /usr/share/colcon_argcomplete/hook/colcon-argcomplete.bash

export ROS_AUTOMATIC_DISCOVERY_RANGE=LOCALHOST
export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
export CYCLONEDDS_URI=${CYCLONEDDS_URI:-"<CycloneDDS>
    <Discovery>
        <ParticipantIndex>auto</ParticipantIndex>
        <MaxAutoParticipantIndex>100</MaxAutoParticipantIndex>
    </Discovery>
    <Domain>
        <General>
            <NetworkInterfaceAddress>${DDS_INTERFACE}</NetworkInterfaceAddress>
        </General>
    </Domain>
</CycloneDDS>"}
