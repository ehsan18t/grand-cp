import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProblemList } from "@/components/problems";
import { phases } from "@/data/phases";
import { problems } from "@/data/problems";

interface PageProps {
  params: Promise<{ phaseId: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { phaseId } = await params;
  const phase = phases.find((p) => p.id === Number.parseInt(phaseId, 10));
  if (!phase) return { title: "Phase Not Found" };

  return {
    title: `Phase ${phase.id}: ${phase.name} | Grand CP`,
    description: phase.description,
  };
}

export default async function PhasePage({ params }: PageProps) {
  const { phaseId } = await params;
  const phaseIdNum = Number.parseInt(phaseId, 10);
  const phase = phases.find((p) => p.id === phaseIdNum);

  if (!phase) {
    notFound();
  }

  const phaseProblems = problems.filter((p) => p.phaseId === phaseIdNum);
  const topics = [...new Set(phaseProblems.map((p) => p.topic))];

  const prevPhase = phases.find((p) => p.id === phaseIdNum - 1);
  const nextPhase = phases.find((p) => p.id === phaseIdNum + 1);

  return (
    <main className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8">
        <div className="mb-4 flex items-center gap-2 text-muted-foreground text-sm">
          <Link href="/problems" className="hover:text-primary">
            Problems
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Phase {phase.id}</span>
        </div>

        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="mb-1 font-mono text-primary text-sm">Phase {phase.id}</div>
            <h1 className="mb-2 font-bold text-3xl">{phase.name}</h1>
            <p className="max-w-2xl text-muted-foreground">{phase.description}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-muted-foreground text-sm">Target Rating</div>
              <div className="font-mono font-semibold text-lg">
                {phase.targetRatingStart} → {phase.targetRatingEnd}
              </div>
            </div>
            <div className="text-right">
              <div className="text-muted-foreground text-sm">Problems</div>
              <div className="font-mono font-semibold text-lg">
                {phase.problemStart}-{phase.problemEnd}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total", value: phaseProblems.length, color: "text-foreground" },
          { label: "Solved", value: 0, color: "text-status-solved" },
          { label: "Attempting", value: 0, color: "text-status-attempting" },
          { label: "Skipped", value: 0, color: "text-status-skipped" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-card p-4">
            <div className="text-muted-foreground text-sm">{stat.label}</div>
            <div className={`font-bold font-mono text-2xl ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Problems by Topic */}
      <div className="space-y-8">
        {topics.map((topic) => {
          const topicProblems = phaseProblems.filter((p) => p.topic === topic);
          return <ProblemList key={topic} topic={topic} problems={topicProblems} />;
        })}
      </div>

      {/* Navigation */}
      <nav className="mt-12 flex items-center justify-between border-border border-t pt-8">
        {prevPhase ? (
          <Link
            href={`/problems/phase/${prevPhase.id}`}
            className="flex items-center gap-2 text-muted-foreground transition-colors hover:text-primary"
          >
            <ChevronLeft className="h-5 w-5" />
            <div>
              <div className="text-sm">Previous Phase</div>
              <div className="font-medium text-foreground">{prevPhase.name}</div>
            </div>
          </Link>
        ) : (
          <div />
        )}

        {nextPhase ? (
          <Link
            href={`/problems/phase/${nextPhase.id}`}
            className="flex items-center gap-2 text-right text-muted-foreground transition-colors hover:text-primary"
          >
            <div>
              <div className="text-sm">Next Phase</div>
              <div className="font-medium text-foreground">{nextPhase.name}</div>
            </div>
            <ChevronRight className="h-5 w-5" />
          </Link>
        ) : (
          <div />
        )}
      </nav>
    </main>
  );
}
