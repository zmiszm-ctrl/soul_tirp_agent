#!/bin/bash

# 浙里Trip - 前端启动脚本

# 颜色定义
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${CYAN}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║           🏔️ 浙里Trip H5 前端启动                        ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

cd "$(dirname "$0")/h5"

# 检查node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}安装依赖...${NC}"
    npm install
fi

echo -e "\n${GREEN}启动开发服务器...${NC}\n"
npm run dev