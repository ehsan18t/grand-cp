"use client";

import { Skeleton } from "../Skeleton";

export function ProblemCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-center gap-2.5">
        <Skeleton width={40} height={20} />
        <Skeleton width={32} height={32} variant="circular" />
        <div className="min-w-0 flex-1">
          <Skeleton width="70%" height={20} className="mb-1" />
          <Skeleton width="50%" height={16} />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Skeleton width={100} height={32} />
        <Skeleton width={32} height={32} variant="circular" />
      </div>
    </div>
  );
}

export function ProblemCardSkeletonList({ count = 6 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <ProblemCardSkeleton key={i} />
      ))}
    </div>
  );
}
