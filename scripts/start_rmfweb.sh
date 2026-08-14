#!/bin/bash
# Chạy dashboard-vdm (bản build tĩnh, qua `serve`) cùng với api-server,
# tương đương `pnpm start` trong packages/dashboard-vdm nhưng dùng dist
# thay vì vite dev server.
#
# Ghi đè bằng biến môi trường, ví dụ:
#   DDS_INTERFACE=eth0 DASHBOARD_PORT=8080 ./scripts/start_vdm.sh

set -eo pipefail

# Suy ra đường dẫn từ vị trí của script, để chạy được trên mọi máy.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
API_SERVER_DIR="$REPO_ROOT/packages/api-server"
DASHBOARD_DIST="$REPO_ROOT/packages/dashboard-vdm/dist"
PIPENV="$REPO_ROOT/.venv/bin/pipenv"

# Tên card mạng cho CycloneDDS, khác nhau tuỳ máy (wlp2s0 là wifi, eth0 là dây).
DDS_INTERFACE="${DDS_INTERFACE:-wlp0s20f3}"
# Cổng phục vụ dashboard. Vite dev dùng 3000 nên giữ cho giống.
DASHBOARD_PORT="${DASHBOARD_PORT:-3000}"
# Giá trị `pnpm start` truyền cho api-server.
RMF_SERVER_USE_SIM_TIME="${RMF_SERVER_USE_SIM_TIME:-false}"

# --- bổ sung PATH ---

# Khi chạy từ icon ngoài desktop, terminal do gnome-terminal-server sinh ra
# KHÔNG đọc ~/.bashrc, nên PATH chỉ có mức tối thiểu của phiên desktop và thiếu
# thư mục cài global của pnpm (nơi chứa `serve`). Bổ sung lại ở đây.
export PNPM_HOME="${PNPM_HOME:-$HOME/.local/share/pnpm}"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac

# --- kiểm tra trước, hỏng thì báo ngay thay vì chết giữa chừng ---

if ! command -v serve >/dev/null 2>&1; then
  echo "LỖI: không tìm thấy lệnh 'serve'." >&2
  echo "     Đã tìm trong PNPM_HOME=$PNPM_HOME và các thư mục của PATH:" >&2
  echo "$PATH" | tr ':' '\n' | sed 's/^/       /' >&2
  echo "     Cài bằng: pnpm add -g serve   (hoặc npm i -g serve)" >&2
  exit 1
fi

if [ ! -d "$DASHBOARD_DIST" ]; then
  echo "LỖI: chưa có bản build tại $DASHBOARD_DIST" >&2
  echo "      Chạy: pnpm --filter rmf-dashboard-vdm build" >&2
  exit 1
fi

if [ ! -x "$PIPENV" ]; then
  echo "LỖI: không tìm thấy pipenv tại $PIPENV" >&2
  exit 1
fi

for setup in /opt/ros/jazzy/setup.bash "$HOME/rmf_ws/install/setup.bash"; do
  if [ ! -f "$setup" ]; then
    echo "LỖI: không tìm thấy $setup" >&2
    exit 1
  fi
done

# --- môi trường ROS ---

# setup.bash của ROS tham chiếu vài biến chưa khai báo nên không dùng `set -u`.
source /opt/ros/jazzy/setup.bash
source "$HOME/rmf_ws/install/setup.bash"

export RMW_IMPLEMENTATION=rmw_cyclonedds_cpp
export CYCLONEDDS_URI="<CycloneDDS><Discovery><ParticipantIndex>auto</ParticipantIndex><MaxAutoParticipantIndex>100</MaxAutoParticipantIndex></Discovery><Domain><General><NetworkInterfaceAddress>${DDS_INTERFACE}</NetworkInterfaceAddress></General></Domain></CycloneDDS>"
export PATH="$HOME/.local/bin:$PATH"
export RMF_SERVER_USE_SIM_TIME

# --- dừng cả hai tiến trình khi thoát ---

pids=()

cleanup() {
  trap - INT TERM EXIT
  echo
  echo ">>> Đang dừng..."
  for pid in "${pids[@]}"; do
    # giết cả tiến trình con, phòng khi pipenv không exec sang python
    pkill -TERM -P "$pid" 2>/dev/null || true
    kill -TERM "$pid" 2>/dev/null || true
  done
  wait 2>/dev/null || true
  echo ">>> Đã dừng."
}

trap cleanup INT TERM EXIT

# --- api-server, giống `npm run start:mysql` trong packages/api-server ---

echo ">>> Khởi động api-server (mysql, sim_time=$RMF_SERVER_USE_SIM_TIME)..."
(
  cd "$API_SERVER_DIR"
  rm -rf run && mkdir -p run/cache
  exec env RMF_API_SERVER_CONFIG=mysql_local_config.py \
    "$PIPENV" run python -m api_server
) &
pids+=($!)

# --- dashboard-vdm, bản build tĩnh ---

echo ">>> Khởi động dashboard-vdm tại http://0.0.0.0:$DASHBOARD_PORT ..."
serve -s "$DASHBOARD_DIST" -l "$DASHBOARD_PORT" &
pids+=($!)

# Tiến trình nào chết trước thì kéo theo cái còn lại, tránh chạy nửa vời.
wait -n
