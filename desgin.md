原型地址：


https://www.figma.com/design/6Ae0GTUPV50UHqm1JY14hz/soul-trip?node-id=0-1&p=f&t=pIdvPy7nMoMzZkrC-0

# Wanderlust Agent - Design System Specification (Zhejiang Edition)

## 1. Design Philosophy

- **Uncertainty (未知感)**: Minimalist interfaces that don't reveal everything at once. Use layers and overlays.
- **Guided Fate (引导感)**: Narrative-driven UX that feels like a serendipitous journey rather than a tool.
- **Shareable Story (可分享)**: Every screen is a potential movie poster or postcard.

## 2. Color Palette

- **Primary Background**: `#F4F1EC` (Rice White - Warm and calm)
- **Secondary Background**: `#E9E5DF` (Soft Sand - For depth)
- **Primary Text**: `#2F2F2F` (Charcoal - High readability)
- **Secondary Text**: `#6B6B6B` (Muted Grey - For details)
- **Accents**:
  - `Sky Blue`: `#7FA7B5` (Zhejiang's rivers and lakes)
  - `Forest Green`: `#6B7D6D` (Moganshan/Bamboo forests)
  - `Sunset Orange`: `#D9A066` (Warmth and hope)
- **Overlay**: `rgba(0,0,0,0.15)` to `rgba(0,0,0,0.45)` for hero sections.

## 3. Typography

- **Headings (Serif)**: Lora, Playfair Display, or elegant Chinese Serif (Songti/Noto Serif SC). Used for destinations and emotional hooks.
- **Body (Sans)**: Inter, Helvetica Neue, or clean Chinese Sans-serif (PingFang SC/Noto Sans SC). Used for information and controls.
- **Size Scale**:
  - Hero: 32px (Invitation titles)
  - Title: 24px (Section headers)
  - Body: 16px (Descriptions)
  - Caption: 13px (Distances/Time)
- **Line Height**: 1.8 for body text (creating "air" and relaxation).

## 4. Spacing & Grid

- **Base Unit**: 8px
- **Margins**: 24px (Mobile/H5)
- **Spacing**: Use large white space (`40px`, `64px`) to avoid clutter.

## 5. UI Components

- **The Fate Button (命运按钮)**: Capsule shape, glassmorphism (`backdrop-filter: blur(10px)`), white translucent background.
- **Invitation Card**: Full-screen or large centered card with high-quality film-style photography.
- **Fate Generator**: Sequential text flow with 0.8s-1.2s delay for "finding" the destination.
- **Route View**: Minimalist lines, hand-drawn aesthetic, avoiding Google/Amap standard styles.

## 6. Imagery

- **Style**: Film grain, low saturation, natural lighting, vast landscapes (Zhejiang mountains, ancient towns, coastlines).
- **Subject**: Nature, quiet spaces, small figures in large landscapes.

## 7. Motion

- **Duration**: 0.6s+ (Slow and intentional)
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` (Smooth ease-in-out).
- **Entrance**: Subtle fade + slide up (8px).