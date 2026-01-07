"use client";

/**
 * Favorites Page Content - Client component that reads favorites from the app store.
 */

import { Heart } from "lucide-react";
import Link from "next/link";
import { FavoritesList } from "@/components/problems/FavoritesList";
import { useAppStore } from "@/stores/app-store";

export function FavoritesPageContent() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const getFavoriteProblems = useAppStore((s) => s.getFavoriteProblems);

  const favorites = getFavoriteProblems();

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-destructive" />
          <div>
            <h1 className="font-bold text-3xl">Your Favorites</h1>
            <p className="text-muted-foreground">
              Problems you've marked as favorites for quick access
            </p>
          </div>
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-semibold text-xl">Sign in to save favorites</h2>
          <p className="mb-4 text-muted-foreground">
            Create an account to save problems to your favorites list and track your progress.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-semibold text-xl">No favorites yet</h2>
          <p className="mb-4 text-muted-foreground">
            Start adding problems to your favorites by clicking the heart icon on any problem card.
          </p>
          <Link
            href="/problems"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Problems
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-muted-foreground text-sm">
            {favorites.length} problem{favorites.length !== 1 ? "s" : ""} saved
          </div>
          <FavoritesList favorites={favorites} />
        </>
      )}
    </main>
  );
}
