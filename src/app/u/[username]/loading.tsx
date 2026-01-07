import { Skeleton } from "@/components/ui";
import {
  PhaseCardSkeletonGrid,
  ProfileSkeleton,
  StatsCardSkeletonGrid,
} from "@/components/ui/skeletons";

export default function ProfileLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Profile header skeleton */}
      <div className="mb-8">
        <ProfileSkeleton />
      </div>

      {/* Stats cards skeleton */}
      <div className="mb-8">
        <StatsCardSkeletonGrid count={4} />
      </div>

      {/* Phase progress skeleton */}
      <div>
        <Skeleton width={200} height={28} className="mb-4" />
        <PhaseCardSkeletonGrid count={8} />
      </div>
    </main>
  );
}
