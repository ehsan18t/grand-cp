"use client";

import { useMemo, useState } from "react";
import type { ProblemData } from "@/data/problems";
import { PlatformFilter, type PlatformFilter as PlatformFilterValue, ProblemList } from ".";
import type { StatusValue } from "./StatusSelect";

export interface ProblemWithUserData extends ProblemData {
  id: number;
  userStatus: StatusValue;
  isFavorite: boolean;
}

interface PhaseProblemsProps {
  problems: ProblemWithUserData[];
}

export function PhaseProblems({ problems }: PhaseProblemsProps) {
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
            return <ProblemList key={topic} topic={topic} problems={topicProblems} />;
          })}
        </div>
      )}
    </>
  );
}
