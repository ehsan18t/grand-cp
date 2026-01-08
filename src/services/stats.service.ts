/**
 * Stats Service - Business logic for user statistics.
 */

import type { FavoriteRepository, StatusRepository } from "@/repositories";
import type { StatusCounts, UserStats } from "@/types/domain";

export class StatsService {
  constructor(
    private readonly statusRepo: StatusRepository,
    private readonly favoriteRepo: FavoriteRepository,
  ) {}

  /**
   * Get full user stats.
   */
  async getUserStats(userId: string, totalProblems: number): Promise<UserStats> {
    const [statusCounts, solvedByPhase, favoritesCount] = await Promise.all([
      this.statusRepo.getStatusCountsForUser(userId),
      this.statusRepo.getSolvedByPhaseForUser(userId),
      this.favoriteRepo.getCountForUser(userId),
    ]);

    const stats = this.calculateStatusCounts(statusCounts, totalProblems);
    const phaseSolvedMap = new Map(solvedByPhase.map((p) => [p.phaseId, p.count]));
    const progressPercentage =
      totalProblems > 0 ? Math.round((stats.solved / totalProblems) * 100) : 0;

    return {
      ...stats,
      totalProblems,
      progressPercentage,
      phaseSolvedMap,
      favoritesCount,
    };
  }

  /**
   * Get status counts for a user.
   */
  async getStatusCounts(userId: string, totalProblems: number): Promise<StatusCounts> {
    const statusCounts = await this.statusRepo.getStatusCountsForUser(userId);
    return this.calculateStatusCounts(statusCounts, totalProblems);
  }

  /**
   * Get solved by phase for a user.
   */
  async getSolvedByPhase(userId: string): Promise<Map<number, number>> {
    const solvedByPhase = await this.statusRepo.getSolvedByPhaseForUser(userId);
    return new Map(solvedByPhase.map((p) => [p.phaseId, p.count]));
  }

  /**
   * Calculate status counts from raw records.
   */
  private calculateStatusCounts(
    records: { status: string; count: number }[],
    totalProblems: number,
  ): StatusCounts {
    const stats: StatusCounts = {
      solved: 0,
      attempting: 0,
      revisit: 0,
      skipped: 0,
      untouched: totalProblems,
    };

    let touched = 0;
    for (const row of records) {
      if (row.status === "solved") {
        stats.solved = row.count;
        touched += row.count;
      } else if (row.status === "attempting") {
        stats.attempting = row.count;
        touched += row.count;
      } else if (row.status === "revisit") {
        stats.revisit = row.count;
        touched += row.count;
      } else if (row.status === "skipped") {
        stats.skipped = row.count;
        touched += row.count;
      }
    }
    stats.untouched = totalProblems - touched;

    return stats;
  }

  /**
   * Get favorites count for a user.
   */
  async getFavoritesCount(userId: string): Promise<number> {
    return this.favoriteRepo.getCountForUser(userId);
  }

  /**
   * Create default stats for unauthenticated users.
   */
  createDefaultStats(totalProblems: number): StatusCounts {
    return {
      solved: 0,
      attempting: 0,
      revisit: 0,
      skipped: 0,
      untouched: totalProblems,
    };
  }
}
