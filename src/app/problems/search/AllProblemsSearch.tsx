"use client";

import { useCallback, useMemo, useState } from "react";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { ProblemFilters } from "@/components/problems/ProblemFilters";
import { phases } from "@/data/phases";
import { useFuzzySearch } from "@/hooks";
import type { Platform, ProblemStatus, ProblemWithUserData } from "@/types/domain";

interface AllProblemsSearchProps {
  problems: ProblemWithUserData[];
  isGuest: boolean;
}

type FavoriteFilter = "all" | "favorites";
type StatusFilter = ProblemStatus | "all";

export function AllProblemsSearch({ problems, isGuest }: AllProblemsSearchProps) {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [favorite, setFavorite] = useState<FavoriteFilter>("all");

  // Create searchable text for each problem (name + topic + platform)
  const getSearchableText = useCallback(
    (problem: ProblemWithUserData) =>
      `${problem.name} ${problem.topic || ""} ${problem.platform}`.toLowerCase(),
    [],
  );

  // Use fuzzy search hook
  const { search: fuzzySearch } = useFuzzySearch({
    items: problems,
    getSearchableText,
    minQueryLength: 1,
  });

  const filteredProblems = useMemo(() => {
    // First apply fuzzy search
    let result = search.trim() ? fuzzySearch(search) : problems;

    // Platform filter
    if (platform !== "all") {
      result = result.filter((problem) => problem.platform === platform);
    }

    // Status filter (only for authenticated users)
    if (!isGuest && status !== "all") {
      result = result.filter((problem) => problem.userStatus === status);
    }

    // Favorite filter (only for authenticated users)
    if (!isGuest && favorite === "favorites") {
      result = result.filter((problem) => problem.isFavorite);
    }

    return result;
  }, [problems, search, fuzzySearch, platform, status, favorite, isGuest]);

  // Group by phase for display
  const groupedByPhase = useMemo(() => {
    const groups: Record<number, ProblemWithUserData[]> = {};
    for (const problem of filteredProblems) {
      if (!groups[problem.phaseId]) {
        groups[problem.phaseId] = [];
      }
      groups[problem.phaseId].push(problem);
    }
    return groups;
  }, [filteredProblems]);

  const hasActiveFilters =
    search !== "" || platform !== "all" || status !== "all" || favorite !== "all";

  return (
    <div className="space-y-6">
      <ProblemFilters
        search={search}
        onSearchChange={setSearch}
        platform={platform}
        onPlatformChange={setPlatform}
        status={status}
        onStatusChange={setStatus}
        favorite={favorite}
        onFavoriteChange={setFavorite}
        isGuest={isGuest}
      />

      {/* Results count */}
      <div className="text-muted-foreground text-sm">
        Showing {filteredProblems.length} of {problems.length} problems
        {search.trim() && (
          <span className="ml-1 text-primary">(fuzzy matching "{search.trim()}")</span>
        )}
      </div>

      {/* Results grouped by phase */}
      {filteredProblems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No problems match your filters.</p>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setPlatform("all");
                setStatus("all");
                setFavorite("all");
              }}
              className="mt-2 text-primary hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedByPhase)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([phaseNum, phaseProblems]) => {
              const phaseData = phases.find((p) => p.id === Number(phaseNum));
              return (
                <section key={phaseNum}>
                  <h2 className="mb-4 font-semibold text-lg">
                    Phase {phaseNum}
                    {phaseData && (
                      <span className="ml-2 font-normal text-muted-foreground text-sm">
                        ({phaseData.targetRatingStart}–{phaseData.targetRatingEnd}) —{" "}
                        {phaseProblems.length} matches
                      </span>
                    )}
                  </h2>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {phaseProblems.map((problem) => (
                      <ProblemCard key={`${problem.platform}-${problem.id}`} problem={problem} />
                    ))}
                  </div>
                </section>
              );
            })}
        </div>
      )}
    </div>
  );
}
