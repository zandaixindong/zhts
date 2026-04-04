import React, { useState, useRef, useEffect } from 'react';
import { X, Send, Bot, User, BookOpen, Sparkles } from 'lucide-react';
import { chatApi } from '../../../utils/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface BookBuddyModalProps {
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  onClose: () => void;
}

const BookBuddyModal: React.FC<BookBuddyModalProps> = ({ bookId, bookTitle, bookAuthor, onClose }) => {
  const [messages, setMessages] = useState<Message[]>([{
    id: 'welcome',
    role: 'assistant',
    content: `你好！我是《${bookTitle}》的专属伴读助手。关于这本书的核心观点、背景故事或者你看不懂的地方，都可以问我哦！`
  }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isTyping) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    const history = messages.map(m => ({ role: m.role, content: m.content })).slice(1); // Exclude welcome message

    try {
      const stream = await chatApi.sendBookChatMessage(bookId, userMsg.content, history);
      
      if (!stream) throw new Error('No stream returned');

      const reader = stream.getReader();
      const decoder = new TextDecoder();
      let assistantMsgId = (Date.now() + 1).toString();
      let assistantContent = '';

      setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ') && line !== 'data: [DONE]') {
            try {
              const data = JSON.parse(line.slice(6));
              assistantContent += data.text;
              
              setMessages(prev => prev.map(msg => 
                msg.id === assistantMsgId 
                  ? { ...msg, content: assistantContent }
                  : msg
              ));
            } catch (e) {
              console.error('Error parsing SSE data:', e);
            }
          }
        }
      }
    } catch (error) {
      console.error('Chat error:', error);
      setMessages(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'assistant', 
        content: '抱歉，我的思绪刚才飘走了（网络连接失败）。请再说一遍好吗？' 
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 sm:p-6 animate-fade-in backdrop-blur-sm">
      <div className="glass-panel w-full max-w-2xl overflow-hidden rounded-[24px] flex flex-col h-[85vh] max-h-[800px] animate-scale-in">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/20 bg-white/40 p-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-white shadow-md">
              <Bot className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-800 flex items-center gap-1.5">
                AI 伴读导师 <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              </h3>
              <p className="text-xs text-slate-500 line-clamp-1 max-w-[200px] sm:max-w-xs flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> 《{bookTitle}》{bookAuthor ? ` - ${bookAuthor}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-white/50 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-end gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                  <Bot className="h-4 w-4" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-br-none'
                    : 'bg-white border border-slate-100 text-slate-700 rounded-bl-none leading-relaxed whitespace-pre-wrap'
                }`}
              >
                {msg.content}
                {msg.content === '' && msg.role === 'assistant' && isTyping && (
                  <span className="inline-flex gap-1">
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    <span className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
                  </span>
                )}
              </div>
              {msg.role === 'user' && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500">
                  <User className="h-4 w-4" />
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-white/20 bg-white/60 p-4 backdrop-blur-md">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="输入你的问题，例如：这本书的核心讲了什么？"
              className="flex-1 input-modern bg-white/80"
              disabled={isTyping}
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-md transition-transform hover:scale-105 hover:bg-indigo-700 disabled:opacity-50 disabled:hover:scale-100"
            >
              <Send className="h-4 w-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BookBuddyModal;