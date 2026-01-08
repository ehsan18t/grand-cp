"use client";

/**
 * AppStoreInitializer - Initializes the unified app store.
 *
 * This component:
 * 1. Subscribes to better-auth session changes
 * 2. Fetches data from /api/init on mount (after session is determined)
 * 3. Re-fetches when auth state changes (login/logout)
 * 4. Shows loading spinner until initialized
 */

import { useCallback, useEffect, useRef } from "react";
import { LoadingScreen } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { type InitResponse, useAppStore } from "@/stores/app-store";

interface AppStoreInitializerProps {
  children: React.ReactNode;
}

export function AppStoreInitializer({ children }: AppStoreInitializerProps) {
  const isInitialized = useAppStore((s) => s.isInitialized);
  const initialize = useAppStore((s) => s.initialize);
  const clearUserData = useAppStore((s) => s.clearUserData);
  const storeUser = useAppStore((s) => s.user);

  const { data: session, isPending: isSessionPending } = authClient.useSession();
  const initializingRef = useRef(false);
  const hasInitializedRef = useRef(false);
  const lastUserIdRef = useRef<string | null | undefined>(undefined); // undefined = not set yet

  const fetchAndInitialize = useCallback(async () => {
    if (initializingRef.current) return;
    initializingRef.current = true;

    try {
      const res = await fetch("/api/init", {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch init data");
      }

      const data: InitResponse = await res.json();
      initialize(data);
    } catch (error) {
      console.error("Failed to initialize app store:", error);
      // Still mark as initialized so the app renders
      useAppStore.setState({ isInitialized: true });
    } finally {
      initializingRef.current = false;
    }
  }, [initialize]);

  // Initial fetch and auth change detection
  useEffect(() => {
    // Wait for session to be determined before doing anything
    if (isSessionPending) return;

    const currentUserId = session?.user?.id ?? null;

    // First time session is determined
    if (lastUserIdRef.current === undefined) {
      lastUserIdRef.current = currentUserId;
      hasInitializedRef.current = true;
      fetchAndInitialize();
      return;
    }

    // User changed (login or logout)
    if (lastUserIdRef.current !== currentUserId) {
      const wasLogout = lastUserIdRef.current !== null && currentUserId === null;
      lastUserIdRef.current = currentUserId;

      if (wasLogout) {
        // On logout, clear user data but keep public data
        clearUserData();
      } else {
        // On login, fetch fresh data with user context
        fetchAndInitialize();
      }
    }
  }, [session, isSessionPending, fetchAndInitialize, clearUserData]);

  // Sync session user to store if it changes (e.g., profile update)
  useEffect(() => {
    if (!session?.user) return;

    const sessionUser = session.user as {
      id: string;
      name: string;
      email: string;
      image?: string | null;
      username?: string | null;
    };
    const storeUserData = storeUser;

    // Check if user data needs updating (including username)
    if (
      storeUserData &&
      (storeUserData.name !== sessionUser.name ||
        storeUserData.image !== sessionUser.image ||
        storeUserData.email !== sessionUser.email ||
        storeUserData.username !== (sessionUser.username ?? null))
    ) {
      useAppStore.setState({
        user: {
          id: sessionUser.id,
          name: sessionUser.name,
          email: sessionUser.email,
          image: sessionUser.image ?? null,
          username: sessionUser.username ?? null,
        },
      });
    }
  }, [session, storeUser]);

  // Show loading state while session is pending or store is not initialized
  if (isSessionPending || !isInitialized) {
    return (
      <LoadingScreen
        density="compact"
        title="Loading GrandCP"
        description="Preparing the requested content..."
      />
    );
  }

  return <>{children}</>;
}
