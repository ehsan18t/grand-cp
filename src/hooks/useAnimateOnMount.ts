"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { type RefObject, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

// ============================================================================
// Types
// ============================================================================

export type AnimationType =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "scaleIn"
  | "scaleInUp"
  | "slideInUp"
  | "slideInDown"
  | "slideInLeft"
  | "slideInRight"
  | "rotateIn"
  | "bounceIn"
  | "flipIn";

export interface AnimateOnMountOptions {
  /** Animation type preset */
  type?: AnimationType;
  /** Animation duration in seconds */
  duration?: number;
  /** Delay before animation starts in seconds */
  delay?: number;
  /** GSAP easing function */
  ease?: string;
  /** Distance for slide/fade animations (in pixels) */
  distance?: number;
  /** Scale value for scale animations */
  scale?: number;
  /** Whether to animate (can be used for conditional animation) */
  enabled?: boolean;
  /** Custom GSAP "from" properties (overrides preset) */
  from?: gsap.TweenVars;
  /** Custom GSAP "to" properties (merged with preset) */
  to?: gsap.TweenVars;
  /** Callback when animation completes */
  onComplete?: () => void;
}

// ============================================================================
// Animation Presets
// ============================================================================

function getAnimationPreset(
  type: AnimationType,
  distance: number,
  scale: number,
): { from: gsap.TweenVars; to: gsap.TweenVars } {
  const presets: Record<AnimationType, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    fadeInUp: {
      from: { opacity: 0, y: distance },
      to: { opacity: 1, y: 0 },
    },
    fadeInDown: {
      from: { opacity: 0, y: -distance },
      to: { opacity: 1, y: 0 },
    },
    fadeInLeft: {
      from: { opacity: 0, x: -distance },
      to: { opacity: 1, x: 0 },
    },
    fadeInRight: {
      from: { opacity: 0, x: distance },
      to: { opacity: 1, x: 0 },
    },
    scaleIn: {
      from: { opacity: 0, scale },
      to: { opacity: 1, scale: 1 },
    },
    scaleInUp: {
      from: { opacity: 0, scale, y: distance / 2 },
      to: { opacity: 1, scale: 1, y: 0 },
    },
    slideInUp: {
      from: { y: distance },
      to: { y: 0 },
    },
    slideInDown: {
      from: { y: -distance },
      to: { y: 0 },
    },
    slideInLeft: {
      from: { x: -distance },
      to: { x: 0 },
    },
    slideInRight: {
      from: { x: distance },
      to: { x: 0 },
    },
    rotateIn: {
      from: { opacity: 0, rotation: -180, scale: 0.5 },
      to: { opacity: 1, rotation: 0, scale: 1 },
    },
    bounceIn: {
      from: { opacity: 0, scale: 0.3 },
      to: { opacity: 1, scale: 1 },
    },
    flipIn: {
      from: { opacity: 0, rotationY: 90 },
      to: { opacity: 1, rotationY: 0 },
    },
  };

  return presets[type];
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for animating elements on mount using GSAP.
 * Respects user's reduced motion preference.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const ref = useAnimateOnMount<HTMLDivElement>({ type: 'fadeInUp' });
 *   return <div ref={ref}>Animated content</div>;
 * }
 * ```
 *
 * @example With custom options
 * ```tsx
 * const ref = useAnimateOnMount<HTMLDivElement>({
 *   type: 'scaleIn',
 *   duration: 0.8,
 *   delay: 0.2,
 *   ease: 'elastic.out(1, 0.5)',
 *   onComplete: () => console.log('Done!')
 * });
 * ```
 */
export function useAnimateOnMount<T extends HTMLElement = HTMLDivElement>(
  options: AnimateOnMountOptions = {},
): RefObject<T | null> {
  const {
    type = "fadeIn",
    duration = 0.6,
    delay = 0,
    ease = "power2.out",
    distance = 30,
    scale = 0.9,
    enabled = true,
    from: customFrom,
    to: customTo,
    onComplete,
  } = options;

  const ref = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current || !enabled) return;

      // Respect reduced motion preference
      if (prefersReducedMotion) {
        gsap.set(ref.current, { opacity: 1, clearProps: "all" });
        onComplete?.();
        return;
      }

      const preset = getAnimationPreset(type, distance, scale);
      const fromVars = customFrom || preset.from;
      const toVars = {
        ...preset.to,
        ...customTo,
        duration,
        delay,
        ease,
        onComplete,
      };

      // Set initial state
      gsap.set(ref.current, fromVars);

      // Animate to final state
      gsap.to(ref.current, toVars);
    },
    { dependencies: [type, duration, delay, ease, enabled, prefersReducedMotion] },
  );

  return ref;
}

export default useAnimateOnMount;
