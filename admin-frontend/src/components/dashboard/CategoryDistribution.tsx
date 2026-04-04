import React, { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { analyticsApi } from '../../utils/api';
import type { CategoryData } from '../../types';

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#818cf8', '#60a5fa', '#34d399', '#fbbf24', '#f87171', '#fb923c'];

const CategoryDistribution: React.FC = () => {
  const [data, setData] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getCategoryDistribution().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-64 animate-shimmer rounded-xl" />;

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">书籍分类分布</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            outerRadius={90}
            innerRadius={50}
            dataKey="count"
            nameKey="category"
            label={({ category, percent }) => `${category} ${(percent * 100).toFixed(0)}%`}
            labelLine={true}
          >
            {data.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb' }} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CategoryDistribution;
