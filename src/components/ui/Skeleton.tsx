"use client";

import { forwardRef, type HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useReducedMotion } from "@/hooks";
import { cn } from "@/lib/utils";

// ============================================================================
// Variants
// ============================================================================

export const skeletonVariants = tv({
  base: "animate-pulse bg-muted",
  variants: {
    variant: {
      default: "rounded-md",
      circular: "rounded-full",
      rectangular: "rounded-none",
      text: "rounded-sm h-4 w-full",
    },
    animation: {
      pulse: "animate-pulse",
      wave: "animate-shimmer bg-gradient-to-r from-muted via-muted-foreground/10 to-muted bg-[length:200%_100%]",
      none: "",
    },
  },
  defaultVariants: {
    variant: "default",
    animation: "pulse",
  },
});

// ============================================================================
// Types
// ============================================================================

export interface SkeletonProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof skeletonVariants> {
  /** Width of the skeleton */
  width?: string | number;
  /** Height of the skeleton */
  height?: string | number;
  /** Number of skeleton lines (for text variant) */
  lines?: number;
  /** Gap between lines */
  gap?: string;
}

// ============================================================================
// Component
// ============================================================================

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { className, variant, animation, width, height, lines, gap = "0.5rem", style, ...props },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotion();

    // Disable animations if user prefers reduced motion
    const effectiveAnimation = prefersReducedMotion ? "none" : animation;

    // Handle multiple lines for text variant
    if (lines && lines > 1) {
      return (
        <div
          ref={ref}
          className="flex flex-col"
          style={{ gap }}
          role="progressbar"
          aria-busy="true"
          aria-label="Loading content"
          {...props}
        >
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={cn(
                skeletonVariants({ variant: "text", animation: effectiveAnimation }),
                className,
              )}
              style={{
                width: index === lines - 1 ? "70%" : width || "100%",
                height: height || undefined,
                ...style,
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(skeletonVariants({ variant, animation: effectiveAnimation }), className)}
        style={{
          width: typeof width === "number" ? `${width}px` : width,
          height: typeof height === "number" ? `${height}px` : height,
          ...style,
        }}
        role="progressbar"
        aria-busy="true"
        aria-label="Loading"
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

// ============================================================================
// Preset Skeletons
// ============================================================================

export interface SkeletonAvatarProps extends Omit<SkeletonProps, "variant"> {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

const avatarSizes = {
  xs: 24,
  sm: 32,
  md: 40,
  lg: 48,
  xl: 64,
};

export const SkeletonAvatar = forwardRef<HTMLDivElement, SkeletonAvatarProps>(
  ({ size = "md", className, ...props }, ref) => {
    const dimension = avatarSizes[size];
    return (
      <Skeleton
        ref={ref}
        variant="circular"
        width={dimension}
        height={dimension}
        className={className}
        {...props}
      />
    );
  },
);

SkeletonAvatar.displayName = "SkeletonAvatar";

export interface SkeletonCardProps extends HTMLAttributes<HTMLDivElement> {
  /** Show avatar in header */
  showAvatar?: boolean;
  /** Number of text lines in body */
  bodyLines?: number;
  /** Show image placeholder */
  showImage?: boolean;
}

export const SkeletonCard = forwardRef<HTMLDivElement, SkeletonCardProps>(
  ({ className, showAvatar = true, bodyLines = 3, showImage = false, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("space-y-4 rounded-lg border border-border bg-card p-4", className)}
        {...props}
      >
        {/* Image */}
        {showImage && <Skeleton variant="rectangular" className="h-40 w-full rounded-md" />}

        {/* Header */}
        <div className="flex items-center gap-3">
          {showAvatar && <SkeletonAvatar size="md" />}
          <div className="flex-1 space-y-2">
            <Skeleton variant="text" className="h-4 w-3/4" />
            <Skeleton variant="text" className="h-3 w-1/2" />
          </div>
        </div>

        {/* Body */}
        <Skeleton variant="text" lines={bodyLines} />
      </div>
    );
  },
);

SkeletonCard.displayName = "SkeletonCard";

export default Skeleton;
