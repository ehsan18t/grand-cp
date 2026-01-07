/**
 * History Repository - Data access layer for status history.
 * Contains pure database queries without business logic.
 */

import { desc, eq, sql } from "drizzle-orm";
import type { Database } from "@/db";
import { problems, statusHistory } from "@/db/schema";
import type { HistoryEntry, Platform, ProblemStatus } from "@/types/domain";

export class HistoryRepository {
  constructor(private db: Database) {}

  /**
   * Get paginated status history for a user with problem details.
   */
  async getHistoryForUser(userId: string, limit = 50, offset = 0): Promise<HistoryEntry[]> {
    const results = await this.db
      .select({
        id: statusHistory.id,
        problemId: statusHistory.problemId,
        fromStatus: statusHistory.fromStatus,
        toStatus: statusHistory.toStatus,
        changedAt: statusHistory.changedAt,
        problemNumber: problems.number,
        problemName: problems.name,
        problemUrl: problems.url,
        platform: problems.platform,
      })
      .from(statusHistory)
      .innerJoin(problems, eq(statusHistory.problemId, problems.id))
      .where(eq(statusHistory.userId, userId))
      .orderBy(desc(statusHistory.changedAt))
      .limit(limit)
      .offset(offset)
      .all();

    return results.map((r) => ({
      id: r.id,
      problemId: r.problemId,
      problemNumber: r.problemNumber,
      problemName: r.problemName,
      problemUrl: r.problemUrl,
      platform: r.platform as Platform,
      fromStatus: r.fromStatus as ProblemStatus | null,
      toStatus: r.toStatus as ProblemStatus,
      changedAt: r.changedAt,
    }));
  }

  /**
   * Get total history count for a user.
   */
  async getHistoryCountForUser(userId: string): Promise<number> {
    const result = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(statusHistory)
      .where(eq(statusHistory.userId, userId))
      .get();

    return result?.count ?? 0;
  }
}
