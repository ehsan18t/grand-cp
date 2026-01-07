"use client";

import { useAppStore } from "@/stores/app-store";
import { AllProblemsSearch } from "./AllProblemsSearch";

/**
 * Client wrapper that reads problems from the app store.
 */
export function SearchPageClient() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const getProblemsWithUserData = useAppStore((s) => s.getProblemsWithUserData);

  const problems = getProblemsWithUserData();
  const isGuest = !isAuthenticated;

  return <AllProblemsSearch problems={problems} isGuest={isGuest} />;
}
