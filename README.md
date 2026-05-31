# 浙里Trip

> 小众放空式自驾旅行 Agent — 去一个你没想过的地方

## 产品简介

**浙里Trip** 是一款 AI 驱动的周末短途旅行灵感工具。用户通过简单的方向+风格+时间三选，即可获得一份专属的旅行邀请函——包含目的地、行程节奏、沿途故事和氛围音乐。

不赶路，不打卡，只出发。

## 核心功能

- **盲盒旅行**: 根据三选偏好随机生成目的地
- **邀请函体验**: LLM 生成风格化 HTML 邀请函，告别传统攻略
- **放空导向**: 强调慢节奏、不打卡、体验当地生活
- **BGM推荐**: 每份攻略配有专属氛围音乐
- **智能定位**: 自动获取用户位置，高德 API 计算驾车距离
- **八卦占卜**: 撒叶起卦互动，64 卦影响旅行规划
- **高德后端服务**: 地理编码 / 逆地理编码 / 驾车路线规划 / 距离查询
- **设计系统**: 首页可查看完整 UI 设计规范

## 快速开始

### 环境要求

- Python 3.10+
- Node.js 18+

### 安装部署

```bash
# 1. 克隆项目
git clone <repo>
cd soul_tirp_agent

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入你的 API 密钥

# 3. 一键启动 (前后端)
./start_all.sh

# 停止服务
./start_all.sh stop

# 或分别启动
./start_backend.sh  # 后端: http://localhost:8000
./start_frontend.sh # 前端: http://localhost:2000
```

### 启动后访问地址

| 服务 | 地址 |
|------|------|
| 前端页面 | `http://localhost:2000/` |
| 后端健康检查 | `http://localhost:8000/health` |
| 后端接口文档 | `http://localhost:8000/docs` |

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | React 19 + TypeScript + Vite + Tailwind CSS 4 + Framer Motion |
| 后端 | Python 3.10+ + FastAPI + Pydantic |
| LLM | 智谱 glm-4.5-air (主) / DeepSeek v4-flash (备) |
| 地图 | 高德地图 Web Service REST API |

## 目录结构

```
soul_tirp_agent/
├── app/                        # FastAPI 后端
│   ├── main.py                 # 应用入口
│   ├── config.py               # 配置管理
│   ├── models.py               # 数据模型
│   ├── routes.py               # API 路由
│   ├── llm_service.py          # LLM 服务层
│   ├── amap_service.py         # 高德地图服务
│   └── utils/
│       └── hexagram.py         # 卦象工具
├── h5/                         # React H5 前端
│   ├── public/
│   │   └── UI_format.png       # 设计系统截图
│   └── src/
│       ├── pages/              # 页面组件
│       ├── components/         # 可复用组件
│       │   ├── Modal/          # 通用弹窗
│       │   ├── FateButton/     # 命运按钮
│       │   ├── BaguaDivination/# 八卦占卜
│       │   ├── InvitationCard/ # 邀请函卡片
│       │   └── ...
│       ├── services/           # 服务层
│       └── stores/             # 状态管理
├── .env.example                # 环境变量模板
├── requirements.txt            # Python 依赖
├── ARCHITECTURE.md             # 架构文档
├── DEPLOYMENT.md               # 部署指南
└── README.md                   # 本文档
```

## API 接口

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/` | API 首页 |
| GET | `/health` | 健康检查 |
| POST | `/api/v1/travel/plan` | 生成旅行攻略 |
| POST | `/api/v1/travel/rich-plan` | 生成丰富内容 + HTML 邀请函 |
| POST | `/api/v1/travel/reroll` | 重新生成攻略 (限 1 次) |
| GET | `/api/v1/travel/destinations` | 获取目的地列表 |
| POST | `/api/v1/amap/geocode` | 地理编码 (地址→经纬度) |
| POST | `/api/v1/amap/regeocode` | 逆地理编码 (经纬度→地址) |
| POST | `/api/v1/amap/driving` | 驾车路线规划 |
| POST | `/api/v1/amap/distance` | 一站式两地距离查询 |
| GET | `/api/v1/llm/models` | 获取可用模型 |
| POST | `/api/v1/llm/chat` | LLM 对话测试 |

## 环境变量

```bash
# 应用配置
APP_HOST=0.0.0.0
APP_PORT=8000
APP_ENV=dev              # dev | production

# LLM 配置
LLM_PROVIDER=auto        # auto | deepseek | bigmodel
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_MODEL=deepseek-v4-flash
BIGMODEL_API_KEY=xxx
BIGMODEL_MODEL=glm-4.5-air

# 高德地图配置
AMAP_API_KEY=你的高德Web服务Key  # 后端 API 调用
# 前端 JS SDK Key 配置在 h5/index.html 的 <script> 标签中
```

## 用户流程

```
首页(自动定位) → 三选(方向/风格/时间) → 八卦占卜(撒叶起卦)
  → Loading(随机目的地 + 高德距离计算 + LLM 生成内容)
  → 邀请函(LLM 生成 HTML) → 详情页 → 出发
```

## 开发指南

```bash
# 前端
cd h5 && npm install && npm run dev

# 后端
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

## 生产环境部署

> 以下命令在项目根目录 (`soul_tirp_agent/`) 下执行。

```bash
# 1. 配置环境变量
cp .env.example .env
# 编辑 .env，设置 APP_ENV=production，填入生产环境 API Key

# 2. 构建前端
cd h5 && npm install && npm run build && cd ..

# 3. 安装后端依赖
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pip3 install gunicorn

# 4. 启动后端 (Gunicorn + Uvicorn Workers)
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --timeout 120 \
    --access-logfile /var/log/zheilitrip/access.log \
    --error-logfile /var/log/zheilitrip/error.log \
    --daemon

# 5. Nginx 托管前端 + 反代后端
# 将 h5/dist/ 指向 Nginx root，/api/ 代理到 127.0.0.1:8000
# 详见 DEPLOYMENT.md
```

## 相关文档

- [架构设计文档](./ARCHITECTURE.md)
- [部署指南](./DEPLOYMENT.md)
- [产品需求文档](./doc.md)

## License

MIT License
