import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorCode, errorResponse, successResponse } from '../types/response';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Verify and check-in via QR code
router.post('/verify', async (req, res) => {
  try {
    const { reservationId, userId } = req.body;

    if (!reservationId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'reservationId 不能为空'));
    }
    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const reservation = await prisma.seatReservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      return res.json(errorResponse(ErrorCode.RESOURCE_NOT_FOUND, '预约不存在'));
    }

    if (reservation.userId !== userId) {
      return res.json(errorResponse(ErrorCode.PERMISSION_DENIED, '这不是你的预约'));
    }

    if (reservation.status === 'checked_in') {
      return res.json(errorResponse(ErrorCode.BAD_REQUEST, '已经签到过了'));
    }

    if (reservation.status === 'completed' || reservation.status === 'canceled' || reservation.status === 'expired') {
      return res.json(errorResponse(ErrorCode.BAD_REQUEST, '预约已结束'));
    }

    // Update reservation status to checked_in
    await prisma.seatReservation.update({
      where: { id: reservationId },
      data: { status: 'checked_in', checkedIn: true },
    });

    // Also update seat status to occupied
    await prisma.seat.update({
      where: { id: reservation.seatId },
      data: { status: 'occupied' },
    });

    res.json(successResponse({ success: true, message: '签到成功' }));
  } catch (error) {
    logger.error('QR check-in error:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '签到失败，请重试'));
  }
});

export default router;
