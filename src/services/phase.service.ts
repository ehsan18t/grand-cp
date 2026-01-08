/**
 * Phase Service - Business logic for phases.
 */

import type { PhaseRepository } from "@/repositories";
import type { Phase, PhaseSummary, PhaseWithProgress } from "@/types/domain";

export class PhaseService {
  constructor(private readonly phaseRepo: PhaseRepository) {}

  /**
   * Get all phases with their problem counts.
   */
  async getPhaseSummary(): Promise<PhaseSummary> {
    const [phases, totalProblems, phaseCountsMap] = await Promise.all([
      this.phaseRepo.findAll(),
      this.phaseRepo.getTotalProblemCount(),
      this.phaseRepo.getProblemCountsByPhase(),
    ]);

    return {
      phases,
      totalProblems,
      phaseCountsMap,
    };
  }

  /**
   * Get a phase by ID.
   */
  async getPhaseById(id: number): Promise<Phase | null> {
    return this.phaseRepo.findById(id);
  }

  /**
   * Get all phases.
   */
  async getAllPhases(): Promise<Phase[]> {
    return this.phaseRepo.findAll();
  }

  /**
   * Calculate phases with user progress.
   */
  calculatePhasesWithProgress(
    phases: Phase[],
    phaseCountsMap: Map<number, number>,
    phaseSolvedMap: Map<number, number>,
  ): PhaseWithProgress[] {
    return phases.map((phase) => {
      const totalProblems = phaseCountsMap.get(phase.id) ?? 0;
      const solvedCount = phaseSolvedMap.get(phase.id) ?? 0;
      const progressPercentage =
        totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

      return {
        ...phase,
        totalProblems,
        solvedCount,
        progressPercentage,
      };
    });
  }

  /**
   * Determine current phase and target rating for a user.
   */
  determineCurrentPhase(
    phases: Phase[],
    phaseCountsMap: Map<number, number>,
    phaseSolvedMap: Map<number, number>,
  ): { currentPhase: number; targetRating: string } {
    for (const phase of phases) {
      const phaseTotal = phaseCountsMap.get(phase.id) ?? 0;
      const phaseSolved = phaseSolvedMap.get(phase.id) ?? 0;
      if (phaseSolved < phaseTotal) {
        return {
          currentPhase: phase.id,
          targetRating: `${phase.targetRatingEnd ?? 1000}+`,
        };
      }
    }
    return { currentPhase: 0, targetRating: "1000+" };
  }
}
