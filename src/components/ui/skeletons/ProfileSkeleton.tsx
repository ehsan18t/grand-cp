"use client";

import { Skeleton } from "../Skeleton";

export function ProfileSkeleton() {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="flex flex-wrap items-start gap-6">
        <Skeleton width={80} height={80} variant="circular" />
        <div className="min-w-0 flex-1">
          <Skeleton width={200} height={28} className="mb-2" />
          <Skeleton width={150} height={16} className="mb-4" />
          <div className="flex gap-4">
            <Skeleton width={100} height={20} />
            <Skeleton width={100} height={20} />
          </div>
        </div>
      </div>
    </div>
  );
}
