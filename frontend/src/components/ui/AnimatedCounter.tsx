import React from 'react';
import { useIntersectionObserver, useAnimatedNumber } from '../../hooks/useIntersectionObserver';

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  className?: string;
  prefix?: string;
  suffix?: string;
}

const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  value,
  duration = 1000,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const { ref, isVisible } = useIntersectionObserver<HTMLSpanElement>();
  const animatedValue = useAnimatedNumber(value, duration, isVisible);

  return (
    <span ref={ref} className={className}>
      {prefix}{animatedValue.toLocaleString()}{suffix}
    </span>
  );
};

export default AnimatedCounter;
