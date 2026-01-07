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

type ResultRow = {
  problem: ProblemWithUserData;
  highlightTitleRanges?: Array<[number, number]>;
  highlightNoteRanges?: Array<[number, number]>;
};

const sliceRangesToSegment = (
  ranges: Array<[number, number]>,
  segmentStart: number,
  segmentEnd: number,
): Array<[number, number]> => {
  if (segmentEnd <= segmentStart) return [];

  const out: Array<[number, number]> = [];
  for (const [start, end] of ranges) {
    const clippedStart = Math.max(start, segmentStart);
    const clippedEnd = Math.min(end, segmentEnd);
    if (clippedEnd > clippedStart) {
      out.push([clippedStart - segmentStart, clippedEnd - segmentStart]);
    }
  }
  return out;
};

export function AllProblemsSearch({ problems, isGuest }: AllProblemsSearchProps) {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<Platform | "all">("all");
  const [status, setStatus] = useState<StatusFilter>("all");
  const [favorite, setFavorite] = useState<FavoriteFilter>("all");

  // Create searchable text for fuzzy search.
  // We include topic/platform for finding results, but only highlight matches in title + note.
  const getSearchableText = useCallback(
    (problem: ProblemWithUserData) =>
      `${problem.name}\n${problem.note || ""}\n${problem.topic || ""}\n${problem.platform}`.toLowerCase(),
    [],
  );

  // Use fuzzy search hook
  const { searchWithMatches: fuzzySearchWithMatches } = useFuzzySearch({
    items: problems,
    getSearchableText,
    minQueryLength: 1,
  });

  const trimmedSearch = search.trim();

  const filteredRows = useMemo((): ResultRow[] => {
    // Per requirement: do not show any results until a query exists.
    if (!trimmedSearch) return [];

    // First apply fuzzy search (carrying match ranges along).
    let result: ResultRow[] = fuzzySearchWithMatches(trimmedSearch).map(({ item, ranges }) => {
      const titleStart = 0;
      const titleEnd = item.name.length;
      const noteStart = titleEnd + 1;
      const noteEnd = noteStart + (item.note?.length ?? 0);

      return {
        problem: item,
        highlightTitleRanges: sliceRangesToSegment(ranges, titleStart, titleEnd),
        highlightNoteRanges: sliceRangesToSegment(ranges, noteStart, noteEnd),
      };
    });

    // Platform filter
    if (platform !== "all") {
      result = result.filter((row) => row.problem.platform === platform);
    }

    // Status filter (only for authenticated users)
    if (!isGuest && status !== "all") {
      result = result.filter((row) => row.problem.userStatus === status);
    }

    // Favorite filter (only for authenticated users)
    if (!isGuest && favorite === "favorites") {
      result = result.filter((row) => row.problem.isFavorite);
    }

    return result;
  }, [trimmedSearch, fuzzySearchWithMatches, platform, status, favorite, isGuest]);

  const filteredProblems = useMemo(() => filteredRows.map((r) => r.problem), [filteredRows]);

  // Group by phase for display
  const groupedByPhase = useMemo(() => {
    const groups: Record<number, ResultRow[]> = {};
    for (const row of filteredRows) {
      const phaseId = row.problem.phaseId;
      if (!groups[phaseId]) {
        groups[phaseId] = [];
      }
      groups[phaseId].push(row);
    }
    return groups;
  }, [filteredRows]);

  const hasActiveFilters =
    trimmedSearch !== "" || platform !== "all" || status !== "all" || favorite !== "all";

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
      {trimmedSearch ? (
        <div className="text-muted-foreground text-sm">
          Showing {filteredProblems.length} of {problems.length} problems
          <span className="ml-1 text-primary">(fuzzy matching "{trimmedSearch}")</span>
        </div>
      ) : (
        <div className="text-muted-foreground text-sm">Start typing to search problems.</div>
      )}

      {/* Results grouped by phase */}
      {!trimmedSearch ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">No results yet — enter a search query.</p>
        </div>
      ) : filteredProblems.length === 0 ? (
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
                    {phaseProblems.map((row) => (
                      <ProblemCard
                        key={`${row.problem.platform}-${row.problem.id}`}
                        problem={row.problem}
                        highlightTitleRanges={row.highlightTitleRanges}
                        highlightNoteRanges={row.highlightNoteRanges}
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
