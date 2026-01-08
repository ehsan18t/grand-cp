"use client";

import { AlertTriangle, Home, RefreshCw } from "lucide-react";
import { useEffect } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Global error boundary page.
 * Catches errors in the app and displays a recovery UI.
 */
export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log the error to console for debugging
    console.error("Application error:", error);
  }, [error]);

  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16 text-center">
      {/* Error Visual */}
      <div className="relative mb-8">
        <div className="font-bold text-[100px] text-destructive/10 leading-none sm:text-[140px]">
          Error
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-destructive/10 p-6">
            <AlertTriangle className="h-12 w-12 text-destructive sm:h-16 sm:w-16" />
          </div>
        </div>
      </div>

      {/* Message */}
      <h1 className="mb-3 font-bold text-2xl sm:text-3xl">Something went wrong</h1>
      <p className="mx-auto mb-4 max-w-md text-muted-foreground">
        We encountered an unexpected error. Don't worry, your progress is saved. Try refreshing the
        page or return home.
      </p>

      {/* Error digest for debugging (only in development) */}
      {process.env.NODE_ENV === "development" && error.message && (
        <div className="mx-auto mb-6 max-w-lg rounded-lg bg-muted/50 p-4">
          <p className="font-mono text-muted-foreground text-sm">{error.message}</p>
          {error.digest && (
            <p className="mt-2 font-mono text-muted-foreground/60 text-xs">
              Digest: {error.digest}
            </p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={reset}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <RefreshCw className="h-4 w-4" />
          Try Again
        </button>
        <a
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-muted"
        >
          <Home className="h-4 w-4" />
          Go Home
        </a>
      </div>

      {/* Helpful tip */}
      <p className="mt-8 text-muted-foreground/60 text-sm">
        If this problem persists, try clearing your browser cache or contact support.
      </p>
    </main>
  );
}
