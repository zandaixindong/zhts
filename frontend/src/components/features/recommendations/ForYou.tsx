import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { getPersonalizedRecommendations } from '../../../utils/api';
import type { AIRecommendationResponse } from '../../../types';
import RecommendationCard from './RecommendationCard';

const ForYou: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState<AIRecommendationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getPersonalizedRecommendations();
      setResults(response);
    } catch (e) {
      console.error('Error loading recommendations:', e);
      setError('加载推荐失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="card-modern p-6 bg-gradient-to-r from-purple-50/90 to-pink-50/90">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-6 h-6 text-purple-600" />
          <h2 className="text-2xl font-bold text-gray-900">为你推荐</h2>
        </div>
        <p className="text-gray-600">
          基于你的阅读历史和兴趣，AI为你个性化推荐书籍。
        </p>
      </div>

      {error && (
        <div className="card-modern bg-red-50/80 border-red-200 p-4 text-red-700">
          {error}
          <button
            onClick={loadRecommendations}
            className="mt-2 px-4 py-2 bg-red-100 hover:bg-red-200 rounded-md text-red-800 text-sm transition-all duration-200"
          >
            重试
          </button>
        </div>
      )}

      {loading && (
        <div className="text-center py-12 card-modern">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-600" />
          <p className="text-gray-500 mt-4">AI正在为你精选推荐...</p>
        </div>
      )}

      {!loading && results && (
        <div className="space-y-4">
          {results.message && (
            <div className="card-modern p-4">
              <p className="text-gray-700">{results.message}</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {results.recommendations?.map((rec) => (
              <RecommendationCard key={rec.bookId} recommendation={rec} />
            ))}
          </div>

          {results.recommendations?.length === 0 && (
            <div className="text-center py-12 card-modern bg-gray-50/80">
              <p className="text-gray-500">暂无推荐</p>
              <p className="text-sm text-gray-400 mt-1">多读一些书就能获得个性化推荐了</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ForYou;
