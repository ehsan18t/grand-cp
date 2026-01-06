import { getCloudflareContext } from "@opennextjs/cloudflare";
import { desc, eq } from "drizzle-orm";
import { Clock } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import type { HistoryEntry } from "@/components/problems/HistoryItem";
import { HistoryList } from "@/components/problems/HistoryList";
import { createDb } from "@/db";
import { problems, statusHistory } from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "History | Grand CP",
  description: "Your problem status change history",
};

export default async function HistoryPage() {
  let history: HistoryEntry[] = [];
  let isAuthenticated = false;

  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (session?.user?.id) {
      isAuthenticated = true;

      // Fetch status history with problem details
      const results = await db
        .select({
          id: statusHistory.id,
          problemId: statusHistory.problemId,
          fromStatus: statusHistory.fromStatus,
          toStatus: statusHistory.toStatus,
          changedAt: statusHistory.changedAt,
          problemNumber: problems.number,
          problemName: problems.name,
          problemUrl: problems.url,
          platform: problems.platform,
        })
        .from(statusHistory)
        .innerJoin(problems, eq(statusHistory.problemId, problems.id))
        .where(eq(statusHistory.userId, session.user.id))
        .orderBy(desc(statusHistory.changedAt))
        .limit(500) // Limit to last 500 entries for performance
        .all();

      history = results.map((r) => ({
        id: r.id,
        problemId: r.problemId,
        problemNumber: r.problemNumber,
        problemName: r.problemName,
        problemUrl: r.problemUrl,
        platform: r.platform,
        fromStatus: r.fromStatus as HistoryEntry["fromStatus"],
        toStatus: r.toStatus as HistoryEntry["toStatus"],
        changedAt: r.changedAt,
      }));
    }
  } catch {
    // Database not available
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-3xl">Status History</h1>
            <p className="text-muted-foreground">Track your progress over time</p>
          </div>
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-semibold text-xl">Sign in to view history</h2>
          <p className="mb-4 text-muted-foreground">
            Create an account to track your problem-solving progress over time.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-muted-foreground text-sm">
            {history.length} status change{history.length !== 1 ? "s" : ""} recorded
          </div>
          <HistoryList entries={history} />
        </>
      )}
    </main>
  );
}
