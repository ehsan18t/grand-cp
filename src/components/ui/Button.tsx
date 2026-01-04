"use client";

import { Slot } from "@radix-ui/react-slot";
import React, { type ButtonHTMLAttributes, forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import type { ClickEffect, FocusEffect, HoverEffect } from "@/context";
import { type ButtonAnimationOptions, useButtonAnimation } from "@/hooks";
import { cn } from "@/lib/utils";

// ============================================================================
// Variants
// ============================================================================

export const buttonVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-2",
    "font-medium whitespace-nowrap",
    "rounded-md",
    // Smooth transitions for colors, shadows, borders
    "transition-all duration-200 ease-out",
    // Disabled state
    "disabled:pointer-events-none disabled:opacity-50",
    // Icon sizing within button
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
    // GPU acceleration to prevent text blur during transforms
    "transform-gpu will-change-transform",
  ],
  variants: {
    variant: {
      primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
      secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80 shadow-sm",
      destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
      success: "bg-success text-success-foreground hover:bg-success/90 shadow-sm",
      warning: "bg-warning text-warning-foreground hover:bg-warning/90 shadow-sm",
      outline: [
        "border-2 border-border bg-transparent",
        "hover:bg-accent/10 hover:border-accent",
        "text-foreground",
      ],
      ghost: ["bg-transparent", "hover:bg-muted", "text-foreground"],
      link: ["bg-transparent text-primary", "underline-offset-4 hover:underline", "p-0 h-auto"],
    },
    size: {
      xs: "h-7 px-2 text-xs [&_svg]:size-3",
      sm: "h-8 px-3 text-xs [&_svg]:size-3.5",
      md: "h-10 px-4 text-sm [&_svg]:size-4",
      lg: "h-12 px-6 text-base [&_svg]:size-5",
      xl: "h-14 px-8 text-lg [&_svg]:size-6",
    },
    iconSize: {
      xs: "size-7 p-0",
      sm: "size-8 p-0",
      md: "size-10 p-0",
      lg: "size-12 p-0",
      xl: "size-14 p-0",
    },
    fullWidth: {
      true: "w-full",
    },
    rounded: {
      none: "rounded-none",
      sm: "rounded-sm",
      default: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
      full: "rounded-full",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "md",
    rounded: "default",
  },
});

// ============================================================================
// Types
// ============================================================================

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants>,
    Omit<ButtonAnimationOptions, "disabled" | "isLoading"> {
  /** Render as child element (polymorphism) */
  asChild?: boolean;
  /** Icon-only button (uses iconSize instead of size) */
  iconOnly?: boolean;
  /** Show loading spinner */
  isLoading?: boolean;
  /** Loading text (replaces children when loading) */
  loadingText?: string;
  /** Custom loading spinner */
  loadingSpinner?: React.ReactNode;
  /** Spinner position when loading */
  spinnerPlacement?: "start" | "end";
  /** Icon to show before children */
  leftIcon?: React.ReactNode;
  /** Icon to show after children */
  rightIcon?: React.ReactNode;
  // Animation props (from ButtonAnimationOptions)
  /** Animation preset: subtle, playful, material, minimal, none */
  preset?: string;
  /** Enable/disable animations */
  animated?: boolean;
  /** Hover effect type */
  hoverEffect?: HoverEffect;
  /** Click effect type */
  clickEffect?: ClickEffect;
  /** Focus effect type */
  focusEffect?: FocusEffect;
  /** Hover scale factor */
  hoverScale?: number;
  /** Press scale factor */
  pressScale?: number;
  /** Animation duration */
  duration?: number | "fast" | "default" | "slow";
  /** Animation easing */
  easing?: "default" | "bounce" | "smooth" | string;
}

// ============================================================================
// Loading Spinner
// ============================================================================

function DefaultSpinner({ className }: { className?: string }) {
  return (
    <svg
      className={cn("animate-spin", className)}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      iconSize,
      fullWidth,
      rounded,
      asChild = false,
      iconOnly = false,
      isLoading = false,
      loadingText,
      loadingSpinner,
      spinnerPlacement = "start",
      leftIcon,
      rightIcon,
      disabled,
      children,
      onClick,
      // Animation props
      preset = "subtle",
      animated,
      hoverEffect,
      clickEffect,
      focusEffect,
      hoverScale,
      pressScale,
      duration,
      easing,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || isLoading;
    const Comp = asChild ? Slot : "button";

    // Use the animation hook
    const {
      mergedRef,
      handleClick: animationClick,
      focusClasses,
      containerClasses,
    } = useButtonAnimation<HTMLButtonElement>(
      {
        preset,
        animated,
        hoverEffect,
        clickEffect,
        focusEffect,
        hoverScale,
        pressScale,
        duration,
        easing,
        disabled: isDisabled,
        isLoading,
      },
      ref,
    );

    // Combined click handler
    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
      if (isDisabled) {
        event.preventDefault();
        return;
      }
      animationClick(event);
      onClick?.(event);
    };

    // Determine size class
    const sizeClass = iconOnly ? undefined : size;
    const iconSizeClass = iconOnly ? (iconSize ?? size ?? "md") : undefined;

    // Spinner element
    const spinner = loadingSpinner ?? <DefaultSpinner className="size-4" />;

    // For asChild, just pass through the children directly
    // (icons and loading state are not supported with asChild)
    const content = asChild ? (
      children
    ) : isLoading ? (
      <>
        {spinnerPlacement === "start" && spinner}
        {loadingText && <span>{loadingText}</span>}
        {spinnerPlacement === "end" && spinner}
      </>
    ) : (
      <>
        {leftIcon}
        {children}
        {rightIcon}
      </>
    );

    return (
      <Comp
        ref={mergedRef}
        className={cn(
          buttonVariants({
            variant,
            size: sizeClass,
            iconSize: iconSizeClass,
            fullWidth,
            rounded,
          }),
          focusClasses,
          containerClasses,
          className,
        )}
        disabled={isDisabled}
        onClick={handleClick}
        aria-disabled={isDisabled}
        aria-busy={isLoading}
        {...props}
      >
        {content}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export default Button;
