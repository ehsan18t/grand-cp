import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui";
import { ProblemCardSkeletonList } from "@/components/ui/skeletons";

export default function PhaseLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
          <Link href="/problems" className="hover:text-primary">
            Problems
          </Link>
          <ChevronRight className="h-4 w-4" />
          <Skeleton width={80} height={16} />
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <Skeleton width={80} height={16} className="mb-1" />
            <Skeleton width={300} height={32} className="mb-2" />
            <Skeleton width={500} height={20} />
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-3">
            <Skeleton width={120} height={40} />
          </div>
        </div>
      </header>

      {/* Filters skeleton */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <div className="flex flex-wrap gap-4">
          <Skeleton width={200} height={40} />
          <Skeleton width={150} height={40} />
          <Skeleton width={150} height={40} />
          <Skeleton width={150} height={40} />
        </div>
      </div>

      {/* Problems skeleton */}
      <div className="space-y-8">
        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-4 rounded-full bg-primary" />
            <Skeleton width={150} height={24} />
          </div>
          <ProblemCardSkeletonList count={4} />
        </section>

        <section>
          <div className="mb-4 flex items-center gap-2">
            <div className="h-1 w-4 rounded-full bg-primary" />
            <Skeleton width={180} height={24} />
          </div>
          <ProblemCardSkeletonList count={3} />
        </section>
      </div>
    </main>
  );
}
