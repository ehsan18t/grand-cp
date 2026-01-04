import { ArrowRight, BarChart3, BookOpen, Target, Trophy, Users } from "lucide-react";
import Link from "next/link";
import { phases } from "@/data/phases";
import { problems } from "@/data/problems";

export default function HomePage() {
  const totalProblems = problems.length;
  const totalPhases = phases.length;

  return (
    <main className="container mx-auto px-4">
      {/* Hero Section */}
      <section className="py-16 text-center md:py-24">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-4 font-bold text-4xl md:text-6xl">
            Master <span className="text-primary">Competitive Programming</span>
          </h1>
          <p className="mb-8 text-lg text-muted-foreground md:text-xl">
            A curated collection of 655+ problems to take you from beginner to advanced. Track your
            progress, build consistency, and reach your rating goals.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/problems"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              Start Practicing
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link
              href="/stats"
              className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-accent"
            >
              View Your Stats
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
          <StatCard icon={<Trophy className="h-6 w-6" />} value="2400+" label="Target Rating" />
          <StatCard icon={<Users className="h-6 w-6" />} value="Free" label="For Everyone" />
        </div>
      </section>

      {/* Phases Overview */}
      <section className="py-12">
        <div className="mb-8 text-center">
          <h2 className="mb-2 font-bold text-2xl md:text-3xl">Structured Learning Path</h2>
          <p className="text-muted-foreground">
            Progress through carefully designed phases, each focusing on specific skills and rating
            targets
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {phases.map((phase) => {
            const phaseProblems = problems.filter((p) => p.phaseId === phase.id);
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
                  <span className="text-muted-foreground">{phaseProblems.length} problems</span>
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
            description="Mark problems as solved, attempting, or skipped. See your progress at a glance."
          />
          <FeatureCard
            icon={<BarChart3 className="h-8 w-8" />}
            title="Stats Dashboard"
            description="Visualize your progress with detailed statistics and breakdowns by phase."
          />
          <FeatureCard
            icon={<Users className="h-8 w-8" />}
            title="Public Profiles"
            description="Share your progress with friends and compete to improve together."
          />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="rounded-2xl bg-gradient-to-r from-primary/10 to-primary/5 p-8 text-center md:p-12">
          <h2 className="mb-4 font-bold text-2xl md:text-3xl">Ready to Level Up?</h2>
          <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
            Join the journey and start solving problems today. Track your progress and reach your
            competitive programming goals.
          </p>
          <Link
            href="/problems"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Get Started
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
