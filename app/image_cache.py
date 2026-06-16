# -*- coding: utf-8 -*-
"""
浙里Trip - 图片缓存管理器

全局共享的图片缓存，按目的地组织，一次搜索多次复用。
命名规则: data/images/{目的地}/{类型}_{景点名}_{序号}.jpg
"""

import os
import re
import hashlib
import requests
from typing import List, Dict, Optional
from pathlib import Path

# 缓存根目录
CACHE_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "images")

# 图片类型标签
CATEGORY_OFFICIAL = "official"   # gov.cn 官方网站
CATEGORY_SCENIC = "scenic"       # 景点风景照
CATEGORY_CULTURE = "culture"     # 人文/文化
CATEGORY_FOOD = "food"           # 美食
CATEGORY_GENERAL = "general"     # 其他

# 目的地名称映射（用于目录名，去除特殊字符）
DEST_DIR_MAP = {
    "安吉": "anji",
    "桐庐": "tonglu",
    "丽水": "lishui",
    "德清": "deqing",
    "嵊泗": "shengsi",
    "象山": "xiangshan",
    "永嘉": "yongjia",
    "开化": "kaihua",
    "仙居": "xianju",
    "缙云": "jinyun",
    "宁海": "ninghai",
    "舟山": "zhoushan",
    "临安": "linan",
    "千岛湖": "qiandaohu",
    "长兴": "changxing",
    "南浔": "nanxun",
    "莫干山": "moganshan",
    "温岭": "wenling",
    "诸暨": "zhuji",
    "磐安": "panan",
    "新昌": "xinchang",
    "天台": "tiantai",
}


def _safe_dir_name(destination: str) -> str:
    """生成安全的目录名"""
    if destination in DEST_DIR_MAP:
        return DEST_DIR_MAP[destination]
    # 拼音或英文直接使用，中文用 hash
    if re.match(r'^[a-zA-Z0-9_-]+$', destination):
        return destination.lower()
    return hashlib.md5(destination.encode()).hexdigest()[:8]


def _safe_filename(name: str) -> str:
    """生成安全的文件名"""
    # 移除特殊字符，保留中文、字母、数字
    safe = re.sub(r'[^\w\u4e00-\u9fff]', '', name)
    return safe[:20] if safe else "unknown"


class ImageCache:
    """全局共享的图片缓存管理器"""

    def __init__(self, cache_dir: str = CACHE_DIR):
        self.cache_dir = cache_dir
        os.makedirs(self.cache_dir, exist_ok=True)

    def _get_dest_dir(self, destination: str) -> str:
        """获取目的地的缓存目录路径"""
        dir_name = _safe_dir_name(destination)
        dest_dir = os.path.join(self.cache_dir, dir_name)
        os.makedirs(dest_dir, exist_ok=True)
        return dest_dir

    def get_cached_images(self, destination: str) -> List[Dict[str, str]]:
        """
        获取已缓存的图片列表

        Returns:
            [{ "url": "/api/v1/images/anji/official_中国大竹海_01.jpg",
               "source": "local", "title": "中国大竹海", "category": "official" }]
        """
        dest_dir = self._get_dest_dir(destination)
        images = []

        for filename in sorted(os.listdir(dest_dir)):
            if not filename.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                continue

            filepath = os.path.join(dest_dir, filename)
            if os.path.getsize(filepath) < 1024:  # 跳过小于 1KB 的文件
                continue

            # 解析文件名: {category}_{spot}_{seq}.ext
            name_part = os.path.splitext(filename)[0]
            parts = name_part.split('_', 2)

            category = parts[0] if len(parts) > 0 else "general"
            title = parts[1] if len(parts) > 1 else ""
            dir_name = _safe_dir_name(destination)

            images.append({
                "url": f"/api/v1/images/{dir_name}/{filename}",
                "source": "local",
                "title": title,
                "category": category,
            })

        return images

    def needs_refresh(self, destination: str, min_count: int = 3) -> bool:
        """检查是否需要补充图片"""
        cached = self.get_cached_images(destination)
        return len(cached) < min_count

    def cache_image(
        self,
        destination: str,
        url: str,
        category: str = CATEGORY_GENERAL,
        spot_name: str = "",
    ) -> Optional[str]:
        """
        下载并缓存单张图片

        Args:
            destination: 目的地名称（如"安吉"）
            url: 图片 URL
            category: 图片类型（official/scenic/culture/food/general）
            spot_name: 景点名称

        Returns:
            本地相对路径（如 "anji/official_中国大竹海_01.jpg"），失败返回 None
        """
        dest_dir = self._get_dest_dir(destination)

        # 确定序号：查找同类型同景点的最大序号
        safe_spot = _safe_filename(spot_name) or "unknown"
        existing = [f for f in os.listdir(dest_dir)
                    if f.startswith(f"{category}_{safe_spot}_")]
        seq = len(existing) + 1

        filename = f"{category}_{safe_spot}_{seq:02d}.jpg"
        filepath = os.path.join(dest_dir, filename)

        # 检查 URL 是否已经缓存过（通过 URL hash 避免重复下载）
        url_hash = hashlib.md5(url.encode()).hexdigest()[:8]
        for f in os.listdir(dest_dir):
            if url_hash in f:
                dir_name = _safe_dir_name(destination)
                return f"{dir_name}/{f}"

        try:
            resp = requests.get(url, timeout=15, stream=True, headers={
                "User-Agent": "Mozilla/5.0 (compatible; ZheiliTrip/1.0)"
            })
            resp.raise_for_status()

            # 检查内容类型
            content_type = resp.headers.get("content-type", "")
            if "image" not in content_type and not url.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
                return None

            # 写入文件
            with open(filepath, 'wb') as f:
                for chunk in resp.iter_content(chunk_size=8192):
                    f.write(chunk)

            # 验证文件大小（至少 10KB，排除图标）
            if os.path.getsize(filepath) < 10240:
                os.remove(filepath)
                return None

            # 验证图片尺寸（至少 200x200，排除小图标）
            try:
                from PIL import Image
                with Image.open(filepath) as img:
                    w, h = img.size
                    if w < 200 or h < 200:
                        os.remove(filepath)
                        return None
                    # 跳过正方形小图（通常是图标/徽章）
                    if w == h and w < 300:
                        os.remove(filepath)
                        return None
            except Exception:
                # PIL 打开失败，跳过尺寸验证
                pass

            dir_name = _safe_dir_name(destination)
            return f"{dir_name}/{filename}"

        except Exception as e:
            print(f"[image_cache] 下载失败 {url}: {e}")
            # 清理可能的不完整文件
            if os.path.exists(filepath):
                os.remove(filepath)
            return None

    def cache_images_batch(
        self,
        destination: str,
        images: List[Dict[str, str]],
        min_count: int = 3,
    ) -> List[Dict[str, str]]:
        """
        批量缓存图片，返回所有可用图片（缓存 + 新下载）

        Args:
            destination: 目的地名称
            images: 搜索到的图片列表 [{url, source, title, is_official}]
            min_count: 最少需要的图片数

        Returns:
            合并后的图片列表 [{url, source, title, category}]
        """
        # 先检查缓存
        cached = self.get_cached_images(destination)
        if len(cached) >= min_count:
            return cached

        # 需要补充
        needed = min_count - len(cached)
        new_images = []

        for img in images[:needed * 2]:  # 多尝试一些，因为可能有下载失败的
            if len(new_images) >= needed:
                break

            url = img.get("url", "")
            if not url:
                continue

            # 确定分类
            is_official = img.get("is_official", False)
            if is_official:
                category = CATEGORY_OFFICIAL
            else:
                category = CATEGORY_SCENIC

            spot_name = img.get("title", "")
            # 从 title 中提取景点名（去掉网站名等后缀）
            if " - " in spot_name:
                spot_name = spot_name.split(" - ")[0].strip()
            if "—" in spot_name:
                spot_name = spot_name.split("—")[0].strip()

            local_path = self.cache_image(destination, url, category, spot_name)
            if local_path:
                dir_name = _safe_dir_name(destination)
                filename = os.path.basename(local_path)
                new_images.append({
                    "url": f"/api/v1/images/{dir_name}/{filename}",
                    "source": img.get("source", ""),
                    "title": spot_name,
                    "category": category,
                })

        # 合并缓存和新下载的
        return cached + new_images


# 全局单例
_image_cache: Optional[ImageCache] = None


def get_image_cache() -> ImageCache:
    """获取图片缓存管理器单例"""
    global _image_cache
    if _image_cache is None:
        _image_cache = ImageCache()
    return _image_cache
