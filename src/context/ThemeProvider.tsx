"use client";

import { createContext, type ReactNode, useCallback, useContext, useEffect, useState } from "react";

// ============================================================================
// Types
// ============================================================================

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextValue {
  /** Current theme setting (includes "system") */
  theme: Theme;
  /** Resolved theme (actual applied theme - light or dark) */
  resolvedTheme: ResolvedTheme;
  /** Set the theme */
  setTheme: (theme: Theme) => void;
  /** Toggle between light and dark */
  toggleTheme: () => void;
  /** Whether theme is currently being determined */
  isLoading: boolean;
}

interface ThemeProviderProps {
  children: ReactNode;
  /** Default theme to use */
  defaultTheme?: Theme;
  /** Storage key for persisting theme */
  storageKey?: string;
  /** Attribute to set on html element */
  attribute?: "class" | "data-theme";
  /** Enable system theme detection */
  enableSystem?: boolean;
  /** Disable transitions on theme change to prevent flash */
  disableTransitionOnChange?: boolean;
}

// ============================================================================
// Context
// ============================================================================

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

// ============================================================================
// Utilities
// ============================================================================

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function getStoredTheme(storageKey: string): Theme | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = localStorage.getItem(storageKey);
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
  } catch {
    // localStorage not available
  }
  return null;
}

function resolveTheme(theme: Theme, enableSystem: boolean): ResolvedTheme {
  if (theme === "system" && enableSystem) {
    return getSystemTheme();
  }
  return theme === "dark" ? "dark" : "light";
}

// ============================================================================
// Provider Component
// ============================================================================

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "theme",
  attribute = "data-theme",
  enableSystem = true,
  disableTransitionOnChange = false,
}: ThemeProviderProps) {
  // SSR-safe: Always start with "light" to match server, then hydrate
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
  const [isLoading, setIsLoading] = useState(true);

  // Initialize theme from storage on mount (client-side only)
  useEffect(() => {
    const stored = getStoredTheme(storageKey);
    const currentTheme = stored || defaultTheme;
    setThemeState(currentTheme);
    setResolvedTheme(resolveTheme(currentTheme, enableSystem));
    setIsLoading(false);
  }, [storageKey, enableSystem, defaultTheme]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    const resolved = resolveTheme(theme, enableSystem);

    // Optionally disable transitions during theme change
    if (disableTransitionOnChange) {
      root.style.setProperty("transition", "none");
    }

    // Apply the theme
    if (attribute === "class") {
      root.classList.remove("light", "dark");
      root.classList.add(resolved);
    } else {
      root.setAttribute("data-theme", resolved);
    }

    setResolvedTheme(resolved);

    // Re-enable transitions
    if (disableTransitionOnChange) {
      // Force a reflow
      void root.offsetHeight;
      root.style.removeProperty("transition");
    }
  }, [theme, attribute, enableSystem, disableTransitionOnChange]);

  // Listen for system theme changes
  useEffect(() => {
    if (!enableSystem || theme !== "system") return;

    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e: MediaQueryListEvent) => {
      setResolvedTheme(e.matches ? "dark" : "light");
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [theme, enableSystem]);

  // Set theme and persist to storage
  const setTheme = useCallback(
    (newTheme: Theme) => {
      setThemeState(newTheme);
      try {
        localStorage.setItem(storageKey, newTheme);
      } catch {
        // localStorage not available
      }
    },
    [storageKey],
  );

  // Toggle between light and dark
  const toggleTheme = useCallback(() => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  }, [resolvedTheme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        isLoading,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

// ============================================================================
// Script for preventing flash (inject in head)
// ============================================================================

export const themeScript = `
(function() {
  const storageKey = 'theme';
  const attribute = 'data-theme';
  
  function getTheme() {
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored === 'light' || stored === 'dark') return stored;
      if (stored === 'system' || !stored) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    } catch {}
    return 'light';
  }
  
  document.documentElement.setAttribute(attribute, getTheme());
})();
`;
