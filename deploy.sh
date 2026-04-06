#!/bin/bash

echo "🚀 开始全自动部署 AI 图书馆系统..."

# 1. 检查并安装 Docker (如果未安装)
if ! [ -x "$(command -v docker)" ]; then
  echo "📦 正在安装 Docker..."
  curl -fsSL https://get.docker.com | bash -s docker
fi

# 2. 准备 Web 托管目录 (需要 root 权限)
echo "📂 准备 Web 托管路径..."
mkdir -p /var/www/library/frontend
mkdir -p /var/www/library/admin

# 3. 构建前端项目
echo "🏗️ 正在构建用户前台..."
cd frontend && npm install && npm run build
if [ -d "dist" ]; then
    cp -r dist/* /var/www/library/frontend/
    echo "✅ 用户前台构建成功并已同步到 /var/www/library/frontend"
else
    echo "❌ 用户前台构建失败，请检查构建日志。"
    exit 1
fi
cd ..

echo "🏗️ 正在构建管理后台..."
cd admin-frontend && npm install && npm run build
if [ -d "dist" ]; then
    cp -r dist/* /var/www/library/admin/
    echo "✅ 管理后台构建成功并已同步到 /var/www/library/admin"
else
    echo "❌ 管理后台构建失败，请检查构建日志。"
    exit 1
fi
cd ..

# 4. 停止旧容器并重新启动后端
echo "🛠️ 正在启动后端容器..."
docker compose down
docker compose up -d --build

echo "✅ 部署完成！"
echo "🌐 用户前台: https://guhongli.top"
echo "🛡️ 管理后台: https://admin.guhongli.top"
echo "📡 后端接口: https://guhongli.top/api"
echo ""
echo "📝 接下来请确认："
echo "1. 将 admin.guhongli.top 解析到服务器 IP。"
echo "2. 将 nginx_guhongli.top.conf 应用到 Nginx (cp nginx_guhongli.top.conf /etc/nginx/sites-enabled/)"
echo "3. 重载 Nginx (nginx -s reload)"
