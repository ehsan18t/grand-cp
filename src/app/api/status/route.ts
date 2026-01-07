import { ApiResponse, CACHE_HEADERS, withAuth, withOptionalAuth } from "@/lib/api-utils";
import { Errors } from "@/lib/errors";
import { type ProblemStatus, VALID_STATUSES } from "@/types/domain";

interface StatusUpdateBody {
  problemNumber: number;
  status: ProblemStatus;
}

function isValidStatusUpdateBody(body: unknown): body is StatusUpdateBody {
  if (typeof body !== "object" || body === null) return false;
  const { problemNumber, status } = body as Record<string, unknown>;
  return (
    typeof problemNumber === "number" &&
    typeof status === "string" &&
    VALID_STATUSES.includes(status as ProblemStatus)
  );
}

export const POST = withAuth(async (request, { services, userId }) => {
  const body = await request.json();

  if (!isValidStatusUpdateBody(body)) {
    throw Errors.badRequest("Invalid body");
  }

  const { problemNumber, status } = body;

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
});

export const GET = withOptionalAuth(async (_request, { services, userId }) => {
  if (userId) {
    const statuses = await services.statusService.getAllStatuses(userId);
    return ApiResponse.ok({ statuses }, CACHE_HEADERS.private);
  }

  // For guests, return empty (they can only view, not track)
  return ApiResponse.ok({ statuses: [] }, CACHE_HEADERS.publicShort);
});
