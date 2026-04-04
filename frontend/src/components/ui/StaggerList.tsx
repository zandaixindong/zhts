import React, { Children } from 'react';
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';

interface StaggerListProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
}

const StaggerList: React.FC<StaggerListProps> = ({
  children,
  className = '',
  staggerDelay = 50,
}) => {
  const { ref, isVisible } = useIntersectionObserver<HTMLDivElement>();

  return (
    <div ref={ref} className={className}>
      {Children.map(children, (child, index) => (
        <div
          className="animate-fade-in-up"
          style={{
            opacity: isVisible ? undefined : 0,
            animationDelay: isVisible ? `${index * staggerDelay}ms` : '0ms',
            animationPlayState: isVisible ? 'running' : 'paused',
          }}
        >
          {child}
        </div>
      ))}
    </div>
  );
};

export default StaggerList;
