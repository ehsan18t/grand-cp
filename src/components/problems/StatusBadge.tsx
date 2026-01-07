"use client";

import { tv, type VariantProps } from "tailwind-variants";
import type { ProblemStatus } from "@/types/domain";

const statusBadgeVariants = tv({
  base: "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  variants: {
    status: {
      untouched: "bg-status-untouched text-status-untouched-foreground",
      attempting: "bg-status-attempting text-status-attempting-foreground",
      solved: "bg-status-solved text-status-solved-foreground",
      revisit: "bg-status-revisit text-status-revisit-foreground",
      skipped: "bg-status-skipped text-status-skipped-foreground",
    },
    size: {
      sm: "px-2 py-0.5 text-[10px]",
      md: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    },
  },
  defaultVariants: {
    status: "untouched",
    size: "md",
  },
});

const statusLabels: Record<ProblemStatus, string> = {
  untouched: "Untouched",
  attempting: "Attempting",
  solved: "Solved",
  revisit: "Revisit",
  skipped: "Skipped",
};

/** @deprecated Use ProblemStatus from @/types/domain instead */
export type StatusValue = ProblemStatus;

export interface StatusBadgeProps extends VariantProps<typeof statusBadgeVariants> {
  className?: string;
}

export function StatusBadge({ status = "untouched", size, className }: StatusBadgeProps) {
  return (
    <span className={statusBadgeVariants({ status, size, className })}>
      {statusLabels[status ?? "untouched"]}
    </span>
  );
}

export { statusBadgeVariants, statusLabels };
