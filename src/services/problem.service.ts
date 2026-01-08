/**
 * Problem Service - Business logic for problems.
 */

import type { ProblemRepository } from "@/repositories";
import type { Problem, ProblemStatus, ProblemWithUserData } from "@/types/domain";

export class ProblemService {
  constructor(private readonly problemRepo: ProblemRepository) {}

  /**
   * Get all problems.
   */
  async getAllProblems(): Promise<Problem[]> {
    return this.problemRepo.findAll();
  }

  /**
   * Get problems by phase ID.
   */
  async getProblemsByPhaseId(phaseId: number): Promise<Problem[]> {
    return this.problemRepo.findByPhaseId(phaseId);
  }

  /**
   * Get a problem by its number.
   */
  async getProblemByNumber(number: number): Promise<Problem | null> {
    return this.problemRepo.findByNumber(number);
  }

  /**
   * Get a problem by ID.
   */
  async getProblemById(id: number): Promise<Problem | null> {
    return this.problemRepo.findById(id);
  }

  /**
   * Get problems with user data (status and favorites).
   */
  async getProblemsWithUserData(
    problems: Problem[],
    userId: string | null,
  ): Promise<ProblemWithUserData[]> {
    if (!userId || problems.length === 0) {
      return problems.map((p) => ({
        ...p,
        userStatus: "untouched" as const,
        isFavorite: false,
      }));
    }

    const problemIds = problems.map((p) => p.id);

    const [statusRecords, favoriteRecords] = await Promise.all([
      this.problemRepo.getUserStatusesForProblems(userId, problemIds),
      this.problemRepo.getUserFavoritesForProblems(userId, problemIds),
    ]);

    const statusMap = new Map(statusRecords.map((r) => [r.problemId, r.status]));
    const favoriteSet = new Set(favoriteRecords.map((r) => r.problemId));

    return problems.map((p) => ({
      ...p,
      userStatus: (statusMap.get(p.id) ?? "untouched") as ProblemStatus,
      isFavorite: favoriteSet.has(p.id),
    }));
  }

  /**
   * Calculate stats from problems with user data.
   */
  calculateStats(problems: ProblemWithUserData[]): {
    solved: number;
    attempting: number;
    skipped: number;
    revisit: number;
  } {
    const stats = { solved: 0, attempting: 0, skipped: 0, revisit: 0 };

    for (const p of problems) {
      if (p.userStatus === "solved") stats.solved++;
      else if (p.userStatus === "attempting") stats.attempting++;
      else if (p.userStatus === "skipped") stats.skipped++;
      else if (p.userStatus === "revisit") stats.revisit++;
    }

    return stats;
  }
}
