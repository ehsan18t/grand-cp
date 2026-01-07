"use client";

/**
 * Phase Page Content - Client component that reads from the app store.
 */

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhaseProblems } from "@/components/problems";
import { useAppStore } from "@/stores/app-store";

interface PhasePageContentProps {
  phaseId: number;
}

export function PhasePageContent({ phaseId }: PhasePageContentProps) {
  const phases = useAppStore((s) => s.phases);
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const getProblemsWithUserData = useAppStore((s) => s.getProblemsWithUserData);

  const phase = phases.find((p) => p.id === phaseId);
  
  if (!phase) {
    notFound();
  }

  const phaseProblems = getProblemsWithUserData(phaseId);
  const isGuest = !isAuthenticated;

  // Calculate stats from problems
  const stats = {
    solved: phaseProblems.filter((p) => p.userStatus === "solved").length,
    attempting: phaseProblems.filter((p) => p.userStatus === "attempting").length,
    skipped: phaseProblems.filter((p) => p.userStatus === "skipped").length,
    revisit: phaseProblems.filter((p) => p.userStatus === "revisit").length,
  };

  const prevPhase = phases.find((p) => p.id === phaseId - 1);
  const nextPhase = phases.find((p) => p.id === phaseId + 1);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
          <Link href="/problems" className="hover:text-primary">
            Problems
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Phase {phase.id}</span>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="mb-1 font-mono text-primary text-sm">Phase {phase.id}</div>
            <h1 className="mb-2 font-bold text-2xl sm:text-3xl">{phase.name}</h1>
            <p className="max-w-2xl text-muted-foreground text-sm sm:text-base">
              {phase.description}
            </p>
          </div>

          <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-3 sm:border-0 sm:bg-transparent sm:p-0">
            <div className="text-center sm:text-right">
              <div className="text-muted-foreground text-xs sm:text-sm">Target Rating</div>
              <div className="font-mono font-semibold text-base sm:text-lg">
                {phase.targetRatingStart} → {phase.targetRatingEnd}
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-muted-foreground text-xs sm:text-sm">Problems</div>
              <div className="font-mono font-semibold text-base sm:text-lg">
                {phase.problemStart}-{phase.problemEnd}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: phaseProblems.length, color: "text-foreground" },
          { label: "Solved", value: stats.solved, color: "text-status-solved" },
          { label: "Attempting", value: stats.attempting, color: "text-status-attempting" },
          { label: "Skipped", value: stats.skipped, color: "text-status-skipped" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <div className="text-muted-foreground text-sm">{stat.label}</div>
            <div className={`font-bold font-mono text-2xl ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Problems with Filtering */}
      <PhaseProblems problems={phaseProblems} isGuest={isGuest} />

      {/* Navigation */}
      <nav className="mt-12 flex flex-col gap-4 border-border border-t pt-8 sm:flex-row sm:items-center sm:justify-between">
        {prevPhase ? (
          <Link
            href={`/problems/phase/${prevPhase.id}`}
            className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary sm:border-0 sm:bg-transparent sm:p-0"
          >
            <ChevronLeft className="h-5 w-5 shrink-0" />
            <div className="min-w-0">
              <div className="text-xs sm:text-sm">Previous Phase</div>
              <div className="truncate font-medium text-foreground">{prevPhase.name}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextPhase ? (
          <Link
            href={`/problems/phase/${nextPhase.id}`}
            className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-right text-muted-foreground transition-colors hover:border-primary/30 hover:text-primary sm:border-0 sm:bg-transparent sm:p-0"
          >
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm">Next Phase</div>
              <div className="truncate font-medium text-foreground">{nextPhase.name}</div>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0" />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </main>
  );
}
