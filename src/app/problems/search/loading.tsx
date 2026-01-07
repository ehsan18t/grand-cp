import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { Button, Skeleton } from "@/components/ui";

export default function SearchLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="mb-4 flex items-center justify-between gap-3">
          <Button asChild variant="ghost" size="sm" leftIcon={<ArrowLeft />}>
            <Link href="/problems">Back to Problems</Link>
          </Button>
        </div>

        <h1 className="mb-2 flex items-center gap-2 font-bold text-2xl sm:text-3xl">
          <Search className="h-6 w-6 text-primary" aria-hidden="true" />
          Search All Problems
        </h1>
        <Skeleton width={400} height={20} />
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

      {/* Loading state message */}
      <div className="py-12 text-center">
        <div className="mb-4 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-primary" />
        </div>
        <p className="text-muted-foreground">Loading problems...</p>
      </div>
    </main>
  );
}
