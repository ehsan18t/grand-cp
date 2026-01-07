/**
 * Init API Route - Returns all data needed to initialize the app store.
 *
 * For guests: phases, problems, counts
 * For authenticated users: + statuses, favorites, history, stats
 */

import { ApiResponse, CACHE_HEADERS, withOptionalAuth } from "@/lib/api-utils";

export const GET = withOptionalAuth(async (_request, { services, userId, session }) => {
  const {
    phaseService,
    problemService,
    statusService,
    favoriteService,
    historyService,
    statsService,
  } = services;

  // Fetch core data (always needed)
  const [{ phases, totalProblems, phaseCountsMap }, problems] = await Promise.all([
    phaseService.getPhaseSummary(),
    problemService.getAllProblems(),
  ]);

  // Build problemNumber → problemId map for efficient status mapping
  const problemNumberToId = new Map<number, number>();
  for (const p of problems) {
    problemNumberToId.set(p.number, p.id);
  }

  // Convert Map to Record for JSON serialization
  const phaseCountsRecord: Record<number, number> = {};
  for (const [k, v] of phaseCountsMap) {
    phaseCountsRecord[k] = v;
  }

  // Base response for guests
  const baseResponse = {
    phases,
    problems,
    phaseCountsMap: phaseCountsRecord,
    totalProblems,
    isAuthenticated: false as boolean,
  };

  // If not authenticated, return base response with truly cacheable headers
  if (!userId) {
    return ApiResponse.ok(baseResponse, CACHE_HEADERS.publicGuest);
  }

  // Fetch user-specific data
  const [allStatuses, favorites, history, userStats] = await Promise.all([
    statusService.getAllStatuses(userId),
    favoriteService.getFavorites(userId),
    historyService.getHistory(userId),
    statsService.getUserStats(userId, totalProblems),
  ]);

  // Build statuses array with problemId for mapping (O(1) lookup)
  const statusesWithIds = allStatuses
    .map((s) => {
      const problemId = problemNumberToId.get(s.problemNumber);
      // Skip statuses for problems that don't exist
      if (problemId === undefined) return null;
      return {
        problemNumber: s.problemNumber,
        problemId,
        status: s.status,
      };
    })
    .filter((s): s is NonNullable<typeof s> => s !== null);

  // Build favorites array with favoritedAt
  const favoritesWithDates = favorites.map((f) => ({
    problemId: f.id,
    favoritedAt: f.favoritedAt.toISOString(),
  }));

  // Convert phaseSolvedMap to Record
  const phaseSolvedRecord: Record<number, number> = {};
  for (const [k, v] of userStats.phaseSolvedMap) {
    phaseSolvedRecord[k] = v;
  }

  // Build user object from session (already available from withOptionalAuth)
  const user = session?.user
    ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image ?? null,
        username: (session.user as { username?: string }).username ?? null,
      }
    : undefined;

  return ApiResponse.ok(
    {
      ...baseResponse,
      isAuthenticated: true,
      user,
      statuses: statusesWithIds,
      favorites: favoritesWithDates,
      history,
      statusCounts: {
        solved: userStats.solved,
        attempting: userStats.attempting,
        revisit: userStats.revisit,
        skipped: userStats.skipped,
        untouched: userStats.untouched,
      },
      phaseSolvedMap: phaseSolvedRecord,
    },
    CACHE_HEADERS.private,
  );
});
