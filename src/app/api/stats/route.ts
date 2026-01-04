import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq, sql } from "drizzle-orm";
import { createDb } from "@/db";
import { problems, userFavorites, userProblems } from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const runtime = "edge";

const publicApiCacheHeaders = {
  Vary: "Cookie",
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
} as const;

const privateApiNoStoreHeaders = {
  Vary: "Cookie",
  "Cache-Control": "private, no-store",
} as const;

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });

    // Get total problems count
    const totalResult = await db.select({ count: sql<number>`count(*)` }).from(problems).get();
    const totalProblems = totalResult?.count ?? 0;

    // Get problems count per phase
    const phaseCounts = await db
      .select({
        phaseId: problems.phaseId,
        count: sql<number>`count(*)`,
      })
      .from(problems)
      .groupBy(problems.phaseId)
      .all();

    // For guests, return only totals
    if (!session?.user?.id) {
      return Response.json(
        {
          totalProblems,
          phaseCounts,
          userStats: null,
        },
        { headers: publicApiCacheHeaders },
      );
    }

    const userId = session.user.id;

    // Get user status breakdown
    const statusCounts = await db
      .select({
        status: userProblems.status,
        count: sql<number>`count(*)`,
      })
      .from(userProblems)
      .where(eq(userProblems.userId, userId))
      .groupBy(userProblems.status)
      .all();

    const stats = {
      solved: 0,
      attempting: 0,
      revisit: 0,
      skipped: 0,
      untouched: totalProblems,
    };

    let totalTracked = 0;
    for (const row of statusCounts) {
      if (row.status === "solved") {
        stats.solved = row.count;
        totalTracked += row.count;
      } else if (row.status === "attempting") {
        stats.attempting = row.count;
        totalTracked += row.count;
      } else if (row.status === "revisit") {
        stats.revisit = row.count;
        totalTracked += row.count;
      } else if (row.status === "skipped") {
        stats.skipped = row.count;
        totalTracked += row.count;
      }
    }
    stats.untouched = totalProblems - totalTracked;

    // Get user status per phase
    const phaseStats = await db
      .select({
        phaseId: problems.phaseId,
        status: userProblems.status,
        count: sql<number>`count(*)`,
      })
      .from(userProblems)
      .innerJoin(problems, eq(userProblems.problemId, problems.id))
      .where(eq(userProblems.userId, userId))
      .groupBy(problems.phaseId, userProblems.status)
      .all();

    // Get favorites count
    const favoritesResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId))
      .get();
    const favoritesCount = favoritesResult?.count ?? 0;

    return Response.json(
      {
        totalProblems,
        phaseCounts,
        userStats: {
          ...stats,
          favoritesCount,
          phaseStats,
        },
      },
      { headers: privateApiNoStoreHeaders },
    );
  } catch (error) {
    console.error("Stats fetch error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: privateApiNoStoreHeaders },
    );
  }
}
