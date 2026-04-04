import express from 'express';
import { openai } from '../services/claude';
import { handleBookToolCall } from '../tools/bookTools';
import { DEMO_USER_ID } from '../types';
import { PrismaClient } from '@prisma/client';
import { ErrorCode, errorResponse, successResponse } from '../types/response';
import { logger } from '../utils/logger';

const router = express.Router();
const prisma = new PrismaClient();

// AI-powered book search
router.post('/search', async (req, res) => {
  try {
    const { query, userId = DEMO_USER_ID } = req.body;

    if (!query || query.trim().length === 0) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, '搜索查询不能为空'));
    }

    const systemPrompt = `你是AI驱动的图书馆助手，帮助用户找书。

你的职责：
1. 理解用户的自然语言查询 - 他们可能按主题、作者查找书籍，或者使用模糊描述
2. 使用搜索工具查找匹配查询的书籍
3. 如果用户需要特定书籍的详情，获取书籍详情
4. 如果一本书已被借出而用户想要，帮助他们订阅到货通知
5. 聚合多个来源的结果（我们的实体馆藏、电子馆藏、开放获取）
6. 用清晰友好的方式展示结果，附带友好的消息解释你找到了什么

**所有输出必须使用中文**，message 字段必须是中文。

始终将最终答案以 JSON 格式放在 <result> 标签内返回，格式如下：
<result>
{
  "query": "the original user query",
  "books": [array of matching book objects with all their fields],
  "message": "友好自然语言总结你找到的内容"
}
</result>

保持乐于助人、对话友好。如果你找不到用户想要的，建议替代方案。`;

    // First step: call AI to get tool call
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt + '\n\nUser query: ' + query,
      },
      {
        role: 'user',
        content: 'Please search for books and return the result in JSON format inside <result> tags.',
      },
    ];

    // For OpenAI compatible API, we need to do tool calling manually
    // First get search results
    const searchResult = await handleBookToolCall('search_books', { query, filters: {} });
    if (!('books' in searchResult)) {
      return res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '搜索失败，请重试'));
    }
    const { books } = searchResult;

    // Log the search query for analytics
    try {
      await prisma.searchQuery.create({
        data: {
          query,
          results: books.length,
          userId: userId === DEMO_USER_ID ? null : userId
        }
      });
    } catch (logError) {
      logger.error('Failed to log search query:', logError);
    }

    // Now ask AI to format the response
    messages.push({
      role: 'assistant',
      content: `I found ${books.length} books matching your query. Let me format the response.`,
    });
    messages.push({
      role: 'user',
      content: `Here are the raw search results:
${JSON.stringify(books, null, 2)}

Please format this into the final response as instructed, inside <result> tags.`,
    });

    const finalResponse = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'glm-4',
      max_tokens: 4096,
      messages,
      temperature: 0.7,
    });

    const finalText = finalResponse.choices[0]?.message?.content || '';

    // Extract from <result> tag
    const resultMatch = finalText.match(/<result>([\s\S]*?)<\/result>/);
    if (resultMatch) {
      const resultJson = JSON.parse(resultMatch[1]);
      res.json(successResponse(resultJson));
    } else {
      // Fallback: try to parse entire response
      try {
        const resultJson = JSON.parse(finalText.trim());
        res.json(successResponse(resultJson));
      } catch (e) {
        logger.error('Failed to parse AI response:', e);
        res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '解析 AI 响应失败'));
      }
    }
  } catch (error) {
    logger.error('Error in book search:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '搜索失败，请重试'));
  }
});

// Subscribe to availability notification
router.post('/arrival-notification', async (req, res) => {
  try {
    const { bookId, userId = DEMO_USER_ID } = req.body;

    if (!bookId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'bookId 不能为空'));
    }

    const { handleSubscribeAvailability } = await import('../tools/bookTools');
    const result = await handleSubscribeAvailability({ bookId, userId });
    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error subscribing:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '订阅失败，请重试'));
  }
});

// Search book by ISBN
router.get('/isbn/:isbn', async (req, res) => {
  try {
    const { isbn } = req.params;

    if (!isbn) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'ISBN 不能为空'));
    }

    const book = await prisma.book.findFirst({
      where: {
        OR: [
          { isbn },
          { isbn: { contains: isbn } },
        ],
      },
    });

    if (!book) {
      return res.json(successResponse(null, '未找到匹配的书籍'));
    }

    res.json(successResponse(book));
  } catch (error) {
    logger.error('Error searching by ISBN:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, 'ISBN 查询失败'));
  }
});

export default router;
