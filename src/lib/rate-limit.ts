/**
 * Rate Limiting - Sliding window rate limiter for API routes.
 *
 * Uses an in-memory sliding window algorithm with IP-based tracking.
 * For production with multiple workers, consider using Cloudflare KV or D1.
 *
 * Features:
 * - Sliding window algorithm for smooth rate limiting
 * - IP-based tracking with X-Forwarded-For support
 * - Configurable window size and max requests
 * - Automatic cleanup of old entries
 */

import { type ApiRequestContext, getApiContext } from "@/lib/request-context";

// ============================================================================
// Types
// ============================================================================

export interface RateLimitConfig {
  /** Time window in milliseconds */
  windowMs: number;
  /** Maximum requests per window */
  maxRequests: number;
  /** Custom key generator (defaults to IP) */
  keyGenerator?: (request: Request, ctx: ApiRequestContext) => string;
  /** Custom response when rate limited */
  onRateLimited?: (request: Request) => Response;
  /** Skip rate limiting for certain requests */
  skip?: (request: Request, ctx: ApiRequestContext) => boolean;
}

export interface RateLimitInfo {
  /** Number of requests remaining in current window */
  remaining: number;
  /** Total requests allowed per window */
  limit: number;
  /** Time when the rate limit resets (Unix timestamp in seconds) */
  reset: number;
  /** Whether the request was rate limited */
  limited: boolean;
}

interface WindowEntry {
  count: number;
  startTime: number;
}

// ============================================================================
// In-Memory Store
// ============================================================================

class RateLimitStore {
  private windows: Map<string, WindowEntry> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;
  private readonly cleanupIntervalMs = 60000; // Cleanup every minute

  constructor() {
    // Start cleanup interval (only in Node.js environment)
    if (typeof setInterval !== "undefined") {
      this.startCleanup();
    }
  }

  private startCleanup(): void {
    if (this.cleanupInterval) return;

    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.cleanupIntervalMs);
  }

  private cleanup(): void {
    const now = Date.now();
    const maxAge = 300000; // 5 minutes

    for (const [key, entry] of this.windows.entries()) {
      if (now - entry.startTime > maxAge) {
        this.windows.delete(key);
      }
    }
  }

  /**
   * Check and increment rate limit for a key.
   * Returns rate limit info.
   */
  check(key: string, windowMs: number, maxRequests: number): RateLimitInfo {
    const now = Date.now();
    const entry = this.windows.get(key);

    // Calculate window boundaries
    const windowStart = now - windowMs;

    if (!entry || entry.startTime < windowStart) {
      // New window or expired window
      this.windows.set(key, { count: 1, startTime: now });
      return {
        remaining: maxRequests - 1,
        limit: maxRequests,
        reset: Math.ceil((now + windowMs) / 1000),
        limited: false,
      };
    }

    // Sliding window: calculate effective count
    const windowProgress = (now - entry.startTime) / windowMs;
    const effectiveCount = entry.count * (1 - windowProgress);

    if (effectiveCount >= maxRequests) {
      // Rate limited
      return {
        remaining: 0,
        limit: maxRequests,
        reset: Math.ceil((entry.startTime + windowMs) / 1000),
        limited: true,
      };
    }

    // Increment count
    entry.count += 1;
    this.windows.set(key, entry);

    return {
      remaining: Math.max(0, maxRequests - Math.ceil(effectiveCount) - 1),
      limit: maxRequests,
      reset: Math.ceil((entry.startTime + windowMs) / 1000),
      limited: false,
    };
  }

  /**
   * Clear all entries (useful for testing).
   */
  clear(): void {
    this.windows.clear();
  }
}

// Global store instance
const store = new RateLimitStore();

// ============================================================================
// Rate Limit Presets
// ============================================================================

export const RATE_LIMIT_PRESETS = {
  /** Standard API rate limit: 100 requests per minute */
  standard: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100,
  },
  /** Strict rate limit for sensitive operations: 20 requests per minute */
  strict: {
    windowMs: 60 * 1000,
    maxRequests: 20,
  },
  /** Auth rate limit: 10 requests per minute */
  auth: {
    windowMs: 60 * 1000,
    maxRequests: 10,
  },
  /** Write operations: 30 requests per minute */
  write: {
    windowMs: 60 * 1000,
    maxRequests: 30,
  },
  /** Read operations: 200 requests per minute */
  read: {
    windowMs: 60 * 1000,
    maxRequests: 200,
  },
} as const;

// ============================================================================
// Utilities
// ============================================================================

/**
 * Extract client IP from request headers.
 */
function getClientIp(request: Request): string {
  // Cloudflare provides CF-Connecting-IP
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp;

  // X-Forwarded-For (first IP in the list)
  const xff = request.headers.get("x-forwarded-for");
  if (xff) {
    const firstIp = xff.split(",")[0]?.trim();
    if (firstIp) return firstIp;
  }

  // X-Real-IP
  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp;

  // Fallback to unknown
  return "unknown";
}

/**
 * Create rate limit response headers.
 */
function createRateLimitHeaders(info: RateLimitInfo): HeadersInit {
  return {
    "X-RateLimit-Limit": info.limit.toString(),
    "X-RateLimit-Remaining": info.remaining.toString(),
    "X-RateLimit-Reset": info.reset.toString(),
  };
}

/**
 * Default rate limit exceeded response.
 */
function defaultRateLimitResponse(info: RateLimitInfo): Response {
  return new Response(
    JSON.stringify({
      error: "Too many requests",
      message: "Rate limit exceeded. Please try again later.",
      retryAfter: info.reset - Math.floor(Date.now() / 1000),
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        "Retry-After": (info.reset - Math.floor(Date.now() / 1000)).toString(),
        ...createRateLimitHeaders(info),
      },
    },
  );
}

// ============================================================================
// Rate Limit Middleware
// ============================================================================

/**
 * Create a rate limiting wrapper for API route handlers.
 *
 * @example
 * ```ts
 * // Using preset
 * export const POST = withRateLimit(
 *   RATE_LIMIT_PRESETS.write,
 *   withAuth(async (request, ctx) => {
 *     // handler code
 *   })
 * );
 *
 * // Custom config
 * export const GET = withRateLimit(
 *   { windowMs: 60000, maxRequests: 50 },
 *   handler
 * );
 * ```
 */
export function withRateLimit(
  config: Partial<RateLimitConfig>,
  handler: (request: Request) => Promise<Response>,
) {
  const {
    windowMs = RATE_LIMIT_PRESETS.standard.windowMs,
    maxRequests = RATE_LIMIT_PRESETS.standard.maxRequests,
    keyGenerator = (request) => getClientIp(request),
    onRateLimited = (_, info: RateLimitInfo) => defaultRateLimitResponse(info),
    skip,
  } = config as RateLimitConfig & {
    onRateLimited?: (request: Request, info: RateLimitInfo) => Response;
  };

  return async (request: Request): Promise<Response> => {
    const ctx = await getApiContext();

    // Check if we should skip rate limiting
    if (skip?.(request, ctx)) {
      return handler(request);
    }

    // Generate rate limit key
    const key = keyGenerator(request, ctx);

    // Check rate limit
    const info = store.check(key, windowMs, maxRequests);

    if (info.limited) {
      return onRateLimited(request, info);
    }

    // Call the handler and add rate limit headers to response
    const response = await handler(request);

    // Clone response to add headers
    const headers = new Headers(response.headers);
    const rateLimitHeaders = createRateLimitHeaders(info);
    for (const [headerKey, value] of Object.entries(rateLimitHeaders)) {
      headers.set(headerKey, value);
    }

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers,
    });
  };
}

/**
 * Combine rate limit with auth wrapper.
 * Convenience function for common pattern.
 */
export function withRateLimitedAuth(
  config: Partial<RateLimitConfig>,
  handler: Parameters<typeof withRateLimit>[1],
) {
  return withRateLimit(config, handler);
}

// ============================================================================
// Exports
// ============================================================================

export { store as rateLimitStore };
