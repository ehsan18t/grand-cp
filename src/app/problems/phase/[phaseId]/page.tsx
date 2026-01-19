import type { Metadata } from "next";
import { phases } from "@/data/phases";
import { buildMetadata } from "@/lib/seo";
import { PhasePageContent } from "./PhasePageContent";

interface PageProps {
  params: Promise<{ phaseId: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { phaseId } = await params;
  const phaseIdNum = Number.parseInt(phaseId, 10);
  const phase = phases.find((entry) => entry.id === phaseIdNum);
  const phaseTitle = phase ? `Phase ${phase.id}: ${phase.name}` : `Phase ${phaseId}`;
  const phaseSubtitle = phase?.description ?? "Competitive programming problems organized by phase";

  return buildMetadata({
    title: phaseTitle,
    description: phaseSubtitle,
    path: `/problems/phase/${phaseId}`,
    ogImage: {
      title: phaseTitle,
      subtitle: phaseSubtitle,
      eyebrow: "Competitive Programming",
    },
  });
}

export default async function PhasePage({ params }: PageProps) {
  const { phaseId } = await params;
  const phaseIdNum = Number.parseInt(phaseId, 10);

  return <PhasePageContent phaseId={phaseIdNum} />;
}
