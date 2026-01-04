"use client";

import Image, { type ImageProps } from "next/image";
import { forwardRef, type HTMLAttributes, useState } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

// ============================================================================
// Variants
// ============================================================================

export const avatarVariants = tv({
  slots: {
    root: "relative flex shrink-0 overflow-hidden rounded-full",
    image: "aspect-square h-full w-full object-cover",
    fallback: [
      "flex h-full w-full items-center justify-center",
      "bg-muted text-muted-foreground font-medium",
    ],
    status: "absolute bottom-0 right-0 rounded-full border-2 border-background",
  },
  variants: {
    size: {
      xs: {
        root: "h-6 w-6",
        fallback: "text-[10px]",
        status: "h-2 w-2",
      },
      sm: {
        root: "h-8 w-8",
        fallback: "text-xs",
        status: "h-2.5 w-2.5",
      },
      md: {
        root: "h-10 w-10",
        fallback: "text-sm",
        status: "h-3 w-3",
      },
      lg: {
        root: "h-12 w-12",
        fallback: "text-base",
        status: "h-3.5 w-3.5",
      },
      xl: {
        root: "h-16 w-16",
        fallback: "text-lg",
        status: "h-4 w-4",
      },
      "2xl": {
        root: "h-20 w-20",
        fallback: "text-xl",
        status: "h-5 w-5",
      },
    },
    rounded: {
      full: {
        root: "rounded-full",
      },
      lg: {
        root: "rounded-lg",
      },
      md: {
        root: "rounded-md",
      },
      sm: {
        root: "rounded-sm",
      },
      none: {
        root: "rounded-none",
      },
    },
    statusColor: {
      online: {
        status: "bg-success",
      },
      offline: {
        status: "bg-muted-foreground",
      },
      busy: {
        status: "bg-destructive",
      },
      away: {
        status: "bg-warning",
      },
    },
  },
  defaultVariants: {
    size: "md",
    rounded: "full",
  },
});

// ============================================================================
// Types
// ============================================================================

export interface AvatarProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof avatarVariants> {
  /** Image source */
  src?: string;
  /** Alt text for image */
  alt?: string;
  /** Fallback text (usually initials) */
  fallback?: string;
  /** Full name (used to generate initials if fallback not provided) */
  name?: string;
  /** Show status indicator */
  showStatus?: boolean;
  /** Image props */
  imageProps?: Omit<ImageProps, "alt" | "height" | "src" | "width">;
}

// ============================================================================
// Utility: Get initials from name
// ============================================================================

function getInitials(name: string, maxLength = 2): string {
  const words = name.trim().split(/\s+/);
  if (words.length === 1) {
    return words[0].substring(0, maxLength).toUpperCase();
  }
  return words
    .slice(0, maxLength)
    .map((word) => word[0])
    .join("")
    .toUpperCase();
}

// ============================================================================
// Component
// ============================================================================

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      className,
      size,
      rounded,
      statusColor,
      src,
      alt,
      fallback,
      name,
      showStatus = false,
      imageProps,
      ...props
    },
    ref,
  ) => {
    const styles = avatarVariants({ size, rounded, statusColor });

    // Derive fallback from name if not provided
    const displayFallback = fallback || (name ? getInitials(name) : "?");
    // State for image error handling
    const [imageError, setImageError] = useState(false);

    // Accessibility label
    const ariaLabel = alt || name || "User avatar";

    const resolvedSize = size ?? "md";
    const pixelSizeByVariant = {
      xs: 24,
      sm: 32,
      md: 40,
      lg: 48,
      xl: 64,
      "2xl": 80,
    } as const;
    const pixelSize = pixelSizeByVariant[resolvedSize];

    // Show fallback if no src or image failed to load
    const showFallback = !src || imageError;

    const {
      className: imagePropsClassName,
      onError: imagePropsOnError,
      ...restImageProps
    } = imageProps ?? {};

    return (
      <div
        ref={ref}
        className={cn(styles.root(), className)}
        role="img"
        aria-label={ariaLabel}
        {...props}
      >
        {!showFallback ? (
          <Image
            src={src}
            alt=""
            aria-hidden="true"
            width={pixelSize}
            height={pixelSize}
            className={cn("absolute inset-0", styles.image(), imagePropsClassName)}
            onError={(event) => {
              imagePropsOnError?.(event);
              setImageError(true);
            }}
            {...restImageProps}
          />
        ) : (
          <span className={styles.fallback()} aria-hidden="true">
            {displayFallback}
          </span>
        )}

        {/* Status indicator */}
        {showStatus && statusColor && (
          <span className={styles.status()} aria-hidden="true" title={statusColor} />
        )}
      </div>
    );
  },
);

Avatar.displayName = "Avatar";

// ============================================================================
// Avatar Group
// ============================================================================

export interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  /** Maximum number of avatars to show */
  max?: number;
  /** Size of avatars */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  /** Spacing between avatars (negative for overlap) */
  spacing?: string;
}

export const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  ({ className, max, size = "md", spacing = "-0.75rem", children, ...props }, ref) => {
    const childArray = Array.isArray(children) ? children : [children];
    const visibleChildren = max ? childArray.slice(0, max) : childArray;
    const remainingCount = max ? Math.max(0, childArray.length - max) : 0;

    return (
      <div
        ref={ref}
        className={cn("flex items-center", className)}
        style={{ gap: spacing }}
        {...props}
      >
        {visibleChildren}

        {/* Remaining count */}
        {remainingCount > 0 && (
          <Avatar
            size={size}
            fallback={`+${remainingCount}`}
            className="border-2 border-background"
          />
        )}
      </div>
    );
  },
);

AvatarGroup.displayName = "AvatarGroup";

export default Avatar;
