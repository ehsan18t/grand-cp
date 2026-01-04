"use client";

import { ExternalLink, Heart, Star } from "lucide-react";
import { forwardRef, useCallback, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import type { ProblemData } from "@/data/problems";
import { cn } from "@/lib/utils";
import { PlatformBadge } from "./PlatformBadge";
import { StatusSelect, type StatusValue } from "./StatusSelect";

const problemCardVariants = tv({
  slots: {
    root: [
      "group flex items-center gap-4 rounded-lg border border-border bg-card p-4",
      "transition-all duration-200",
      "hover:border-primary/30 hover:shadow-sm",
    ],
    number: "w-12 shrink-0 font-mono font-medium text-muted-foreground text-sm",
    platformWrapper: "shrink-0",
    content: "min-w-0 flex-1",
    title: "flex items-center gap-2",
    titleText: "truncate font-medium",
    starIcon: "h-4 w-4 shrink-0 fill-warning text-warning",
    note: "truncate text-muted-foreground text-sm",
    actions: "flex shrink-0 items-center gap-3",
    favoriteButton: [
      "flex h-8 w-8 items-center justify-center rounded-md",
      "text-muted-foreground transition-all",
      "hover:bg-destructive/10 hover:text-destructive",
    ],
    favoriteButtonActive: "text-destructive",
    externalLink: [
      "flex h-8 w-8 items-center justify-center rounded-md",
      "text-muted-foreground opacity-0 transition-all",
      "hover:bg-muted hover:text-primary",
      "group-hover:opacity-100",
    ],
  },
  variants: {
    compact: {
      true: {
        root: "p-3 gap-3",
        number: "w-10 text-xs",
        content: "",
        note: "hidden",
      },
    },
  },
  defaultVariants: {
    compact: false,
  },
});

export interface ProblemCardProps extends VariantProps<typeof problemCardVariants> {
  problem: ProblemData & { id?: number };
  initialStatus?: StatusValue;
  initialFavorite?: boolean;
  onStatusChange?: (problemNumber: number, status: StatusValue) => void;
  onFavoriteChange?: (problemId: number, isFavorite: boolean) => void;
  showStatus?: boolean;
  showFavorite?: boolean;
  className?: string;
}

export const ProblemCard = forwardRef<HTMLDivElement, ProblemCardProps>(function ProblemCard(
  {
    problem,
    initialStatus = "untouched",
    initialFavorite = false,
    onStatusChange,
    onFavoriteChange,
    showStatus = true,
    showFavorite = true,
    compact,
    className,
  },
  ref,
) {
  const [currentStatus, setCurrentStatus] = useState<StatusValue>(initialStatus);
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isUpdating, setIsUpdating] = useState(false);
  const styles = problemCardVariants({ compact });

  const handleStatusChange = useCallback(
    async (newStatus: StatusValue) => {
      const previousStatus = currentStatus;
      setCurrentStatus(newStatus);

      try {
        const res = await fetch("/api/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            problemNumber: problem.number,
            status: newStatus,
          }),
        });

        if (!res.ok) {
          // Revert on failure
          setCurrentStatus(previousStatus);
        } else {
          onStatusChange?.(problem.number, newStatus);
        }
      } catch {
        setCurrentStatus(previousStatus);
      }
    },
    [currentStatus, problem.number, onStatusChange],
  );

  const handleFavoriteToggle = useCallback(async () => {
    if (!problem.id || isUpdating) return;

    setIsUpdating(true);
    const waseFavorite = isFavorite;
    setIsFavorite(!isFavorite);

    try {
      if (waseFavorite) {
        // Remove from favorites
        const res = await fetch(`/api/favorites?problemId=${problem.id}`, {
          method: "DELETE",
        });
        if (!res.ok) {
          setIsFavorite(waseFavorite);
        } else {
          onFavoriteChange?.(problem.id, false);
        }
      } else {
        // Add to favorites
        const res = await fetch("/api/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ problemId: problem.id }),
        });
        if (!res.ok) {
          setIsFavorite(waseFavorite);
        } else {
          onFavoriteChange?.(problem.id, true);
        }
      }
    } catch {
      setIsFavorite(waseFavorite);
    } finally {
      setIsUpdating(false);
    }
  }, [problem.id, isFavorite, isUpdating, onFavoriteChange]);

  return (
    <div ref={ref} className={cn(styles.root(), className)}>
      {/* Problem number */}
      <div className={styles.number()}>#{problem.number}</div>

      {/* Platform badge */}
      <div className={styles.platformWrapper()}>
        <PlatformBadge platform={problem.platform} size={compact ? "sm" : "md"} />
      </div>

      {/* Problem content */}
      <div className={styles.content()}>
        <div className={styles.title()}>
          <span className={styles.titleText()}>{problem.name}</span>
          {problem.isStarred && <Star className={styles.starIcon()} />}
        </div>
        {problem.note && !compact && <div className={styles.note()}>{problem.note}</div>}
      </div>

      {/* Actions */}
      <div className={styles.actions()}>
        {showStatus && <StatusSelect value={currentStatus} onChange={handleStatusChange} />}

        {showFavorite && problem.id && (
          <button
            type="button"
            onClick={handleFavoriteToggle}
            disabled={isUpdating}
            className={cn(styles.favoriteButton(), isFavorite && styles.favoriteButtonActive())}
            aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
          </button>
        )}

        <a
          href={problem.url}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.externalLink()}
          aria-label={`Open ${problem.name} on ${problem.platform}`}
        >
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
});

ProblemCard.displayName = "ProblemCard";

export { problemCardVariants };
