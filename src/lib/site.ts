/**
 * Centralized site configuration.
 * Uses SITE_URL from environment - no fallbacks.
 */

/**
 * Get the site URL from environment.
 * Server-side: reads from CloudflareEnv.SITE_URL
 * Client-side: reads from NEXT_PUBLIC_SITE_URL
 */
export function getSiteUrl(): string {
  // Client-side
  if (typeof window !== "undefined") {
    const url = process.env.NEXT_PUBLIC_SITE_URL;
    if (!url) {
      throw new Error("NEXT_PUBLIC_SITE_URL environment variable is required");
    }
    return url;
  }

  // Server-side - will be provided by getCloudflareContext
  // This function is meant to be called after getting env from context
  throw new Error("Use getSiteUrlFromEnv(env) for server-side code");
}

/**
 * Get site URL from Cloudflare environment (server-side).
 */
export function getSiteUrlFromEnv(env: CloudflareEnv): string {
  const url = env.SITE_URL;
  if (!url) {
    throw new Error("SITE_URL environment variable is required");
  }
  return url;
}

/**
 * Site metadata constants
 */
export const siteConfig = {
  name: "Grand CP",
  description:
    "Master competitive programming with 655+ curated problems. Track your progress from beginner to Candidate Master.",
  keywords: [
    "competitive programming",
    "codeforces",
    "leetcode",
    "algorithms",
    "data structures",
    "cp roadmap",
    "programming practice",
  ] as string[],
  author: "Grand CP",
  twitterHandle: "@grandcp",
} as const;
