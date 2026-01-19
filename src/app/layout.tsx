import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { AppStoreInitializer } from "@/components/AppStoreInitializer";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Navbar } from "@/components/layout";
import { ToastProvider } from "@/components/ui";
import { ThemeProvider, themeScript } from "@/context";
import ProgressProvider from "@/context/ProgressProvider";
import { geistMono, geistSans } from "@/lib/fonts";
import { getSiteUrlFromProcessEnv, siteConfig } from "@/lib/site";
import "./globals.css";

const siteUrl = getSiteUrlFromProcessEnv();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteConfig.name,
  title: {
    default: `${siteConfig.name} - Master Competitive Programming`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: siteConfig.keywords,
  authors: [{ name: siteConfig.author }],
  creator: siteConfig.author,
  publisher: siteConfig.author,
  category: "education",
  referrer: "origin-when-cross-origin",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name,
    title: `${siteConfig.name} - Master Competitive Programming`,
    description: siteConfig.description,
    images: [
      {
        url: `${siteUrl}/opengraph-image`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteConfig.name} - Master Competitive Programming`,
    description: siteConfig.description,
    images: [`${siteUrl}/twitter-image`],
    creator: siteConfig.twitterHandle,
  },
  alternates: {
    canonical: siteUrl,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

// JSON-LD structured data for SEO
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${siteUrl}#organization`,
    name: siteConfig.author,
    url: siteUrl,
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${siteUrl}#website`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    publisher: {
      "@id": `${siteUrl}#organization`,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/problems/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${siteUrl}#app`,
    name: siteConfig.name,
    description: siteConfig.description,
    url: siteUrl,
    applicationCategory: "EducationalApplication",
    operatingSystem: "Web",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "USD",
    },
    author: {
      "@id": `${siteUrl}#organization`,
    },
  },
];

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for JSON-LD
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased transition-colors duration-300`}
      >
        {/* Prevent flash of wrong theme - runs before React hydration */}
        <Script
          id="theme-script"
          strategy="beforeInteractive"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for theme script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <ThemeProvider defaultTheme="system" enableSystem>
          <ProgressProvider>
            <ToastProvider position="bottom-right" showProgress pauseOnHover>
              <ErrorBoundary>
                <AppStoreInitializer>
                  <Navbar />
                  {children}
                </AppStoreInitializer>
              </ErrorBoundary>
            </ToastProvider>
          </ProgressProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
