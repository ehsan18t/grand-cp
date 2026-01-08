import { ApiResponse, CACHE_HEADERS, withAuth } from "@/lib/api-utils";
import { withRateLimit } from "@/lib/rate-limit";
import { statusUpdateSchema, validateBody } from "@/lib/validation";

export const POST = withRateLimit(
  "write",
  withAuth(async (request, { services, userId }) => {
    const { problemNumber, status } = await validateBody(request, statusUpdateSchema);

    const result = await services.statusService.updateStatus(userId, problemNumber, status);

    return ApiResponse.ok(
      {
        message: "Status updated",
        problemNumber: result.problemNumber,
        status: result.status,
        previousStatus: result.previousStatus,
      },
      CACHE_HEADERS.private,
    );
  }),
);

// Note: GET handler removed - all initial data is fetched via /api/init
