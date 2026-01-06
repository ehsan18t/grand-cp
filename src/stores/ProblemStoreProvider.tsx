"use client";

import { useEffect, useRef } from "react";
import { type StatusValue, useProblemStore } from "@/stores/problem-store";

interface ProblemStoreProviderProps {
  children: React.ReactNode;
  /**
   * Initial statuses from server: Array of [problemNumber, status]
   */
  initialStatuses?: Array<[number, StatusValue]>;
  /**
   * Initial favorite problem IDs from server
   */
  initialFavorites?: number[];
}

/**
 * Provider that hydrates the problem store with server data.
 *
 * Place this in your layout or page to initialize the store with
 * the user's current status and favorites data.
 *
 * The store will merge server data with any existing client state,
 * preferring server data on initial load.
 */
export function ProblemStoreProvider({
  children,
  initialStatuses = [],
  initialFavorites = [],
}: ProblemStoreProviderProps) {
  const initialized = useRef(false);
  const initialize = useProblemStore((state) => state.initialize);

  useEffect(() => {
    // Only initialize once per mount
    if (!initialized.current && (initialStatuses.length > 0 || initialFavorites.length > 0)) {
      const statusMap = new Map(initialStatuses);
      const favoriteSet = new Set(initialFavorites);
      initialize(statusMap, favoriteSet);
      initialized.current = true;
    }
  }, [initialStatuses, initialFavorites, initialize]);

  return <>{children}</>;
}
