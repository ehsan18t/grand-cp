/**
 * Domain types for the application.
 * These types represent business entities and DTOs used across layers.
 */

// Import and re-export core types from schema to maintain single source of truth
import type { Platform as _Platform, ProblemStatus as _ProblemStatus } from "@/db/schema";
export type Platform = _Platform;
export type ProblemStatus = _ProblemStatus;

// ============================================================================
// Status Validation
// ============================================================================

/** Valid problem statuses - use for validation */
export const VALID_STATUSES = ["untouched", "attempting", "solved", "revisit", "skipped"] as const;

/** Check if a string is a valid problem status */
export function isValidStatus(status: string): status is (typeof VALID_STATUSES)[number] {
  return VALID_STATUSES.includes(status as (typeof VALID_STATUSES)[number]);
}

// ============================================================================
// Username Validation
// ============================================================================

/** Username validation: 3-20 chars, alphanumeric + underscore */
export const USERNAME_REGEX = /^[a-zA-Z0-9_]{3,20}$/;

export const USERNAME_MIN_LENGTH = 3;
export const USERNAME_MAX_LENGTH = 20;

/** Check if a string is a valid username */
export function isValidUsername(username: string): boolean {
  return USERNAME_REGEX.test(username);
}

// ============================================================================
// Phase Types
// ============================================================================

export interface Phase {
  id: number;
  name: string;
  description: string | null;
  targetRatingStart: number | null;
  targetRatingEnd: number | null;
  focus: string | null;
  problemStart: number;
  problemEnd: number;
}

export interface PhaseWithProgress extends Phase {
  totalProblems: number;
  solvedCount: number;
  progressPercentage: number;
}

export interface PhaseSummary {
  phases: Phase[];
  totalProblems: number;
  phaseCountsMap: Map<number, number>;
}

// ============================================================================
// Problem Types
// ============================================================================

export interface Problem {
  id: number;
  number: number;
  platform: Platform;
  name: string;
  url: string;
  phaseId: number;
  topic: string;
  isStarred: boolean;
  note: string | null;
}

export interface ProblemWithUserData extends Problem {
  userStatus: ProblemStatus;
  isFavorite: boolean;
}

export interface FavoriteProblem extends ProblemWithUserData {
  favoritedAt: Date;
}

// ============================================================================
// User Stats Types
// ============================================================================

export interface StatusCounts {
  solved: number;
  attempting: number;
  revisit: number;
  skipped: number;
  untouched: number;
}

export interface UserStats extends StatusCounts {
  totalProblems: number;
  progressPercentage: number;
  phaseSolvedMap: Map<number, number>;
  favoritesCount: number;
}

export interface PhaseStats {
  phaseId: number;
  total: number;
  solved: number;
  percentage: number;
}

// ============================================================================
// User Types
// ============================================================================

export interface UserProfile {
  id: string;
  name: string;
  username: string | null;
  image: string | null;
  createdAt: Date;
}

export interface UserProfileWithStats extends UserProfile {
  stats: StatusCounts;
  phaseSolvedMap: Map<number, number>;
  progressPercentage: number;
  currentPhase: number;
  targetRating: string;
}

// ============================================================================
// History Types
// ============================================================================

export interface HistoryEntry {
  id: number;
  problemId: number;
  problemNumber: number;
  problemName: string;
  problemUrl: string;
  platform: Platform;
  fromStatus: ProblemStatus | null;
  toStatus: ProblemStatus;
  changedAt: Date;
}

// ============================================================================
// API Response Types
// ============================================================================

export interface StatusUpdateResult {
  success: boolean;
  problemNumber: number;
  status: ProblemStatus;
  previousStatus: ProblemStatus;
}

export interface FavoriteToggleResult {
  success: boolean;
  problemId: number;
  isFavorite: boolean;
}
