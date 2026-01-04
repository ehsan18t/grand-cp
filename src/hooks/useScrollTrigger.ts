"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject, useRef } from "react";
import { useReducedMotion } from "./useReducedMotion";

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================================
// Types
// ============================================================================

export type ScrollAnimationType =
  | "fadeIn"
  | "fadeInUp"
  | "fadeInDown"
  | "fadeInLeft"
  | "fadeInRight"
  | "scaleIn"
  | "slideInUp"
  | "slideInDown"
  | "slideInLeft"
  | "slideInRight"
  | "parallax";

export interface ScrollTriggerOptions {
  /** Animation type preset */
  type?: ScrollAnimationType;
  /** Animation duration in seconds */
  duration?: number;
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
  /** ScrollTrigger start position */
  start?: string;
  /** ScrollTrigger end position */
  end?: string;
  /** Whether animation should scrub with scroll */
  scrub?: boolean | number;
  /** Whether to show markers for debugging */
  markers?: boolean;
  /** Whether animation should replay when scrolling back up */
  toggleActions?: string;
  /** Pin the element during scroll */
  pin?: boolean;
  /** Callback when animation starts */
  onEnter?: () => void;
  /** Callback when animation completes */
  onLeave?: () => void;
  /** Callback when scrolling back up past trigger */
  onEnterBack?: () => void;
  /** Callback when scrolling back down past trigger */
  onLeaveBack?: () => void;
}

// ============================================================================
// Animation Presets
// ============================================================================

function getScrollAnimationPreset(
  type: ScrollAnimationType,
  distance: number,
  scale: number,
): { from: gsap.TweenVars; to: gsap.TweenVars } {
  const presets: Record<ScrollAnimationType, { from: gsap.TweenVars; to: gsap.TweenVars }> = {
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
    parallax: {
      from: { y: -distance / 2 },
      to: { y: distance / 2 },
    },
  };

  return presets[type];
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook for animating elements when they enter the viewport using GSAP ScrollTrigger.
 * Respects user's reduced motion preference.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const ref = useScrollTrigger<HTMLDivElement>({ type: 'fadeInUp' });
 *   return <div ref={ref}>Animated on scroll</div>;
 * }
 * ```
 *
 * @example With scrub (animation follows scroll)
 * ```tsx
 * const ref = useScrollTrigger<HTMLDivElement>({
 *   type: 'parallax',
 *   scrub: true,
 *   start: 'top bottom',
 *   end: 'bottom top'
 * });
 * ```
 */
export function useScrollTrigger<T extends HTMLElement = HTMLDivElement>(
  options: ScrollTriggerOptions = {},
): RefObject<T | null> {
  const {
    type = "fadeInUp",
    duration = 0.8,
    ease = "power2.out",
    distance = 50,
    scale = 0.9,
    enabled = true,
    from: customFrom,
    to: customTo,
    start = "top 85%",
    end = "top 20%",
    scrub = false,
    markers = false,
    toggleActions = "play none none none",
    pin = false,
    onEnter,
    onLeave,
    onEnterBack,
    onLeaveBack,
  } = options;

  const ref = useRef<T>(null);
  const prefersReducedMotion = useReducedMotion();

  useGSAP(
    () => {
      if (!ref.current || !enabled) return;

      // Respect reduced motion preference
      if (prefersReducedMotion) {
        gsap.set(ref.current, { opacity: 1, clearProps: "all" });
        return;
      }

      const preset = getScrollAnimationPreset(type, distance, scale);
      const fromVars = customFrom || preset.from;
      const toVars = {
        ...preset.to,
        ...customTo,
        duration: scrub ? undefined : duration,
        ease: scrub ? "none" : ease,
        scrollTrigger: {
          trigger: ref.current,
          start,
          end,
          scrub,
          markers,
          toggleActions: scrub ? undefined : toggleActions,
          pin,
          onEnter,
          onLeave,
          onEnterBack,
          onLeaveBack,
        },
      };

      // Set initial state
      gsap.set(ref.current, fromVars);

      // Animate to final state on scroll
      gsap.to(ref.current, toVars);
    },
    {
      dependencies: [type, duration, ease, enabled, prefersReducedMotion, start, end, scrub],
    },
  );

  return ref;
}

export default useScrollTrigger;
