/**
 * Search Store - Client-side cache for all problems data.
 *
 * Features:
 * - Caches all problems data to avoid repeated API calls
 * - Hydration from server data
 * - Used by search page and global search features
 */

import { create } from "zustand";
import type { Problem } from "@/types/domain";

interface SearchState {
  /** All problems (without user data - base data) */
  allProblems: Problem[];
  /** Whether the store has been initialized */
  isInitialized: boolean;
}

interface SearchActions {
  /** Initialize the store with problems data */
  setProblems: (problems: Problem[]) => void;
  /** Get all problems */
  getProblems: () => Problem[];
  /** Reset the store */
  reset: () => void;
}

type SearchStore = SearchState & SearchActions;

export const useSearchStore = create<SearchStore>()((set, get) => ({
  allProblems: [],
  isInitialized: false,

  setProblems: (problems) => {
    set({ allProblems: problems, isInitialized: true });
  },

  getProblems: () => {
    return get().allProblems;
  },

  reset: () => {
    set({ allProblems: [], isInitialized: false });
  },
}));

// Selector hooks for better performance
export const useAllProblems = () => useSearchStore((state) => state.allProblems);
export const useSearchInitialized = () => useSearchStore((state) => state.isInitialized);
