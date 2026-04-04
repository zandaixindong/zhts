# AI 智慧图书馆平台 API 说明

本文档按“接口分组 + 用途”说明当前后端 API，适合作为开发接入和功能排查参考。

说明：

- 所有接口默认由后端服务提供
- 默认本地基础地址为 `http://localhost:3001/api`
- 当前项目偏演示型，部分接口返回结构较灵活，建议以前端现有调用方式为准

---

## 1. 基础信息

### Base URL

```text
http://localhost:3001/api
```

### 主要分组

- `/auth`
- `/books`
- `/recommendations`
- `/seats`
- `/chat`
- `/notifications`
- `/my-activity`
- `/qr-checkin`
- `/admin`
- `/analytics`

---

## 2. 认证相关 `/auth`

### `POST /auth/login`

用途：

- 用户前台登录
- 管理后台登录

请求示例：

```json
{
  "email": "demo@university.edu",
  "password": "demo"
}
```

典型返回：

```json
{
  "success": true,
  "user": {
    "id": "xxx",
    "name": "Demo User",
    "email": "demo@university.edu",
    "role": "user"
  }
}
```

### `GET /auth/check-overdue/:userId`

用途：

- 检查用户是否存在逾期借阅

---

## 3. 图书相关 `/books`

### `POST /books/search`

用途：

- 自然语言找书

典型能力：

- 按关键词搜索
- 返回图书列表
- 支持更接近语义化的查询

### `GET /books/isbn/:isbn`

用途：

- 通过 ISBN 查找书籍
- 条码扫描与手动 ISBN 搜索都依赖此接口

### `POST /books/arrival-notification`

用途：

- 为已借出的图书登记到货提醒

---

## 4. 推荐相关 `/recommendations`

### `GET /recommendations/:userId`

用途：

- 获取某个用户的个性化推荐列表

### `POST /recommendations/summary`

用途：

- 为推荐书目生成导读摘要或说明

---

## 5. 座位相关 `/seats`

这是当前最核心的业务分组之一。

### `GET /seats/floors`

用途：

- 获取所有楼层列表

### `GET /seats/floor/:floorId`

用途：

- 获取某个楼层的全部座位
- 前台热力图和 SVG 平面图都依赖该接口

### `POST /seats/find`

用途：

- 自然语言找座

典型输入语义：

- 安静区靠近插座
- 靠窗写作位
- 讨论区
- 备考专注位

### `POST /seats/reserve`

用途：

- 创建预约

典型请求：

```json
{
  "seatId": "seat_xxx",
  "duration": 2,
  "userId": "user_xxx",
  "startTime": "2026-04-04T10:00:00.000Z"
}
```

### `POST /seats/cancel`

用途：

- 取消预约

### `GET /seats/my-reservation/:userId`

用途：

- 获取用户当前有效预约

### `GET /seats/history/:userId`

用途：

- 获取用户预约历史

### `POST /seats/checkin`

用途：

- 用户到座后签到

### `POST /seats/temporary-leave`

用途：

- 暂离

### `POST /seats/unlock`

用途：

- 暂离后恢复使用

### `POST /seats/finish`

用途：

- 主动退座

### `POST /seats/extend`

用途：

- 续约

### `GET /seats/violation-status/:userId`

用途：

- 检查是否达到违约上限

---

## 6. AI 助手 `/chat`

### `POST /chat`

用途：

- 图书馆 AI 问答
- 支持流式输出

典型问法：

- APA 格式如何引用图书
- 图书馆几点闭馆
- 如何预约座位

---

## 7. 通知相关 `/notifications`

### `GET /notifications/:userId`

用途：

- 获取用户通知列表

### `POST /notifications/read`

用途：

- 标记通知已读

### `POST /notifications/match-events`

用途：

- AI 根据兴趣匹配活动通知

---

## 8. 我的活动 `/my-activity`

### `GET /my-activity/borrowing/:userId`

用途：

- 获取用户当前借阅信息

### `GET /my-activity/reservations/:userId`

用途：

- 获取用户当前预约信息

---

## 9. 二维码签到 `/qr-checkin`

### `GET /qr-checkin/:reservationId`

用途：

- 获取预约对应的二维码数据

### `POST /qr-checkin/verify`

用途：

- 扫码后核验预约身份并完成签到

---

## 10. 后台管理 `/admin`

后台管理接口主要用于 CRUD 和列表查询。

### 图书管理

- `GET /admin/books`
- `POST /admin/books`
- `PUT /admin/books/:id`
- `DELETE /admin/books/:id`

### 楼层管理

- `GET /admin/floors`
- `POST /admin/floors`
- `PUT /admin/floors/:id`
- `DELETE /admin/floors/:id`

### 座位管理

- `GET /admin/seats`
- `POST /admin/seats`
- `PUT /admin/seats/:id`
- `DELETE /admin/seats/:id`

### 活动管理

- `GET /admin/events`
- `POST /admin/events`
- `PUT /admin/events/:id`
- `DELETE /admin/events/:id`

### 用户管理

- `GET /admin/users`

说明：

- 当前用户模块以查看列表和行为统计为主
- 如果后续要做更完整的后台权限体系，建议拆出独立 `users` 管理分组

---

## 11. 分析与看板 `/analytics`

这是管理员后台的数据驱动核心。

### `GET /analytics/overview`

用途：

- 获取总览指标

典型内容：

- 总书籍
- 可借阅书籍
- 总座位
- 空闲座位
- 总活动
- 总楼层
- 总用户
- 总预约
- 在线用户
- 今日预约
- 逾期图书

### `GET /analytics/borrow-trend`

用途：

- 借阅趋势图

### `GET /analytics/seat-usage`

用途：

- 各楼层座位占用率

### `GET /analytics/popular-books`

用途：

- 热门图书统计

### `GET /analytics/event-participation`

用途：

- 活动参与情况

### `GET /analytics/time-period-analysis`

用途：

- 时段使用率分析

### `GET /analytics/category-distribution`

用途：

- 图书分类分布

### `GET /analytics/anomalies`

用途：

- 异常预警

典型内容：

- 高违约用户
- 座位紧张提醒
- 逾期图书

### `GET /analytics/ops-center`

用途：

- 运营待办中心

返回内容包括：

- todo 列表
- insight 列表
- 生成时间

### `GET /analytics/library-strategy`

用途：

- 今日馆舍策略

返回内容包括：

- 策略标题
- 总结说明
- 针对不同类型用户的引导建议

### `GET /analytics/daily-brief`

用途：

- 生成 AI 运营日报摘要

返回内容包括：

- 标题
- 头条总结
- 总体摘要
- 核心亮点
- 行动建议

### `GET /analytics/export/overview`

用途：

- 导出运营总览 CSV

### `GET /analytics/export/seat-usage`

用途：

- 导出楼层座位使用情况 CSV

---

## 12. 前后台接口依赖关系

### 前台依赖较多的接口

- `/auth/login`
- `/books/search`
- `/books/isbn/:isbn`
- `/recommendations/:userId`
- `/seats/*`
- `/chat`
- `/notifications/*`
- `/my-activity/*`
- `/qr-checkin/*`

### 后台依赖较多的接口

- `/auth/login`
- `/admin/*`
- `/analytics/*`

---

## 13. 开发建议

### 如果你要新增用户功能

优先查看：

- `frontend/src/utils/api.ts`
- `backend/src/routes/对应模块.ts`
- `frontend/src/components/features/对应模块/`

### 如果你要新增后台功能

优先查看：

- `admin-frontend/src/utils/api.ts`
- `backend/src/routes/admin.ts`
- `backend/src/routes/analytics.ts`
- `admin-frontend/src/components/dashboard/`

### 如果你要新增 AI 能力

优先查看：

- `backend/src/services/claude.ts`
- `backend/src/routes/chat.ts`
- `backend/src/routes/recommendations.ts`
- `backend/src/routes/seats.ts`
- `backend/src/routes/analytics.ts`

---

## 14. 后续建议

- 为接口补统一响应格式
- 补中间件鉴权与角色权限校验
- 增加 Swagger / OpenAPI 文档
- 为分析接口增加时间范围筛选
- 为报表接口增加 PDF / PNG 导出

---

## 15. 建议配合阅读

- [README.md](file:///Users/mac/Desktop/1/README.md)
- [ARCHITECTURE.md](file:///Users/mac/Desktop/1/ARCHITECTURE.md)
