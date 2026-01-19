import type { Metadata } from "next";
import { getSiteUrlFromProcessEnv, siteConfig } from "@/lib/site";

type BuildMetadataOptions = {
  title: string;
  description: string;
  path: string;
  noIndex?: boolean;
  openGraphType?: "website" | "profile";
  ogImage?: OgImageOptions;
};

export type OgImageOptions = {
  title?: string;
  subtitle?: string;
  eyebrow?: string;
  theme?: "dark" | "light";
};

const siteUrl = getSiteUrlFromProcessEnv();
const openGraphImageUrl = new URL("/opengraph-image", siteUrl).toString();
const twitterImageUrl = new URL("/twitter-image", siteUrl).toString();

export function buildOgImageUrl(options?: OgImageOptions): string {
  const url = new URL("/og", siteUrl);

  if (options?.title) {
    url.searchParams.set("title", options.title);
  }

  if (options?.subtitle) {
    url.searchParams.set("subtitle", options.subtitle);
  }

  if (options?.eyebrow) {
    url.searchParams.set("eyebrow", options.eyebrow);
  }

  if (options?.theme) {
    url.searchParams.set("theme", options.theme);
  }

  return url.toString();
}

export function buildMetadata({
  title,
  description,
  path,
  noIndex = false,
  openGraphType = "website",
  ogImage,
}: BuildMetadataOptions): Metadata {
  const url = new URL(path, siteUrl).toString();
  const ogImageUrl = buildOgImageUrl({
    title: ogImage?.title ?? title,
    subtitle: ogImage?.subtitle ?? description,
    eyebrow: ogImage?.eyebrow,
    theme: ogImage?.theme,
  });
  const twitterImage = ogImage ? ogImageUrl : twitterImageUrl;
  const openGraphImage = ogImage ? ogImageUrl : openGraphImageUrl;

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
          url: openGraphImage,
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
      images: [twitterImage],
      creator: siteConfig.twitterHandle,
    },
  };
}
