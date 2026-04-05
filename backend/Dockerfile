# 使用 Node.js 官方镜像
FROM node:20-slim

# 安装 openssl (Prisma 必需)
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# 复制 root 级的 package.json (用于 workspace 管理)
COPY package*.json ./
COPY backend/package*.json ./backend/
COPY prisma ./prisma/

# 安装依赖
RUN npm install

# 复制后端源码
COPY backend ./backend/

# 生成 Prisma Client
RUN npx prisma generate

# 编译 TypeScript
WORKDIR /app/backend
ENV NODE_OPTIONS="--max-old-space-size=450"
RUN npm run build

# 暴露端口
EXPOSE 3001

# 启动脚本：同步数据库并启动服务
ENV NODE_OPTIONS="--max-old-space-size=450"
CMD npx prisma db push && npm run start
