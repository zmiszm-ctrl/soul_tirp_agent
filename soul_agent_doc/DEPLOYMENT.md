# 浙里Trip 生产环境部署指南

> 版本: 1.1.0 | 更新日期: 2026-05-10

---

## 一、部署前准备

### 1.1 服务器要求

**最低配置**: 2核 / 2GB / 20GB / 1Mbps
**推荐配置**: 4核 / 4GB / 40GB SSD / 3Mbps
**操作系统**: Ubuntu 20.04/22.04 LTS

### 1.2 API Key 准备

| Key | 用途 | 申请地址 |
|-----|------|----------|
| 智谱 AI API Key | LLM 生成内容 | https://open.bigmodel.cn/ |
| DeepSeek API Key | LLM 备用 | https://platform.deepseek.com/ |
| 高德 Web 服务 Key | 后端地理编码/路线规划 | https://lbs.amap.com/ |
| 高德 JS SDK Key | 前端地图/定位 | https://lbs.amap.com/ |

**安全建议**: 生产环境 Key 与开发环境分开，定期轮换，限制使用域名。

---

## 二、环境搭建

### 2.1 安装基础软件

```bash
sudo apt update
sudo apt install -y python3 python3-pip python3-venv nginx git curl nodejs npm

python3 --version  # >= 3.10
node --version     # >= 18
```

### 2.2 部署目录

```bash
sudo mkdir -p /var/www/zheilitrip /var/log/zheilitrip
sudo chown -R $USER:$USER /var/www/zheilitrip /var/log/zheilitrip
```

### 2.3 克隆代码

```bash
cd /var/www/zheilitrip
git clone <your-repo-url> app
cd app
```

---

## 三、后端部署

> 以下所有命令均在 `/var/www/zheilitrip/app` 目录下执行。如果当前不在该目录，请先 `cd /var/www/zheilitrip/app`。

### 3.1 配置环境变量

```bash
cat > .env << 'EOF'
APP_HOST=0.0.0.0
APP_PORT=8000
APP_ENV=production

LLM_PROVIDER=auto
DEEPSEEK_API_KEY=sk-your-deepseek-key
DEEPSEEK_MODEL=deepseek-v4-flash
BIGMODEL_API_KEY=your-bigmodel-key
BIGMODEL_MODEL=glm-4.5-air

AMAP_API_KEY=your-amap-web-service-key
EOF

chmod 600 .env
```

### 3.2 安装依赖

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
pip install gunicorn
```

### 3.3 测试后端

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
curl http://localhost:8000/health
# Ctrl+C 停止
```

### 3.4 配置 Systemd 服务

```bash
sudo nano /etc/systemd/system/zheilitrip-api.service
```

```ini
[Unit]
Description=浙里Trip API Service
After=network.target

[Service]
Type=notify
User=www-data
Group=www-data
WorkingDirectory=/var/www/zheilitrip/app
Environment="PATH=/var/www/zheilitrip/app/.venv/bin"
ExecStart=/var/www/zheilitrip/app/.venv/bin/gunicorn \
    app.main:app \
    --workers 4 \
    --worker-class uvicorn.workers.UvicornWorker \
    --bind 0.0.0.0:8000 \
    --access-logfile /var/log/zheilitrip/access.log \
    --error-logfile /var/log/zheilitrip/error.log \
    --timeout 120 \
    --keep-alive 5
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable zheilitrip-api
sudo systemctl start zheilitrip-api
sudo systemctl status zheilitrip-api
```

---

## 四、前端部署

> 以下命令在 `/var/www/zheilitrip/app/h5` 目录下执行。

### 4.1 构建

```bash
cd /var/www/zheilitrip/app/h5
npm install
npm run build
ls -la dist/
```

### 4.2 确认高德 SDK

```bash
grep amap dist/index.html
# 应包含: <script src="https://webapi.amap.com/maps?v=2.0&key=..."></script>
```

### 4.3 Nginx 配置

```bash
sudo nano /etc/nginx/sites-available/zheilitrip
```

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    root /var/www/zheilitrip/app/h5/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 120s;
        proxy_read_timeout 120s;
        proxy_send_timeout 120s;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;

    access_log /var/log/nginx/zheilitrip-access.log;
    error_log /var/log/nginx/zheilitrip-error.log;
}
```

```bash
sudo ln -s /etc/nginx/sites-available/zheilitrip /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### 4.4 SSL 证书

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo certbot renew --dry-run
```

---

## 五、部署检查清单

> 验证命令在 `/var/www/zheilitrip/app` 目录下执行（已激活虚拟环境）。

### 5.1 后端

```bash
# 服务状态
sudo systemctl status zheilitrip-api

# 健康检查
curl http://localhost:8000/health

# 高德距离查询测试
curl -X POST http://localhost:8000/api/v1/amap/distance \
  -H "Content-Type: application/json" \
  -d '{"from_address":"杭州市","to_address":"安吉"}'

# LLM 生成测试
curl -X POST http://localhost:8000/api/v1/travel/rich-plan \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "north",
    "style": "relax",
    "departure_time": "now",
    "user_location": {"address":"杭州市西湖区","lat":30.27,"lng":120.15},
    "destination_name": "安吉",
    "distance_info": {"distance":"78km","duration":"1小时15分钟"},
    "hexagram": {"name":"乾","meaning":"元亨利贞","lines":[1,1,1,1,1,1]}
  }'
```

### 5.2 前端

- [ ] `https://your-domain.com/` 正常打开
- [ ] 定位功能正常（浏览器弹出位置权限）
- [ ] 导航栏弹窗：关于我们 / 如何使用 / 设计系统
- [ ] 三选页面正常
- [ ] 八卦占卜可点击、撒叶动画流畅
- [ ] Loading 页面距离计算正常（高德 API 返回真实数据）
- [ ] 邀请函页面渲染正常、距离/时间正确
- [ ] 详情页正常显示

### 5.3 环境变量验证

```bash
cd /var/www/zheilitrip/app
source .venv/bin/activate
python3 -c "
from app.config import settings
print(f'LLM: {settings.LLM_PROVIDER} ({settings.BIGMODEL_MODEL})')
print(f'AMAP_KEY: {settings.AMAP_API_KEY[:8]}...')
"
```

---

## 六、监控与运维

### 6.1 日志

```bash
tail -f /var/log/zheilitrip/access.log
tail -f /var/log/zheilitrip/error.log
tail -f /var/log/nginx/zheilitrip-access.log
sudo journalctl -u zheilitrip-api -f
```

### 6.2 日志轮转

```bash
sudo nano /etc/logrotate.d/zheilitrip
```

```
/var/log/zheilitrip/*.log
/var/log/nginx/zheilitrip-*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    notifempty
    create 0644 www-data www-data
    sharedscripts
    postrotate
        systemctl reload nginx > /dev/null 2>&1 || true
    endscript
}
```

### 6.3 服务管理

```bash
sudo systemctl restart zheilitrip-api
sudo systemctl reload nginx
sudo systemctl status zheilitrip-api
```

### 6.4 更新部署

```bash
cd /var/www/zheilitrip/app
git pull origin main
source .venv/bin/activate
pip install -r requirements.txt
cd h5 && npm install && npm run build && cd ..
sudo systemctl restart zheilitrip-api
sudo systemctl reload nginx
```

---

## 七、故障排查

### 后端无法启动

```bash
sudo journalctl -u zheilitrip-api -n 100 --no-pager
sudo lsof -i :8000
cat /var/www/zheilitrip/app/.env
```

### 前端白屏

```bash
ls -la /var/www/zheilitrip/app/h5/dist/
sudo nginx -t
tail -f /var/log/nginx/zheilitrip-error.log
```

### 高德 API 无响应

```bash
# 检查后端 AMAP_API_KEY
python3 -c "from app.config import settings; print(settings.AMAP_API_KEY[:8])"

# 直接测试高德 API
curl "https://restapi.amap.com/v3/geocode/geo?address=杭州市&key=YOUR_KEY"

# 检查前端 JS SDK Key
grep amap /var/www/zheilitrip/app/h5/dist/index.html
```

### LLM 响应超时

```bash
sudo journalctl -u zheilitrip-api | grep -i "llm\|error\|timeout"
# 检查 API Key 是否有效
# 增加 Gunicorn timeout (--timeout 120)
```

### 距离/时间显示异常

```bash
# 测试距离查询
curl -X POST http://localhost:8000/api/v1/amap/distance \
  -H "Content-Type: application/json" \
  -d '{"from_address":"杭州市","to_address":"德清"}'
# 确认返回的 distance_km 和 duration_text 正确
```

---

## 八、性能优化

### 后端

- Worker 数量: CPU 核心数 * 2 + 1
- 启用 Redis 缓存（LLM 响应 / 高德距离）
- 启用 Gzip 压缩

### 前端

- 静态资源上传 CDN
- 图片 WebP 格式 + 懒加载
- 路由懒加载

---

## 九、安全加固

```bash
# 防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable

# .env 权限
chmod 600 /var/www/zheilitrip/app/.env
```

生产环境 `APP_ENV=production` 时，FastAPI 自动关闭 Swagger 文档页面 (`/docs` 不可访问)。

---

## 十、回滚

```bash
cd /var/www/zheilitrip/app
git log --oneline -10
git checkout <commit-hash>
cd h5 && npm run build && cd ..
sudo systemctl restart zheilitrip-api
sudo systemctl reload nginx
```

---

**最后更新**: 2026-05-10
**文档版本**: 1.1.0
