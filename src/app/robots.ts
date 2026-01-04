import type { MetadataRoute } from "next";

/**
 * Generate robots.txt for search engine crawlers.
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/robots
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.SITE_URL ?? process.env.NEXT_PUBLIC_SITE_URL;

  if (!siteUrl) {
    throw new Error("SITE_URL or NEXT_PUBLIC_SITE_URL environment variable is required");
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/u/*/edit"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
