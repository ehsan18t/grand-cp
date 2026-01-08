import { ApiResponse, withAuth } from "@/lib/api-utils";
import { withRateLimit } from "@/lib/rate-limit";
import {
  addFavoriteSchema,
  removeFavoriteQuerySchema,
  validateBody,
  validateQuery,
} from "@/lib/validation";

// Note: GET handler removed - all initial data is fetched via /api/init

// Add a problem to favorites
export const POST = withRateLimit(
  "write",
  withAuth(async (request, { services, userId }) => {
    const { problemId } = await validateBody(request, addFavoriteSchema);

    await services.favoriteService.addFavorite(userId, problemId);
    return ApiResponse.ok({ message: "Added to favorites", problemId });
  }),
);

// Remove a problem from favorites
export const DELETE = withRateLimit(
  "write",
  withAuth(async (request, { services, userId }) => {
    const { problemId } = validateQuery(request, removeFavoriteQuerySchema);

    await services.favoriteService.removeFavorite(userId, problemId);
    return ApiResponse.ok({ message: "Removed from favorites", problemId });
  }),
);
