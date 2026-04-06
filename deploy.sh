#!/bin/bash

echo "🚀 开始全自动部署 AI 图书馆系统..."

# 1. 检查并安装 Docker (如果未安装)
if ! [ -x "$(command -v docker)" ]; then
  echo "📦 正在安装 Docker..."
  curl -fsSL https://get.docker.com | bash -s docker
fi

# 2. 构建前端项目 (需要本地有 Node.js 环境)
echo "🏗️ 正在构建用户前台..."
cd frontend && npm install && npm run build && cd ..

echo "🏗️ 正在构建管理后台..."
cd admin-frontend && npm install && npm run build && cd ..

# 3. 停止旧容器并重新启动后端
echo "🛠️ 正在启动后端容器..."
docker compose down
docker compose up -d --build

echo "✅ 部署完成！"
echo "🌐 用户前台: https://guhongli.top"
echo "🛡️ 管理后台: https://admin.guhongli.top"
echo "📡 后端接口: https://guhongli.top/api"
echo ""
echo "📝 请确保以下操作已完成："
echo "1. 将 admin.guhongli.top 解析到服务器 IP。"
echo "2. 将 nginx_guhongli.top.conf 复制到服务器的 /etc/nginx/sites-available/ 并重启 Nginx。"
echo "3. 确保服务器上存在目录 /var/www/library/frontend 和 /var/www/library/admin，并将对应的 dist 目录内容放入其中。"
