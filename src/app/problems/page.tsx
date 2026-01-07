import { LogIn } from "lucide-react";
import Link from "next/link";
import { getRequestContext } from "@/lib/request-context";
import type { PhaseWithProgress } from "@/types/domain";

// Revalidate every hour for fresh data while maintaining cache
export const revalidate = 3600;

export const metadata = {
  title: "Problems | Grand CP",
  description: "Track your competitive programming progress with 655+ curated problems",
};

export default async function ProblemsPage() {
  const { services, userId } = await getRequestContext();
  const { phaseService, statsService } = services;

  const isGuest = !userId;

  // Get phase summary (phases + problem counts)
  const { phases, totalProblems, phaseCountsMap } = await phaseService.getPhaseSummary();

  // Get user progress if authenticated
  let phaseSolvedMap = new Map<number, number>();
  if (userId) {
    phaseSolvedMap = await statsService.getSolvedByPhase(userId);
  }

  // Calculate phases with progress
  const phasesWithProgress: PhaseWithProgress[] = phaseService.calculatePhasesWithProgress(
    phases,
    phaseCountsMap,
    phaseSolvedMap,
  );

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center sm:mb-12">
        <h1 className="mb-4 font-bold text-2xl sm:text-4xl">🏆 Competitive Programming Roadmap</h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          From 800 Codeforces Rating to Candidate Master (2200+). {totalProblems}+ problems
          organized in {phases.length} phases.
        </p>
      </header>

      {/* Guest CTA */}
      {isGuest && (
        <div className="mb-8 overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-4 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="mb-1 font-semibold text-lg">Track your progress</h2>
              <p className="text-muted-foreground text-sm">
                Sign in to save your progress, mark problems as solved, and track your journey to
                Candidate Master.
              </p>
            </div>
            <Link
              href="/api/auth/signin"
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground transition-all hover:bg-primary/90"
            >
              <LogIn className="h-4 w-4" />
              Sign in
            </Link>
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {phasesWithProgress.map((phase) => (
          <Link
            key={phase.id}
            href={`/problems/phase/${phase.id}`}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-4 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg sm:p-6"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono font-semibold text-primary text-sm">
                  Phase {phase.id}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-muted-foreground text-xs">
                  {phase.totalProblems} problems
                </span>
              </div>

              <h2 className="mb-2 font-semibold text-lg transition-colors group-hover:text-primary">
                {phase.name}
              </h2>

              <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">{phase.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target Rating:</span>
                <span className="font-medium font-mono text-foreground">
                  {phase.targetRatingStart} → {phase.targetRatingEnd}
                </span>
              </div>

              {/* Progress bar - show different state for guests */}
              {isGuest ? (
                <div className="mt-4">
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted" />
                  <p className="mt-1 text-right text-muted-foreground text-xs">
                    Sign in to track progress
                  </p>
                </div>
              ) : (
                <>
                  <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-500"
                      style={{ width: `${phase.progressPercentage}%` }}
                    />
                  </div>
                  <p className="mt-1 text-right text-muted-foreground text-xs">
                    {phase.solvedCount}/{phase.totalProblems} solved ({phase.progressPercentage}%)
                  </p>
                </>
              )}
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-12 rounded-xl border border-border bg-card p-4 sm:mt-16 sm:p-8">
        <h2 className="mb-4 font-bold text-xl sm:text-2xl">📚 How to Practice</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-lg">Golden Rules</h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
              <li>Follow problems serially - order is crucial</li>
              <li>Struggle 30-60 min before seeking hints</li>
              <li>Implement everything - reading is not solving</li>
              <li>Upsolve after every contest</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-lg">Time Guidelines</h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
              <li>Easy: 15-20 minutes</li>
              <li>Medium: 30-45 minutes</li>
              <li>Hard: 60-90 minutes</li>
              <li>Very Hard: 2+ hours (over days)</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
