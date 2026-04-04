import React from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  label?: string;
  color?: 'blue' | 'green' | 'purple' | 'amber' | 'red';
}

const colorMap = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  amber: 'from-amber-500 to-amber-600',
  red: 'from-red-500 to-red-600',
};

const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  className = '',
  barClassName = '',
  showLabel = false,
  label,
  color = 'blue',
}) => {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>();
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div ref={ref} className={className}>
      {(showLabel || label) && (
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <span>{label || ''}</span>
          {showLabel && <span>{Math.round(percentage)}%</span>}
        </div>
      )}
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${colorMap[color]} transition-all duration-1000 ease-out ${barClassName}`}
          style={{ width: isVisible ? `${percentage}%` : '0%' }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
