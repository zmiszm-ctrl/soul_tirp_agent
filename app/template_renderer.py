# -*- coding: utf-8 -*-
"""
浙里Trip - HTML 邀请函模板渲染引擎
"""

import os
import re
from typing import Dict, List, Any, Optional

TEMPLATES_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "templates")

# 模板文件映射
TEMPLATE_MAP = {
    "gradient": "gradient.html",   # Stripe 渐变 mesh
    "glow": "glow.html",           # Spotify 暗色沉浸
    "ink": "ink.html",             # 山水画卷水墨风
}

# 目的地 → 推荐模板 + 配色
DESTINATION_STYLE = {
    # 海岛/水边 → glow
    "嵊泗": {"template": "glow", "primary": "#0077b6", "accent": "#90e0ef", "mood": "ocean"},
    "象山": {"template": "glow", "primary": "#0077b6", "accent": "#48cae4", "mood": "ocean"},
    "舟山": {"template": "glow", "primary": "#023e8a", "accent": "#0096c7", "mood": "ocean"},
    "千岛湖": {"template": "glow", "primary": "#219ebc", "accent": "#8ecae6", "mood": "lake"},

    # 山林/自然 → gradient
    "安吉": {"template": "gradient", "primary": "#6b7d6d", "accent": "#a3b18a", "mood": "forest"},
    "桐庐": {"template": "gradient", "primary": "#7fa7b5", "accent": "#b5d5c5", "mood": "mountain"},
    "临安": {"template": "gradient", "primary": "#6b7d6d", "accent": "#95b8a0", "mood": "forest"},
    "德清": {"template": "gradient", "primary": "#7fa7b5", "accent": "#b5d5c5", "mood": "mountain"},
    "莫干山": {"template": "gradient", "primary": "#6b7d6d", "accent": "#a3b18a", "mood": "mountain"},

    # 古村/文化 → ink
    "永嘉": {"template": "ink", "primary": "#8b7355", "accent": "#c4a882", "mood": "heritage"},
    "开化": {"template": "ink", "primary": "#8b7355", "accent": "#b5c4a1", "mood": "heritage"},
    "缙云": {"template": "ink", "primary": "#6b5b4a", "accent": "#c4a882", "mood": "heritage"},
    "南浔": {"template": "ink", "primary": "#8b7355", "accent": "#d4c8b8", "mood": "heritage"},

    # 默认
    "_default": {"template": "gradient", "primary": "#D9A066", "accent": "#7FA7B5", "mood": "warm"},
}


def _load_template(template_name: str) -> str:
    """加载模板文件"""
    filename = TEMPLATE_MAP.get(template_name, "gradient.html")
    path = os.path.join(TEMPLATES_DIR, filename)
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def _render_moments(moments: List[Dict[str, Any]], template: str) -> str:
    """渲染体验时刻 HTML"""
    if not moments:
        return ""

    html_parts = []
    for m in moments:
        time_str = m.get("time", "")
        title = m.get("title", "")
        desc = m.get("description", "")
        image = m.get("image", "")

        if template == "ink":
            html_parts.append(f'''
            <div style="margin:0 0 16px;padding-left:16px;border-left:2px solid #c4a882;">
              <p style="margin:0 0 4px;font-size:12px;color:#8b7355;font-family:'Noto Sans SC',sans-serif;">{time_str}</p>
              <p style="margin:0 0 4px;font-size:15px;color:#3d3d3d;font-family:'Noto Serif SC',serif;">{title}</p>
              <p style="margin:0;font-size:13px;line-height:1.6;color:#6b6b6b;font-family:'Noto Sans SC',sans-serif;">{desc}</p>
            </div>''')
        elif template == "glow":
            html_parts.append(f'''
            <div style="margin:0 0 12px;padding:12px;background:rgba(255,255,255,0.04);border-radius:8px;">
              <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.4);font-family:'Noto Sans SC',sans-serif;">{time_str}</p>
              <p style="margin:0 0 4px;font-size:14px;color:#fff;font-family:'Noto Sans SC',sans-serif;">{title}</p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.6);font-family:'Noto Sans SC',sans-serif;">{desc}</p>
            </div>''')
        else:  # gradient
            html_parts.append(f'''
            <div style="margin:0 0 12px;padding:12px;background:rgba(255,255,255,0.04);border-radius:8px;border:1px solid rgba(255,255,255,0.06);">
              <p style="margin:0 0 4px;font-size:11px;color:rgba(255,255,255,0.4);font-family:'Noto Sans SC',sans-serif;">{time_str}</p>
              <p style="margin:0 0 4px;font-size:14px;color:rgba(255,255,255,0.9);font-family:'Noto Sans SC',sans-serif;">{title}</p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:rgba(255,255,255,0.6);font-family:'Noto Sans SC',sans-serif;">{desc}</p>
            </div>''')

    return "\n".join(html_parts)


def _render_images(images: List[Dict[str, Any]], template: str) -> str:
    """渲染图片画廊 HTML"""
    if not images:
        return ""

    border_radius = "8px" if template != "ink" else "4px"
    parts = []
    for img in images[:4]:
        url = img.get("url", "")
        if not url:
            continue
        parts.append(
            f'<div style="flex:0 0 140px;height:100px;border-radius:{border_radius};overflow:hidden;">'
            f'<img src="{url}" style="width:100%;height:100%;object-fit:cover;" />'
            f'</div>'
        )

    return "\n".join(parts) if parts else ""


def _render_hexagram(hexagram_name: str, hexagram_meaning: str, travel_hint: str, template: str) -> str:
    """渲染卦象 HTML"""
    if not hexagram_name:
        return ""

    if template == "ink":
        return f'''
        <div style="margin:0 0 24px;padding:16px;background:rgba(255,255,255,0.4);border-radius:12px;text-align:center;border:1px solid rgba(139,115,85,0.2);">
          <p style="margin:0 0 4px;font-size:20px;">☯</p>
          <p style="margin:0 0 4px;font-size:14px;color:#3d3d3d;font-family:'Noto Serif SC',serif;">{hexagram_name}卦</p>
          <p style="margin:0 0 4px;font-size:12px;color:#8b7355;">{hexagram_meaning}</p>
          <p style="margin:0;font-size:12px;color:#6b6b6b;font-family:'Noto Sans SC',sans-serif;">{travel_hint}</p>
        </div>'''
    elif template == "glow":
        return f'''
        <div style="margin:0 0 24px;padding:16px;background:rgba(255,255,255,0.04);border-radius:12px;text-align:center;">
          <p style="margin:0 0 4px;font-size:20px;">☯</p>
          <p style="margin:0 0 4px;font-size:14px;color:rgba(255,255,255,0.85);font-family:'Noto Serif SC',serif;">{hexagram_name}卦</p>
          <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.5);">{hexagram_meaning}</p>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6);font-family:'Noto Sans SC',sans-serif;">{travel_hint}</p>
        </div>'''
    else:  # gradient
        return f'''
        <div style="margin:0 0 24px;padding:16px;background:rgba(255,255,255,0.04);border-radius:12px;text-align:center;border:1px solid rgba(255,255,255,0.06);">
          <p style="margin:0 0 4px;font-size:20px;">☯</p>
          <p style="margin:0 0 4px;font-size:14px;color:rgba(255,255,255,0.85);font-family:'Noto Serif SC',serif;">{hexagram_name}卦</p>
          <p style="margin:0 0 4px;font-size:12px;color:rgba(255,255,255,0.5);">{hexagram_meaning}</p>
          <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.6);font-family:'Noto Sans SC',sans-serif;">{travel_hint}</p>
        </div>'''


def _get_image_sources(images: List[Dict[str, Any]]) -> str:
    """生成图片来源标注"""
    if not images:
        return "网络"

    domains = set()
    for img in images[:3]:
        source = img.get("source", "")
        if source:
            # 提取域名
            match = re.search(r'https?://([^/]+)', source)
            if match:
                domains.add(match.group(1))

    return "、".join(sorted(domains)) if domains else "网络"


def render_invitation(
    plan_data: Dict[str, Any],
    images: Optional[List[Dict[str, Any]]] = None,
    hexagram_name: str = "",
    hexagram_meaning: str = "",
    hexagram_travel_hint: str = "",
) -> str:
    """
    渲染 HTML 邀请函

    Args:
        plan_data: 包含 destination, moments, bgm, culture_core 等
        images: 搜索到的图片列表 [{url, source, title}]
        hexagram_name: 卦名
        hexagram_meaning: 卦辞
        hexagram_travel_hint: 出行指引

    Returns:
        渲染好的 HTML 字符串
    """
    dest = plan_data.get("destination", {})
    moments = plan_data.get("moments", [])
    bgm = plan_data.get("bgm", {})
    culture_core = plan_data.get("culture_core", "")

    dest_name = dest.get("name", "未知目的地")

    # 选择模板和配色
    style = DESTINATION_STYLE.get(dest_name, DESTINATION_STYLE["_default"])
    template_name = style["template"]

    # 如果 LLM 指定了模板，使用 LLM 的选择
    llm_template = plan_data.get("template")
    if llm_template and llm_template in TEMPLATE_MAP:
        template_name = llm_template

    template = _load_template(template_name)

    # 渲染各部分
    moments_html = _render_moments(moments, template_name)
    images_html = _render_images(images or [], template_name)
    hexagram_html = _render_hexagram(hexagram_name, hexagram_meaning, hexagram_travel_hint, template_name)
    image_sources = _get_image_sources(images or [])

    # 替换模板变量
    replacements = {
        "{destination_name}": dest_name,
        "{destination_subtitle}": dest.get("subtitle", ""),
        "{description}": dest.get("description", ""),
        "{distance}": dest.get("distance", ""),
        "{duration}": dest.get("duration", ""),
        "{suggested_time}": dest.get("suggested_time", ""),
        "{direction_label}": dest.get("direction_label", ""),
        "{hero_image}": (images[0]["url"] if images else dest.get("image", "")),
        "{color_primary}": style["primary"],
        "{color_accent}": style["accent"],
        "{moments_html}": moments_html,
        "{images_html}": images_html,
        "{hexagram_html}": hexagram_html,
        "{culture_core}": culture_core,
        "{bgm_title}": bgm.get("title", ""),
        "{bgm_artist}": bgm.get("artist", ""),
        "{bgm_description}": bgm.get("description", ""),
        "{image_sources}": image_sources,
    }

    html = template
    for key, value in replacements.items():
        html = html.replace(key, str(value))

    return html
