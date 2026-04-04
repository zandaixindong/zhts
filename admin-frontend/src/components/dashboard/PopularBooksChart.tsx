import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { analyticsApi } from '../../utils/api';
import type { PopularBook } from '../../types';

const PopularBooksChart: React.FC = () => {
  const [data, setData] = useState<PopularBook[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getPopularBooks(8).then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 animate-shimmer rounded-xl" />;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">热门书籍排行</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#9ca3af" />
          <YAxis dataKey="title" type="category" tick={{ fontSize: 10 }} stroke="#9ca3af" width={120} />
          <Tooltip
            contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }}
            formatter={(value: number) => [`${value} 次`, '借阅次数']}
          />
          <Bar dataKey="checkoutCount" fill="#6366f1" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PopularBooksChart;
