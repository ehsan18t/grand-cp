import { ApiResponse, CACHE_HEADERS, withOptionalAuth } from "@/lib/api-utils";

export const GET = withOptionalAuth(async (request, { services, userId }) => {
  const url = new URL(request.url);
  const phaseId = url.searchParams.get("phaseId");

  // Fetch problems from service
  const phaseIdNum = phaseId ? Number.parseInt(phaseId, 10) : null;
  const problems = phaseIdNum
    ? await services.problemService.getProblemsByPhaseId(phaseIdNum)
    : await services.problemService.getAllProblems();

  // Enrich with user data
  const problemsWithUserData = await services.problemService.getProblemsWithUserData(
    problems,
    userId,
  );

  const cacheHeaders = userId ? CACHE_HEADERS.private : CACHE_HEADERS.publicLong;

  return ApiResponse.ok({ problems: problemsWithUserData }, cacheHeaders);
});
