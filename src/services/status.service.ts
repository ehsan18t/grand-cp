/**
 * Status Service - Business logic for problem status management.
 */

import type { ProblemRepository, StatusRepository } from "@/repositories";
import type { ProblemStatus, StatusUpdateResult } from "@/types/domain";

const VALID_STATUSES: ProblemStatus[] = ["untouched", "attempting", "solved", "revisit", "skipped"];

export class StatusService {
  constructor(
    private statusRepo: StatusRepository,
    private problemRepo: ProblemRepository,
  ) {}

  /**
   * Update a problem's status for a user.
   */
  async updateStatus(
    userId: string,
    problemNumber: number,
    status: ProblemStatus,
  ): Promise<StatusUpdateResult | { error: string; code: number }> {
    // Validate status
    if (!VALID_STATUSES.includes(status)) {
      return { error: "Invalid status", code: 400 };
    }

    // Get problem by number
    const problem = await this.problemRepo.findByNumber(problemNumber);
    if (!problem) {
      return { error: "Problem not found", code: 404 };
    }

    // Get current status
    const currentStatus = await this.statusRepo.getUserProblemStatus(userId, problem.id);

    // Only update if status actually changed
    if (currentStatus === status) {
      return {
        success: true,
        problemNumber,
        status,
        previousStatus: currentStatus ?? "untouched",
      };
    }

    const now = new Date();

    // Update status
    await this.statusRepo.upsertStatus(userId, problem.id, status, now);

    // Log status change
    await this.statusRepo.logStatusChange(userId, problem.id, currentStatus ?? null, status, now);

    return {
      success: true,
      problemNumber,
      status,
      previousStatus: currentStatus ?? "untouched",
    };
  }

  /**
   * Get all statuses for a user.
   */
  async getAllStatuses(
    userId: string,
  ): Promise<{ problemNumber: number; status: ProblemStatus; updatedAt: Date }[]> {
    return this.statusRepo.getAllUserStatuses(userId);
  }

  /**
   * Validate a status value.
   */
  isValidStatus(status: string): status is ProblemStatus {
    return VALID_STATUSES.includes(status as ProblemStatus);
  }
}
