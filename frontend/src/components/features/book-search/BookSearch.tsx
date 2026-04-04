import React, { useState } from 'react';
import { Search, Loader2 } from 'lucide-react';
import { aiSearchBooks } from '../../../utils/api';
import type { AISearchResponse } from '../../../types';
import BookCard from './BookCard';
import { SkeletonCard } from '../../ui/Skeleton';

const BookSearch: React.FC = () => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AISearchResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const response = await aiSearchBooks(query.trim());
      setResults(response);
    } catch (e) {
      console.error('Search error:', e);
      setError('搜索书籍失败，请检查你的API密钥并重试。');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = () => {
    // Could refresh notifications here
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card-modern p-4 md:p-6 bg-gradient-to-r from-blue-50/90 to-indigo-50/90">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">AI智能找书</h2>
        <p className="text-sm md:text-base text-gray-600 mb-4">
          跨平台聚合搜索，自然语言查询。你可以说&quot;找几本AI入门的书&quot;或&quot;日本悬疑小说&quot;，也可以直接搜索书名作者。
        </p>

        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="搜索书籍...例如：人工智能入门 或 科幻小说"
              className="input-modern w-full pl-10 pr-4 py-3"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="btn-primary px-6 py-3 active:scale-95 transition-transform"
          >
            {loading ? (
              <Loader2 className="w-5 h-5 animate-spin inline" />
            ) : (
              '搜索'
            )}
          </button>
        </form>
      </div>

      {error && (
        <div className="card-modern bg-red-50/80 border-red-200 p-4 text-red-700 animate-fade-in">
          {error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      )}

      {!loading && results && (
        <div className="space-y-4 animate-fade-in">
          {results.message && (
            <div className="card-modern p-4">
              <p className="text-gray-700">{results.message}</p>
            </div>
          )}

          {results.books && results.books.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {results.books.map((book, i) => (
                <div key={book.id} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
                  <BookCard book={book} onSubscribe={handleSubscribe} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 card-modern bg-gray-50/80">
              <p className="text-gray-500">没有找到匹配的书籍</p>
              <p className="text-sm text-gray-400 mt-1">试试换个关键词或更宽泛的搜索</p>
            </div>
          )}
        </div>
      )}

      {!results && !loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card-modern p-4 text-center hover:shadow-lg transition-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <h3 className="font-medium text-gray-900 mb-2">AI聚合搜索</h3>
            <p className="text-sm text-gray-500">同时搜索馆藏纸本和电子资源</p>
          </div>
          <div className="card-modern p-4 text-center hover:shadow-lg transition-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <h3 className="font-medium text-gray-900 mb-2">自然语言查询</h3>
            <p className="text-sm text-gray-500">直接说你想要什么，无需复杂筛选</p>
          </div>
          <div className="card-modern p-4 text-center hover:shadow-lg transition-shadow hover:-translate-y-0.5 transition-transform duration-200">
            <h3 className="font-medium text-gray-900 mb-2">自动提醒</h3>
            <p className="text-sm text-gray-500">借出的书归还后自动通知你</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookSearch;
