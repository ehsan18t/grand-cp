import { LogIn, Search } from "lucide-react";
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
        <Link
          href="/problems/search"
          className="mt-4 inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 px-4 py-2 font-medium text-primary text-sm transition-colors hover:bg-primary/20"
        >
          <Search className="h-4 w-4" />
          Search All Problems
        </Link>
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
        <h2 className="mb-6 font-bold text-xl sm:text-2xl">📚 How to Practice</h2>

        {/* Two Pillars */}
        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h3 className="mb-2 font-semibold text-primary">&quot;What to Think&quot;</h3>
            <p className="text-muted-foreground text-sm">
              Know standard problems, techniques, and patterns. Build your mental library of
              solutions.
            </p>
          </div>
          <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
            <h3 className="mb-2 font-semibold text-primary">&quot;How to Think&quot;</h3>
            <p className="text-muted-foreground text-sm">
              Build paths to solutions through intentional struggle. The struggle is where learning
              happens.
            </p>
          </div>
        </div>

        {/* Golden Rules */}
        <div className="mb-8">
          <h3 className="mb-3 font-semibold text-lg">🏆 Golden Rules</h3>
          <ul className="grid gap-2 text-muted-foreground text-sm sm:grid-cols-2">
            <li className="flex items-start gap-2">
              <span className="text-primary">1.</span>
              <span>
                <strong className="text-foreground">No jumping around</strong> - The order is
                crucial
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">2.</span>
              <span>
                <strong className="text-foreground">Struggle first</strong> - 30-60 min before hints
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">3.</span>
              <span>
                <strong className="text-foreground">Avoid self-deception</strong> - Editorial =
                spoiled
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">4.</span>
              <span>
                <strong className="text-foreground">Upsolve religiously</strong> - After every
                contest
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">5.</span>
              <span>
                <strong className="text-foreground">Ask &quot;Why?&quot;</strong> - Reflect after
                solving
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary">6.</span>
              <span>
                <strong className="text-foreground">Implement everything</strong> - Reading ≠
                solving
              </span>
            </li>
          </ul>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Time Guidelines */}
          <div>
            <h3 className="mb-3 font-semibold text-lg">⏱️ Time Guidelines</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between rounded bg-muted/50 px-3 py-2">
                <span>Easy</span>
                <span className="text-muted-foreground">15-20 min</span>
              </div>
              <div className="flex justify-between rounded bg-muted/50 px-3 py-2">
                <span>Medium</span>
                <span className="text-muted-foreground">30-45 min</span>
              </div>
              <div className="flex justify-between rounded bg-muted/50 px-3 py-2">
                <span>Hard</span>
                <span className="text-muted-foreground">60-90 min</span>
              </div>
              <div className="flex justify-between rounded bg-muted/50 px-3 py-2">
                <span>Very Hard</span>
                <span className="text-muted-foreground">2+ hours (over days)</span>
              </div>
            </div>
          </div>

          {/* After Editorial */}
          <div>
            <h3 className="mb-3 font-semibold text-lg">🤔 After Reading Editorial</h3>
            <ul className="space-y-2 text-muted-foreground text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>&quot;Why didn&apos;t I think of this?&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>&quot;What observation wasn&apos;t intuitive?&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>&quot;Is this technique standard?&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>&quot;What similar problems could this solve?&quot;</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Warning Signs */}
        <div className="mt-6 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
          <h3 className="mb-2 font-semibold text-destructive">⚠️ Warning Signs of Self-Deception</h3>
          <ul className="grid gap-1 text-muted-foreground text-sm sm:grid-cols-2">
            <li>• Only solving easy problems</li>
            <li>• Reading hints after 5 minutes</li>
            <li>• Saying &quot;I would have solved it&quot;</li>
            <li>• Rushing for quantity over quality</li>
          </ul>
        </div>
      </section>
    </main>
  );
}
