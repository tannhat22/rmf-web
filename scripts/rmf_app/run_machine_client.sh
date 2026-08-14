#!/bin/bash
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/env.sh"

# Machine client chạy trên domain riêng, tách khỏi RMF.
export ROS_DOMAIN_ID=50

ros2 launch mf_examples_ros2 client.launch.py
exec bash
