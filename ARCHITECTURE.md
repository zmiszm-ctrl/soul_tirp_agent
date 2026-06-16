# 浙里Trip 产品架构文档

> 版本: 2.0.0 | 更新日期: 2026-06-16

## 一、项目概述

**浙里Trip** 是一款小众·反向·放空式自驾旅行Agent产品，为用户随机生成浙江周边300公里内的小众目的地旅行攻略。

### 核心特性
- 🎲 **盲盒旅行**: 根据用户三选偏好，随机生成目的地
- 🤖 **Agent 流水线**: 搜索信息 → 提取图片 → LLM 生成 → 模板渲染
- 📜 **邀请函体验**: 3 套风格模板（渐变之境/暗夜微光/山水画卷）
- 🧘 **放空导向**: 强调慢节奏、不打卡、体验当地生活
- 🎵 **BGM推荐**: 每份攻略配有专属氛围音乐
- 📍 **智能定位**: 自动获取用户位置，计算驾车距离
- ☯ **八卦占卜**: 撒叶起卦互动，64卦影响旅行规划
- 🖼️ **图片缓存**: 官方图片全局缓存复用，降低 API 消耗
- 👤 **用户系统**: 登录注册 + 旅行偏好设置

---

## 二、系统架构

```
┌─────────────────────────────────────────────────────────────────┐
│                         用户端 (H5)                              │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│  │ 出发页  │→│ 三选页  │→│ 生成页  │→│邀请函页 │→│ 详情页  │ │
│  │ 视频背景│  │八卦占卜 │  │Agent流水线│ │模板渲染 │  │         │ │
│  │ 动态预览│  │偏好缓存 │  │搜索+图片 │  │3套风格  │  │         │ │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API网关 (FastAPI)                          │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    /api/v1/travel/*                       │   │
│  │  - POST /rich-plan    Agent流水线（搜索+图片+LLM+渲染）   │   │
│  │  - POST /plan         生成旅行攻略（旧版）                │   │
│  │  - GET  /destinations 获取目的地列表                      │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    /api/v1/user/*                         │   │
│  │  - POST /register     用户注册                            │   │
│  │  - POST /login        用户登录                            │   │
│  │  - GET  /preferences  获取用户偏好                        │   │
│  │  - PUT  /preferences  更新用户偏好                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    /api/v1/amap/*                         │   │
│  │  - POST /geocode      地理编码 (地址→经纬度)              │   │
│  │  - POST /regeocode    逆地理编码 (经纬度→地址)            │   │
│  │  - POST /driving      驾车路线规划 (距离+时间+过路费)     │   │
│  │  - POST /distance     一站式两地距离查询                  │   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                    /api/v1/images/*                       │   │
│  │  - GET  /{dest}/{file} 缓存图片静态服务                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Agent 流水线 (llm_service.py)                 │
│                                                                  │
│  Step 1: 搜索目的地信息 (智谱 Web Search API)                   │
│    └─ search_pro → 景点/人文/特色信息                           │
│                                                                  │
│  Step 2: 获取图片 (优先缓存 → 搜索补充)                         │
│    ├─ image_cache.py → 检查 data/images/{dest}/                │
│    └─ BigModel Reader API → 从官网页面提取图片                  │
│                                                                  │
│  Step 3: LLM 生成攻略 (三级降级链)                              │
│    ├─ glm-4.7 (首选)                                           │
│    ├─ glm-4.6v (备用)                                          │
│    ├─ glm-4.5-air (兜底)                                       │
│    └─ mock 数据 (最终降级)                                      │
│                                                                  │
│  Step 4: 模板渲染邀请函 (template_renderer.py)                  │
│    ├─ gradient.html  — Stripe 渐变 mesh 风格                   │
│    ├─ glow.html      — Spotify 暗色沉浸风格                    │
│    └─ ink.html       — 山水画卷水墨风格                         │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                    智谱 BigModel API                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Web Search  │  │ Reader API  │  │  LLM Chat               │ │
│  │ 搜索目的地  │  │ 提取页面图片│  │  生成攻略 JSON           │ │
│  │ 0.03元/次   │  │ 按页计费    │  │  三级降级               │ │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────┐
│                 高德地图服务 (Web Service REST API)              │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  amap_service.py - 后端直接调用REST API                    │   │
│  │  - 地理编码 / 逆地理编码 / 驾车路线规划 / 距离查询       │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 三、技术栈

### 前端 (H5)
| 技术 | 版本 | 用途 |
|------|------|------|
| React | 19.x | UI框架（React.lazy 代码分割） |
| TypeScript | 6.x | 类型安全 |
| Vite | 8.x | 构建工具（manualChunks 分包） |
| Tailwind CSS | 4.x | 样式方案 |
| Framer Motion | 12.x | 动效动画 |
| React Router | 7.x | 路由管理 |
| Zustand | 5.x | 状态管理（useShallow selector） |
| DOMPurify | 3.x | LLM HTML 安全过滤 |

### 后端 (API)
| 技术 | 版本 | 用途 |
|------|------|------|
| Python | 3.10+ | 运行环境 |
| FastAPI | 0.110+ | Web框架 |
| Pydantic | 2.x | 数据校验 |
| uvicorn | 0.27+ | ASGI服务器 |
| requests | 2.x | HTTP客户端（高德/智谱API） |
| Pillow | 12.x | 图片处理（logo去背景） |

### LLM 模型（三级降级链）
| 优先级 | 模型 | 用途 |
|--------|------|------|
| ★★★ | glm-4.7 | 首选，旅行攻略生成 |
| ★★ | glm-4.6v | 备用，多模态能力 |
| ★ | glm-4.5-air | 兜底，最快最便宜 |
| — | mock 数据 | 最终降级方案 |

### 搜索服务
| 服务 | API | 用途 |
|------|-----|------|
| 智谱 Web Search | `/web_search` | 搜索目的地景点/人文信息 |
| 智谱 Reader | `/reader` | 从官网页面提取图片 URL |

---

## 四、目录结构

```
soul_tirp_agent/
├── app/                        # FastAPI 后端应用
│   ├── __init__.py
│   ├── main.py                 # 应用入口
│   ├── config.py               # 配置管理
│   ├── models.py               # 数据模型
│   ├── routes.py               # API路由（旅行+高德+图片服务）
│   ├── user_routes.py          # 用户认证+偏好 API
│   ├── llm_service.py          # LLM服务层（Agent流水线+降级链）
│   ├── amap_service.py         # 高德地图服务
│   ├── image_cache.py          # 图片缓存管理器
│   ├── template_renderer.py    # 邀请函模板渲染引擎
│   ├── database.py             # SQLite 数据库
│   ├── templates/              # HTML 邀请函模板
│   │   ├── gradient.html       # Stripe 渐变 mesh 风格
│   │   ├── glow.html           # Spotify 暗色沉浸风格
│   │   └── ink.html            # 山水画卷水墨风格
│   └── utils/
│       └── hexagram.py         # 卦象工具
│
├── h5/                         # React H5 前端
│   ├── public/
│   │   ├── logo.png            # 网站 logo（透明背景）
│   │   ├── favicon.ico         # 浏览器标签图标
│   │   └── videos/             # 首页视频背景（6个视频）
│   └── src/
│       ├── App.tsx             # 根组件（React.lazy + ErrorBoundary）
│       ├── main.tsx            # 入口文件
│       ├── pages/
│       │   ├── HomePage/       # 出发页（视频背景+动态预览卡片）
│       │   ├── SelectPage/     # 三选页（含占卜）
│       │   ├── LoadingPage/    # Agent 流水线执行
│       │   ├── InvitationPage/ # 邀请函（DOMPurify 安全过滤）
│       │   ├── DetailPage/     # 详情页
│       │   ├── LoginPage/      # 登录注册
│       │   └── ProfilePage/    # 用户偏好设置
│       ├── components/
│       │   ├── ErrorBoundary.tsx # 错误边界
│       │   ├── BaguaDivination/ # 八卦占卜（撒叶动画）
│       │   └── ...
│       ├── services/
│       │   ├── amap.ts         # 高德地图服务
│       │   ├── llm.ts          # LLM 调用
│       │   └── mock.ts         # Mock 数据
│       ├── stores/
│       │   ├── travelStore.ts  # 旅行状态（含图片缓存）
│       │   └── userStore.ts    # 用户状态
│       └── styles/
│           ├── tokens.css      # Design Tokens（含 prefers-reduced-motion）
│           └── global.css      # 全局样式
│
├── data/
│   ├── zheilitrip.db           # SQLite 数据库
│   └── images/                 # 图片缓存（按目的地目录组织）
│       ├── anji/               # 安吉图片
│       ├── moganshan/          # 莫干山图片
│       └── ...
│
├── .env.example                # 环境变量模板
├── requirements.txt            # Python 依赖
├── ARCHITECTURE.md             # 本文档
└── README.md                   # 项目说明
```

---

## 五、API接口

### 基础信息
- 基础URL: `http://localhost:8000`
- API文档: `http://localhost:8000/docs`
- 认证方式: 用户名+密码（无 JWT，MVP 阶段）

### Agent 流水线

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/v1/travel/rich-plan` | 完整 Agent 流水线 |

请求体:
```json
{
  "direction": "east",
  "style": "relax",
  "departure_time": "now",
  "user_location": { "city": "杭州", "district": "西湖区", "lat": 30.25, "lng": 120.13 },
  "destination_name": "安吉",
  "distance_info": { "distance": "280km", "duration": "3小时" },
  "hexagram": { "name": "乾", "meaning": "元亨利贞", "lines": [1,1,1,1,1,1] }
}
```

响应体:
```json
{
  "success": true,
  "plan": { "destination": {...}, "moments": [...], "bgm": {...}, "atmosphere": "..." },
  "invitation_html": "<div>...渲染后的HTML邀请函...</div>",
  "images": [{ "url": "/api/v1/images/anji/scenic_竹海_01.jpg", "source": "anji.gov.cn", "title": "中国大竹海" }],
  "template_used": "gradient",
  "hexagram_name": "乾",
  "hexagram_interpretation": "元亨利贞"
}
```

### 用户系统

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/v1/user/register` | 用户注册 |
| POST | `/api/v1/user/login` | 用户登录 |
| GET | `/api/v1/user/preferences/{user_id}` | 获取用户偏好 |
| PUT | `/api/v1/user/preferences/{user_id}` | 更新用户偏好 |

### 图片服务

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/images/{destination}/{filename}` | 缓存图片静态服务 |

### 高德地图

| 方法 | 路径 | 描述 |
|------|------|------|
| POST | `/api/v1/amap/geocode` | 地理编码（地址→经纬度） |
| POST | `/api/v1/amap/regeocode` | 逆地理编码（经纬度→地址） |
| POST | `/api/v1/amap/driving` | 驾车路线规划 |
| POST | `/api/v1/amap/distance` | 一站式两地距离查询 |

### LLM 测试

| 方法 | 路径 | 描述 |
|------|------|------|
| GET | `/api/v1/llm/models` | 获取可用模型 |
| POST | `/api/v1/llm/chat` | LLM 对话测试 |

---

## 六、核心模块

### Agent 流水线 (`llm_service.py`)

```
agent_generate_plan()
  ├─ Step 1: search(query="{目的地} 旅游景点 人文 特色")
  │    └─ 返回搜索结果摘要作为 LLM 上下文
  │
  ├─ Step 2: 图片获取（优先缓存）
  │    ├─ image_cache.get_cached_images() → 命中则直接返回
  │    └─ image_cache.cache_images_batch() → 搜索+下载+缓存
  │
  ├─ Step 3: generate_travel_plan_for_agent()
  │    ├─ 使用 chat_with_fallback() 三级降级
  │    └─ 输出结构化 JSON（destination, moments, bgm, culture_core）
  │
  └─ Step 4: render_invitation()
       ├─ 根据目的地选择模板（gradient/glow/ink）
       ├─ 渲染体验时刻、图片画廊、卦象、BGM
       └─ 输出完整 HTML 邀请函
```

### 图片缓存 (`image_cache.py`)

```
存储路径: data/images/{目的地英文名}/{类型}_{景点名}_{序号}.jpg
示例:     data/images/anji/official_中国大竹海_01.jpg

类型标签:
  official  — 来自 gov.cn 官方网站
  scenic    — 景点风景照
  culture   — 人文/文化相关
  food      — 美食相关
  general   — 其他

服务端点: GET /api/v1/images/{destination}/{filename}
安全措施: 路径穿越防护（realpath 校验）
```

### 模板系统 (`template_renderer.py`)

```
3 套模板按目的地自动匹配:
  gradient (渐变) — 山林/自然: 安吉、桐庐、德清、莫干山...
  glow (暗夜)     — 海岛/水边: 嵊泗、象山、舟山、千岛湖...
  ink (水墨)      — 古村/文化: 永嘉、开化、缙云、南浔...

渲染流程:
  1. 根据目的地名查找 DESTINATION_STYLE 映射
  2. 加载对应模板 HTML
  3. 替换模板变量（目的地名、距离、文案、图片URL等）
  4. 渲染子组件（体验时刻、卦象、图片画廊）
  5. 返回完整 HTML 字符串
```

### LLM 降级链

```
chat_with_fallback(messages, models=[glm-4.7, glm-4.6v, glm-4.5-air])
  ├─ 尝试 glm-4.7 → 成功则返回
  ├─ 失败 → 尝试 glm-4.6v → 成功则返回
  ├─ 失败 → 尝试 glm-4.5-air → 成功则返回
  └─ 全部失败 → 抛出异常 → 降级到 mock 数据
```

### 图片缓存流程

```
用户请求生成"安吉"攻略
  → 检查 data/images/anji/ 目录
  ├─ 已有 ≥3 张 → 直接返回缓存图片（不消耗搜索次数）
  └─ 不足 → 智谱 Web Search 搜索官方页面
       → Reader API 提取图片 URL
       → 下载保存到 data/images/anji/
       → 返回图片列表
```

---

## 七、数据模型

### 用户偏好 (user_preferences)

| 字段 | 类型 | 说明 |
|------|------|------|
| user_id | int | 用户ID（外键） |
| default_direction | str? | 默认方向偏好 |
| default_style | str? | 默认旅行风格 |
| default_departure_time | str? | 默认出发时间 |
| city | str? | 常驻城市 |
| travel_budget | str? | 旅行预算 |
| companion_pref | str? | 同行偏好 |
| scenery_types | json? | 喜欢的风景类型（数组） |
| activity_types | json? | 喜欢的活动类型（数组） |
| music_pref | str? | 音乐偏好 |
| dietary_note | str? | 饮食备注 |
| notes | str? | 个人备注 |

### LLM 输出 JSON 结构

```json
{
  "template": "gradient",
  "destination": {
    "name": "安吉",
    "subtitle": "竹海清风，慢下来的勇气",
    "description": "你会在三小时后抵达...",
    "distance": "280km",
    "duration": "3小时",
    "suggested_time": "周六 06:30",
    "direction_label": "利在西行"
  },
  "moments": [
    { "time": "清晨 6:40", "title": "在空无一人的竹林里散步", "description": "...", "image": "" }
  ],
  "bgm": { "title": "平凡之路", "artist": "朴树", "description": "..." },
  "atmosphere": "竹林清风，慢下来的勇气",
  "culture_core": "安吉是竹文化之乡，白茶之乡..."
}
```

---

## 八、环境变量

```bash
# 应用配置
APP_HOST=0.0.0.0
APP_PORT=8000
APP_ENV=dev              # dev | production

# LLM 配置（降级链: glm-4.7 → glm-4.6v → glm-4.5-air）
LLM_PROVIDER=auto
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_MODEL=deepseek-v4-flash
BIGMODEL_API_KEY=xxx
BIGMODEL_MODEL=glm-4.7

# 高德地图
AMAP_API_KEY=你的高德Web服务Key
# 前端 JS SDK Key 配置在 h5/index.html <script> 标签中
```

---

## 九、部署方案

### 开发环境
```bash
./start_all.sh     # 启动前后端
./start_all.sh stop # 停止
```

### 生产环境
```bash
# 1. 构建前端
cd h5 && npm install && npm run build

# 2. 启动后端 (Gunicorn)
gunicorn app.main:app --workers 4 --bind 0.0.0.0:8000

# 3. Nginx 托管前端 + 反代后端
```
