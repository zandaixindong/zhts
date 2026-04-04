import React from 'react';
import { useIntersectionObserver, useAnimatedNumber } from '../../hooks/useIntersectionObserver';
import type { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'purple' | 'amber' | 'red' | 'indigo';
  suffix?: string;
}

const colorMap = {
  blue: { bg: 'from-blue-50 to-blue-100', icon: 'text-blue-500', title: 'text-blue-600', sub: 'text-blue-700' },
  green: { bg: 'from-green-50 to-green-100', icon: 'text-green-500', title: 'text-green-600', sub: 'text-green-700' },
  purple: { bg: 'from-purple-50 to-purple-100', icon: 'text-purple-500', title: 'text-purple-600', sub: 'text-purple-700' },
  amber: { bg: 'from-amber-50 to-amber-100', icon: 'text-amber-500', title: 'text-amber-600', sub: 'text-amber-700' },
  red: { bg: 'from-red-50 to-red-100', icon: 'text-red-500', title: 'text-red-600', sub: 'text-red-700' },
  indigo: { bg: 'from-indigo-50 to-indigo-100', icon: 'text-indigo-500', title: 'text-indigo-600', sub: 'text-indigo-700' },
};

const StatsCard: React.FC<StatsCardProps> = ({ title, value = 0, subtitle, icon: Icon, color, suffix = '' }) => {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>();
  const animatedValue = useAnimatedNumber(value, 1200, isVisible);
  const c = colorMap[color];

  return (
    <div
      ref={ref}
      className={`bg-gradient-to-br ${c.bg} rounded-xl p-5 shadow-sm border border-white/50 animate-fade-in-up`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-sm font-medium ${c.title}`}>{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">
            {animatedValue.toLocaleString()}{suffix}
          </p>
        </div>
        <Icon className={`w-10 h-10 ${c.icon} opacity-50`} />
      </div>
      <p className={`text-sm ${c.sub} mt-2`}>{subtitle}</p>
    </div>
  );
};

export default StatsCard;
