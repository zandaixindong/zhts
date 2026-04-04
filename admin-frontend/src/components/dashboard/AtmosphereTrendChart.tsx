import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { analyticsApi } from '../../utils/api';

const AtmosphereTrendChart: React.FC = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await analyticsApi.getAtmosphereTrend(7);
        if (isMounted && response?.data) {
          setData(response.data);
        }
      } catch (error) {
        console.error('Failed to fetch atmosphere trend:', error);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchData();
    return () => { isMounted = false; };
  }, []);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-xl bg-slate-100"></div>;
  }

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl bg-slate-50 border border-slate-100">
        <p className="text-slate-400">暂无近七天氛围评分数据</p>
      </div>
    );
  }

  const floors = Object.keys(data[0] || {}).filter(key => key !== 'date');
  const colors = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b'];

  return (
    <div className="card-modern p-5">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            近7天空间氛围综合评分趋势
          </h3>
          <p className="text-xs text-slate-500 mt-1">基于各个楼层的噪音、拥挤度、采光等多维数据的 AI 评分均值</p>
        </div>
      </div>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="date" 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              dy={10} 
            />
            <YAxis 
              axisLine={false} 
              tickLine={false} 
              tick={{ fontSize: 12, fill: '#64748b' }} 
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{ borderRadius: '0.75rem', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
            {floors.map((floor, i) => (
              <Line 
                key={floor} 
                type="monotone" 
                dataKey={floor} 
                name={floor} 
                stroke={colors[i % colors.length]} 
                strokeWidth={3} 
                dot={{ r: 3, strokeWidth: 2 }} 
                activeDot={{ r: 6, strokeWidth: 0 }} 
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AtmosphereTrendChart;