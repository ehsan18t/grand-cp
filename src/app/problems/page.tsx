import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { ProblemsPageContent } from "./ProblemsPageContent";

export const metadata: Metadata = buildMetadata({
  title: "Problems",
  description: "Track your competitive programming progress with 655+ curated problems",
  path: "/problems",
});

export default function ProblemsPage() {
  return <ProblemsPageContent />;
}
