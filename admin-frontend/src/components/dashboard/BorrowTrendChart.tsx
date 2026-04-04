import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../utils/api';
import type { TrendData } from '../../types';

const BorrowTrendChart: React.FC = () => {
  const [data, setData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getBorrowTrend(30).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 animate-shimmer rounded-xl" />;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">借阅趋势（近30天）</h3>
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="date"
            tickFormatter={(v) => v.slice(5)}
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
          />
          <YAxis tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            labelFormatter={(v) => `日期: ${v}`}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#6366f1"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: '#6366f1' }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default BorrowTrendChart;
