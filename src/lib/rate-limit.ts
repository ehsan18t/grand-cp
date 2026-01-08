/**
 * Rate Limiting - Cloudflare Workers Rate Limiting API.
 *
 * Uses Cloudflare's built-in rate limiting bindings for distributed rate limiting.
 * This is the recommended approach for Workers deployed on Cloudflare.
 *
 * @see https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/
 */

import { getCloudflareContext } from "@opennextjs/cloudflare";

// ============================================================================
// Types
// ============================================================================

export type RateLimitPreset = "standard" | "strict" | "write" | "read";

// ============================================================================
// Rate Limit Configuration
// ============================================================================

/**
 * Rate limit presets mapped to Cloudflare bindings.
 * - standard: 100 requests/minute (RATE_LIMITER)
 * - strict: 20 requests/minute (RATE_LIMITER_STRICT)
 * - write: 30 requests/minute (RATE_LIMITER_WRITE)
 * - read: 100 requests/minute (RATE_LIMITER)
 */
export const RATE_LIMIT_PRESETS = {
  /** Standard API rate limit: 100 requests per minute */
  standard: "RATE_LIMITER",
  /** Strict rate limit for sensitive operations: 20 requests per minute */
  strict: "RATE_LIMITER_STRICT",
  /** Write operations: 30 requests per minute */
  write: "RATE_LIMITER_WRITE",
  /** Read operations: uses standard limiter */
  read: "RATE_LIMITER",
} as const;

// ============================================================================
// Utilities
// ============================================================================

/**
 * Generate a rate limit key from request.
 * Uses IP + pathname for consistent rate limiting per endpoint.
 */
function generateKey(request: Request, userId?: string | null): string {
  const pathname = new URL(request.url).pathname;

  // Prefer user ID for authenticated requests
  if (userId) {
    return `user:${userId}:${pathname}`;
  }

  // Fall back to IP address for unauthenticated requests
  const ip =
    request.headers.get("cf-connecting-ip") ||
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown";

  return `ip:${ip}:${pathname}`;
}

/**
 * Create rate limit exceeded response.
 */
function rateLimitResponse(): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": "60",
      },
    },
  );
}

// ============================================================================
// Rate Limit Middleware
// ============================================================================

/**
 * Apply rate limiting using Cloudflare's Rate Limiting API.
 *
 * @param preset - The rate limit preset to use
 * @param handler - The handler to wrap with rate limiting
 * @param options - Optional configuration
 *
 * @example
 * ```ts
 * export const POST = withRateLimit(
 *   "write",
 *   withAuth(async (request, ctx) => {
 *     // handler code
 *   })
 * );
 * ```
 */
export function withRateLimit(
  preset: RateLimitPreset,
  handler: (request: Request) => Promise<Response>,
  options?: {
    /** Custom key generator */
    keyGenerator?: (request: Request) => string;
    /** Skip rate limiting for certain requests */
    skip?: (request: Request) => boolean;
  },
) {
  return async (request: Request): Promise<Response> => {
    // Check if we should skip rate limiting
    if (options?.skip?.(request)) {
      return handler(request);
    }

    try {
      const { env } = await getCloudflareContext({ async: true });

      // Get the appropriate rate limiter binding
      const bindingName = RATE_LIMIT_PRESETS[preset];
      const rateLimiter = env[bindingName] as RateLimit | undefined;

      if (!rateLimiter) {
        // If rate limiter is not available (e.g., in development), skip rate limiting
        console.warn(`Rate limiter binding ${bindingName} not available, skipping rate limit`);
        return handler(request);
      }

      // Generate rate limit key
      const key = options?.keyGenerator?.(request) ?? generateKey(request);

      // Check rate limit using Cloudflare's API
      const result = await rateLimiter.limit({ key });

      if (!result.success) {
        return rateLimitResponse();
      }

      return handler(request);
    } catch (error) {
      // If rate limiting fails, log and proceed with request
      console.error("Rate limiting error:", error);
      return handler(request);
    }
  };
}
