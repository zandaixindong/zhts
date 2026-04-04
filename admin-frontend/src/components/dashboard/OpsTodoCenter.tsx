import React, { useEffect, useState } from 'react';
import { ArrowRight, BrainCircuit, CircleAlert, Clock3, Sparkles } from 'lucide-react';
import { analyticsApi } from '../../utils/api';
import type { OpsCenterData, OpsTodoItem } from '../../types';

interface OpsTodoCenterProps {
  onNavigate: (section: string) => void;
}

const priorityStyles: Record<OpsTodoItem['priority'], string> = {
  high: 'bg-rose-50 text-rose-700 border-rose-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const OpsTodoCenter: React.FC<OpsTodoCenterProps> = ({ onNavigate }) => {
  const [data, setData] = useState<OpsCenterData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getOpsCenter().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="admin-panel h-[320px] animate-shimmer rounded-[24px]" />;
  }

  if (!data) {
    return <div className="admin-panel p-5 text-slate-500">运营待办中心加载失败</div>;
  }

  return (
    <div className="admin-panel p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">运营待办中心</p>
          <h3 className="mt-1 text-xl font-semibold text-slate-900">今天优先处理的事项</h3>
        </div>
        <span className="admin-chip">
          <Clock3 className="h-3.5 w-3.5" />
          自动生成
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {data.todos.map(todo => (
          <div key={todo.id} className="rounded-[22px] border border-slate-200 bg-slate-50/70 p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${priorityStyles[todo.priority]}`}>
                    {todo.priority === 'high' ? '高优先级' : todo.priority === 'medium' ? '中优先级' : '低优先级'}
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">{todo.category}</span>
                </div>
                <p className="mt-3 text-base font-semibold text-slate-900">{todo.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{todo.description}</p>
              </div>
              <div className="rounded-2xl bg-white px-4 py-3 shadow-sm">
                <p className="text-xs text-slate-400">关键指标</p>
                <p className="mt-1 text-sm font-semibold text-slate-900">{todo.metric}</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200 pt-4">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CircleAlert className="h-4 w-4 text-indigo-500" />
                建议尽快在对应模块中处理
              </div>
              <button
                onClick={() => onNavigate(todo.actionSection)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800"
              >
                {todo.actionLabel}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {data.insights.map(insight => (
          <div key={insight.title} className="rounded-[22px] border border-white/60 bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950 p-4 text-white">
            <div className="flex items-center gap-2 text-sm text-cyan-200">
              {insight.title.includes('AI') ? <BrainCircuit className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
              <span>{insight.title}</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-slate-200">{insight.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OpsTodoCenter;
