import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Calendar } from 'lucide-react';
import { seatApi } from '../../../utils/api';

interface AtmosphereTrendChartProps {
  floorId: string;
}

export interface AtmosphereHistoryPoint {
  date: string;
  noise: number | null;
  crowding: number | null;
  brightness: number | null;
  overall: number | null;
}

const colorMap = {
  noise: '#ef4444',
  crowding: '#f59e0b',
  brightness: '#3b82f6',
  overall: '#10b981',
};

const labelMap = {
  noise: '噪音',
  crowding: '拥挤',
  brightness: '采光',
  overall: '整体氛围',
};

const AtmosphereTrendChart: React.FC<AtmosphereTrendChartProps> = ({ floorId }) => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<AtmosphereHistoryPoint[]>([]);
  const [days, setDays] = useState<number>(7);

  useEffect(() => {
    const loadHistory = async () => {
      setLoading(true);
      try {
        const res = await seatApi.getAtmosphereHistory(floorId, days);
        setData(Array.isArray(res) ? res : res?.data || []);
      } catch (e) {
        console.error('Failed to load atmosphere history:', e);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [floorId, days]);

  // Filter out nulls for chart display
  const chartData = data.map(point => ({
    date: point.date.slice(-5), // Show only MM-DD
    noise: point.noise,
    crowding: point.crowding,
    brightness: point.brightness,
    overall: point.overall,
  }));

  return (
    <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-indigo-600" />
          <h3 className="text-lg font-semibold text-slate-900">空间氛围历史趋势</h3>
        </div>
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-slate-500" />
          <div className="flex rounded-lg bg-slate-100 p-1">
            <button
              onClick={() => setDays(7)}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                days === 7 ? 'bg-white shadow-sm font-medium text-indigo-600' : 'text-slate-600'
              }`}
            >
              7天
            </button>
            <button
              onClick={() => setDays(30)}
              className={`px-3 py-1 text-sm rounded-md transition-all ${
                days === 30 ? 'bg-white shadow-sm font-medium text-indigo-600' : 'text-slate-600'
              }`}
            >
              30天
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600"></div>
        </div>
      ) : (
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 10 }} />
              <Line
                type="monotone"
                dataKey="noise"
                stroke={colorMap.noise}
                name={labelMap.noise}
                strokeWidth={2}
                connectNulls
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="crowding"
                stroke={colorMap.crowding}
                name={labelMap.crowding}
                strokeWidth={2}
                connectNulls
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="brightness"
                stroke={colorMap.brightness}
                name={labelMap.brightness}
                strokeWidth={2}
                connectNulls
                dot={{ r: 3 }}
              />
              <Line
                type="monotone"
                dataKey="overall"
                stroke={colorMap.overall}
                name={labelMap.overall}
                strokeWidth={3}
                connectNulls
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-3 text-xs text-slate-500">
        评分说明：噪音/拥挤 数值越高越拥挤嘈杂；采光/整体氛围 数值越高体验越好
      </div>
    </div>
  );
};

export default AtmosphereTrendChart;
