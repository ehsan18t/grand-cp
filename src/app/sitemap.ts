import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { MetadataRoute } from "next";
import { createDb } from "@/db";
import { phases as dbPhases, users } from "@/db/schema";
import { getSiteUrlFromEnv } from "@/lib/site";

/**
 * Generate sitemap.xml for search engine discoverability.
 * Includes static pages, phase pages, and public user profiles.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { env } = await getCloudflareContext({ async: true });
  const db = createDb(env.DB);
  const siteUrl = getSiteUrlFromEnv(env);

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
  const phases = await db.select({ id: dbPhases.id }).from(dbPhases);
  const phasePages: MetadataRoute.Sitemap = phases.map((phase) => ({
    url: `${siteUrl}/problems/phase/${phase.id}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  // Public user profiles (only users with usernames)
  const usersWithUsernames = await db
    .select({ username: users.username, updatedAt: users.updatedAt })
    .from(users)
    .limit(1000); // Limit to prevent huge sitemaps

  const userPages: MetadataRoute.Sitemap = usersWithUsernames
    .filter((u) => u.username)
    .map((user) => ({
      url: `${siteUrl}/u/${user.username}`,
      lastModified: user.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.5,
    }));

  return [...staticPages, ...phasePages, ...userPages];
}
