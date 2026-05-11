# -*- coding: utf-8 -*-
"""
浙里Trip - FastAPI 应用入口
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .config import settings
from .routes import router


# 创建FastAPI应用
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="小众放空式自驾旅行Agent - 浙里Trip 后端服务",
    docs_url="/docs" if settings.APP_ENV == "dev" else None,
    redoc_url="/redoc" if settings.APP_ENV == "dev" else None,
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(router)


# 首页
@app.get("/")
async def root():
    """API首页"""
    return JSONResponse({
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "status": "running",
        "docs": "/docs" if settings.APP_ENV == "dev" else "disabled",
        "endpoints": {
            "health": "/health",
            "travel_plan": "/api/v1/travel/plan",
            "destinations": "/api/v1/travel/destinations",
            "llm_chat": "/api/v1/llm/chat",
            "amap_geocode": "/api/v1/amap/geocode",
            "amap_regeocode": "/api/v1/amap/regeocode",
            "amap_driving": "/api/v1/amap/driving",
            "amap_distance": "/api/v1/amap/distance",
        }
    })


# 启动提示
if __name__ == "__main__":
    import uvicorn
    print(f"""
    ╔════════════════════════════════════════════════════════════╗
    ║                                                            ║
    ║   🏔️  浙里Trip - 小众放空式自驾旅行Agent                   ║
    ║                                                            ║
    ║   版本: {settings.APP_VERSION:<43}║
    ║   环境: {settings.APP_ENV:<43}║
    ║   LLM:  {settings.LLM_PROVIDER} ({settings.BIGMODEL_MODEL}){' ' * 25}║
    ║                                                            ║
    ║   🌐 http://localhost:{settings.APP_PORT}                               ║
    ║   📖 http://localhost:{settings.APP_PORT}/docs                         ║
    ║                                                            ║
    ╚════════════════════════════════════════════════════════════╝
    """)
    
    uvicorn.run(
        "app.main:app",
        host=settings.APP_HOST,
        port=settings.APP_PORT,
        reload=settings.APP_ENV == "dev"
    )