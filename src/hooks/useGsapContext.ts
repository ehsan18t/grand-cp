"use client";

import { useGSAP as useGSAPOriginal } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { type RefObject, useRef } from "react";

// Register plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

// ============================================================================
// Types
// ============================================================================

export interface GsapContextOptions {
  /** Dependencies array for re-running animation */
  dependencies?: unknown[];
  /** Scope for GSAP context (defaults to container ref) */
  scope?: RefObject<HTMLElement | null>;
  /** Whether to revert animations on unmount */
  revertOnUnmount?: boolean;
}

export interface GsapContextReturn<T extends HTMLElement> {
  /** Ref to attach to the container element */
  containerRef: RefObject<T | null>;
  /** The GSAP context for manual control */
  contextRef: RefObject<gsap.Context | null>;
  /** GSAP instance */
  gsap: typeof gsap;
  /** ScrollTrigger instance */
  ScrollTrigger: typeof ScrollTrigger;
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook that provides a GSAP context scoped to a container element.
 * All GSAP animations created within the callback are automatically
 * cleaned up when the component unmounts.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { containerRef, gsap } = useGsapContext<HTMLDivElement>((context) => {
 *     // All animations here are scoped to containerRef
 *     gsap.to('.box', { x: 100 });
 *     gsap.to('.circle', { rotation: 360 });
 *   });
 *
 *   return (
 *     <div ref={containerRef}>
 *       <div className="box">Box</div>
 *       <div className="circle">Circle</div>
 *     </div>
 *   );
 * }
 * ```
 *
 * @example With dependencies
 * ```tsx
 * const { containerRef } = useGsapContext<HTMLDivElement>(
 *   () => {
 *     gsap.to('.item', { x: isOpen ? 100 : 0 });
 *   },
 *   { dependencies: [isOpen] }
 * );
 * ```
 */
export function useGsapContext<T extends HTMLElement = HTMLDivElement>(
  callback?: (context: gsap.Context) => void,
  options: GsapContextOptions = {},
): GsapContextReturn<T> {
  const { dependencies = [], scope, revertOnUnmount = true } = options;

  const containerRef = useRef<T>(null);
  const contextRef = useRef<gsap.Context | null>(null);

  useGSAPOriginal(
    (context) => {
      contextRef.current = context;
      callback?.(context);
    },
    {
      scope: scope || containerRef,
      dependencies,
      revertOnUpdate: revertOnUnmount,
    },
  );

  return {
    containerRef,
    contextRef,
    gsap,
    ScrollTrigger,
  };
}

// ============================================================================
// Re-exports for convenience
// ============================================================================

export { gsap, ScrollTrigger };
export { useGSAP } from "@gsap/react";
export default useGsapContext;
