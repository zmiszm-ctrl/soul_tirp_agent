# 浙里Trip 产品架构文档

> 版本: 1.1.0 | 更新日期: 2026-05-10

## 一、项目概述

**浙里Trip** 是一款小众·反向·放空式自驾旅行Agent产品，为用户随机生成浙江周边300公里内的小众目的地旅行攻略。

### 核心特性
- 🎲 **盲盒旅行**: 根据用户三选偏好，随机生成目的地
- 📜 **邀请函体验**: LLM生成风格化HTML邀请函，而非传统攻略
- 🧘 **放空导向**: 强调慢节奏、不打卡、体验当地生活
- 🎵 **BGM推荐**: 每份攻略配有专属氛围音乐
- 📍 **智能定位**: 自动获取用户位置，计算驾车距离
- ☯ **八卦占卜**: 撒叶起卦互动，64卦影响旅行规划
- 🍃 **撒叶动画**: CSS @keyframes 叶子从底部中央向四周撒出

---

## 二、系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户端 (H5)                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ 出发页  │→│ 三选页  │→│ 生成页  │→│邀请函页 │→│ 详情页  │ │
│  │ 自动定位 │  │八卦占卜 │  │随机目的地│  │LLM生成HTML│  │         │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API网关 (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    /api/v1/travel/*                       │   │
│  │  - POST /plan         生成旅行攻略（旧版）                │   │
│  │  - POST /rich-plan    生成丰富内容+HTML邀请函             │   │
│  │  - GET  /destinations 获取目的地列表                      │   │
│  │  - POST /reroll       重新生成(限1次)                     │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    /api/v1/amap/*                         │   │
│  │  - POST /geocode      地理编码 (地址→经纬度)              │   │
│  │  - POST /regeocode    逆地理编码 (经纬度→地址)            │   │
│  │  - POST /driving      驾车路线规划 (距离+时间+过路费)     │   │
│  │  - POST /distance     一站式两地距离查询                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    /api/v1/llm/*                        │   │
│  │  - GET  /models      获取可用模型                         │   │
│  │  - POST /chat        LLM对话测试                         │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    LLM服务层 (可切换)                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │  智谱 glm    │  │ DeepSeek   │  │   Auto (智能切换)        │ │
│  │ 4.5-air ★   │  │  v4-flash  │  │   优先智谱 → 降级DeepSeek │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                 高德地图服务 (Web Service REST API)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  amap_service.py - 后端直接调用REST API                    │   │
│  │  - 地理编码 (地址→经纬度坐标)                              │   │
│  │  - 逆地理编码 (经纬度→中文地址)                            │   │
│  │  - 驾车路线规划 (距离+时间+过路费+步骤)                    │   │
│  │  - 一站式距离查询 (地址→路线→结果)                        │   │
│  │                                                          │   │
│  │  API: https://restapi.amap.com/v3/*                      │   │
│  │  认证: AMAP_API_KEY (环境变量)                             │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、技术栈

### 前端 (H5)
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | UI框架 |
| TypeScript | 6.x | 类型安全 |
| Vite | 8.x | 构建工具 |
| Tailwind CSS | 4.x | 样式方案 |
| Framer Motion | 12.x | 动效动画 |
| React Router | 7.x | 路由管理 |
| Zustand | 5.x | 状态管理 |
| Axios | 1.x | HTTP客户端 |
| html2canvas | 1.x | 截图分享 |

### 后端 (API)
| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.10+ | 运行环境 |
| FastAPI | 0.110+ | Web框架 |
| Pydantic | 2.x | 数据校验 |
| uvicorn | 0.27+ | ASGI服务器 |
| requests | - | HTTP客户端 |
| openai | 1.x | DeepSeek SDK |

### LLM模型
| 提供商 | 模型 | 用途 |
|--------|------|------|
| 智谱 | glm-4.5-air ★ | 主要生成 |
| 智谱 | glm-5.1 | 备用生成 |
| DeepSeek | deepseek-v4-flash | 降级使用 |

---

## 四、目录结构

```
soul_tirp_agent/
├── app/                        # FastAPI 后端应用
│   ├── __init__.py
│   ├── main.py                 # 应用入口
│   ├── config.py               # 配置管理
│   ├── models.py               # 数据模型
│   ├── routes.py               # API路由
│   ├── llm_service.py          # LLM服务层
│   ├── amap_service.py         # 高德地图服务（地理编码/路线规划）
│   └── utils/                  # 工具函数
│       └── hexagram.py         # 卦象工具
│
├── h5/                         # React H5 前端
│   ├── src/
│   │   ├── App.tsx             # 根组件
│   │   ├── main.tsx            # 入口文件
│   │   ├── pages/              # 页面组件
│   │   │   ├── HomePage/       # 出发页（含定位）
│   │   │   ├── SelectPage/     # 三选页（含占卜）
│   │   │   ├── LoadingPage/    # 生成中
│   │   │   ├── InvitationPage/ # 邀请函
│   │   │   └── DetailPage/     # 详情页
│   │   ├── components/         # 可复用组件
│   │   │   ├── FateButton/     # 命运按钮
│   │   │   ├── BaguaDivination/# 八卦占卜（撒叶动画）
│   │   │   ├── InvitationCard/ # 邀请函卡片
│   │   │   ├── MomentsCard/    # 时刻卡片
│   │   │   ├── RouteView/      # 路线视图
│   │   │   ├── ShareCard/      # 分享卡片
│   │   │   └── FateGenerator/  # 生成动效
│   │   ├── services/           # 服务层
│   │   │   ├── llm.ts          # LLM调用
│   │   │   ├── amap.ts         # 高德地图服务
│   │   │   └── mock.ts         # Mock数据
│   │   ├── stores/             # 状态管理
│   │   │   └── travelStore.ts  # 旅行状态
│   │   ├── types/              # 类型定义
│   │   │   └── index.ts
│   │   ├── utils/              # 工具函数
│   │   │   ├── helpers.ts
│   │   │   └── hexagram.ts     # 64卦映射
│   │   └── styles/             # 样式文件
│   │       ├── tokens.css      # Design Tokens
│   │       └── global.css      # 全局样式
│   └── package.json
│
├── .env                        # 环境变量配置
├── requirements.txt            # Python依赖
├── start_all.sh               # 一键启动脚本
├── start_backend.sh           # 后端启动脚本
├── start_frontend.sh          # 前端启动脚本
├── ARCHITECTURE.md            # 本文档
├── README.md                  # 项目说明
└── doc.md                     # 产品需求文档
```

---

## 五、API接口

### 基础信息
- 基础URL: `http://localhost:8000`
- API文档: `http://localhost:8000/docs`
- 认证方式: 暂无需认证 (MVP阶段)

### 接口列表

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/` | API首页 |
| GET | `/health` | 健康检查 |
| GET | `/api/v1/travel/destinations` | 获取目的地列表 |
| POST | `/api/v1/travel/plan` | 生成旅行攻略（旧版） |
| POST | `/api/v1/travel/rich-plan` | 生成丰富内容+HTML邀请函 |
| POST | `/api/v1/travel/reroll` | 重新生成攻略 |
| GET | `/api/v1/travel/plan/{id}` | 获取攻略详情 |
| POST | `/api/v1/amap/geocode` | 地理编码（地址→经纬度） |
| POST | `/api/v1/amap/regeocode` | 逆地理编码（经纬度→地址） |
| POST | `/api/v1/amap/driving` | 驾车路线规划 |
| POST | `/api/v1/amap/distance` | 一站式两地距离查询 |
| GET | `/api/v1/llm/models` | 获取可用模型 |
| POST | `/api/v1/llm/chat` | LLM对话测试 |

### 请求示例

**生成旅行攻略**
```bash
curl -X POST http://localhost:8000/api/v1/travel/plan \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "east",
    "style": "relax",
    "departure_time": "now"
  }'
```

**响应示例**
```json
{
  "success": true,
  "plan": {
    "id": "uuid-xxx",
    "destination": {
      "name": "安吉",
      "subtitle": "一个适合慢下来的地方",
      "distance": "287km",
      "duration": "3小时12分钟"
    },
    "moments": [
      {
        "time": "清晨 6:40",
        "title": "在空无一人的竹林里散步"
      }
    ],
    "bgm": {
      "title": "平凡之路",
      "artist": "朴树"
    },
    "atmosphere": "★★★★☆"
  }
}
```

### 高德地图接口示例

**地理编码（地址→经纬度）**
```bash
curl -X POST http://localhost:8000/api/v1/amap/geocode \
  -H "Content-Type: application/json" \
  -d '{
    "address": "北京市朝阳区阜通东大街6号",
    "city": "北京"
  }'
```

**响应示例**
```json
{
  "success": true,
  "results": [
    {
      "formatted_address": "北京市朝阳区阜通东大街6号",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "location": "116.481028,39.989643",
      "level": "门牌号"
    }
  ],
  "message": "地理编码成功"
}
```

**驾车路线规划**
```bash
curl -X POST http://localhost:8000/api/v1/amap/driving \
  -H "Content-Type: application/json" \
  -d '{
    "origin": "116.379028,39.865042",
    "destination": "116.427281,39.903719",
    "strategy": "fastest"
  }'
```

**响应示例**
```json
{
  "success": true,
  "origin": "116.379028,39.865042",
  "destination": "116.427281,39.903719",
  "distance_km": 8.5,
  "duration_text": "22分钟",
  "duration_seconds": 1320,
  "tolls_yuan": 0,
  "taxi_cost": 25.0,
  "steps": [
    {
      "instruction": "沿XX路行驶565米右转",
      "road": "XX路",
      "distance": 565,
      "time": 120,
      "action": "右转",
      "orientation": "东"
    }
  ],
  "message": "驾车路线规划成功"
}
```

**一站式两地距离查询**
```bash
curl -X POST http://localhost:8000/api/v1/amap/distance \
  -H "Content-Type: application/json" \
  -d '{
    "from_address": "杭州市西湖区",
    "to_address": "安吉县",
    "from_city": "杭州",
    "to_city": "湖州"
  }'
```

**响应示例**
```json
{
  "success": true,
  "from_info": {
    "address": "浙江省杭州市西湖区",
    "location": "120.129722,30.259167",
    "province": "浙江省",
    "city": "杭州市",
    "district": "西湖区"
  },
  "to_info": {
    "address": "浙江省湖州市安吉县",
    "location": "119.681667,30.633056",
    "province": "浙江省",
    "city": "湖州市",
    "district": "安吉县"
  },
  "route": {
    "distance_km": 78.5,
    "duration_text": "1小时15分钟",
    "duration_seconds": 4500,
    "tolls_yuan": 35,
    "tolls_distance_km": 45.2,
    "traffic_lights": 8,
    "steps_count": 12
  },
  "taxi_cost": 235.0,
  "message": "距离查询成功"
}
```

---

## 六、数据模型

### TripPreferences (用户偏好)
```python
{
    direction: "east" | "south" | "west" | "north" | "any"
    style: "relax" | "explore" | "slow" | "nature"
    departure_time: "now" | "afternoon" | "tomorrow"
}
```

### Destination (目的地)
```python
{
    name: str           # 目的地名称
    subtitle: str       # 氛围描述
    description: str    # 邀请函正文
    distance: str       # 距离
    duration: str       # 车程
    suggested_time: str # 建议出发时间
    image: str          # 背景图
    direction_label: str # 方向吉祥语
}
```

### Moment (体验时刻)
```python
{
    id: str        # 唯一ID
    time: str      # 时间
    title: str     # 标题
    description: str # 描述
    image: str     # 配图
}
```

---

## 七、配置说明

### 环境变量 (.env)
```bash
# 应用配置
APP_HOST=0.0.0.0
APP_PORT=8000
APP_ENV=dev

# LLM配置
LLM_PROVIDER=auto        # auto | deepseek | bigmodel
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_MODEL=deepseek-v4-flash
BIGMODEL_API_KEY=xxx
BIGMODEL_MODEL=glm-4.5-air

# 高德地图配置
AMAP_API_KEY=你的高德Web服务Key  # 后端API调用（地理编码/路线规划）
```

### 模型切换逻辑
1. `LLM_PROVIDER=auto`: 优先使用智谱glm-4.5-air，失败时降级到DeepSeek
2. `LLM_PROVIDER=deepseek`: 固定使用DeepSeek
3. `LLM_PROVIDER=bigmodel`: 固定使用智谱

---

## 八、部署方案

### 开发环境
```bash
# 一键启动
./start_all.sh

# 或分别启动
./start_backend.sh  # 终端1
./start_frontend.sh # 终端2
```

### 生产环境

#### 1. 前端部署

```bash
cd h5

# 1. 安装依赖
npm install

# 2. 构建生产版本
npm run build
# 输出到 h5/dist/ 目录

# 3. 使用 Nginx 托管
cp -r dist/* /var/www/zheilitrip/
```

**Nginx 配置示例**:
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/zheilitrip;
    index index.html;
    
    # SPA路由支持
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### 2. 后端部署

```bash
cd /path/to/soul_tirp_agent

# 1. 创建虚拟环境
python3 -m venv .venv
source .venv/bin/activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 使用 Gunicorn + Uvicorn Workers 启动
pip install gunicorn
gunicorn app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile /var/log/zheilitrip/access.log \
    --error-logfile /var/log/zheilitrip/error.log \
    --daemon
```

#### 3. 环境变量配置 (.env)

**生产环境必须配置**:
```bash
# 应用配置
APP_HOST=0.0.0.0
APP_PORT=8000
APP_ENV=production  # 改为 production

# LLM配置 (使用生产环境的API Key)
LLM_PROVIDER=auto
DEEPSEEK_API_KEY=sk-xxx-production-key
BIGMODEL_API_KEY=xxx-production-key
BIGMODEL_MODEL=glm-4.5-air

# 高德地图 Key (已在 index.html 中配置)
# AMAP_KEY=5f4bdb7d72c8683bfc46430bd84db3df
```

**安全建议**:
- 不要将 `.env` 文件提交到Git
- 使用 `.env.example` 作为模板
- 生产环境API Key需要定期轮换

#### 4. Docker 部署

**Dockerfile**:
```dockerfile
FROM python:3.10-slim

WORKDIR /app

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install --no-cache-dir gunicorn

# 复制应用代码
COPY app/ ./app/

EXPOSE 8000

# 使用 Gunicorn 启动
CMD ["gunicorn", "app.main:app", \
     "--workers", "4", \
     "--worker-class", "uvicorn.workers.UvicornWorker", \
     "--bind", "0.0.0.0:8000"]
```

**docker-compose.yml**:
```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "8000:8000"
    env_file:
      - .env
    restart: always
    logging:
      driver: json-file
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./h5/dist:/usr/share/nginx/html
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - api
    restart: always
```

#### 5. 部署前检查清单

**后端检查**:
- [ ] `.env` 中配置正确的生产环境API Key
- [ ] `APP_ENV=production`
- [ ] 数据库连接（如果已集成）
- [ ] 日志目录权限 (`/var/log/zheilitrip/`)
- [ ] 防火墙开放8000端口
- [ ] HTTPS证书配置（推荐Let's Encrypt）

**前端检查**:
- [ ] `npm run build` 构建成功
- [ ] `h5/dist/` 目录生成完整
- [ ] 高德地图Key已配置在 `index.html`
- [ ] API代理已移除（生产环境不需要）
- [ ] 前端路由模式（建议使用Hash路由或Nginx配置SPA支持）

**API Key清单**:
- [ ] 智谱AI API Key (`BIGMODEL_API_KEY`)
- [ ] DeepSeek API Key (`DEEPSEEK_API_KEY`)
- [ ] 高德地图 JS SDK Key (`index.html` 中)
- [x] 高德地图 Web服务 Key (`AMAP_API_KEY` 环境变量)

**性能优化**:
- [ ] 启用Gzip压缩
- [ ] 静态资源CDN
- [ ] LLM响应缓存（相同prompt不重复调用）
- [ ] 图片资源优化（压缩、懒加载）
- [ ] 数据库连接池（如果已集成）

**监控与告警**:
- [ ] 后端健康检查端点 (`/health`)
- [ ] 错误日志收集（Sentry/LogRocket）
- [ ] 性能监控（APM）
- [ ] LLM API调用量监控
- [ ] 高德地图API调用量监控

#### 6. 上线后运维

**日志查看**:
```bash
# 后端日志
tail -f /var/log/zheilitrip/access.log
tail -f /var/log/zheilitrip/error.log

# Nginx日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

**服务管理**:
```bash
# 重启后端
systemctl restart zheilitrip-api

# 重启Nginx
systemctl reload nginx

# 查看服务状态
systemctl status zheilitrip-api
```

**数据库备份**（如果已集成）:
```bash
# 定时备份脚本
0 2 * * * pg_dump zheilitrip > /backup/db_$(date +\%Y\%m\%d).sql
```

### Docker部署 (可选)
```dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY app/ ./app/
EXPOSE 8000
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 九、后续迭代

### MVP已完成
- [x] H5页面流程 (出发→三选→生成→邀请函→详情)
- [x] LLM服务层 (支持多模型切换)
- [x] 旅行攻略生成API
- [x] 丰富内容生成API (rich-plan)
- [x] 智能定位功能 (浏览器定位+高德逆地理编码)
- [x] 八卦占卜互动 (撒叶动画+64卦映射)
- [x] LLM风格化HTML邀请函生成
- [x] 高德地图集成 (路线规划+距离计算)
- [x] 高德后端服务 (地理编码/逆地理编码/驾车路线规划/距离查询)

### 规划中
- [ ] 用户系统 (登录/收藏/历史)
- [ ] 数据库持久化
- [ ] 真实地图集成
- [ ] 旅行陪伴模式 (聊天/导览)
- [ ] 小程序/App移植
- [ ] 打卡核销系统
- [ ] AI游记生成

---

## 十、联系方式

- 产品: 浙里Trip
- 版本: 1.0.0 MVP
- 状态: 开发中
- kinzer 个人主页：备案审核中