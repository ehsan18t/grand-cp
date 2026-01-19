import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { FavoritesPageContent } from "./FavoritesPageContent";

export const metadata: Metadata = buildMetadata({
  title: "Favorites",
  description: "Your favorited competitive programming problems",
  path: "/problems/favorites",
  noIndex: true,
  ogImage: {
    title: "Favorites",
    subtitle: "Saved CP problems for focused review",
    eyebrow: "Competitive Programming",
  },
});

export default function FavoritesPage() {
  return <FavoritesPageContent />;
}
