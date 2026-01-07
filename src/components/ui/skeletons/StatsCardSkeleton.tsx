"use client";

import { Skeleton } from "../Skeleton";

export function StatsCardSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2">
        <Skeleton width={24} height={24} variant="circular" />
        <Skeleton width={100} height={16} />
      </div>
      <Skeleton width={60} height={32} className="mb-1" />
      <Skeleton width={80} height={14} />
    </div>
  );
}

export function StatsCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <StatsCardSkeleton key={i} />
      ))}
    </div>
  );
}
