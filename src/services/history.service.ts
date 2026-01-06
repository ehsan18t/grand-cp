/**
 * History Service - Business logic for status history.
 */

import type { HistoryRepository } from "@/repositories";
import type { HistoryEntry } from "@/types/domain";

export class HistoryService {
  constructor(private historyRepo: HistoryRepository) {}

  /**
   * Get status history for a user.
   */
  async getHistory(userId: string, limit = 500): Promise<HistoryEntry[]> {
    return this.historyRepo.getHistoryForUser(userId, limit);
  }
}
