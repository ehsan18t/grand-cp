/**
 * Application Errors - Type-safe error handling.
 *
 * These errors map to specific HTTP status codes and can be
 * automatically converted to API responses.
 */

export type ErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "INTERNAL_ERROR";

const STATUS_CODES: Record<ErrorCode, number> = {
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  BAD_REQUEST: 400,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
};

/**
 * Base application error with code and HTTP status.
 */
export class AppError extends Error {
  readonly code: ErrorCode;
  readonly statusCode: number;

  constructor(code: ErrorCode, message: string) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.statusCode = STATUS_CODES[code];
  }
}

// ============================================================================
// Predefined Errors - Use these for common cases
// ============================================================================

export const Errors = {
  unauthorized: (message = "Unauthorized") => new AppError("UNAUTHORIZED", message),
  forbidden: (message = "Forbidden") => new AppError("FORBIDDEN", message),
  notFound: (resource = "Resource") => new AppError("NOT_FOUND", `${resource} not found`),
  badRequest: (message = "Invalid request") => new AppError("BAD_REQUEST", message),
  conflict: (message = "Conflict") => new AppError("CONFLICT", message),
  internal: (message = "Internal server error") => new AppError("INTERNAL_ERROR", message),
} as const;

/**
 * Check if an error is an AppError.
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Convert a known error message to an AppError.
 * Useful for translating service-layer errors.
 */
export function fromErrorMessage(error: unknown): AppError | null {
  if (!(error instanceof Error)) return null;

  const message = error.message.toLowerCase();

  if (message.includes("not found")) {
    return Errors.notFound(error.message.replace(" not found", ""));
  }
  if (message.includes("invalid")) {
    return Errors.badRequest(error.message);
  }
  if (message.includes("already taken") || message.includes("already exists")) {
    return Errors.conflict(error.message);
  }
  if (message.includes("unauthorized")) {
    return Errors.unauthorized(error.message);
  }

  return null;
}
