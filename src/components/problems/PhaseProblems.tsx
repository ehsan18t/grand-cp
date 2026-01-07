"use client";

import { useCallback, useMemo, useState } from "react";
import { GuestBanner } from "@/components/auth";
import type { ProblemData } from "@/data/problems";
import { useFuzzySearch } from "@/hooks";
import type { ProblemStatus } from "@/types/domain";
import {
  type FavoriteFilter,
  type PlatformFilter,
  ProblemFilters,
  ProblemList,
  type StatusFilter,
} from ".";

export interface ProblemWithUserData extends ProblemData {
  id: number;
  userStatus: ProblemStatus;
  isFavorite: boolean;
}

interface PhaseProblemsProps {
  problems: ProblemWithUserData[];
  /** When true, shows guest mode UI with login prompts */
  isGuest?: boolean;
}

export function PhaseProblems({ problems, isGuest = false }: PhaseProblemsProps) {
  const [search, setSearch] = useState("");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilter>("all");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [favoriteFilter, setFavoriteFilter] = useState<FavoriteFilter>("all");

  // Create searchable text for fuzzy search
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
    if (platformFilter !== "all") {
      result = result.filter((p) => p.platform === platformFilter);
    }

    // Status filter (only for authenticated users)
    if (!isGuest && statusFilter !== "all") {
      result = result.filter((p) => p.userStatus === statusFilter);
    }

    // Favorite filter (only for authenticated users)
    if (!isGuest && favoriteFilter === "favorites") {
      result = result.filter((p) => p.isFavorite);
    }

    return result;
  }, [problems, search, fuzzySearch, platformFilter, statusFilter, favoriteFilter, isGuest]);

  const topics = useMemo(() => {
    return [...new Set(filteredProblems.map((p) => p.topic))];
  }, [filteredProblems]);

  return (
    <>
      {/* Guest banner */}
      {isGuest && <GuestBanner variant="progress" />}

      {/* Filter Bar */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <ProblemFilters
          search={search}
          onSearchChange={setSearch}
          platform={platformFilter}
          onPlatformChange={setPlatformFilter}
          status={statusFilter}
          onStatusChange={setStatusFilter}
          favorite={favoriteFilter}
          onFavoriteChange={setFavoriteFilter}
          isGuest={isGuest}
        />
      </div>

      {/* Problems by Topic */}
      {filteredProblems.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
          No problems found for this filter.
        </div>
      ) : (
        <div className="space-y-8">
          {topics.map((topic) => {
            const topicProblems = filteredProblems.filter((p) => p.topic === topic);
            return (
              <ProblemList key={topic} topic={topic} problems={topicProblems} isGuest={isGuest} />
            );
          })}
        </div>
      )}
    </>
  );
}
