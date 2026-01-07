import { ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui";
import { problems as staticProblems } from "@/data";
import { getRequestContext } from "@/lib/request-context";
import type { Problem, ProblemWithUserData } from "@/types/domain";
import { SearchPageClient } from "./SearchPageClient";

export const metadata = {
  title: "Search Problems | Grand CP",
  description: "Search across all 655+ competitive programming problems",
};

export default async function SearchPage() {
  let isGuest = true;
  let allProblems: Problem[] = [];
  let problemsWithUserData: ProblemWithUserData[] = [];

  try {
    const { services, userId } = await getRequestContext();
    const { problemService } = services;

    isGuest = !userId;
    allProblems = await problemService.getAllProblems();
    problemsWithUserData = await problemService.getProblemsWithUserData(allProblems, userId);
  } catch (error) {
    console.error("Search page failed to load dynamic data; using static fallback", error);

    // Fallback: use static problems list and default user metadata
    allProblems = staticProblems.map((p, idx) => ({ ...p, id: p.number ?? idx + 1 }));
    problemsWithUserData = allProblems.map((p) => ({
      ...p,
      userStatus: "untouched" as const,
      isFavorite: false,
    }));
  }

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
          Search across all {allProblems.length} problems from every phase. Uses fuzzy matching for
          typo-tolerant search.
        </p>
      </header>

      <SearchPageClient initialProblems={problemsWithUserData} isGuest={isGuest} />
    </main>
  );
}
