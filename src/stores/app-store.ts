/**
 * Unified App Store - Single source of truth for all application state.
 *
 * Features:
 * - Auth state (synced from better-auth)
 * - Data (phases, problems from DB)
 * - User state (statuses, favorites, history)
 * - Optimistic updates with rollback
 * - SessionStorage persistence
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type {
  FavoriteProblem,
  Phase,
  PhaseWithProgress,
  Problem,
  ProblemStatus,
  ProblemWithUserData,
  StatusCounts,
} from "@/types/domain";

// ============================================================================
// Types
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  username: string | null;
}

export interface InitResponse {
  // Always included
  phases: Phase[];
  problems: Problem[];
  phaseCountsMap: Record<number, number>;
  totalProblems: number;

  // Only for authenticated users
  isAuthenticated: boolean;
  user?: User;
  statuses?: Array<{ problemNumber: number; problemId: number; status: ProblemStatus }>;
  favorites?: Array<{ problemId: number; favoritedAt: string }>;
  historyCount?: number;
  statusCounts?: StatusCounts;
  phaseSolvedMap?: Record<number, number>;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;

  // Data (from DB)
  phases: Phase[];
  problems: Problem[];
  phaseCountsMap: Map<number, number>;
  totalProblems: number;

  // User data (empty for guests)
  statuses: Map<number, ProblemStatus>; // problemNumber -> status
  statusByProblemId: Map<number, ProblemStatus>; // problemId -> status (for favorites)
  favorites: Set<number>; // problemIds
  favoritedAtMap: Map<number, Date>; // problemId -> favoritedAt
  historyCount: number; // Total history entries (for pagination)
  statusCounts: StatusCounts;
  phaseSolvedMap: Map<number, number>;

  // UI state
  isInitialized: boolean;
  isLoading: boolean;
  pendingUpdates: Set<string>; // "status-{number}" or "favorite-{id}"
}

interface AppActions {
  // Auth actions
  setUser: (user: User | null) => void;

  // Data actions
  initialize: (data: InitResponse) => void;
  reset: () => void;
  clearUserData: () => void;

  // Write actions (optimistic + API sync + rollback)
  setStatus: (
    problemNumber: number,
    problemId: number,
    status: ProblemStatus,
    showToast?: (message: string, type: "error" | "success") => void,
  ) => Promise<boolean>;
  toggleFavorite: (
    problemId: number,
    showToast?: (message: string, type: "error" | "success") => void,
  ) => Promise<boolean>;

  // Selectors
  getProblemsWithUserData: (phaseId?: number) => ProblemWithUserData[];
  getPhasesWithProgress: () => PhaseWithProgress[];
  getFavoriteProblems: () => FavoriteProblem[];
  getProblemById: (id: number) => Problem | undefined;
  getProblemByNumber: (num: number) => Problem | undefined;

  // Utility
  isPending: (key: string) => boolean;
}

type AppStore = AppState & AppActions;

// ============================================================================
// Serializers for Map and Set
// ============================================================================

const mapSerializer = {
  replacer: (_key: string, value: unknown) => {
    if (value instanceof Map) {
      return { __type: "Map", entries: Array.from(value.entries()) };
    }
    if (value instanceof Set) {
      return { __type: "Set", values: Array.from(value) };
    }
    if (value instanceof Date) {
      return { __type: "Date", value: value.toISOString() };
    }
    return value;
  },
  reviver: (_key: string, value: unknown) => {
    if (value && typeof value === "object" && "__type" in value) {
      const typed = value as {
        __type: string;
        entries?: unknown[];
        values?: unknown[];
        value?: string;
      };
      if (typed.__type === "Map" && typed.entries) {
        return new Map(typed.entries as [unknown, unknown][]);
      }
      if (typed.__type === "Set" && typed.values) {
        return new Set(typed.values);
      }
      if (typed.__type === "Date" && typed.value) {
        return new Date(typed.value);
      }
    }
    return value;
  },
};

// ============================================================================
// Initial State
// ============================================================================

const initialState: AppState = {
  // Auth
  user: null,
  isAuthenticated: false,

  // Data
  phases: [],
  problems: [],
  phaseCountsMap: new Map(),
  totalProblems: 0,

  // User data
  statuses: new Map(),
  statusByProblemId: new Map(),
  favorites: new Set(),
  favoritedAtMap: new Map(),
  historyCount: 0,
  statusCounts: { solved: 0, attempting: 0, revisit: 0, skipped: 0, untouched: 0 },
  phaseSolvedMap: new Map(),

  // UI
  isInitialized: false,
  isLoading: false,
  pendingUpdates: new Set(),
};

// ============================================================================
// Store
// ============================================================================

export const useAppStore = create<AppStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ========================================
      // Auth Actions
      // ========================================

      setUser: (user) => {
        set({ user, isAuthenticated: !!user });
      },

      // ========================================
      // Data Actions
      // ========================================

      initialize: (data) => {
        const phaseCountsMap = new Map(
          Object.entries(data.phaseCountsMap).map(([k, v]) => [Number(k), v]),
        );

        // Build status maps
        const statuses = new Map<number, ProblemStatus>();
        const statusByProblemId = new Map<number, ProblemStatus>();
        if (data.statuses) {
          for (const s of data.statuses) {
            statuses.set(s.problemNumber, s.status);
            statusByProblemId.set(s.problemId, s.status);
          }
        }

        // Build favorites
        const favorites = new Set<number>();
        const favoritedAtMap = new Map<number, Date>();
        if (data.favorites) {
          for (const f of data.favorites) {
            favorites.add(f.problemId);
            favoritedAtMap.set(f.problemId, new Date(f.favoritedAt));
          }
        }

        // Build phaseSolvedMap
        const phaseSolvedMap = data.phaseSolvedMap
          ? new Map(Object.entries(data.phaseSolvedMap).map(([k, v]) => [Number(k), v]))
          : new Map();

        set({
          // Auth
          user: data.user ?? null,
          isAuthenticated: data.isAuthenticated,

          // Data
          phases: data.phases,
          problems: data.problems,
          phaseCountsMap,
          totalProblems: data.totalProblems,

          // User data
          statuses,
          statusByProblemId,
          favorites,
          favoritedAtMap,
          historyCount: data.historyCount ?? 0,
          statusCounts: data.statusCounts ?? initialState.statusCounts,
          phaseSolvedMap,

          // UI
          isInitialized: true,
          isLoading: false,
        });
      },

      reset: () => {
        set(initialState);
      },

      clearUserData: () => {
        set({
          user: null,
          isAuthenticated: false,
          statuses: new Map(),
          statusByProblemId: new Map(),
          favorites: new Set(),
          favoritedAtMap: new Map(),
          historyCount: 0,
          pendingUpdates: new Set(),
          statusCounts: {
            solved: 0,
            attempting: 0,
            revisit: 0,
            skipped: 0,
            untouched: get().totalProblems,
          },
          phaseSolvedMap: new Map(),
        });
      },

      // ========================================
      // Write Actions (Optimistic + Rollback)
      // ========================================

      setStatus: async (problemNumber, problemId, status, showToast) => {
        const key = `status-${problemNumber}`;
        const state = get();

        // Prevent duplicate requests
        if (state.pendingUpdates.has(key)) {
          return false;
        }

        const previousStatus = state.statuses.get(problemNumber) ?? "untouched";
        const problem = state.problems.find((p) => p.id === problemId);
        const phaseId = problem?.phaseId;

        // Optimistic update
        set((s) => {
          const newStatuses = new Map(s.statuses);
          const newStatusByProblemId = new Map(s.statusByProblemId);
          const newPending = new Set(s.pendingUpdates);
          const newStatusCounts = { ...s.statusCounts };
          const newPhaseSolvedMap = new Map(s.phaseSolvedMap);

          // Update status maps
          if (status === "untouched") {
            newStatuses.delete(problemNumber);
            newStatusByProblemId.delete(problemId);
          } else {
            newStatuses.set(problemNumber, status);
            newStatusByProblemId.set(problemId, status);
          }

          // Update counts
          if (previousStatus !== "untouched") {
            newStatusCounts[previousStatus]--;
          } else {
            newStatusCounts.untouched--;
          }
          if (status !== "untouched") {
            newStatusCounts[status]++;
          } else {
            newStatusCounts.untouched++;
          }

          // Update phase solved map
          if (phaseId) {
            const currentPhaseSolved = newPhaseSolvedMap.get(phaseId) ?? 0;
            if (previousStatus === "solved" && status !== "solved") {
              newPhaseSolvedMap.set(phaseId, Math.max(0, currentPhaseSolved - 1));
            } else if (previousStatus !== "solved" && status === "solved") {
              newPhaseSolvedMap.set(phaseId, currentPhaseSolved + 1);
            }
          }

          newPending.add(key);

          return {
            statuses: newStatuses,
            statusByProblemId: newStatusByProblemId,
            statusCounts: newStatusCounts,
            phaseSolvedMap: newPhaseSolvedMap,
            pendingUpdates: newPending,
          };
        });

        try {
          const res = await fetch("/api/status", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ problemNumber, status }),
          });

          if (!res.ok) {
            throw new Error("Failed to update status");
          }

          // Increment history count on success (actual history fetched separately)
          set((s) => ({
            historyCount: s.historyCount + 1,
            pendingUpdates: new Set([...s.pendingUpdates].filter((k) => k !== key)),
          }));

          return true;
        } catch (error) {
          // Rollback
          console.error("Failed to update status, rolling back:", error);

          set((s) => {
            const newStatuses = new Map(s.statuses);
            const newStatusByProblemId = new Map(s.statusByProblemId);
            const newStatusCounts = { ...s.statusCounts };
            const newPhaseSolvedMap = new Map(s.phaseSolvedMap);

            // Revert status maps
            if (previousStatus === "untouched") {
              newStatuses.delete(problemNumber);
              newStatusByProblemId.delete(problemId);
            } else {
              newStatuses.set(problemNumber, previousStatus);
              newStatusByProblemId.set(problemId, previousStatus);
            }

            // Revert counts
            if (status !== "untouched") {
              newStatusCounts[status]--;
            } else {
              newStatusCounts.untouched--;
            }
            if (previousStatus !== "untouched") {
              newStatusCounts[previousStatus]++;
            } else {
              newStatusCounts.untouched++;
            }

            // Revert phase solved map
            if (phaseId) {
              const currentPhaseSolved = newPhaseSolvedMap.get(phaseId) ?? 0;
              if (status === "solved" && previousStatus !== "solved") {
                newPhaseSolvedMap.set(phaseId, Math.max(0, currentPhaseSolved - 1));
              } else if (status !== "solved" && previousStatus === "solved") {
                newPhaseSolvedMap.set(phaseId, currentPhaseSolved + 1);
              }
            }

            return {
              statuses: newStatuses,
              statusByProblemId: newStatusByProblemId,
              statusCounts: newStatusCounts,
              phaseSolvedMap: newPhaseSolvedMap,
              pendingUpdates: new Set([...s.pendingUpdates].filter((k) => k !== key)),
            };
          });

          showToast?.("Failed to update status. Please try again.", "error");
          return false;
        }
      },

      toggleFavorite: async (problemId, showToast) => {
        const key = `favorite-${problemId}`;
        const state = get();

        // Prevent duplicate requests
        if (state.pendingUpdates.has(key)) {
          return false;
        }

        const wasFavorite = state.favorites.has(problemId);
        // Capture previous favoritedAt for rollback
        const previousFavoritedAt = state.favoritedAtMap.get(problemId);

        // Optimistic update
        set((s) => {
          const newFavorites = new Set(s.favorites);
          const newFavoritedAtMap = new Map(s.favoritedAtMap);
          const newPending = new Set(s.pendingUpdates);

          if (wasFavorite) {
            newFavorites.delete(problemId);
            newFavoritedAtMap.delete(problemId);
          } else {
            newFavorites.add(problemId);
            newFavoritedAtMap.set(problemId, new Date());
          }

          newPending.add(key);

          return {
            favorites: newFavorites,
            favoritedAtMap: newFavoritedAtMap,
            pendingUpdates: newPending,
          };
        });

        try {
          const res = wasFavorite
            ? await fetch(`/api/favorites?problemId=${problemId}`, { method: "DELETE" })
            : await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problemId }),
              });

          if (!res.ok) {
            throw new Error("Failed to update favorite");
          }

          // Clear pending
          set((s) => ({
            pendingUpdates: new Set([...s.pendingUpdates].filter((k) => k !== key)),
          }));

          return true;
        } catch (error) {
          // Rollback
          console.error("Failed to update favorite, rolling back:", error);

          set((s) => {
            const newFavorites = new Set(s.favorites);
            const newFavoritedAtMap = new Map(s.favoritedAtMap);

            if (wasFavorite) {
              // Restore previous favorite with original timestamp
              newFavorites.add(problemId);
              if (previousFavoritedAt) {
                newFavoritedAtMap.set(problemId, previousFavoritedAt);
              }
            } else {
              newFavorites.delete(problemId);
              newFavoritedAtMap.delete(problemId);
            }

            return {
              favorites: newFavorites,
              favoritedAtMap: newFavoritedAtMap,
              pendingUpdates: new Set([...s.pendingUpdates].filter((k) => k !== key)),
            };
          });

          showToast?.("Failed to update favorite. Please try again.", "error");
          return false;
        }
      },

      // ========================================
      // Selectors
      // ========================================

      getProblemsWithUserData: (phaseId) => {
        const state = get();
        let problems = state.problems;

        if (phaseId !== undefined) {
          problems = problems.filter((p) => p.phaseId === phaseId);
        }

        return problems.map((p) => ({
          ...p,
          userStatus: state.statuses.get(p.number) ?? ("untouched" as ProblemStatus),
          isFavorite: state.favorites.has(p.id),
        }));
      },

      getPhasesWithProgress: () => {
        const state = get();

        return state.phases.map((phase) => {
          const totalProblems = state.phaseCountsMap.get(phase.id) ?? 0;
          const solvedCount = state.phaseSolvedMap.get(phase.id) ?? 0;
          const progressPercentage =
            totalProblems > 0 ? Math.round((solvedCount / totalProblems) * 100) : 0;

          return {
            ...phase,
            totalProblems,
            solvedCount,
            progressPercentage,
          };
        });
      },

      getFavoriteProblems: () => {
        const state = get();

        return state.problems
          .filter((p) => state.favorites.has(p.id))
          .map((p) => ({
            ...p,
            userStatus: state.statuses.get(p.number) ?? ("untouched" as ProblemStatus),
            isFavorite: true,
            favoritedAt: state.favoritedAtMap.get(p.id) ?? new Date(),
          }))
          .sort((a, b) => b.favoritedAt.getTime() - a.favoritedAt.getTime());
      },

      getProblemById: (id) => {
        return get().problems.find((p) => p.id === id);
      },

      getProblemByNumber: (num) => {
        return get().problems.find((p) => p.number === num);
      },

      // ========================================
      // Utility
      // ========================================

      isPending: (key) => {
        return get().pendingUpdates.has(key);
      },
    }),
    {
      name: "app-store",
      storage: createJSONStorage(() => sessionStorage, {
        replacer: mapSerializer.replacer,
        reviver: mapSerializer.reviver,
      }),
      // Don't persist pending updates, loading state, or public data (phases/problems)
      // Public data is fetched on init, only user-specific data should be persisted
      // IMPORTANT: Don't persist isInitialized - always fetch fresh data on mount
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        statuses: state.statuses,
        statusByProblemId: state.statusByProblemId,
        favorites: state.favorites,
        favoritedAtMap: state.favoritedAtMap,
        historyCount: state.historyCount,
        statusCounts: state.statusCounts,
        phaseSolvedMap: state.phaseSolvedMap,
        // Note: isInitialized is NOT persisted - always false on page load
      }),
    },
  ),
);

// ============================================================================
// Selector Hooks (for better performance)
// ============================================================================

export const useUser = () => useAppStore((s) => s.user);
export const useIsAuthenticated = () => useAppStore((s) => s.isAuthenticated);
export const useIsInitialized = () => useAppStore((s) => s.isInitialized);
export const useIsLoading = () => useAppStore((s) => s.isLoading);
export const usePhases = () => useAppStore((s) => s.phases);
export const useProblems = () => useAppStore((s) => s.problems);
export const useTotalProblems = () => useAppStore((s) => s.totalProblems);
export const useStatusCounts = () => useAppStore((s) => s.statusCounts);
export const useHistoryCount = () => useAppStore((s) => s.historyCount);

export const useStatus = (problemNumber: number) =>
  useAppStore((s) => s.statuses.get(problemNumber) ?? "untouched");

export const useIsFavorite = (problemId: number) => useAppStore((s) => s.favorites.has(problemId));

export const useIsPending = (key: string) => useAppStore((s) => s.pendingUpdates.has(key));
