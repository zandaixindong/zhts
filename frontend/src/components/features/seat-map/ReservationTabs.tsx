import React from 'react';
import { Calendar as CalendarIcon, FileText, MapPin, Sofa } from 'lucide-react';
import type { ReservationTab } from './seatReservationUtils';

interface ReservationTabsProps {
  activeTab: ReservationTab;
  onChange: (tab: ReservationTab) => void;
}

const tabs = [
  { id: 'booking', label: 'AI 预约选座', icon: Sofa },
  { id: 'quick', label: '快速选座', icon: MapPin },
  { id: 'history', label: '预约记录', icon: CalendarIcon },
  { id: 'rules', label: '规则说明', icon: FileText },
] as const;

const ReservationTabs: React.FC<ReservationTabsProps> = ({ activeTab, onChange }) => {
  return (
    <div className="admin-panel p-4">
      <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 rounded-2xl px-4 py-3 text-sm font-medium transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-[0_18px_40px_-18px_rgba(79,70,229,0.7)]'
                  : 'border border-slate-200 bg-white/70 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Icon className="h-5 w-5" />
              {tab.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ReservationTabs;
