import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { sendChatMessage } from '../../../utils/api';
import type { ChatMessage } from '../../../types';
import MessageBubble from './MessageBubble';
import QuickQuestions from './QuickQuestions';

const ChatWindow: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "你好！我是你的AI图书馆助手。我可以回答关于借阅政策、引用格式、数据库使用、设施位置等问题。有什么可以帮助你的吗？",
      timestamp: Date.now(),
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || loading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const stream = await sendChatMessage([...messages, userMessage]);
      if (!stream) {
        throw new Error('No response stream');
      }

      // Add empty assistant message that we'll stream into
      const assistantMessageId = (Date.now() + 1).toString();
      setMessages(prev => [
        ...prev,
        {
          id: assistantMessageId,
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
        },
      ]);

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) {
                fullText += parsed.text;
                setMessages(prev =>
                  prev.map(m =>
                    m.id === assistantMessageId ? { ...m, content: fullText } : m
                  )
                );
              }
            } catch (e) {
              // Ignore parsing errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: '抱歉，遇到了错误，请重试。',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickQuestion = (question: string) => {
    handleSend(question);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="card-modern p-6 mb-4 bg-gradient-to-r from-blue-50/90 to-indigo-50/90">
        <div className="flex items-center gap-2 mb-2">
          <MessageSquare className="w-6 h-6 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">AI 图书馆助手</h2>
        </div>
        <p className="text-gray-600">
          全天候在线，随时回答你关于图书馆的问题。可以问引用格式、数据库使用、政策、位置等等。
        </p>
      </div>

      <div className="card-modern overflow-hidden">
        <div className="h-[50vh] md:h-[500px] overflow-y-auto p-4 bg-white/50">
          {messages.map((message) => (
            <div key={message.id} className="animate-fade-in-up">
              <MessageBubble message={message} />
            </div>
          ))}
          {loading && messages[messages.length - 1]?.role !== 'assistant' && (
            <div className="flex justify-start mb-4 animate-fade-in">
              <div className="bg-white/80 backdrop-blur-sm px-4 py-3 rounded-lg shadow-sm flex items-center gap-1.5">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-gray-200 p-4 bg-white/60">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="问我任何关于图书馆的问题..."
              className="input-modern flex-1 resize-none"
              rows={1}
              disabled={loading}
            />
            <button
              onClick={() => handleSend()}
              disabled={loading || !input.trim()}
              className="btn-primary px-4 py-2 flex items-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              发送
            </button>
          </div>
          {messages.length === 1 && <QuickQuestions onSelect={handleQuickQuestion} />}
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
