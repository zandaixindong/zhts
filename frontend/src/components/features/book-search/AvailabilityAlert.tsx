import React from 'react';
import { Bell } from 'lucide-react';

interface AvailabilityAlertProps {
  onSubscribe: () => void;
  loading: boolean;
  error: string | null;
}

const AvailabilityAlert: React.FC<AvailabilityAlertProps> = ({ onSubscribe, loading, error }) => {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
      <p className="text-sm text-amber-800 mb-2">
        这本书目前已被借出。订阅后，书归还时会自动通知你。
      </p>
      <button
        onClick={onSubscribe}
        disabled={loading}
        className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-amber-900 bg-amber-200 hover:bg-amber-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Bell className="w-4 h-4 mr-2" />
        {loading ? '订阅中...' : '到货通知我'}
      </button>
      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
};

export default AvailabilityAlert;
