"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { AlertTriangle, CheckCircle, Info, X, XCircle } from "lucide-react";
import {
  createContext,
  forwardRef,
  type HTMLAttributes,
  type ReactNode,
  useCallback,
  useContext,
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

export const toastVariants = tv({
  base: [
    "pointer-events-auto relative flex w-full items-center gap-3",
    "overflow-hidden rounded-lg border p-4 shadow-lg",
    "transition-all",
  ],
  variants: {
    variant: {
      default: "bg-background border-border text-foreground",
      success: "bg-success/10 border-success/50 text-success",
      destructive: "bg-destructive/10 border-destructive/50 text-destructive",
      warning: "bg-warning/10 border-warning/50 text-warning",
      info: "bg-info/10 border-info/50 text-info",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

// ============================================================================
// Types
// ============================================================================

export interface Toast {
  id: string;
  title?: string;
  description?: string;
  variant?: "default" | "success" | "destructive" | "warning" | "info";
  duration?: number;
  icon?: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface ToastContextValue {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, "id">) => string;
  removeToast: (id: string) => void;
  removeAll: () => void;
}

export interface ToastProviderProps {
  children: ReactNode;
  /** Default duration in ms */
  defaultDuration?: number;
  /** Maximum number of toasts to show */
  maxToasts?: number;
  /** Position of toast container */
  position?:
    | "top-left"
    | "top-right"
    | "top-center"
    | "bottom-left"
    | "bottom-right"
    | "bottom-center";
  /** Show a progress bar for auto-dismiss countdown */
  showProgress?: boolean;
  /** Pause auto-dismiss timer when hovering */
  pauseOnHover?: boolean;
}

export interface ToastProps
  extends HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof toastVariants> {
  toast: Toast;
  onRemove: () => void;
  animationDuration?: number;
  /** Show a progress bar for auto-dismiss countdown */
  showProgress?: boolean;
  /** Pause auto-dismiss timer when hovering */
  pauseOnHover?: boolean;
}

// ============================================================================
// Context
// ============================================================================

const ToastContext = createContext<ToastContextValue | undefined>(undefined);

export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}

// ============================================================================
// Provider
// ============================================================================

export function ToastProvider({
  children,
  defaultDuration = 5000,
  maxToasts = 5,
  position = "bottom-right",
  showProgress = false,
  pauseOnHover = true,
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const addToast = useCallback(
    (toast: Omit<Toast, "id">) => {
      const id = Math.random().toString(36).substring(2, 9);
      const newToast: Toast = {
        ...toast,
        id,
        duration: toast.duration ?? defaultDuration,
      };

      setToasts((prev) => {
        const updated = [newToast, ...prev];
        return updated.slice(0, maxToasts);
      });

      return id;
    },
    [defaultDuration, maxToasts],
  );

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const removeAll = useCallback(() => {
    setToasts([]);
  }, []);

  // Position classes
  const positionClasses = {
    "top-left": "top-4 left-4",
    "top-right": "top-4 right-4",
    "top-center": "top-4 left-1/2 -translate-x-1/2",
    "bottom-left": "bottom-4 left-4",
    "bottom-right": "bottom-4 right-4",
    "bottom-center": "bottom-4 left-1/2 -translate-x-1/2",
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, removeAll }}>
      {children}

      {/* Toast container */}
      {isMounted &&
        createPortal(
          <div
            className={cn(
              "pointer-events-none fixed z-100 flex w-full max-w-sm flex-col gap-2",
              positionClasses[position],
            )}
            role="region"
            aria-live="polite"
            aria-label="Notifications"
          >
            {toasts.map((toast) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                variant={toast.variant}
                onRemove={() => removeToast(toast.id)}
                showProgress={showProgress}
                pauseOnHover={pauseOnHover}
              />
            ))}
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  );
}

// ============================================================================
// Toast Item
// ============================================================================

const ToastItem = forwardRef<HTMLDivElement, ToastProps>(
  (
    {
      toast,
      variant,
      onRemove,
      animationDuration = 0.3,
      showProgress = false,
      pauseOnHover = true,
      className,
      ...props
    },
    ref,
  ) => {
    const toastRef = useRef<HTMLDivElement>(null);
    const progressRef = useRef<HTMLDivElement>(null);
    const prefersReducedMotion = useReducedMotion();
    const [isExiting, setIsExiting] = useState(false);
    const [isPaused, setIsPaused] = useState(false);

    // Track remaining time for pauseOnHover
    const remainingTimeRef = useRef(toast.duration ?? 0);
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const startTimeRef = useRef<number>(0);

    // Merge refs
    const mergedRef = (node: HTMLDivElement) => {
      toastRef.current = node;
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        ref.current = node;
      }
    };

    // Auto-dismiss with pause support
    useEffect(() => {
      if (!toast.duration || toast.duration === Infinity) return;

      const startTimer = () => {
        startTimeRef.current = Date.now();
        timerRef.current = setTimeout(() => {
          setIsExiting(true);
        }, remainingTimeRef.current);
      };

      if (!isPaused) {
        startTimer();
      }

      return () => {
        if (timerRef.current) {
          clearTimeout(timerRef.current);
        }
      };
    }, [toast.duration, isPaused]);

    // Handle pause/resume
    const handleMouseEnter = () => {
      if (!pauseOnHover || !toast.duration || toast.duration === Infinity) return;

      // Calculate remaining time
      const elapsed = Date.now() - startTimeRef.current;
      remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);

      setIsPaused(true);

      // Pause progress bar animation
      if (progressRef.current) {
        gsap.killTweensOf(progressRef.current);
      }
    };

    const handleMouseLeave = () => {
      if (!pauseOnHover) return;
      setIsPaused(false);

      // Resume progress bar animation
      if (progressRef.current && showProgress && !prefersReducedMotion) {
        const duration = remainingTimeRef.current / 1000;
        gsap.to(progressRef.current, {
          scaleX: 0,
          duration,
          ease: "none",
        });
      }
    };

    // Handle exit animation complete
    useEffect(() => {
      if (!isExiting) return;

      const timer = setTimeout(
        () => onRemove(),
        prefersReducedMotion ? 0 : animationDuration * 1000,
      );

      return () => clearTimeout(timer);
    }, [isExiting, onRemove, animationDuration, prefersReducedMotion]);

    // GSAP animations
    useGSAP(
      () => {
        if (!toastRef.current || prefersReducedMotion) return;

        if (!isExiting) {
          // Enter animation
          gsap.fromTo(
            toastRef.current,
            { opacity: 0, x: 50, scale: 0.9 },
            {
              opacity: 1,
              x: 0,
              scale: 1,
              duration: animationDuration,
              ease: "power2.out",
            },
          );

          // Progress bar animation
          if (
            showProgress &&
            progressRef.current &&
            toast.duration &&
            toast.duration !== Infinity
          ) {
            gsap.fromTo(
              progressRef.current,
              { scaleX: 1 },
              {
                scaleX: 0,
                duration: toast.duration / 1000,
                ease: "none",
              },
            );
          }
        } else {
          // Exit animation
          gsap.to(toastRef.current, {
            opacity: 0,
            x: 50,
            scale: 0.9,
            duration: animationDuration,
            ease: "power2.in",
          });
        }
      },
      { dependencies: [isExiting, animationDuration] },
    );

    // Get icon based on variant
    const getIcon = () => {
      if (toast.icon) return toast.icon;

      switch (toast.variant) {
        case "success":
          return <CheckCircle className="size-5" aria-hidden="true" />;
        case "destructive":
          return <XCircle className="size-5" aria-hidden="true" />;
        case "warning":
          return <AlertTriangle className="size-5" aria-hidden="true" />;
        case "info":
          return <Info className="size-5" aria-hidden="true" />;
        default:
          return null;
      }
    };

    // Get progress bar color based on variant
    const getProgressColor = () => {
      switch (variant) {
        case "success":
          return "bg-success";
        case "destructive":
          return "bg-destructive";
        case "warning":
          return "bg-warning";
        case "info":
          return "bg-info";
        default:
          return "bg-foreground/20";
      }
    };

    return (
      <div
        ref={mergedRef}
        className={cn(toastVariants({ variant }), className)}
        role="alert"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        {...props}
      >
        {/* Progress bar */}
        {showProgress && toast.duration && toast.duration !== Infinity && (
          <div
            ref={progressRef}
            className={cn("absolute right-0 bottom-0 left-0 h-1 origin-left", getProgressColor())}
            aria-hidden="true"
          />
        )}

        {/* Icon */}
        {getIcon() && <span className="shrink-0">{getIcon()}</span>}

        {/* Content */}
        <div className="min-w-0 flex-1">
          {toast.title && <p className="font-semibold text-sm">{toast.title}</p>}
          {toast.description && <p className="text-sm opacity-90">{toast.description}</p>}
        </div>

        {/* Action */}
        {toast.action && (
          <button
            type="button"
            onClick={toast.action.onClick}
            className="shrink-0 font-medium text-sm underline-offset-4 hover:underline"
          >
            {toast.action.label}
          </button>
        )}

        {/* Close button */}
        <button
          type="button"
          onClick={() => setIsExiting(true)}
          className="shrink-0 rounded-md p-1 opacity-70 transition-opacity hover:opacity-100"
          aria-label="Dismiss"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  },
);

ToastItem.displayName = "ToastItem";

export default ToastProvider;
