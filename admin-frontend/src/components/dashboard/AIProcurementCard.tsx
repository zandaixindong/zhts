import React, { useState, useEffect } from 'react';
import { BookOpen, AlertCircle, ShoppingBag, Sparkles, AlertTriangle, Info } from 'lucide-react';
import { adminApi } from '../../utils/api';

interface ProcurementSuggestion {
  title: string;
  author: string;
  reason: string;
  urgency: 'high' | 'medium' | 'low';
}

interface ProcurementData {
  message: string;
  suggestions: ProcurementSuggestion[];
  analyzedCount: number;
}

const AIProcurementCard: React.FC = () => {
  const [data, setData] = useState<ProcurementData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSuggestions = async () => {
      try {
        const response = await adminApi.getProcurementSuggestions();
        if (isMounted) setData(response);
      } catch (err) {
        console.error('Failed to fetch procurement suggestions:', err);
        if (isMounted) setError('获取采购建议失败');
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchSuggestions();
    return () => { isMounted = false; };
  }, []);

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return <AlertCircle className="w-4 h-4 text-rose-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'low': return <Info className="w-4 h-4 text-blue-500" />;
      default: return null;
    }
  };

  const getUrgencyClass = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-rose-50 border-rose-100 text-rose-700';
      case 'medium': return 'bg-amber-50 border-amber-100 text-amber-700';
      case 'low': return 'bg-blue-50 border-blue-100 text-blue-700';
      default: return 'bg-slate-50 border-slate-100 text-slate-700';
    }
  };

  return (
    <div className="card-modern bg-gradient-to-br from-white to-slate-50 border-t-4 border-t-violet-500 shadow-lg">
      <div className="p-5 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-violet-100 p-2 rounded-lg text-violet-600">
            <ShoppingBag className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2">
              AI 动态采购参谋 <Sparkles className="w-4 h-4 text-amber-400" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              基于 {data?.analyzedCount || 0} 条“零结果”搜索分析推荐
            </p>
          </div>
        </div>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="space-y-3 mt-6">
              <div className="h-20 bg-slate-100 rounded-xl"></div>
              <div className="h-20 bg-slate-100 rounded-xl"></div>
            </div>
          </div>
        ) : error ? (
          <div className="text-center py-6 text-slate-500">
            <AlertCircle className="w-8 h-8 text-rose-300 mx-auto mb-2" />
            <p>{error}</p>
          </div>
        ) : data && data.suggestions.length > 0 ? (
          <>
            <p className="text-sm text-slate-700 bg-violet-50 border border-violet-100 p-3 rounded-lg mb-4 leading-relaxed">
              {data.message}
            </p>
            <div className="space-y-3">
              {data.suggestions.map((suggestion, index) => (
                <div key={index} className="bg-white border border-slate-200 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${suggestion.urgency === 'high' ? 'bg-rose-500' : suggestion.urgency === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                  <div className="flex justify-between items-start mb-2 pl-2">
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        {suggestion.title}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">{suggestion.author}</p>
                    </div>
                    <span className={`text-[10px] px-2 py-1 rounded-md border flex items-center gap-1 ${getUrgencyClass(suggestion.urgency)}`}>
                      {getUrgencyIcon(suggestion.urgency)}
                      {suggestion.urgency === 'high' ? '急需' : suggestion.urgency === 'medium' ? '建议' : '可选'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 bg-slate-50 p-2 rounded border border-slate-100 mt-2 pl-3">
                    {suggestion.reason}
                  </p>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-8 text-slate-500">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p>{data?.message || "近期馆藏搜索匹配度良好，暂无建议。"}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIProcurementCard;