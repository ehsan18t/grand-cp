import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { phases } from "@/data/phases";
import { problems } from "@/data/problems";
import { createDb } from "@/db";
import { problems as dbProblems, userProblems } from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const metadata = {
  title: "Problems | Grand CP",
  description: "Track your competitive programming progress with 655+ curated problems",
};

interface PhaseProgress {
  phaseId: number;
  total: number;
  solved: number;
}

export default async function ProblemsPage() {
  // Calculate static problem counts per phase
  const phaseCounts = new Map<number, number>();
  for (const problem of problems) {
    phaseCounts.set(problem.phaseId, (phaseCounts.get(problem.phaseId) ?? 0) + 1);
  }

  // Try to get user progress from database
  const phaseProgress = new Map<number, PhaseProgress>();
  for (const phase of phases) {
    const phaseId = phase.id ?? 0;
    phaseProgress.set(phaseId, {
      phaseId,
      total: phaseCounts.get(phaseId) ?? 0,
      solved: 0,
    });
  }

  try {
    const { env } = getCloudflareContext();
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (session?.user?.id) {
      // Get solved count per phase for this user
      const solvedByPhase = await db
        .select({
          phaseId: dbProblems.phaseId,
          solved: sql<number>`count(*)`,
        })
        .from(userProblems)
        .innerJoin(dbProblems, eq(userProblems.problemId, dbProblems.id))
        .where(eq(userProblems.userId, session.user.id))
        .groupBy(dbProblems.phaseId);

      for (const row of solvedByPhase) {
        const progress = phaseProgress.get(row.phaseId);
        if (progress) {
          progress.solved = row.solved;
        }
      }
    }
  } catch {
    // Database not available - use default (0 solved)
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="mb-4 font-bold text-4xl">🏆 Competitive Programming Roadmap</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          From 800 Codeforces Rating to Candidate Master (2200+). 655+ problems organized in 8
          phases.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {phases.map((phase) => {
          const phaseId = phase.id ?? 0;
          const progress = phaseProgress.get(phaseId);
          const total = progress?.total ?? 0;
          const solved = progress?.solved ?? 0;
          const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

          return (
            <Link
              key={phaseId}
              href={`/problems/phase/${phaseId}`}
              className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
            >
              <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-3 flex items-center justify-between">
                  <span className="font-mono font-semibold text-primary text-sm">
                    Phase {phaseId}
                  </span>
                  <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-muted-foreground text-xs">
                    {total} problems
                  </span>
                </div>

                <h2 className="mb-2 font-semibold text-lg transition-colors group-hover:text-primary">
                  {phase.name}
                </h2>

                <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">
                  {phase.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Target Rating:</span>
                  <span className="font-medium font-mono text-foreground">
                    {phase.targetRatingStart} → {phase.targetRatingEnd}
                  </span>
                </div>

                <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-right text-muted-foreground text-xs">
                  {solved}/{total} solved ({percentage}%)
                </p>
              </div>
            </Link>
          );
        })}
      </div>

      <section className="mt-16 rounded-xl border border-border bg-card p-8">
        <h2 className="mb-4 font-bold text-2xl">📚 How to Practice</h2>
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
