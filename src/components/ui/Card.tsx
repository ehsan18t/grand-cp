"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent as ReactMouseEvent,
  useCallback,
  useRef,
  useState,
} from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useReducedMotion } from "@/hooks";
import { cn } from "@/lib/utils";

// ============================================================================
// Variants
// ============================================================================

export const cardVariants = tv({
  slots: {
    root: [
      "relative overflow-hidden",
      "rounded-xl border bg-card text-card-foreground",
      "transition-all duration-300 ease-out",
    ],
    header: "flex flex-col space-y-1.5 p-6",
    title: "text-xl font-semibold leading-none tracking-tight",
    description: "text-sm text-muted-foreground",
    content: "p-6 pt-0",
    footer: "flex items-center p-6 pt-0",
  },
  variants: {
    variant: {
      default: {
        root: "border-border shadow-sm",
      },
      elevated: {
        root: "border-transparent shadow-lg shadow-black/5 dark:shadow-black/20",
      },
      outline: {
        root: "border-border bg-transparent shadow-none",
      },
      filled: {
        root: "border-transparent bg-muted",
      },
      ghost: {
        root: "border-transparent bg-transparent shadow-none",
      },
      glass: {
        root: [
          "border-white/20 dark:border-white/10",
          "bg-white/70 dark:bg-black/30",
          "backdrop-blur-xl backdrop-saturate-150",
          "shadow-xl shadow-black/5",
        ],
      },
      gradient: {
        root: [
          "border-0 p-[1px]",
          "bg-gradient-to-br from-primary/50 via-accent/50 to-secondary/50",
        ],
      },
    },
    interactive: {
      true: {
        root: "cursor-pointer",
      },
    },
    padding: {
      none: {
        header: "p-0",
        content: "p-0",
        footer: "p-0",
      },
      sm: {
        header: "p-4",
        content: "p-4 pt-0",
        footer: "p-4 pt-0",
      },
      md: {
        header: "p-6",
        content: "p-6 pt-0",
        footer: "p-6 pt-0",
      },
      lg: {
        header: "p-8",
        content: "p-8 pt-0",
        footer: "p-8 pt-0",
      },
    },
  },
  defaultVariants: {
    variant: "default",
    padding: "md",
  },
});

// ============================================================================
// Types
// ============================================================================

export interface CardProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {
  /** Enable hover animation (lift and scale) */
  animated?: boolean;
  /** Hover scale (default: 1.02) */
  hoverScale?: number;
  /** Hover lift in pixels (default: 8) */
  hoverLift?: number;
  /** Enable 3D tilt effect on hover */
  tilt?: boolean;
  /** Tilt intensity (default: 10 degrees) */
  tiltIntensity?: number;
  /** Enable spotlight effect that follows mouse */
  spotlight?: boolean;
  /** Spotlight color (CSS color, default: primary color) */
  spotlightColor?: string;
  /** Spotlight size in pixels (default: 200) */
  spotlightSize?: number;
  /** Enable glow effect on hover */
  glow?: boolean;
  /** Glow color (CSS color) */
  glowColor?: string;
}

export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
}

export interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {}

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "sm" | "md" | "lg";
}

// ============================================================================
// Components
// ============================================================================

export const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant,
      interactive,
      padding,
      animated = false,
      hoverScale = 1.02,
      hoverLift = 8,
      tilt = false,
      tiltIntensity = 10,
      spotlight = false,
      spotlightColor,
      spotlightSize = 200,
      glow = false,
      glowColor,
      children,
      onMouseMove,
      onMouseEnter,
      onMouseLeave,
      ...props
    },
    ref,
  ) => {
    const cardRef = useRef<HTMLDivElement>(null);
    const spotlightRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();
    const [isHovered, setIsHovered] = useState(false);

    // Merge refs
    const mergedRef = useCallback(
      (node: HTMLDivElement | null) => {
        cardRef.current = node;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          ref.current = node;
        }
      },
      [ref],
    );

    // Determine if we should animate
    const shouldAnimate = (animated || tilt || spotlight || glow) && !prefersReducedMotion;

    // Handle mouse move for tilt and spotlight
    const handleMouseMove = useCallback(
      (e: ReactMouseEvent<HTMLDivElement>) => {
        onMouseMove?.(e);

        if (!cardRef.current || !shouldAnimate) return;

        const card = cardRef.current;
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        // Tilt effect
        if (tilt) {
          const rotateX = ((y - centerY) / centerY) * -tiltIntensity;
          const rotateY = ((x - centerX) / centerX) * tiltIntensity;

          gsap.to(card, {
            rotateX,
            rotateY,
            duration: 0.3,
            ease: "power2.out",
            transformPerspective: 1000,
          });
        }

        // Spotlight effect
        if (spotlight && spotlightRef.current) {
          gsap.to(spotlightRef.current, {
            x: x - spotlightSize / 2,
            y: y - spotlightSize / 2,
            duration: 0.2,
            ease: "power2.out",
          });
        }
      },
      [shouldAnimate, tilt, tiltIntensity, spotlight, spotlightSize, onMouseMove],
    );

    // Handle mouse enter
    const handleMouseEnter = useCallback(
      (e: ReactMouseEvent<HTMLDivElement>) => {
        onMouseEnter?.(e);
        setIsHovered(true);

        if (!cardRef.current || !shouldAnimate) return;

        const card = cardRef.current;

        // Hover lift and scale animation
        if (animated) {
          gsap.to(card, {
            scale: hoverScale,
            y: -hoverLift,
            duration: 0.3,
            ease: "power2.out",
          });
        }

        // Show spotlight
        if (spotlight && spotlightRef.current) {
          gsap.to(spotlightRef.current, {
            opacity: 1,
            duration: 0.3,
          });
        }
      },
      [shouldAnimate, animated, hoverScale, hoverLift, spotlight, onMouseEnter],
    );

    // Handle mouse leave
    const handleMouseLeave = useCallback(
      (e: ReactMouseEvent<HTMLDivElement>) => {
        onMouseLeave?.(e);
        setIsHovered(false);

        if (!cardRef.current || !shouldAnimate) return;

        const card = cardRef.current;

        // Reset animations
        gsap.to(card, {
          scale: 1,
          y: 0,
          rotateX: 0,
          rotateY: 0,
          duration: 0.5,
          ease: "power3.out",
        });

        // Hide spotlight
        if (spotlight && spotlightRef.current) {
          gsap.to(spotlightRef.current, {
            opacity: 0,
            duration: 0.3,
          });
        }
      },
      [shouldAnimate, spotlight, onMouseLeave],
    );

    // Initial setup for 3D perspective
    useGSAP(
      () => {
        if (!cardRef.current) return;

        if (tilt && !prefersReducedMotion) {
          gsap.set(cardRef.current, {
            transformStyle: "preserve-3d",
            transformPerspective: 1000,
          });
        }
      },
      { dependencies: [tilt, prefersReducedMotion] },
    );

    const styles = cardVariants({ variant, interactive: interactive || animated || tilt, padding });

    // Spotlight gradient color
    const spotlightGradient = spotlightColor || "rgba(var(--primary-rgb), 0.15)";
    const glowColorValue = glowColor || "rgba(var(--primary-rgb), 0.4)";

    // For gradient variant, wrap content in inner container
    const isGradient = variant === "gradient";

    return (
      <div
        ref={mergedRef}
        className={cn(
          styles.root(),
          glow && isHovered && "shadow-[0_0_30px_-5px_var(--glow-color)]",
          className,
        )}
        style={
          {
            "--glow-color": glowColorValue,
          } as React.CSSProperties
        }
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Spotlight overlay */}
        {spotlight && (
          <div
            ref={spotlightRef}
            className="pointer-events-none absolute rounded-full opacity-0 blur-2xl"
            style={{
              width: spotlightSize,
              height: spotlightSize,
              background: `radial-gradient(circle, ${spotlightGradient} 0%, transparent 70%)`,
            }}
            aria-hidden="true"
          />
        )}

        {/* Gradient variant inner container */}
        {isGradient ? (
          <div className="h-full w-full rounded-[11px] bg-card p-0">{children}</div>
        ) : (
          children
        )}

        {/* Hover border glow for glass variant */}
        {variant === "glass" && isHovered && (
          <div
            className="pointer-events-none absolute inset-0 rounded-xl opacity-50"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%, rgba(255,255,255,0.1) 100%)",
            }}
            aria-hidden="true"
          />
        )}
      </div>
    );
  },
);

Card.displayName = "Card";

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, padding = "md", ...props }, ref) => {
    const styles = cardVariants({ padding });
    return <div ref={ref} className={cn(styles.header(), className)} {...props} />;
  },
);

CardHeader.displayName = "CardHeader";

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, as: Component = "h3", ...props }, ref) => {
    const styles = cardVariants();
    return <Component ref={ref} className={cn(styles.title(), className)} {...props} />;
  },
);

CardTitle.displayName = "CardTitle";

export const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ className, ...props }, ref) => {
    const styles = cardVariants();
    return <p ref={ref} className={cn(styles.description(), className)} {...props} />;
  },
);

CardDescription.displayName = "CardDescription";

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, padding = "md", ...props }, ref) => {
    const styles = cardVariants({ padding });
    return <div ref={ref} className={cn(styles.content(), className)} {...props} />;
  },
);

CardContent.displayName = "CardContent";

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, padding = "md", ...props }, ref) => {
    const styles = cardVariants({ padding });
    return <div ref={ref} className={cn(styles.footer(), className)} {...props} />;
  },
);

CardFooter.displayName = "CardFooter";

export default Card;
