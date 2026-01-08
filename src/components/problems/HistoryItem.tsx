"use client";

import { ArrowRight } from "lucide-react";
import { memo } from "react";
import type { HistoryEntry } from "@/types/domain";
import { PlatformBadge } from "./PlatformBadge";
import { StatusBadge } from "./StatusBadge";

interface HistoryItemProps {
  entry: HistoryEntry;
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour !== 1 ? "s" : ""} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek !== 1 ? "s" : ""} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth !== 1 ? "s" : ""} ago`;

  return date.toLocaleDateString();
}

function formatAbsoluteTime(date: Date): string {
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function HistoryItemBase({ entry }: HistoryItemProps) {
  const fromStatus = entry.fromStatus ?? "untouched";

  return (
    <div className="group flex flex-col gap-3 rounded-lg border border-border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm sm:flex-row sm:items-center sm:gap-4">
      {/* Timeline dot + timestamp */}
      <div className="flex items-center gap-3 sm:w-32 sm:flex-col sm:items-start sm:gap-1">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-primary" />
          <span
            className="text-muted-foreground text-sm"
            title={formatAbsoluteTime(entry.changedAt)}
          >
            {formatRelativeTime(entry.changedAt)}
          </span>
        </div>
      </div>

      {/* Problem info */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="w-12 shrink-0 font-mono text-muted-foreground text-sm">
          #{entry.problemNumber}
        </div>
        <PlatformBadge platform={entry.platform} size="sm" />
        <a
          href={entry.problemUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="min-w-0 truncate font-medium hover:text-primary hover:underline"
        >
          {entry.problemName}
        </a>
      </div>

      {/* Status transition */}
      <div className="flex shrink-0 items-center gap-2">
        <StatusBadge status={fromStatus} size="sm" />
        <ArrowRight className="h-4 w-4 text-muted-foreground" />
        <StatusBadge status={entry.toStatus} size="sm" />
      </div>
    </div>
  );
}

/**
 * Memoized HistoryItem - prevents unnecessary re-renders in lists.
 */
export const HistoryItem = memo(HistoryItemBase);
HistoryItem.displayName = "HistoryItem";
