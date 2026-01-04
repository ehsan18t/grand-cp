"use client";

import { useEffect, useState } from "react";

/**
 * Hook to detect user's preference for reduced motion.
 * Returns true if the user prefers reduced motion.
 * Useful for disabling GSAP animations for accessibility.
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = useReducedMotion();
 *
 * useGSAP(() => {
 *   if (prefersReducedMotion) return; // Skip animation
 *   gsap.to(element, { opacity: 1 });
 * }, [prefersReducedMotion]);
 * ```
 */
export function useReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Check initial value
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mediaQuery.matches);

    // Listen for changes
    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return prefersReducedMotion;
}

export default useReducedMotion;
