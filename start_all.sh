#!/bin/bash

# 浙里Trip - 一键启动前后端
# 用法: ./start_all.sh          启动
#       ./start_all.sh stop     停止

# 颜色定义
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 获取脚本目录
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$SCRIPT_DIR/.trip_pids"

# ========== 停止功能 ==========
stop_services() {
  echo -e "${YELLOW}停止浙里Trip服务...${NC}"
  if [ -f "$PID_FILE" ]; then
    while IFS= read -r pid; do
      if ps -p "$pid" > /dev/null 2>&1; then
        kill "$pid" 2>/dev/null
        echo -e "  ${GREEN}✓${NC} 已停止进程 $pid"
      fi
    done < "$PID_FILE"
    rm -f "$PID_FILE"
  else
    # 尝试按端口查找并停止
    for port in 8000 5173; do
      pid=$(lsof -ti:$port 2>/dev/null)
      if [ -n "$pid" ]; then
        kill $pid 2>/dev/null
        echo -e "  ${GREEN}✓${NC} 已停止端口 $port 的进程"
      fi
    done
  fi
  echo -e "${GREEN}服务已停止${NC}"
  exit 0
}

# 处理 stop 参数
if [ "$1" = "stop" ]; then
  stop_services
fi

# 检查是否已在运行
for port in 8000 5173; do
  pid=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$pid" ]; then
    echo -e "${RED}端口 $port 已被占用 (PID: $pid)${NC}"
    echo -e "  如果需要重启，请先运行: ${YELLOW}./start_all.sh stop${NC}"
    exit 1
  fi
done

# ========== 启动 ==========
echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║   🏔️  浙里Trip - 小众放空式自驾旅行Agent                   ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

cd "$SCRIPT_DIR"

# [1/3] 检查Python依赖
echo -e "${YELLOW}[1/3] 检查Python依赖...${NC}"
if [ ! -d ".venv" ]; then
    echo -e "  创建虚拟环境..."
    python3 -m venv .venv
fi
source .venv/bin/activate
pip install -r requirements.txt --quiet 2>/dev/null
echo -e "  ${GREEN}✓${NC} Python环境就绪"

# [2/3] 启动后端 (后台)
echo -e "\n${YELLOW}[2/3] 启动后端服务 (端口 8000)...${NC}"
cd "$SCRIPT_DIR"
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload > /tmp/trip_backend.log 2>&1 &
BACKEND_PID=$!
echo "$BACKEND_PID" >> "$PID_FILE"
sleep 2

if ps -p $BACKEND_PID > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} 后端已启动 (PID: $BACKEND_PID)"
else
    echo -e "  ${RED}✗${NC} 后端启动失败"
    echo -e "  查看日志: ${YELLOW}tail -f /tmp/trip_backend.log${NC}"
fi

# [3/3] 启动前端
echo -e "\n${YELLOW}[3/3] 启动前端服务 (端口 5173)...${NC}"
cd "$SCRIPT_DIR/h5"

if [ ! -d "node_modules" ]; then
    echo -e "  安装前端依赖..."
    npm install > /dev/null 2>&1
fi

npx vite --host --port 5173 > /tmp/trip_frontend.log 2>&1 &
FRONTEND_PID=$!
echo "$FRONTEND_PID" >> "$PID_FILE"
sleep 3

if ps -p $FRONTEND_PID > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} 前端已启动 (PID: $FRONTEND_PID)"
else
    echo -e "  ${RED}✗${NC} 前端启动失败"
    echo -e "  查看日志: ${YELLOW}tail -f /tmp/trip_frontend.log${NC}"
fi

echo -e "\n${GREEN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                    🎉 启动完成!                            ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  前端:      http://localhost:5173                          ║"
echo "║  后端:      http://localhost:8000                          ║"
echo "║  API文档:   http://localhost:8000/docs                     ║"
echo "║  局域网:    http://$(ipconfig getifaddr en0 2>/dev/null || echo '192.168.x.x'):5173  ║"
echo "╠════════════════════════════════════════════════════════════╣"
echo "║  停止服务:  ./start_all.sh stop                           ║"
echo "║  后端日志:  tail -f /tmp/trip_backend.log                 ║"
echo "║  前端日志:  tail -f /tmp/trip_frontend.log                ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"