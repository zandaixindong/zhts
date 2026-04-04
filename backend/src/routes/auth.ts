import express from 'express';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { ErrorCode, errorResponse, successResponse } from '../types/response';
import { generateToken } from '../utils/jwt';
import { authenticateToken } from '../middleware/auth';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const router = express.Router();
const SALT_ROUNDS = 10;

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '邮箱和密码不能为空'));
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json(errorResponse(ErrorCode.AUTHENTICATION_FAILED, '邮箱或密码错误'));
    }

    let passwordMatch = false;

    // Check if password is already hashed (bcrypt hashes start with $2b$)
    if (user.password.startsWith('$2b$') || user.password.startsWith('$2a$')) {
      // Already hashed - use bcrypt compare
      passwordMatch = await bcrypt.compare(password, user.password);
    } else {
      // Plain text - direct compare, then auto-upgrade to hash
      passwordMatch = password === user.password;
      if (passwordMatch) {
        // Auto-upgrade to hashed password
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        await prisma.user.update({
          where: { id: user.id },
          data: { password: hashedPassword },
        });
      }
    }

    if (!passwordMatch) {
      return res.status(401).json(errorResponse(ErrorCode.AUTHENTICATION_FAILED, '邮箱或密码错误'));
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;

    // Set token in HttpOnly cookie for security
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      path: '/',
    });

    res.json(successResponse({
      user: userWithoutPassword,
      token,
    }));
  } catch (error) {
    logger.error('Login error:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '登录失败，请重试'));
  }
});

// Logout
router.post('/logout', (req, res) => {
  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('token', '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
    maxAge: 0,
    path: '/',
  });
  res.json(successResponse({ success: true }));
});

// Get current user info
router.get('/me', authenticateToken, async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json(errorResponse(ErrorCode.AUTHENTICATION_FAILED, '未认证'));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json(errorResponse(ErrorCode.RESOURCE_NOT_FOUND, '用户不存在'));
    }

    // Return user info without password
    const { password: _, ...userWithoutPassword } = user;
    res.json(successResponse({
      user: userWithoutPassword,
    }));
  } catch (error) {
    logger.error('Get me error:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取用户信息失败，请重试'));
  }
});

// Check overdue books and create notifications for user
router.post('/check-overdue', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const today = new Date();
    const overdueCheckouts = await prisma.bookCheckout.findMany({
      where: {
        userId,
        returned: false,
        dueDate: { lt: today },
      },
      include: { book: true },
    });

    // Create notifications for overdue books
    for (const checkout of overdueCheckouts) {
      // Check if notification already exists for this checkout
      const existingNotification = await prisma.notification.findFirst({
        where: {
          userId,
          title: { contains: checkout.book.title },
          type: 'overdue',
        },
      });

      if (!existingNotification) {
        await prisma.notification.create({
          data: {
            userId,
            title: `${checkout.book.title} 已逾期`,
            content: `这本书应还日期是 ${new Date(checkout.dueDate).toLocaleDateString('zh-CN')}，请尽快归还。`,
            type: 'overdue',
            read: false,
          },
        });
      }
    }

    res.json(successResponse({
      overdueCount: overdueCheckouts.length,
      overdueBooks: overdueCheckouts.map(c => ({
        id: c.book.id,
        title: c.book.title,
        dueDate: c.dueDate,
      })),
    }));
  } catch (error) {
    logger.error('Check overdue error:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '检查逾期失败，请重试'));
  }
});

export default router;
