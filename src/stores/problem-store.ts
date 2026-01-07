/**
 * Problem Store - Client-side state for problem status and favorites.
 *
 * Features:
 * - Optimistic updates for instant UI feedback
 * - Automatic server sync on changes
 * - SessionStorage persistence for navigation
 * - Hydration-safe for SSR
 */

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { ProblemStatus } from "@/types/domain";

/** @deprecated Use ProblemStatus from @/types/domain instead */
export type StatusValue = ProblemStatus;

interface ProblemState {
  // Status map: problemNumber -> status
  statuses: Map<number, ProblemStatus>;
  // Favorites set: problemId
  favorites: Set<number>;
  // Loading states
  pendingUpdates: Set<string>; // "status-{number}" or "favorite-{id}"
  // Hydration state
  isHydrated: boolean;
}

interface ProblemActions {
  // Initialization
  initialize: (statuses: Map<number, ProblemStatus>, favorites: Set<number>) => void;
  setHydrated: (hydrated: boolean) => void;

  // Status operations (optimistic)
  setStatus: (problemNumber: number, status: ProblemStatus) => Promise<void>;
  getStatus: (problemNumber: number) => ProblemStatus;

  // Favorite operations (optimistic)
  toggleFavorite: (problemId: number) => Promise<void>;
  isFavorite: (problemId: number) => boolean;

  // Batch operations
  setStatusBatch: (entries: Array<[number, ProblemStatus]>) => void;
  setFavoritesBatch: (ids: number[]) => void;

  // Check if an update is pending
  isPending: (key: string) => boolean;
}

type ProblemStore = ProblemState & ProblemActions;

// Serializers for Map and Set
const mapSerializer = {
  replacer: (_key: string, value: unknown) => {
    if (value instanceof Map) {
      return { __type: "Map", entries: Array.from(value.entries()) };
    }
    if (value instanceof Set) {
      return { __type: "Set", values: Array.from(value) };
    }
    return value;
  },
  reviver: (_key: string, value: unknown) => {
    if (value && typeof value === "object" && "__type" in value) {
      const typed = value as { __type: string; entries?: unknown[]; values?: unknown[] };
      if (typed.__type === "Map" && typed.entries) {
        return new Map(typed.entries as [unknown, unknown][]);
      }
      if (typed.__type === "Set" && typed.values) {
        return new Set(typed.values);
      }
    }
    return value;
  },
};

export const useProblemStore = create<ProblemStore>()(
  persist(
    (set, get) => ({
      // Initial state
      statuses: new Map(),
      favorites: new Set(),
      pendingUpdates: new Set(),
      isHydrated: false,

      // Initialize from server data
      initialize: (statuses, favorites) => {
        set({ statuses, favorites });
      },

      setHydrated: (hydrated) => {
        set({ isHydrated: hydrated });
      },

      // Get status for a problem
      getStatus: (problemNumber) => {
        return get().statuses.get(problemNumber) ?? "untouched";
      },

      // Set status with optimistic update
      setStatus: async (problemNumber, status) => {
        const key = `status-${problemNumber}`;
        const previousStatus = get().getStatus(problemNumber);

        // Optimistic update
        set((state) => {
          const newStatuses = new Map(state.statuses);
          if (status === "untouched") {
            newStatuses.delete(problemNumber);
          } else {
            newStatuses.set(problemNumber, status);
          }
          const newPending = new Set(state.pendingUpdates);
          newPending.add(key);
          return { statuses: newStatuses, pendingUpdates: newPending };
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
        } catch (error) {
          // Rollback on error
          console.error("Failed to update status, rolling back:", error);
          set((state) => {
            const newStatuses = new Map(state.statuses);
            if (previousStatus === "untouched") {
              newStatuses.delete(problemNumber);
            } else {
              newStatuses.set(problemNumber, previousStatus);
            }
            return { statuses: newStatuses };
          });
        } finally {
          // Clear pending state
          set((state) => {
            const newPending = new Set(state.pendingUpdates);
            newPending.delete(key);
            return { pendingUpdates: newPending };
          });
        }
      },

      // Check if problem is favorite
      isFavorite: (problemId) => {
        return get().favorites.has(problemId);
      },

      // Toggle favorite with optimistic update
      toggleFavorite: async (problemId) => {
        const key = `favorite-${problemId}`;
        const wasFavorite = get().isFavorite(problemId);

        // Optimistic update
        set((state) => {
          const newFavorites = new Set(state.favorites);
          if (wasFavorite) {
            newFavorites.delete(problemId);
          } else {
            newFavorites.add(problemId);
          }
          const newPending = new Set(state.pendingUpdates);
          newPending.add(key);
          return { favorites: newFavorites, pendingUpdates: newPending };
        });

        try {
          const res = wasFavorite
            ? await fetch(`/api/favorites?problemId=${problemId}`, {
                method: "DELETE",
              })
            : await fetch("/api/favorites", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ problemId }),
              });

          if (!res.ok) {
            throw new Error("Failed to update favorite");
          }
        } catch (error) {
          // Rollback on error
          console.error("Failed to update favorite, rolling back:", error);
          set((state) => {
            const newFavorites = new Set(state.favorites);
            if (wasFavorite) {
              newFavorites.add(problemId);
            } else {
              newFavorites.delete(problemId);
            }
            return { favorites: newFavorites };
          });
        } finally {
          // Clear pending state
          set((state) => {
            const newPending = new Set(state.pendingUpdates);
            newPending.delete(key);
            return { pendingUpdates: newPending };
          });
        }
      },

      // Batch set statuses (for initial hydration)
      setStatusBatch: (entries) => {
        set((state) => {
          const newStatuses = new Map(state.statuses);
          for (const [num, status] of entries) {
            newStatuses.set(num, status);
          }
          return { statuses: newStatuses };
        });
      },

      // Batch set favorites (for initial hydration)
      setFavoritesBatch: (ids) => {
        set((state) => {
          const newFavorites = new Set(state.favorites);
          for (const id of ids) {
            newFavorites.add(id);
          }
          return { favorites: newFavorites };
        });
      },

      // Check if update is pending
      isPending: (key) => {
        return get().pendingUpdates.has(key);
      },
    }),
    {
      name: "problem-store",
      storage: createJSONStorage(() => sessionStorage, {
        replacer: mapSerializer.replacer,
        reviver: mapSerializer.reviver,
      }),
      // Don't persist pending updates
      partialize: (state) => ({
        statuses: state.statuses,
        favorites: state.favorites,
      }),
      // Handle hydration
      onRehydrateStorage: () => (state) => {
        if (!state) {
          console.error("Hydration failed: state is undefined");
          return;
        }
        state.setHydrated(true);
      },
    },
  ),
);

// Selector hooks for better performance
export const useStatus = (problemNumber: number) =>
  useProblemStore((state) => state.statuses.get(problemNumber) ?? "untouched");

export const useFavorite = (problemId: number) =>
  useProblemStore((state) => state.favorites.has(problemId));

export const useIsPending = (key: string) =>
  useProblemStore((state) => state.pendingUpdates.has(key));
