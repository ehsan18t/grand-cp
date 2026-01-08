"use client";

import { memo } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { Skeleton } from "@/components/ui";
import { cn } from "@/lib/utils";

const problemCardSkeletonVariants = tv({
  slots: {
    root: [
      "flex flex-col gap-3 rounded-lg border border-border bg-card p-4",
      "sm:flex-row sm:items-center sm:gap-4",
    ],
    topRow: "flex min-w-0 flex-1 items-center gap-2.5",
    actions: "flex shrink-0 items-center gap-3 justify-between",
  },
  variants: {
    compact: {
      true: {
        root: "p-3 gap-2 sm:gap-3",
      },
    },
  },
  defaultVariants: {
    compact: false,
  },
});

export interface ProblemCardSkeletonProps extends VariantProps<typeof problemCardSkeletonVariants> {
  className?: string;
}

/**
 * Skeleton placeholder for ProblemCard during loading states.
 */
function ProblemCardSkeletonBase({ compact, className }: ProblemCardSkeletonProps) {
  const styles = problemCardSkeletonVariants({ compact });

  return (
    <div className={cn(styles.root(), className)}>
      {/* Top row: number, platform, content */}
      <div className={styles.topRow()}>
        {/* Problem number skeleton */}
        <Skeleton width={40} height={20} className="shrink-0" />

        {/* Platform badge skeleton */}
        <Skeleton width={70} height={24} className="shrink-0 rounded-full" />

        {/* Problem content skeleton */}
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton width="80%" height={20} />
          {!compact && <Skeleton width="60%" height={16} />}
        </div>
      </div>

      {/* Divider on mobile */}
      <div className="h-px w-full bg-border sm:hidden" aria-hidden="true" />

      {/* Actions skeleton */}
      <div className={styles.actions()}>
        {/* Status select skeleton */}
        <Skeleton width={100} height={32} className="rounded-full" />

        {/* Favorite button skeleton */}
        <Skeleton width={32} height={32} className="rounded-md" />
      </div>
    </div>
  );
}

export const ProblemCardSkeleton = memo(ProblemCardSkeletonBase);
ProblemCardSkeleton.displayName = "ProblemCardSkeleton";
