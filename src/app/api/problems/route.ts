import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { createDb } from "@/db";
import { problems, userFavorites, userProblems } from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const runtime = "edge";

const varyCookieHeaders = {
  Vary: "Cookie",
} as const;

const publicApiCacheHeaders = {
  ...varyCookieHeaders,
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
} as const;

const privateApiNoStoreHeaders = {
  ...varyCookieHeaders,
  "Cache-Control": "private, no-store",
} as const;

export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });

    const url = new URL(request.url);
    const phaseId = url.searchParams.get("phaseId");

    // Fetch problems from database
    const phaseIdNum = phaseId ? Number.parseInt(phaseId, 10) : null;
    const dbProblems = phaseIdNum
      ? await db.select().from(problems).where(eq(problems.phaseId, phaseIdNum)).all()
      : await db.select().from(problems).all();

    // If user is authenticated, include their statuses and favorites
    if (session?.user?.id) {
      const userId = session.user.id;

      // Get user statuses for these problems
      const statuses = await db
        .select({
          problemId: userProblems.problemId,
          status: userProblems.status,
        })
        .from(userProblems)
        .where(eq(userProblems.userId, userId))
        .all();

      const favorites = await db
        .select({ problemId: userFavorites.problemId })
        .from(userFavorites)
        .where(eq(userFavorites.userId, userId))
        .all();

      const statusMap = new Map(statuses.map((s) => [s.problemId, s.status]));
      const favoriteSet = new Set(favorites.map((f) => f.problemId));

      const problemsWithUserData = dbProblems.map((p) => ({
        ...p,
        userStatus: statusMap.get(p.id) ?? "untouched",
        isFavorite: favoriteSet.has(p.id),
      }));

      return Response.json(
        { problems: problemsWithUserData },
        { headers: privateApiNoStoreHeaders },
      );
    }

    // For guests, return problems without user data
    const problemsWithDefaults = dbProblems.map((p) => ({
      ...p,
      userStatus: "untouched",
      isFavorite: false,
    }));

    return Response.json({ problems: problemsWithDefaults }, { headers: publicApiCacheHeaders });
  } catch (error) {
    console.error("Problems fetch error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: privateApiNoStoreHeaders },
    );
  }
}
