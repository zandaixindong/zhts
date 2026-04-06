#!/bin/bash

echo "🚀 开始全自动部署 AI 图书馆后端..."

# 1. 检查并安装 Docker (如果未安装)
if ! [ -x "$(command -v docker)" ]; then
  echo "📦 正在安装 Docker..."
  curl -fsSL https://get.docker.com | bash -s docker
fi

# 2. 停止旧容器
docker compose down

# 3. 构建并启动
echo "🛠️ 正在构建镜像 (这可能需要几分钟)..."
docker compose up -d --build

echo "✅ 部署完成！"
echo "📡 后端接口地址: http://你的服务器IP:3001/api"
echo "📝 请将此地址填入 Xcode 的 NetworkManager.swift 中。"
