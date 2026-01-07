// Re-export domain types for backward compatibility
export type { HistoryEntry, ProblemStatus, ProblemWithUserData } from "@/types/domain";
export { FavoritesList } from "./FavoritesList";
export { HistoryItem } from "./HistoryItem";
export { HistoryList } from "./HistoryList";
export { PhaseProblems } from "./PhaseProblems";
export { PlatformBadge, type PlatformBadgeProps, platformBadgeVariants } from "./PlatformBadge";
export {
  PlatformFilter,
  type PlatformFilter as PlatformFilterValue,
  type PlatformFilterProps,
} from "./PlatformFilter";
export { ProblemCard, type ProblemCardProps, problemCardVariants } from "./ProblemCard";
export {
  type FavoriteFilter,
  ProblemFilters,
  type ProblemFiltersProps,
  problemFiltersVariants,
  type StatusFilter,
} from "./ProblemFilters";
export { ProblemList } from "./ProblemList";
export {
  StatusBadge,
  type StatusBadgeProps,
  statusBadgeVariants,
  statusLabels,
} from "./StatusBadge";
export {
  StatusSelect,
  type StatusSelectProps,
  type StatusValue,
  statusOptions,
} from "./StatusSelect";
