import express from 'express';
import { openai } from '../services/claude';
import { seatTools, handleSeatToolCall, getSeatsForFloor, getAllFloors, cancelReservation } from '../tools/seatTools';
import { DEMO_USER_ID } from '../types';
import { PrismaClient } from '@prisma/client';
import { ErrorCode, errorResponse, successResponse } from '../types/response';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Get all floors
router.get('/floors', async (req, res) => {
  try {
    const floors = await getAllFloors();
    res.json(successResponse(floors));
  } catch (error) {
    logger.error('Error getting floors:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取楼层列表失败，请重试'));
  }
});

// Get seats for a specific floor (for heatmap)
router.get('/floor/:floorId', async (req, res) => {
  try {
    const { floorId } = req.params;

    if (!floorId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'floorId 不能为空'));
    }

    const seats = await getSeatsForFloor(floorId);
    res.json(successResponse(seats));
  } catch (error) {
    logger.error('Error getting seats:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取座位列表失败，请重试'));
  }
});

// AI-powered seat finding
router.post('/find', async (req, res) => {
  try {
    const { query, floorId, userId = DEMO_USER_ID } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '查询描述不能为空'));
    }

    const systemPrompt = `你是AI助手，帮助用户在图书馆找座和预约。

流程：
1. 理解用户想要什么 - 他们可能有偏好，比如"靠近插座的安静座位"、"靠窗座位"、"小组学习区"
2. 使用 find_available_seats 工具获取符合条件的当前可用座位
3. 如果他们想要热力图，使用 get_seat_heatmap 获取当前占用情况
4. 用户选座后，使用 reserve_seat 为他们预约
5. 清晰解释你的建议 - 为什么为他们的需求选择这些特定座位

**所有输出必须使用中文**，message 和 explanation 必须是中文。

将结果以 JSON 格式放在 <result> 标签内返回：
<result>
{
  "seats": [匹配的座位对象数组],
  "message": "自然语言解释你找到了什么，为什么这些座位符合他们的需求",
  "explanation": "如果需要可以添加额外解释"
}
</result>

乐于助人 - 如果图书馆拥挤且选项不多，请诚实但建议最好的可用选项。`;

    // Get the search done via tool and let AI format the response
    const result = await handleSeatToolCall('find_available_seats', { query, floorId, userId });
    if (!('seats' in result)) {
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '座位搜索失败，请重试'));
    }
    const { seats } = result;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `User query: ${query}${floorId ? ` on floor ${floorId}` : ''}.
Found the following seats: ${JSON.stringify(seats, null, 2)}.

Please return the final result in JSON inside <result> tags.`,
      },
    ];

    const finalResponse = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'glm-4',
      max_tokens: 4096,
      messages,
      temperature: 0.7,
    });

    const finalText = finalResponse.choices[0]?.message?.content || '';

    const resultMatch = finalText.match(/<result>([\s\S]*?)<\/result>/);
    if (resultMatch) {
      const resultJson = JSON.parse(resultMatch[1]);
      res.json(successResponse(resultJson));
    } else {
      try {
        const resultJson = JSON.parse(finalText.trim());
        res.json(successResponse(resultJson));
      } catch (e) {
        logger.error('Failed to parse AI response:', e);
        res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '解析 AI 响应失败'));
      }
    }
  } catch (error) {
    logger.error('Error finding seats:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '找座失败，请重试'));
  }
});

// Reserve a seat
router.post('/reserve', async (req, res) => {
  try {
    const { seatId, duration, userId = DEMO_USER_ID, startTime } = req.body;

    if (!seatId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'seatId 不能为空'));
    }
    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const result = await handleSeatToolCall('reserve_seat', { seatId, duration, userId, startTime });
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error reserving seat:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '预约座位失败，请重试'));
  }
});

// Cancel reservation
router.post('/cancel', async (req, res) => {
  try {
    const { seatId, userId = DEMO_USER_ID } = req.body;

    if (!seatId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'seatId 不能为空'));
    }
    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const result = await cancelReservation(seatId, userId);
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error canceling reservation:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '取消预约失败，请重试'));
  }
});

// Get user's current active reservation
router.get('/my-reservation/current', async (req, res) => {
  try {
    const { userId = DEMO_USER_ID } = req.query;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const currentReservation = await prisma.seatReservation.findFirst({
      where: {
        userId: userId as string,
        status: { in: ['reserved', 'checked_in', 'temporarily_left'] },
        canceled: false,
      },
      include: {
        seat: {
          include: {
            floor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    res.json(successResponse({
      reservation: currentReservation,
    }));
  } catch (error) {
    logger.error('Error getting current reservation:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取当前预约失败，请重试'));
  }
});

// Get user's reservation history
router.get('/my-reservation/history', async (req, res) => {
  try {
    const { userId = DEMO_USER_ID } = req.query;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const reservations = await prisma.seatReservation.findMany({
      where: {
        userId: userId as string,
      },
      include: {
        seat: {
          include: {
            floor: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    res.json(successResponse({
      reservations,
    }));
  } catch (error) {
    logger.error('Error getting reservation history:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取预约历史失败，请重试'));
  }
});

// Check-in (确认入座)
router.post('/checkin', async (req, res) => {
  try {
    const { reservationId, userId } = req.body;

    if (!reservationId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'reservationId 不能为空'));
    }
    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const reservation = await prisma.seatReservation.update({
      where: { id: reservationId },
      data: {
        status: 'checked_in',
        checkedIn: true,
      },
      include: { seat: true },
    });

    await prisma.seat.update({
      where: { id: reservation.seatId },
      data: { status: 'occupied' },
    });

    res.json(successResponse({
      message: '入座成功',
      reservation,
    }));
  } catch (error) {
    logger.error('Error checking in:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '入座失败，请重试'));
  }
});

// Temporary leave (暂离)
router.post('/temporary-leave', async (req, res) => {
  try {
    const { reservationId, userId } = req.body;

    if (!reservationId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'reservationId 不能为空'));
    }

    const reservation = await prisma.seatReservation.update({
      where: { id: reservationId },
      data: {
        status: 'temporarily_left',
      },
    });

    res.json(successResponse({
      message: '已标记为暂离',
      reservation,
    }));
  } catch (error) {
    logger.error('Error temporary leave:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '暂离操作失败，请重试'));
  }
});

// Unlock / return from temporary leave (开锁/恢复)
router.post('/unlock', async (req, res) => {
  try {
    const { reservationId, userId } = req.body;

    if (!reservationId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'reservationId 不能为空'));
    }

    const reservation = await prisma.seatReservation.update({
      where: { id: reservationId },
      data: {
        status: 'checked_in',
      },
    });

    res.json(successResponse({
      message: '已恢复使用',
      reservation,
    }));
  } catch (error) {
    logger.error('Error unlocking:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '恢复座位失败，请重试'));
  }
});

// Finish / release seat (退座)
router.post('/finish', async (req, res) => {
  try {
    const { reservationId, userId } = req.body;

    if (!reservationId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'reservationId 不能为空'));
    }
    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const reservation = await prisma.seatReservation.update({
      where: { id: reservationId },
      data: {
        status: 'completed',
        canceled: true,
      },
    });

    await prisma.seat.update({
      where: { id: reservation.seatId },
      data: {
        status: 'available',
        currentReservationId: null,
      },
    });

    // Check if user violated (no show or late cancel)
    // Increment violation count if needed
    const now = new Date();
    if (now < new Date(reservation.startTime)) {
      // Canceled before start - count as violation
      await prisma.user.update({
        where: { id: userId },
        data: {
          violationCount: { increment: 1 },
        },
      });
    }

    res.json(successResponse({
      message: '退座成功，座位已释放',
    }));
  } catch (error) {
    logger.error('Error finishing reservation:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '退座失败，请重试'));
  }
});

// Extend / renew reservation (续约)
router.post('/extend', async (req, res) => {
  try {
    const { reservationId, userId, additionalHours } = req.body;

    if (!reservationId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'reservationId 不能为空'));
    }

    const reservation = await prisma.seatReservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return res.status(404).json(errorResponse(ErrorCode.RESOURCE_NOT_FOUND, '预约不存在'));
    }

    const newEndTime = new Date(reservation.endTime);
    newEndTime.setHours(newEndTime.getHours() + (additionalHours || 1));

    const updated = await prisma.seatReservation.update({
      where: { id: reservationId },
      data: {
        endTime: newEndTime,
      },
    });

    res.json(successResponse({
      message: `续约成功，延长 ${additionalHours || 1} 小时`,
      reservation: updated,
    }));
  } catch (error) {
    logger.error('Error extending reservation:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '续约失败，请重试'));
  }
});

// Check user violation count
router.get('/violation-status', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      select: { violationCount: true },
    });

    const MAX_VIOLATIONS = 3;
    const exceeded = (user?.violationCount || 0) >= MAX_VIOLATIONS;

    res.json(successResponse({
      violationCount: user?.violationCount || 0,
      maxViolations: MAX_VIOLATIONS,
      exceeded,
    }));
  } catch (error) {
    logger.error('Error checking violations:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '检查违约状态失败，请重试'));
  }
});

// Get atmosphere history for a floor (aggregated by date)
router.get('/atmosphere-history/:floorId', async (req, res) => {
  try {
    const { floorId } = req.params;
    const days = parseInt(req.query.days as string) || 30;

    if (!floorId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'floorId 不能为空'));
    }

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Get all history records since startDate
    const history = await prisma.atmosphereHistory.findMany({
      where: {
        floorId,
        recordedAt: { gte: startDate },
      },
      orderBy: { recordedAt: 'asc' },
    });

    // Group by date
    const grouped: Record<string, {
      count: number;
      noise: number;
      crowding: number;
      brightness: number;
      overall: number;
    }> = {};

    history.forEach(record => {
      const dateKey = record.recordedAt.toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          count: 0,
          noise: 0,
          crowding: 0,
          brightness: 0,
          overall: 0,
        };
      }
      grouped[dateKey].count += 1;
      grouped[dateKey].noise += record.noise;
      grouped[dateKey].crowding += record.crowding;
      grouped[dateKey].brightness += record.brightness;
      grouped[dateKey].overall += record.overall;
    });

    // Calculate averages and convert to array
    const result = Object.entries(grouped).map(([date, agg]) => ({
      date,
      noise: Math.round(agg.noise / agg.count),
      crowding: Math.round(agg.crowding / agg.count),
      brightness: Math.round(agg.brightness / agg.count),
      overall: Math.round(agg.overall / agg.count),
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Ensure we have entries for all days in range (fill with null if no data)
    const fullResult = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().split('T')[0];
      const existing = result.find(r => r.date === dateKey);
      if (existing) {
        fullResult.push(existing);
      } else {
        fullResult.push({
          date: dateKey,
          noise: null,
          crowding: null,
          brightness: null,
          overall: null,
        });
      }
    }

    res.json(successResponse(fullResult));
  } catch (error) {
    logger.error('Error getting atmosphere history:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取氛围历史数据失败，请重试'));
  }
});

// Record atmosphere reading
router.post('/atmosphere-record', async (req, res) => {
  try {
    const { floorId, noise, crowding, brightness, overall } = req.body;

    if (!floorId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'floorId 不能为空'));
    }

    const record = await prisma.atmosphereHistory.create({
      data: {
        floorId,
        noise: noise || 0,
        crowding: crowding || 0,
        brightness: brightness || 0,
        overall: overall || 0,
      },
    });

    res.json(successResponse(record));
  } catch (error) {
    logger.error('Error recording atmosphere:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '记录氛围数据失败，请重试'));
  }
});

// AI Group Study Matcher
router.post('/group-match', async (req, res) => {
  try {
    const { topic, userId } = req.body;
    
    if (!topic || !userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'topic 和 userId 不能为空'));
    }

    const { openai } = await import('../services/claude');
    
    const systemPrompt = `你是一个大学图书馆的“学习搭子”撮合助手。
用户输入了他想学习或讨论的课题。请你生成一个虚构的匹配结果，仿佛馆内正有其他同学也在研究类似主题。
必须返回以下 JSON：
{
  "groupName": "为你生成的小组名",
  "matchedUsers": ["虚拟用户1", "虚拟用户2"],
  "roomName": "2楼 B区 讨论室-03",
  "message": "一句鼓励的组局文案，说明为什么匹配这几个虚拟用户给你"
}`;

    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'glm-4',
      messages: [
        { role: 'user', content: `${systemPrompt}\n\n我的课题是：${topic}` }
      ],
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    let result;
    if (content) {
      try {
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        result = JSON.parse(jsonString);
      } catch (e) {
        // use fallback if parse fails
      }
    }
    
    if (!result) {
      result = {
        groupName: `${topic} 学习互助组`,
        matchedUsers: ['Alice', 'Bob'],
        roomName: '2楼 B区 讨论室-03',
        message: '已为你匹配到同方向的学习搭子，快去指定讨论室加入他们吧！'
      };
    }

    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error in group match:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '撮合失败，请重试'));
  }
});

export default router;
