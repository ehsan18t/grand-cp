import type { Metadata } from "next";
import { FavoritesPageContent } from "./FavoritesPageContent";

export const metadata: Metadata = {
  title: "Favorites | Grand CP",
  description: "Your favorited competitive programming problems",
};

export default function FavoritesPage() {
  return <FavoritesPageContent />;
}
