"use client";

import type { ProblemWithUserData } from "./PhaseProblems";
import { ProblemCard } from "./ProblemCard";

interface ProblemListProps {
  problems: ProblemWithUserData[];
  topic: string;
}

export function ProblemList({ problems, topic }: ProblemListProps) {
  return (
    <section>
      <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
        <span className="h-1 w-4 rounded-full bg-primary" />
        {topic}
        <span className="font-normal text-muted-foreground text-sm">
          ({problems.length} problems)
        </span>
      </h2>

      <div className="space-y-2">
        {problems.map((problem) => (
          <ProblemCard
            key={problem.number}
            problem={problem}
            initialStatus={problem.userStatus}
            initialFavorite={problem.isFavorite}
            showFavorite
          />
        ))}
      </div>
    </section>
  );
}
