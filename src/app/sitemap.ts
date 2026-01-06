import { getCloudflareContext } from "@opennextjs/cloudflare";
import type { MetadataRoute } from "next";
import { phases as phasesData } from "@/data/phases";
import { createDb } from "@/db";
import { createServices } from "@/lib/service-factory";
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
  const services = db ? createServices(db) : undefined;

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
    if (services) {
      const phases = await services.phaseService.getAllPhases();
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
    if (services) {
      const usersWithUsernames = await services.userService.getAllUsersWithUsernames();

      userPages = usersWithUsernames.map((user) => ({
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
