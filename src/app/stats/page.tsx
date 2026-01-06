import { getCloudflareContext } from "@opennextjs/cloudflare";
import { BarChart3, Clock, Target, TrendingUp, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import { ShareButton } from "@/components/ui";
import { createDb } from "@/db";
import { createAuth } from "@/lib/auth";
import { createServices } from "@/lib/service-factory";
import { getSiteUrlFromEnv } from "@/lib/site";

export const metadata: Metadata = {
  title: "Stats | Grand CP",
  description: "Track your competitive programming progress",
};

export default async function StatsPage() {
  const { env } = await getCloudflareContext({ async: true });
  const db = createDb(env.DB);
  const auth = createAuth(env.DB, env);
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  const { phaseService, statsService } = createServices(db);

  // Get phase summary
  const { phases, totalProblems, phaseCountsMap } = await phaseService.getPhaseSummary();

  // Get user stats if authenticated
  let stats = statsService.createDefaultStats(totalProblems);
  let phaseSolvedMap = new Map<number, number>();

  if (session?.user?.id) {
    const userStats = await statsService.getUserStats(session.user.id, totalProblems);
    stats = {
      solved: userStats.solved,
      attempting: userStats.attempting,
      revisit: userStats.revisit,
      skipped: userStats.skipped,
      untouched: userStats.untouched,
    };
    phaseSolvedMap = userStats.phaseSolvedMap;
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

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
    <div className="flex items-center gap-2 rounded-md bg-muted/50 px-2 py-1.5 sm:bg-transparent sm:p-0">
      <div className={`h-3 w-3 shrink-0 rounded-full ${colorClass}`} />
      <span className="truncate text-muted-foreground text-sm">{label}</span>
      <span className="font-medium font-mono">{value}</span>
    </div>
  );
}
