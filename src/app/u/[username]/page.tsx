import { getCloudflareContext } from "@opennextjs/cloudflare";
import { Calendar, Trophy, User } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import { ProfileActions } from "@/components/profile";
import { createDb } from "@/db";
import { createAuth } from "@/lib/auth";
import { createServices } from "@/lib/service-factory";
import { getSiteUrlFromEnv } from "@/lib/site";

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { username } = await params;

  return {
    title: `${username}'s Profile | Grand CP`,
    description: `View ${username}'s competitive programming progress on Grand CP`,
  };
}

export default async function ProfilePage({ params }: PageProps) {
  const { username } = await params;

  const { env } = await getCloudflareContext({ async: true });
  const db = createDb(env.DB);
  const auth = createAuth(env.DB, env);

  // Get current session to check if viewer is the profile owner
  const headersList = await headers();
  const session = await auth.api.getSession({ headers: headersList });

  const { userService, phaseService, statsService } = createServices(db);

  // Fetch user from database
  const user = await userService.getUserByUsernameOrId(username);

  if (!user) {
    notFound();
  }

  if (user.username && username !== user.username) {
    redirect(`/u/${user.username}`);
  }

  // Get phase summary and user stats
  const { phases, totalProblems, phaseCountsMap } = await phaseService.getPhaseSummary();
  const userStats = await statsService.getUserStats(user.id, totalProblems);

  const stats = {
    solved: userStats.solved,
    attempting: userStats.attempting,
    revisit: userStats.revisit,
    skipped: userStats.skipped,
  };

  const phaseSolvedMap = userStats.phaseSolvedMap;
  const progressPercentage = userStats.progressPercentage;

  // Check if current user is viewing their own profile
  const isOwner = session?.user?.id === user.id;

  // Build profile URL from environment
  const siteUrl = getSiteUrlFromEnv(env);
  const profileUrl = `${siteUrl}/u/${user.username ?? user.id}`;

  // Determine current phase (first incomplete phase)
  const { currentPhase, targetRating } = phaseService.determineCurrentPhase(
    phases,
    phaseCountsMap,
    phaseSolvedMap,
  );

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
                sizes="80px"
                className="h-20 w-20 rounded-full object-cover"
              />
            ) : (
              <User className="h-10 w-10 text-primary" />
            )}
          </div>

          {/* Info */}
          <div className="flex-1">
            <h1 className="font-bold text-2xl">{user.name}</h1>
            <p className="text-muted-foreground">@{user.username ?? user.id}</p>
            <div className="mt-2 flex items-center gap-4 text-muted-foreground text-sm">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>
                  Joined{" "}
                  {user.createdAt.toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Profile Actions (Edit Username + Share) */}
          <ProfileActions
            isOwner={isOwner}
            username={user.username ?? user.id}
            profileUrl={profileUrl}
          />
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
            <div className="font-bold font-mono text-2xl">Phase {currentPhase}</div>
          </div>

          <div className="rounded-lg border border-border bg-card p-4">
            <div className="mb-1 text-muted-foreground text-sm">Target Rating</div>
            <div className="font-bold font-mono text-2xl">{targetRating}</div>
          </div>
        </div>
      </section>

      {/* Phase Progress */}
      <section className="mb-8">
        <h2 className="mb-4 font-semibold text-xl">Phase Progress</h2>

        <div className="grid gap-4 sm:grid-cols-2">
          {phases.map((phase) => {
            const phaseTotal = phaseCountsMap.get(phase.id) ?? 0;
            const phaseSolved = phaseSolvedMap.get(phase.id) ?? 0;
            const phaseProgress = phaseTotal > 0 ? Math.round((phaseSolved / phaseTotal) * 100) : 0;

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
                  {phaseSolved}/{phaseTotal} solved
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
