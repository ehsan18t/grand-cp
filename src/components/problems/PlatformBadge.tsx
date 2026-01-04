"use client";

import { tv, type VariantProps } from "tailwind-variants";

const platformBadgeVariants = tv({
  base: "inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
  variants: {
    platform: {
      leetcode: "bg-leetcode text-leetcode-foreground",
      codeforces: "bg-codeforces text-codeforces-foreground",
      cses: "bg-cses text-cses-foreground",
      atcoder: "bg-atcoder text-atcoder-foreground",
      other: "bg-muted text-muted-foreground",
    },
    size: {
      sm: "px-2 py-0.5 text-[10px]",
      md: "px-2.5 py-0.5 text-xs",
      lg: "px-3 py-1 text-sm",
    },
  },
  defaultVariants: {
    platform: "other",
    size: "md",
  },
});

const platformLabels: Record<string, string> = {
  leetcode: "LeetCode",
  codeforces: "Codeforces",
  cses: "CSES",
  atcoder: "AtCoder",
  other: "Other",
};

export interface PlatformBadgeProps extends VariantProps<typeof platformBadgeVariants> {
  className?: string;
}

export function PlatformBadge({ platform = "other", size, className }: PlatformBadgeProps) {
  return (
    <span className={platformBadgeVariants({ platform, size, className })}>
      {platformLabels[platform ?? "other"]}
    </span>
  );
}

export { platformBadgeVariants };
