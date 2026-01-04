"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useCallback, useRef } from "react";
import { type ClickEffect, type FocusEffect, type HoverEffect, useAnimation } from "@/context";

// ============================================================================
// Types
// ============================================================================

export interface ButtonAnimationOptions {
  /** Animation preset name */
  preset?: string;
  /** Enable/disable all animations (overrides global) */
  animated?: boolean;
  /** Hover effect type */
  hoverEffect?: HoverEffect;
  /** Click/tap effect type */
  clickEffect?: ClickEffect;
  /** Focus effect type */
  focusEffect?: FocusEffect;
  /** Scale factor for hover */
  hoverScale?: number;
  /** Scale factor for press */
  pressScale?: number;
  /** Animation duration override */
  duration?: number | "fast" | "default" | "slow";
  /** Animation easing override */
  easing?: "default" | "bounce" | "smooth" | string;
  /** Whether button is disabled */
  disabled?: boolean;
  /** Whether button is loading */
  isLoading?: boolean;
}

export interface ButtonAnimationReturn<T extends HTMLElement> {
  /** Ref to attach to the button element */
  ref: React.RefObject<T | null>;
  /** Merged ref callback for forwarding */
  mergedRef: (node: T | null) => void;
  /** Handle click for ripple/bounce effects */
  handleClick: (event: React.MouseEvent<T>) => void;
  /** CSS classes for focus effects */
  focusClasses: string;
  /** CSS classes for effect container (overflow, position) */
  containerClasses: string;
  /** Resolved animation config */
  config: {
    hoverEffect: HoverEffect;
    clickEffect: ClickEffect;
    focusEffect: FocusEffect;
    hoverScale: number;
    pressScale: number;
    duration: number;
    easing: string;
  };
}

// ============================================================================
// Hook
// ============================================================================

export function useButtonAnimation<T extends HTMLElement = HTMLButtonElement>(
  options: ButtonAnimationOptions = {},
  forwardedRef?: React.ForwardedRef<T>,
): ButtonAnimationReturn<T> {
  const {
    preset = "subtle",
    animated,
    hoverEffect: hoverEffectProp,
    clickEffect: clickEffectProp,
    focusEffect: focusEffectProp,
    hoverScale: hoverScaleProp,
    pressScale: pressScaleProp,
    duration: durationProp,
    easing: easingProp,
    disabled = false,
    isLoading = false,
  } = options;

  const { shouldAnimate, getPreset, getDuration, getEasing } = useAnimation();
  const elementRef = useRef<T | null>(null);

  // Resolve preset
  const presetConfig = getPreset(preset);

  // Merge preset with explicit props
  const hoverEffect = hoverEffectProp ?? presetConfig?.hoverEffect ?? "scale";
  const clickEffect = clickEffectProp ?? presetConfig?.clickEffect ?? "ripple";
  const focusEffect = focusEffectProp ?? presetConfig?.focusEffect ?? "ring";
  const hoverScale = hoverScaleProp ?? presetConfig?.hoverScale ?? 1.02;
  const pressScale = pressScaleProp ?? presetConfig?.pressScale ?? 0.98;
  const duration = getDuration(durationProp ?? presetConfig?.duration ?? "default");
  const easing = getEasing(easingProp ?? presetConfig?.easing ?? "default");

  // Determine if animations should run
  const isAnimated = animated ?? shouldAnimate;
  const canAnimate = isAnimated && !disabled && !isLoading;

  // Merged ref callback
  const mergedRef = useCallback(
    (node: T | null) => {
      elementRef.current = node;
      if (typeof forwardedRef === "function") {
        forwardedRef(node);
      } else if (forwardedRef) {
        forwardedRef.current = node;
      }
    },
    [forwardedRef],
  );

  // GSAP hover animation (scale, lift, glow - CSS handles shine/magnetic differently)
  useGSAP(
    () => {
      if (!elementRef.current || !canAnimate) return;
      if (hoverEffect === "none" || hoverEffect === "shine" || hoverEffect === "magnetic") return;

      const el = elementRef.current;
      const durationSec = duration / 1000;

      const getHoverProps = (): gsap.TweenVars => {
        switch (hoverEffect) {
          case "scale":
            return { scale: hoverScale };
          case "lift":
            return { y: -2, boxShadow: "0 8px 25px -5px rgba(0,0,0,0.15)" };
          case "glow":
            return { boxShadow: "0 0 20px 2px var(--ring)" };
          default:
            return {};
        }
      };

      const resetProps = (): gsap.TweenVars => {
        switch (hoverEffect) {
          case "scale":
            return { scale: 1 };
          case "lift":
            return { y: 0, boxShadow: "none" };
          case "glow":
            return { boxShadow: "none" };
          default:
            return {};
        }
      };

      const handleMouseEnter = () => {
        gsap.to(el, {
          ...getHoverProps(),
          duration: durationSec,
          ease: easing,
        });
      };

      const handleMouseLeave = () => {
        gsap.to(el, {
          ...resetProps(),
          duration: durationSec,
          ease: easing,
        });
      };

      el.addEventListener("mouseenter", handleMouseEnter);
      el.addEventListener("mouseleave", handleMouseLeave);

      return () => {
        el.removeEventListener("mouseenter", handleMouseEnter);
        el.removeEventListener("mouseleave", handleMouseLeave);
      };
    },
    { dependencies: [canAnimate, hoverEffect, hoverScale, duration, easing] },
  );

  // Click handler for ripple/bounce/press effects
  const handleClick = useCallback(
    (event: React.MouseEvent<T>) => {
      if (!canAnimate || !elementRef.current) return;
      const el = elementRef.current;
      const durationSec = duration / 1000;

      switch (clickEffect) {
        case "ripple": {
          const rect = el.getBoundingClientRect();

          // Use cursor position relative to the element so the ripple spawns at the click point
          const x = event.clientX - rect.left;
          const y = event.clientY - rect.top;

          const size = Math.max(rect.width, rect.height) * 2;
          const ripple = document.createElement("span");
          ripple.className = "cc-ripple";
          ripple.style.width = `${size}px`;
          ripple.style.height = `${size}px`;
          ripple.style.left = `${x}px`;
          ripple.style.top = `${y}px`;
          el.appendChild(ripple);
          ripple.addEventListener("animationend", () => ripple.remove());
          break;
        }
        case "bounce": {
          gsap.fromTo(
            el,
            { scale: pressScale },
            { scale: 1, duration: durationSec * 1.5, ease: "elastic.out(1, 0.5)" },
          );
          break;
        }
        case "press": {
          gsap.to(el, {
            scale: pressScale,
            duration: durationSec / 3,
            ease: "power2.out",
            onComplete: () => {
              gsap.to(el, {
                scale: 1,
                duration: durationSec / 2,
                ease: "power2.out",
              });
            },
          });
          break;
        }
        case "pulse": {
          gsap.fromTo(
            el,
            { scale: 1 },
            {
              scale: 1.05,
              duration: durationSec / 2,
              ease: "power2.out",
              yoyo: true,
              repeat: 1,
            },
          );
          break;
        }
        default:
          break;
      }
    },
    [canAnimate, clickEffect, pressScale, duration],
  );

  // Focus effect CSS classes
  const focusClasses = (() => {
    switch (focusEffect) {
      case "ring":
        return "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
      case "glow":
        return "focus-visible:outline-none focus-visible:shadow-[0_0_0_3px_var(--ring)]";
      case "outline":
        return "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring";
      case "none":
        return "focus-visible:outline-none";
      default:
        return "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
    }
  })();

  // Container classes for effects that need positioning
  const containerClasses =
    clickEffect === "ripple" ? "cc-ripple-container relative overflow-hidden" : "";

  return {
    ref: elementRef,
    mergedRef,
    handleClick,
    focusClasses,
    containerClasses,
    config: {
      hoverEffect,
      clickEffect,
      focusEffect,
      hoverScale,
      pressScale,
      duration,
      easing,
    },
  };
}

export default useButtonAnimation;
