# -*- coding: utf-8 -*-
"""
浙里Trip - LLM服务层
支持多模型配置切换：DeepSeek / 智谱(百新)/ glm-4.5-air
"""

import os
from abc import ABC, abstractmethod
from typing import Optional, List, Dict, Any, Union
from enum import Enum
import requests
from openai import OpenAI

# ==================== 配置 ====================

class LLMProvider(str, Enum):
    """LLM提供商枚举"""
    AUTO = "auto"
    DEEPSEEK = "deepseek"
    BIGMODEL = "bigmodel"


class DeepSeekModel(str, Enum):
    """DeepSeek模型"""
    V4_FLASH = "deepseek-v4-flash"
    V4_PRO = "deepseek-v4-pro"


class BigModelModel(str, Enum):
    """智谱模型"""
    GLM_5_1 = "glm-5.1"
    GLM_5_TURBO = "glm-5-turbo"
    GLM_4_7 = "glm-4.7"
    GLM_4_7_FLASH = "glm-4.7-flash"
    GLM_4_5_AIR = "glm-4.5-air"
    GLM_4_6 = "glm-4.6"


# ==================== 抽象接口 ====================

class BaseLLMService(ABC):
    """LLM服务抽象基类"""
    
    @abstractmethod
    def chat(self, messages: List[Dict[str, str]], **kwargs) -> str:
        """发送对话请求，返回响应内容"""
        pass
    
    @abstractmethod
    def get_provider_name(self) -> str:
        """获取提供商名称"""
        pass


# ==================== DeepSeek服务 ====================

class DeepSeekService(BaseLLMService):
    """DeepSeek LLM服务"""
    
    def __init__(
        self, 
        api_key: Optional[str] = None,
        base_url: str = "https://api.deepseek.com",
        default_model: DeepSeekModel = DeepSeekModel.V4_FLASH
    ):
        self.api_key = api_key or os.environ.get("DEEPSEEK_API_KEY")
        self.base_url = base_url
        self.default_model = default_model
        
        if self.api_key:
            self.client = OpenAI(
                api_key=self.api_key,
                base_url=self.base_url
            )
        else:
            self.client = None
    
    def chat(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 1.0,
        max_tokens: Optional[int] = None,
        thinking: bool = False,
        reasoning_effort: str = "high",
        **kwargs
    ) -> str:
        """
        发送对话请求
        
        Args:
            messages: 消息列表 [{"role": "user/assistant/system", "content": "..."}]
            model: 模型名称，默认使用配置中的模型
            temperature: 温度参数
            max_tokens: 最大token数
            thinking: 是否启用思考模式
            reasoning_effort: 思考深度 high/max
        """
        if not self.client:
            raise RuntimeError("DeepSeek API key not configured")
        
        model = model or self.default_model.value
        
        # 构建请求参数
        request_kwargs = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
        }
        
        # 如果启用思考模式
        if thinking and model == DeepSeekModel.V4_PRO.value:
            request_kwargs["extra_body"] = {
                "thinking": {"type": "enabled"},
                "reasoning_effort": reasoning_effort
            }
        
        if max_tokens:
            request_kwargs["max_tokens"] = max_tokens
        
        response = self.client.chat.completions.create(**request_kwargs)
        return response.choices[0].message.content or ""
    
    def chat_stream(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 1.0,
        **kwargs
    ):
        """流式对话请求"""
        if not self.client:
            raise RuntimeError("DeepSeek API key not configured")
        
        model = model or self.default_model.value
        
        response = self.client.chat.completions.create(
            model=model,
            messages=messages,
            temperature=temperature,
            stream=True,
            **kwargs
        )
        
        for chunk in response:
            if chunk.choices[0].delta.content:
                yield chunk.choices[0].delta.content
    
    def get_provider_name(self) -> str:
        return "DeepSeek"


# ==================== 智谱服务 ====================

class BigModelService(BaseLLMService):
    """智谱GLM LLM服务 (百新/智谱)"""
    
    def __init__(
        self, 
        api_key: Optional[str] = None,
        base_url: str = "https://open.bigmodel.cn/api/paas/v4",
        default_model: BigModelModel = BigModelModel.GLM_4_5_AIR
    ):
        self.api_key = api_key or os.environ.get("BIGMODEL_API_KEY")
        self.base_url = base_url
        self.default_model = default_model
    
    def _get_headers(self) -> Dict[str, str]:
        """获取请求头"""
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    def chat(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 1.0,
        max_tokens: Optional[int] = None,
        **kwargs
    ) -> str:
        """
        发送对话请求
        
        Args:
            messages: 消息列表
            model: 模型名称，默认使用glm-4.5-air
            temperature: 温度参数
            max_tokens: 最大token数
        """
        if not self.api_key:
            raise RuntimeError("BigModel API key not configured")
        
        model = model or self.default_model.value
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "stream": False,
        }
        
        if max_tokens:
            payload["max_tokens"] = max_tokens
        
        # 合并额外参数
        payload.update(kwargs)
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=self._get_headers(),
            timeout=120
        )
        response.raise_for_status()
        
        result = response.json()
        return result["choices"][0]["message"]["content"]
    
    def chat_stream(
        self, 
        messages: List[Dict[str, str]], 
        model: Optional[str] = None,
        temperature: float = 1.0,
        **kwargs
    ):
        """流式对话请求"""
        if not self.api_key:
            raise RuntimeError("BigModel API key not configured")
        
        model = model or self.default_model.value
        
        payload = {
            "model": model,
            "messages": messages,
            "temperature": temperature,
            "stream": True,
        }
        payload.update(kwargs)
        
        response = requests.post(
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=self._get_headers(),
            stream=True,
            timeout=120
        )
        
        for line in response.iter_lines():
            if line:
                data = line.decode("utf-8")
                if data.startswith("data: "):
                    content = data[6:]
                    if content != "[DONE]":
                        try:
                            chunk = eval(content)
                            if chunk["choices"][0]["delta"].get("content"):
                                yield chunk["choices"][0]["delta"]["content"]
                        except:
                            pass
    
    def image_generation(
        self, 
        prompt: str, 
        model: str = "glm-image",
        size: str = "1280x1280",
        **kwargs
    ) -> str:
        """
        图片生成 (需要智谱支持)
        
        Args:
            prompt: 图片描述
            model: 模型名称
            size: 图片尺寸
        """
        if not self.api_key:
            raise RuntimeError("BigModel API key not configured")
        
        payload = {
            "model": model,
            "prompt": prompt,
            "size": size,
        }
        payload.update(kwargs)
        
        response = requests.post(
            f"{self.base_url}/images/generations",
            json=payload,
            headers=self._get_headers(),
            timeout=180
        )
        response.raise_for_status()
        
        result = response.json()
        return result["data"][0]["url"]
    
    def search(
        self, 
        query: str, 
        model: str = "search-std",
        **kwargs
    ) -> List[Dict[str, Any]]:
        """
        搜索功能 (需要智谱搜索支持)
        
        Args:
            query: 搜索query
            model: 搜索模型
        """
        if not self.api_key:
            raise RuntimeError("BigModel API key not configured")
        
        payload = {
            "model": model,
            "query": query,
        }
        payload.update(kwargs)
        
        response = requests.post(
            f"{self.base_url}/search",
            json=payload,
            headers=self._get_headers(),
            timeout=60
        )
        response.raise_for_status()
        
        return response.json()
    
    def get_provider_name(self) -> str:
        return "BigModel (智谱)"


# ==================== LLM管理器 ====================

class LLMManager:
    """
    LLM管理器 - 支持多模型切换
    优先使用glm-4.5-air进行旅程规划
    """
    
    def __init__(self, provider: str = "auto"):
        """
        初始化LLM管理器
        
        Args:
            provider: 提供商配置 "auto" | "deepseek" | "bigmodel"
        """
        self.provider = LLMProvider(provider)
        
        # 初始化各服务
        self.deepseek_service = DeepSeekService()
        self.bigmodel_service = BigModelService()
        
        # 旅程规划专用模型 (优先glm-4.5-air)
        self.travel_model = BigModelModel.GLM_4_5_AIR
    
    def _get_service(self, provider: Optional[str] = None) -> BaseLLMService:
        """获取指定提供商的服务"""
        target = provider or self.provider.value
        
        if target == LLMProvider.DEEPSEEK.value:
            return self.deepseek_service
        elif target in [LLMProvider.BIGMODEL.value, LLMProvider.AUTO.value]:
            # auto默认使用智谱
            return self.bigmodel_service
        else:
            return self.bigmodel_service
    
    def chat(
        self, 
        messages: List[Dict[str, str]], 
        provider: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ) -> str:
        """通用对话接口"""
        service = self._get_service(provider)
        return service.chat(messages, model=model, **kwargs)
    
    def chat_stream(
        self, 
        messages: List[Dict[str, str]], 
        provider: Optional[str] = None,
        model: Optional[str] = None,
        **kwargs
    ):
        """通用流式对话接口"""
        service = self._get_service(provider)
        return service.chat_stream(messages, model=model, **kwargs)
    
    def generate_travel_plan(
        self,
        direction: str,
        style: str,
        departure_time: str,
        location: str = "浙江",
        **kwargs
    ) -> Dict[str, Any]:
        """
        生成旅程规划
        
        Args:
            direction: 方向 (east/south/west/north/any)
            style: 方案类型 (relax/explore/slow/nature)
            departure_time: 出发时间 (now/afternoon/tomorrow)
            location: 位置区域
        
        Returns:
            旅程规划结果，包含目的地、时刻表、BGM等
        """
        # 构建prompt
        system_prompt = """你是一个专业的小众自驾旅行规划师，为用户生成"放空式"旅行攻略。
要求：
1. 选择浙江300公里以内的小众目的地
2. 生成3个独特的体验时刻（时间+地点+描述）
3. 氛围：慢节奏、不打卡、体验当地生活
4. 输出格式为JSON，包含destination、moments、bgm、atmosphere字段
5. 文案风格：文艺、轻松、有画面感
6. 根据direction添加吉祥语（利在东行/利向南/利往西/利向北/四方皆宜）
"""
        
        user_prompt = f"""帮我规划一次放空之旅：
- 方向偏好：{direction}
- 旅行风格：{style}
- 出发时间：{departure_time}
- 区域范围：{location}，300公里以内

请选择一个合适的小众目的地，生成完整的旅行时刻表。"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # 使用智谱glm-4.5-air生成
        try:
            result = self.bigmodel_service.chat(
                messages,
                model=self.travel_model.value,
                temperature=0.9,
                max_tokens=2000
            )
            
            # 尝试解析JSON
            import json
            try:
                # 提取JSON部分
                if "```json" in result:
                    result = result.split("```json")[1].split("```")[0]
                elif "```" in result:
                    result = result.split("```")[1].split("```")[0]
                
                return json.loads(result.strip())
            except:
                return {"raw_content": result, "status": "success"}
                
        except Exception as e:
            # 降级到Mock数据
            return self._get_mock_plan(direction, style)
    
    def _get_mock_plan(self, direction: str, style: str) -> Dict[str, Any]:
        """获取Mock数据降级方案"""
        direction_labels = {
            "east": "利在东行",
            "south": "利向南行",
            "west": "利往西去",
            "north": "利往北走",
            "any": "四方皆宜"
        }
        
        return {
            "direction_label": direction_labels.get(direction, "四方皆宜"),
            "destination": {
                "name": "安吉",
                "subtitle": "一个适合慢下来的地方",
                "description": "你会在三小时后抵达。那里没有人等你，也没有人催你。只有风，和刚刚好的时间。",
                "distance": "287km",
                "duration": "3小时12分钟",
                "image": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"
            },
            "moments": [
                {
                    "time": "清晨 6:40",
                    "title": "在空无一人的竹林里散步",
                    "description": "呼吸着带着露水的空气，阳光从竹叶间洒下来",
                    "image": "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80"
                },
                {
                    "time": "午后",
                    "title": "一家没有菜单的咖啡店",
                    "description": "老板只做他想做的那一杯，和他聊聊这里的故事",
                    "image": "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80"
                },
                {
                    "time": "傍晚 18:30",
                    "title": "在湖边看日落发呆",
                    "description": "什么都不用想，就让时间慢慢流过",
                    "image": "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&q=80"
                }
            ],
            "bgm": {
                "title": "平凡之路",
                "artist": "朴树",
                "description": "适合放空的公路音乐"
            },
            "atmosphere": "★★★★☆",
            "status": "success"
        }

    def generate_rich_plan(
        self,
        direction: str,
        style: str,
        departure_time: str,
        location: str = "浙江",
        user_location: str = "",
        destination_name: str = "",
        distance_info: str = "",
        hexagram_name: str = "",
        hexagram_meaning: str = "",
        hexagram_travel_hint: str = "",
    ) -> Dict[str, Any]:
        """
        生成丰富的旅行攻略（含HTML邀请函）
        """
        style_labels = {
            "relax": "放空指南 - 什么都不做，慢下来",
            "explore": "山野探索 - 向山而行，寻找秘境",
            "slow": "慢城漫游 - 走走停停，体验当地",
            "nature": "听风看云 - 自然疗愈，回归本真",
        }
        direction_labels = {
            "east": "东行（利在东行）",
            "south": "南下（利向南下）",
            "west": "西去（利往西去）",
            "north": "北往（利往北走）",
            "any": "四方皆宜",
        }
        time_labels = {
            "now": "现在就走",
            "afternoon": "午后出发（14:00左右）",
            "tomorrow": "明天清晨（06:00左右）",
        }

        system_prompt = """你是一个小众自驾旅行规划师，同时也是一位HTML设计大师。你需要完成两个任务：
1. 生成一份内容丰富的旅行攻略（JSON格式）
2. 设计一段完整的风格化HTML邀请函

关于旅行攻略，要求：
- 选择浙江300公里以内的小众目的地
- 生成3-5个独特的体验时刻
- 包含当地文化核心解读
- 文案风格：文艺、轻松、有画面感

关于HTML邀请函，要求：
- 使用内联CSS，不依赖外部资源
- 适配移动端（375px宽度为主）
- 命运/旅行主题风格，使用深色背景+金色/白色文字
- 包含：目的地信息、距离、卦象元素、体验时刻、文化核心
- 使用渐变、阴影等CSS效果营造氛围
- 整体高度不超过3000px
- 字体使用系统默认即可
- 只输出HTML代码，不要```html```包裹

输出格式（严格遵守）：
```json
{
  "destination": { "name": "", "subtitle": "", "description": "", "distance": "", "duration": "", "suggested_time": "", "image": "", "direction_label": "" },
  "moments": [ { "time": "", "title": "", "description": "", "image": "" } ],
  "bgm": { "title": "", "artist": "", "description": "" },
  "atmosphere": "",
  "culture_core": "",
  "invitation_html": "完整的HTML代码"
}
```"""

        hexagram_section = ""
        if hexagram_name:
            hexagram_section = f"""
卦象信息：
- 卦名：{hexagram_name}卦
- 卦辞：{hexagram_meaning}
- 出行指引：{hexagram_travel_hint}
请在邀请函中融入卦象元素，将卦名和卦辞作为设计的一部分。"""

        location_section = ""
        if user_location:
            location_section = f"""
用户当前位置：{user_location}"""

        destination_section = ""
        if destination_name:
            destination_section = f"""
指定的目的地：{destination_name}（请围绕这个目的地规划）"""

        distance_section = ""
        if distance_info:
            distance_section = f"""
距离信息：{distance_info}"""

        user_prompt = f"""帮我规划一次放空之旅：
- 方向偏好：{direction_labels.get(direction, '四方皆宜')}
- 旅行风格：{style_labels.get(style, '放空指南')}
- 出发时间：{time_labels.get(departure_time, '现在就走')}
- 区域范围：{location}，300公里以内{location_section}{destination_section}{distance_section}{hexagram_section}

请选择一个合适的小众目的地，生成完整的旅行攻略，并设计一段精美的HTML邀请函。"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]

        try:
            result = self.chat(
                messages,
                model=self.default_model.value,
                temperature=0.9,
                max_tokens=4000
            )

            # 尝试解析JSON
            import json
            try:
                # 提取JSON部分
                if "```json" in result:
                    result = result.split("```json")[1].split("```")[0]
                elif "```" in result:
                    result = result.split("```")[1].split("```")[0]

                parsed = json.loads(result.strip())

                # 提取invitation_html
                invitation_html = parsed.pop("invitation_html", "")
                # 清理HTML中的代码块标记
                invitation_html = invitation_html.replace("```html", "").replace("```", "").strip()

                parsed["invitation_html"] = invitation_html

                return parsed
            except json.JSONDecodeError:
                # JSON解析失败，尝试从result中提取HTML
                invitation_html = ""
                if "<html" in result.lower() or "<div" in result.lower():
                    html_start = result.lower().find("<html")
                    if html_start == -1:
                        html_start = result.lower().find("<div")
                    if html_start >= 0:
                        invitation_html = result[html_start:]

                return {
                    "raw_content": result,
                    "invitation_html": invitation_html,
                    "status": "partial_success"
                }

        except Exception as e:
            return self._get_mock_plan(direction, style)


# ==================== 全局单例 ====================

_llm_manager: Optional[LLMManager] = None

def get_llm_manager(provider: Optional[str] = None) -> LLMManager:
    """获取LLM管理器单例"""
    global _llm_manager
    
    if _llm_manager is None:
        env_provider = os.environ.get("LLM_PROVIDER", "auto")
        _llm_manager = LLMManager(provider or env_provider)
    
    return _llm_manager


# ==================== 便捷函数 ====================

def chat(messages: List[Dict[str, str]], provider: Optional[str] = None, **kwargs) -> str:
    """便捷对话函数"""
    return get_llm_manager(provider).chat(messages, **kwargs)

def generate_travel_plan(direction: str, style: str, departure_time: str, **kwargs) -> Dict[str, Any]:
    """便捷旅程规划函数"""
    return get_llm_manager().generate_travel_plan(direction, style, departure_time, **kwargs)

def generate_rich_plan(direction: str, style: str, departure_time: str, **kwargs) -> Dict[str, Any]:
    """便捷丰富内容生成函数"""
    return get_llm_manager().generate_rich_plan(direction, style, departure_time, **kwargs)