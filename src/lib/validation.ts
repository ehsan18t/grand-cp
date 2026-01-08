/**
 * API Validation Schemas - Centralized input validation using Zod 4.
 *
 * Features:
 * - Runtime type validation
 * - Detailed error messages
 * - Type inference for handlers
 *
 * Note: Zod 4 uses unified `error` parameter instead of
 * `required_error` and `invalid_type_error`.
 */

import { z } from "zod";
import { USERNAME_MAX_LENGTH, USERNAME_MIN_LENGTH, USERNAME_REGEX } from "@/types/domain";

// ============================================================================
// Status API Schemas
// ============================================================================

/** Status values for Zod enum - matches ProblemStatus type */
const statusValues = ["untouched", "attempting", "solved", "revisit", "skipped"] as const;

export const statusUpdateSchema = z.object({
  problemNumber: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "problemNumber is required" : "problemNumber must be a number",
    })
    .int({ error: "problemNumber must be an integer" })
    .positive({ error: "problemNumber must be positive" }),
  status: z.enum(statusValues, {
    error: (issue) =>
      issue.input === undefined
        ? "status is required"
        : `status must be one of: ${statusValues.join(", ")}`,
  }),
});

export type StatusUpdateInput = z.infer<typeof statusUpdateSchema>;

// ============================================================================
// Favorites API Schemas
// ============================================================================

export const addFavoriteSchema = z.object({
  problemId: z
    .number({
      error: (issue) =>
        issue.input === undefined ? "problemId is required" : "problemId must be a number",
    })
    .int({ error: "problemId must be an integer" })
    .positive({ error: "problemId must be positive" }),
});

export type AddFavoriteInput = z.infer<typeof addFavoriteSchema>;

export const removeFavoriteQuerySchema = z.object({
  problemId: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "problemId is required" : "problemId must be a string",
    })
    .regex(/^\d+$/, { error: "problemId must be a number" })
    .transform((val) => Number.parseInt(val, 10))
    .refine((val) => val > 0, { error: "problemId must be positive" }),
});

// ============================================================================
// User API Schemas
// ============================================================================

export const updateUsernameSchema = z.object({
  username: z
    .string({
      error: (issue) =>
        issue.input === undefined ? "username is required" : "username must be a string",
    })
    .min(USERNAME_MIN_LENGTH, {
      error: `Username must be at least ${USERNAME_MIN_LENGTH} characters`,
    })
    .max(USERNAME_MAX_LENGTH, {
      error: `Username must be at most ${USERNAME_MAX_LENGTH} characters`,
    })
    .regex(USERNAME_REGEX, {
      error: "Username can only contain letters, numbers, and underscores",
    })
    .transform((val) => val.trim().toLowerCase()),
});

export type UpdateUsernameInput = z.infer<typeof updateUsernameSchema>;

// ============================================================================
// History API Schemas
// ============================================================================

export const historyQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? Math.max(1, Number.parseInt(val, 10) || 1) : 1)),
});

// ============================================================================
// Validation Utilities
// ============================================================================

export interface ValidationResult<T> {
  success: true;
  data: T;
}

export interface ValidationError {
  success: false;
  error: string;
  issues?: Array<{ path: string; message: string }>;
}

/**
 * Validate JSON body against a schema.
 * Returns a validated object or throws a BadRequest error.
 */
export async function validateBody<T extends z.ZodType>(
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
export function validateQuery<T extends z.ZodType>(request: Request, schema: T): z.infer<T> {
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
