"use client";

/**
 * History Page Content - Client component that fetches paginated history.
 */

import { ChevronLeft, ChevronRight, Clock } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { HistoryList } from "@/components/problems/HistoryList";
import { Spinner } from "@/components/ui";
import { useAppStore, useHistoryCount } from "@/stores/app-store";
import type { HistoryEntry, Platform, ProblemStatus } from "@/types/domain";

interface HistoryResponse {
  entries: Array<{
    id: number;
    problemId: number;
    problemNumber: number;
    problemName: string;
    problemUrl: string;
    platform: Platform;
    fromStatus: ProblemStatus | null;
    toStatus: ProblemStatus;
    changedAt: string;
  }>;
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasMore: boolean;
}

export function HistoryPageContent() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const historyCount = useHistoryCount();

  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async (pageNum: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/history?page=${pageNum}`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch history");
      }

      const data: HistoryResponse = await res.json();

      // Convert dates
      const entries: HistoryEntry[] = data.entries.map((e) => ({
        ...e,
        changedAt: new Date(e.changedAt),
      }));

      setHistory(entries);
      setPage(data.page);
      setTotalPages(data.totalPages);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error("Failed to fetch history:", err);
      setError("Failed to load history. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch on mount and when page changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchHistory(page);
    }
  }, [isAuthenticated, page, fetchHistory]);

  // Reset to page 1 when historyCount increases (new entry added)
  useEffect(() => {
    if (isAuthenticated && historyCount > totalCount && page === 1) {
      fetchHistory(1);
    }
  }, [historyCount, totalCount, page, isAuthenticated, fetchHistory]);

  if (!isAuthenticated) {
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
      </main>
    );
  }

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

      <div className="mb-6 flex items-center justify-between">
        <span className="text-muted-foreground text-sm">
          {totalCount} status change{totalCount !== 1 ? "s" : ""} recorded
        </span>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1 || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages || isLoading}
              className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner size="lg" tone="primary" label="Loading history" />
        </div>
      ) : error ? (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-8 text-center">
          <p className="text-destructive">{error}</p>
          <button
            type="button"
            onClick={() => fetchHistory(page)}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      ) : (
        <HistoryList entries={history} />
      )}

      {/* Bottom pagination for convenience */}
      {totalPages > 1 && !isLoading && !error && (
        <div className="mt-6 flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <span className="text-sm">
            Page {page} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-border bg-background transition-colors hover:bg-accent disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </main>
  );
}
