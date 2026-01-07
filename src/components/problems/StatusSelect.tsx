"use client";

import { ChevronDown, Circle, CircleCheck, CircleDot, RotateCcw, SkipForward } from "lucide-react";

import { forwardRef, useState } from "react";
import { tv } from "tailwind-variants";
import { LoginPrompt } from "@/components/auth";
import { cn } from "@/lib/utils";
import type { ProblemStatus } from "@/types/domain";

/** @deprecated Use ProblemStatus from @/types/domain instead */
export type StatusValue = ProblemStatus;

interface StatusOption {
  value: ProblemStatus;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
}

const statusOptions: StatusOption[] = [
  {
    value: "untouched",
    label: "Untouched",
    icon: <Circle className="h-4 w-4" />,
    colorClass: "bg-status-untouched text-status-untouched-foreground",
  },
  {
    value: "attempting",
    label: "Attempting",
    icon: <CircleDot className="h-4 w-4" />,
    colorClass: "bg-status-attempting text-status-attempting-foreground",
  },
  {
    value: "solved",
    label: "Solved",
    icon: <CircleCheck className="h-4 w-4" />,
    colorClass: "bg-status-solved text-status-solved-foreground",
  },
  {
    value: "revisit",
    label: "Revisit",
    icon: <RotateCcw className="h-4 w-4" />,
    colorClass: "bg-status-revisit text-status-revisit-foreground",
  },
  {
    value: "skipped",
    label: "Skipped",
    icon: <SkipForward className="h-4 w-4" />,
    colorClass: "bg-status-skipped text-status-skipped-foreground",
  },
];

const selectVariants = tv({
  slots: {
    trigger: [
      "inline-flex items-center justify-between gap-1.5",
      "rounded-full px-2.5 py-1.5 text-xs font-medium",
      "cursor-pointer transition-all duration-200",
      "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      // Slightly larger tap target on mobile
      "min-h-[32px] sm:min-h-0 sm:gap-2 sm:px-3",
    ],
    guestTrigger: [
      "inline-flex items-center justify-between gap-1.5",
      "rounded-full px-2.5 py-1.5 text-xs font-medium",
      "cursor-pointer transition-all duration-200",
      "hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      "min-h-[32px] sm:min-h-0 sm:gap-2 sm:px-3",
      // Guest-specific styling - looks like untouched but muted
      "bg-status-untouched/50 text-status-untouched-foreground/70",
      "hover:bg-status-untouched/70",
    ],
    menu: [
      "absolute right-0 top-full z-50 mt-1",
      "min-w-[140px] rounded-lg border border-border bg-popover p-1",
      "shadow-lg shadow-black/10 dark:shadow-black/30",
      // Ensure menu doesn't overflow viewport on mobile
      "max-w-[calc(100vw-2rem)]",
    ],
    option: [
      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
      "cursor-pointer transition-colors",
      "hover:bg-accent",
      // Larger touch target on mobile
      "min-h-[40px] sm:min-h-0",
    ],
  },
});

export interface StatusSelectProps {
  value: ProblemStatus;
  onChange: (value: ProblemStatus) => void;
  disabled?: boolean;
  /** When true, shows a guest-mode version that prompts for login */
  isGuest?: boolean;
  className?: string;
}

export const StatusSelect = forwardRef<HTMLDivElement, StatusSelectProps>(function StatusSelect(
  { value, onChange, disabled = false, isGuest = false, className },
  ref,
) {
  const [isOpen, setIsOpen] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const styles = selectVariants();
  const currentOption = statusOptions.find((opt) => opt.value === value) ?? statusOptions[0];

  const handleSelect = (newValue: ProblemStatus) => {
    onChange(newValue);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (isGuest) {
        setShowLoginPrompt(true);
      } else {
        setIsOpen(!isOpen);
      }
    }
  };

  const handleClick = () => {
    if (disabled) return;
    if (isGuest) {
      setShowLoginPrompt(true);
    } else {
      setIsOpen(!isOpen);
    }
  };

  // Guest mode - show muted badge that opens login prompt
  if (isGuest) {
    return (
      <>
        <div ref={ref} className={cn("relative", className)}>
          <button
            type="button"
            onClick={handleClick}
            onKeyDown={handleKeyDown}
            className={styles.guestTrigger()}
            title="Sign in to track progress"
          >
            <Circle className="h-3.5 w-3.5" />
            <span>Untouched</span>
          </button>
        </div>
        <LoginPrompt
          isOpen={showLoginPrompt}
          onClose={() => setShowLoginPrompt(false)}
          feature="status"
        />
      </>
    );
  }

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          styles.trigger(),
          currentOption.colorClass,
          disabled && "cursor-not-allowed opacity-50",
        )}
      >
        {currentOption.icon}
        <span>{currentOption.label}</span>
        <ChevronDown className={cn("h-3 w-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />

          {/* Menu */}
          <div className={styles.menu()}>
            {statusOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option.value)}
                className={cn(styles.option(), option.value === value && "bg-accent")}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-full",
                    option.colorClass,
                  )}
                >
                  {option.icon}
                </span>
                <span>{option.label}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
});

StatusSelect.displayName = "StatusSelect";

export { statusOptions };
