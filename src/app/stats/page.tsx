import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, sql } from "drizzle-orm";
import { BarChart3, Clock, Target, TrendingUp, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ShareButton } from "@/components/ui";
import { createDb } from "@/db";
import {
  phases as dbPhases,
  problems as dbProblems,
  userFavorites,
  userProblems,
} from "@/db/schema";
import { createAuth } from "@/lib/auth";
import { getSiteUrlFromEnv } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stats | Grand CP",
  description: "Track your competitive programming progress",
};

export default async function StatsPage() {
  const { env } = await getCloudflareContext();
  const db = createDb(env.DB);
  const auth = createAuth(env.DB, env);
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  // Fetch phases and problem counts from database
  const [phases, totalProblemsResult] = await Promise.all([
    db.select().from(dbPhases).orderBy(dbPhases.id),
    db.select({ count: sql<number>`count(*)` }).from(dbProblems),
  ]);

  const totalProblems = totalProblemsResult[0]?.count ?? 0;

  // Fetch problem counts per phase
  const problemCountsByPhase = await db
    .select({
      phaseId: dbProblems.phaseId,
      count: sql<number>`count(*)`,
    })
    .from(dbProblems)
    .groupBy(dbProblems.phaseId);

  const phaseCountsMap = new Map(problemCountsByPhase.map((p) => [p.phaseId, p.count]));

  // Default stats for unauthenticated users
  const stats = {
    solved: 0,
    attempting: 0,
    revisit: 0,
    skipped: 0,
    untouched: totalProblems,
  };

  let phaseSolvedMap = new Map<number, number>();
  let _favoritesCount = 0;

  // Fetch user stats if authenticated
  if (session?.user?.id) {
    const [statusCounts, solvedByPhase, favoritesResult] = await Promise.all([
      // Get status counts for this user
      db
        .select({
          status: userProblems.status,
          count: sql<number>`count(*)`,
        })
        .from(userProblems)
        .where(eq(userProblems.userId, session.user.id))
        .groupBy(userProblems.status),

      // Get solved count per phase
      db
        .select({
          phaseId: dbProblems.phaseId,
          count: sql<number>`count(*)`,
        })
        .from(userProblems)
        .innerJoin(dbProblems, eq(userProblems.problemId, dbProblems.id))
        .where(eq(userProblems.userId, session.user.id))
        .groupBy(dbProblems.phaseId),

      // Get favorites count
      db
        .select({ count: sql<number>`count(*)` })
        .from(userFavorites)
        .where(eq(userFavorites.userId, session.user.id)),
    ]);

    // Map status counts
    let touched = 0;
    for (const row of statusCounts) {
      if (row.status === "solved") {
        stats.solved = row.count;
        touched += row.count;
      } else if (row.status === "attempting") {
        stats.attempting = row.count;
        touched += row.count;
      } else if (row.status === "revisit") {
        stats.revisit = row.count;
        touched += row.count;
      } else if (row.status === "skipped") {
        stats.skipped = row.count;
        touched += row.count;
      }
    }
    stats.untouched = totalProblems - touched;

    // Map solved by phase
    phaseSolvedMap = new Map(solvedByPhase.map((p) => [p.phaseId, p.count]));

    // Favorites count
    _favoritesCount = favoritesResult[0]?.count ?? 0;
  }

  const progressPercentage =
    totalProblems > 0 ? Math.round((stats.solved / totalProblems) * 100) : 0;

  // Build profile URL for sharing (if user is authenticated)
  const siteUrl = getSiteUrlFromEnv(env);
  const username = session?.user?.username ?? session?.user?.id;
  const profileUrl = username ? `${siteUrl}/u/${username}` : null;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="mb-2 font-bold text-3xl">Your Progress</h1>
          <p className="text-muted-foreground">Track your competitive programming journey</p>
        </div>
        {profileUrl && (
          <ShareButton
            title="My Grand CP Progress"
            text={`I've solved ${stats.solved} problems (${progressPercentage}%) on Grand CP! Check out my profile:`}
            url={profileUrl}
          />
        )}
      </header>

      {/* Overview Cards */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Problems Solved"
          value={stats.solved}
          total={totalProblems}
          color="text-status-solved"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="In Progress"
          value={stats.attempting}
          color="text-status-attempting"
        />
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Completion Rate"
          value={`${progressPercentage}%`}
          color="text-primary"
        />
        <StatCard
          icon={<Clock className="h-5 w-5" />}
          label="Time Tracked"
          value="0h"
          subtext="Coming soon"
          color="text-muted-foreground"
        />
      </div>

      {/* Progress by Status */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
          <BarChart3 className="h-5 w-5 text-primary" />
          Status Breakdown
        </h2>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex h-4 overflow-hidden rounded-full bg-muted">
            {stats.solved > 0 && (
              <div
                className="bg-status-solved transition-all"
                style={{ width: `${(stats.solved / totalProblems) * 100}%` }}
              />
            )}
            {stats.attempting > 0 && (
              <div
                className="bg-status-attempting transition-all"
                style={{ width: `${(stats.attempting / totalProblems) * 100}%` }}
              />
            )}
            {stats.revisit > 0 && (
              <div
                className="bg-status-revisit transition-all"
                style={{ width: `${(stats.revisit / totalProblems) * 100}%` }}
              />
            )}
            {stats.skipped > 0 && (
              <div
                className="bg-status-skipped transition-all"
                style={{ width: `${(stats.skipped / totalProblems) * 100}%` }}
              />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatusLegend label="Solved" value={stats.solved} colorClass="bg-status-solved" />
            <StatusLegend
              label="Attempting"
              value={stats.attempting}
              colorClass="bg-status-attempting"
            />
            <StatusLegend label="Revisit" value={stats.revisit} colorClass="bg-status-revisit" />
            <StatusLegend label="Skipped" value={stats.skipped} colorClass="bg-status-skipped" />
            <StatusLegend
              label="Untouched"
              value={stats.untouched}
              colorClass="bg-status-untouched"
            />
          </div>
        </div>
      </section>

      {/* Progress by Phase */}
      <section className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
          <Target className="h-5 w-5 text-primary" />
          Phase Progress
        </h2>

        <div className="space-y-4">
          {phases.map((phase) => {
            const phaseTotal = phaseCountsMap.get(phase.id) ?? 0;
            const phaseSolved = phaseSolvedMap.get(phase.id) ?? 0;
            const phaseProgress = phaseTotal > 0 ? Math.round((phaseSolved / phaseTotal) * 100) : 0;

            return (
              <div key={phase.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-muted-foreground text-sm">
                      Phase {phase.id}
                    </span>
                    <h3 className="font-medium">{phase.name}</h3>
                  </div>
                  <div className="text-right">
                    <div className="font-mono font-semibold">{phaseProgress}%</div>
                    <div className="text-muted-foreground text-sm">
                      {phaseSolved}/{phaseTotal} solved
                    </div>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-status-solved transition-all"
                    style={{ width: `${phaseProgress}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-xl">
          <Clock className="h-5 w-5 text-primary" />
          Recent Activity
        </h2>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="py-8 text-center text-muted-foreground">
            <Clock className="mx-auto mb-2 h-8 w-8 opacity-50" />
            <p>No recent activity</p>
            <p className="text-sm">Start solving problems to see your progress here</p>
          </div>
        </div>
      </section>
    </main>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number | string;
  total?: number;
  subtext?: string;
  color: string;
}

function StatCard({ icon, label, value, total, subtext, color }: StatCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className={`font-bold font-mono text-2xl ${color}`}>
        {value}
        {total !== undefined && (
          <span className="font-normal text-lg text-muted-foreground">/{total}</span>
        )}
      </div>
      {subtext && <div className="text-muted-foreground text-xs">{subtext}</div>}
    </div>
  );
}

interface StatusLegendProps {
  label: string;
  value: number;
  colorClass: string;
}

function StatusLegend({ label, value, colorClass }: StatusLegendProps) {
  return (
    <div className="flex items-center gap-2">
      <div className={`h-3 w-3 rounded-full ${colorClass}`} />
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="font-medium font-mono">{value}</span>
    </div>
  );
}
