import { getCloudflareContext } from "@opennextjs/cloudflare";
import { createDb } from "@/db";
import { createAuth } from "@/lib/auth";
import { createServices } from "@/lib/service-factory";

// Get user's favorites
export async function GET(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { favoriteService } = createServices(db);
    const favorites = await favoriteService.getFavorites(session.user.id);

    return Response.json({ favorites });
  } catch (error) {
    console.error("Favorites fetch error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add a problem to favorites
export async function POST(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
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

    const { favoriteService } = createServices(db);
    const result = await favoriteService.addFavorite(session.user.id, problemId);

    if ("error" in result) {
      return Response.json({ error: result.error }, { status: result.code });
    }

    return Response.json({ message: "Added to favorites", problemId });
  } catch (error) {
    console.error("Favorite add error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Remove a problem from favorites
export async function DELETE(request: Request) {
  try {
    const { env } = await getCloudflareContext({ async: true });
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
    const { favoriteService } = createServices(db);
    await favoriteService.removeFavorite(session.user.id, problemIdNum);

    return Response.json({ message: "Removed from favorites", problemId: problemIdNum });
  } catch (error) {
    console.error("Favorite remove error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
