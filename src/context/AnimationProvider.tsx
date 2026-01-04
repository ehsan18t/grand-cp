"use client";

import { createContext, type ReactNode, useCallback, useContext, useMemo } from "react";
import { useReducedMotion } from "@/hooks";

// ============================================================================
// Types
// ============================================================================

export type HoverEffect = "none" | "scale" | "lift" | "glow" | "shine" | "magnetic";
export type ClickEffect = "none" | "ripple" | "pulse" | "bounce" | "press";
export type FocusEffect = "none" | "ring" | "glow" | "outline";

export interface AnimationPreset {
  name: string;
  hoverEffect: HoverEffect;
  clickEffect: ClickEffect;
  focusEffect: FocusEffect;
  hoverScale?: number;
  pressScale?: number;
  duration?: number;
  easing?: string;
}

export interface AnimationConfig {
  /** Global enable/disable animations */
  enabled: boolean;
  /** How to handle reduced motion preference */
  reducedMotion: "respect" | "always-reduce" | "ignore";
  /** Duration presets in ms */
  duration: {
    fast: number;
    default: number;
    slow: number;
  };
  /** Easing presets */
  easing: {
    default: string;
    bounce: string;
    smooth: string;
  };
  /** Built-in and user-defined animation presets */
  presets: Record<string, AnimationPreset>;
}

interface AnimationContextValue {
  config: AnimationConfig;
  /** Whether animations should run (respects reducedMotion setting) */
  shouldAnimate: boolean;
  /** Get a preset by name */
  getPreset: (name: string) => AnimationPreset | undefined;
  /** Get duration value from preset name or number */
  getDuration: (value: number | "fast" | "default" | "slow") => number;
  /** Get easing value from preset name or string */
  getEasing: (value: "default" | "bounce" | "smooth" | string) => string;
}

interface AnimationProviderProps {
  children: ReactNode;
  /** Override default config */
  config?: Partial<AnimationConfig>;
  /** Additional user-defined presets */
  presets?: Record<string, AnimationPreset>;
}

// ============================================================================
// Default Configuration
// ============================================================================

const builtInPresets: Record<string, AnimationPreset> = {
  subtle: {
    name: "subtle",
    hoverEffect: "scale",
    clickEffect: "press",
    focusEffect: "ring",
    hoverScale: 1.02,
    pressScale: 0.98,
  },
  playful: {
    name: "playful",
    hoverEffect: "lift",
    clickEffect: "bounce",
    focusEffect: "glow",
    hoverScale: 1.05,
    pressScale: 0.95,
    easing: "bounce",
  },
  material: {
    name: "material",
    hoverEffect: "glow",
    clickEffect: "ripple",
    focusEffect: "ring",
    hoverScale: 1,
    pressScale: 1,
  },
  minimal: {
    name: "minimal",
    hoverEffect: "none",
    clickEffect: "press",
    focusEffect: "ring",
    hoverScale: 1,
    pressScale: 0.98,
  },
  none: {
    name: "none",
    hoverEffect: "none",
    clickEffect: "none",
    focusEffect: "ring",
    hoverScale: 1,
    pressScale: 1,
  },
};

const defaultConfig: AnimationConfig = {
  enabled: true,
  reducedMotion: "respect",
  duration: {
    fast: 150,
    default: 300,
    slow: 500,
  },
  easing: {
    default: "cubic-bezier(0.4, 0, 0.2, 1)",
    bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
    smooth: "cubic-bezier(0.25, 0.1, 0.25, 1)",
  },
  presets: builtInPresets,
};

// ============================================================================
// Context
// ============================================================================

const AnimationContext = createContext<AnimationContextValue | undefined>(undefined);

// ============================================================================
// Provider Component
// ============================================================================

export function AnimationProvider({
  children,
  config: userConfig,
  presets: userPresets,
}: AnimationProviderProps) {
  const prefersReducedMotion = useReducedMotion();

  // Merge configs
  const config = useMemo<AnimationConfig>(() => {
    const merged: AnimationConfig = {
      ...defaultConfig,
      ...userConfig,
      duration: { ...defaultConfig.duration, ...userConfig?.duration },
      easing: { ...defaultConfig.easing, ...userConfig?.easing },
      presets: { ...defaultConfig.presets, ...userConfig?.presets, ...userPresets },
    };
    return merged;
  }, [userConfig, userPresets]);

  // Determine if animations should run
  const shouldAnimate = useMemo(() => {
    if (!config.enabled) return false;
    if (config.reducedMotion === "always-reduce") return false;
    if (config.reducedMotion === "ignore") return true;
    return !prefersReducedMotion;
  }, [config.enabled, config.reducedMotion, prefersReducedMotion]);

  const getPreset = useCallback((name: string) => config.presets[name], [config.presets]);

  const getDuration = useCallback(
    (value: number | "fast" | "default" | "slow") => {
      if (typeof value === "number") return value;
      return config.duration[value] ?? config.duration.default;
    },
    [config.duration],
  );

  const getEasing = useCallback(
    (value: "default" | "bounce" | "smooth" | string) => {
      if (value in config.easing) {
        return config.easing[value as keyof typeof config.easing];
      }
      return value;
    },
    [config.easing],
  );

  const contextValue = useMemo<AnimationContextValue>(
    () => ({
      config,
      shouldAnimate,
      getPreset,
      getDuration,
      getEasing,
    }),
    [config, shouldAnimate, getPreset, getDuration, getEasing],
  );

  return <AnimationContext.Provider value={contextValue}>{children}</AnimationContext.Provider>;
}

// ============================================================================
// Hook
// ============================================================================

export function useAnimation(): AnimationContextValue {
  const context = useContext(AnimationContext);
  if (context === undefined) {
    // Return sensible defaults if used outside provider
    return {
      config: defaultConfig,
      shouldAnimate: true,
      getPreset: (name) => defaultConfig.presets[name],
      getDuration: (v) => (typeof v === "number" ? v : (defaultConfig.duration[v] ?? 300)),
      getEasing: (v) =>
        v in defaultConfig.easing
          ? defaultConfig.easing[v as keyof typeof defaultConfig.easing]
          : v,
    };
  }
  return context;
}

// ============================================================================
// Exports
// ============================================================================

export { builtInPresets, defaultConfig };
