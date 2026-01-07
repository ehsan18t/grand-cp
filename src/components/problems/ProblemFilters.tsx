"use client";

import {
  Circle,
  CircleCheck,
  CircleDot,
  Filter,
  Heart,
  RotateCcw,
  Search,
  SkipForward,
  X,
} from "lucide-react";
import { forwardRef, useCallback, useRef } from "react";
import { tv } from "tailwind-variants";
import type { Platform } from "@/db/schema";
import { cn } from "@/lib/utils";
import type { ProblemStatus } from "@/types/domain";

const filterVariants = tv({
  slots: {
    root: "space-y-4",
    searchWrapper: "relative",
    searchIcon: "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
    searchInput: [
      "w-full rounded-lg border border-border bg-background pl-10 pr-10 py-2.5",
      "text-sm placeholder:text-muted-foreground",
      "focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary",
      "transition-colors",
    ],
    clearButton: [
      "absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded",
      "text-muted-foreground hover:text-foreground",
      "transition-colors",
    ],
    filterRow: "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
    filterGroup: "flex flex-col gap-1.5 sm:flex-row sm:items-center",
    label: "flex items-center gap-1.5 text-muted-foreground text-sm shrink-0",
    buttonGroup: ["flex gap-1 overflow-x-auto pb-1 sm:overflow-visible sm:pb-0", "scrollbar-none"],
    button: [
      "shrink-0 rounded-md border border-border px-2.5 py-1.5 font-medium text-xs",
      "transition-colors duration-150",
      "hover:border-primary/50 hover:bg-primary/5",
      "min-h-[32px] flex items-center gap-1.5",
    ],
    buttonActive: "border-primary bg-primary/10 text-primary",
    divider: "hidden sm:block h-6 w-px bg-border mx-2",
    activeFilters: "flex items-center gap-2 flex-wrap",
    activeTag: [
      "inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1",
      "text-primary text-xs font-medium",
    ],
    clearAll: [
      "text-muted-foreground text-xs hover:text-foreground",
      "transition-colors cursor-pointer",
    ],
  },
});

export type PlatformFilter = Platform | "all";
export type StatusFilter = ProblemStatus | "all";
export type FavoriteFilter = "all" | "favorites";

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "leetcode", label: "LC" },
  { value: "codeforces", label: "CF" },
  { value: "cses", label: "CSES" },
  { value: "atcoder", label: "AC" },
];

const STATUS_OPTIONS: {
  value: StatusFilter;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "all", label: "All", icon: null },
  { value: "solved", label: "Solved", icon: <CircleCheck className="h-3.5 w-3.5" /> },
  { value: "attempting", label: "Attempting", icon: <CircleDot className="h-3.5 w-3.5" /> },
  { value: "revisit", label: "Revisit", icon: <RotateCcw className="h-3.5 w-3.5" /> },
  { value: "skipped", label: "Skipped", icon: <SkipForward className="h-3.5 w-3.5" /> },
  { value: "untouched", label: "Untouched", icon: <Circle className="h-3.5 w-3.5" /> },
];

export interface ProblemFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  platform: PlatformFilter;
  onPlatformChange: (value: PlatformFilter) => void;
  status: StatusFilter;
  onStatusChange: (value: StatusFilter) => void;
  favorite: FavoriteFilter;
  onFavoriteChange: (value: FavoriteFilter) => void;
  /** Hide status/favorite filters for guests */
  isGuest?: boolean;
  className?: string;
}

export const ProblemFilters = forwardRef<HTMLDivElement, ProblemFiltersProps>(
  function ProblemFilters(
    {
      search,
      onSearchChange,
      platform,
      onPlatformChange,
      status,
      onStatusChange,
      favorite,
      onFavoriteChange,
      isGuest = false,
      className,
    },
    ref,
  ) {
    const styles = filterVariants();
    const inputRef = useRef<HTMLInputElement>(null);

    const hasActiveFilters =
      platform !== "all" || status !== "all" || favorite !== "all" || search !== "";

    const handleClearAll = useCallback(() => {
      onSearchChange("");
      onPlatformChange("all");
      onStatusChange("all");
      onFavoriteChange("all");
      inputRef.current?.focus();
    }, [onSearchChange, onPlatformChange, onStatusChange, onFavoriteChange]);

    return (
      <div ref={ref} className={cn(styles.root(), className)}>
        {/* Search */}
        <div className={styles.searchWrapper()}>
          <Search className={styles.searchIcon()} />
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search problems by name..."
            className={styles.searchInput()}
          />
          {search && (
            <button
              type="button"
              onClick={() => onSearchChange("")}
              className={styles.clearButton()}
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Filter Row */}
        <div className={styles.filterRow()}>
          {/* Platform Filter */}
          <div className={styles.filterGroup()}>
            <span className={styles.label()}>
              <Filter className="h-3.5 w-3.5" />
              Platform
            </span>
            <div className={styles.buttonGroup()} style={{ scrollbarWidth: "none" }}>
              {PLATFORM_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onPlatformChange(option.value)}
                  className={cn(
                    styles.button(),
                    platform === option.value && styles.buttonActive(),
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Status Filter - only show for authenticated users */}
          {!isGuest && (
            <>
              <div className={styles.divider()} />
              <div className={styles.filterGroup()}>
                <span className={styles.label()}>Status</span>
                <div className={styles.buttonGroup()} style={{ scrollbarWidth: "none" }}>
                  {STATUS_OPTIONS.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => onStatusChange(option.value)}
                      className={cn(
                        styles.button(),
                        status === option.value && styles.buttonActive(),
                      )}
                    >
                      {option.icon}
                      {option.label}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Favorite Filter - only show for authenticated users */}
          {!isGuest && (
            <>
              <div className={styles.divider()} />
              <div className={styles.filterGroup()}>
                <div className={styles.buttonGroup()}>
                  <button
                    type="button"
                    onClick={() => onFavoriteChange(favorite === "favorites" ? "all" : "favorites")}
                    className={cn(
                      styles.button(),
                      favorite === "favorites" && styles.buttonActive(),
                    )}
                  >
                    <Heart
                      className={cn("h-3.5 w-3.5", favorite === "favorites" && "fill-current")}
                    />
                    Favorites Only
                  </button>
                </div>
              </div>
            </>
          )}

          {/* Clear All */}
          {hasActiveFilters && (
            <>
              <div className={styles.divider()} />
              <button type="button" onClick={handleClearAll} className={styles.clearAll()}>
                Clear all
              </button>
            </>
          )}
        </div>
      </div>
    );
  },
);

ProblemFilters.displayName = "ProblemFilters";

export { filterVariants as problemFiltersVariants };
