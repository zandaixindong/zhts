import express from 'express';
import { PrismaClient } from '@prisma/client';
import { openai } from '../services/claude';
import { DEMO_USER_ID } from '../types';
import { ErrorCode, errorResponse, successResponse } from '../types/response';
import { logger } from '../utils/logger';

const prisma = new PrismaClient();
const router = express.Router();

// Get personalized recommendations for user
router.get('/for-you', async (req, res) => {
  try {
    const { userId = DEMO_USER_ID } = req.query;

    if (!userId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'userId 不能为空'));
    }

    // Get user reading history
    const user = await prisma.user.findUnique({
      where: { id: userId as string },
      include: {
        books: {
          where: { returned: false },
          include: { book: true },
        },
      },
    });

    // Get all available books
    const allBooks = await prisma.book.findMany({
      where: { status: 'available' },
      take: 50,
    });

    // Parse JSON from database - handle both string and parsed JSON
    let interests: string[] = [];
    if (user?.interests) {
      if (typeof user.interests === 'string') {
        try {
          interests = JSON.parse(user.interests);
        } catch (e) {
          interests = [];
        }
      } else {
        interests = user.interests as string[];
      }
    }
    const readingHistory = user?.books.map(b => ({
      title: b.book.title,
      author: b.book.author,
      category: b.book.category,
    })) || [];

    const systemPrompt = `你是大学图书馆的个性化阅读推荐助手。

根据用户的阅读历史和兴趣，推荐他们可能喜欢的书籍。

按照这个流程工作：
1. 深入分析用户的**阅读历史**和**兴趣标签**。寻找他们过去的阅读偏好、喜欢的题材，以及可能存在的潜在阅读需求。
2. 挑选 4-6 本最匹配的书籍进行推荐。
3. **重点：生成个性化的高质量推荐理由**。对于每一本推荐书目，你必须给出一个专属于该用户的推荐理由。不要使用通用的套话（如“这是一本好书”），而是明确指出：“因为你之前借阅了《XXX》或经常阅读【YY类别】的书，所以这本书的【某某特点】会非常适合你”。理由要具有引导性和洞察力，让用户感受到“被懂”。
4. 对每个推荐，给出 0-100 的匹配分数。

**所有输出必须使用中文**，包括 reason 和 message 字段。书名和作者名保持原文。

始终将最终推荐结果以 JSON 格式放在 <result> 标签内返回，格式如下：
<result>
{
  "recommendations": [
    {
      "bookId": "id",
      "title": "Book Title",
      "author": "Author Name",
      "reason": "专门定制的推荐理由，明确指出和用户历史或兴趣的具体关联点。",
      "matchScore": 95
    }
  ],
  "message": "一段充满洞察力的开场白，总结该用户的整体阅读偏好画像并引出本次推荐。"
}
</result>`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: `User interests: ${JSON.stringify(interests)}.
Reading history: ${JSON.stringify(readingHistory)}.
Available books to recommend from: ${JSON.stringify(allBooks, null, 2)}.

Please give me personalized recommendations in the JSON format requested.`,
      },
    ];

    let finalResponse;
    try {
      finalResponse = await openai.chat.completions.create({
        model: process.env.MODEL_NAME || 'glm-4',
        max_tokens: 4096,
        messages,
        temperature: 0.7,
      });

      const finalText = finalResponse.choices[0]?.message?.content || '';

      const resultMatch = finalText.match(/<result>([\s\S]*?)<\/result>/);
      if (resultMatch) {
        const resultJson = JSON.parse(resultMatch[1]);
        return res.json(successResponse(resultJson));
      } else {
        const resultJson = JSON.parse(finalText);
        return res.json(successResponse(resultJson));
      }
    } catch (apiError) {
      logger.error('AI API failed for recommendations, using fallback:', apiError);
      
      // Fallback to random books if AI fails
      const fallbackBooks = [...allBooks].sort(() => 0.5 - Math.random()).slice(0, 4);
      const fallbackResult = {
        recommendations: fallbackBooks.map(b => ({
          bookId: b.id,
          title: b.title,
          author: b.author,
          reason: "基于馆藏热门推荐（AI 接口暂时离线，启用备用推荐规则）。",
          matchScore: Math.floor(Math.random() * 20) + 75
        })),
        message: "你好！AI 助手暂时离线，这是我为你准备的基础馆藏推荐："
      };
      
      return res.json(successResponse(fallbackResult));
    }
  } catch (error) {
    logger.error('Error getting recommendations:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '获取推荐失败，请重试'));
  }
});

// Get AI summary for a specific book
router.post('/summary', async (req, res) => {
  try {
    const { bookId } = req.body;

    if (!bookId) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'bookId 不能为空'));
    }

    const book = await prisma.book.findUnique({
      where: { id: bookId },
    });

    if (!book) {
      return res.status(404).json(errorResponse(ErrorCode.RESOURCE_NOT_FOUND, '书籍未找到'));
    }

    const prompt = `请为 "${book.title}" by ${book.author} 提供一个简洁的导读。
${book.description ? `描述: ${book.description}` : ''}
${book.content ? `内容: ${book.content}` : ''}

按照以下结构组织回答：
1. 2-3 句话的简要概述
2. 3-5 个要点洞见作为项目符号

保持简洁，对考虑阅读这本书的人有所帮助。**所有输出必须使用中文**。`;

    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: '你是一个乐于助人的阅读助手，提供书籍导读。所有回答必须使用中文。' },
      { role: 'user', content: prompt },
    ];

    const response = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'glm-4',
      max_tokens: 1024,
      messages,
      temperature: 0.7,
    });

    const summaryText = response.choices[0]?.message?.content || '';

    // Extract insights
    const insights: string[] = [];
    const lines = summaryText.split('\n');
    let inInsights = false;
    for (const line of lines) {
      if (line.includes('key insights') || line.includes('takeaways') || line.includes('要点')) {
        inInsights = true;
        continue;
      }
      if (inInsights && (line.startsWith('-') || line.startsWith('*') || line.startsWith('•'))) {
        insights.push(line.replace(/^[-*•]\s*/, '').trim());
      }
    }

    const result = {
      summary: summaryText.split('\n\n')[0] || summaryText,
      insights: insights.length > 0 ? insights : summaryText.split('\n').slice(1),
    };

    res.json(successResponse(result));
  } catch (error) {
    logger.error('Error getting book summary:', error);
    res.status(500).json(errorResponse(ErrorCode.INTERNAL_ERROR, '生成导读失败，请重试'));
  }
});

export default router;
