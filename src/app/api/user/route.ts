import { ApiResponse, withAuth } from "@/lib/api-utils";
import { withRateLimit } from "@/lib/rate-limit";
import { updateUsernameSchema, validateBody } from "@/lib/validation";

// Update username
export const PATCH = withRateLimit(
  "strict",
  withAuth(async (request, { services, userId }) => {
    const { username } = await validateBody(request, updateUsernameSchema);

    const result = await services.userService.updateUsername(userId, username);
    return ApiResponse.ok({ success: true, username: result.username });
  }),
);

// Note: GET handler removed - all initial data is fetched via /api/init
