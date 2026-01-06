/**
 * History Repository - Data access layer for status history.
 * Contains pure database queries without business logic.
 */

import { desc, eq } from "drizzle-orm";
import type { Database } from "@/db";
import { problems, statusHistory } from "@/db/schema";
import type { HistoryEntry, Platform, ProblemStatus } from "@/types/domain";

export class HistoryRepository {
  constructor(private db: Database) {}

  /**
   * Get status history for a user with problem details.
   */
  async getHistoryForUser(userId: string, limit = 500): Promise<HistoryEntry[]> {
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
}
