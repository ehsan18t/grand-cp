"use client";

/**
 * Favorites Page Content - Client component that reads favorites from the app store.
 */

import { Heart } from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { LoginButton } from "@/components/auth/LoginButton";
import { FavoritesList } from "@/components/problems/FavoritesList";
import {
  type PlatformFilter,
  ProblemFilters,
  type StatusFilter,
} from "@/components/problems/ProblemFilters";
import { useFuzzySearch } from "@/hooks";
import { useAppStore } from "@/stores/app-store";
import type { FavoriteProblem } from "@/types/domain";

export function FavoritesPageContent() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const getFavoriteProblems = useAppStore((s) => s.getFavoriteProblems);

  const favorites = getFavoriteProblems();

  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState<PlatformFilter>("all");
  const [status, setStatus] = useState<StatusFilter>("all");

  const getSearchableText = useCallback(
    (fav: FavoriteProblem) =>
      `${fav.platform}\n${fav.name}\n${fav.topic ?? ""}\n${fav.note ?? ""}\n${fav.number}`.toLowerCase(),
    [],
  );

  const { search: fuzzySearch } = useFuzzySearch<FavoriteProblem>({
    items: favorites,
    getSearchableText,
  });

  const trimmedSearch = search.trim();

  const filteredFavorites = useMemo(() => {
    const base = trimmedSearch ? fuzzySearch(trimmedSearch) : favorites;

    return base.filter((fav) => {
      if (platform !== "all" && fav.platform !== platform) return false;
      if (status !== "all" && fav.userStatus !== status) return false;
      return true;
    });
  }, [favorites, fuzzySearch, platform, status, trimmedSearch]);

  const hasActiveFilters = trimmedSearch !== "" || platform !== "all" || status !== "all";

  const resetFilters = useCallback(() => {
    setSearch("");
    setPlatform("all");
    setStatus("all");
  }, []);

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
          <LoginButton className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90">
            Sign In
          </LoginButton>
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
          <div className="mb-6 space-y-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-muted-foreground text-sm">
                {favorites.length} problem{favorites.length !== 1 ? "s" : ""} saved
                {hasActiveFilters && (
                  <span className="ml-2 text-primary">
                    {filteredFavorites.length} showing after filters
                  </span>
                )}
              </div>

              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="inline-flex w-fit items-center justify-center rounded-full border border-border px-3 py-1.5 font-medium text-muted-foreground text-xs transition-colors hover:border-primary/60 hover:text-foreground"
                >
                  Clear filters
                </button>
              )}
            </div>

            <ProblemFilters
              search={search}
              onSearchChange={setSearch}
              platform={platform}
              onPlatformChange={setPlatform}
              status={status}
              onStatusChange={setStatus}
              isGuest={false}
              showFavoriteFilter={false}
            />
          </div>

          {filteredFavorites.length === 0 ? (
            <div className="rounded-lg border border-border bg-card p-6 text-center text-muted-foreground text-sm">
              <p>No favorites match your filters.</p>
              {hasActiveFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-2 text-primary transition-colors hover:text-primary/80"
                >
                  Reset filters
                </button>
              )}
            </div>
          ) : (
            <FavoritesList favorites={filteredFavorites} />
          )}
        </>
      )}
    </main>
  );
}
