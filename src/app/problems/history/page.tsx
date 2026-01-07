import type { Metadata } from "next";
import { HistoryPageContent } from "./HistoryPageContent";

export const metadata: Metadata = {
  title: "History | Grand CP",
  description: "Your problem status change history",
};

export default function HistoryPage() {
  return <HistoryPageContent />;
}
