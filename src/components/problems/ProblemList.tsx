"use client";

import type { ProblemData } from "@/data/problems";
import { ProblemCard } from "./ProblemCard";
import type { StatusValue } from "./StatusSelect";

interface ProblemListProps {
  problems: ProblemData[];
  topic: string;
}

export function ProblemList({ problems, topic }: ProblemListProps) {
  const handleStatusChange = async (problemNumber: number, status: StatusValue) => {
    try {
      const response = await fetch("/api/status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemNumber, status }),
      });

      if (!response.ok) {
        const error = await response.json();
        console.error("Failed to update status:", error);
        // Could add toast notification here
      }
    } catch (error) {
      console.error("Status update error:", error);
    }
  };

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
          <ProblemCard key={problem.number} problem={problem} onStatusChange={handleStatusChange} />
        ))}
      </div>
    </section>
  );
}
