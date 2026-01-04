import { Calendar, Share2, Trophy, User } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { phases } from "@/data/phases";
import { problems } from "@/data/problems";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  // In production, fetch user from database
  return {
    title: `${username}'s Profile | Grand CP`,
    description: `View ${username}'s competitive programming progress on Grand CP`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;

  // TODO: Fetch user and their stats from database
  // For now, show a placeholder profile

  const user = {
    name: username,
    username,
    image: null as string | null,
    joinedAt: new Date(),
  };

  // Placeholder stats
  const stats = {
    solved: 0,
    attempting: 0,
    revisit: 0,
    skipped: 0,
  };

  const totalProblems = problems.length;
  const progressPercentage =
    totalProblems > 0 ? Math.round((stats.solved / totalProblems) * 100) : 0;

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <header className="mb-8 rounded-lg border border-border bg-card p-6">
        <div className="flex flex-wrap items-start gap-6">
          {/* Avatar */}
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name}
                width={80}
                height={80}
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-primary" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-bold text-2xl">{user.name}</h1>
            <p className="text-muted-foreground">@{user.username}</p>
            <div className="mt-2 flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{" "}
                  {user.joinedAt.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Share Button */}
          <button
            type="button"
            className="flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm transition-colors hover:bg-accent"
          >
            <Share2 className="h-4 w-4" />
            Share Profile
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="mb-8">
        <h2 className="mb-4 font-semibold text-xl">Overview</h2>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 flex items-center gap-2 text-muted-foreground">
              <Trophy className="h-4 w-4" />
              <span className="text-sm">Problems Solved</span>
            </div>
            <div className="font-bold font-mono text-2xl text-status-solved">{stats.solved}</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 text-muted-foreground text-sm">Completion Rate</div>
            <div className="font-bold font-mono text-2xl text-primary">{progressPercentage}%</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 text-muted-foreground text-sm">Current Phase</div>
            <div className="font-bold font-mono text-2xl">Phase 0</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 text-muted-foreground text-sm">Target Rating</div>
            <div className="font-bold font-mono text-2xl">1000+</div>
          </div>
        </div>
      </section>

      {/* Phase Progress */}
      <section className="mb-8">
        <h2 className="mb-4 font-semibold text-xl">Phase Progress</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {phases.map((phase) => {
            const phaseProblems = problems.filter((p) => p.phaseId === phase.id);
            const phaseSolved = 0; // Would come from DB
            const phaseProgress =
              phaseProblems.length > 0 ? Math.round((phaseSolved / phaseProblems.length) * 100) : 0;

            return (
              <div key={phase.id} className="rounded-lg border border-border bg-card p-4">
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <span className="font-mono text-muted-foreground text-xs">
                      Phase {phase.id}
                    </span>
                    <h3 className="font-medium text-sm">{phase.name}</h3>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-semibold">{phaseProgress}%</span>
                  </div>
                </div>
                <div className="mb-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full bg-status-solved transition-all"
                    style={{ width: `${phaseProgress}%` }}
                  />
                </div>
                <div className="text-muted-foreground text-xs">
                  {phaseSolved}/{phaseProblems.length} solved
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Status Breakdown */}
      <section>
        <h2 className="mb-4 font-semibold text-xl">Status Breakdown</h2>

        <div className="rounded-lg border border-border bg-card p-6">
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-status-solved" />
              <div className="font-bold font-mono text-lg">{stats.solved}</div>
              <div className="text-muted-foreground text-xs">Solved</div>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-status-attempting" />
              <div className="font-bold font-mono text-lg">{stats.attempting}</div>
              <div className="text-muted-foreground text-xs">Attempting</div>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-status-revisit" />
              <div className="font-bold font-mono text-lg">{stats.revisit}</div>
              <div className="text-muted-foreground text-xs">Revisit</div>
            </div>
            <div className="text-center">
              <div className="mx-auto mb-1 h-2 w-2 rounded-full bg-status-skipped" />
              <div className="font-bold font-mono text-lg">{stats.skipped}</div>
              <div className="text-muted-foreground text-xs">Skipped</div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
