import type { Metadata } from "next";
import { getSiteUrlFromProcessEnv, siteConfig } from "@/lib/site";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  openGraphType?: "website" | "profile";
};

const siteUrl = getSiteUrlFromProcessEnv();
const openGraphImageUrl = new URL("/opengraph-image", siteUrl).toString();
const twitterImageUrl = new URL("/twitter-image", siteUrl).toString();

export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
  openGraphType = "website",
}: BuildMetadataOptions): Metadata {
  const url = new URL(path, siteUrl).toString();

  return {
    title,
    description,
    alternates: {
      canonical: url,
    },
    robots: noIndex
      ? {
          index: false,
          follow: true,
        }
      : undefined,
    openGraph: {
      type: openGraphType,
      url,
      siteName: siteConfig.name,
      title,
      description,
      images: [
        {
          url: openGraphImageUrl,
          width: 1200,
          height: 630,
          alt: siteConfig.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [twitterImageUrl],
      creator: siteConfig.twitterHandle,
    },
  };
}
