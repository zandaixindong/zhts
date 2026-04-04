import express from 'express';
import { PrismaClient } from '@prisma/client';
import { ErrorCode, errorResponse, successResponse } from '../types/response';
import { openai } from '../services/claude';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// Get AI Persona for user
router.get('/persona/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        books: { include: { book: true } },
      },
    });

    if (!user) {
      return res.status(404).json(errorResponse(ErrorCode.RESOURCE_NOT_FOUND, '用户未找到'));
    }

    const readingHistory = user.books.map(b => b.book.title);
    let interests: string[] = [];
    if (typeof user.interests === 'string') {
      try { interests = JSON.parse(user.interests); } catch (e) { /* ignore parse error */ }
    } else {
      interests = user.interests as string[] || [];
    }

    if (readingHistory.length === 0 && interests.length === 0) {
      return res.json(successResponse({
        title: '潜能读者',
        traits: ['待探索', '新鲜血液', '充满可能'],
        radar: { 科技: 50, 人文: 50, 艺术: 50, 实用: 50, 深度: 50 },
        summary: '你的阅读旅程刚刚开始，图书馆里有无数宝藏等你发现。',
      }));
    }

    const systemPrompt = `你是一个阅读画像分析师。请根据用户的阅读历史和兴趣标签，生成一个充满趣味的年度/近期阅读画像。
历史: ${readingHistory.join(', ')}
兴趣: ${interests.join(', ')}

必须以严格的 JSON 格式返回，包含以下字段：
{
  "title": "用户的趣味阅读称号，如'赛博朋克漫游者'或'文艺复兴青年'",
  "traits": ["3个描述性格的四字词语"],
  "radar": {
    "科技": 0-100之间的整数,
    "人文": 0-100之间的整数,
    "艺术": 0-100之间的整数,
    "实用": 0-100之间的整数,
    "深度": 0-100之间的整数
  },
  "summary": "一段生动有趣、带有一点点幽默感的20-30字点评"
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
        // Strip out markdown code blocks if the model wrapped the JSON
        const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        const jsonString = jsonMatch ? jsonMatch[1] : content;
        result = JSON.parse(jsonString);
      }
    } catch (apiError) {
      logger.error('AI API failed for persona, using fallback:', apiError);
    }

    if (!result) {
      result = {
        title: '探索者',
        traits: ['好学', '广泛', '未知'],
        radar: { 科技: 60, 人文: 60, 艺术: 60, 实用: 60, 深度: 60 },
        summary: 'AI 接口暂时离线，但你在知识海洋中的探索不会停止。',
      };
    }

    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error getting persona:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '生成借阅画像失败'));
  }
});

// Get current borrowings for user
router.get('/borrowing/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const borrowings = await prisma.bookCheckout.findMany({
      where: {
        userId,
        returned: false,
      },
      include: {
        book: true,
      },
      orderBy: {
        dueDate: 'asc',
      },
    });

    res.json(successResponse(borrowings));
  } catch (error) {
    logger.error('Error getting borrowings:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取借阅记录失败，请重试'));
  }
});

// Get current and upcoming seat reservations for user
router.get('/reservations/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const reservations = await prisma.seatReservation.findMany({
      where: {
        userId,
        status: {
          in: ['reserved', 'checked_in', 'temporarily_left'],
        },
      },
      include: {
        seat: {
          include: {
            floor: true,
          },
        },
      },
      orderBy: {
        startTime: 'asc',
      },
    });

    res.json(successResponse(reservations));
  } catch (error) {
    logger.error('Error getting reservations:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取预约记录失败，请重试'));
  }
});

export default router;
