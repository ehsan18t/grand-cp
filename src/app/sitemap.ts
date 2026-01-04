import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { MetadataRoute } from "next";
import { phases as phasesData } from "@/data/phases";
import { createDb } from "@/db";
import { phases as dbPhases, users } from "@/db/schema";
import { getSiteUrlFromEnv, getSiteUrlFromProcessEnv } from "@/lib/site";

/**
 * Generate sitemap.xml for search engine discoverability.
 * Includes static pages, phase pages, and public user profiles.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let env: CloudflareEnv | undefined;
  try {
    const context = await getCloudflareContext({ async: true });
    env = context.env;
  } catch {
    env = undefined;
  }

  const siteUrl = env ? getSiteUrlFromEnv(env) : getSiteUrlFromProcessEnv();
  const db = env ? createDb(env.DB) : undefined;

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${siteUrl}/problems`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${siteUrl}/stats`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.7,
    },
  ];

  // Phase pages
  let phaseIds = phasesData.map((p) => p.id);
  try {
    if (db) {
      const phases = await db.select({ id: dbPhases.id }).from(dbPhases);
      phaseIds = phases.map((p) => p.id);
    }
  } catch {
    // Build-time / local D1 may not have migrations applied yet.
    // Fall back to static phase ids so sitemap generation never breaks builds.
  }

  const phasePages: MetadataRoute.Sitemap = phaseIds.map((phaseId) => ({
    url: `${siteUrl}/problems/phase/${phaseId}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Public user profiles (only users with usernames)
  let userPages: MetadataRoute.Sitemap = [];
  try {
    if (db) {
      const usersWithUsernames = await db
        .select({ username: users.username, updatedAt: users.updatedAt })
        .from(users)
        .limit(1000); // Limit to prevent huge sitemaps

      userPages = usersWithUsernames
        .filter((u) => u.username)
        .map((user) => ({
          url: `${siteUrl}/u/${user.username}`,
          lastModified: user.updatedAt,
          changeFrequency: "weekly" as const,
          priority: 0.5,
        }));
    }
  } catch {
    userPages = [];
  }

  return [...staticPages, ...phasePages, ...userPages];
}
