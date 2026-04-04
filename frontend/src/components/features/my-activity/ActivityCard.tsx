import React from 'react';

interface ActivityCardProps {
  title: string;
  subtitle?: string;
  status?: 'success' | 'warning' | 'error' | 'neutral';
  children?: React.ReactNode;
  actions?: React.ReactNode;
}

const getStatusColor = (status?: ActivityCardProps['status']) => {
  switch (status) {
    case 'success': return 'bg-green-100 text-green-800 border-green-200';
    case 'warning': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'error': return 'bg-red-100 text-red-800 border-red-200';
    case 'neutral': default: return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

const ActivityCard: React.FC<ActivityCardProps> = ({
  title,
  subtitle,
  status,
  children,
  actions,
}) => {
  return (
    <div className="card-modern p-4">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-base font-semibold text-gray-900">{title}</h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
          {status && (
            <div className="mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor(status)}`}>
                {status === 'success' ? '正常' : status === 'warning' ? '即将到期' : status === 'error' ? '已逾期' : '进行中'}
              </span>
            </div>
          )}
          {children && (
            <div className="mt-3">{children}</div>
          )}
        </div>
        {actions && (
          <div className="ml-4 flex flex-col gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
};

export default ActivityCard;
