# -*- coding: utf-8 -*-
"""
浙里Trip - 高德地图服务模块

提供地理编码、逆地理编码、驾车路线规划等功能。
使用高德地图 Web 服务 REST API。

API文档: https://lbs.amap.com/api/webservice/guide/api/georegeo
"""

import requests
from typing import Optional, List, Tuple
from dataclasses import dataclass

from .config import settings


# ==================== 数据类 ====================

@dataclass
class GeocodeResult:
    """地理编码结果"""
    formatted_address: str      # 格式化地址
    province: str               # 省份
    city: str                   # 城市
    district: str               # 区县
    location: str               # 经纬度 "lng,lat"
    level: str                  # 匹配级别


@dataclass
class AddressComponent:
    """地址组成部分"""
    province: str               # 省份
    city: str                   # 城市
    district: str               # 区县
    township: str               # 乡镇
    street: str                 # 街道
    street_number: str          # 门牌号


@dataclass
class ReGeocodeResult:
    """逆地理编码结果"""
    formatted_address: str      # 格式化地址
    address_component: AddressComponent  # 地址组成部分
    pois: list                  # 周边POI


@dataclass
class DrivingStep:
    """驾车路线步骤"""
    instruction: str            # 导航指示
    road: str                   # 道路名称
    distance: int               # 此段距离(米)
    time: int                   # 此段预计时间(秒)
    action: str                 # 完成动作
    orientation: str            # 方向


@dataclass
class DrivingRoute:
    """驾车路线结果"""
    distance: int               # 总距离(米)
    time: int                   # 预计时间(秒)
    tolls: int                  # 过路费(元)
    tolls_distance: int         # 收费路段长度(米)
    traffic_lights: int         # 红绿灯数量
    steps: List[DrivingStep]    # 路线步骤


@dataclass
class DrivingResult:
    """驾车路线规划结果"""
    origin: str                 # 起点坐标
    destination: str            # 终点坐标
    routes: List[DrivingRoute]  # 路线列表(通常1条)
    taxi_cost: Optional[float]  # 打车费用估算(元)


# ==================== 错误类 ====================

class AmapError(Exception):
    """高德API错误"""
    def __init__(self, infocode: str, info: str):
        self.infocode = infocode
        self.info = info
        super().__init__(f"高德API错误 [{infocode}]: {info}")


# ==================== 服务类 ====================

class AmapService:
    """
    高德地图 Web 服务
    
    封装高德地图 REST API，提供地理编码、逆地理编码、驾车路线规划功能。
    """
    
    BASE_URL = "https://restapi.amap.com/v3"
    
    # 驾车策略映射
    DRIVING_POLICIES = {
        "fastest": 0,       # 速度优先（默认）
        "shortest": 1,      # 距离优先
        "no_highway": 2,    # 不走高速
        "no_toll": 3,       # 避免收费
        "no_highway_toll": 4,  # 不走高速且避免收费
        "real_traffic": 5,  # 考虑实时路况
    }
    
    def __init__(self, api_key: Optional[str] = None):
        """
        初始化高德地图服务
        
        Args:
            api_key: 高德Web服务Key，不传则从配置读取
        """
        self.api_key = api_key or settings.AMAP_API_KEY
        if not self.api_key:
            raise ValueError(
                "高德地图API Key未配置。"
                "请设置环境变量 AMAP_API_KEY 或在 .env 文件中配置。"
            )
        self.session = requests.Session()
        self.session.headers.update({
            "Content-Type": "application/json",
        })
    
    def _build_params(self, **kwargs) -> dict:
        """构建请求参数，自动添加key"""
        params = {"key": self.api_key}
        params.update({k: v for k, v in kwargs.items() if v is not None})
        return params
    
    def _check_response(self, data: dict) -> None:
        """检查API响应状态"""
        status = data.get("status")
        infocode = data.get("infocode", "")
        info = data.get("info", "")
        
        if status != "1":
            raise AmapError(infocode, info)
    
    # ==================== 地理编码 ====================
    
    def geocode(
        self, 
        address: str, 
        city: Optional[str] = None
    ) -> List[GeocodeResult]:
        """
        地理编码：将地址转换为经纬度坐标
        
        Args:
            address: 结构化地址，如 "北京市朝阳区阜通东大街6号"
            city: 城市（可选），可提高编码精度
            
        Returns:
            地理编码结果列表
            
        Raises:
            AmapError: API调用失败时抛出
        """
        params = self._build_params(
            address=address,
            city=city,
        )
        
        response = self.session.get(
            f"{self.BASE_URL}/geocode/geo",
            params=params,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        self._check_response(data)
        
        results = []
        for geocode in data.get("geocodes", []):
            location = geocode.get("location", "")
            results.append(GeocodeResult(
                formatted_address=geocode.get("formatted_address", ""),
                province=geocode.get("province", ""),
                city=geocode.get("city", "") if isinstance(geocode.get("city"), str) else "",
                district=geocode.get("district", ""),
                location=location,
                level=geocode.get("level", ""),
            ))
        
        return results
    
    def geocode_simple(
        self, 
        address: str, 
        city: Optional[str] = None
    ) -> Optional[Tuple[float, float]]:
        """
        地理编码简化版：返回第一个结果的经纬度坐标
        
        Args:
            address: 结构化地址
            city: 城市（可选）
            
        Returns:
            (经度, 纬度) 元组，无结果时返回 None
        """
        results = self.geocode(address, city)
        if not results:
            return None
        
        lng, lat = results[0].location.split(",")
        return float(lng), float(lat)
    
    # ==================== 逆地理编码 ====================
    
    def regeocode(
        self, 
        location: str,
        radius: int = 1000,
        extensions: str = "base"
    ) -> ReGeocodeResult:
        """
        逆地理编码：将经纬度坐标转换为地址
        
        Args:
            location: 经纬度坐标，格式 "经度,纬度" 如 "116.397428,39.90923"
            radius: 搜索半径(米)，范围 0-3000，默认 1000
            extensions: 返回信息详略，"base" 基本 / "all" 详细
            
        Returns:
            逆地理编码结果
            
        Raises:
            AmapError: API调用失败时抛出
        """
        params = self._build_params(
            location=location,
            radius=radius,
            extensions=extensions,
        )
        
        response = self.session.get(
            f"{self.BASE_URL}/geocode/regeo",
            params=params,
            timeout=10,
        )
        response.raise_for_status()
        data = response.json()
        self._check_response(data)
        
        regeocode = data.get("regeocode", {})
        address_component = regeocode.get("addressComponent", {})
        
        # 解析地址组成部分
        component = AddressComponent(
            province=address_component.get("province", ""),
            city=address_component.get("city", "") if isinstance(address_component.get("city"), str) else "",
            district=address_component.get("district", ""),
            township=address_component.get("township", ""),
            street=address_component.get("streetNumber", {}).get("street", "") if isinstance(address_component.get("streetNumber"), dict) else "",
            street_number=address_component.get("streetNumber", {}).get("number", "") if isinstance(address_component.get("streetNumber"), dict) else "",
        )
        
        # 解析周边POI
        pois = []
        for poi in regeocode.get("pois", []):
            pois.append({
                "name": poi.get("name", ""),
                "type": poi.get("type", ""),
                "distance": poi.get("distance", ""),
                "location": poi.get("location", ""),
            })
        
        return ReGeocodeResult(
            formatted_address=regeocode.get("formattedAddress", ""),
            address_component=component,
            pois=pois,
        )
    
    def regeocode_simple(
        self, 
        lng: float, 
        lat: float
    ) -> str:
        """
        逆地理编码简化版：返回格式化地址字符串
        
        Args:
            lng: 经度
            lat: 纬度
            
        Returns:
            格式化地址字符串
        """
        location = f"{lng},{lat}"
        result = self.regeocode(location)
        return result.formatted_address
    
    # ==================== 驾车路线规划 ====================
    
    def driving(
        self,
        origin: str,
        destination: str,
        strategy: Optional[str] = None,
        waypoints: Optional[List[str]] = None,
        extensions: str = "base",
    ) -> DrivingResult:
        """
        驾车路线规划
        
        Args:
            origin: 起点坐标，格式 "经度,纬度"
            destination: 终点坐标，格式 "经度,纬度"
            strategy: 驾车策略，可选值:
                - "fastest": 速度优先（默认）
                - "shortest": 距离优先
                - "no_highway": 不走高速
                - "no_toll": 避免收费
                - "no_highway_toll": 不走高速且避免收费
                - "real_traffic": 考虑实时路况
            waypoints: 途经点坐标列表，格式 ["lng,lat", ...]，最多16个
            extensions: 返回信息详略，"base" 基本 / "all" 详细(含步骤)
            
        Returns:
            驾车路线规划结果
            
        Raises:
            AmapError: API调用失败时抛出
        """
        # 转换策略
        strategy_num = None
        if strategy:
            strategy_num = self.DRIVING_POLICIES.get(strategy)
            if strategy_num is None:
                raise ValueError(
                    f"无效的驾车策略: {strategy}。"
                    f"可选值: {', '.join(self.DRIVING_POLICIES.keys())}"
                )
        
        # 构建途经点
        waypoints_str = None
        if waypoints:
            waypoints_str = "|".join(waypoints)
        
        params = self._build_params(
            origin=origin,
            destination=destination,
            strategy=strategy_num,
            waypoints=waypoints_str,
            extensions=extensions,
        )
        
        response = self.session.get(
            f"{self.BASE_URL}/direction/driving",
            params=params,
            timeout=15,
        )
        response.raise_for_status()
        data = response.json()
        self._check_response(data)
        
        route_data = data.get("route", {})
        
        # 解析路线
        routes = []
        for route in route_data.get("paths", []):
            steps = []
            for step in route.get("steps", []):
                steps.append(DrivingStep(
                    instruction=step.get("instruction", ""),
                    road=step.get("road", ""),
                    distance=int(step.get("distance", 0)),
                    time=int(step.get("time", 0)),
                    action=step.get("action", ""),
                    orientation=step.get("orientation", ""),
                ))
            
            routes.append(DrivingRoute(
                distance=int(route.get("distance", 0)),
                time=int(route.get("time", 0) or 0),
                tolls=int(route.get("tolls", 0) or 0),
                tolls_distance=int(route.get("tolls_distance", 0) or 0),
                traffic_lights=int(route.get("traffic_lights", 0) or 0),
                steps=steps,
            ))
        
        # 解析打车费用
        taxi_cost = route_data.get("taxi_cost")
        if taxi_cost:
            taxi_cost = float(taxi_cost)
        
        return DrivingResult(
            origin=route_data.get("origin", ""),
            destination=route_data.get("destination", ""),
            routes=routes,
            taxi_cost=taxi_cost,
        )
    
    def driving_simple(
        self,
        origin_lng: float,
        origin_lat: float,
        dest_lng: float,
        dest_lat: float,
        strategy: str = "fastest",
    ) -> dict:
        """
        驾车路线规划简化版：返回距离、时间、过路费
        
        Args:
            origin_lng: 起点经度
            origin_lat: 起点纬度
            dest_lng: 终点经度
            dest_lat: 终点纬度
            strategy: 驾车策略
            
        Returns:
            包含 distance_km, duration_text, tolls_yuan 的字典
        """
        origin = f"{origin_lng},{origin_lat}"
        destination = f"{dest_lng},{dest_lat}"
        
        result = self.driving(origin, destination, strategy=strategy, extensions="all")
        
        if not result.routes:
            return {
                "distance_km": 0,
                "duration_text": "未知",
                "duration_seconds": 0,
                "tolls_yuan": 0,
            }
        
        route = result.routes[0]
        distance_km = route.distance / 1000
        duration_seconds = route.time
        
        # API未返回时间时，根据距离估算（按平均40km/h）
        if not duration_seconds or duration_seconds <= 0:
            duration_seconds = int(distance_km / 40 * 3600)
        
        # 格式化时间
        hours = duration_seconds // 3600
        minutes = (duration_seconds % 3600) // 60
        if hours > 0:
            duration_text = f"{hours}小时{minutes}分钟"
        else:
            duration_text = f"{minutes}分钟"
        
        return {
            "distance_km": round(distance_km, 1),
            "duration_text": duration_text,
            "duration_seconds": duration_seconds,
            "tolls_yuan": route.tolls,
        }
    
    # ==================== 便捷方法 ====================
    
    def get_driving_info(
        self,
        from_address: str,
        to_address: str,
        from_city: Optional[str] = None,
        to_city: Optional[str] = None,
        strategy: str = "fastest",
    ) -> dict:
        """
        一站式获取两地之间的驾车信息（地址 → 路线）
        
        先将地址转换为坐标，再进行驾车路线规划。
        
        Args:
            from_address: 出发地址
            to_address: 目的地地址
            from_city: 出发城市（可选，提高精度）
            to_city: 目的城市（可选，提高精度）
            strategy: 驾车策略
            
        Returns:
            包含 from_location, to_location, route 信息的字典
        """
        # 1. 地理编码
        from_results = self.geocode(from_address, from_city)
        to_results = self.geocode(to_address, to_city)
        
        if not from_results:
            raise ValueError(f"无法定位出发地址: {from_address}")
        if not to_results:
            raise ValueError(f"无法定位目的地地址: {to_address}")
        
        from_loc = from_results[0]
        to_loc = to_results[0]
        
        # 2. 驾车路线规划
        driving_result = self.driving(
            from_loc.location,
            to_loc.location,
            strategy=strategy,
        )
        
        # 3. 构建返回
        route = driving_result.routes[0] if driving_result.routes else None
        
        # 计算时间（API可能不返回time字段）
        duration_seconds = route.time if route and route.time else 0
        distance_km = round(route.distance / 1000, 1) if route else 0
        if not duration_seconds and distance_km:
            duration_seconds = int(distance_km / 40 * 3600)
        
        return {
            "from": {
                "address": from_loc.formatted_address,
                "location": from_loc.location,
                "province": from_loc.province,
                "city": from_loc.city,
                "district": from_loc.district,
            },
            "to": {
                "address": to_loc.formatted_address,
                "location": to_loc.location,
                "province": to_loc.province,
                "city": to_loc.city,
                "district": to_loc.district,
            },
            "route": {
                "distance_km": distance_km,
                "duration_text": self._format_duration(duration_seconds) if route else "未知",
                "duration_seconds": duration_seconds,
                "tolls_yuan": route.tolls if route else 0,
                "tolls_distance_km": round(route.tolls_distance / 1000, 1) if route and route.tolls_distance else 0,
                "traffic_lights": route.traffic_lights if route else 0,
                "steps_count": len(route.steps) if route else 0,
            } if route else None,
            "taxi_cost": driving_result.taxi_cost,
        }
    
    def get_distance(
        self,
        from_address: str,
        to_address: str,
        from_city: Optional[str] = None,
        to_city: Optional[str] = None,
    ) -> dict:
        """
        获取两地距离和时间（简化版）
        
        Args:
            from_address: 出发地址
            to_address: 目的地地址
            from_city: 出发城市（可选）
            to_city: 目的城市（可选）
            
        Returns:
            包含 distance, duration 的字典
        """
        info = self.get_driving_info(from_address, to_address, from_city, to_city)
        return {
            "distance": f"{info['route']['distance_km']}km",
            "duration": info["route"]["duration_text"],
            "distance_km": info["route"]["distance_km"],
            "duration_seconds": info["route"]["duration_seconds"],
        }
    
    @staticmethod
    def _format_duration(seconds: int) -> str:
        """格式化秒数为可读时间"""
        hours = seconds // 3600
        minutes = (seconds % 3600) // 60
        if hours > 0:
            return f"{hours}小时{minutes}分钟"
        return f"{minutes}分钟"
    
    def close(self):
        """关闭HTTP会话"""
        self.session.close()


# ==================== 单例 ====================

_amap_service: Optional[AmapService] = None


def get_amap_service() -> AmapService:
    """获取高德地图服务单例"""
    global _amap_service
    if _amap_service is None:
        _amap_service = AmapService()
    return _amap_service
