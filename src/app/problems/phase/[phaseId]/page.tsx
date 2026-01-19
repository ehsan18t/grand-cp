import type { Metadata } from "next";
import { buildMetadata } from "@/lib/seo";
import { PhasePageContent } from "./PhasePageContent";

interface PageProps {
  params: Promise<{ phaseId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { phaseId } = await params;

  return buildMetadata({
    title: `Phase ${phaseId}`,
    description: `Competitive programming problems for Phase ${phaseId}`,
    path: `/problems/phase/${phaseId}`,
  });
}

export default async function PhasePage({ params }: PageProps) {
  const { phaseId } = await params;
  const phaseIdNum = Number.parseInt(phaseId, 10);

  return <PhasePageContent phaseId={phaseIdNum} />;
}
