import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq } from "drizzle-orm";
import { createDb } from "@/db";
import { problems, userFavorites } from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const runtime = "edge";

// Get user's favorites
export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await db
      .select({
        id: problems.id,
        number: problems.number,
        platform: problems.platform,
        name: problems.name,
        url: problems.url,
        phaseId: problems.phaseId,
        topic: problems.topic,
        isStarred: problems.isStarred,
        note: problems.note,
        favoritedAt: userFavorites.createdAt,
      })
      .from(userFavorites)
      .innerJoin(problems, eq(userFavorites.problemId, problems.id))
      .where(eq(userFavorites.userId, session.user.id))
      .orderBy(userFavorites.createdAt)
      .all();

    return Response.json({ favorites });
  } catch (error) {
    console.error("Favorites fetch error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add a problem to favorites
export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { problemId: number };
    const { problemId } = body;

    if (!problemId) {
      return Response.json({ error: "problemId is required" }, { status: 400 });
    }

    // Check if problem exists
    const problem = await db.select().from(problems).where(eq(problems.id, problemId)).get();

    if (!problem) {
      return Response.json({ error: "Problem not found" }, { status: 404 });
    }

    // Check if already favorited
    const existing = await db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, session.user.id), eq(userFavorites.problemId, problemId)))
      .get();

    if (existing) {
      return Response.json({ message: "Already favorited", problemId });
    }

    // Add to favorites
    await db.insert(userFavorites).values({
      userId: session.user.id,
      problemId,
      createdAt: new Date(),
    });

    return Response.json({ message: "Added to favorites", problemId });
  } catch (error) {
    console.error("Favorite add error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Remove a problem from favorites
export async function DELETE(request: Request) {
  try {
    const { env } = await getCloudflareContext();
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = new URL(request.url);
    const problemId = url.searchParams.get("problemId");

    if (!problemId) {
      return Response.json({ error: "problemId is required" }, { status: 400 });
    }

    const problemIdNum = Number.parseInt(problemId, 10);

    await db
      .delete(userFavorites)
      .where(
        and(eq(userFavorites.userId, session.user.id), eq(userFavorites.problemId, problemIdNum)),
      );

    return Response.json({ message: "Removed from favorites", problemId: problemIdNum });
  } catch (error) {
    console.error("Favorite remove error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
