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

// Reserve a seat
router.post('/reserve', async (req, res) => {
  try {
    const { seatId, duration, userId = DEMO_USER_ID, startTime } = req.body;

    if (!seatId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'seatId 不能为空'));
    }

    // 🛠️ 关键修复：从数据库获取第一个真实用户 ID，防止 demo-user-id 引发的外键冲突
    const user = await prisma.user.findFirst();
    const actualUserId = user ? user.id : userId;

    const result = await handleSeatToolCall('reserve_seat', { 
      seatId, 
      duration: duration || 2, 
      userId: actualUserId, 
      startTime 
    });
    
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error reserving seat:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '预约座位失败，请重试'));
  }
});

// AI-powered seat finding
router.post('/find', async (req, res) => {
  try {
    const { query, floorId, userId = DEMO_USER_ID } = req.body;
    if (!query || query.trim().length === 0) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '查询描述不能为空'));
    }
    const result = await handleSeatToolCall('find_available_seats', { query, floorId, userId });
    if (!('seats' in result)) {
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '座位搜索失败'));
    }
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error finding seats:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '找座失败'));
  }
});

// Cancel reservation
router.post('/cancel', async (req, res) => {
  try {
    const { seatId, userId = DEMO_USER_ID } = req.body;
    const user = await prisma.user.findFirst();
    const actualUserId = user ? user.id : userId;
    const result = await cancelReservation(seatId, actualUserId);
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error canceling reservation:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '取消预约失败'));
  }
});

// Get user's current active reservation
router.get('/my-reservation/current', async (req, res) => {
  try {
    const user = await prisma.user.findFirst();
    const currentReservation = await prisma.seatReservation.findFirst({
      where: {
        userId: user?.id || 'demo',
        status: { in: ['reserved', 'checked_in', 'temporarily_left'] },
        canceled: false,
      },
      include: { seat: { include: { floor: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse({ reservation: currentReservation }));
  } catch (error) {
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取当前预约失败'));
  }
});

// Get user's reservation history
router.get('/my-reservation/history', async (req, res) => {
  try {
    const user = await prisma.user.findFirst();
    const reservations = await prisma.seatReservation.findMany({
      where: { userId: user?.id || 'demo' },
      include: { seat: { include: { floor: true } } },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });
    res.json(successResponse({ reservations }));
  } catch (error) {
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取预约历史失败'));
  }
});

// Check-in (确认入座)
router.post('/checkin', async (req, res) => {
  try {
    const { reservationId } = req.body;
    const reservation = await prisma.seatReservation.update({
      where: { id: reservationId },
      data: { status: 'checked_in', checkedIn: true },
      include: { seat: true },
    });
    await prisma.seat.update({
      where: { id: reservation.seatId },
      data: { status: 'occupied' },
    });
    res.json(successResponse({ message: '入座成功', reservation }));
  } catch (error) {
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '入座失败'));
  }
});

// Atmosphere history trend
router.get('/atmosphere-history/:floorId', async (req, res) => {
  try {
    const { floorId } = req.params;
    const days = 7;
    const history = await prisma.atmosphereHistory.findMany({
      where: { floorId },
      orderBy: { recordedAt: 'asc' },
      take: 100
    });
    res.json(successResponse(history));
  } catch (error) {
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取数据失败'));
  }
});

// AI Group Study Matcher
router.post('/group-match', async (req, res) => {
  try {
    const { topic } = req.body;
    const { openai } = await import('../services/claude');
    const systemPrompt = `你是一个大学图书馆的“学习搭子”撮合助手。请根据课题生成虚构的匹配结果。返回 JSON：{"groupName":"小组名","matchedUsers":["用户1"],"roomName":"讨论室名","message":"文案"}`;
    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'glm-4',
      messages: [{ role: 'user', content: `${systemPrompt}\n课题：${topic}` }],
      temperature: 0.7,
    });
    const content = response.choices[0]?.message?.content || '';
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const result = jsonMatch ? JSON.parse(jsonMatch[0]) : { groupName: '学习组', matchedUsers: ['同学'], roomName: '讨论区', message: '已匹配' };
    res.json(successResponse(result));
  } catch (error) {
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '撮合失败'));
  }
});

export default router;
