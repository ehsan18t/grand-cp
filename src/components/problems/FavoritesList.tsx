"use client";

import { Heart } from "lucide-react";
import { useState } from "react";
import type { FavoriteProblem } from "@/types/domain";
import { ProblemCard } from "./ProblemCard";

interface FavoritesListProps {
  favorites: FavoriteProblem[];
}

export function FavoritesList({ favorites: initialFavorites }: FavoritesListProps) {
  const [favorites, setFavorites] = useState(initialFavorites);

  const handleFavoriteChange = (problemId: number, isFavorite: boolean) => {
    if (!isFavorite) {
      setFavorites((prev) => prev.filter((f) => f.id !== problemId));
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
                <ProblemCard
                  key={problem.id}
                  problem={problem}
                  initialStatus={problem.userStatus}
                  initialFavorite
                  onFavoriteChange={handleFavoriteChange}
                  showStatus
                  showFavorite
                />
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}
