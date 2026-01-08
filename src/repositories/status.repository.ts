/**
 * Status Repository - Data access layer for problem statuses.
 * Contains pure database queries without business logic.
 */

import { and, eq, sql } from "drizzle-orm";
import type { Database } from "@/db";
import { problems, statusHistory, userProblems } from "@/db/schema";
import type { ProblemStatus } from "@/types/domain";

export interface StatusCountRecord {
  status: ProblemStatus;
  count: number;
}

export interface PhaseSolvedRecord {
  phaseId: number;
  count: number;
}

export class StatusRepository {
  constructor(private readonly db: Database) {}

  /**
   * Get status counts for a user.
   */
  async getStatusCountsForUser(userId: string): Promise<StatusCountRecord[]> {
    const results = await this.db
      .select({
        status: userProblems.status,
        count: sql<number>`count(*)`,
      })
      .from(userProblems)
      .where(eq(userProblems.userId, userId))
      .groupBy(userProblems.status);

    return results as StatusCountRecord[];
  }

  /**
   * Get solved count per phase for a user.
   */
  async getSolvedByPhaseForUser(userId: string): Promise<PhaseSolvedRecord[]> {
    return this.db
      .select({
        phaseId: problems.phaseId,
        count: sql<number>`count(*)`,
      })
      .from(userProblems)
      .innerJoin(problems, eq(userProblems.problemId, problems.id))
      .where(and(eq(userProblems.userId, userId), eq(userProblems.status, "solved")))
      .groupBy(problems.phaseId);
  }

  /**
   * Get current status for a user's problem.
   */
  async getUserProblemStatus(
    userId: string,
    problemId: number,
  ): Promise<ProblemStatus | undefined> {
    const result = await this.db
      .select({ status: userProblems.status })
      .from(userProblems)
      .where(and(eq(userProblems.userId, userId), eq(userProblems.problemId, problemId)))
      .get();

    return result?.status as ProblemStatus | undefined;
  }

  /**
   * Atomically update status and log to history.
   * Uses batch to ensure both operations succeed or fail together.
   */
  async updateStatusWithHistory(
    userId: string,
    problemId: number,
    fromStatus: ProblemStatus | null,
    toStatus: ProblemStatus,
    now: Date,
  ): Promise<void> {
    // Check if record exists
    const existing = await this.db
      .select({ id: userProblems.id })
      .from(userProblems)
      .where(and(eq(userProblems.userId, userId), eq(userProblems.problemId, problemId)))
      .get();

    if (existing) {
      // Update existing + insert history in batch
      await this.db.batch([
        this.db
          .update(userProblems)
          .set({ status: toStatus, updatedAt: now })
          .where(and(eq(userProblems.userId, userId), eq(userProblems.problemId, problemId))),
        this.db.insert(statusHistory).values({
          userId,
          problemId,
          fromStatus,
          toStatus,
          changedAt: now,
        }),
      ]);
    } else {
      // Insert new + insert history in batch
      await this.db.batch([
        this.db.insert(userProblems).values({
          userId,
          problemId,
          status: toStatus,
          updatedAt: now,
        }),
        this.db.insert(statusHistory).values({
          userId,
          problemId,
          fromStatus,
          toStatus,
          changedAt: now,
        }),
      ]);
    }
  }

  /**
   * Get all user statuses.
   */
  async getAllUserStatuses(
    userId: string,
  ): Promise<{ problemNumber: number; status: ProblemStatus; updatedAt: Date }[]> {
    const results = await this.db
      .select({
        problemNumber: problems.number,
        status: userProblems.status,
        updatedAt: userProblems.updatedAt,
      })
      .from(userProblems)
      .innerJoin(problems, eq(userProblems.problemId, problems.id))
      .where(eq(userProblems.userId, userId))
      .all();

    return results as { problemNumber: number; status: ProblemStatus; updatedAt: Date }[];
  }
}
