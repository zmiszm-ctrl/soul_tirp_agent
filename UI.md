帮我做一个产品的概念设计图：
以下是产品规划描述：

# 一、设计系统总原则（Design Philosophy）

### 1. 三个核心设计支柱

- **未知感（Uncertainty）**：不要一眼看穿
- **引导感（Guided Fate）**：像被安排好的旅行
- **可分享（Shareable Story）**：每一屏都能截图

---

# 二、Design Token（设计变量体系）

## 1. 颜色系统（Color Tokens）

### 🎨 基础色板（Base）

```css
--color-bg-primary: #F4F1EC;      /* 米白背景 */
--color-bg-secondary: #E9E5DF;    /* 分层背景 */

--color-text-primary: #2F2F2F;    /* 主文本 */
--color-text-secondary: #6B6B6B;  /* 次文本 */

--color-accent-blue: #7FA7B5;     /* 天空蓝 */
--color-accent-green: #6B7D6D;    /* 森林绿 */
--color-accent-orange: #D9A066;   /* 日落橙 */

--color-line-soft: rgba(0,0,0,0.08);
```

---

### 🌫 情绪渐变（用于大图/封面）

```css
--gradient-hero:
linear-gradient(
  180deg,
  rgba(0,0,0,0.15) 0%,
  rgba(0,0,0,0.45) 100%
);
```

👉 用于：封面图 + 邀请函

---

## 2. 字体系统（Typography Tokens）

### 字体组合


| 类型  | 字体           |
| --- | ------------ |
| 标题  | Serif（宋体/衬线） |
| 正文  | Sans（无衬线）    |


---

### 字号体系

```css
--font-size-hero: 32px;   /* 标题（邀请函） */
--font-size-title: 24px;
--font-size-body: 16px;
--font-size-caption: 13px;
```

---

### 行高（重点：松弛感）

```css
--line-height-loose: 1.8;
--line-height-normal: 1.5;
```

---

## 3. 间距系统（Spacing）

```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 40px;
--space-xxl: 64px;
```

👉 特点：**大间距 > 密集布局**

---

## 4. 圆角 & 阴影

```css
--radius-card: 16px;
--radius-button: 999px; /* 胶囊 */

--shadow-soft:
0 10px 30px rgba(0,0,0,0.08);
```

---

# 三、核心组件规范（Component System）

---

## 1. 🎲 核心按钮（Primary Action）

### 名称：

**「命运按钮」**

### 样式：

- 胶囊按钮
- 半透明 + 模糊背景（Glass）

```css
background: rgba(255,255,255,0.6);
backdrop-filter: blur(10px);
```

---

### 文案规范：

- 带情绪，而不是功能

❌ 不要：

- “生成路线”

✅ 用：

- 「带我去一个地方」
- 「今天不想待在这里」

---

### 状态：


| 状态     | 表现   |
| ------ | ---- |
| 默认     | 半透明  |
| hover  | 背景变实 |
| active | 微缩   |


---

## 2. 🧭 生成过程模块（Loading System）

### 组件名：

**Fate Generator**

---

### 组成：

#### ① 文案流（逐行出现）

```
正在寻找一个适合你的地方…
避开人群…
靠近风…
```

#### ② 动效：

- opacity渐显
- 每句延迟 0.8s–1.2s

---

#### ③ 背景：

- 模糊地图 or 流动纹理

---

## 3. 📜 邀请函卡片（核心组件）

### 组件名：

**Invitation Card**

---

### 结构：

```
[背景图]

[渐变遮罩]

标题（目的地）
副标题（一句话氛围）

正文（2–3行短句）

信息（距离 / 时间）

CTA按钮
```

---

### 样式：

- 全屏 or 大卡片
- 字体偏大
- 留白多

---

### 文案规范：

必须具备：

- 第二人称（“你”）
- 时间感
- 自然元素

示例：

> 你将在三小时后
> 抵达一个风很轻的地方

---

## 4. 🗺 路线组件（Route View）

### 风格：

- 极简线条
- 不用真实地图（降低工具感）

---

### 可选：

- 手绘风路径
- 或单线动画（从A到B）

---

## 5. 🧩 推荐模块（体验卡片）

### 组件名：

**Moments Card**

---

### 类型：

- 一家店
- 一条路
- 一个时间点

---

### 卡片结构：

```
图片
标题
一句话描述
```

---

### 示例：

> 清晨 6:40
> 在空无一人的湖边

---

## 6. 📤 分享组件（Share Card ⭐重点）

这是传播核心。

---

### 设计目标：

👉 用户一键生成“可发朋友圈/小红书”的图

---

### 内容结构：

```
目的地名
一句话文案
距离 + 时间
视觉大图
产品logo（弱化）
```

---

### 风格：

- 像电影海报
- 可带颗粒感

---

### 输出比例：

- 9:16（手机）
- 1:1（社交）

---

## 7. 🔁 替换按钮（Secondary Action）

文案：

- 「换一个地方」

样式：

- 无背景
- 低对比

---

# 四、动效规范（Motion System）

## 1. 动效原则

- 慢（0.6s+）
- 柔（ease-in-out）
- 有“空气感”

---

## 2. 关键动效

### 页面切换：

- Fade + slight slide

### 图片：

- 轻微缩放（1.05）

### 卡片：

- 上浮 8px

---

# 五、图片规范（Image System）

## 风格：

- 胶片感
- 不锐化
- 不商业

---

## 内容优先级：

1. 自然
2. 空间
3. 人（小）

---