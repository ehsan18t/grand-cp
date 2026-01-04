import { BarChart3, Clock, Target, TrendingUp, Trophy } from "lucide-react";
import type { Metadata } from "next";
import { phases } from "@/data/phases";
import { problems } from "@/data/problems";

export const metadata: Metadata = {
  title: "Stats | Grand CP",
  description: "Track your competitive programming progress",
};

export default function StatsPage() {
  const totalProblems = problems.length;

  // These would come from the database for authenticated users
  const stats = {
    solved: 0,
    attempting: 0,
    revisit: 0,
    skipped: 0,
    untouched: totalProblems,
  };

  const progressPercentage =
    totalProblems > 0 ? Math.round((stats.solved / totalProblems) * 100) : 0;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <h1 className="mb-2 font-bold text-3xl">Your Progress</h1>
        <p className="text-muted-foreground">Track your competitive programming journey</p>
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
            const phaseProblems = problems.filter((p) => p.phaseId === phase.id);
            const phaseSolved = 0; // Would come from DB
            const phaseProgress =
              phaseProblems.length > 0 ? Math.round((phaseSolved / phaseProblems.length) * 100) : 0;

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
                      {phaseSolved}/{phaseProblems.length} solved
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
