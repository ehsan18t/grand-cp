import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { HistoryPageContent } from "./HistoryPageContent";

export const metadata: Metadata = buildMetadata({
  title: "History",
  description: "Your problem status change history",
  path: "/problems/history",
  noIndex: true,
});

export default function HistoryPage() {
  return <HistoryPageContent />;
}
