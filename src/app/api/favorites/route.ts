import { ApiResponse, validatePositiveInt, withAuth } from "@/lib/api-utils";
import { Errors } from "@/lib/errors";

// Get user's favorites
export const GET = withAuth(async (_request, { services, userId }) => {
  const favorites = await services.favoriteService.getFavorites(userId);
  return ApiResponse.ok({ favorites });
});

// Add a problem to favorites
export const POST = withAuth(async (request, { services, userId }) => {
  const body = (await request.json()) as { problemId?: unknown };
  const problemId = validatePositiveInt(body.problemId, "problemId");

  await services.favoriteService.addFavorite(userId, problemId);
  return ApiResponse.ok({ message: "Added to favorites", problemId });
});

// Remove a problem from favorites
export const DELETE = withAuth(async (request, { services, userId }) => {
  const url = new URL(request.url);
  const problemIdStr = url.searchParams.get("problemId");

  if (!problemIdStr) {
    throw Errors.badRequest("problemId is required");
  }

  const problemId = Number.parseInt(problemIdStr, 10);
  if (!Number.isInteger(problemId) || problemId <= 0) {
    throw Errors.badRequest("Invalid problemId");
  }

  await services.favoriteService.removeFavorite(userId, problemId);
  return ApiResponse.ok({ message: "Removed from favorites", problemId });
});
