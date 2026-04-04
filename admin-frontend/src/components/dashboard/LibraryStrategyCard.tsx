import React, { useEffect, useState } from 'react';
import { BrainCircuit, Compass, Sparkles } from 'lucide-react';
import { analyticsApi } from '../../utils/api';
import type { LibraryStrategy } from '../../types';

const icons = [Compass, Sparkles, BrainCircuit];

const LibraryStrategyCard: React.FC = () => {
  const [data, setData] = useState<LibraryStrategy | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getLibraryStrategy().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="admin-panel h-[320px] animate-shimmer rounded-[24px]" />;
  }

  if (!data) {
    return <div className="admin-panel p-5 text-slate-500">今日馆舍策略加载失败</div>;
  }

  return (
    <div className="admin-panel p-5">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">今日馆舍策略</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">{data.title}</h3>
        </div>
        <span className="admin-chip">AI 推荐</span>
      </div>

      <p className="mt-4 rounded-[22px] bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 px-4 py-4 text-sm leading-7 text-slate-200">
        {data.summary}
      </p>

      <div className="mt-4 space-y-3">
        {data.strategies.map((item, index) => {
          const Icon = icons[index % icons.length];
          return (
            <div key={item.title} className="rounded-[22px] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{item.title}</p>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{item.recommendation}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LibraryStrategyCard;
