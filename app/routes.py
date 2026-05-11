# -*- coding: utf-8 -*-
"""
浙里Trip - API路由
"""

from fastapi import APIRouter, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from typing import Optional
import json

from .models import (
    TravelPlanRequest,
    TravelPlanResponse,
    TravelPlan,
    Destination,
    Moment,
    BgmRecommendation,
    HealthResponse,
    RichPlanRequest,
    RichPlanResponse,
    GeocodeRequest,
    GeocodeResponse,
    ReGeocodeRequest,
    ReGeocodeResponse,
    DrivingRouteRequest,
    DrivingRouteResponse,
    DistanceRequest,
    DistanceResponse,
)
from .llm_service import get_llm_manager, generate_rich_plan
from .amap_service import get_amap_service, AmapService, AmapError
from .config import settings


router = APIRouter()


# ==================== 健康检查 ====================

@router.get("/health", response_model=HealthResponse)
async def health_check():
    """健康检查接口"""
    return HealthResponse(
        version=settings.APP_VERSION,
        llm_provider=settings.LLM_PROVIDER,
        llm_model=settings.BIGMODEL_MODEL
    )


# ==================== 旅程规划 ====================

@router.get("/api/v1/travel/destinations")
async def get_destinations():
    """获取可用目的地列表"""
    # 从mock数据返回
    destinations = [
        {"name": "安吉", "direction": "any", "style": "relax"},
        {"name": "桐庐", "direction": "any", "style": "slow"},
        {"name": "丽水", "direction": "south", "style": "explore"},
        {"name": "德清", "direction": "north", "style": "nature"},
        {"name": "嵊泗", "direction": "east", "style": "relax"},
        {"name": "象山", "direction": "east", "style": "slow"},
        {"name": "永嘉", "direction": "south", "style": "nature"},
        {"name": "开化", "direction": "west", "style": "explore"},
        {"name": "仙居", "direction": "south", "style": "relax"},
        {"name": "缙云", "direction": "west", "style": "slow"},
    ]
    return {"success": True, "data": destinations}


@router.post("/api/v1/travel/plan", response_model=TravelPlanResponse)
async def generate_travel_plan(request: TravelPlanRequest):
    """
    生成旅行攻略
    
    根据用户的偏好（方向、风格、出发时间），生成一份小众放空式旅行攻略。
    优先使用glm-4.5-air模型生成。
    """
    try:
        llm = get_llm_manager()
        
        # 调用LLM生成旅程
        result = llm.generate_travel_plan(
            direction=request.direction,
            style=request.style,
            departure_time=request.departure_time,
            location=request.location or "浙江"
        )
        
        # 构建响应
        if "raw_content" in result:
            # 返回原始内容（解析失败时的降级）
            return TravelPlanResponse(
                success=True,
                plan=TravelPlan(
                    destination=Destination(
                        name="安吉",
                        subtitle="一个适合慢下来的地方",
                        description="你会在三小时后抵达。那里没有人等你，也没有人催你。只有风，和刚刚好的时间。",
                        distance="287km",
                        duration="3小时12分钟",
                        suggested_time="周六 06:30",
                        image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
                        direction_label=result.get("direction_label", "四方皆宜")
                    ),
                    moments=[
                        Moment(
                            time="清晨 6:40",
                            title="在空无一人的竹林里散步",
                            description="呼吸着带着露水的空气，阳光从竹叶间洒下来",
                            image="https://images.unsplash.com/photo-1519681393784-d120267933ba?w=400&q=80"
                        ),
                        Moment(
                            time="午后",
                            title="一家没有菜单的咖啡店",
                            description="老板只做他想做的那一杯，和他聊聊这里的故事",
                            image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80"
                        ),
                        Moment(
                            time="傍晚 18:30",
                            title="在湖边看日落发呆",
                            description="什么都不用想，就让时间慢慢流过",
                            image="https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=400&q=80"
                        )
                    ],
                    bgm=BgmRecommendation(
                        title="平凡之路",
                        artist="朴树",
                        description="适合放空的公路音乐"
                    ),
                    atmosphere="★★★★☆"
                ),
                message="生成成功（降级模式）"
            )
        
        # 正常构建
        dest_data = result.get("destination", {})
        moments_data = result.get("moments", [])
        bgm_data = result.get("bgm", {})
        
        plan = TravelPlan(
            destination=Destination(
                name=dest_data.get("name", "安吉"),
                subtitle=dest_data.get("subtitle", "一个适合慢下来的地方"),
                description=dest_data.get("description", "你会在三小时后抵达..."),
                distance=dest_data.get("distance", "280km"),
                duration=dest_data.get("duration", "3小时"),
                suggested_time=dest_data.get("suggested_time", "周六 06:30"),
                image=dest_data.get("image", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"),
                direction_label=result.get("direction_label", "四方皆宜")
            ),
            moments=[
                Moment(
                    time=m.get("time", "待定"),
                    title=m.get("title", ""),
                    description=m.get("description", ""),
                    image=m.get("image", "")
                )
                for m in moments_data
            ],
            bgm=BgmRecommendation(
                title=bgm_data.get("title", "平凡之路"),
                artist=bgm_data.get("artist", "朴树"),
                description=bgm_data.get("description", "适合放空的公路音乐")
            ) if bgm_data else None,
            atmosphere=result.get("atmosphere", "★★★★☆")
        )
        
        return TravelPlanResponse(
            success=True,
            plan=plan,
            message="生成成功"
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成旅行攻略失败: {str(e)}")


@router.get("/api/v1/travel/plan/{plan_id}")
async def get_travel_plan(plan_id: str):
    """获取旅行攻略详情"""
    # MVP阶段暂不支持存储，后续接入数据库
    return {
        "success": False,
        "message": "MVP阶段暂不支持此功能，请使用同一次会话生成的攻略"
    }


@router.post("/api/v1/travel/reroll")
async def reroll_travel_plan(request: TravelPlanRequest):
    """
    重新生成旅行攻略（用户点击"换一个地方"）
    
    MVP阶段限制：每用户每天最多3次
    """
    return await generate_travel_plan(request)


# ==================== 丰富内容生成 ====================

@router.post("/api/v1/travel/rich-plan", response_model=RichPlanResponse)
async def generate_rich_travel_plan(request: RichPlanRequest):
    """
    生成丰富的旅行攻略（含风格化HTML邀请函）
    
    接收用户位置、卦象等信息，通过LLM生成完整的旅行攻略和HTML邀请函。
    """
    try:
        # 构建距离信息字符串
        distance_str = ""
        if request.distance_info:
            distance_str = f"距离{request.distance_info.distance}，车程{request.distance_info.duration}"

        # 构建用户位置字符串
        user_loc_str = ""
        if request.user_location:
            user_loc_str = f"{request.user_location.city}{request.user_location.district}"

        # 构建卦象信息
        hexagram_name = request.hexagram.name if request.hexagram else ""
        hexagram_meaning = request.hexagram.meaning if request.hexagram else ""
        hexagram_travel_hint = ""
        if request.hexagram and request.hexagram.lines:
            # 根据卦象给出旅行提示
            from .utils.hexagram import get_travel_hint
            hexagram_travel_hint = get_travel_hint(request.hexagram.name)

        # 调用LLM生成丰富内容
        result = generate_rich_plan(
            direction=request.direction,
            style=request.style,
            departure_time=request.departure_time,
            user_location=user_loc_str,
            destination_name=request.destination_name or "",
            distance_info=distance_str,
            hexagram_name=hexagram_name,
            hexagram_meaning=hexagram_meaning,
            hexagram_travel_hint=hexagram_travel_hint,
        )

        # 处理降级模式
        if "raw_content" in result:
            # 降级到Mock数据
            return RichPlanResponse(
                plan=TravelPlan(
                    destination=Destination(
                        name="安吉",
                        subtitle="一个适合慢下来的地方",
                        description="你会在三小时后抵达。那里没有人等你，也没有人催你。只有风，和刚刚好的时间。",
                        distance="287km",
                        duration="3小时12分钟",
                        suggested_time="周六 06:30",
                        image="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80",
                        direction_label="四方皆宜"
                    ),
                    moments=[
                        Moment(time="清晨 6:40", title="在空无一人的竹林里散步", description="呼吸着带着露水的空气", image="https://images.unsplash.com/photo-1513836279014-a89f7a76ae86?w=400&q=80"),
                        Moment(time="午后", title="一家没有菜单的咖啡店", description="老板只做他想做的那一杯", image="https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&q=80"),
                        Moment(time="傍晚 18:30", title="在湖边看日落发呆", description="太阳落得很慢，像你此刻的心情", image="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80"),
                    ],
                    bgm=BgmRecommendation(title="Mystery of Love", artist="Sufjan Stevens", description="像夏日午后的一场白日梦"),
                    atmosphere="竹林清风，慢下来的勇气"
                ),
                invitation_html=result.get("invitation_html", ""),
                hexagram_name=hexagram_name,
                hexagram_interpretation=hexagram_meaning,
                message="生成成功（降级模式）"
            )

        # 正常构建响应
        dest_data = result.get("destination", {})
        moments_data = result.get("moments", [])
        bgm_data = result.get("bgm", {})

        # 距离/时间：优先使用高德API真实数据，LLM返回值仅作兜底
        final_distance = dest_data.get("distance", "280km")
        final_duration = dest_data.get("duration", "3小时")
        if request.distance_info and request.distance_info.distance:
            final_distance = request.distance_info.distance
        if request.distance_info and request.distance_info.duration:
            final_duration = request.distance_info.duration

        plan = TravelPlan(
            destination=Destination(
                name=dest_data.get("name", "安吉"),
                subtitle=dest_data.get("subtitle", "一个适合慢下来的地方"),
                description=dest_data.get("description", ""),
                distance=final_distance,
                duration=final_duration,
                suggested_time=dest_data.get("suggested_time", "周六 06:30"),
                image=dest_data.get("image", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80"),
                direction_label=dest_data.get("direction_label", "四方皆宜")
            ),
            moments=[
                Moment(
                    time=m.get("time", "待定"),
                    title=m.get("title", ""),
                    description=m.get("description", ""),
                    image=m.get("image", "")
                )
                for m in moments_data
            ],
            bgm=BgmRecommendation(
                title=bgm_data.get("title", "平凡之路"),
                artist=bgm_data.get("artist", "朴树"),
                description=bgm_data.get("description", "适合放空的公路音乐")
            ) if bgm_data else None,
            atmosphere=result.get("atmosphere", "★★★★☆")
        )

        return RichPlanResponse(
            success=True,
            plan=plan,
            invitation_html=result.get("invitation_html", ""),
            hexagram_name=hexagram_name,
            hexagram_interpretation=hexagram_meaning,
            message="生成成功"
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"生成丰富旅行攻略失败: {str(e)}")


# ==================== 高德地图服务 ====================

@router.post("/api/v1/amap/geocode", response_model=GeocodeResponse)
async def amap_geocode(request: GeocodeRequest):
    """
    地理编码：将地址转换为经纬度坐标
    
    根据输入的地址，返回对应的经纬度坐标信息。
    """
    try:
        amap = get_amap_service()
        results = amap.geocode(request.address, request.city)
        
        return GeocodeResponse(
            success=True,
            results=[
                {
                    "formatted_address": r.formatted_address,
                    "province": r.province,
                    "city": r.city,
                    "district": r.district,
                    "location": r.location,
                    "level": r.level,
                }
                for r in results
            ],
            message="地理编码成功"
        )
    except AmapError as e:
        return GeocodeResponse(success=False, results=[], message=f"地理编码失败: {e.info}")
    except ValueError as e:
        return GeocodeResponse(success=False, results=[], message=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"地理编码失败: {str(e)}")


@router.post("/api/v1/amap/regeocode", response_model=ReGeocodeResponse)
async def amap_regeocode(request: ReGeocodeRequest):
    """
    逆地理编码：将经纬度坐标转换为地址
    
    根据输入的经纬度坐标，返回详细的地址信息。
    """
    try:
        amap = get_amap_service()
        location = f"{request.lng},{request.lat}"
        result = amap.regeocode(location, radius=request.radius)
        
        return ReGeocodeResponse(
            success=True,
            address=result.formatted_address,
            province=result.address_component.province,
            city=result.address_component.city,
            district=result.address_component.district,
            township=result.address_component.township,
            pois=result.pois,
            message="逆地理编码成功"
        )
    except AmapError as e:
        return ReGeocodeResponse(success=False, message=f"逆地理编码失败: {e.info}")
    except ValueError as e:
        return ReGeocodeResponse(success=False, message=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"逆地理编码失败: {str(e)}")


@router.post("/api/v1/amap/driving", response_model=DrivingRouteResponse)
async def amap_driving(request: DrivingRouteRequest):
    """
    驾车路线规划
    
    根据起终点坐标，规划驾车路线，返回距离、时间、过路费等信息。
    """
    try:
        amap = get_amap_service()
        result = amap.driving(
            origin=request.origin,
            destination=request.destination,
            strategy=request.strategy,
            waypoints=request.waypoints,
            extensions="all",
        )
        
        if not result.routes:
            return DrivingRouteResponse(
                success=False,
                message="未找到可用路线"
            )
        
        route = result.routes[0]
        
        # 计算时间（API可能不返回time字段）
        duration_seconds = route.time if route.time else 0
        distance_km = round(route.distance / 1000, 1)
        if not duration_seconds and distance_km:
            duration_seconds = int(distance_km / 40 * 3600)
        
        return DrivingRouteResponse(
            success=True,
            origin=result.origin,
            destination=result.destination,
            distance_km=distance_km,
            duration_text=AmapService._format_duration(duration_seconds),
            duration_seconds=duration_seconds,
            tolls_yuan=route.tolls,
            taxi_cost=result.taxi_cost,
            steps=[
                {
                    "instruction": s.instruction,
                    "road": s.road,
                    "distance": s.distance,
                    "time": s.time,
                    "action": s.action,
                    "orientation": s.orientation,
                }
                for s in route.steps
            ],
            message="驾车路线规划成功"
        )
    except AmapError as e:
        return DrivingRouteResponse(success=False, message=f"驾车路线规划失败: {e.info}")
    except ValueError as e:
        return DrivingRouteResponse(success=False, message=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"驾车路线规划失败: {str(e)}")


@router.post("/api/v1/amap/distance", response_model=DistanceResponse)
async def amap_distance(request: DistanceRequest):
    """
    一站式两地距离查询
    
    输入两个地址，自动地理编码后计算驾车距离和时间。
    """
    try:
        amap = get_amap_service()
        info = amap.get_driving_info(
            from_address=request.from_address,
            to_address=request.to_address,
            from_city=request.from_city,
            to_city=request.to_city,
            strategy=request.strategy,
        )
        
        return DistanceResponse(
            success=True,
            from_info=info["from"],
            to_info=info["to"],
            route=info["route"],
            taxi_cost=info.get("taxi_cost"),
            message="距离查询成功"
        )
    except AmapError as e:
        return DistanceResponse(success=False, message=f"距离查询失败: {e.info}")
    except ValueError as e:
        return DistanceResponse(success=False, message=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"距离查询失败: {str(e)}")


# ==================== LLM测试 ====================

@router.get("/api/v1/llm/models")
async def get_available_models():
    """获取可用的LLM模型列表"""
    return {
        "success": True,
        "data": {
            "current_provider": settings.LLM_PROVIDER,
            "models": {
                "bigmodel": ["glm-4.5-air", "glm-5.1", "glm-4.7", "glm-4.7-flash"],
                "deepseek": ["deepseek-v4-flash", "deepseek-v4-pro"]
            }
        }
    }


@router.post("/api/v1/llm/chat")
async def llm_chat(
    message: str,
    provider: Optional[str] = None,
    model: Optional[str] = None
):
    """
    LLM对话测试接口
    
    用于测试各模型的可访问性
    """
    try:
        llm = get_llm_manager(provider)
        messages = [
            {"role": "system", "content": "你是一个友好的旅行助手"},
            {"role": "user", "content": message}
        ]
        response = llm.chat(messages, model=model)
        return {"success": True, "response": response}
    except Exception as e:
        return {"success": False, "error": str(e)}