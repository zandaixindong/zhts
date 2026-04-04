import React, { useState } from 'react';
import { Users, Search, Sparkles, MapPin, ArrowRight } from 'lucide-react';
import api from '../../../utils/api';

interface MatchResult {
  groupName: string;
  matchedUsers: string[];
  roomName: string;
  message: string;
}

const GroupMatcher: React.FC = () => {
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Direct API call for the new endpoint
      const response = await api.post('/seats/group-match', { topic, userId: 'demo-user-id' });
      // The interceptor unwraps to response.data
      setResult(response.data);
    } catch (e: any) {
      console.error('Match error:', e);
      setError('网络波动，匹配失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card-modern overflow-hidden bg-gradient-to-br from-indigo-50 to-purple-50 p-5 border border-indigo-100 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-500 text-white p-2 rounded-xl shadow-md">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-1.5">
              AI 智能寻找学习搭子 <Sparkles className="w-4 h-4 text-amber-500" />
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">输入你今天的学习课题，自动匹配同频书友</p>
          </div>
        </div>
      </div>

      {!result ? (
        <form onSubmit={handleMatch} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="例如：准备高数期末考 / React 开发 / 考研政治"
              className="w-full pl-9 pr-4 py-3 bg-white border border-indigo-100 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all shadow-sm text-sm"
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={!topic.trim() || loading}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-semibold shadow-md shadow-indigo-500/20 hover:shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 whitespace-nowrap"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                正在全馆雷达扫描...
              </>
            ) : (
              <>开始 AI 匹配</>
            )}
          </button>
        </form>
      ) : (
        <div className="animate-fade-in-up bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
          <div className="flex justify-between items-start mb-3">
            <div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-700 text-xs font-bold mb-2">
                <Sparkles className="w-3 h-3" /> 匹配成功
              </span>
              <h4 className="text-lg font-extrabold text-slate-800">{result.groupName}</h4>
            </div>
            <button onClick={() => setResult(null)} className="text-slate-400 hover:text-slate-600 text-sm underline decoration-dotted">
              重新匹配
            </button>
          </div>
          
          <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4 leading-relaxed">
            {result.message}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-3 bg-indigo-50 rounded-lg border border-indigo-100/50">
            <div className="flex items-center gap-4 text-sm w-full sm:w-auto">
              <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
                <MapPin className="w-4 h-4" />
                {result.roomName}
              </div>
              <div className="flex -space-x-2">
                {result.matchedUsers.map((name, i) => (
                  <div key={i} className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 border-2 border-indigo-50 flex items-center justify-center text-[10px] text-white font-bold" title={name}>
                    {name.charAt(0).toUpperCase()}
                  </div>
                ))}
                <div className="w-7 h-7 rounded-full bg-white border-2 border-indigo-200 border-dashed flex items-center justify-center text-xs text-indigo-400 font-bold" title="等你加入">
                  +1
                </div>
              </div>
            </div>
            <button className="w-full sm:w-auto flex items-center justify-center gap-1 px-4 py-2 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              去该房间入座 <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-3 text-sm text-rose-500 flex items-center gap-1">
          <span>⚠️</span> {error}
        </div>
      )}
    </div>
  );
};

export default GroupMatcher;