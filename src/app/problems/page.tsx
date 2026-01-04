import Link from "next/link";
import { phases } from "@/data/phases";

export const metadata = {
  title: "Problems | Grand CP",
  description: "Track your competitive programming progress with 655+ curated problems",
};

export default function ProblemsPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-12 text-center">
        <h1 className="mb-4 font-bold text-4xl">🏆 Competitive Programming Roadmap</h1>
        <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
          From 800 Codeforces Rating to Candidate Master (2200+). 655+ problems organized in 8
          phases.
        </p>
      </header>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {phases.map((phase) => (
          <Link
            key={phase.id}
            href={`/problems/phase/${phase.id}`}
            className="group relative overflow-hidden rounded-xl border border-border bg-card p-6 shadow-sm transition-all duration-300 hover:border-primary/50 hover:shadow-lg"
          >
            <div className="absolute inset-0 bg-linear-to-br from-primary/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

            <div className="relative">
              <div className="mb-3 flex items-center justify-between">
                <span className="font-mono font-semibold text-primary text-sm">
                  Phase {phase.id}
                </span>
                <span className="rounded-full bg-muted px-2 py-0.5 font-mono text-muted-foreground text-xs">
                  {phase.problemStart}-{phase.problemEnd}
                </span>
              </div>

              <h2 className="mb-2 font-semibold text-lg transition-colors group-hover:text-primary">
                {phase.name}
              </h2>

              <p className="mb-4 line-clamp-2 text-muted-foreground text-sm">{phase.description}</p>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Target Rating:</span>
                <span className="font-medium font-mono text-foreground">
                  {phase.targetRatingStart} → {phase.targetRatingEnd}
                </span>
              </div>

              <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: "0%" }}
                />
              </div>
              <p className="mt-1 text-right text-muted-foreground text-xs">0% complete</p>
            </div>
          </Link>
        ))}
      </div>

      <section className="mt-16 rounded-xl border border-border bg-card p-8">
        <h2 className="mb-4 font-bold text-2xl">📚 How to Practice</h2>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 font-semibold text-lg">Golden Rules</h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
              <li>Follow problems serially - order is crucial</li>
              <li>Struggle 30-60 min before seeking hints</li>
              <li>Implement everything - reading is not solving</li>
              <li>Upsolve after every contest</li>
            </ul>
          </div>
          <div>
            <h3 className="mb-2 font-semibold text-lg">Time Guidelines</h3>
            <ul className="list-inside list-disc space-y-1 text-muted-foreground text-sm">
              <li>Easy: 15-20 minutes</li>
              <li>Medium: 30-45 minutes</li>
              <li>Hard: 60-90 minutes</li>
              <li>Very Hard: 2+ hours (over days)</li>
            </ul>
          </div>
        </div>
      </section>
    </main>
  );
}
