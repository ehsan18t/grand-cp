import { ApiResponse, CACHE_HEADERS, withOptionalAuth } from "@/lib/api-utils";

export const GET = withOptionalAuth(async (_request, { services, userId }) => {
  // Get phase summary
  const { totalProblems, phaseCountsMap } = await services.phaseService.getPhaseSummary();

  // Convert map to array for JSON response
  const phaseCounts = Array.from(phaseCountsMap.entries()).map(([phaseId, count]) => ({
    phaseId,
    count,
  }));

  // For guests, return only totals
  if (!userId) {
    return ApiResponse.ok(
      { totalProblems, phaseCounts, userStats: null },
      CACHE_HEADERS.publicLong,
    );
  }

  // Get user stats from service
  const userStats = await services.statsService.getUserStats(userId, totalProblems);

  // Get favorites count
  const favoritesCount = await services.statsService.getFavoritesCount(userId);

  // Get solved by phase
  const phaseSolvedMap = await services.statsService.getSolvedByPhase(userId);
  const phaseStats = Array.from(phaseSolvedMap.entries()).map(([phaseId, solvedCount]) => ({
    phaseId,
    status: "solved" as const,
    count: solvedCount,
  }));

  return ApiResponse.ok(
    {
      totalProblems,
      phaseCounts,
      userStats: {
        solved: userStats.solved,
        attempting: userStats.attempting,
        revisit: userStats.revisit,
        skipped: userStats.skipped,
        untouched: userStats.untouched,
        favoritesCount,
        phaseStats,
      },
    },
    CACHE_HEADERS.private,
  );
});
