"use client";

import { Filter } from "lucide-react";
import { tv } from "tailwind-variants";
import type { Platform } from "@/db/schema";
import { cn } from "@/lib/utils";

const filterVariants = tv({
  slots: {
    root: "flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center",
    label: "flex items-center gap-1.5 text-muted-foreground text-sm",
    // Horizontal scroll on mobile to prevent awkward wrapping
    buttonGroup: [
      "flex gap-1 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0",
      // Hide scrollbar but keep functionality
      "scrollbar-none",
    ],
    button: [
      "shrink-0 rounded-md border border-border px-3 py-1.5 font-medium text-sm",
      "transition-colors duration-150",
      "hover:border-primary/50 hover:bg-primary/5",
      // Larger touch target on mobile
      "min-h-[36px] sm:min-h-0",
    ],
    buttonActive: "border-primary bg-primary/10 text-primary",
  },
});

export type PlatformFilter = Platform | "all";

const PLATFORM_OPTIONS: { value: PlatformFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "leetcode", label: "LeetCode" },
  { value: "codeforces", label: "Codeforces" },
  { value: "cses", label: "CSES" },
  { value: "atcoder", label: "AtCoder" },
];

export interface PlatformFilterProps {
  value: PlatformFilter;
  onChange: (value: PlatformFilter) => void;
  className?: string;
}

export function PlatformFilter({ value, onChange, className }: PlatformFilterProps) {
  const styles = filterVariants();

  return (
    <div className={cn(styles.root(), className)}>
      <span className={styles.label()}>
        <Filter className="h-4 w-4" />
        Platform
      </span>
      <div className={styles.buttonGroup()} style={{ scrollbarWidth: "none" }}>
        {PLATFORM_OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(styles.button(), value === option.value && styles.buttonActive())}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
