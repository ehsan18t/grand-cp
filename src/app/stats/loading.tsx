import { Skeleton } from "@/components/ui";
import { PhaseCardSkeletonGrid, StatsCardSkeletonGrid } from "@/components/ui/skeletons";

export default function StatsLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Your Progress</h1>
          <p className="text-muted-foreground">Track your competitive programming journey</p>
        </div>
        <Skeleton width={100} height={40} />
      </header>

      {/* Stats cards skeleton */}
      <div className="mb-8">
        <StatsCardSkeletonGrid count={4} />
      </div>

      {/* Progress ring skeleton */}
      <div className="mb-8 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-col items-center gap-6 sm:flex-row">
          <Skeleton width={160} height={160} variant="circular" />
          <div className="flex-1">
            <Skeleton width={200} height={24} className="mb-2" />
            <Skeleton width={300} height={16} className="mb-4" />
            <div className="flex gap-4">
              <Skeleton width={80} height={32} />
              <Skeleton width={80} height={32} />
              <Skeleton width={80} height={32} />
            </div>
          </div>
        </div>
      </div>

      {/* Phase progress skeleton */}
      <div>
        <Skeleton width={200} height={28} className="mb-4" />
        <PhaseCardSkeletonGrid count={8} />
      </div>
    </main>
  );
}
