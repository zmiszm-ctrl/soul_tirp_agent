---
name: zhipu-image-generation
description: 使用智谱AI GLM-Image等系列模型从文本提示生成高质量图像。当用户需要生成图片、AI绘图、文本转图像、创建插图或视觉内容时使用此skill。支持glm-image、cogview-4-250304、cogview-4、cogview-3-flash模型。
---

# 智谱AI图像生成

通过智谱AI API从文本描述生成高质量图像。

## API信息

- **端点**: `POST https://open.bigmodel.cn/api/paas/v4/images/generations`
- **认证**: Bearer Token，使用 `BIGMODEL_API_KEY`（项目 `.env` 中已配置）
- **请求头**: `Authorization: Bearer {API_KEY}`, `Content-Type: application/json`

## 可用模型

| 模型 | 说明 | 默认质量 | 推荐尺寸 |
|------|------|----------|----------|
| `glm-image` | 最新模型，细节丰富 | hd | 1280x1280 |
| `cogview-4-250304` | CogView4新版 | standard | 1024x1024 |
| `cogview-4` | CogView4 | standard | 1024x1024 |
| `cogview-3-flash` | 快速生成 | standard | 1024x1024 |

## 请求参数

| 参数 | 必填 | 类型 | 说明 |
|------|------|------|------|
| `model` | 是 | string | 模型编码，见上表 |
| `prompt` | 是 | string | 图像的文本描述 |
| `quality` | 否 | string | `hd`(精细，~20s) 或 `standard`(快速，~5-10s)。glm-image仅支持hd |
| `size` | 否 | string | 图片尺寸，见下方尺寸表 |
| `watermark_enabled` | 否 | boolean | 是否添加水印，默认true |
| `user_id` | 否 | string | 终端用户ID，6-128字符 |

## 尺寸规格

**glm-image 推荐尺寸**（默认 1280x1280）:
- `1280x1280`、`1568x1056`、`1056x1568`
- `1472x1088`、`1088x1472`
- `1728x960`、`960x1728`
- 自定义：长宽 1024-2048px，最大像素 ≤ 2^22，长宽为32的整数倍

**其他模型推荐尺寸**（默认 1024x1024）:
- `1024x1024`、`768x1344`、`864x1152`
- `1344x768`、`1152x864`、`1440x720`、`720x1440`
- 自定义：长宽 512-2048px，被16整除，最大像素 ≤ 2^21

## 响应格式

```json
{
  "created": 1700000000,
  "data": [
    {
      "url": "https://..."  // 临时链接，有效期30天
    }
  ],
  "content_filter": [
    {
      "role": "assistant",
      "level": 3  // 0最严重，3轻微
    }
  ]
}
```

**重要**: 图片URL有效期30天，需及时转存。

## 调用示例

### Python (requests)

```python
import requests

API_KEY = os.environ.get("BIGMODEL_API_KEY")
url = "https://open.bigmodel.cn/api/paas/v4/images/generations"

response = requests.post(
    url,
    headers={
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json"
    },
    json={
        "model": "glm-image",
        "prompt": "一只可爱的小猫咪，坐在阳光明媚的窗台上，背景是蓝天白云",
        "size": "1280x1280"
    },
    timeout=180
)
result = response.json()
image_url = result["data"][0]["url"]
```

### 项目集成 (BigModelService)

项目 `app/llm_service.py` 中的 `BigModelService.image_generation()` 已提供封装：

```python
from app.llm_service import get_llm_manager

llm = get_llm_manager()
image_url = llm.bigmodel_service.image_generation(
    prompt="描述文本",
    model="glm-image",    # 使用新模型
    size="1280x1280"
)
```

**注意**: 现有 `image_generation()` 默认模型为 `cogview-3`（已过时），建议更新为 `glm-image`。

### cURL

```bash
curl -X POST https://open.bigmodel.cn/api/paas/v4/images/generations \
  -H "Authorization: Bearer $BIGMODEL_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"model":"glm-image","prompt":"描述文本","size":"1280x1280"}'
```

## 下载与转存图片

```python
import requests
from pathlib import Path

def download_image(url: str, save_path: str) -> str:
    """下载生成的图片到本地"""
    resp = requests.get(url, timeout=60)
    resp.raise_for_status()
    Path(save_path).write_bytes(resp.content)
    return save_path
```

## 错误处理

| 场景 | 处理方式 |
|------|----------|
| API Key未配置 | 检查 `.env` 中 `BIGMODEL_API_KEY` |
| 内容安全过滤 | 检查 `content_filter`，level 0-1 需修改prompt |
| 超时 | glm-image hd模式约20s，设timeout ≥ 30s |
| 尺寸不合法 | 使用推荐枚举值，确保满足整数倍约束 |
| 图片URL过期 | 30天内下载转存 |

## 最佳实践

1. **优先使用 `glm-image`**：质量最佳，仅支持hd模式
2. **prompt优化**：具体描述场景、风格、光线、色彩，避免模糊表述
3. **及时转存**：生成后立即下载，URL 30天过期
4. **竖版图片**：用 `1056x1568`(glm-image) 或 `768x1344`(其他模型)
5. **横版图片**：用 `1568x1056`(glm-image) 或 `1344x768`(其他模型)
