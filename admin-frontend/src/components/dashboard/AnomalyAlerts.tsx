import React, { useEffect, useState } from 'react';
import { AlertTriangle, AlertCircle, Info, Users } from 'lucide-react';
import { analyticsApi } from '../../utils/api';
import type { AnomalyData } from '../../types';

const iconMap = {
  danger: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const colorMap = {
  danger: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-amber-50 border-amber-200 text-amber-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800',
};

const iconColorMap = {
  danger: 'text-red-500',
  warning: 'text-amber-500',
  info: 'text-blue-500',
};

const AnomalyAlerts: React.FC = () => {
  const [data, setData] = useState<AnomalyData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi.getAnomalies().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="h-48 animate-shimmer rounded-xl" />;

  const alerts = data?.alerts || [];
  const users = data?.highViolationUsers || [];

  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 animate-fade-in-up">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">异常预警</h3>

      {alerts.length === 0 && users.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <Info className="w-8 h-8 mx-auto mb-2" />
          <p>暂无异常预警</p>
        </div>
      )}

      <div className="space-y-3">
        {alerts.map((alert, i) => {
          const Icon = iconMap[alert.type];
          return (
            <div key={i} className={`flex items-start gap-3 p-3 rounded-lg border ${colorMap[alert.type]}`}>
              <Icon className={`w-5 h-5 flex-shrink-0 mt-0.5 ${iconColorMap[alert.type]}`} />
              <div>
                <p className="font-medium text-sm">{alert.title}</p>
                <p className="text-xs mt-0.5 opacity-80">{alert.message}</p>
              </div>
            </div>
          );
        })}

        {users.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4" />
              高违约用户
            </div>
            {users.map(user => (
              <div key={user.id} className="flex items-center justify-between py-1.5 text-sm">
                <span className="text-gray-600">{user.name} ({user.email})</span>
                <span className="text-red-600 font-medium">{user.violationCount} 次违约</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AnomalyAlerts;
