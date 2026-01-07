"use client";

import { Lock, LogIn, Sparkles, X } from "lucide-react";
import { forwardRef, useEffect, useRef } from "react";
import { tv } from "tailwind-variants";
import { useToast } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const loginPromptVariants = tv({
  slots: {
    backdrop: [
      "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
      "animate-in fade-in duration-200",
    ],
    container: [
      "fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2",
      "w-[calc(100%-2rem)] max-w-md",
      "animate-in fade-in zoom-in-95 duration-200",
    ],
    card: [
      "relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-2xl",
      "dark:shadow-primary/5",
    ],
    glow: [
      "absolute -top-24 left-1/2 -translate-x-1/2",
      "h-48 w-48 rounded-full bg-primary/20 blur-3xl",
    ],
    closeButton: [
      "absolute right-4 top-4 p-1.5 rounded-lg",
      "text-muted-foreground hover:text-foreground hover:bg-accent",
      "transition-colors",
    ],
    iconWrapper: [
      "mx-auto mb-4 flex h-16 w-16 items-center justify-center",
      "rounded-full bg-primary/10 text-primary",
    ],
    title: "mb-2 text-center font-semibold text-xl",
    description: "mb-6 text-center text-muted-foreground text-sm",
    featureList: "mb-6 space-y-2",
    featureItem: "flex items-center gap-2 text-sm",
    featureIcon: "h-4 w-4 text-primary",
    loginButton: [
      "w-full flex items-center justify-center gap-2",
      "rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground",
      "transition-all hover:bg-primary/90 hover:scale-[1.02]",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    ],
    skipButton: [
      "mt-3 w-full text-center text-muted-foreground text-sm",
      "hover:text-foreground transition-colors cursor-pointer",
    ],
  },
});

/** Feature descriptions for different auth-gated features */
const featureMessages: Record<string, { title: string; description: string; benefits: string[] }> =
  {
    status: {
      title: "Track Your Progress",
      description: "Sign in to save your problem-solving status and never lose your progress.",
      benefits: [
        "Mark problems as Solved, Attempting, or Skipped",
        "See your progress across all phases",
        "Resume from where you left off on any device",
      ],
    },
    favorite: {
      title: "Save Your Favorites",
      description: "Sign in to bookmark problems you want to revisit later.",
      benefits: [
        "Quick access to problems you love",
        "Build your personal problem collection",
        "Never lose track of important problems",
      ],
    },
    stats: {
      title: "View Your Statistics",
      description: "Sign in to see your personal progress and statistics.",
      benefits: [
        "Track problems solved over time",
        "See your completion percentage",
        "Share your profile with others",
      ],
    },
    history: {
      title: "View Your History",
      description: "Sign in to see your problem-solving history.",
      benefits: [
        "See when you solved each problem",
        "Track your status changes over time",
        "Review your learning journey",
      ],
    },
    general: {
      title: "Sign In to Continue",
      description: "Create an account to unlock all features and track your progress.",
      benefits: [
        "Save your progress across devices",
        "Track your problem-solving journey",
        "Access your personal statistics",
      ],
    },
  };

export type LoginPromptFeature = keyof typeof featureMessages;

export interface LoginPromptProps {
  isOpen: boolean;
  onClose: () => void;
  feature?: LoginPromptFeature;
  className?: string;
}

export const LoginPrompt = forwardRef<HTMLDivElement, LoginPromptProps>(function LoginPrompt(
  { isOpen, onClose, feature = "general", className },
  ref,
) {
  const styles = loginPromptVariants();
  const cardRef = useRef<HTMLDivElement>(null);
  const message = featureMessages[feature] ?? featureMessages.general;

  // Close on escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const { addToast } = useToast();

  const handleLogin = async () => {
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: window.location.pathname,
      });

      if ((result as any)?.error) {
        throw new Error((result as any)?.error?.message ?? "Unknown error");
      }
    } catch {
      addToast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Please try again.",
      });
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div className={styles.backdrop()} onClick={onClose} aria-hidden="true" />

      {/* Modal */}
      <div ref={ref} className={cn(styles.container(), className)} role="dialog" aria-modal="true">
        <div ref={cardRef} className={styles.card()}>
          {/* Glow effect */}
          <div className={styles.glow()} aria-hidden="true" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton()}
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Icon */}
          <div className={styles.iconWrapper()}>
            <Lock className="h-8 w-8" />
          </div>

          {/* Content */}
          <h2 className={styles.title()}>{message.title}</h2>
          <p className={styles.description()}>{message.description}</p>

          {/* Benefits list */}
          <ul className={styles.featureList()}>
            {message.benefits.map((benefit) => (
              <li key={benefit} className={styles.featureItem()}>
                <Sparkles className={styles.featureIcon()} />
                <span>{benefit}</span>
              </li>
            ))}
          </ul>

          {/* Login button */}
          <button type="button" onClick={handleLogin} className={styles.loginButton()}>
            <LogIn className="h-4 w-4" />
            Sign in with Google
          </button>

          {/* Skip */}
          <button type="button" onClick={onClose} className={styles.skipButton()}>
            Maybe later
          </button>
        </div>
      </div>
    </>
  );
});

LoginPrompt.displayName = "LoginPrompt";
