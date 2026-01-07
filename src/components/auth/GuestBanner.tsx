"use client";

import { LogIn, Sparkles, X } from "lucide-react";
import { forwardRef, useEffect, useState } from "react";
import { tv } from "tailwind-variants";
import { useToast } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const guestBannerVariants = tv({
  slots: {
    root: [
      "relative overflow-hidden rounded-xl border border-primary/20 bg-primary/5 p-4",
      "mb-6 animate-in fade-in slide-in-from-top-2 duration-300",
    ],
    glow: ["absolute -right-12 -top-12 h-32 w-32 rounded-full bg-primary/10 blur-2xl"],
    content: "relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between",
    textSection: "flex items-start gap-3 sm:items-center",
    iconWrapper: [
      "flex h-10 w-10 shrink-0 items-center justify-center",
      "rounded-full bg-primary/10 text-primary",
    ],
    text: "space-y-0.5",
    title: "font-medium text-foreground",
    description: "text-muted-foreground text-sm",
    actions: "flex items-center gap-2 sm:shrink-0",
    loginButton: [
      "inline-flex items-center justify-center gap-2",
      "rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground text-sm",
      "transition-all hover:bg-primary/90",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    ],
    dismissButton: [
      "inline-flex h-8 w-8 items-center justify-center rounded-lg",
      "text-muted-foreground hover:bg-accent hover:text-foreground",
      "transition-colors",
    ],
  },
});

const STORAGE_KEY = "guest-banner-dismissed";

export interface GuestBannerProps {
  className?: string;
  /** Message variant */
  variant?: "progress" | "features" | "stats";
}

const variantMessages = {
  progress: {
    title: "Want to track your progress?",
    description: "Sign in to save your status and never lose your progress.",
  },
  features: {
    title: "Unlock all features",
    description: "Sign in to track progress, save favorites, and view your stats.",
  },
  stats: {
    title: "See your personal stats",
    description: "Sign in to track your problem-solving journey and share your progress.",
  },
};

export const GuestBanner = forwardRef<HTMLDivElement, GuestBannerProps>(function GuestBanner(
  { className, variant = "progress" },
  ref,
) {
  const styles = guestBannerVariants();
  const [isDismissed, setIsDismissed] = useState(true); // Start hidden to avoid flash
  const message = variantMessages[variant];
  const { addToast } = useToast();

  // Check sessionStorage on mount
  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY);
    setIsDismissed(dismissed === "true");
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem(STORAGE_KEY, "true");
    setIsDismissed(true);
  };

  const handleLogin = async () => {
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.pathname,
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
        description: "Please try again.",
      });
    }
  };

  if (isDismissed) return null;

  return (
    <div ref={ref} className={cn(styles.root(), className)}>
      {/* Glow effect */}
      <div className={styles.glow()} aria-hidden="true" />

      <div className={styles.content()}>
        <div className={styles.textSection()}>
          <div className={styles.iconWrapper()}>
            <Sparkles className="h-5 w-5" />
          </div>
          <div className={styles.text()}>
            <p className={styles.title()}>{message.title}</p>
            <p className={styles.description()}>{message.description}</p>
          </div>
        </div>

        <div className={styles.actions()}>
          <button type="button" onClick={handleLogin} className={styles.loginButton()}>
            <LogIn className="h-4 w-4" />
            Sign in
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className={styles.dismissButton()}
            aria-label="Dismiss"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
});

GuestBanner.displayName = "GuestBanner";
