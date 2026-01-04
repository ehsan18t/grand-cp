import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, inArray } from "drizzle-orm";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PhaseProblems } from "@/components/problems";
import { createDb } from "@/db";
import {
  phases as dbPhases,
  problems as dbProblems,
  userFavorites,
  userProblems,
} from "@/db/schema";
import { createAuth } from "@/lib/auth";

interface PageProps {
  params: Promise<{ phaseId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { phaseId } = await params;
  const phaseIdNum = Number.parseInt(phaseId, 10);

  try {
    const { env } = await getCloudflareContext();
    const db = createDb(env.DB);
    const [phase] = await db.select().from(dbPhases).where(eq(dbPhases.id, phaseIdNum)).limit(1);

    if (!phase) return { title: "Phase Not Found" };

    return {
      title: `Phase ${phase.id}: ${phase.name} | Grand CP`,
      description: phase.description,
    };
  } catch {
    return { title: "Phase Not Found" };
  }
}

export default async function PhasePage({ params }: PageProps) {
  const { phaseId } = await params;
  const phaseIdNum = Number.parseInt(phaseId, 10);

  const { env } = await getCloudflareContext();
  const db = createDb(env.DB);
  const auth = createAuth(env.DB, env);
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });

  // Fetch phase from database
  const [phase] = await db.select().from(dbPhases).where(eq(dbPhases.id, phaseIdNum)).limit(1);

  if (!phase) {
    notFound();
  }

  // Fetch all phases for navigation
  const allPhases = await db.select().from(dbPhases).orderBy(dbPhases.id);

  // Fetch problems for this phase from database
  const problemsFromDb = await db
    .select()
    .from(dbProblems)
    .where(eq(dbProblems.phaseId, phaseIdNum))
    .orderBy(dbProblems.number);

  // Map to ProblemData format with user status and favorites
  type ProblemWithUserData = {
    id: number;
    number: number;
    platform: "leetcode" | "codeforces" | "cses" | "atcoder" | "other";
    name: string;
    url: string;
    phaseId: number;
    topic: string;
    isStarred: boolean;
    note: string | null;
    userStatus: "untouched" | "attempting" | "solved" | "revisit" | "skipped";
    isFavorite: boolean;
  };

  let phaseProblems: ProblemWithUserData[] = problemsFromDb.map((p) => ({
    id: p.id,
    number: p.number,
    platform: p.platform,
    name: p.name,
    url: p.url,
    phaseId: p.phaseId,
    topic: p.topic,
    isStarred: p.isStarred,
    note: p.note,
    userStatus: "untouched" as const,
    isFavorite: false,
  }));

  // Fetch user stats from database
  const stats = { solved: 0, attempting: 0, skipped: 0 };

  if (session?.user?.id && problemsFromDb.length > 0) {
    const problemIds = problemsFromDb.map((p) => p.id);

    // Get user statuses for these problems
    const [userStatusRecords, userFavoriteRecords] = await Promise.all([
      db
        .select({
          problemId: userProblems.problemId,
          status: userProblems.status,
        })
        .from(userProblems)
        .where(
          and(
            eq(userProblems.userId, session.user.id),
            inArray(userProblems.problemId, problemIds),
          ),
        ),
      db
        .select({ problemId: userFavorites.problemId })
        .from(userFavorites)
        .where(
          and(
            eq(userFavorites.userId, session.user.id),
            inArray(userFavorites.problemId, problemIds),
          ),
        ),
    ]);

    // Create lookup maps
    const statusMap = new Map(userStatusRecords.map((r) => [r.problemId, r.status]));
    const favoriteSet = new Set(userFavoriteRecords.map((r) => r.problemId));

    // Merge user data into problems (p.id is already the DB ID)
    phaseProblems = phaseProblems.map((p) => ({
      ...p,
      userStatus: statusMap.get(p.id) || "untouched",
      isFavorite: favoriteSet.has(p.id),
    }));

    // Calculate stats from status records
    for (const record of userStatusRecords) {
      if (record.status === "solved") stats.solved++;
      else if (record.status === "attempting") stats.attempting++;
      else if (record.status === "skipped") stats.skipped++;
    }
  }

  const prevPhase = allPhases.find((p) => p.id === phaseIdNum - 1);
  const nextPhase = allPhases.find((p) => p.id === phaseIdNum + 1);

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

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 font-mono text-primary text-sm">Phase {phase.id}</div>
            <h1 className="mb-2 font-bold text-3xl">{phase.name}</h1>
            <p className="max-w-2xl text-muted-foreground">{phase.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-muted-foreground text-sm">Target Rating</div>
              <div className="font-mono font-semibold text-lg">
                {phase.targetRatingStart} → {phase.targetRatingEnd}
              </div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground text-sm">Problems</div>
              <div className="font-mono font-semibold text-lg">
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
      <PhaseProblems problems={phaseProblems} />

      {/* Navigation */}
      <nav className="mt-12 flex items-center justify-between border-border border-t pt-8">
        {prevPhase ? (
          <Link
            href={`/problems/phase/${prevPhase.id}`}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-5 w-5" />
            <div>
              <div className="text-sm">Previous Phase</div>
              <div className="font-medium text-foreground">{prevPhase.name}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextPhase ? (
          <Link
            href={`/problems/phase/${nextPhase.id}`}
            className="flex items-center gap-2 text-right text-muted-foreground transition-colors hover:text-primary"
          >
            <div>
              <div className="text-sm">Next Phase</div>
              <div className="font-medium text-foreground">{nextPhase.name}</div>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </main>
  );
}
