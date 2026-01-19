import type { MetadataRoute } from "next";
import { getSiteUrlFromProcessEnv } from "@/lib/site";

/**
 * Generate robots.txt for search engine crawlers.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrlFromProcessEnv();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/u/*/edit", "/stats"],
      },
    ],
    host: siteUrl,
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
