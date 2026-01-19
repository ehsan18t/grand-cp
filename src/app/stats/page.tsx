import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { StatsPageContent } from "./StatsPageContent";

export const metadata: Metadata = buildMetadata({
  title: "Stats",
  description: "Track your competitive programming progress",
  path: "/stats",
  noIndex: true,
  ogImage: {
    title: "Stats",
    subtitle: "Your competitive programming progress",
    eyebrow: "Competitive Programming",
  },
});

export default function StatsPage() {
  return <StatsPageContent />;
}
