"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  cloneElement,
  forwardRef,
  type HTMLAttributes,
  isValidElement,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { tv, type VariantProps } from "tailwind-variants";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { cn } from "@/lib/utils";

// ============================================================================
// Variants
// ============================================================================

export const tooltipVariants = tv({
  base: [
    "absolute z-50 px-3 py-1.5",
    "rounded-lg bg-foreground text-background",
    "text-xs font-medium shadow-lg",
    "pointer-events-none select-none",
    "max-w-xs",
  ],
  variants: {
    side: {
      top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
      bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
      left: "right-full top-1/2 -translate-y-1/2 mr-2",
      right: "left-full top-1/2 -translate-y-1/2 ml-2",
    },
  },
  defaultVariants: {
    side: "top",
  },
});

// ============================================================================
// Types
// ============================================================================

export interface TooltipProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "content">,
    VariantProps<typeof tooltipVariants> {
  /** Tooltip content */
  content: ReactNode;
  /** Delay before showing tooltip (ms) */
  delay?: number;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Whether the tooltip is disabled */
  disabled?: boolean;
  /** Whether to show arrow */
  showArrow?: boolean;
  /** Render tooltip in a portal to prevent clipping */
  usePortal?: boolean;
  /** Offset from trigger element in pixels */
  offset?: number;
}

// ============================================================================
// Component
// ============================================================================

export const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      className,
      side = "top",
      content,
      delay = 200,
      animationDuration = 0.2,
      disabled = false,
      showArrow = true,
      usePortal = false,
      offset = 8,
      children,
      ...props
    },
    ref,
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isRendered, setIsRendered] = useState(false);
    const [isMounted, setIsMounted] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0, actualSide: side });
    const containerRef = useRef<HTMLDivElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const prefersReducedMotion = useReducedMotion();
    const tooltipId = useId();

    // Mount check for portal
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Calculate tooltip position with collision detection
    const updatePosition = useCallback(() => {
      if (!containerRef.current || !tooltipRef.current) return;

      const triggerRect = containerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      // Check if tooltip fits in preferred position, otherwise flip
      let actualSide = side;
      const padding = 10; // Viewport edge padding

      if (side === "top" && triggerRect.top - tooltipRect.height - offset < padding) {
        actualSide = "bottom";
      } else if (
        side === "bottom" &&
        triggerRect.bottom + tooltipRect.height + offset > viewportHeight - padding
      ) {
        actualSide = "top";
      } else if (side === "left" && triggerRect.left - tooltipRect.width - offset < padding) {
        actualSide = "right";
      } else if (
        side === "right" &&
        triggerRect.right + tooltipRect.width + offset > viewportWidth - padding
      ) {
        actualSide = "left";
      }

      let top = 0;
      let left = 0;

      switch (actualSide) {
        case "top":
          top = triggerRect.top + scrollY - tooltipRect.height - offset;
          left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case "bottom":
          top = triggerRect.bottom + scrollY + offset;
          left = triggerRect.left + scrollX + triggerRect.width / 2 - tooltipRect.width / 2;
          break;
        case "left":
          top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.left + scrollX - tooltipRect.width - offset;
          break;
        case "right":
          top = triggerRect.top + scrollY + triggerRect.height / 2 - tooltipRect.height / 2;
          left = triggerRect.right + scrollX + offset;
          break;
      }

      // Clamp horizontal position to viewport
      const minLeft = scrollX + padding;
      const maxLeft = scrollX + viewportWidth - tooltipRect.width - padding;
      left = Math.max(minLeft, Math.min(maxLeft, left));

      // Clamp vertical position to viewport
      const minTop = scrollY + padding;
      const maxTop = scrollY + viewportHeight - tooltipRect.height - padding;
      top = Math.max(minTop, Math.min(maxTop, top));

      setPosition({ top, left, actualSide });
    }, [side, offset]);

    // Update position on scroll/resize when visible
    useEffect(() => {
      if (!isVisible || !usePortal) return;

      const handleUpdate = () => {
        requestAnimationFrame(updatePosition);
      };

      window.addEventListener("scroll", handleUpdate, true);
      window.addEventListener("resize", handleUpdate);

      return () => {
        window.removeEventListener("scroll", handleUpdate, true);
        window.removeEventListener("resize", handleUpdate);
      };
    }, [isVisible, usePortal, updatePosition]);

    // Handle mouse enter
    const handleMouseEnter = () => {
      if (disabled) return;
      timeoutRef.current = setTimeout(() => {
        setIsRendered(true);
        setIsVisible(true);
      }, delay);
    };

    // Handle mouse leave
    const handleMouseLeave = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      setIsVisible(false);
    };

    // Clean up timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    // Update position after tooltip is rendered (for portal mode)
    useLayoutEffect(() => {
      if (isRendered && isVisible && usePortal) {
        updatePosition();
      }
    }, [isRendered, isVisible, usePortal, updatePosition]);

    // Handle unmount after animation
    useEffect(() => {
      if (!isVisible && isRendered) {
        const timer = setTimeout(
          () => setIsRendered(false),
          prefersReducedMotion ? 0 : animationDuration * 1000,
        );
        return () => clearTimeout(timer);
      }
    }, [isVisible, isRendered, animationDuration, prefersReducedMotion]);

    // GSAP animation
    useGSAP(
      () => {
        if (!tooltipRef.current || prefersReducedMotion) return;

        const getTransformOrigin = () => {
          const s = usePortal ? position.actualSide : side;
          switch (s) {
            case "top":
              return "bottom center";
            case "bottom":
              return "top center";
            case "left":
              return "right center";
            case "right":
              return "left center";
            default:
              return "bottom center";
          }
        };

        if (isVisible) {
          gsap.set(tooltipRef.current, { transformOrigin: getTransformOrigin() });
          gsap.fromTo(
            tooltipRef.current,
            {
              opacity: 0,
              scale: 0.92,
              y: side === "top" ? 4 : side === "bottom" ? -4 : 0,
              x: side === "left" ? 4 : side === "right" ? -4 : 0,
            },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              x: 0,
              duration: animationDuration,
              ease: "back.out(2)",
            },
          );
        } else if (isRendered) {
          gsap.to(tooltipRef.current, {
            opacity: 0,
            scale: 0.92,
            duration: animationDuration * 0.6,
            ease: "power2.in",
          });
        }
      },
      { dependencies: [isVisible, isRendered, animationDuration, position.actualSide, side] },
    );

    // Get arrow styles based on side
    const getArrowStyles = (s: typeof side) => {
      const arrowBase = "absolute w-2 h-2 bg-foreground rotate-45";
      switch (s) {
        case "top":
          return cn(arrowBase, "-bottom-1 left-1/2 -translate-x-1/2");
        case "bottom":
          return cn(arrowBase, "-top-1 left-1/2 -translate-x-1/2");
        case "left":
          return cn(arrowBase, "top-1/2 -right-1 -translate-y-1/2");
        case "right":
          return cn(arrowBase, "top-1/2 -left-1 -translate-y-1/2");
        default:
          return cn(arrowBase, "-bottom-1 left-1/2 -translate-x-1/2");
      }
    };

    // Clone children to add aria-describedby
    const childElement = isValidElement(children)
      ? cloneElement(children as ReactElement<{ "aria-describedby"?: string }>, {
          "aria-describedby": isVisible ? tooltipId : undefined,
        })
      : children;

    // Tooltip content element
    const tooltipContent = (
      <div
        ref={tooltipRef}
        id={tooltipId}
        className={cn(
          usePortal
            ? [
                "fixed z-9999 px-3 py-1.5",
                "rounded-lg bg-foreground text-background",
                "font-medium text-xs shadow-lg",
                "pointer-events-none select-none",
                "max-w-xs",
              ]
            : tooltipVariants({ side }),
          className,
        )}
        style={
          usePortal
            ? {
                top: position.top,
                left: position.left,
                position: "absolute",
              }
            : undefined
        }
        role="tooltip"
      >
        {content}
        {showArrow && (
          <span
            className={getArrowStyles(usePortal ? position.actualSide : side)}
            aria-hidden="true"
          />
        )}
      </div>
    );

    return (
      <div
        ref={(node) => {
          containerRef.current = node;
          if (typeof ref === "function") {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        className={cn("relative inline-flex", className)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onFocus={handleMouseEnter}
        onBlur={handleMouseLeave}
        {...props}
      >
        {childElement}

        {isRendered &&
          (usePortal && isMounted ? createPortal(tooltipContent, document.body) : tooltipContent)}
      </div>
    );
  },
);

Tooltip.displayName = "Tooltip";

export default Tooltip;
