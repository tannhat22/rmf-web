#!/bin/bash
# Khởi chạy toàn bộ hệ thống RMF. Đây là script mà icon ngoài desktop gọi tới.
#
# Bấm lại nhiều lần cũng chỉ có đúng một bộ RMF chạy: mỗi tiến trình được khởi
# chạy sẽ tự ghi PID ra file, lần chạy sau đọc file đó để dừng đúng tiến trình
# cũ (kèm toàn bộ con cháu) trước khi khởi chạy lại.
#
# Ghi đè bằng biến môi trường nếu máy khác cấu hình:
#   RMF_WEB_DIR=... DDS_INTERFACE=eth0 ./run.sh

# Tự suy ra vị trí, để script chạy được dù đặt ở ~/Documents/rmf_app hay trong repo.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

RMF_WEB_DIR="${RMF_WEB_DIR:-$HOME/nhat_ws/projects/rmf-web}"
START_RMFWEB="$RMF_WEB_DIR/scripts/start_rmfweb.sh"

# Lấy DDS_INTERFACE (và môi trường ROS) từ env.sh để tên card mạng chỉ khai báo
# ở một nơi duy nhất.
#
# Lưu ý: gnome-terminal giao lệnh cho gnome-terminal-server chạy, nên biến môi
# trường của script này KHÔNG tự truyền sang terminal con. Phải truyền tường
# minh bằng `env` ở phần khởi chạy bên dưới.
source "$SCRIPT_DIR/env.sh"

# Nơi giữ PID của các tiến trình do script này khởi chạy. Đặt trong thư mục
# runtime để tự sạch sau khi khởi động lại máy.
RUN_DIR="${XDG_RUNTIME_DIR:-/tmp}/rmf_app"
mkdir -p "$RUN_DIR"

# Người dùng bấm icon liên tục sẽ tạo ra nhiều run.sh chạy song song, chúng có
# thể xen kẽ nhau (cùng đọc PID cũ, cùng dừng, rồi cùng khởi chạy) và đẻ ra
# nhiều bộ RMF. Khoá lại để các lần bấm xếp hàng lần lượt.
exec 9>"$RUN_DIR/run.lock"
if command -v flock >/dev/null 2>&1; then
  if ! flock -w 120 9; then
    echo "LỖI: một lần chạy khác đang giữ khoá quá lâu, bỏ qua lần này." >&2
    exit 1
  fi
fi

# Gửi tín hiệu cho cả nhóm tiến trình chứ không chỉ tiến trình đầu. `ros2
# launch` và api-server đều sinh con, giết mỗi tiến trình cha sẽ để lại con mồ
# côi vẫn giữ node ROS và cổng mạng.
signal_group() {
  local sig=$1 pid=$2
  local pgid my_pgid
  my_pgid="$(ps -o pgid= -p $$ 2>/dev/null | tr -d ' ')"
  pgid="$(ps -o pgid= -p "$pid" 2>/dev/null | tr -d ' ')"
  if [ -n "$pgid" ] && [ "$pgid" != "$my_pgid" ] && [ "$pgid" != "1" ]; then
    kill "-$sig" -"$pgid" 2>/dev/null
  else
    kill "-$sig" "$pid" 2>/dev/null
  fi
}

# Dừng tiến trình đã ghi trong pid file. `expect` là một chuỗi phải có trong
# dòng lệnh của PID đó, để nếu hệ điều hành đã cấp lại PID cho tiến trình khác
# thì ta không giết nhầm.
stop_tracked() {
  local name=$1 expect=$2
  local pidfile="$RUN_DIR/$name.pid"
  local pid

  if [ ! -f "$pidfile" ]; then
    echo "Không có tiến trình cũ: $name"
    return
  fi

  pid="$(tr -dc '0-9' <"$pidfile")"
  rm -f "$pidfile"

  if [ -z "$pid" ] || ! kill -0 "$pid" 2>/dev/null; then
    echo "Không có tiến trình cũ: $name (đã tự thoát)"
    return
  fi

  if ! ps -o cmd= -p "$pid" 2>/dev/null | grep -qF -- "$expect"; then
    echo "Bỏ qua $name: pid $pid giờ thuộc về tiến trình khác"
    return
  fi

  echo "Đang dừng $name (pid $pid)..."
  signal_group TERM "$pid"

  # Chờ tới khi chết thật, thay vì `sleep` một khoảng đoán mò.
  for _ in $(seq 20); do
    kill -0 "$pid" 2>/dev/null || break
    sleep 1
  done

  if kill -0 "$pid" 2>/dev/null; then
    echo "  chưa thoát sau 20s -> buộc dừng (SIGKILL)"
    signal_group KILL "$pid"
    sleep 1
  fi
  echo "  đã dừng $name"
}

# Mở terminal chạy lệnh, đồng thời ghi PID của chính lệnh đó ra pid file.
# `exec` giữ nguyên PID nên số ghi ra đúng là tiến trình đang chạy thật.
launch() {
  local name=$1
  shift
  local pidfile="$RUN_DIR/$name.pid"

  rm -f "$pidfile"

  # `9>&-` đóng fd của file khoá trước khi giao cho tiến trình con. Nếu không,
  # con thừa hưởng fd đó và tiếp tục giữ khoá suốt thời gian nó sống, khiến
  # lần bấm icon sau bị treo tới khi hết thời gian chờ.
  #
  # Cửa sổ được giữ lại sau khi lệnh kết thúc. Nếu đóng ngay, lỗi chỉ kịp nháy
  # một cái rồi biến mất và không ai đọc được nó.
  gnome-terminal -- bash -c '
      echo $$ >"$1"
      shift
      "$@"
      ec=$?
      echo
      echo "=================================================="
      echo " Tiến trình đã kết thúc (mã thoát $ec)."
      echo " Đọc thông báo lỗi phía trên, rồi nhấn Enter để đóng."
      echo "=================================================="
      read -r
    ' _ "$pidfile" "$@" 9>&-

  # gnome-terminal trả về ngay, tiến trình thật do gnome-terminal-server sinh ra
  # sau đó mới ghi PID. Phải chờ ghi xong rồi mới nhả khoá, nếu không lần bấm kế
  # tiếp sẽ đọc phải file rỗng, tưởng chưa có gì chạy, và khởi chạy thêm một bộ
  # nữa.
  local i
  for i in $(seq 50); do
    [ -s "$pidfile" ] && return 0
    sleep 0.1
  done
  echo "  CẢNH BÁO: $name chưa ghi được PID sau 5s, lần chạy sau có thể không dừng được nó" >&2
}

# --- dừng bộ cũ trước khi khởi chạy bộ mới ---

stop_tracked rmf "run_rmf.sh"
stop_tracked rmfweb "start_rmfweb.sh"
stop_tracked machine_client "run_machine_client.sh"

# --- kiểm tra trước khi chạy ---

# Bộ RMF chạy từ trước thời có pid file (hoặc chạy tay) sẽ không bị stop_tracked
# dừng, và nó vẫn giữ cổng. api-server mới không bind được cổng 8000 sẽ thoát
# ngay, kéo theo cả `serve`, và cửa sổ terminal tắt gần như tức thì.
warn_port_in_use() {
  local port=$1 what=$2 holder
  holder="$(ss -ltnp 2>/dev/null | grep -F ":$port " | head -1)"
  [ -z "$holder" ] && return 0
  echo "CẢNH BÁO: cổng $port ($what) đang bị chiếm:" >&2
  echo "  $holder" >&2
  return 1
}

busy=0
warn_port_in_use 8000 "api-server" || busy=1
warn_port_in_use 3000 "dashboard" || busy=1
if [ "$busy" = "1" ]; then
  echo "" >&2
  echo "Nhiều khả năng còn một bộ RMF cũ đang chạy mà script này không quản lý." >&2
  echo "Hãy đóng các cửa sổ terminal cũ (hoặc dừng tiến trình ở trên) rồi bấm lại." >&2
  echo "" >&2
  echo "Nhấn Enter để vẫn tiếp tục, hoặc Ctrl+C để dừng lại..." >&2
  read -r
fi

# Báo sớm nếu thiếu file, thay vì mở terminal rồi tắt ngay không kịp đọc lỗi.
for f in "$SCRIPT_DIR/run_rmf.sh" "$SCRIPT_DIR/run_machine_client.sh" "$START_RMFWEB"; do
  if [ ! -x "$f" ]; then
    echo "LỖI: không tìm thấy hoặc không chạy được: $f" >&2
    echo "Nhấn Enter để đóng..." >&2
    read -r
    exit 1
  fi
done

# --- khởi chạy ---

launch rmf "$SCRIPT_DIR/run_rmf.sh"

# rmf-web: api-server + dashboard (bản build tĩnh qua `serve`).
# Truyền DDS_INTERFACE và discovery range cho khớp với run_rmf.sh.
launch rmfweb env \
  DDS_INTERFACE="$DDS_INTERFACE" \
  ROS_AUTOMATIC_DISCOVERY_RANGE=LOCALHOST \
  "$START_RMFWEB"

launch machine_client "$SCRIPT_DIR/run_machine_client.sh"

# sleep 2
# gnome-terminal -- microsoft-edge --start-fullscreen http://localhost:3000/
