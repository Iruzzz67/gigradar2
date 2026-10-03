import React from 'react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[#18181b] border border-zinc-800/40 rounded-xl ${className}`}
    />
  );
};

export const EventCardSkeleton: React.FC = () => {
  return (
    <div className="bg-[#111113] border border-[#27272a] rounded-2xl overflow-hidden p-4 space-y-3">
      <Skeleton className="h-44 w-full rounded-xl" />
      <div className="flex gap-2">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      <Skeleton className="h-6 w-3/4" />
      <div className="space-y-1.5">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="pt-2 flex justify-between items-center border-t border-[#27272a]">
        <Skeleton className="h-5 w-24" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
};
