import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '' }) => (
  <div className={`animate-shimmer rounded ${className}`} />
);

export const SkeletonCard: React.FC = () => (
  <div className="card-modern p-5 space-y-3">
    <Skeleton className="h-5 w-3/4" />
    <Skeleton className="h-4 w-1/2" />
    <Skeleton className="h-4 w-full" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

export const SkeletonTable: React.FC<{ rows?: number }> = ({ rows = 5 }) => (
  <div className="card-modern p-4 space-y-3">
    <Skeleton className="h-10 w-full" />
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="flex gap-3">
        <Skeleton className="h-6 flex-1" />
        <Skeleton className="h-6 flex-1" />
        <Skeleton className="h-6 w-24" />
      </div>
    ))}
  </div>
);

export const SkeletonBookSearch: React.FC = () => (
  <div className="space-y-6">
    <Skeleton className="h-12 w-full rounded-xl" />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export const SkeletonSeatMap: React.FC = () => (
  <div className="space-y-4">
    <div className="flex gap-2">
      <Skeleton className="h-10 w-24 rounded-lg" />
      <Skeleton className="h-10 w-24 rounded-lg" />
      <Skeleton className="h-10 w-24 rounded-lg" />
    </div>
    <Skeleton className="h-64 w-full rounded-xl" />
    <div className="flex gap-3">
      <Skeleton className="h-10 w-32 rounded-lg" />
      <Skeleton className="h-10 flex-1 rounded-lg" />
    </div>
  </div>
);

export default Skeleton;
