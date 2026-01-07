/**
 * History Service - Business logic for status history.
 */

import type { HistoryRepository } from "@/repositories";
import type { HistoryEntry } from "@/types/domain";

const MAX_HISTORY_ENTRIES = 500;

export class HistoryService {
  constructor(private historyRepo: HistoryRepository) {}

  /**
   * Get status history for a user.
   */
  async getHistory(userId: string, limit = MAX_HISTORY_ENTRIES): Promise<HistoryEntry[]> {
    return this.historyRepo.getHistoryForUser(userId, limit);
  }
}
