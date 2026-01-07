/**
 * Phase Repository - Data access layer for phases.
 * Contains pure database queries without business logic.
 */

import { eq, sql } from "drizzle-orm";
import type { Database } from "@/db";
import { phases, problems } from "@/db/schema";
import type { Phase } from "@/types/domain";

export class PhaseRepository {
  constructor(private db: Database) {}

  /**
   * Get all phases ordered by ID.
   */
  async findAll(): Promise<Phase[]> {
    return this.db.select().from(phases).orderBy(phases.id);
  }

  /**
   * Get a phase by ID.
   */
  async findById(id: number): Promise<Phase | null> {
    const [phase] = await this.db.select().from(phases).where(eq(phases.id, id)).limit(1);
    return phase ?? null;
  }

  /**
   * Get problem counts grouped by phase.
   */
  async getProblemCountsByPhase(): Promise<Map<number, number>> {
    const counts = await this.db
      .select({
        phaseId: problems.phaseId,
        count: sql<number>`count(*)`,
      })
      .from(problems)
      .groupBy(problems.phaseId);

    return new Map(counts.map((c) => [c.phaseId, c.count]));
  }

  /**
   * Get total problem count.
   */
  async getTotalProblemCount(): Promise<number> {
    const [result] = await this.db.select({ count: sql<number>`count(*)` }).from(problems);
    return result?.count ?? 0;
  }
}
