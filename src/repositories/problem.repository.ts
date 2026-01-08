/**
 * Problem Repository - Data access layer for problems.
 * Contains pure database queries without business logic.
 */

import { and, eq, inArray } from "drizzle-orm";
import type { Database } from "@/db";
import { problems, userFavorites, userProblems } from "@/db/schema";
import type { Platform, Problem, ProblemStatus } from "@/types/domain";

export interface UserProblemRecord {
  problemId: number;
  status: ProblemStatus;
}

export interface UserFavoriteRecord {
  problemId: number;
}

export class ProblemRepository {
  constructor(private readonly db: Database) {}

  /**
   * Get all problems.
   */
  async findAll(): Promise<Problem[]> {
    const results = await this.db.select().from(problems).all();
    return results.map(this.mapToProblem);
  }

  /**
   * Get problems by phase ID.
   */
  async findByPhaseId(phaseId: number): Promise<Problem[]> {
    const results = await this.db
      .select()
      .from(problems)
      .where(eq(problems.phaseId, phaseId))
      .orderBy(problems.number);
    return results.map(this.mapToProblem);
  }

  /**
   * Get a problem by its number.
   */
  async findByNumber(number: number): Promise<Problem | null> {
    const result = await this.db.select().from(problems).where(eq(problems.number, number)).get();
    return result ? this.mapToProblem(result) : null;
  }

  /**
   * Get a problem by ID.
   */
  async findById(id: number): Promise<Problem | null> {
    const result = await this.db.select().from(problems).where(eq(problems.id, id)).get();
    return result ? this.mapToProblem(result) : null;
  }

  /**
   * Get user statuses for a list of problem IDs.
   */
  async getUserStatusesForProblems(
    userId: string,
    problemIds: number[],
  ): Promise<UserProblemRecord[]> {
    if (problemIds.length === 0) return [];

    const results = await this.db
      .select({
        problemId: userProblems.problemId,
        status: userProblems.status,
      })
      .from(userProblems)
      .where(and(eq(userProblems.userId, userId), inArray(userProblems.problemId, problemIds)));

    return results as UserProblemRecord[];
  }

  /**
   * Get user favorites for a list of problem IDs.
   */
  async getUserFavoritesForProblems(
    userId: string,
    problemIds: number[],
  ): Promise<UserFavoriteRecord[]> {
    if (problemIds.length === 0) return [];

    return this.db
      .select({ problemId: userFavorites.problemId })
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), inArray(userFavorites.problemId, problemIds)));
  }

  private mapToProblem(row: typeof problems.$inferSelect): Problem {
    return {
      id: row.id,
      number: row.number,
      platform: row.platform as Platform,
      name: row.name,
      url: row.url,
      phaseId: row.phaseId,
      topic: row.topic,
      isStarred: row.isStarred,
      note: row.note,
    };
  }
}
