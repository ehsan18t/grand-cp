import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock,
  Flame,
  Heart,
  Target,
  Trophy,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { phases as phasesData } from "@/data/phases";
import { problems as problemsData } from "@/data/problems";
import { getServicesOnly } from "@/lib/request-context";
import type { Phase } from "@/types/domain";

// Cache home page for 1 hour - static content with dynamic data
export const revalidate = 3600;

export default async function HomePage() {
  // Static data fallback for build-time
  const staticPhases: Phase[] = phasesData
    .filter((phase): phase is typeof phase & { id: number } => typeof phase.id === "number")
    .map((phase) => ({
      id: phase.id,
      name: phase.name,
      description: phase.description ?? null,
      targetRatingStart: phase.targetRatingStart ?? null,
      targetRatingEnd: phase.targetRatingEnd ?? null,
      focus: phase.focus ?? null,
      problemStart: phase.problemStart,
      problemEnd: phase.problemEnd,
    }));

  let phases: Phase[] = staticPhases;
  let totalProblems = problemsData.length;
  let phaseCountsMap = new Map<number, number>();

  for (const problem of problemsData) {
    phaseCountsMap.set(problem.phaseId, (phaseCountsMap.get(problem.phaseId) ?? 0) + 1);
  }

  try {
    const services = await getServicesOnly();

    // Fetch phases and problem counts from service
    const summary = await services.phaseService.getPhaseSummary();
    phases = summary.phases;
    totalProblems = summary.totalProblems;
    phaseCountsMap = summary.phaseCountsMap;
  } catch {
    // Build-time / local D1 may not have migrations applied yet.
    // Fall back to static content so builds always succeed.
  }

  const totalPhases = phases.length;

  return (
    <main className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-16 text-center md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 font-bold text-4xl md:text-6xl">
            From <span className="text-primary">800</span> to{" "}
            <span className="text-primary">Candidate Master</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            A curated roadmap of {totalProblems}+ problems across {totalPhases} phases. Track your
            progress, struggle intentionally, and reach 2200+ Codeforces rating.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/problems"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start the Journey
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/stats"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-accent"
            >
              Track Progress
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<BookOpen className="h-6 w-6" />}
            value={`${totalProblems}+`}
            label="Curated Problems"
          />
          <StatCard
            icon={<Target className="h-6 w-6" />}
            value={totalPhases}
            label="Learning Phases"
          />
          <StatCard icon={<Trophy className="h-6 w-6" />} value="2200+" label="Target Rating" />
          <StatCard icon={<Zap className="h-6 w-6" />} value="4" label="Platforms" />
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-bold text-2xl md:text-3xl">The Philosophy</h2>
          <p className="text-muted-foreground">
            Based on research from top competitive programmers (E869120, -is-this-fft-, TheScrasse)
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <PhilosophyCard
            icon={<Brain className="h-6 w-6" />}
            title="What to Think"
            description="Know standard problems, techniques, and patterns. Build your mental library of solutions."
          />
          <PhilosophyCard
            icon={<Flame className="h-6 w-6" />}
            title="How to Think"
            description="Build paths to solutions through intentional struggle. The struggle is where learning happens."
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <RuleCard icon={<CheckCircle2 />} text="Follow problems serially - order matters" />
          <RuleCard icon={<Clock />} text="Struggle 30-60 min before hints" />
          <RuleCard icon={<Target />} text="Implement everything - reading ≠ solving" />
          <RuleCard icon={<Trophy />} text="Upsolve after every contest" />
        </div>
      </section>

      {/* Phases Overview */}
      <section className="py-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-bold text-2xl md:text-3xl">Structured Learning Path</h2>
          <p className="text-muted-foreground">
            Progress through carefully designed phases, each targeting specific rating ranges
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {phases.map((phase) => {
            const phaseProblemsCount = phaseCountsMap.get(phase.id) ?? 0;
            return (
              <Link
                key={phase.id}
                href={`/problems/phase/${phase.id}`}
                className="group rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="mb-2 font-mono text-primary text-sm">Phase {phase.id}</div>
                <h3 className="mb-1 font-semibold group-hover:text-primary">{phase.name}</h3>
                <p className="mb-3 line-clamp-2 text-muted-foreground text-sm">
                  {phase.description}
                </p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{phaseProblemsCount} problems</span>
                  <span className="font-mono">
                    {phase.targetRatingStart}→{phase.targetRatingEnd}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-bold text-2xl md:text-3xl">Track Your Journey</h2>
          <p className="text-muted-foreground">
            Everything you need to stay organized and motivated
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<Target className="h-8 w-8" />}
            title="Progress Tracking"
            description="Mark problems as solved, attempting, revisit, or skipped. See your progress at a glance."
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Stats Dashboard"
            description="Visualize your progress with detailed statistics and breakdowns by phase."
          />
          <FeatureCard
            icon={<Heart className="h-8 w-8" />}
            title="Save Favorites"
            description="Bookmark problems you want to revisit. Build your personal problem collection."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="rounded-2xl bg-linear-to-r from-primary/10 to-primary/5 p-8 text-center md:p-12">
          <h2 className="mb-4 font-bold text-2xl md:text-3xl">Ready to Level Up?</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Start your journey from 800 to Candidate Master. The order is crucial - each problem
            builds on the previous one.
          </p>
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Start Problem #1
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>
    </main>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  value: string | number;
  label: string;
}

function StatCard({ icon, value, label }: StatCardProps) {
  return (
    <div className="flex items-center gap-4 rounded-lg border border-border bg-card p-4">
      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <div className="font-bold font-mono text-2xl">{value}</div>
        <div className="text-muted-foreground text-sm">{label}</div>
      </div>
    </div>
  );
}

interface PhilosophyCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function PhilosophyCard({ icon, title, description }: PhilosophyCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-3 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <h3 className="font-semibold text-lg">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}

interface RuleCardProps {
  icon: React.ReactNode;
  text: string;
}

function RuleCard({ icon, text }: RuleCardProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-4">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <span className="text-sm">{text}</span>
    </div>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-2 font-semibold text-lg">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}
