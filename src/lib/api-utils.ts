/**
 * API Utilities - Shared helpers for API routes.
 *
 * Reduces boilerplate by providing:
 * - Response builders with consistent format
 * - Shared cache header configurations
 * - Authenticated route wrapper
 */

import type { Auth } from "@/lib/auth";
import { type AppError, Errors, fromErrorMessage, isAppError } from "@/lib/errors";
import { type ApiRequestContext, getApiContext } from "@/lib/request-context";
import { isValidationError } from "@/lib/validation";

// ============================================================================
// Cache Headers - Reusable configurations
// ============================================================================

export const CACHE_HEADERS = {
  /** Vary by Cookie for all API responses */
  vary: { Vary: "Cookie" } as const,

  /** Private, no caching - for authenticated user data */
  private: {
    Vary: "Cookie",
    "Cache-Control": "private, no-store",
  } as const,

  /** Public, short cache - for semi-dynamic data (still varies by cookie) */
  publicShort: {
    Vary: "Cookie",
    "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
  } as const,

  /** Public, short cache - for guest-only data (no cookie variance, truly cacheable) */
  publicGuest: {
    "Cache-Control": "public, max-age=0, s-maxage=300, stale-while-revalidate=3600",
  } as const,

  /** Public, long cache - for mostly static data */
  publicLong: {
    Vary: "Cookie",
    "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400",
  } as const,
} as const;

// ============================================================================
// Response Builders - Consistent API responses
// ============================================================================

type ResponseHeaders = HeadersInit;

interface JsonOptions {
  status?: number;
  headers?: ResponseHeaders;
}

/**
 * Create a JSON response with optional status and headers.
 */
export function json<T>(data: T, options: JsonOptions = {}): Response {
  return Response.json(data, {
    status: options.status ?? 200,
    headers: options.headers,
  });
}

/**
 * Create an error response.
 */
export function errorResponse(
  message: string,
  status: number,
  headers: ResponseHeaders = CACHE_HEADERS.private,
): Response {
  return Response.json({ error: message }, { status, headers });
}

/**
 * Standard error responses.
 */
export const ApiResponse = {
  ok: <T>(data: T, headers: ResponseHeaders = CACHE_HEADERS.private) => json(data, { headers }),

  created: <T>(data: T, headers: ResponseHeaders = CACHE_HEADERS.private) =>
    json(data, { status: 201, headers }),

  unauthorized: (message = "Unauthorized") => errorResponse(message, 401, CACHE_HEADERS.private),

  badRequest: (message = "Invalid request") => errorResponse(message, 400, CACHE_HEADERS.private),

  notFound: (message = "Not found") => errorResponse(message, 404, CACHE_HEADERS.private),

  conflict: (message = "Conflict") => errorResponse(message, 409, CACHE_HEADERS.private),

  internal: (message = "Internal server error") =>
    errorResponse(message, 500, CACHE_HEADERS.private),

  /**
   * Convert an AppError to a Response.
   */
  fromError: (error: AppError): Response =>
    errorResponse(error.message, error.statusCode, CACHE_HEADERS.private),
} as const;

// ============================================================================
// Authenticated Handler Wrapper
// ============================================================================

export interface AuthenticatedContext extends ApiRequestContext {
  userId: string;
  session: NonNullable<Awaited<ReturnType<Auth["api"]["getSession"]>>>;
}

export interface OptionalAuthContext extends ApiRequestContext {
  userId: string | null;
  session: Awaited<ReturnType<Auth["api"]["getSession"]>>;
}

type AuthenticatedHandler = (request: Request, ctx: AuthenticatedContext) => Promise<Response>;

type OptionalAuthHandler = (request: Request, ctx: OptionalAuthContext) => Promise<Response>;

/**
 * Wrap an API handler with authentication and error handling.
 *
 * Automatically:
 * - Gets API context and session
 * - Returns 401 if not authenticated
 * - Catches errors and returns appropriate responses
 * - Logs errors to console
 *
 * @example
 * ```ts
 * export const POST = withAuth(async (request, { services, userId }) => {
 *   const data = await services.myService.doSomething(userId);
 *   return ApiResponse.ok(data);
 * });
 * ```
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (request: Request): Promise<Response> => {
    try {
      const ctx = await getApiContext();
      const session = await ctx.auth.api.getSession({ headers: request.headers });

      if (!session?.user?.id) {
        return ApiResponse.unauthorized();
      }

      const authCtx: AuthenticatedContext = {
        ...ctx,
        userId: session.user.id,
        session,
      };

      return await handler(request, authCtx);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Wrap an API handler that works with or without authentication.
 *
 * Session is optional - handler receives userId as null if not authenticated.
 *
 * @example
 * ```ts
 * export const GET = withOptionalAuth(async (request, { services, userId }) => {
 *   const data = userId
 *     ? await services.myService.getUserData(userId)
 *     : await services.myService.getPublicData();
 *   return ApiResponse.ok(data);
 * });
 * ```
 */
export function withOptionalAuth(handler: OptionalAuthHandler) {
  return async (request: Request): Promise<Response> => {
    try {
      const ctx = await getApiContext();
      const session = await ctx.auth.api.getSession({ headers: request.headers });

      const optionalCtx: OptionalAuthContext = {
        ...ctx,
        userId: session?.user?.id ?? null,
        session,
      };

      return await handler(request, optionalCtx);
    } catch (error) {
      return handleError(error);
    }
  };
}

/**
 * Handle errors and convert to appropriate responses.
 * In production, internal errors return generic messages for security.
 */
function handleError(error: unknown): Response {
  const isDev = process.env.NODE_ENV === "development";

  // Validation errors - safe to expose
  if (isValidationError(error)) {
    return ApiResponse.badRequest(error.message);
  }

  // Known application error - safe to expose
  if (isAppError(error)) {
    return ApiResponse.fromError(error);
  }

  // Try to convert from error message
  const appError = fromErrorMessage(error);
  if (appError) {
    return ApiResponse.fromError(appError);
  }

  // Unknown error - log and return generic message in production
  console.error("API Error:", error);

  // In development, include error details for debugging
  if (isDev && error instanceof Error) {
    return ApiResponse.internal(`Internal error: ${error.message}`);
  }

  // In production, never expose internal error details
  return ApiResponse.internal();
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Parse and validate a positive integer from a string.
 * Throws BadRequest error if invalid.
 */
export function parsePositiveInt(value: string | null, fieldName = "value"): number {
  if (!value) {
    throw Errors.badRequest(`${fieldName} is required`);
  }

  const num = Number.parseInt(value, 10);
  if (!Number.isInteger(num) || num <= 0) {
    throw Errors.badRequest(`Invalid ${fieldName}`);
  }

  return num;
}

/**
 * Validate a positive integer from a parsed body.
 * Throws BadRequest error if invalid.
 */
export function validatePositiveInt(value: unknown, fieldName = "value"): number {
  if (typeof value !== "number" || !Number.isInteger(value) || value <= 0) {
    throw Errors.badRequest(`Invalid ${fieldName}`);
  }
  return value;
}
