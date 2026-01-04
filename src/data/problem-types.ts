import type { Platform } from "@/db/schema";

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
