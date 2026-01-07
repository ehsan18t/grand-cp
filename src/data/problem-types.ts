import type { Platform } from "@/types/domain";

/**
 * ProblemData represents the static problem data without a database ID.
 * Used for seeding and build-time fallback.
 */
export interface ProblemData {
  number: number;
  platform: Platform;
  name: string;
  url: string;
  phaseId: number;
  topic: string;
  isStarred: boolean;
  note: string | null;
}
