"use client";

import { Laptop, Moon, Sun } from "lucide-react";
import { useMemo } from "react";
import {
  Dropdown,
  DropdownContent,
  DropdownItem,
  DropdownLabel,
  DropdownTrigger,
} from "@/components/ui";
import { type Theme, useTheme } from "@/context";
import { cn } from "@/lib/utils";

const THEMES: Array<{ value: Theme; label: string; icon: React.ReactNode }> = [
  { value: "light", label: "Light", icon: <Sun aria-hidden="true" /> },
  { value: "dark", label: "Dark", icon: <Moon aria-hidden="true" /> },
  { value: "system", label: "System", icon: <Laptop aria-hidden="true" /> },
];

export interface ThemeSwitcherProps {
  className?: string;
  align?: "start" | "center" | "end";
}

export function ThemeSwitcher({ className, align = "end" }: ThemeSwitcherProps) {
  const { theme, resolvedTheme, setTheme, isLoading } = useTheme();

  const triggerIcon = useMemo(() => {
    if (theme === "system") return <Laptop className="size-4" aria-hidden="true" />;
    return resolvedTheme === "dark" ? (
      <Moon className="size-4" aria-hidden="true" />
    ) : (
      <Sun className="size-4" aria-hidden="true" />
    );
  }, [resolvedTheme, theme]);

  return (
    <Dropdown>
      <DropdownTrigger
        showChevron={false}
        aria-label="Change theme"
        disabled={isLoading}
        className={cn(
          "h-10 w-10 justify-center px-0",
          "bg-transparent",
          "hover:border-accent hover:bg-accent",
          className,
        )}
      >
        {triggerIcon}
      </DropdownTrigger>
      <DropdownContent align={align} className="min-w-40">
        <DropdownLabel>Theme</DropdownLabel>
        {THEMES.map((t) => (
          <DropdownItem
            key={t.value}
            icon={t.icon}
            shortcut={theme === t.value ? "✓" : undefined}
            onSelect={() => setTheme(t.value)}
          >
            {t.label}
          </DropdownItem>
        ))}
      </DropdownContent>
    </Dropdown>
  );
}

}
