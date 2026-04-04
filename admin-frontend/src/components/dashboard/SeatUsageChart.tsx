import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { analyticsApi } from '../../utils/api';
import type { SeatUsageData } from '../../types';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8'];

const SeatUsageChart: React.FC = () => {
  const [data, setData] = useState<SeatUsageData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getSeatUsage().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 animate-shimmer rounded-xl" />;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">楼层座位使用率</h3>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis dataKey="floorName" type="category" tick={{ fontSize: 11 }} stroke="#9ca3af" width={80} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            formatter={(value: number) => [`${value}%`, '使用率']}
          />
          <Bar dataKey="usageRate" radius={[0, 4, 4, 0]}>
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default SeatUsageChart;
