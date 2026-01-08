"use client";

import { Heart, Star } from "lucide-react";
import { forwardRef, memo, useCallback, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { LoginPrompt } from "@/components/auth";
import { useToast } from "@/components/ui";
import type { ProblemData } from "@/data/problems";
import { cn } from "@/lib/utils";
import { useAppStore, useIsFavorite, useIsPending, useStatus } from "@/stores/app-store";
import type { ProblemStatus } from "@/types/domain";
import { PlatformBadge } from "./PlatformBadge";
import { StatusSelect } from "./StatusSelect";

const problemCardVariants = tv({
  slots: {
    root: [
      // Keep the original desktop look; only stack on mobile
      "group flex flex-col gap-3 rounded-lg border border-border bg-card p-4",
      "transition-all duration-200",
      "hover:border-primary/30 hover:shadow-sm",
      "sm:flex-row sm:items-center sm:gap-4",
    ],
    // Top row (mobile) contains number + platform + content
    topRow: "flex min-w-0 flex-1 items-center gap-2.5",
    number: "w-fit shrink-0 font-mono font-medium text-muted-foreground text-sm",
    platformWrapper: "shrink-0",
    content: "min-w-0 flex-1",
    title: "flex items-center gap-2",
    // Mobile: allow wrapping so it doesn't crop; Desktop: keep truncation
    titleText: "min-w-0 font-medium break-words sm:truncate",
    starIcon: "h-4 w-4 shrink-0 fill-warning text-warning",
    note: "truncate text-muted-foreground text-sm",
    divider: "hidden",
    // Actions: same visual style as before; just flow to a second row on mobile
    actions: "flex shrink-0 items-center gap-3 justify-between",
    favoriteButton: [
      "flex h-8 w-8 items-center justify-center rounded-md",
      "text-muted-foreground transition-all",
      "hover:bg-destructive/10 hover:text-destructive",
    ],
    favoriteButtonActive: "text-destructive",
    guestFavoriteButton: [
      "flex h-8 w-8 items-center justify-center rounded-md",
      "text-muted-foreground/50 transition-all",
      "hover:bg-destructive/10 hover:text-destructive/70",
      "cursor-pointer",
    ],
  },
  variants: {
    compact: {
      true: {
        root: "p-3 gap-2 sm:gap-3",
        number: "w-10 text-xs",
        content: "",
        note: "hidden",
        divider: "block h-px w-full bg-border sm:h-auto sm:w-px sm:self-stretch",
      },
    },
  },
  defaultVariants: {
    compact: false,
  },
});

export interface ProblemCardProps extends VariantProps<typeof problemCardVariants> {
  problem: ProblemData & { id?: number };
  initialStatus?: ProblemStatus;
  initialFavorite?: boolean;
  /** Highlight ranges for the title (0-based, end-exclusive) */
  highlightTitleRanges?: Array<[number, number]>;
  /** Highlight ranges for the note (0-based, end-exclusive) */
  highlightNoteRanges?: Array<[number, number]>;
  onStatusChange?: (problemNumber: number, status: ProblemStatus) => void;
  onFavoriteChange?: (problemId: number, isFavorite: boolean) => void;
  showStatus?: boolean;
  showFavorite?: boolean;
  /** When true, shows guest-mode controls that prompt for login */
  isGuest?: boolean;
  className?: string;
}

const ProblemCardBase = forwardRef<HTMLDivElement, ProblemCardProps>(function ProblemCard(
  {
    problem,
    initialStatus = "untouched",
    initialFavorite = false,
    highlightTitleRanges,
    highlightNoteRanges,
    onStatusChange,
    onFavoriteChange,
    showStatus = true,
    showFavorite = true,
    isGuest = false,
    compact,
    className,
  },
  ref,
) {
  // Use store state for status and favorite
  const storeStatus = useStatus(problem.number);
  const storeIsFavorite = useIsFavorite(problem.id ?? 0);
  const isFavoritePending = useIsPending(`favorite-${problem.id}`);
  const isStatusPending = useIsPending(`status-${problem.number}`);

  // Use store state if available, fall back to initial props
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const currentStatus = isAuthenticated ? storeStatus : initialStatus;
  const isFavorite = isAuthenticated ? storeIsFavorite : initialFavorite;

  // Store actions
  const storeSetStatus = useAppStore((s) => s.setStatus);
  const storeToggleFavorite = useAppStore((s) => s.toggleFavorite);

  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const { addToast } = useToast();
  const styles = problemCardVariants({ compact });

  const renderHighlightedText = useCallback((text: string, ranges?: Array<[number, number]>) => {
    if (!ranges || ranges.length === 0) return text;

    const sorted = [...ranges].filter(([start, end]) => start < end).sort(([a], [b]) => a - b);

    // Merge overlapping ranges
    const merged: Array<[number, number]> = [];
    for (const [start, end] of sorted) {
      const last = merged[merged.length - 1];
      if (!last) {
        merged.push([start, end]);
        continue;
      }
      if (start <= last[1]) {
        last[1] = Math.max(last[1], end);
      } else {
        merged.push([start, end]);
      }
    }

    const nodes: React.ReactNode[] = [];
    let cursor = 0;

    for (const [start, end] of merged) {
      const safeStart = Math.max(0, Math.min(start, text.length));
      const safeEnd = Math.max(0, Math.min(end, text.length));

      if (safeStart > cursor) {
        nodes.push(text.slice(cursor, safeStart));
      }

      if (safeEnd > safeStart) {
        nodes.push(
          <span
            key={`${safeStart}-${safeEnd}`}
            className="rounded-sm bg-primary/20 text-foreground"
          >
            {text.slice(safeStart, safeEnd)}
          </span>,
        );
      }

      cursor = safeEnd;
    }

    if (cursor < text.length) {
      nodes.push(text.slice(cursor));
    }

    return nodes;
  }, []);

  const showToast = useCallback(
    (message: string, type: "error" | "success") => {
      addToast({
        title: type === "error" ? "Error" : "Success",
        description: message,
        variant: type === "error" ? "destructive" : "default",
      });
    },
    [addToast],
  );

  const handleStatusChange = useCallback(
    async (newStatus: ProblemStatus) => {
      if (!problem.id || isStatusPending) return;

      // Use store action which handles optimistic update and rollback
      const success = await storeSetStatus(problem.number, problem.id, newStatus, showToast);
      if (success) {
        onStatusChange?.(problem.number, newStatus);
      }
    },
    [problem.number, problem.id, isStatusPending, storeSetStatus, showToast, onStatusChange],
  );

  const handleFavoriteToggle = useCallback(async () => {
    if (!problem.id || isFavoritePending) return;

    // Use store action which handles optimistic update and rollback
    const success = await storeToggleFavorite(problem.id, showToast);
    if (success) {
      onFavoriteChange?.(problem.id, !isFavorite);
    }
  }, [problem.id, isFavorite, isFavoritePending, storeToggleFavorite, showToast, onFavoriteChange]);

  const handleGuestFavoriteClick = () => {
    setShowLoginPrompt(true);
  };

  return (
    <>
      <div ref={ref} className={cn(styles.root(), className)}>
        {/* Top row: number, platform, content */}
        <div className={styles.topRow()}>
          {/* Problem number */}
          <div className={styles.number()}>#{problem.number}</div>

          {/* Platform badge */}
          <div className={styles.platformWrapper()}>
            <PlatformBadge platform={problem.platform} size={compact ? "sm" : "md"} />
          </div>

          {/* Problem content */}
          <div className={styles.content()}>
            <div className={styles.title()}>
              <a
                href={problem.url}
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  styles.titleText(),
                  "hover:text-primary hover:underline",
                  // Keep link text from stretching the row on small screens
                  "block",
                )}
                aria-label={`Open ${problem.name} on ${problem.platform}`}
              >
                {renderHighlightedText(problem.name, highlightTitleRanges)}
              </a>
              {problem.isStarred && <Star className={styles.starIcon()} />}
            </div>
            {problem.note && !compact && (
              <div className={styles.note()}>
                {renderHighlightedText(problem.note, highlightNoteRanges)}
              </div>
            )}
          </div>
        </div>

        {compact ? (
          <div className={styles.divider()} aria-hidden="true" />
        ) : (
          <div className="h-px w-full bg-border sm:hidden" aria-hidden="true" />
        )}

        {/* Actions */}
        <div className={styles.actions()}>
          {showStatus && (
            <StatusSelect
              value={currentStatus}
              onChange={handleStatusChange}
              isGuest={isGuest}
              disabled={isStatusPending}
            />
          )}

          {showFavorite &&
            problem.id &&
            (isGuest ? (
              <button
                type="button"
                onClick={handleGuestFavoriteClick}
                className={styles.guestFavoriteButton()}
                aria-label="Sign in to save favorites"
                title="Sign in to save favorites"
              >
                <Heart className="h-4 w-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleFavoriteToggle}
                disabled={isFavoritePending}
                className={cn(styles.favoriteButton(), isFavorite && styles.favoriteButtonActive())}
                aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                <Heart className={cn("h-4 w-4", isFavorite && "fill-current")} />
              </button>
            ))}
        </div>
      </div>

      {/* Login prompt for guest favorite action */}
      <LoginPrompt
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        feature="favorite"
      />
    </>
  );
});

/**
 * Memoized ProblemCard - prevents unnecessary re-renders in lists.
 * Only re-renders when props change.
 */
export const ProblemCard = memo(ProblemCardBase);
ProblemCard.displayName = "ProblemCard";

export { problemCardVariants };
