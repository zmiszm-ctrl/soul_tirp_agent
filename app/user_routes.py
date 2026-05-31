# -*- coding: utf-8 -*-
"""
浙里Trip - 用户API路由
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse
from typing import Optional
import json
import hashlib
import os

from .models import (
    UserRegisterRequest,
    UserLoginRequest,
    UserResponse,
    UserPreferences,
    UserPreferencesResponse,
)
from .database import get_db


router = APIRouter(prefix="/api/v1/user", tags=["用户"])


def hash_password(password: str) -> str:
    """哈希密码"""
    salt = os.urandom(32)
    key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
    return salt.hex() + ':' + key.hex()


def verify_password(password: str, stored_hash: str) -> bool:
    """验证密码"""
    try:
        salt_hex, key_hex = stored_hash.split(':')
        salt = bytes.fromhex(salt_hex)
        key = bytes.fromhex(key_hex)
        new_key = hashlib.pbkdf2_hmac('sha256', password.encode('utf-8'), salt, 100000)
        return new_key == key
    except Exception:
        return False


# ==================== 注册 ====================

@router.post("/register", response_model=UserResponse)
async def register(request: UserRegisterRequest):
    """用户注册"""
    try:
        with get_db() as conn:
            # 检查用户名是否已存在
            existing = conn.execute(
                "SELECT id FROM users WHERE username = ?",
                (request.username,)
            ).fetchone()
            
            if existing:
                return UserResponse(
                    success=False,
                    message="用户名已存在"
                )
            
            # 创建用户
            password_hash = hash_password(request.password)
            cursor = conn.execute(
                "INSERT INTO users (username, password_hash) VALUES (?, ?)",
                (request.username, password_hash)
            )
            user_id = cursor.lastrowid
            
            # 创建空的偏好记录
            conn.execute(
                "INSERT INTO user_preferences (user_id) VALUES (?)",
                (user_id,)
            )
            
            return UserResponse(
                success=True,
                user={
                    "id": user_id,
                    "username": request.username,
                },
                message="注册成功"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"注册失败: {str(e)}")


# ==================== 登录 ====================

@router.post("/login", response_model=UserResponse)
async def login(request: UserLoginRequest):
    """用户登录"""
    try:
        with get_db() as conn:
            user = conn.execute(
                "SELECT id, username, password_hash FROM users WHERE username = ?",
                (request.username,)
            ).fetchone()
            
            if not user:
                return UserResponse(
                    success=False,
                    message="用户名或密码错误"
                )
            
            if not verify_password(request.password, user["password_hash"]):
                return UserResponse(
                    success=False,
                    message="用户名或密码错误"
                )
            
            return UserResponse(
                success=True,
                user={
                    "id": user["id"],
                    "username": user["username"],
                },
                message="登录成功"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"登录失败: {str(e)}")


# ==================== 获取偏好 ====================

@router.get("/preferences/{user_id}", response_model=UserPreferencesResponse)
async def get_preferences(user_id: int):
    """获取用户偏好"""
    try:
        with get_db() as conn:
            pref = conn.execute(
                "SELECT * FROM user_preferences WHERE user_id = ?",
                (user_id,)
            ).fetchone()
            
            if not pref:
                return UserPreferencesResponse(
                    success=False,
                    message="未找到用户偏好"
                )
            
            preferences = UserPreferences(
                default_direction=pref["default_direction"],
                default_style=pref["default_style"],
                default_departure_time=pref["default_departure_time"],
                city=pref["city"],
                travel_budget=pref["travel_budget"],
                companion_pref=pref["companion_pref"],
                scenery_types=json.loads(pref["scenery_types"]) if pref["scenery_types"] else [],
                activity_types=json.loads(pref["activity_types"]) if pref["activity_types"] else [],
                music_pref=pref["music_pref"],
                dietary_note=pref["dietary_note"],
                notes=pref["notes"],
            )
            
            return UserPreferencesResponse(
                success=True,
                preferences=preferences,
                message="获取成功"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取偏好失败: {str(e)}")


# ==================== 更新偏好 ====================

@router.put("/preferences/{user_id}", response_model=UserPreferencesResponse)
async def update_preferences(user_id: int, preferences: UserPreferences):
    """更新用户偏好"""
    try:
        with get_db() as conn:
            # 检查用户是否存在
            user = conn.execute(
                "SELECT id FROM users WHERE id = ?",
                (user_id,)
            ).fetchone()
            
            if not user:
                return UserPreferencesResponse(
                    success=False,
                    message="用户不存在"
                )
            
            # 更新偏好
            conn.execute("""
                UPDATE user_preferences SET
                    default_direction = ?,
                    default_style = ?,
                    default_departure_time = ?,
                    city = ?,
                    travel_budget = ?,
                    companion_pref = ?,
                    scenery_types = ?,
                    activity_types = ?,
                    music_pref = ?,
                    dietary_note = ?,
                    notes = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE user_id = ?
            """, (
                preferences.default_direction,
                preferences.default_style,
                preferences.default_departure_time,
                preferences.city,
                preferences.travel_budget,
                preferences.companion_pref,
                json.dumps(preferences.scenery_types or []),
                json.dumps(preferences.activity_types or []),
                preferences.music_pref,
                preferences.dietary_note,
                preferences.notes,
                user_id
            ))
            
            return UserPreferencesResponse(
                success=True,
                preferences=preferences,
                message="保存成功"
            )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新偏好失败: {str(e)}")
