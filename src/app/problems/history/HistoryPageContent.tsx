"use client";

/**
 * History Page Content - Client component that reads history from the app store.
 */

import { Clock } from "lucide-react";
import Link from "next/link";
import { HistoryList } from "@/components/problems/HistoryList";
import { useAppStore } from "@/stores/app-store";

export function HistoryPageContent() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const history = useAppStore((s) => s.history);

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-3xl">Status History</h1>
            <p className="text-muted-foreground">Track your progress over time</p>
          </div>
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-semibold text-xl">Sign in to view history</h2>
          <p className="mb-4 text-muted-foreground">
            Create an account to track your problem-solving progress over time.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-muted-foreground text-sm">
            {history.length} status change{history.length !== 1 ? "s" : ""} recorded
          </div>
          <HistoryList entries={history} />
        </>
      )}
    </main>
  );
}
