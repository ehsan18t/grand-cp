import { getApiContext } from "@/lib/request-context";

const publicApiCacheHeaders = {
  Vary: "Cookie",
  "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
} as const;

const privateApiNoStoreHeaders = {
  Vary: "Cookie",
  "Cache-Control": "private, no-store",
} as const;

export async function GET(request: Request) {
  try {
    const { auth, services } = await getApiContext();
    const session = await auth.api.getSession({ headers: request.headers });

    // Get phase summary
    const { totalProblems, phaseCountsMap } = await services.phaseService.getPhaseSummary();

    // Convert map to array for JSON response
    const phaseCounts = Array.from(phaseCountsMap.entries()).map(([phaseId, count]) => ({
      phaseId,
      count,
    }));

    // For guests, return only totals
    if (!session?.user?.id) {
      return Response.json(
        {
          totalProblems,
          phaseCounts,
          userStats: null,
        },
        { headers: publicApiCacheHeaders },
      );
    }

    const userId = session.user.id;

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

    return Response.json(
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
      { headers: privateApiNoStoreHeaders },
    );
  } catch (error) {
    console.error("Stats fetch error:", error);
    return Response.json(
      { error: "Internal server error" },
      { status: 500, headers: privateApiNoStoreHeaders },
    );
  }
}
