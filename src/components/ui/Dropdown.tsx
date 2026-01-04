"use client";

import { useGSAP } from "@gsap/react";
import { Slot } from "@radix-ui/react-slot";
import gsap from "gsap";
import { ChevronDown } from "lucide-react";
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// ============================================================================
// Variants
// ============================================================================

export const dropdownVariants = tv({
  slots: {
    trigger: [
      "inline-flex items-center justify-between gap-2",
      "rounded-md border border-border bg-background px-3 py-2",
      "text-sm font-medium",
      "transition-[border-color,box-shadow,background-color] duration-200 ease-out",
      "hover:bg-accent/50 hover:border-accent",
      "focus-visible:outline-none focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_oklch(from_var(--primary)_l_c_h_/_0.15)]",
      "active:scale-[0.98]",
      "disabled:pointer-events-none disabled:opacity-50",
    ],
    content: [
      "absolute z-50 min-w-[8rem] overflow-hidden",
      "rounded-md border border-border bg-popover p-1",
      "shadow-lg shadow-black/10 dark:shadow-black/30",
    ],
    item: [
      "relative flex cursor-pointer select-none items-center gap-2",
      "rounded-sm px-2 py-1.5 text-sm outline-none",
      "transition-colors duration-150 ease-out",
      "hover:bg-accent hover:text-accent-foreground",
      "focus:bg-accent focus:text-accent-foreground",
      "active:bg-accent/80",
      "data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
    ],
    separator: "my-1 h-px bg-border",
    label: "px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground",
  },
  variants: {
    align: {
      start: {
        content: "left-0",
      },
      center: {
        content: "left-1/2 -translate-x-1/2",
      },
      end: {
        content: "right-0",
      },
    },
    side: {
      top: {
        content: "bottom-full mb-1",
      },
      bottom: {
        content: "top-full mt-1",
      },
    },
  },
  defaultVariants: {
    align: "start",
    side: "bottom",
  },
});

// ============================================================================
// Context
// ============================================================================

interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLButtonElement | null>;
  contentRef: React.RefObject<HTMLDivElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | undefined>(undefined);

function useDropdown() {
  const context = useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within a Dropdown");
  }
  return context;
}

// ============================================================================
// Types
// ============================================================================

export interface DropdownProps extends HTMLAttributes<HTMLDivElement> {
  /** Controlled open state */
  open?: boolean;
  /** Default open state (uncontrolled) */
  defaultOpen?: boolean;
  /** Callback when open state changes */
  onOpenChange?: (open: boolean) => void;
}

export interface DropdownTriggerProps extends HTMLAttributes<HTMLButtonElement> {
  /** Whether to show chevron icon */
  showChevron?: boolean;
  /** Render as child element instead of button */
  asChild?: boolean;
}

export interface DropdownContentProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof dropdownVariants> {
  /** Animation duration in seconds */
  animationDuration?: number;
}

export interface DropdownItemProps extends HTMLAttributes<HTMLDivElement> {
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Icon to show before text */
  icon?: ReactNode;
  /** Shortcut text */
  shortcut?: string;
  /** Callback when item is selected */
  onSelect?: () => void;
}

// ============================================================================
// Components
// ============================================================================

export const Dropdown = forwardRef<HTMLDivElement, DropdownProps>(
  (
    { open: controlledOpen, defaultOpen = false, onOpenChange, children, className, ...props },
    ref,
  ) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);

    const open = controlledOpen !== undefined ? controlledOpen : internalOpen;

    const setOpen = useCallback(
      (newOpen: boolean) => {
        if (controlledOpen === undefined) {
          setInternalOpen(newOpen);
        }
        onOpenChange?.(newOpen);
      },
      [controlledOpen, onOpenChange],
    );

    // Close on click outside
    useEffect(() => {
      if (!open) return;

      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Node;
        if (!triggerRef.current?.contains(target) && !contentRef.current?.contains(target)) {
          setOpen(false);
        }
      };

      document.addEventListener("mousedown", handleClickOutside as EventListener);
      return () => document.removeEventListener("mousedown", handleClickOutside as EventListener);
    }, [open, setOpen]);

    // Close on escape
    useEffect(() => {
      if (!open) return;

      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") {
          setOpen(false);
          triggerRef.current?.focus();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [open, setOpen]);

    return (
      <DropdownContext.Provider value={{ open, setOpen, triggerRef, contentRef }}>
        <div ref={ref} className={cn("relative inline-block", className)} {...props}>
          {children}
        </div>
      </DropdownContext.Provider>
    );
  },
);

Dropdown.displayName = "Dropdown";

export const DropdownTrigger = forwardRef<HTMLButtonElement, DropdownTriggerProps>(
  ({ className, children, showChevron = true, asChild = false, ...props }, ref) => {
    const { open, setOpen, triggerRef } = useDropdown();
    const styles = dropdownVariants();

    // Merge refs
    const mergedRef = (node: HTMLButtonElement) => {
      (triggerRef as React.MutableRefObject<HTMLButtonElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const handleClick = () => setOpen(!open);

    const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
        e.preventDefault();
        setOpen(true);
      }
    };

    // When using asChild, Slot requires exactly one child element
    if (asChild) {
      return (
        <Slot
          ref={mergedRef}
          className={cn(styles.trigger(), className)}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          aria-expanded={open}
          aria-haspopup="menu"
          {...props}
        >
          {children}
        </Slot>
      );
    }

    return (
      <button
        ref={mergedRef}
        type="button"
        className={cn(styles.trigger(), className)}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        aria-expanded={open}
        aria-haspopup="menu"
        {...props}
      >
        {children}
        {showChevron && (
          <ChevronDown
            className={cn("size-4 transition-transform duration-200", open && "rotate-180")}
            aria-hidden="true"
          />
        )}
      </button>
    );
  },
);

DropdownTrigger.displayName = "DropdownTrigger";

export const DropdownContent = forwardRef<HTMLDivElement, DropdownContentProps>(
  ({ className, align, side, animationDuration = 0.2, children, ...props }, ref) => {
    const { open, contentRef } = useDropdown();
    const [isVisible, setIsVisible] = useState(false);
    const prefersReducedMotion = useReducedMotion();
    const styles = dropdownVariants({ align, side });

    // Merge refs
    const mergedRef = (node: HTMLDivElement) => {
      (contentRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Handle visibility state for exit animation
    useEffect(() => {
      if (open) {
        setIsVisible(true);
      } else if (!prefersReducedMotion) {
        // Delay hiding for exit animation
        const timer = setTimeout(() => {
          setIsVisible(false);
        }, animationDuration * 1000);
        return () => clearTimeout(timer);
      } else {
        setIsVisible(false);
      }
    }, [open, animationDuration, prefersReducedMotion]);

    // GSAP animation
    useGSAP(
      () => {
        if (!contentRef.current || prefersReducedMotion) return;

        if (open) {
          // Enter animation
          gsap.fromTo(
            contentRef.current,
            { opacity: 0, y: -8, scale: 0.95 },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: animationDuration,
              ease: "power2.out",
            },
          );
        } else if (isVisible) {
          // Exit animation
          gsap.to(contentRef.current, {
            opacity: 0,
            y: -8,
            scale: 0.95,
            duration: animationDuration,
            ease: "power2.in",
          });
        }
      },
      { dependencies: [open, isVisible, animationDuration] },
    );

    if (!isVisible) return null;

    return (
      <div ref={mergedRef} className={cn(styles.content(), className)} role="menu" {...props}>
        {children}
      </div>
    );
  },
);

DropdownContent.displayName = "DropdownContent";

export const DropdownItem = forwardRef<HTMLDivElement, DropdownItemProps>(
  ({ className, disabled, icon, shortcut, onSelect, children, ...props }, ref) => {
    const { setOpen } = useDropdown();
    const styles = dropdownVariants();

    const handleClick = () => {
      if (disabled) return;
      onSelect?.();
      setOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    };

    return (
      <div
        ref={ref}
        className={cn(styles.item(), className)}
        role="menuitem"
        tabIndex={disabled ? -1 : 0}
        data-disabled={disabled || undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        {...props}
      >
        {icon && <span className="[&_svg]:size-4">{icon}</span>}
        <span className="flex-1">{children}</span>
        {shortcut && <span className="ml-auto text-muted-foreground text-xs">{shortcut}</span>}
      </div>
    );
  },
);

DropdownItem.displayName = "DropdownItem";

export const DropdownSeparator = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const styles = dropdownVariants();
    return (
      <div
        ref={ref}
        className={cn(styles.separator(), className)}
        role="none"
        aria-hidden="true"
        {...props}
      />
    );
  },
);

DropdownSeparator.displayName = "DropdownSeparator";

export const DropdownLabel = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const styles = dropdownVariants();
    return <div ref={ref} className={cn(styles.label(), className)} {...props} />;
  },
);

DropdownLabel.displayName = "DropdownLabel";

export default Dropdown;
