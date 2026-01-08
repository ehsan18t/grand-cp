/**
 * API Validation Schemas - Centralized input validation using Zod Mini.
 *
 * Uses zod/mini for smaller bundle size (85% smaller than full Zod).
 * Zod Mini uses .check() method with validation functions and z.pipe() for transforms.
 *
 * @see https://zod.dev/v4#introducing-zod-mini
 */

import * as z from "zod/mini";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_REGEX } from "@/types/domain";

// ============================================================================
// Status API Schemas
// ============================================================================

/** Status values for Zod enum - matches ProblemStatus type from schema */
const statusValues = ["untouched", "attempting", "solved", "revisit", "skipped"] as const;

export const statusUpdateSchema = z.object({
  problemNumber: z.number({ error: "problemNumber must be a number" }).check(
    z.refine((val) => Number.isInteger(val), { error: "problemNumber must be an integer" }),
    z.refine((val) => val > 0, { error: "problemNumber must be positive" }),
  ),
  status: z.enum(statusValues, {
    error: `status must be one of: ${statusValues.join(", ")}`,
  }),
});

export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

// ============================================================================
// Favorites API Schemas
// ============================================================================

export const addFavoriteSchema = z.object({
  problemId: z.number({ error: "problemId must be a number" }).check(
    z.refine((val) => Number.isInteger(val), { error: "problemId must be an integer" }),
    z.refine((val) => val > 0, { error: "problemId must be positive" }),
  ),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;

export const removeFavoriteQuerySchema = z.object({
  problemId: z.pipe(
    z
      .string({ error: "problemId is required" })
      .check(z.refine((val) => /^\d+$/.test(val), { error: "problemId must be a number" })),
    z.transform((val: string) => Number.parseInt(val, 10)),
  ),
});

// ============================================================================
// User API Schemas
// ============================================================================

export const updateUsernameSchema = z.object({
  username: z.pipe(
    z.string({ error: "username is required" }).check(
      z.minLength(USERNAME_MIN_LENGTH, {
        error: `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
      }),
      z.maxLength(USERNAME_MAX_LENGTH, {
        error: `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
      }),
      z.refine((val) => USERNAME_REGEX.test(val), {
        error: "Username can only contain letters, numbers, and underscores",
      }),
    ),
    z.transform((val: string) => val.trim().toLowerCase()),
  ),
});

export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;

// ============================================================================
// History API Schemas
// ============================================================================

export const historyQuerySchema = z.object({
  page: z.pipe(
    z.optional(z.string()),
    z.transform((val: string | undefined) =>
      val ? Math.max(1, Number.parseInt(val, 10) || 1) : 1,
    ),
  ),
});

// ============================================================================
// Validation Utilities
// ============================================================================

/**
 * Validate JSON body against a schema.
 * Returns a validated object or throws a BadRequest error.
 */
export async function validateBody<T extends z.ZodMiniType>(
  request: Request,
  schema: T,
): Promise<z.infer<T>> {
  const contentType = request.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    throw new ValidationError400("Content-Type must be application/json");
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ValidationError400("Invalid JSON body");
  }

  const result = schema.safeParse(body);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    throw new ValidationError400(issues[0]?.message || "Validation failed", issues);
  }

  return result.data;
}

/**
 * Validate query parameters against a schema.
 */
export function validateQuery<T extends z.ZodMiniType>(request: Request, schema: T): z.infer<T> {
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());

  const result = schema.safeParse(params);

  if (!result.success) {
    const issues = result.error.issues.map((issue) => ({
      path: issue.path.join("."),
      message: issue.message,
    }));

    throw new ValidationError400(issues[0]?.message || "Invalid query parameters", issues);
  }

  return result.data;
}

/**
 * Custom validation error class.
 */
export class ValidationError400 extends Error {
  readonly statusCode = 400;
  readonly issues?: Array<{ path: string; message: string }>;

  constructor(message: string, issues?: Array<{ path: string; message: string }>) {
    super(message);
    this.name = "ValidationError";
    this.issues = issues;
  }
}

/**
 * Check if an error is a validation error.
 */
export function isValidationError(error: unknown): error is ValidationError400 {
  return error instanceof ValidationError400;
}
