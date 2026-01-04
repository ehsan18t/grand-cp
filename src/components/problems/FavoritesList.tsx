"use client";

import { Heart, Trash2 } from "lucide-react";
import { useState } from "react";
import { PlatformBadge } from "./PlatformBadge";

interface FavoriteProblem {
  id: number;
  number: number;
  platform: "leetcode" | "codeforces" | "cses" | "atcoder" | "other";
  name: string;
  url: string;
  phaseId: number;
  topic: string;
  isStarred: boolean;
  note: string | null;
  favoritedAt: Date;
}

interface FavoritesListProps {
  favorites: FavoriteProblem[];
}

export function FavoritesList({ favorites: initialFavorites }: FavoritesListProps) {
  const [favorites, setFavorites] = useState(initialFavorites);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = async (problemId: number) => {
    setRemovingId(problemId);

    try {
      const res = await fetch(`/api/favorites?problemId=${problemId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.id !== problemId));
      }
    } catch (error) {
      console.error("Failed to remove favorite:", error);
    } finally {
      setRemovingId(null);
    }
  };

  if (favorites.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">All favorites have been removed.</p>
      </div>
    );
  }

  // Group by phase
  const byPhase = favorites.reduce(
    (acc, fav) => {
      if (!acc[fav.phaseId]) acc[fav.phaseId] = [];
      acc[fav.phaseId].push(fav);
      return acc;
    },
    {} as Record<number, FavoriteProblem[]>,
  );

  return (
    <div className="space-y-6">
      {Object.entries(byPhase)
        .sort(([a], [b]) => Number(a) - Number(b))
        .map(([phaseId, phaseProblems]) => (
          <div key={phaseId}>
            <h2 className="mb-3 font-semibold text-lg text-muted-foreground">Phase {phaseId}</h2>
            <div className="space-y-2">
              {phaseProblems.map((problem) => (
                <div
                  key={problem.id}
                  className="group flex items-center gap-4 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30"
                >
                  <div className="w-12 shrink-0 font-medium font-mono text-muted-foreground text-sm">
                    #{problem.number}
                  </div>

                  <PlatformBadge platform={problem.platform} size="md" />

                  <div className="min-w-0 flex-1">
                    <a
                      href={problem.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium hover:text-primary hover:underline"
                    >
                      {problem.name}
                    </a>
                    <div className="text-muted-foreground text-sm">{problem.topic}</div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemove(problem.id)}
                    disabled={removingId === problem.id}
                    className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 group-hover:opacity-100"
                    aria-label="Remove from favorites"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
