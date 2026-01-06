"use client";

import { Clock, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import { type HistoryEntry, HistoryItem } from "./HistoryItem";
import type { StatusValue } from "./StatusBadge";

type FilterValue = "all" | StatusValue;
type PlatformFilterValue = "all" | "leetcode" | "codeforces" | "cses" | "atcoder" | "other";

interface HistoryListProps {
  entries: HistoryEntry[];
}

const statusFilterOptions: { value: FilterValue; label: string }[] = [
  { value: "all", label: "All Statuses" },
  { value: "solved", label: "Solved" },
  { value: "attempting", label: "Attempting" },
  { value: "revisit", label: "Revisit" },
  { value: "skipped", label: "Skipped" },
  { value: "untouched", label: "Untouched" },
];

const platformFilterOptions: { value: PlatformFilterValue; label: string }[] = [
  { value: "all", label: "All Platforms" },
  { value: "leetcode", label: "LeetCode" },
  { value: "codeforces", label: "Codeforces" },
  { value: "cses", label: "CSES" },
  { value: "atcoder", label: "AtCoder" },
  { value: "other", label: "Other" },
];

export function HistoryList({ entries: initialEntries }: HistoryListProps) {
  const [statusFilter, setStatusFilter] = useState<FilterValue>("all");
  const [platformFilter, setPlatformFilter] = useState<PlatformFilterValue>("all");

  const filteredEntries = useMemo(() => {
    return initialEntries.filter((entry) => {
      // Filter by status (toStatus)
      if (statusFilter !== "all" && entry.toStatus !== statusFilter) {
        return false;
      }
      // Filter by platform
      if (platformFilter !== "all" && entry.platform !== platformFilter) {
        return false;
      }
      return true;
    });
  }, [initialEntries, statusFilter, platformFilter]);

  // Group entries by date for better visual organization
  const groupedEntries = useMemo(() => {
    const groups: { date: string; entries: HistoryEntry[] }[] = [];
    let currentDate = "";

    for (const entry of filteredEntries) {
      const entryDate = entry.changedAt.toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      if (entryDate !== currentDate) {
        currentDate = entryDate;
        groups.push({ date: entryDate, entries: [entry] });
      } else {
        groups[groups.length - 1].entries.push(entry);
      }
    }

    return groups;
  }, [filteredEntries]);

  if (initialEntries.length === 0) {
    return (
      <div className="rounded-lg border border-border bg-card p-8 text-center">
        <Clock className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
        <h2 className="mb-2 font-semibold text-xl">No history yet</h2>
        <p className="text-muted-foreground">
          Start solving problems to see your progress history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <Filter className="h-4 w-4 text-muted-foreground" />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as FilterValue)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {statusFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value as PlatformFilterValue)}
          className="rounded-lg border border-border bg-card px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          {platformFilterOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <span className="text-muted-foreground text-sm">
          {filteredEntries.length} of {initialEntries.length} entries
        </span>
      </div>

      {/* Timeline */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-6 text-center">
          <p className="text-muted-foreground">No entries match your filters.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {groupedEntries.map((group) => (
            <div key={group.date}>
              <h3 className="mb-3 font-medium text-muted-foreground text-sm">{group.date}</h3>
              <div className="space-y-2">
                {group.entries.map((entry) => (
                  <HistoryItem key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
