import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorCode, errorResponse, successResponse } from '../types/response';
import { logger } from '../utils/logger';
import { authenticateToken, requireRole } from '../middleware/auth';

const prisma = new PrismaClient();
const router = express.Router();

// Analytics routes require authentication and admin role (or specific roles)
router.use(authenticateToken);
router.use(requireRole('admin'));

export type TemplateType = 'curator' | 'operations' | 'defense';

// Common data fetching - shared by all templates
const getCommonSnapshotData = async () => {
  const [totalBooks, availableBooks, totalSeats, availableSeats, totalEvents, totalFloors, totalUsers, totalReservations] = await Promise.all([
    prisma.book.count(),
    prisma.book.count({ where: { status: 'available' } }),
    prisma.seat.count(),
    prisma.seat.count({ where: { status: 'available' } }),
    prisma.libraryEvent.count(),
    prisma.floor.count(),
    prisma.user.count(),
    prisma.seatReservation.count(),
  ]);

  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const activeReservations = await prisma.seatReservation.findMany({
    where: {
      status: { in: ['reserved', 'checked_in', 'temporarily_left'] },
      startTime: { gte: twoHoursAgo },
    },
    select: { userId: true },
    distinct: ['userId'],
  });

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const todayReservations = await prisma.seatReservation.count({
    where: { createdAt: { gte: todayStart } },
  });

  const now = new Date();
  const overdueCheckouts = await prisma.bookCheckout.count({
    where: { returned: false, dueDate: { lt: now } },
  });

  // Get category distribution
  const books = await prisma.book.findMany({ select: { category: true } });
  const categoryCount: Record<string, number> = {};
  books.forEach(b => {
    categoryCount[b.category] = (categoryCount[b.category] || 0) + 1;
  });
  const topCategories = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([category, count]) => ({ category, count }));

  // Get seat usage by floor
  const floors = await prisma.floor.findMany({
    select: {
      id: true,
      number: true,
      name: true,
      seats: {
        select: {
          id: true,
          status: true,
        },
      },
    },
    orderBy: { number: 'asc' },
  });

  const seatUsageByFloor = floors.map(floor => {
    const total = floor.seats.length;
    const occupied = floor.seats.filter(s => s.status !== 'available').length;
    return {
      floorId: floor.id,
      floorName: floor.name,
      floorNumber: floor.number,
      total,
      occupied,
      available: total - occupied,
      usageRate: total > 0 ? Math.round((occupied / total) * 100) : 0,
    };
  });

  // Get high violation users
  const highViolationUsers = await prisma.user.findMany({
    where: { violationCount: { gte: 2 } },
    orderBy: { violationCount: 'desc' },
    take: 5,
    select: { id: true, name: true, violationCount: true },
  });

  // Get upcoming events
  const upcomingEvents = await prisma.libraryEvent.findMany({
    where: { date: { gte: new Date() } },
    orderBy: { date: 'asc' },
    take: 5,
    select: { id: true, title: true, date: true },
  });

  // Get popular books (most checked out)
  const checkouts = await prisma.bookCheckout.groupBy({
    by: ['bookId'],
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } },
    take: 5,
  });

  const popularBooks = await Promise.all(
    checkouts.map(async (c) => {
      const book = await prisma.book.findUnique({
        where: { id: c.bookId },
        select: { id: true, title: true, author: true, category: true },
      });
      return book ? { ...book, checkoutCount: c._count.id } : null;
    })
  );

  const validPopularBooks = popularBooks.filter((b): b is {
    id: string;
    title: string;
    author: string;
    category: string;
    checkoutCount: number;
  } => b !== null);

  return {
    // Core stats
    totalBooks,
    availableBooks,
    availableRate: totalBooks > 0 ? Math.round((availableBooks / totalBooks) * 100) : 0,
    totalSeats,
    availableSeats,
    availableSeatsRate: totalSeats > 0 ? Math.round((availableSeats / totalSeats) * 100) : 0,
    totalEvents,
    totalFloors,
    totalUsers,
    totalReservations,
    onlineUsers: activeReservations.length,
    todayReservations,
    overdueCheckouts,
    // Derived data
    topCategories,
    seatUsageByFloor,
    highViolationUsers,
    upcomingEvents,
    popularBooks: validPopularBooks,
    generatedAt: new Date().toISOString(),
  };
};

const toCsv = (rows: Array<Record<string, string | number>>) => {
  if (rows.length === 0) return '';
  const headers = Object.keys(rows[0]);
  const escapeValue = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  const lines = [
    headers.join(','),
    ...rows.map(row => headers.map(header => escapeValue(row[header] ?? '')).join(',')),
  ];
  return lines.join('\n');
};

// Template 1: Curator (馆长视角) - focuses on collection, circulation, acquisition recommendations
const generateCuratorTemplate = (data: Awaited<ReturnType<typeof getCommonSnapshotData>>) => {
  const {
    totalBooks,
    availableBooks,
    availableRate,
    totalSeats,
    availableSeats,
    availableSeatsRate,
    totalEvents,
    totalFloors,
    totalUsers,
    overdueCheckouts,
    topCategories,
    popularBooks,
    upcomingEvents,
    generatedAt,
  } = data;

  // Find imbalanced categories
  const circulationRecommendations: string[] = [];
  if (overdueCheckouts > 5) {
    circulationRecommendations.push(' overdue books need follow-up to improve collection circulation');
  }
  if (availableRate < 30) {
    circulationRecommendations.push('High borrowing rate indicates strong demand, consider acquisition expansion in popular categories');
  }

  // Acquisition suggestions based on popular categories
  const topCategoryNames = topCategories.slice(0, 3).map(c => c.category).join(', ');

  return {
    title: '馆长日报 - 馆藏运营分析',
    templateType: 'curator' as const,
    generatedAt,
    executiveSummary: `馆内现有藏书 ${totalBooks} 册，可借阅 ${availableBooks} 册，馆藏周转率 ${availableRate}%。注册用户 ${totalUsers} 人，当前空间开放座位 ${totalSeats} 个，空位率 ${availableSeatsRate}%。`,
    collectionStatus: {
      totalBooks,
      availableBooks,
      availableRate,
      topCategories: topCategories,
      popularBooks: popularBooks,
    },
    spaceStatus: {
      totalFloors,
      totalSeats,
      availableSeats,
      availableSeatsRate,
    },
    circulationIssues: [
      overdueCheckouts > 0 ? `${overdueCheckouts} 本图书逾期未还` : '无逾期图书记录',
      ...circulationRecommendations,
    ],
    acquisitionRecommendations: [
      `热门馆藏类别：${topCategoryNames}，建议持续关注这些类别的新书采购`,
      availableRate < 25 ? '热门类别可考虑增加复本以满足借阅需求' : '当前复本率基本满足需求',
      upcomingEvents.length > 0 ? `可围绕近期活动"${upcomingEvents[0].title}"搭配推荐相关馆藏` : '暂无近期活动',
    ],
    eventPlanning: {
      totalExistingEvents: totalEvents,
      upcomingEvents: upcomingEvents.length,
      suggestion: upcomingEvents.length < 2 ? '建议补充近期活动以增强用户粘性' : '活动排期合理',
    },
  };
};

// Template 2: Operations (运营视角) - focuses on usage rates, overdue, todos (existing template)
const generateOperationsTemplate = (data: Awaited<ReturnType<typeof getCommonSnapshotData>>) => {
  const {
    totalBooks,
    availableBooks,
    totalSeats,
    availableSeats,
    totalUsers,
    onlineUsers,
    todayReservations,
    overdueCheckouts,
    seatUsageByFloor,
    highViolationUsers,
    upcomingEvents,
    generatedAt,
  } = data;

  const highestFloor = [...seatUsageByFloor].sort((a, b) => b.usageRate - a.usageRate)[0];
  const lowestFloor = [...seatUsageByFloor].sort((a, b) => a.usageRate - b.usageRate)[0];
  const todos: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    metric: string;
    actionSection: string;
  }> = [];

  if (highestFloor && highestFloor.usageRate >= 80) {
    todos.push({
      id: 'seat-pressure-high',
      title: `${highestFloor.floorName} 使用率偏高`,
      description: '建议引导用户分流至低使用率楼层，优化整体空间体验。',
      priority: highestFloor.usageRate >= 92 ? 'high' : 'medium',
      category: '座位运营',
      metric: `${highestFloor.usageRate}%`,
      actionSection: 'seats',
    });
  }

  if (highViolationUsers.length > 0) {
    todos.push({
      id: 'violation-users',
      title: '高违约用户需要跟进',
      description: `${highViolationUsers.length} 位用户违约次数偏高，建议检查预约规则提醒机制。`,
      priority: 'high',
      category: '用户运营',
      metric: `${highViolationUsers.length} 人`,
      actionSection: 'users',
    });
  }

  if (overdueCheckouts > 0) {
    todos.push({
      id: 'overdue-books',
      title: '逾期图书待处理',
      description: '推动逾期提醒和替代推荐，减少热门馆藏流转阻塞。',
      priority: overdueCheckouts >= 10 ? 'high' : 'medium',
      category: '馆藏运营',
      metric: `${overdueCheckouts} 本`,
      actionSection: 'books',
    });
  }

  if (upcomingEvents.length < 2) {
    todos.push({
      id: 'events-gap',
      title: '近期活动内容偏少',
      description: '补充阅读沙龙、馆藏推荐日或体验活动，丰富运营故事线。',
      priority: 'low',
      category: '活动策展',
      metric: `${upcomingEvents.length} 场`,
      actionSection: 'events',
    });
  }

  const sortedUsage = [...seatUsageByFloor].sort((a, b) => a.usageRate - b.usageRate);
  const lowLoadFloor = sortedUsage[0];
  const highLoadFloor = [...seatUsageByFloor].sort((a, b) => b.usageRate - a.usageRate)[0];

  const strategies = [
    {
      title: '备考深度自习用户',
      recommendation: highLoadFloor
        ? `优先引导至 ${highLoadFloor.floorName} 安静区，突出低干扰体验。`
        : '优先引导安静区，突出低干扰长时间学习体验。',
    },
    {
      title: '写作灵感型用户',
      recommendation: lowLoadFloor
        ? `推荐进入 ${lowLoadFloor.floorName} 靠窗区域，强调采光和沉浸氛围。`
        : '推荐靠窗区域，强调采光空间感。',
    },
    {
      title: '讨论协作型用户',
      recommendation: '导向协作区，结合活动页面展示小组学习场景。',
    },
  ];

  const headline = todayReservations >= 12
    ? '今日馆内预约活跃度较高，空间运营进入高频响应状态。'
    : '今日馆内运行平稳，适合强化推荐与活动联动。';

  return {
    title: '运营日报 - 每日待办与策略',
    templateType: 'operations' as const,
    generatedAt,
    headline,
    summary: `总书籍 ${totalBooks} 本，空闲座位 ${availableSeats} 个，在线用户 ${onlineUsers} 人，逾期图书 ${overdueCheckouts} 本。`,
    overview: {
      totalBooks,
      availableBooks,
      totalSeats,
      availableSeats,
      totalUsers,
      onlineUsers,
      todayReservations,
      overdueCheckouts,
    },
    seatUsage: seatUsageByFloor,
    todos,
    strategies,
    insights: [
      {
        title: 'AI 运营建议',
        description: `今日共产生 ${todayReservations} 条预约，座位预约服务已形成稳定使用习惯。`,
      },
      {
        title: 'AI 策展建议',
        description: upcomingEvents.length > 0
          ? `围绕"${upcomingEvents[0].title}"策划馆藏联动推荐，形成推荐流与活动管理闭环。`
          : '建议新增阅读活动联动推荐通知，增强 AI 图书馆运营氛围感。',
      },
    ],
  };
};

// Template 3: Defense (答辩视角) - concise, focused on key metrics and highlights, formal language
const generateDefenseTemplate = (data: Awaited<ReturnType<typeof getCommonSnapshotData>>) => {
  const {
    totalBooks,
    availableBooks,
    totalSeats,
    availableSeats,
    totalEvents,
    totalFloors,
    totalUsers,
    onlineUsers,
    todayReservations,
    overdueCheckouts,
    seatUsageByFloor,
    popularBooks,
    upcomingEvents,
    generatedAt,
  } = data;

  const overallOccupancy = totalSeats > 0 ? Math.round(((totalSeats - availableSeats) / totalSeats) * 100) : 0;

  const keyHighlights = [
    {
      name: '注册用户',
      value: totalUsers.toString(),
    },
    {
      name: '馆藏书籍',
      value: totalBooks.toString(),
    },
    {
      name: '今日预约',
      value: todayReservations.toString(),
    },
    {
      name: '当前在线',
      value: onlineUsers.toString(),
    },
    {
      name: '座位使用率',
      value: `${overallOccupancy}%`,
    },
  ];

  const systemFeatures = [
    'AI 个性化图书推荐基于用户兴趣匹配',
    '智能座位预约系统结合热力图可视化',
    'QR 二维码签到入场，自动化空间管理',
    '实时运营数据看板支持决策',
    '三端架构（用户端/管理端/后台API）可扩展',
  ];

  const innovationPoints = [
    '大语言模型深度整合进图书馆核心服务流程',
    '用户兴趣自动匹配活动与图书推荐',
    '空间氛围 AI 分析辅助座位选择',
    '响应式设计同时支持桌面与移动端演示',
  ];

  return {
    title: 'AI 智慧图书馆项目 - 今日运行简报',
    templateType: 'defense' as const,
    generatedAt,
    projectOverview: 'AI 智慧图书馆是一个基于大语言模型构建的智能化图书馆综合服务平台，集成了推荐、预约、空间管理、运营分析四大核心能力。',
    keyMetrics: keyHighlights,
    currentStatus: {
      infrastructure: {
        floors: totalFloors,
        seats: totalSeats,
        books: totalBooks,
        events: totalEvents,
      },
      todayActivity: {
        reservations: todayReservations,
        activeUsers: onlineUsers,
        overdueBooks: overdueCheckouts,
      },
      overallOccupancy: `${overallOccupancy}%`,
    },
    floorUsage: seatUsageByFloor.map(f => ({
      floor: f.floorName,
      usage: `${f.usageRate}%`,
    })),
    popularBooks: popularBooks.map(b => ({
      title: b.title,
      author: b.author,
      checkouts: b.checkoutCount,
    })),
    upcomingEvents: upcomingEvents.map(e => ({
      title: e.title,
      date: new Date(e.date).toLocaleDateString('zh-CN'),
    })),
    systemFeatures,
    innovationPoints,
    conclusion: overallOccupancy > 60
      ? '平台今日运行良好，用户活跃度符合预期，各项智能化功能正常提供服务。'
      : '平台今日运行正常，可针对性推广吸引更多用户使用智能化服务。',
  };
};

// Get daily brief with template selection
const getDailyBriefByTemplate = async (templateType: TemplateType) => {
  const commonData = await getCommonSnapshotData();

  switch (templateType) {
    case 'curator':
      return generateCuratorTemplate(commonData);
    case 'operations':
      return generateOperationsTemplate(commonData);
    case 'defense':
      return generateDefenseTemplate(commonData);
    default:
      return generateOperationsTemplate(commonData);
  }
};

// Keep original functions for existing API endpoints
const getOverviewSnapshot = async () => {
  const data = await getCommonSnapshotData();
  return {
    totalBooks: data.totalBooks,
    availableBooks: data.availableBooks,
    totalSeats: data.totalSeats,
    availableSeats: data.availableSeats,
    totalEvents: data.totalEvents,
    totalFloors: data.totalFloors,
    totalUsers: data.totalUsers,
    totalReservations: data.totalReservations,
    onlineUsers: data.onlineUsers,
    todayReservations: data.todayReservations,
    overdueCheckouts: data.overdueCheckouts,
  };
};

const getSeatUsageSnapshot = async () => {
  const data = await getCommonSnapshotData();
  return data.seatUsageByFloor;
};

const getOpsCenterSnapshot = async () => {
  const data = await getCommonSnapshotData();
  const highestFloor = [...data.seatUsageByFloor].sort((a, b) => b.usageRate - a.usageRate)[0];
  const todos: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
    metric: string;
    actionLabel: string;
    actionSection: string;
  }> = [];

  if (highestFloor && highestFloor.usageRate >= 80) {
    todos.push({
      id: 'seat-pressure',
      title: `${highestFloor.floorName} 使用率偏高`,
      description: '建议优先检查高峰座位调度，并在前台强化 AI 引导到低负载区域。',
      priority: highestFloor.usageRate >= 92 ? 'high' : 'medium',
      category: '座位运营',
      metric: `${highestFloor.usageRate}%`,
      actionLabel: '查看座位模块',
      actionSection: 'seats',
    });
  }

  if (data.highViolationUsers.length > 0) {
    todos.push({
      id: 'violation-users',
      title: '存在高违约用户需要跟进',
      description: `当前有 ${data.highViolationUsers.length} 位用户违约次数较高，建议核查预约提醒与违约处理策略。`,
      priority: 'high',
      category: '用户运营',
      metric: `${data.highViolationUsers.length} 人`,
      actionLabel: '查看用户模块',
      actionSection: 'users',
    });
  }

  if (data.overdueCheckouts > 0) {
    todos.push({
      id: 'overdue-books',
      title: '逾期图书仍待处理',
      description: '建议推动逾期提醒和推荐替代资源，减少热门馆藏的流转阻塞。',
      priority: data.overdueCheckouts >= 10 ? 'high' : 'medium',
      category: '馆藏运营',
      metric: `${data.overdueCheckouts} 本`,
      actionLabel: '查看书籍模块',
      actionSection: 'books',
    });
  }

  if (data.upcomingEvents.length < 2) {
    todos.push({
      id: 'events-gap',
      title: '近期活动内容偏少',
      description: '可以补充 AI 阅读沙龙、馆藏推荐日或学习空间体验活动，增强平台运营故事线。',
      priority: 'low',
      category: '活动策展',
      metric: `${data.upcomingEvents.length} 场`,
      actionLabel: '查看活动模块',
      actionSection: 'events',
    });
  }

  const insights = [
    {
      title: 'AI 运营建议',
      description: `今日共有 ${data.todayReservations} 条预约，可结合预约热力与用户兴趣，自动生成明日座位引导策略。`,
    },
    {
      title: 'AI 策展建议',
      description: data.upcomingEvents.length > 0
        ? `可围绕“${data.upcomingEvents[0].title}”策划馆藏联动推荐，让前台推荐流与后台活动管理形成闭环。`
        : '建议新增阅读活动并联动推荐、通知与管理员看板，增强平台的 AI 图书馆运营感。',
    },
  ];

  return {
    todos,
    insights,
    generatedAt: new Date().toISOString(),
  };
};

const getLibraryStrategySnapshot = async () => {
  const data = await getCommonSnapshotData();
  const sortedUsage = [...data.seatUsageByFloor].sort((a, b) => a.usageRate - b.usageRate);
  const lowLoadFloor = sortedUsage[0];
  const highLoadFloor = [...data.seatUsageByFloor].sort((a, b) => b.usageRate - a.usageRate)[0];

  return {
    title: '今日馆舍策略',
    summary: `当前在线 ${data.onlineUsers} 人，今日预约 ${data.todayReservations} 次，建议通过分层引导提升空间利用均衡度。`,
    strategies: [
      {
        title: '备考与深度自习用户',
        recommendation: highLoadFloor
          ? `优先引导至 ${highLoadFloor.floorName} 的安静区，突出低干扰与长时间学习体验。`
          : '优先引导至安静区，突出低干扰与长时间学习体验。',
      },
      {
        title: '写作与灵感型用户',
        recommendation: lowLoadFloor
          ? `推荐进入 ${lowLoadFloor.floorName} 的靠窗区域，强调采光、空间感与沉浸氛围。`
          : '推荐进入靠窗区域，强调采光、空间感与沉浸氛围。',
      },
      {
        title: '讨论与协作型用户',
        recommendation: `建议集中导向协作区，并结合活动运营页面展示小组学习与阅读沙龙场景。`,
      },
    ],
    generatedAt: new Date().toISOString(),
  };
};

// Overview stats
router.get('/overview', async (req, res) => {
  try {
    const overview = await getOverviewSnapshot();
    res.json(successResponse(overview));
  } catch (error) {
    logger.error('Error getting overview:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取概览数据失败，请重试'));
  }
});

// Real-time data
router.get('/realtime', async (req, res) => {
  try {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const [onlineUsers, activeReservations, availableSeats] = await Promise.all([
      prisma.seatReservation.findMany({
        where: {
          status: { in: ['reserved', 'checked_in', 'temporarily_left'] },
          startTime: { gte: twoHoursAgo },
        },
        select: { userId: true },
        distinct: ['userId'],
      }),
      prisma.seatReservation.count({
        where: { status: { in: ['reserved', 'checked_in'] } },
      }),
      prisma.seat.count({ where: { status: 'available' } }),
    ]);

    res.json(successResponse({
      onlineUsers: onlineUsers.length,
      activeReservations,
      availableSeats,
    }));
  } catch (error) {
    logger.error('Error getting realtime data:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取实时数据失败，请重试'));
  }
});

// Borrow trend (daily checkouts for the last N days)
router.get('/borrow-trend', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const checkouts = await prisma.bookCheckout.findMany({
      where: { checkoutDate: { gte: startDate } },
      select: { checkoutDate: true },
    });

    // Group by date in JS
    const trendMap: Record<string, number> = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      trendMap[key] = 0;
    }

    checkouts.forEach(c => {
      const key = c.checkoutDate.toISOString().split('T')[0];
      if (trendMap[key] !== undefined) trendMap[key]++;
    });

    const trend = Object.entries(trendMap).map(([date, count]) => ({ date, count }));
    res.json(successResponse(trend));
  } catch (error) {
    logger.error('Error getting borrow trend:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取借阅趋势失败，请重试'));
  }
});

// Seat usage by floor
router.get('/seat-usage', async (req, res) => {
  try {
    const usage = await getSeatUsageSnapshot();
    res.json(successResponse(usage));
  } catch (error) {
    logger.error('Error getting seat usage:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取座位使用率失败，请重试'));
  }
});

// Popular books (most checked out)
router.get('/popular-books', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;

    const checkouts = await prisma.bookCheckout.groupBy({
      by: ['bookId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
      take: limit,
    });

    const books = await Promise.all(
      checkouts.map(async (c) => {
        const book = await prisma.book.findUnique({
          where: { id: c.bookId },
          select: { id: true, title: true, author: true, category: true },
        });
        return {
          ...book,
          checkoutCount: c._count.id,
        };
      })
    );

    res.json(successResponse(books.filter(Boolean)));
  } catch (error) {
    logger.error('Error getting popular books:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取热门图书失败，请重试'));
  }
});

// Event participation
router.get('/event-participation', async (req, res) => {
  try {
    const events = await prisma.libraryEvent.findMany({
      orderBy: { date: 'desc' },
      take: 10,
    });

    // Since there's no direct participation model, use interest count from the JSON field
    const result = events.map(e => {
      const interests = Array.isArray(e.interests) ? e.interests : [];
      return {
        id: e.id,
        title: e.title,
        category: e.category,
        date: e.date,
        participantCount: interests.length,
      };
    });

    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error getting event participation:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取活动参与数据失败，请重试'));
  }
});

// Time usage analysis (hourly seat usage for today)
router.get('/time-period-analysis', async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reservations = await prisma.seatReservation.findMany({
      where: {
        startTime: { gte: today, lt: tomorrow },
        status: { not: 'canceled' },
      },
      select: { startTime: true, endTime: true },
    });

    const totalSeats = await prisma.seat.count();

    // Build hourly usage (8am to 10pm)
    const hours: { hour: number; label: string; usageRate: number }[] = [];
    for (let h = 8; h <= 22; h++) {
      const hourStart = new Date(today);
      hourStart.setHours(h, 0, 0, 0);
      const hourEnd = new Date(today);
      hourEnd.setHours(h + 1, 0, 0);

      const active = reservations.filter(
        r => r.startTime < hourEnd && r.endTime > hourStart
      ).length;

      hours.push({
        hour: h,
        label: `${h}:00`,
        usageRate: totalSeats > 0 ? Math.round((active / totalSeats) * 100) : 0,
      });
    }

    res.json(successResponse(hours));
  } catch (error) {
    logger.error('Error getting time usage:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取时段分析失败，请重试'));
  }
});

// Category distribution
router.get('/category-distribution', async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      select: { category: true },
    });

    const dist: Record<string, number> = {};
    books.forEach(b => {
      dist[b.category] = (dist[b.category] || 0) + 1;
    });

    const result = Object.entries(dist)
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count);

    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error getting category distribution:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取分类分布失败，请重试'));
  }
});

// Atmosphere history trend
router.get('/atmosphere-trend', async (req, res) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    const history = await prisma.atmosphereHistory.findMany({
      where: { recordedAt: { gte: startDate } },
      include: { floor: { select: { name: true } } },
      orderBy: { recordedAt: 'asc' },
    });

    // Group by date and floor to get daily averages
    const trendMap: Record<string, Record<string, { total: number; count: number }>> = {};

    history.forEach(record => {
      const dateKey = record.recordedAt.toISOString().split('T')[0];
      const floorName = record.floor.name;

      if (!trendMap[dateKey]) trendMap[dateKey] = {};
      if (!trendMap[dateKey][floorName]) {
        trendMap[dateKey][floorName] = { total: 0, count: 0 };
      }
      
      trendMap[dateKey][floorName].total += record.overall;
      trendMap[dateKey][floorName].count += 1;
    });

    // Format output
    const dates = Array.from({ length: days }, (_, i) => {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      return d.toISOString().split('T')[0];
    });

    const result = dates.map(date => {
      const dayData: any = { date: date.slice(5) }; // MM-DD
      
      if (trendMap[date]) {
        Object.entries(trendMap[date]).forEach(([floor, data]) => {
          dayData[floor] = Math.round(data.total / data.count);
        });
      }
      return dayData;
    });

    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error getting atmosphere trend:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取氛围历史趋势失败，请重试'));
  }
});

// Anomaly alerts
router.get('/anomalies', async (req, res) => {
  try {
    const alerts: { type: 'warning' | 'danger' | 'info'; title: string; message: string }[] = [];

    // High violation users
    const highViolationUsers = await prisma.user.findMany({
      where: { violationCount: { gte: 3 } },
      select: { id: true, name: true, email: true, violationCount: true },
    });
    if (highViolationUsers.length > 0) {
      alerts.push({
        type: 'danger',
        title: '高违约用户',
        message: `${highViolationUsers.length} 位用户违约次数达到 3 次或以上`,
      });
    }

    // Peak usage alert (>85% occupancy)
    const totalSeats = await prisma.seat.count();
    const occupiedSeats = await prisma.seat.count({ where: { status: { not: 'available' } } });
    if (totalSeats > 0 && (occupiedSeats / totalSeats) > 0.85) {
      alerts.push({
        type: 'warning',
        title: '座位紧张',
        message: `当前座位使用率 ${Math.round((occupiedSeats / totalSeats) * 100)}%`,
      });
    }

    // Overdue books
    const now = new Date();
    const overdueCount = await prisma.bookCheckout.count({
      where: { returned: false, dueDate: { lt: now } },
    });
    if (overdueCount > 0) {
      alerts.push({
        type: 'warning',
        title: '逾期图书',
        message: `${overdueCount} 本图书已逾期未还`,
      });
    }

    // Low availability
    if (totalSeats > 0 && (occupiedSeats / totalSeats) > 0.95) {
      alerts.push({
        type: 'danger',
        title: '座位几乎满员',
        message: `仅剩 ${totalSeats - occupiedSeats} 个空闲座位`,
      });
    }

    res.json(successResponse({ alerts, highViolationUsers }));
  } catch (error) {
    logger.error('Error getting anomalies:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取异常告警失败，请重试'));
  }
});

router.get('/ops-center', async (req, res) => {
  try {
    const data = await getOpsCenterSnapshot();
    res.json(successResponse(data));
  } catch (error) {
    logger.error('Error getting ops center:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取运营待办中心失败，请重试'));
  }
});

router.get('/library-strategy', async (req, res) => {
  try {
    const data = await getLibraryStrategySnapshot();
    res.json(successResponse(data));
  } catch (error) {
    logger.error('Error getting library strategy:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取馆舍策略失败，请重试'));
  }
});

router.get('/daily-brief', async (req, res) => {
  try {
    const templateType = (req.query.templateType as TemplateType) || 'operations';
    const data = await getDailyBriefByTemplate(templateType);
    res.json(successResponse(data));
  } catch (error) {
    logger.error('Error getting daily brief:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '生成运营日报失败，请重试'));
  }
});

router.get('/export/overview', async (req, res) => {
  try {
    const overview = await getOverviewSnapshot();
    const csv = toCsv([
      {
        统计时间: new Date().toISOString(),
        总书籍: overview.totalBooks,
        可借阅书籍: overview.availableBooks,
        总座位: overview.totalSeats,
        空闲座位: overview.availableSeats,
        总活动: overview.totalEvents,
        总楼层: overview.totalFloors,
        总用户: overview.totalUsers,
        总预约: overview.totalReservations,
        在线用户: overview.onlineUsers,
        今日预约: overview.todayReservations,
        逾期图书: overview.overdueCheckouts,
      },
    ]);

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-library-overview.csv"');
    res.send(`\uFEFF${csv}`);
  } catch (error) {
    logger.error('Error exporting overview report:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '导出报表失败，请重试'));
  }
});

router.get('/export/seat-usage', async (req, res) => {
  try {
    const usage = await getSeatUsageSnapshot();
    const csv = toCsv(
      usage.map(item => ({
        楼层编号: item.floorNumber,
        楼层名称: item.floorName,
        座位总数: item.total,
        已占用: item.occupied,
        空闲座位: item.available,
        使用率: `${item.usageRate}%`,
      }))
    );

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="ai-library-seat-usage.csv"');
    res.send(`\uFEFF${csv}`);
  } catch (error) {
    logger.error('Error exporting seat usage report:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '导出报表失败，请重试'));
  }
});

// AI Procurement Suggestions
router.get('/procurement-suggestions', async (req, res) => {
  try {
    const { openai } = await import('../services/claude');
    
    // Get recent zero-result queries
    const zeroResultQueries = await prisma.searchQuery.findMany({
      where: { results: 0 },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    if (zeroResultQueries.length === 0) {
      return res.json(successResponse({
        suggestions: [],
        message: "近期没有未满足的搜索请求，馆藏资源充足。",
        analyzedCount: 0
      }));
    }

    const queries = zeroResultQueries.map(q => q.query);
    
    const systemPrompt = `你是一个大学图书馆的高级馆藏采购参谋。
以下是过去一段时间内，读者在图书馆搜索但**没有找到任何结果（馆藏为空）**的搜索词列表：
${JSON.stringify(queries)}

你的任务是：
1. 分析这些搜索词，归纳出读者可能正在寻找的热门方向或缺失的学科领域。
2. 推荐 3-5 本具体、高质量、广受好评的书籍，来填补这些馆藏空白。
3. 提供一段采购建议的总结报告。

请严格返回以下 JSON 格式：
{
  "message": "一段专业的采购参谋总结（例如：'近期学生对Rust开发和设计模式的需求较高，建议补充相关最新书籍。'）",
  "suggestions": [
    {
      "title": "推荐购买的书名",
      "author": "作者",
      "reason": "推荐理由，关联到具体缺失的搜索词",
      "urgency": "high"
    }
  ]
}`;

    let result;
    try {
      const response = await openai.chat.completions.create({
        model: process.env.MODEL_NAME || 'glm-4',
        messages: [{ role: 'user', content: systemPrompt }],
        temperature: 0.7,
      });

      const content = response.choices[0]?.message?.content;
      if (content) {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        result = JSON.parse(jsonString);
      }
    } catch (apiError) {
      logger.error('AI API failed for procurement suggestions, using fallback:', apiError);
    }

    if (!result) {
      result = {
        message: "AI 分析服务暂不可用，以下是原始搜索词频统计：",
        suggestions: [
          {
            title: "暂无明确推荐",
            author: "N/A",
            reason: "请根据近期搜索词人工决策",
            urgency: "low"
          }
        ]
      };
    }

    result.analyzedCount = zeroResultQueries.length;
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error getting procurement suggestions:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取采购建议失败'));
  }
});

export default router;
