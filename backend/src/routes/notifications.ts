import express from 'express';
import { PrismaClient } from '@prisma/client';
import { openai } from '../services/claude';
import { DEMO_USER_ID } from '../types';
import { ErrorCode, errorResponse, successResponse } from '../types/response';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const router = express.Router();

// Get all notifications for user
router.get('/', async (req, res) => {
  try {
    const { userId = DEMO_USER_ID } = req.query;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const notifications = await prisma.notification.findMany({
      where: { userId: userId as string },
      orderBy: { createdAt: 'desc' },
    });
    res.json(successResponse(notifications));
  } catch (error) {
    logger.error('Error getting notifications:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取通知失败，请重试'));
  }
});

// Mark notification as read
router.post('/read', async (req, res) => {
  try {
    const { notificationId } = req.body;

    if (!notificationId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'notificationId 不能为空'));
    }

    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    });
    res.json(successResponse({ success: true }));
  } catch (error) {
    logger.error('Error marking notification read:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '标记已读失败，请重试'));
  }
});

// AI match events to user interests
router.post('/match-events', async (req, res) => {
  try {
    const { userId = DEMO_USER_ID } = req.body;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    const user = await prisma.user.findUnique({
      where: { id: userId as string },
    });

    const events = await prisma.libraryEvent.findMany({
      where: {
        date: { gte: new Date() },
      },
      orderBy: { date: 'asc' },
    });

    if (!user) {
      return res.status(404).json(errorResponse(ErrorCode.RESOURCE_NOT_FOUND, '用户未找到'));
    }

    // Parse JSON from database - handle both string and parsed JSON
    let userInterests: string[] = [];
    if (user.interests) {
      if (typeof user.interests === 'string') {
        try {
          userInterests = JSON.parse(user.interests);
        } catch (e) {
          userInterests = [];
        }
      } else {
        userInterests = user.interests as string[];
      }
    }
    // Parse interests for each event
    const parsedEvents = events.map(event => {
      let eventInterests: string[] = [];
      if (event.interests) {
        if (typeof event.interests === 'string') {
          try {
            eventInterests = JSON.parse(event.interests);
          } catch (e) {
            eventInterests = [];
          }
        } else {
          eventInterests = event.interests as string[];
        }
      }
      return {
        ...event,
        interests: eventInterests,
      };
    });

    const systemPrompt = `你是一个AI，将用户兴趣与图书馆活动和新书到货进行匹配。

根据用户兴趣和即将举行的活动列表，按相关性和匹配分数对活动进行排名。
只包含与用户至少一个兴趣真正匹配的活动。

**reason 字段必须使用中文**。

以 JSON 格式返回：
<result>
{
  "matches": [
    {
      "eventId": "id",
      "matchScore": 85,
      "reason": "解释为什么这符合用户的兴趣"
    }
  ]
}
</result>`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `User interests: ${JSON.stringify(userInterests)}.
Upcoming events: ${JSON.stringify(parsedEvents, null, 2)}.

Please match the events to the user's interests and return in the JSON format requested inside <result> tags.`,
      },
    ];

    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'glm-4',
      max_tokens: 2048,
      messages,
      temperature: 0.7,
    });

    const finalText = response.choices[0]?.message?.content || '';

    const resultMatch = finalText.match(/<result>([\s\S]*?)<\/result>/);
    if (resultMatch) {
      const resultJson = JSON.parse(resultMatch[1]);
      res.json(successResponse(resultJson));
    } else {
      try {
        const resultJson = JSON.parse(finalText);
        res.json(successResponse(resultJson));
      } catch (e) {
        logger.error('Failed to parse AI response:', e);
        res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '解析 AI 响应失败'));
      }
    }
  } catch (error) {
    logger.error('Error matching events:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '匹配活动失败，请重试'));
  }
});

export default router;
