/**
 * Favorite Repository - Data access layer for user favorites.
 * Contains pure database queries without business logic.
 */

import { and, eq, inArray, sql } from "drizzle-orm";
import type { Database } from "@/db";
import { problems, userFavorites, userProblems } from "@/db/schema";
import type { FavoriteProblem, Platform, ProblemStatus } from "@/types/domain";

export class FavoriteRepository {
  constructor(private db: Database) {}

  /**
   * Get favorites count for a user.
   */
  async getCountForUser(userId: string): Promise<number> {
    const [result] = await this.db
      .select({ count: sql<number>`count(*)` })
      .from(userFavorites)
      .where(eq(userFavorites.userId, userId));

    return result?.count ?? 0;
  }

  /**
   * Get all favorites for a user with problem details.
   */
  async getFavoritesWithDetails(userId: string): Promise<FavoriteProblem[]> {
    const results = await this.db
      .select({
        id: problems.id,
        number: problems.number,
        platform: problems.platform,
        name: problems.name,
        url: problems.url,
        phaseId: problems.phaseId,
        topic: problems.topic,
        isStarred: problems.isStarred,
        note: problems.note,
        favoritedAt: userFavorites.createdAt,
      })
      .from(userFavorites)
      .innerJoin(problems, eq(userFavorites.problemId, problems.id))
      .where(eq(userFavorites.userId, userId))
      .orderBy(userFavorites.createdAt)
      .all();

    // Get statuses for these problems
    const problemIds = results.map((r) => r.id);
    const statusRecords =
      problemIds.length > 0
        ? await this.db
            .select({
              problemId: userProblems.problemId,
              status: userProblems.status,
            })
            .from(userProblems)
            .where(
              and(eq(userProblems.userId, userId), inArray(userProblems.problemId, problemIds)),
            )
        : [];

    const statusMap = new Map(statusRecords.map((r) => [r.problemId, r.status as ProblemStatus]));

    return results.map((r) => ({
      id: r.id,
      number: r.number,
      platform: r.platform as Platform,
      name: r.name,
      url: r.url,
      phaseId: r.phaseId,
      topic: r.topic,
      isStarred: r.isStarred,
      note: r.note,
      favoritedAt: r.favoritedAt,
      userStatus: statusMap.get(r.id) ?? ("untouched" as const),
      isFavorite: true,
    }));
  }

  /**
   * Check if a problem is favorited by a user.
   */
  async isFavorited(userId: string, problemId: number): Promise<boolean> {
    const result = await this.db
      .select()
      .from(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.problemId, problemId)))
      .get();

    return !!result;
  }

  /**
   * Add a problem to favorites.
   */
  async add(userId: string, problemId: number): Promise<void> {
    await this.db.insert(userFavorites).values({
      userId,
      problemId,
      createdAt: new Date(),
    });
  }

  /**
   * Remove a problem from favorites.
   */
  async remove(userId: string, problemId: number): Promise<void> {
    await this.db
      .delete(userFavorites)
      .where(and(eq(userFavorites.userId, userId), eq(userFavorites.problemId, problemId)));
  }
}
