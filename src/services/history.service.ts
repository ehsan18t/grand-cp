/**
 * History Service - Business logic for status history.
 */

import type { HistoryRepository } from "@/repositories";
import type { HistoryEntry } from "@/types/domain";

/** Max entries fetched per page */
export const HISTORY_PAGE_SIZE = 50;
/** Max entries to fetch for history page */
export const HISTORY_MAX_ENTRIES = 200;

export class HistoryService {
  constructor(private readonly historyRepo: HistoryRepository) {}

  /**
   * Get paginated status history for a user.
   */
  async getHistory(userId: string, limit = HISTORY_PAGE_SIZE, offset = 0): Promise<HistoryEntry[]> {
    return this.historyRepo.getHistoryForUser(userId, limit, offset);
  }

  /**
   * Get total history count for a user.
   */
  async getHistoryCount(userId: string): Promise<number> {
    return this.historyRepo.getHistoryCountForUser(userId);
  }
}
