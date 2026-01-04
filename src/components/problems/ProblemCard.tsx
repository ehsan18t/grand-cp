"use client";

import { ExternalLink, Star } from "lucide-react";
import { forwardRef, useState } from "react";
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
  problem: ProblemData;
  status?: StatusValue;
  onStatusChange?: (problemNumber: number, status: StatusValue) => void;
  showStatus?: boolean;
  className?: string;
}

export const ProblemCard = forwardRef<HTMLDivElement, ProblemCardProps>(function ProblemCard(
  { problem, status = "untouched", onStatusChange, showStatus = true, compact, className },
  ref,
) {
  const [currentStatus, setCurrentStatus] = useState<StatusValue>(status);
  const styles = problemCardVariants({ compact });

  const handleStatusChange = (newStatus: StatusValue) => {
    setCurrentStatus(newStatus);
    onStatusChange?.(problem.number, newStatus);
  };

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
