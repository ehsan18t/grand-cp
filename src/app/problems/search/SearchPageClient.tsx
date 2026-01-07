"use client";

import { useEffect } from "react";
import { useSearchStore } from "@/stores";
import type { ProblemWithUserData } from "@/types/domain";
import { AllProblemsSearch } from "./AllProblemsSearch";

interface SearchPageClientProps {
  initialProblems: ProblemWithUserData[];
  isGuest: boolean;
}

/**
 * Client wrapper that initializes the search store with server data.
 * This ensures problems are cached in Zustand for fast client-side filtering.
 */
export function SearchPageClient({ initialProblems, isGuest }: SearchPageClientProps) {
  const setProblems = useSearchStore((s) => s.setProblems);
  const isInitialized = useSearchStore((s) => s.isInitialized);

  // Initialize store with server data on mount
  useEffect(() => {
    if (!isInitialized) {
      // Store base problem data (without user data for caching)
      setProblems(initialProblems);
    }
  }, [initialProblems, setProblems, isInitialized]);

  return <AllProblemsSearch problems={initialProblems} isGuest={isGuest} />;
}
