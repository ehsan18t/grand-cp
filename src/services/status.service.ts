/**
 * Status Service - Business logic for problem status management.
 */

import { Errors } from "@/lib/errors";
import type { ProblemRepository, StatusRepository } from "@/repositories";
import { isValidStatus, type ProblemStatus, type StatusUpdateResult } from "@/types/domain";

export class StatusService {
  constructor(
    private readonly statusRepo: StatusRepository,
    private readonly problemRepo: ProblemRepository,
  ) {}

  /**
   * Update a problem's status for a user.
   * Atomically updates the status and logs to history.
   */
  async updateStatus(
    userId: string,
    problemNumber: number,
    status: ProblemStatus,
  ): Promise<StatusUpdateResult> {
    // Validate status
    if (!isValidStatus(status)) {
      throw Errors.badRequest("Invalid status");
    }

    // Get problem by number
    const problem = await this.problemRepo.findByNumber(problemNumber);
    if (!problem) {
      throw Errors.notFound("Problem");
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

    // Atomically update status and log to history
    await this.statusRepo.updateStatusWithHistory(
      userId,
      problem.id,
      currentStatus ?? null,
      status,
      now,
    );

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
}
