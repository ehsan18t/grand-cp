import { ArrowLeft, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui";
import { buildMetadata } from "@/lib/seo";
import { SearchPageClient } from "./SearchPageClient";

export const metadata: Metadata = buildMetadata({
  title: "Search Problems",
  description: "Search across all 655+ competitive programming problems",
  path: "/problems/search",
  noIndex: true,
  ogImage: {
    title: "Search Problems",
    subtitle: "Find CP problems fast",
    eyebrow: "Competitive Programming",
  },
});

export default function SearchPage() {
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
        <p className="text-muted-foreground">
          Search across all problems from every phase. Uses fuzzy matching for typo-tolerant search.
        </p>
      </header>

      <SearchPageClient />
    </main>
  );
}
