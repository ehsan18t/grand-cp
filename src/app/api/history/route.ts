/**
 * History API Route - Paginated history fetching.
 */

import { ApiResponse, CACHE_HEADERS, withAuth } from "@/lib/api-utils";
import { HISTORY_MAX_ENTRIES, HISTORY_PAGE_SIZE } from "@/services/history.service";

export const GET = withAuth(async (request, { services, userId }) => {
  const url = new URL(request.url);
  const pageParam = url.searchParams.get("page");
  const page = pageParam ? Math.max(1, Number.parseInt(pageParam, 10) || 1) : 1;

  // Calculate offset (max 200 entries = 4 pages of 50)
  const maxPage = Math.ceil(HISTORY_MAX_ENTRIES / HISTORY_PAGE_SIZE);
  const safePage = Math.min(page, maxPage);
  const offset = (safePage - 1) * HISTORY_PAGE_SIZE;

  const [entries, totalCount] = await Promise.all([
    services.historyService.getHistory(userId, HISTORY_PAGE_SIZE, offset),
    services.historyService.getHistoryCount(userId),
  ]);

  // Serialize dates
  const serializedEntries = entries.map((e) => ({
    ...e,
    changedAt: e.changedAt.toISOString(),
  }));

  return ApiResponse.ok(
    {
      entries: serializedEntries,
      page: safePage,
      pageSize: HISTORY_PAGE_SIZE,
      totalCount,
      totalPages: Math.min(Math.ceil(totalCount / HISTORY_PAGE_SIZE), maxPage),
      hasMore: safePage < maxPage && offset + entries.length < totalCount,
    },
    CACHE_HEADERS.private,
  );
});
