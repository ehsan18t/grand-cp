"use client";

import { useMemo, useState } from "react";
import { GuestBanner } from "@/components/auth";
import type { ProblemData } from "@/data/problems";
import type { ProblemStatus } from "@/types/domain";
import { PlatformFilter, type PlatformFilter as PlatformFilterValue, ProblemList } from ".";

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
  const [platformFilter, setPlatformFilter] = useState<PlatformFilterValue>("all");

  const filteredProblems = useMemo(() => {
    if (platformFilter === "all") return problems;
    return problems.filter((p) => p.platform === platformFilter);
  }, [problems, platformFilter]);

  const topics = useMemo(() => {
    return [...new Set(filteredProblems.map((p) => p.topic))];
  }, [filteredProblems]);

  return (
    <>
      {/* Guest banner */}
      {isGuest && <GuestBanner variant="progress" />}

      {/* Filter Bar */}
      <div className="mb-6 rounded-lg border border-border bg-card p-4">
        <PlatformFilter value={platformFilter} onChange={setPlatformFilter} />
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
