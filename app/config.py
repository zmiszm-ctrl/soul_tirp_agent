# -*- coding: utf-8 -*-
"""
浙里Trip - FastAPI 应用配置
"""

from pydantic_settings import BaseSettings
from typing import Optional
import os


class Settings(BaseSettings):
    """应用配置"""
    
    # 应用配置
    APP_NAME: str = "浙里Trip - 小众放空式自驾旅行Agent"
    APP_VERSION: str = "1.0.0"
    APP_ENV: str = "dev"
    APP_HOST: str = "0.0.0.0"
    APP_PORT: int = 8000
    
    # LLM配置
    LLM_PROVIDER: str = "auto"  # auto | deepseek | bigmodel
    DEEPSEEK_API_KEY: str = ""
    DEEPSEEK_MODEL: str = "deepseek-v4-flash"
    BIGMODEL_API_KEY: str = ""
    BIGMODEL_MODEL: str = "glm-4.5-air"
    
    # 高德地图配置
    AMAP_API_KEY: str = ""  # 高德Web服务Key
    
    # CORS配置
    CORS_ORIGINS: list = ["*"]
    
    # 数据库配置 (可选，后续扩展)
    DATABASE_URL: Optional[str] = None
    
    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()


def get_settings() -> Settings:
    """获取配置单例"""
    return settings