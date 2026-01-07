import { getApiContext } from "@/lib/request-context";

// Get user's favorites
export async function GET(request: Request) {
  try {
    const { auth, services } = await getApiContext();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const favorites = await services.favoriteService.getFavorites(session.user.id);

    return Response.json({ favorites });
  } catch (error) {
    console.error("Favorites fetch error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Add a problem to favorites
export async function POST(request: Request) {
  try {
    const { auth, services } = await getApiContext();
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user?.id) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { problemId: number };
    const { problemId } = body;

    if (!problemId) {
      return Response.json({ error: "problemId is required" }, { status: 400 });
    }

    const result = await services.favoriteService.addFavorite(session.user.id, problemId);

    return Response.json({ message: "Added to favorites", problemId });
  } catch (error) {
    console.error("Favorite add error:", error);
    if (error instanceof Error && error.message === "Problem not found") {
      return Response.json({ error: "Problem not found" }, { status: 404 });
    }
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Remove a problem from favorites
export async function DELETE(request: Request) {
  try {
    const { auth, services } = await getApiContext();
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
    await services.favoriteService.removeFavorite(session.user.id, problemIdNum);

    return Response.json({ message: "Removed from favorites", problemId: problemIdNum });
  } catch (error) {
    console.error("Favorite remove error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
