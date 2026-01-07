"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { X } from "lucide-react";
import {
  forwardRef,
  type HTMLAttributes,
  type MouseEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { tv, type VariantProps } from "tailwind-variants";
import { useReducedMotion } from "@/hooks";
import { cn } from "@/lib/utils";

// ============================================================================
// Variants
// ============================================================================

export const modalVariants = tv({
  slots: {
    overlay: ["fixed inset-0 z-50 bg-black/50", "flex items-center justify-center p-4"],
    content: [
      "relative w-full max-h-[90vh] overflow-auto",
      "rounded-lg border bg-background shadow-lg",
      "focus:outline-none",
    ],
    header: "flex flex-col space-y-1.5 p-6 pb-0",
    title: "text-lg font-semibold leading-none tracking-tight",
    description: "text-sm text-muted-foreground",
    body: "p-6",
    footer: "flex items-center justify-end gap-2 p-6 pt-0",
    closeButton: [
      "absolute right-4 top-4 rounded-sm opacity-70",
      "transition-[opacity,box-shadow] duration-200",
      "hover:opacity-100 focus:outline-none focus:opacity-100 focus:shadow-[0_0_0_2px_rgba(var(--primary-rgb),0.3)]",
      "disabled:pointer-events-none",
    ],
  },
  variants: {
    size: {
      sm: {
        content: "max-w-sm",
      },
      md: {
        content: "max-w-md",
      },
      lg: {
        content: "max-w-lg",
      },
      xl: {
        content: "max-w-xl",
      },
      "2xl": {
        content: "max-w-2xl",
      },
      full: {
        content: "max-w-[95vw] max-h-[95vh]",
      },
    },
    centered: {
      true: {
        overlay: "items-center",
      },
      false: {
        overlay: "items-start pt-16",
      },
    },
  },
  defaultVariants: {
    size: "md",
    centered: true,
  },
});

// ============================================================================
// Types
// ============================================================================

export interface ModalProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof modalVariants> {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when modal should close */
  onClose: () => void;
  /** Whether clicking the overlay closes the modal */
  closeOnOverlayClick?: boolean;
  /** Whether pressing Escape closes the modal */
  closeOnEscape?: boolean;
  /** Whether to show the close button */
  showCloseButton?: boolean;
  /** Animation duration in seconds */
  animationDuration?: number;
  /** Custom overlay className */
  overlayClassName?: string;
  /** Modal title */
  title?: React.ReactNode;
  /** Modal description */
  description?: React.ReactNode;
  /** Footer content */
  footer?: React.ReactNode;
}

// ============================================================================
// Component
// ============================================================================

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      className,
      overlayClassName,
      size,
      centered,
      open,
      onClose,
      closeOnOverlayClick = true,
      closeOnEscape = true,
      showCloseButton = true,
      animationDuration = 0.3,
      title,
      description,
      footer,
      children,
      ...props
    },
    ref,
  ) => {
    const [isMounted, setIsMounted] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const overlayRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();

    // Merge refs
    const mergedRef = (node: HTMLDivElement) => {
      contentRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    const styles = modalVariants({ size, centered });

    // Handle mount/unmount for portal
    useEffect(() => {
      setIsMounted(true);
    }, []);

    // Handle open/close state
    useEffect(() => {
      if (open) {
        setIsVisible(true);
        // Prevent body scroll
        document.body.style.overflow = "hidden";
      } else {
        // Delay unmount for exit animation
        const timer = setTimeout(
          () => setIsVisible(false),
          prefersReducedMotion ? 0 : animationDuration * 1000,
        );
        document.body.style.overflow = "";
        return () => clearTimeout(timer);
      }

      return () => {
        document.body.style.overflow = "";
      };
    }, [open, animationDuration, prefersReducedMotion]);

    // GSAP animations
    useGSAP(
      () => {
        if (!overlayRef.current || !contentRef.current) return;
        if (prefersReducedMotion) return;

        const overlay = overlayRef.current;
        const content = contentRef.current;

        if (open) {
          // Enter animation
          gsap.fromTo(
            overlay,
            { opacity: 0 },
            { opacity: 1, duration: animationDuration, ease: "power2.out" },
          );
          gsap.fromTo(
            content,
            { opacity: 0, scale: 0.95, y: 20 },
            {
              opacity: 1,
              scale: 1,
              y: 0,
              duration: animationDuration,
              ease: "power2.out",
            },
          );
        } else if (isVisible) {
          // Exit animation
          gsap.to(overlay, {
            opacity: 0,
            duration: animationDuration,
            ease: "power2.in",
          });
          gsap.to(content, {
            opacity: 0,
            scale: 0.95,
            y: 20,
            duration: animationDuration,
            ease: "power2.in",
          });
        }
      },
      { dependencies: [open, isVisible, animationDuration] },
    );

    // Handle overlay click
    const handleOverlayClick = useCallback(
      (e: MouseEvent) => {
        if (closeOnOverlayClick && e.target === overlayRef.current) {
          onClose();
        }
      },
      [closeOnOverlayClick, onClose],
    );

    // Handle escape key
    useEffect(() => {
      if (!closeOnEscape || !open) return;

      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose();
        }
      };

      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }, [closeOnEscape, open, onClose]);

    // Focus trap - keep focus within modal
    useEffect(() => {
      if (!open || !contentRef.current) return;

      const content = contentRef.current;
      const focusableSelectors = [
        "button:not([disabled])",
        "a[href]",
        "input:not([disabled])",
        "select:not([disabled])",
        "textarea:not([disabled])",
        '[tabindex]:not([tabindex="-1"])',
      ].join(", ");

      // Store previously focused element to restore later
      const previouslyFocused = document.activeElement as HTMLElement;

      // Get all focusable elements
      const getFocusableElements = () => {
        return Array.from(content.querySelectorAll<HTMLElement>(focusableSelectors));
      };

      // Focus the first focusable element or the close button
      const focusableElements = getFocusableElements();
      if (focusableElements.length > 0) {
        focusableElements[0].focus();
      } else {
        content.focus();
      }

      // Handle Tab key to trap focus
      const handleKeyDown = (e: globalThis.KeyboardEvent) => {
        if (e.key !== "Tab") return;

        const focusable = getFocusableElements();
        if (focusable.length === 0) {
          e.preventDefault();
          return;
        }

        const firstElement = focusable[0];
        const lastElement = focusable[focusable.length - 1];

        if (e.shiftKey) {
          // Shift+Tab: If on first element, wrap to last
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          // Tab: If on last element, wrap to first
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      };

      document.addEventListener("keydown", handleKeyDown);

      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        // Restore focus to previously focused element
        previouslyFocused?.focus?.();
      };
    }, [open]);

    if (!isMounted || !isVisible) return null;

    return createPortal(
      <div
        ref={overlayRef}
        className={cn(styles.overlay(), overlayClassName)}
        onClick={handleOverlayClick}
        aria-modal="true"
        role="dialog"
      >
        <div ref={mergedRef} className={cn(styles.content(), className)} tabIndex={-1} {...props}>
          {/* Close button */}
          {showCloseButton && (
            <button
              type="button"
              className={styles.closeButton()}
              onClick={onClose}
              aria-label="Close modal"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          )}

          {/* Header */}
          {(title || description) && (
            <div className={styles.header()}>
              {title && <h2 className={styles.title()}>{title}</h2>}
              {description && <p className={styles.description()}>{description}</p>}
            </div>
          )}

          {/* Body */}
          <div className={styles.body()}>{children}</div>

          {/* Footer */}
          {footer && <div className={styles.footer()}>{footer}</div>}
        </div>
      </div>,
      document.body,
    );
  },
);

Modal.displayName = "Modal";

export default Modal;
