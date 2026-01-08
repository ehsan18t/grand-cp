"use client";

import { Lock, LogIn } from "lucide-react";
import { forwardRef } from "react";
import { tv } from "tailwind-variants";
import { useGoogleSignIn } from "@/hooks";
import { cn } from "@/lib/utils";

const guestOverlayVariants = tv({
  slots: {
    root: "relative",
    content: "relative",
    overlay: [
      "absolute inset-0 z-10 flex flex-col items-center justify-center",
      "bg-background/80 backdrop-blur-sm",
      "rounded-lg",
    ],
    card: [
      "flex max-w-sm flex-col items-center rounded-xl border border-border bg-card p-6 text-center",
      "shadow-xl shadow-black/5 dark:shadow-black/20",
    ],
    iconWrapper: [
      "mb-4 flex h-14 w-14 items-center justify-center",
      "rounded-full bg-primary/10 text-primary",
    ],
    title: "mb-2 font-semibold text-lg",
    description: "mb-4 text-muted-foreground text-sm",
    loginButton: [
      "inline-flex items-center justify-center gap-2",
      "rounded-lg bg-primary px-5 py-2.5 font-medium text-primary-foreground",
      "transition-all hover:bg-primary/90",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    ],
  },
});

export interface GuestOverlayProps {
  children: React.ReactNode;
  /** Show the overlay */
  show: boolean;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  className?: string;
}

export const GuestOverlay = forwardRef<HTMLDivElement, GuestOverlayProps>(function GuestOverlay(
  {
    children,
    show,
    title = "Sign in to see your stats",
    description = "Track your progress and see detailed statistics by signing in.",
    className,
  },
  ref,
) {
  const styles = guestOverlayVariants();
  // Use current path as callback so user returns to same page after sign-in
  const { signIn } = useGoogleSignIn({
    callbackURL: typeof window !== "undefined" ? window.location.pathname : "/problems",
  });

  return (
    <div ref={ref} className={cn(styles.root(), className)}>
      <div className={cn(styles.content(), show && "pointer-events-none select-none blur-[2px]")}>
        {children}
      </div>

      {show && (
        <div className={styles.overlay()}>
          <div className={styles.card()}>
            <div className={styles.iconWrapper()}>
              <Lock className="h-7 w-7" />
            </div>
            <h3 className={styles.title()}>{title}</h3>
            <p className={styles.description()}>{description}</p>
            <button type="button" onClick={signIn} className={styles.loginButton()}>
              <LogIn className="h-4 w-4" />
              Sign in with Google
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

GuestOverlay.displayName = "GuestOverlay";
