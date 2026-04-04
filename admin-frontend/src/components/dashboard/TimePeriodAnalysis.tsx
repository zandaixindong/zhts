import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { analyticsApi } from '../../utils/api';
import type { TimeUsageData } from '../../types';

const TimePeriodAnalysis: React.FC = () => {
  const [data, setData] = useState<TimeUsageData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    analyticsApi.getTimeUsage()
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 animate-shimmer rounded-xl" />;

  if (error || data.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in-up">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">今日时段使用率</h3>
        <div className="h-[250px] flex items-center justify-center text-gray-500">
          {error ? '数据加载失败' : '暂无数据'}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">今日时段使用率</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            formatter={(value: number) => [`${value}%`, '使用率']}
          />
          <ReferenceLine y={85} stroke="#ef4444" strokeDasharray="5 5" label={{ value: '高峰线 85%', position: 'right', fill: '#ef4444', fontSize: 10 }} />
          <Line
            type="monotone"
            dataKey="usageRate"
            stroke="#6366f1"
            strokeWidth={2}
            dot={{ r: 3, fill: '#6366f1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default TimePeriodAnalysis;
