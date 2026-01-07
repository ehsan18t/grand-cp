import { ApiResponse, withAuth } from "@/lib/api-utils";
import { Errors } from "@/lib/errors";

// Update username
export const PATCH = withAuth(async (request, { services, userId }) => {
  const body = await request.json();
  const { username } = body as { username?: string };

  if (!username || typeof username !== "string" || username.trim().length === 0) {
    throw Errors.badRequest("Username is required");
  }

  const result = await services.userService.updateUsername(userId, username);
  return ApiResponse.ok({ success: true, username: result.username });
});

// Note: GET handler removed - all initial data is fetched via /api/init
