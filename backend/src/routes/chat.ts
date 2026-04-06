import express from 'express';
import { openai } from '../services/claude';
import { searchTools, handleSearchToolCall } from '../tools/searchTools';
import { ErrorCode, errorResponse } from '../types/response';
import { logger } from '../utils/logger';

const router = express.Router();

// Streaming chat message
router.post('/', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'messages 不能为空且必须是数组'));
    }

    const systemPrompt = `你是大学图书馆的AI助手，全天候24小时回答问题。

使用 search_library_docs 工具从图书馆文档中查找相关信息。根据检索到的文档回答问题。

回答以下问题：
- 借阅政策和流程
- 引用格式（APA、MLA、Chicago）
- 如何使用我们的数据库
- 图书馆内设施位置
- 开放时间
- 如何预约房间
- 打印和扫描
- 研究帮助

**所有回答必须使用中文**。友好、清晰、乐于助人。

如果问题与图书馆无关，但与学术生活相关，你仍然可以简要回答。如果你不知道答案，建议用户在开放时间联系咨询台。

对于引用格式，请提供例子。对于位置，请告诉他们在哪一层。`;

    const apiMessages = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    // First search for docs
    const lastMessage = messages[messages.length - 1];
    const userQuery = lastMessage.content;
    const searchResult = await handleSearchToolCall('search_library_docs', { query: userQuery });

    apiMessages.push({
      role: 'user',
      content: `${userQuery}

Relevant documentation found:
${searchResult.results}

Please answer my question based on the documentation above.`,
    });

    // Set up streaming response
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'glm-4',
      max_tokens: 2048,
      messages: apiMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    logger.error('Error in chat:', error);
    res.writeHead(500);
    res.end(JSON.stringify(errorResponse(ErrorCode.INTERNAL_ERROR, '聊天出错，请重试')));
  }
});

// Chat with a specific book (RAG)
router.post('/book-chat', async (req, res) => {
  try {
    const { bookId, message, history } = req.body;
    
    if (!bookId || !message) {
      return res.status(400).json(errorResponse(ErrorCode.VALIDATION_ERROR, 'bookId 和 message 不能为空'));
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    const book = await prisma.book.findUnique({ where: { id: bookId } });

    if (!book) {
      return res.status(404).json(errorResponse(ErrorCode.RESOURCE_NOT_FOUND, '未找到书籍'));
    }

    const systemPrompt = `你是一个沉浸式 AI 伴读助手。你现在代表《${book.title}》（作者：${book.author}）这本书。
请根据以下书籍摘要和节选内容，解答用户的提问：

【书籍介绍】：${book.description || '无'}
【核心内容片段】：${book.content || '无详细正文数据'}

要求：
1. 深入浅出地解答，结合书中观点进行延展。
2. 语气应当专业、启发性、像一位学识渊博的导师。
3. 若用户问的问题偏离了本书内容，你可以友善地拉回本书主题。
4. 必须使用中文回答。`;

    const apiMessages: any[] = [
      { role: 'user', content: systemPrompt },
      ...(history || []),
      { role: 'user', content: message }
    ];

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });

    const stream = await openai.chat.completions.create({
      model: process.env.MODEL_NAME || 'glm-4',
      max_tokens: 1500,
      messages: apiMessages,
      stream: true,
      temperature: 0.7,
    });

    for await (const chunk of stream) {
      const text = chunk.choices[0]?.delta?.content || '';
      if (text) {
        res.write(`data: ${JSON.stringify({ text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();

  } catch (error) {
    logger.error('Error in book chat:', error);
    res.writeHead(500);
    res.end(JSON.stringify(errorResponse(ErrorCode.INTERNAL_ERROR, '伴读对话出错，请重试')));
  }
});

export default router;
