import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, sql } from "drizzle-orm";
import { headers } from "next/headers";
import Link from "next/link";
import { createDb } from "@/db";
import { phases as dbPhases, problems as dbProblems, userProblems } from "@/db/schema";
import { createAuth } from "@/lib/auth";

// Revalidate every hour for fresh data while maintaining cache
export const revalidate = 3600;

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
  const { env } = await getCloudflareContext({ async: true });
  const db = createDb(env.DB);
  const auth = createAuth(env.DB, env);
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  // Fetch phases from database
  const phases = await db.select().from(dbPhases).orderBy(dbPhases.id);

  // Calculate problem counts per phase from database
  const problemCounts = await db
    .select({
      phaseId: dbProblems.phaseId,
      count: sql<number>`count(*)`,
    })
    .from(dbProblems)
    .groupBy(dbProblems.phaseId);

  const phaseCounts = new Map<number, number>(problemCounts.map((p) => [p.phaseId, p.count]));

  // Initialize phase progress
  const phaseProgress = new Map<number, PhaseProgress>();
  for (const phase of phases) {
    phaseProgress.set(phase.id, {
      phaseId: phase.id,
      total: phaseCounts.get(phase.id) ?? 0,
      solved: 0,
    });
  }

  // Get user progress if authenticated
  if (session?.user?.id) {
    const solvedByPhase = await db
      .select({
        phaseId: dbProblems.phaseId,
        solved: sql<number>`count(*)`,
      })
      .from(userProblems)
      .innerJoin(dbProblems, eq(userProblems.problemId, dbProblems.id))
      .where(and(eq(userProblems.userId, session.user.id), eq(userProblems.status, "solved")))
      .groupBy(dbProblems.phaseId);

    for (const row of solvedByPhase) {
      const progress = phaseProgress.get(row.phaseId);
      if (progress) {
        progress.solved = row.solved;
      }
    }
  }

  // Calculate total problem count
  const totalProblems = Array.from(phaseCounts.values()).reduce((a, b) => a + b, 0);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8 text-center sm:mb-12">
        <h1 className="mb-4 font-bold text-2xl sm:text-4xl">🏆 Competitive Programming Roadmap</h1>
        <p className="mx-auto max-w-2xl text-base text-muted-foreground sm:text-lg">
          From 800 Codeforces Rating to Candidate Master (2200+). {totalProblems}+ problems
          organized in {phases.length} phases.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3 xl:grid-cols-4">
        {phases.map((phase) => {
          const progress = phaseProgress.get(phase.id);
          const total = progress?.total ?? 0;
          const solved = progress?.solved ?? 0;
          const percentage = total > 0 ? Math.round((solved / total) * 100) : 0;

          return (
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
