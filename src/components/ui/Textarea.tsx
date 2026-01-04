"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  type ChangeEvent,
  type FocusEvent,
  forwardRef,
  type TextareaHTMLAttributes,
  useEffect,
  useRef,
  useState,
} from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useReducedMotion } from "@/hooks";
import { cn } from "@/lib/utils";

// ============================================================================
// Variants
// ============================================================================

export const textareaVariants = tv({
  base: [
    "peer w-full rounded-xl border-2 bg-transparent px-4 pt-6 pb-3",
    "text-foreground text-sm",
    "outline-none",
    "transition-[border-color,box-shadow] duration-300 ease-out",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "min-h-[120px]",
  ],
  variants: {
    variant: {
      default: [
        "border-border/40 bg-background/50",
        "hover:border-border/80",
        "focus:border-primary focus:bg-background",
        "focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
      ],
      filled: [
        "border-transparent bg-muted/60",
        "hover:bg-muted/80",
        "focus:border-primary focus:bg-background",
        "focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
      ],
      outlined: [
        "border-border bg-transparent",
        "hover:border-foreground/50",
        "focus:border-primary",
        "focus:shadow-[0_0_0_4px_hsl(var(--primary)/0.1)]",
      ],
      flushed: [
        "rounded-none border-x-0 border-t-0 border-b-2 border-border/60 bg-transparent px-0 pt-5 pb-3",
        "hover:border-foreground/50",
        "focus:border-primary focus:shadow-none",
      ],
    },
    resize: {
      none: "resize-none",
      vertical: "resize-y",
      horizontal: "resize-x",
      both: "resize",
    },
    state: {
      default: "",
      error: [
        "border-destructive/60",
        "hover:border-destructive",
        "focus:border-destructive focus:shadow-[0_0_0_4px_hsl(var(--destructive)/0.1)]",
      ],
      success: [
        "border-success/60",
        "hover:border-success",
        "focus:border-success focus:shadow-[0_0_0_4px_hsl(var(--success)/0.1)]",
      ],
      warning: [
        "border-warning/60",
        "hover:border-warning",
        "focus:border-warning focus:shadow-[0_0_0_4px_hsl(var(--warning)/0.1)]",
      ],
    },
  },
  compoundVariants: [
    {
      variant: "flushed",
      state: "error",
      className: "focus:shadow-none",
    },
    {
      variant: "flushed",
      state: "success",
      className: "focus:shadow-none",
    },
    {
      variant: "flushed",
      state: "warning",
      className: "focus:shadow-none",
    },
  ],
  defaultVariants: {
    variant: "default",
    resize: "vertical",
    state: "default",
  },
});

// ============================================================================
// Types
// ============================================================================

export interface TextareaProps
  extends TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof textareaVariants> {
  /** Error message to display */
  error?: string;
  /** Helper text to display below textarea */
  helperText?: string;
  /** Label for the textarea */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Wrapper className */
  wrapperClassName?: string;
  /** Show character count */
  showCount?: boolean;
  /** Maximum character count */
  maxLength?: number;
  /** Auto-resize textarea based on content */
  autoResize?: boolean;
  /** Minimum rows when auto-resizing */
  minRows?: number;
  /** Maximum rows when auto-resizing */
  maxRows?: number;
  /** Validation state */
  state?: "default" | "error" | "success" | "warning";
  /** Full width */
  fullWidth?: boolean;
  /** Animate shake on error */
  animateOnError?: boolean;
  /** Use floating label (default: true) */
  floatingLabel?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      wrapperClassName,
      variant = "default",
      resize,
      error,
      helperText,
      label,
      required,
      showCount,
      maxLength,
      disabled,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      id,
      autoResize = false,
      minRows = 3,
      maxRows = 10,
      state,
      fullWidth = true,
      animateOnError = true,
      floatingLabel = true,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const [isFocused, setIsFocused] = useState(false);
    const internalRef = useRef<HTMLTextAreaElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);
    const textareaRef = (ref as React.RefObject<HTMLTextAreaElement>) || internalRef;
    const prevErrorRef = useRef<string | undefined>(error);
    const prefersReducedMotion = useReducedMotion();

    // Determine if controlled or uncontrolled
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const hasValue = currentValue !== "" && currentValue !== undefined;

    // Derive state from error
    const derivedState = error ? "error" : state;

    // Label should float when focused or has value
    const shouldFloat = isFocused || hasValue;

    // Auto-resize function
    const resizeTextarea = () => {
      if (!autoResize || !textareaRef.current) return;

      const textarea = textareaRef.current;
      const computedStyle = window.getComputedStyle(textarea);
      const lineHeight = Number.parseInt(computedStyle.lineHeight, 10) || 20;
      const paddingTop = Number.parseInt(computedStyle.paddingTop, 10) || 0;
      const paddingBottom = Number.parseInt(computedStyle.paddingBottom, 10) || 0;
      const borderTop = Number.parseInt(computedStyle.borderTopWidth, 10) || 0;
      const borderBottom = Number.parseInt(computedStyle.borderBottomWidth, 10) || 0;

      const minHeight =
        lineHeight * minRows + paddingTop + paddingBottom + borderTop + borderBottom;
      const maxHeight =
        lineHeight * maxRows + paddingTop + paddingBottom + borderTop + borderBottom;

      // Reset height to measure scrollHeight
      textarea.style.height = "auto";

      // Calculate new height
      const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
      textarea.style.height = `${newHeight}px`;

      // Show scrollbar if content exceeds maxHeight
      textarea.style.overflowY = textarea.scrollHeight > maxHeight ? "auto" : "hidden";
    };

    // Initial resize on mount
    useEffect(() => {
      resizeTextarea();
    });

    // Handle onChange with resize
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
      resizeTextarea();
    };

    // Handle focus
    const handleFocus = (e: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Floating label animation with GSAP
    useGSAP(
      () => {
        if (!labelRef.current || !floatingLabel || !label) return;

        const labelEl = labelRef.current;

        // Respect reduced motion preference
        if (prefersReducedMotion) {
          gsap.set(labelEl, {
            y: shouldFloat ? -14 : 0,
            scale: shouldFloat ? 0.75 : 1,
          });
          return;
        }

        gsap.to(labelEl, {
          y: shouldFloat ? -14 : 0,
          scale: shouldFloat ? 0.75 : 1,
          duration: 0.2,
          ease: "power3.out",
        });
      },
      { dependencies: [shouldFloat, floatingLabel, label, prefersReducedMotion] },
    );

    // Shake animation on error
    useGSAP(
      () => {
        if (!wrapperRef.current || !animateOnError) return;

        // Skip shake animation if reduced motion is preferred
        if (error && !prevErrorRef.current && !prefersReducedMotion) {
          gsap.to(wrapperRef.current, {
            keyframes: [
              { x: -6, duration: 0.05 },
              { x: 6, duration: 0.05 },
              { x: -4, duration: 0.05 },
              { x: 4, duration: 0.05 },
              { x: -2, duration: 0.05 },
              { x: 0, duration: 0.05 },
            ],
            ease: "power2.inOut",
          });
        }
        prevErrorRef.current = error;
      },
      { dependencies: [error, animateOnError, prefersReducedMotion] },
    );

    const textareaId = id || props.name;
    const charCount = typeof currentValue === "string" ? currentValue.length : 0;

    // Get label color based on state
    const getLabelColor = () => {
      if (!shouldFloat) return "text-muted-foreground";
      if (derivedState === "error") return "text-destructive";
      if (derivedState === "success") return "text-success";
      if (derivedState === "warning") return "text-warning";
      if (isFocused) return "text-primary";
      return "text-muted-foreground";
    };

    return (
      <div
        ref={wrapperRef}
        className={cn("flex flex-col gap-1.5", fullWidth && "w-full", wrapperClassName)}
      >
        {/* Non-floating label */}
        {label && !floatingLabel && (
          <label
            htmlFor={textareaId}
            className={cn(
              "font-medium text-foreground text-sm transition-colors duration-200",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        {/* Textarea container */}
        <div className="relative">
          {/* Textarea element */}
          <textarea
            ref={textareaRef}
            id={textareaId}
            disabled={disabled}
            value={isControlled ? value : undefined}
            defaultValue={!isControlled ? defaultValue : undefined}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={maxLength}
            placeholder={floatingLabel ? undefined : placeholder}
            className={cn(
              textareaVariants({
                variant,
                resize: autoResize ? "none" : resize,
                state: derivedState,
              }),
              !floatingLabel && "pt-3 pb-3",
              className,
            )}
            aria-invalid={derivedState === "error"}
            aria-describedby={
              error ? `${textareaId}-error` : helperText ? `${textareaId}-helper` : undefined
            }
            {...props}
          />

          {/* Floating label */}
          {floatingLabel && label && (
            <label
              ref={labelRef}
              htmlFor={textareaId}
              className={cn(
                "pointer-events-none absolute top-5 left-4 origin-left",
                "text-sm",
                "will-change-transform",
                getLabelColor(),
                disabled && "opacity-50",
              )}
            >
              {label}
              {required && <span className="ml-0.5 text-destructive">*</span>}
            </label>
          )}

          {/* Animated focus line for flushed variant */}
          {variant === "flushed" && (
            <span
              className={cn(
                "absolute bottom-0 left-0 h-0.5 w-full origin-center scale-x-0",
                "transition-transform duration-300 ease-out",
                isFocused && "scale-x-100",
                derivedState === "error"
                  ? "bg-destructive"
                  : derivedState === "success"
                    ? "bg-success"
                    : derivedState === "warning"
                      ? "bg-warning"
                      : "bg-primary",
              )}
            />
          )}
        </div>

        {/* Footer: Error/Helper text and character count */}
        {(error || helperText || (showCount && maxLength)) && (
          <div className="flex items-start justify-between gap-2 px-1">
            <div className="flex-1">
              {error && (
                <p
                  id={`${textareaId}-error`}
                  className="fade-in slide-in-from-top-1 animate-in text-destructive text-xs duration-200"
                >
                  {error}
                </p>
              )}
              {!error && helperText && (
                <p id={`${textareaId}-helper`} className="text-muted-foreground text-xs">
                  {helperText}
                </p>
              )}
            </div>

            {/* Character count with color gradient */}
            {showCount && maxLength && (
              <span
                className={cn(
                  "text-xs tabular-nums transition-colors duration-200",
                  charCount > maxLength * 0.9
                    ? "text-destructive"
                    : charCount > maxLength * 0.7
                      ? "text-warning"
                      : "text-muted-foreground",
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

Textarea.displayName = "Textarea";

export default Textarea;
