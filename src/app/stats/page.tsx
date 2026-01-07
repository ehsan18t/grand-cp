import type { Metadata } from "next";
import { StatsPageContent } from "./StatsPageContent";

export const metadata: Metadata = {
  title: "Stats | Grand CP",
  description: "Track your competitive programming progress",
};

export default function StatsPage() {
  return <StatsPageContent />;
}
