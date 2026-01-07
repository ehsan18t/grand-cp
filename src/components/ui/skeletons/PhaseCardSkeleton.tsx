"use client";

import { Skeleton } from "../Skeleton";

export function PhaseCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card p-4 sm:p-6">
      <div className="mb-3 flex items-center justify-between">
        <Skeleton width={70} height={20} />
        <Skeleton width={80} height={20} />
      </div>
      <Skeleton width="80%" height={24} className="mb-2" />
      <Skeleton lines={2} className="mb-4" />
      <div className="flex items-center justify-between">
        <Skeleton width={100} height={16} />
        <Skeleton width={90} height={16} />
      </div>
      <Skeleton width="100%" height={6} className="mt-4 rounded-full" />
    </div>
  );
}

export function PhaseCardSkeletonGrid({ count = 8 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <PhaseCardSkeleton key={i} />
      ))}
    </div>
  );
}
