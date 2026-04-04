# AI 智慧图书馆平台

一个基于 OpenAI 兼容接口模型构建的三端图书馆演示平台，包含用户前台、管理员后台、Node/Express 后端、Prisma/SQLite 数据层，以及手机演示与本地隧道能力。

这个项目的目标不是只做一个“图书查询页”，而是把 **找书、推荐、座位、问答、通知、运营看板** 组合成一个更完整的 AI 图书馆产品原型，适合课程设计、答辩展示、作品集演示和后续二次开发。

---

## 1. 项目定位

本项目围绕图书馆场景，解决以下几类典型问题：

- 找书效率低：用户不知道该搜什么、怎么搜、书在哪里
- 推荐能力弱：大多数系统只能检索，不能个性化推荐
- 座位体验差：难以直观看到空间状态，更难按偏好找座
- 服务入口割裂：通知、活动、问答、预约分散在不同系统
- 管理端展示弱：缺少适合演示、汇报、运营分析的后台总览

项目当前更偏向 **高完成度演示型产品**，已经具备较完整的功能闭环，但仍保留一些 Demo 项目的特点，例如：

- 鉴权机制偏演示化
- 默认带演示账号
- 数据库使用 SQLite
- AI 知识库部分内容内置在代码中

---

## 2. 系统组成

本仓库是一个 monorepo，主要由四部分组成：

- **frontend**：用户前台，面向读者
- **admin-frontend**：管理员后台，面向图书馆运营人员
- **backend**：Node.js + Express 后端 API
- **prisma**：数据库模型、SQLite 文件与演示数据

整体调用关系如下：

```text
用户前台 / 管理后台
        ↓
    Express API
        ↓
 Prisma + SQLite
        ↓
 OpenAI 兼容模型接口
```

---

## 3. 功能总览

### 用户前台

- AI 智能找书
- 条形码扫码找书
- 个性化推荐
- AI 座位预约
- 学习模式选座
- 座位热力图 / SVG 平面图
- AI 问答助手
- 我的借阅 / 我的预约
- 收藏夹
- 通知中心
- PWA 安装提示
- 手机端演示适配

### 管理员后台

- 运营总览看板
- 图书管理
- 楼层 / 座位管理
- 活动管理
- 用户管理
- 异常预警
- 运营待办中心
- 今日馆舍策略
- AI 运营日报生成器
- CSV 报表导出
- PDF 日报导出

### AI 相关能力

- 自然语言找书
- 个性化推荐与导读摘要
- 自然语言找座
- 基于学习模式增强选座
- 图书馆知识问答
- AI 策略建议与运营摘要

---

## 4. 技术栈

### 前端

- React 18
- TypeScript
- Vite
- Tailwind CSS
- Zustand
- Axios
- Recharts
- Lucide React
- React Router DOM

### 后端

- Node.js
- Express
- TypeScript
- Prisma
- SQLite
- Zod
- OpenAI 兼容 SDK

### 其他

- LocalTunnel：远程演示分享
- QRCode：二维码相关展示
- ZXing：条码 / 摄像头扫码
- jsPDF：PDF 导出

---

## 5. 目录结构与用途

下面不是简单的目录罗列，而是按“为什么存在、主要负责什么”来说明。

### 根目录

```text
.
├── admin-frontend/        # 管理员后台前端
├── backend/               # Express API 服务
├── frontend/              # 用户前台
├── prisma/                # Prisma 模型、数据库与种子数据
├── scripts/               # 演示辅助脚本，例如隧道启动
├── app.py                 # 独立原型文件，当前不属于主运行链路
├── package.json           # monorepo 工作区脚本入口
├── .env.example           # 环境变量模板
└── README.md              # 项目说明文档
```

### 根目录关键文件

- **package.json**
  - 工作区定义
  - `dev / dev:tunnel / build / seed` 等统一脚本入口
- **.env.example**
  - 提供模型 API、数据库、端口等配置模板
- **app.py**
  - 独立原型文件
  - 当前不属于主业务链路
  - 如果后续继续保留，建议单独拆为 `prototype/` 目录
- **README.md**
  - 当前项目总文档

---

## 6. frontend 目录说明

用户前台，负责读者侧全部体验。

```text
frontend/
├── public/
│   ├── manifest.json      # PWA 清单
│   └── sw.js              # Service Worker
├── src/
│   ├── components/        # 页面组件、功能组件、布局组件
│   ├── hooks/             # 前台自定义 hooks
│   ├── store/             # Zustand 状态
│   ├── utils/             # API 封装与工具函数
│   ├── types/             # 类型定义
│   ├── App.tsx            # 前台主入口与路由装配
│   ├── main.tsx           # React 挂载入口
│   ├── index.css          # 全局视觉样式
│   └── navigation.ts      # 前台路由映射
├── vite.config.ts         # Vite 配置
└── package.json           # 前台依赖与脚本
```

### frontend/src/components 重点目录

- **layout/**
  - 顶部导航、底部导航、移动端头部、页面过渡
- **features/auth/**
  - 登录页面
- **features/book-search/**
  - AI 找书、书籍列表、书籍卡片
- **features/barcode-scanner/**
  - 摄像头扫码与 ISBN 手动搜索降级
- **features/recommendations/**
  - 个性化推荐页
- **features/seat-map/**
  - AI 学习模式
  - 日期选择
  - 楼层选择
  - 座椅视图
  - SVG 平面图
  - 当前预约卡片
  - 预约记录与规则
- **features/chat-assistant/**
  - 图书馆 AI 助手
- **features/notifications/**
  - 通知中心
- **features/my-activity/**
  - 我的借阅、我的预约
- **features/bookmarks/**
  - 收藏夹
- **features/qr-checkin/**
  - 二维码签到相关界面

### frontend 关键文件用途

- **src/App.tsx**
  - 前台页面装配入口
  - 接入真实路由
  - 控制登录后默认跳转与页面渲染
- **src/navigation.ts**
  - 定义前台 tab 与 URL 的映射关系
- **src/store/useStore.ts**
  - 管理当前用户、当前页面、书签、通知等状态
  - 负责部分 localStorage 持久化
- **src/hooks/useSeatReservation.ts**
  - 座位预约模块的核心业务逻辑
- **src/components/features/seat-map/SeatHeatmap.tsx**
  - 座位热力图
  - 氛围评分
  - SVG 平面图切换
- **src/components/features/barcode-scanner/BarcodeScanner.tsx**
  - 摄像头扫码
  - 无摄像头时手动 ISBN 搜索
- **src/main.tsx**
  - 开发环境注销 Service Worker
  - 生产环境注册 Service Worker

---

## 7. admin-frontend 目录说明

管理员后台，负责运营展示与管理操作。

```text
admin-frontend/
├── src/
│   ├── components/        # 看板、管理模块、布局、登录页
│   ├── store/             # 后台状态
│   ├── utils/             # API 封装
│   ├── types/             # 后台类型定义
│   ├── App.tsx            # 后台入口与路由装配
│   ├── main.tsx           # React 挂载入口
│   ├── index.css          # 后台全局视觉样式
│   └── navigation.ts      # 后台路由映射
├── vite.config.ts
└── package.json
```

### admin-frontend/src/components 重点目录

- **auth/**
  - 管理员登录页
- **layout/**
  - 侧边栏、顶部命令栏、整体布局
- **dashboard/**
  - 数据总览
  - 趋势图表
  - 异常告警
  - 运营待办中心
  - 今日馆舍策略
  - AI 日报生成
  - 报表导出
- **books/**
  - 图书管理
- **seats/**
  - 楼层与座位管理
- **events/**
  - 活动管理
- **users/**
  - 用户管理

### admin-frontend 关键文件用途

- **src/App.tsx**
  - 管理后台主入口
  - 管理页面切换与真实路由映射
- **src/navigation.ts**
  - 后台模块与 URL 路径的映射
- **src/store/useAdminStore.ts**
  - 当前管理员、当前模块、侧边栏开关等状态
- **src/components/dashboard/DashboardHome.tsx**
  - 后台首页装配中心
  - 汇聚运营总览、图表、日报、策略、导出能力
- **src/components/dashboard/OpsTodoCenter.tsx**
  - 运营待办中心
- **src/components/dashboard/LibraryStrategyCard.tsx**
  - 今日馆舍策略
- **src/components/dashboard/DailyBriefGenerator.tsx**
  - AI 运营日报生成与 PDF 导出
- **src/components/dashboard/ReportCenterCard.tsx**
  - CSV 报表导出

---

## 8. backend 目录说明

后端 API 服务，负责业务逻辑、数据库读写、AI 能力接入。

```text
backend/
├── src/
│   ├── routes/           # 按业务划分的 API 路由
│   ├── services/         # AI 服务、系统知识等
│   ├── tools/            # AI 工具函数
│   └── index.ts          # 服务入口
├── package.json
└── tsconfig.json
```

### backend/src/routes 主要文件

- **auth.ts**
  - 登录
  - 逾期借阅检查
- **books.ts**
  - 图书搜索
  - ISBN 查询
  - 到货提醒
- **recommendations.ts**
  - 个性化推荐
  - 推荐摘要
- **seats.ts**
  - 楼层列表
  - 座位列表
  - AI 找座
  - 预约 / 取消 / 签到 / 暂离 / 续约 / 退座
- **chat.ts**
  - AI 助手对话
- **notifications.ts**
  - 通知读取
  - 标记已读
  - AI 活动匹配
- **my-activity.ts**
  - 我的借阅
  - 我的预约
- **qr-checkin.ts**
  - 二维码签到校验
- **admin.ts**
  - 图书、楼层、座位、活动、用户的后台管理接口
- **analytics.ts**
  - 总览指标
  - 图表数据
  - 异常预警
  - 运营待办
  - 今日馆舍策略
  - AI 日报
  - CSV 导出

### backend/src/services

- **claude.ts**
  - 实际上是 OpenAI 兼容客户端封装
  - 负责接入模型、系统提示词和图书馆知识文档

### backend 关键文件用途

- **src/index.ts**
  - 注册 CORS、中间件
  - 挂载所有 `/api/*` 路由
  - 启动服务

---

## 9. prisma 目录说明

数据库层与演示数据层。

```text
prisma/
├── schema.prisma         # Prisma 数据模型
├── seed.ts               # 演示数据播种脚本
└── dev.db                # SQLite 数据库文件
```

### schema.prisma 核心实体

- **User**：用户 / 管理员
- **Book**：图书
- **BookCheckout**：借阅记录
- **BookArrivalNotification**：到货提醒
- **Floor**：楼层
- **Seat**：座位
- **SeatReservation**：座位预约
- **LibraryEvent**：图书馆活动
- **Notification**：通知

### seed.ts 做了什么

- 创建演示用户与管理员
- 初始化图书数据
- 初始化楼层和座位
- 初始化活动
- 初始化通知
- 提供开箱即用的演示环境

---

## 10. scripts 目录说明

```text
scripts/
└── tunnel.js            # 本地隧道启动与二维码输出
```

### 用途

- 在没有公网 IP 的情况下，把本地服务临时暴露给外网
- 适合答辩演示、手机分享、远程预览

---

## 11. 页面与路由说明

### 用户前台路由

- `/login`：登录页
- `/scan`：扫码找书
- `/search`：找书
- `/for-you`：推荐
- `/seats`：座位预约
- `/my-activity`：我的活动
- `/bookmarks`：收藏夹
- `/chat`：AI 助手
- `/notifications`：通知中心

### 管理后台路由

- `/login`：管理员登录
- `/dashboard`：运营总览
- `/books`：书籍管理
- `/seats`：楼层座位管理
- `/events`：活动管理
- `/users`：用户管理

---

## 12. API 概览

这里只列分组，方便理解整体结构。

### 用户能力

- `/api/auth/*`
- `/api/books/*`
- `/api/recommendations/*`
- `/api/seats/*`
- `/api/chat/*`
- `/api/notifications/*`
- `/api/my-activity/*`
- `/api/qr-checkin/*`

### 管理与分析

- `/api/admin/*`
- `/api/analytics/*`

### 典型分析接口

- `/api/analytics/overview`
- `/api/analytics/seat-usage`
- `/api/analytics/anomalies`
- `/api/analytics/ops-center`
- `/api/analytics/library-strategy`
- `/api/analytics/daily-brief`
- `/api/analytics/export/overview`
- `/api/analytics/export/seat-usage`

---

## 13. 快速开始

### 环境要求

- Node.js 18+
- npm
- 可用的 OpenAI 兼容接口密钥

### 安装步骤

```bash
npm install
cp .env.example .env
```

编辑 `.env`，至少填写以下内容：

```env
API_KEY=你的模型密钥
MODEL_NAME=glm-4
OPENAI_BASE_URL=你的兼容接口地址
DATABASE_URL=file:./dev.db
PORT=3001
FRONTEND_URL=http://localhost:5173
```

### 初始化数据库

```bash
npx prisma generate
npx prisma db push
npx ts-node prisma/seed.ts
```

### 启动开发环境

```bash
npm run dev
```

默认会启动三端：

- 用户前台：http://localhost:5173
- 管理后台：http://localhost:5174
- 后端 API：http://localhost:3001

### 生产构建

```bash
npm run build
```

### 播种演示数据

```bash
npm run seed
```

---

## 14. 演示账号

### 用户前台

- 邮箱：`demo@university.edu`
- 密码：`demo`

### 管理后台

- 邮箱：`admin@university.edu`
- 密码：`admin123`

---

## 15. 手机演示方法

### 方式一：同一 Wi‑Fi 直接访问

执行：

```bash
npm run dev
```

然后让手机与电脑连接同一局域网，直接打开前台或后台的局域网地址。

### 方式二：使用本地隧道

执行：

```bash
npm run dev:tunnel
```

适合：

- 没有公网 IP
- 不在同一 Wi‑Fi
- 需要发给老师 / 同学 / 评审远程预览

---

## 16. 推荐演示流程

### 面向答辩 / 路演

1. 先打开管理后台讲清楚平台定位
2. 展示总览看板、运营待办、今日馆舍策略、AI 日报
3. 切到前台展示 AI 找书、推荐、通知
4. 重点演示 AI 座位预约、学习模式、SVG 平面图
5. 最后展示 AI 助手和手机演示能力

### 面向手机演示

优先展示：

- 登录页
- 推荐页
- 座位预约页
- 通知中心

因为这些页面的品牌感和移动适配最明显。

---

## 17. 开发说明

### 当前项目的工程特点

- 已接入真实路由，支持刷新和链接分享
- 前台开发环境会自动注销 Service Worker，避免缓存旧资源
- 前后台均支持局域网访问
- 后台更偏“驾驶舱”风格，前台已逐步向后台审美靠拢

### 当前适合继续开发的方向

- 路由级懒加载与分包优化
- 自定义 SVG 楼层图编辑
- 更完整的鉴权体系
- 后台 PDF / 图片报表模板
- AI 推荐理由可视化

---

## 18. 已知限制

当前项目更适合作品演示和二次开发起点，不建议直接作为生产系统上线，原因包括：

- 登录鉴权仍偏演示级
- 密码安全与权限体系未完全生产化
- 数据库为 SQLite，更适合本地演示
- 暂无完善的测试体系
- 暂无 CI/CD
- 暂无文件上传 / 对象存储方案
- AI 知识库部分内容仍在代码中

---

## 19. 下一步建议

### 产品方向

- 增加 AI 推荐理由卡
- 增加馆长视角 / 运营视角 / 答辩视角三种日报模板
- 增加空间氛围历史趋势
- 增加楼层平面图可视化编辑器

### 工程方向

- 做前后台路由级懒加载
- 拆分大 chunk，降低首屏体积
- 补 ESLint / Prettier / 单元测试
- 为后端接口补统一错误码和校验策略

### 生产化方向

- 使用 JWT / Session
- 密码哈希存储
- 接入 PostgreSQL / MySQL
- 增加角色权限控制
- 增加日志监控与异常告警

---

## 20. FAQ

### Q1：为什么前台和后台是两个前端项目？

因为两者面向对象不同、交互模式不同、视觉风格不同。拆开后更适合演示，也更适合后续独立部署。

### Q2：为什么开发环境下前台不长期启用 Service Worker？

因为开发环境启用缓存后，容易造成 Vite 资源陈旧、HMR 异常和页面逻辑不一致。当前策略是：**开发环境注销，生产环境注册**。<mccoremem id="01KNA15KDYNKWJW60PGZDRPVXT" />

### Q3：这个项目适合做毕业设计 / 课程设计吗？

适合。它已经具备：

- 用户端完整链路
- 管理端完整链路
- AI 能力主线
- 数据库与种子数据
- 手机演示能力

### Q4：如果我想继续扩展，优先做什么？

优先建议：

1. 路由懒加载与包体优化
2. 权限与安全体系
3. 更真实的楼层平面图
4. 报表模板与导出能力增强

---

## 21. 许可证

MIT
