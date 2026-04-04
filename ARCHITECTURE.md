# AI 智慧图书馆平台架构说明

本文档用于补充 README，重点描述系统分层、数据流、主要模块职责以及适合继续演进的方向。

---

## 1. 总体架构

项目采用 monorepo 组织方式，包含三个主运行端和一个数据层：

```text
用户前台 frontend
管理员后台 admin-frontend
        ↓
      backend
        ↓
 Prisma + SQLite
        ↓
 OpenAI 兼容模型接口
```

### 各层职责

- **frontend**
  - 面向读者
  - 提供找书、推荐、座位预约、问答、通知、收藏等体验
- **admin-frontend**
  - 面向图书馆管理员或答辩演示者
  - 提供运营总览、图书管理、楼层座位管理、活动管理、用户管理、报表导出等能力
- **backend**
  - 提供统一 REST API
  - 处理业务逻辑、数据查询、AI 调用、统计聚合
- **Prisma + SQLite**
  - 提供轻量、可本地运行的数据层
  - 适合演示、课程设计和原型阶段
- **OpenAI 兼容模型接口**
  - 提供自然语言搜索、座位推荐、问答、运营摘要等 AI 能力

---

## 2. 前后端关系

### 用户前台

前台通过 `frontend/src/utils/api.ts` 与后端通信，核心业务包括：

- 图书搜索与 ISBN 搜索
- 推荐获取
- 座位预约 / 签到 / 续约 / 退座
- AI 问答
- 通知获取与标记已读
- 我的借阅 / 我的预约

### 管理员后台

后台通过 `admin-frontend/src/utils/api.ts` 与后端通信，核心业务包括：

- 后台登录
- 图书 CRUD
- 楼层与座位 CRUD
- 活动 CRUD
- 用户列表查看
- 总览图表与统计接口
- 运营待办、今日馆舍策略、AI 日报、导出报表

### 后端

后端统一挂载到 `/api/*`，将业务划分为多个 route 文件：

- `/api/auth`
- `/api/books`
- `/api/recommendations`
- `/api/seats`
- `/api/chat`
- `/api/notifications`
- `/api/my-activity`
- `/api/qr-checkin`
- `/api/admin`
- `/api/analytics`

---

## 3. 前台架构

### 前台主要分层

```text
App.tsx
├── 路由装配
├── 页面级组件
├── 全局布局
└── Zustand 状态同步
```

### 主要模块

- **layout/**
  - 桌面端导航、移动端底部导航、移动头部、页面过渡
- **features/book-search/**
  - 图书检索入口与结果展示
- **features/barcode-scanner/**
  - 摄像头扫码与 ISBN 手动降级方案
- **features/recommendations/**
  - 推荐流与推荐理由
- **features/seat-map/**
  - 当前最复杂的前台模块
  - 已拆为多个组件和一个 `useSeatReservation` hook
- **features/chat-assistant/**
  - AI 图书馆助手
- **features/my-activity/**
  - 我的借阅与我的预约
- **features/notifications/**
  - 通知中心
- **features/bookmarks/**
  - 收藏夹
- **features/qr-checkin/**
  - 二维码签到相关界面

### 状态管理

前台使用 Zustand 管理以下信息：

- 当前用户
- 当前页面
- 当前楼层
- 收藏夹
- 通知数量

并通过 localStorage 做部分持久化，保证刷新后演示状态不丢失。

### 路由

前台已改为真实路由，主要路径包括：

- `/login`
- `/scan`
- `/search`
- `/for-you`
- `/seats`
- `/my-activity`
- `/bookmarks`
- `/chat`
- `/notifications`

---

## 4. 座位预约模块架构

座位预约是前台最复杂、最具产品感的模块，目前已经从单文件拆分为多组件结构。

### 当前结构

```text
features/seat-map/
├── SeatReservation.tsx         # 页面装配入口
├── SeatHeatmap.tsx             # 座椅视图 + SVG 平面图 + 氛围评分
├── SeatExperienceHero.tsx      # 顶部体验说明区
├── ReservationTabs.tsx         # 预约 / 快速选座 / 历史 / 规则
├── ReservationCalendar.tsx     # 日期选择
├── CurrentReservationCard.tsx  # 当前预约信息
├── SeatBookingPanel.tsx        # 当前选中座位的预约表单
├── ReservationHistoryList.tsx  # 历史记录
├── ReservationRules.tsx        # 规则说明
└── seatReservationUtils.ts     # 工具函数与学习模式配置
```

### 逻辑中心

`frontend/src/hooks/useSeatReservation.ts`

负责：

- 查询 AI 找座
- 座位预约
- 当前预约获取
- 历史记录获取
- 签到
- 暂离
- 恢复
- 续约
- 退座
- 倒计时
- 学习模式注入查询语义

### 当前 AI 体验设计

- 学习模式切换：备考 / 自习 / 写作 / 讨论
- 空间氛围评分：安静度 / 采光感 / 插座密度 / 拥挤度
- 双视图：座椅卡片视图 + SVG 平面图视图

---

## 5. 管理后台架构

### 后台主要分层

```text
App.tsx
├── 登录态判断
├── 真实路由映射
├── AdminLayout
└── 各后台模块页面
```

### 主要模块

- **dashboard/**
  - 管理首页的核心能力中心
  - 包含统计卡、趋势图、待办、策略、报表、日报
- **books/**
  - 书籍管理
- **seats/**
  - 楼层与座位管理
- **events/**
  - 活动管理
- **users/**
  - 用户管理
- **layout/**
  - 侧边栏、顶部命令栏、整体容器

### 路由

后台已改为真实路由，主要路径包括：

- `/login`
- `/dashboard`
- `/books`
- `/seats`
- `/events`
- `/users`

### 后台首页的定位

后台首页不是简单的数据堆叠，而是一个“适合讲故事”的运营驾驶舱，主要用于：

- 课程设计答辩
- 项目路演
- 运营能力展示
- 管理端闭环说明

### 当前后台 AI 化能力

- 运营待办中心
- 今日馆舍策略
- AI 运营日报生成器
- CSV 导出
- PDF 导出

---

## 6. 后端架构

### backend/src/index.ts

后端入口负责：

- 初始化 Express
- 注册中间件
- 处理 CORS
- 挂载所有 API 路由
- 启动服务

### 主要 route 分工

- **auth.ts**
  - 用户 / 管理员登录
  - 逾期借阅检查
- **books.ts**
  - 图书搜索、ISBN 查询、到货提醒
- **recommendations.ts**
  - 推荐与导读
- **seats.ts**
  - 座位相关的核心业务接口
- **chat.ts**
  - AI 助手流式输出
- **notifications.ts**
  - 通知与活动兴趣匹配
- **my-activity.ts**
  - 用户个人页数据
- **qr-checkin.ts**
  - 二维码签到
- **admin.ts**
  - 后台管理接口
- **analytics.ts**
  - 统计、待办、策略、日报、导出

### AI 服务封装

`backend/src/services/claude.ts`

虽然文件名仍是 `claude.ts`，但当前职责实际是：

- 封装 OpenAI 兼容客户端
- 注入系统提示词
- 读取图书馆知识文档
- 为问答与推荐提供模型调用入口

---

## 7. 数据模型架构

项目数据模型位于 `prisma/schema.prisma`。

### 核心实体

- **User**
  - 普通用户与管理员
- **Book**
  - 图书基础信息
- **BookCheckout**
  - 借阅记录
- **BookArrivalNotification**
  - 图书到货提醒
- **Floor**
  - 图书馆楼层
- **Seat**
  - 座位实体
- **SeatReservation**
  - 预约记录
- **LibraryEvent**
  - 图书馆活动
- **Notification**
  - 用户通知

### 实体关系概览

```text
User
├── BookCheckout
├── BookArrivalNotification
├── SeatReservation
└── Notification

Floor
└── Seat

Seat
└── SeatReservation
```

---

## 8. 演示数据机制

`prisma/seed.ts` 负责初始化演示环境，包括：

- 演示用户
- 管理员账号
- 图书数据
- 楼层数据
- 座位数据
- 活动数据
- 通知数据

这使得项目可以做到：

- 克隆后快速初始化
- 不依赖手工录入数据
- 演示路径可复现

---

## 9. 运行链路

### 本地开发

根目录执行：

```bash
npm run dev
```

会同时启动：

- backend：3001
- frontend：5173
- admin-frontend：5174

### 手机演示

- 同一 Wi‑Fi：直接访问局域网地址
- 不同网络：使用 `npm run dev:tunnel`

### 构建

```bash
npm run build
```

根脚本会依次构建：

- backend
- frontend
- admin-frontend

---

## 10. 当前架构优势

- 三端边界清晰
- 功能闭环完整
- 演示体验强
- 后台具备较高展示价值
- 前台已具备较强品牌感和移动适配能力
- 适合作为二次开发基础

---

## 11. 当前架构限制

- 鉴权体系仍偏演示级
- SQLite 更适合本地环境
- 前后台包体仍较大
- AI 服务仍有部分知识文档内嵌
- 后端尚未形成统一的生产级错误码与测试体系

---

## 12. 下一步架构建议

### 工程方向

- 做前后台路由级懒加载
- 对大图表、大模块、大导出依赖做分包
- 增加 lint、test、CI

### 产品方向

- 做可编辑的楼层平面图配置
- 为 AI 日报增加多模板
- 增加推荐理由卡与运营解释层

### 生产化方向

- JWT / Session 鉴权
- 密码哈希
- 权限中间件
- PostgreSQL / MySQL
- 更完善的日志、监控和限流

---

## 13. 建议配合阅读

- [README.md](file:///Users/mac/Desktop/1/README.md)
- [API.md](file:///Users/mac/Desktop/1/API.md)
