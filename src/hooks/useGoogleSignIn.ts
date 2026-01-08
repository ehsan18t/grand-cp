/**
 * useGoogleSignIn - Hook for Google OAuth sign-in.
 *
 * Provides a consistent sign-in experience across components
 * with error handling and toast notifications.
 */

import { useCallback } from "react";
import { useToast } from "@/components/ui";
import { authClient } from "@/lib/auth-client";

interface UseGoogleSignInOptions {
  /** URL to redirect to after successful sign-in */
  callbackURL?: string;
}

interface UseGoogleSignInResult {
  /** Trigger the Google sign-in flow */
  signIn: () => Promise<void>;
}

/**
 * Hook for initiating Google OAuth sign-in with consistent error handling.
 *
 * @example
 * ```tsx
 * const { signIn } = useGoogleSignIn({ callbackURL: "/problems" });
 * <button onClick={signIn}>Sign in</button>
 * ```
 */
export function useGoogleSignIn({
  callbackURL = "/problems",
}: UseGoogleSignInOptions = {}): UseGoogleSignInResult {
  const { addToast } = useToast();

  const signIn = useCallback(async () => {
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL,
      });

      // Check if result contains an error
      if (result && typeof result === "object" && "error" in result && result.error) {
        const errorObj = result.error as { message?: string };
        throw new Error(errorObj.message ?? "Sign in failed");
      }
    } catch {
      addToast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Please try again. If it keeps failing, refresh the page.",
      });
    }
  }, [callbackURL, addToast]);

  return { signIn };
}
