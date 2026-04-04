import React, { useState, useEffect } from 'react';

interface PageTransitionProps {
  activeKey: string;
  children: React.ReactNode;
  className?: string;
}

const PageTransition: React.FC<PageTransitionProps> = ({
  activeKey,
  children,
  className = '',
}) => {
  const [currentKey, setCurrentKey] = useState(activeKey);
  const [isAnimating, setIsAnimating] = useState(false);
  const [displayChildren, setDisplayChildren] = useState(children);

  useEffect(() => {
    if (activeKey === currentKey) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsAnimating(true);
    const timer = setTimeout(() => {
      setDisplayChildren(children);
      setCurrentKey(activeKey);
      setIsAnimating(false);
    }, 150);

    return () => clearTimeout(timer);
  }, [activeKey]);

  // Update children when key stays the same but content changes
  useEffect(() => {
    if (activeKey === currentKey) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDisplayChildren(children);
    }
  }, [children, activeKey, currentKey]);

  return (
    <div
      className={`transition-all duration-150 ${className}`}
      style={{
        opacity: isAnimating ? 0 : 1,
        transform: isAnimating ? 'translateY(8px)' : 'translateY(0)',
      }}
    >
      {displayChildren}
    </div>
  );
};

export default PageTransition;
