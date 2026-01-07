import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui";
import { PhaseCardSkeletonGrid } from "@/components/ui/skeletons";

export default function ProblemsLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center sm:mb-12">
        <Skeleton width={400} height={36} className="mx-auto mb-4" />
        <Skeleton width={500} height={24} className="mx-auto mb-4" />
        <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2">
          <Search className="h-4 w-4 text-primary" />
          <Skeleton width={120} height={16} />
        </div>
      </header>

      <PhaseCardSkeletonGrid count={8} />
    </main>
  );
}
