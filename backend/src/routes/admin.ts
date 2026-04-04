import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorCode, errorResponse, successResponse } from '../types/response';
import { authenticateToken, requireRole } from '../middleware/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const router = express.Router();

// All admin routes require authentication and admin role
router.use(authenticateToken);
router.use(requireRole('admin'));

// Get dashboard statistics
router.get('/stats', async (req, res) => {
  try {
    const [totalBooks, availableBooks, totalSeats, availableSeats, totalEvents, totalFloors] = await Promise.all([
      prisma.book.count(),
      prisma.book.count({ where: { status: 'available' } }),
      prisma.seat.count(),
      prisma.seat.count({ where: { status: 'available' } }),
      prisma.libraryEvent.count(),
      prisma.floor.count(),
    ]);

    res.json(successResponse({
      totalBooks,
      availableBooks,
      totalSeats,
      availableSeats,
      totalEvents,
      totalFloors,
    }));
  } catch (error) {
    logger.error('Error getting stats:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取统计数据失败，请重试'));
  }
});

// ========== Books CRUD ==========

// Get all books
router.get('/books', async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse(books));
  } catch (error) {
    logger.error('Error getting books:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取图书列表失败，请重试'));
  }
});

// Create book
router.post('/books', async (req, res) => {
  try {
    const book = await prisma.book.create({
      data: req.body,
    });
    res.json(successResponse(book));
  } catch (error) {
    logger.error('Error creating book:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '创建图书失败，请重试'));
  }
});

// Update book
router.put('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.update({
      where: { id },
      data: req.body,
    });
    res.json(successResponse(book));
  } catch (error) {
    logger.error('Error updating book:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '更新图书失败，请重试'));
  }
});

// Delete book
router.delete('/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.book.delete({ where: { id } });
    res.json(successResponse({ success: true }));
  } catch (error) {
    logger.error('Error deleting book:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '删除图书失败，请重试'));
  }
});

// ========== Floors CRUD ==========

// Get all floors
router.get('/floors', async (req, res) => {
  try {
    const floors = await prisma.floor.findMany({
      orderBy: { number: 'asc' },
      include: { seats: true },
    });
    res.json(successResponse(floors));
  } catch (error) {
    logger.error('Error getting floors:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取楼层列表失败，请重试'));
  }
});

// Create floor
router.post('/floors', async (req, res) => {
  try {
    const floor = await prisma.floor.create({
      data: req.body,
    });
    res.json(successResponse(floor));
  } catch (error) {
    logger.error('Error creating floor:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '创建楼层失败，请重试'));
  }
});

// Update floor
router.put('/floors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const floor = await prisma.floor.update({
      where: { id },
      data: req.body,
    });
    res.json(successResponse(floor));
  } catch (error) {
    logger.error('Error updating floor:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '更新楼层失败，请重试'));
  }
});

// Delete floor
router.delete('/floors/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // Delete all seats on this floor first
    await prisma.seat.deleteMany({ where: { floorId: id } });
    await prisma.floor.delete({ where: { id } });
    res.json(successResponse({ success: true }));
  } catch (error) {
    logger.error('Error deleting floor:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '删除楼层失败，请重试'));
  }
});

// ========== Seats CRUD ==========

// Get seats by floor
router.get('/seats/:floorId', async (req, res) => {
  try {
    const { floorId } = req.params;

    if (!floorId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'floorId 不能为空'));
    }

    const seats = await prisma.seat.findMany({
      where: { floorId },
      orderBy: [{ x: 'asc' }, { y: 'asc' }],
    });
    res.json(successResponse(seats));
  } catch (error) {
    logger.error('Error getting seats:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取座位列表失败，请重试'));
  }
});

// Create seat
router.post('/seats', async (req, res) => {
  try {
    const seat = await prisma.seat.create({
      data: req.body,
    });
    res.json(successResponse(seat));
  } catch (error) {
    logger.error('Error creating seat:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '创建座位失败，请重试'));
  }
});

// Update seat
router.put('/seats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const seat = await prisma.seat.update({
      where: { id },
      data: req.body,
    });
    res.json(successResponse(seat));
  } catch (error) {
    logger.error('Error updating seat:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '更新座位失败，请重试'));
  }
});

// Delete seat
router.delete('/seats/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.seat.delete({ where: { id } });
    res.json(successResponse({ success: true }));
  } catch (error) {
    logger.error('Error deleting seat:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '删除座位失败，请重试'));
  }
});

// ========== Events CRUD ==========

// Get all events
router.get('/events', async (req, res) => {
  try {
    const events = await prisma.libraryEvent.findMany({
      orderBy: { date: 'asc' },
    });
    res.json(successResponse(events));
  } catch (error) {
    logger.error('Error getting events:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取活动列表失败，请重试'));
  }
});

// Create event
router.post('/events', async (req, res) => {
  try {
    const event = await prisma.libraryEvent.create({
      data: req.body,
    });
    res.json(successResponse(event));
  } catch (error) {
    logger.error('Error creating event:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '创建活动失败，请重试'));
  }
});

// Update event
router.put('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const event = await prisma.libraryEvent.update({
      where: { id },
      data: req.body,
    });
    res.json(successResponse(event));
  } catch (error) {
    logger.error('Error updating event:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '更新活动失败，请重试'));
  }
});

// Delete event
router.delete('/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.libraryEvent.delete({ where: { id } });
    res.json(successResponse({ success: true }));
  } catch (error) {
    logger.error('Error deleting event:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '删除活动失败，请重试'));
  }
});

// ========== Users ==========

// Get all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        violationCount: true,
        createdAt: true,
        _count: {
          select: { seats: true, books: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse(users));
  } catch (error) {
    logger.error('Error getting users:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取用户列表失败，请重试'));
  }
});

export default router;
