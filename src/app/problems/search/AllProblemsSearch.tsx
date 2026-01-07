"use client";

import { useMemo, useState } from "react";
import { ProblemCard } from "@/components/problems/ProblemCard";
import { ProblemFilters } from "@/components/problems/ProblemFilters";
import { phases } from "@/data/phases";
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

  const filteredProblems = useMemo(() => {
    return problems.filter((problem) => {
      // Search filter
      if (search) {
        const query = search.toLowerCase();
        const matchesName = problem.name.toLowerCase().includes(query);
        const matchesPlatform = problem.platform.toLowerCase().includes(query);
        const matchesTopic = problem.topic?.toLowerCase().includes(query);
        if (!matchesName && !matchesPlatform && !matchesTopic) {
          return false;
        }
      }

      // Platform filter
      if (platform !== "all" && problem.platform !== platform) {
        return false;
      }

      // Status filter (only for authenticated users)
      if (!isGuest && status !== "all" && problem.userStatus !== status) {
        return false;
      }

      // Favorite filter (only for authenticated users)
      if (!isGuest && favorite === "favorites" && !problem.isFavorite) {
        return false;
      }

      return true;
    });
  }, [problems, search, platform, status, favorite, isGuest]);

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
      </div>

      {/* Results grouped by phase */}
      {filteredProblems.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No problems match your filters.</p>
          {(search !== "" || platform !== "all" || status !== "all" || favorite !== "all") && (
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
                      <ProblemCard
                        key={`${problem.platform}-${problem.id}`}
                        problem={problem}
                      />
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
