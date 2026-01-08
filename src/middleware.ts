/**
 * Next.js Middleware - Security headers and request processing.
 *
 * Applies security headers to all responses:
 * - Content-Security-Policy
 * - X-Frame-Options
 * - X-Content-Type-Options
 * - Referrer-Policy
 * - Permissions-Policy
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// ============================================================================
// Security Headers
// ============================================================================

const securityHeaders = {
  // Prevent clickjacking
  "X-Frame-Options": "DENY",

  // Prevent MIME type sniffing
  "X-Content-Type-Options": "nosniff",

  // Control referrer information
  "Referrer-Policy": "strict-origin-when-cross-origin",

  // DNS prefetch control
  "X-DNS-Prefetch-Control": "on",

  // Permissions policy - disable unnecessary features
  "Permissions-Policy":
    "accelerometer=(), camera=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), payment=(), usb=()",
};

// Content Security Policy
// Note: 'unsafe-inline' for styles is needed for Tailwind and many CSS-in-JS solutions
// Script hashes would be more secure but harder to maintain
const csp = {
  "default-src": ["'self'"],
  "script-src": ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for dev
  "style-src": ["'self'", "'unsafe-inline'"],
  "img-src": ["'self'", "data:", "blob:", "https:"],
  "font-src": ["'self'", "data:"],
  "connect-src": [
    "'self'",
    "https://accounts.google.com", // Google OAuth
    "https://www.googleapis.com", // Google APIs
  ],
  "frame-src": ["'self'", "https://accounts.google.com"], // Google OAuth popup
  "frame-ancestors": ["'none'"], // Prevent embedding
  "form-action": ["'self'"],
  "base-uri": ["'self'"],
  "object-src": ["'none'"],
  "upgrade-insecure-requests": [],
};

function buildCsp(): string {
  return Object.entries(csp)
    .map(([key, values]) => {
      if (values.length === 0) return key;
      return `${key} ${values.join(" ")}`;
    })
    .join("; ");
}

// ============================================================================
// Middleware
// ============================================================================

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  for (const [key, value] of Object.entries(securityHeaders)) {
    response.headers.set(key, value);
  }

  // Add CSP header (less strict in development)
  const isDev = process.env.NODE_ENV === "development";
  if (!isDev) {
    response.headers.set("Content-Security-Policy", buildCsp());
  }

  // Add CORS headers for API routes
  if (request.nextUrl.pathname.startsWith("/api/")) {
    // Only allow same-origin requests for API
    const origin = request.headers.get("origin");
    const host = request.headers.get("host");

    if (origin && host) {
      const originHost = new URL(origin).host;
      // Only set CORS headers if same origin
      if (originHost === host) {
        response.headers.set("Access-Control-Allow-Origin", origin);
        response.headers.set("Access-Control-Allow-Credentials", "true");
        response.headers.set(
          "Access-Control-Allow-Methods",
          "GET, POST, PUT, PATCH, DELETE, OPTIONS",
        );
        response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
      }
    }
  }

  return response;
}

// ============================================================================
// Matcher Configuration
// ============================================================================

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder files
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
