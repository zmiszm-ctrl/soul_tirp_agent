# -*- coding: utf-8 -*-
"""
浙里Trip - 数据模型定义
"""

from pydantic import BaseModel, Field
from typing import List, Optional, Literal
from datetime import datetime
import uuid


class TripPreferences(BaseModel):
    """旅程偏好"""
    direction: Literal["east", "south", "west", "north", "any"] = Field(
        description="方向偏好：east-东行, south-南下, west-西去, north-北往, any-听天由命"
    )
    style: Literal["relax", "explore", "slow", "nature"] = Field(
        description="旅行风格：relax-放空指南, explore-山野探索, slow-慢城漫游, nature-听风看云"
    )
    departure_time: Literal["now", "afternoon", "tomorrow"] = Field(
        description="出发时间：now-现在就走, afternoon-午后出发, tomorrow-明天清晨"
    )


class Destination(BaseModel):
    """目的地"""
    name: str = Field(description="目的地名称")
    subtitle: str = Field(description="目的地副标题/氛围描述")
    description: str = Field(description="邀请函正文")
    distance: str = Field(description="距离，如287km")
    duration: str = Field(description="车程，如3小时12分钟")
    suggested_time: str = Field(description="建议出发时间")
    image: str = Field(description="背景图URL")
    direction_label: str = Field(description="方向吉祥语")


class Moment(BaseModel):
    """体验时刻"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    time: str = Field(description="时间，如'清晨 6:40'")
    title: str = Field(description="时刻标题")
    description: str = Field(description="时刻描述")
    image: str = Field(description="配图URL")


class BgmRecommendation(BaseModel):
    """BGM推荐"""
    title: str = Field(description="歌曲名")
    artist: str = Field(description="艺术家")
    description: str = Field(description="推荐理由")


class TravelPlan(BaseModel):
    """旅行攻略"""
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    destination: Destination
    moments: List[Moment] = Field(min_length=1, max_length=5)
    bgm: Optional[BgmRecommendation] = None
    atmosphere: str = Field(description="氛围指数，如'★★★★☆'")
    created_at: datetime = Field(default_factory=datetime.now)


class TravelPlanRequest(BaseModel):
    """生成旅行攻略请求"""
    direction: Literal["east", "south", "west", "north", "any"] = Field(
        description="方向偏好"
    )
    style: Literal["relax", "explore", "slow", "nature"] = Field(
        description="旅行风格"
    )
    departure_time: Literal["now", "afternoon", "tomorrow"] = Field(
        description="出发时间"
    )
    location: Optional[str] = Field(default="浙江", description="区域范围")


class TravelPlanResponse(BaseModel):
    """生成旅行攻略响应"""
    success: bool = Field(default=True)
    plan: TravelPlan
    message: Optional[str] = None


class HealthResponse(BaseModel):
    """健康检查响应"""
    status: str = "ok"
    version: str
    llm_provider: str
    llm_model: str


class UserLocationInfo(BaseModel):
    """用户位置信息"""
    address: str = Field(default="", description="详细地址")
    city: str = Field(default="", description="城市")
    district: str = Field(default="", description="区县")
    lat: float = Field(default=0, description="纬度")
    lng: float = Field(default=0, description="经度")


class DistanceInfoModel(BaseModel):
    """距离信息"""
    distance: str = Field(default="", description="距离，如287km")
    duration: str = Field(default="", description="车程，如3小时12分钟")


class HexagramInfo(BaseModel):
    """卦象信息"""
    name: str = Field(description="卦名")
    meaning: str = Field(default="", description="卦辞")
    lines: list[int] = Field(default=[1,1,1,1,1,1], description="六爻，1=阳 0=阴")


class ImageInfo(BaseModel):
    """图片信息"""
    url: str = Field(description="图片URL")
    source: str = Field(default="", description="来源页面URL")
    title: str = Field(default="", description="图片标题")


class RichPlanRequest(BaseModel):
    """丰富内容生成请求"""
    direction: Literal["east", "south", "west", "north", "any"] = Field(
        description="方向偏好"
    )
    style: Literal["relax", "explore", "slow", "nature"] = Field(
        description="旅行风格"
    )
    departure_time: Literal["now", "afternoon", "tomorrow"] = Field(
        description="出发时间"
    )
    user_location: Optional[UserLocationInfo] = Field(default=None, description="用户位置")
    destination_name: Optional[str] = Field(default=None, description="指定目的地名称")
    distance_info: Optional[DistanceInfoModel] = Field(default=None, description="距离信息")
    hexagram: Optional[HexagramInfo] = Field(default=None, description="卦象信息")


class RichPlanResponse(BaseModel):
    """丰富内容生成响应"""
    success: bool = Field(default=True)
    plan: TravelPlan
    invitation_html: str = Field(default="", description="渲染后的风格化HTML邀请函")
    hexagram_name: str = Field(default="", description="卦名")
    hexagram_interpretation: str = Field(default="", description="卦象解读")
    images: List[ImageInfo] = Field(default=[], description="搜索到的目的地图片")
    template_used: str = Field(default="gradient", description="使用的模板")
    message: Optional[str] = None


# ==================== 高德地图相关模型 ====================

class GeocodeRequest(BaseModel):
    """地理编码请求"""
    address: str = Field(description="地址，如 '北京市朝阳区阜通东大街6号'")
    city: Optional[str] = Field(default=None, description="城市（可选），提高精度")


class GeocodeResponse(BaseModel):
    """地理编码响应"""
    success: bool = Field(default=True)
    results: list = Field(default=[], description="地理编码结果列表")
    message: Optional[str] = None


class ReGeocodeRequest(BaseModel):
    """逆地理编码请求"""
    lng: float = Field(description="经度")
    lat: float = Field(description="纬度")
    radius: int = Field(default=1000, description="搜索半径(米)")


class ReGeocodeResponse(BaseModel):
    """逆地理编码响应"""
    success: bool = Field(default=True)
    address: str = Field(default="", description="格式化地址")
    province: str = Field(default="", description="省份")
    city: str = Field(default="", description="城市")
    district: str = Field(default="", description="区县")
    township: str = Field(default="", description="乡镇")
    pois: list = Field(default=[], description="周边POI")
    message: Optional[str] = None


class DrivingRouteRequest(BaseModel):
    """驾车路线规划请求"""
    origin: str = Field(description="起点坐标，格式 '经度,纬度'")
    destination: str = Field(description="终点坐标，格式 '经度,纬度'")
    strategy: Optional[str] = Field(
        default="fastest",
        description="驾车策略: fastest(速度优先), shortest(距离优先), no_highway(不走高速), no_toll(避免收费), real_traffic(实时路况)"
    )
    waypoints: Optional[list] = Field(default=None, description="途经点坐标列表")


class DrivingRouteResponse(BaseModel):
    """驾车路线规划响应"""
    success: bool = Field(default=True)
    origin: str = Field(default="", description="起点坐标")
    destination: str = Field(default="", description="终点坐标")
    distance_km: float = Field(default=0, description="总距离(公里)")
    duration_text: str = Field(default="", description="预计时间(可读)")
    duration_seconds: int = Field(default=0, description="预计时间(秒)")
    tolls_yuan: int = Field(default=0, description="过路费(元)")
    taxi_cost: Optional[float] = Field(default=None, description="打车费用估算(元)")
    steps: list = Field(default=[], description="路线步骤")
    message: Optional[str] = None


class DistanceRequest(BaseModel):
    """两地距离查询请求"""
    from_address: str = Field(description="出发地址")
    to_address: str = Field(description="目的地地址")
    from_city: Optional[str] = Field(default=None, description="出发城市")
    to_city: Optional[str] = Field(default=None, description="目的城市")
    strategy: Optional[str] = Field(default="fastest", description="驾车策略")


class DistanceResponse(BaseModel):
    """两地距离查询响应"""
    success: bool = Field(default=True)
    from_info: dict = Field(default={}, description="出发地信息")
    to_info: dict = Field(default={}, description="目的地信息")
    route: dict = Field(default={}, description="路线信息")
    taxi_cost: Optional[float] = Field(default=None, description="打车费用估算(元)")
    message: Optional[str] = None


# ==================== 用户相关模型 ====================

class UserRegisterRequest(BaseModel):
    """用户注册请求"""
    username: str = Field(min_length=2, max_length=20, description="用户名")
    password: str = Field(min_length=6, description="密码")


class UserLoginRequest(BaseModel):
    """用户登录请求"""
    username: str = Field(description="用户名")
    password: str = Field(description="密码")


class UserResponse(BaseModel):
    """用户信息响应"""
    success: bool = Field(default=True)
    user: Optional[dict] = Field(default=None, description="用户信息")
    message: Optional[str] = None


class UserPreferences(BaseModel):
    """用户偏好设置"""
    default_direction: Optional[str] = Field(default=None, description="默认方向偏好")
    default_style: Optional[str] = Field(default=None, description="默认旅行风格")
    default_departure_time: Optional[str] = Field(default=None, description="默认出发时间")
    city: Optional[str] = Field(default=None, description="常驻城市")
    travel_budget: Optional[str] = Field(default=None, description="旅行预算")
    companion_pref: Optional[str] = Field(default=None, description="同行偏好")
    scenery_types: Optional[List[str]] = Field(default=[], description="喜欢的风景类型")
    activity_types: Optional[List[str]] = Field(default=[], description="喜欢的活动类型")
    music_pref: Optional[str] = Field(default=None, description="音乐偏好")
    dietary_note: Optional[str] = Field(default=None, description="饮食备注")
    notes: Optional[str] = Field(default=None, description="个人备注")


class UserPreferencesResponse(BaseModel):
    """用户偏好响应"""
    success: bool = Field(default=True)
    preferences: Optional[UserPreferences] = Field(default=None, description="用户偏好")
    message: Optional[str] = None