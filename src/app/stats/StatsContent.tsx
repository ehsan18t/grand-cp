"use client";

import { GuestOverlay } from "@/components/auth";

interface StatsContentProps {
  children: React.ReactNode;
  isGuest: boolean;
}

/**
 * Client wrapper for stats content that shows guest overlay when not authenticated.
 */
export function StatsContent({ children, isGuest }: StatsContentProps) {
  return (
    <GuestOverlay
      show={isGuest}
      title="Sign in to see your stats"
      description="Track your problem-solving journey and see detailed progress statistics."
    >
      {children}
    </GuestOverlay>
  );
}
