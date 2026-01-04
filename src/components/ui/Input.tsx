"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Eye, EyeOff, X } from "lucide-react";
import {
  type ChangeEvent,
  type FocusEvent,
  forwardRef,
  type InputHTMLAttributes,
  useRef,
  useState,
} from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useReducedMotion } from "@/hooks";
import { cn } from "@/lib/utils";

// ============================================================================
// Variants
// ============================================================================

export const inputVariants = tv({
  base: [
    "peer w-full rounded-xl border-2 bg-transparent px-4 pt-5 pb-2",
    "text-foreground text-sm",
    "outline-none",
    "transition-[border-color,box-shadow] duration-300 ease-out",
    "disabled:cursor-not-allowed disabled:opacity-50",
    "file:border-0 file:bg-transparent file:font-medium file:text-foreground file:text-sm",
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
        "rounded-none border-x-0 border-t-0 border-b-2 border-border/60 bg-transparent px-0 pt-4 pb-2",
        "hover:border-foreground/50",
        "focus:border-primary focus:shadow-none",
      ],
    },
    inputSize: {
      sm: "pt-4 pb-1.5 text-xs",
      md: "pt-5 pb-2 text-sm",
      lg: "pt-6 pb-2.5 text-base",
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
    inputSize: "md",
    state: "default",
  },
});

// ============================================================================
// Types
// ============================================================================

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size">,
    VariantProps<typeof inputVariants> {
  /** Icon to show on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to show on the right side */
  rightIcon?: React.ReactNode;
  /** Error message to display */
  error?: string;
  /** Helper text to display below input */
  helperText?: string;
  /** Label for the input (also acts as placeholder when not focused) */
  label?: string;
  /** Whether the field is required */
  required?: boolean;
  /** Wrapper className */
  wrapperClassName?: string;
  /** Show clear button when input has value */
  clearable?: boolean;
  /** Callback when clear button is clicked */
  onClear?: () => void;
  /** Prefix text to show before input (e.g., "$", "https://") */
  prefix?: string;
  /** Suffix text to show after input (e.g., ".com", "kg") */
  suffix?: string;
  /** Full width */
  fullWidth?: boolean;
  /** Show character count */
  showCount?: boolean;
  /** Animate shake on error */
  animateOnError?: boolean;
  /** Use floating label (default: true) */
  floatingLabel?: boolean;
}

// ============================================================================
// Component
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      wrapperClassName,
      variant = "default",
      inputSize = "md",
      state,
      fullWidth = true,
      leftIcon,
      rightIcon,
      error,
      helperText,
      label,
      required,
      type = "text",
      id,
      disabled,
      clearable,
      onClear,
      value,
      defaultValue,
      onChange,
      onFocus,
      onBlur,
      prefix,
      suffix,
      showCount,
      maxLength,
      animateOnError = true,
      floatingLabel = true,
      placeholder,
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [internalValue, setInternalValue] = useState(defaultValue ?? "");
    const [isFocused, setIsFocused] = useState(false);
    const internalRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const labelRef = useRef<HTMLLabelElement>(null);
    const inputRef = (ref as React.RefObject<HTMLInputElement>) || internalRef;
    const prevErrorRef = useRef<string | undefined>(error);
    const prefersReducedMotion = useReducedMotion();

    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    // Determine if controlled or uncontrolled
    const isControlled = value !== undefined;
    const currentValue = isControlled ? value : internalValue;
    const hasValue = currentValue !== "" && currentValue !== undefined;
    const characterCount = String(currentValue).length;

    // Derive state from error
    const derivedState = error ? "error" : state;

    // Label should float when focused or has value
    const shouldFloat = isFocused || hasValue || !!prefix;

    // Handle onChange for uncontrolled inputs
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
      if (!isControlled) {
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    // Handle focus
    const handleFocus = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    // Handle clear
    const handleClear = () => {
      if (!isControlled) {
        setInternalValue("");
        if (inputRef.current) {
          inputRef.current.value = "";
          inputRef.current.focus();
        }
      }
      onClear?.();
    };

    // Floating label animation with GSAP
    useGSAP(
      () => {
        if (!labelRef.current || !floatingLabel || !label) return;

        const labelEl = labelRef.current;

        // Respect reduced motion preference
        if (prefersReducedMotion) {
          gsap.set(labelEl, {
            y: shouldFloat ? -12 : 0,
            scale: shouldFloat ? 0.75 : 1,
            x: shouldFloat && leftIcon ? -28 : 0,
          });
          return;
        }

        if (shouldFloat) {
          gsap.to(labelEl, {
            y: -12,
            scale: 0.75,
            x: leftIcon ? -28 : 0,
            duration: 0.2,
            ease: "power3.out",
          });
        } else {
          gsap.to(labelEl, {
            y: 0,
            scale: 1,
            x: 0,
            duration: 0.2,
            ease: "power3.out",
          });
        }
      },
      { dependencies: [shouldFloat, floatingLabel, label, leftIcon, prefersReducedMotion] },
    );

    // Shake animation on error
    useGSAP(
      () => {
        if (!wrapperRef.current || !animateOnError || prefersReducedMotion) return;

        // Only animate when error appears (not on mount)
        if (error && !prevErrorRef.current) {
          gsap.to(wrapperRef.current, {
            keyframes: [
              { x: -8, duration: 0.05 },
              { x: 8, duration: 0.05 },
              { x: -5, duration: 0.05 },
              { x: 5, duration: 0.05 },
              { x: -2, duration: 0.05 },
              { x: 0, duration: 0.05 },
            ],
            ease: "power2.out",
          });
        }
        prevErrorRef.current = error;
      },
      { dependencies: [error, animateOnError, prefersReducedMotion] },
    );

    const inputId = id || props.name;

    // Determine right side elements
    const hasRightElements = rightIcon || isPassword || (clearable && hasValue);
    const rightElementsCount =
      (rightIcon ? 1 : 0) + (isPassword ? 1 : 0) + (clearable && hasValue ? 1 : 0);

    // Calculate padding based on icons and addons
    const getPaddingClasses = () => {
      const leftPad = leftIcon ? "pl-11" : prefix ? "pl-14" : "pl-4";
      let rightPad = "pr-4";
      if (rightElementsCount === 1) rightPad = "pr-11";
      else if (rightElementsCount === 2) rightPad = "pr-18";
      else if (rightElementsCount >= 3) rightPad = "pr-24";
      if (suffix) rightPad = "pr-14";
      return `${leftPad} ${rightPad}`;
    };

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
            htmlFor={inputId}
            className={cn(
              "font-medium text-foreground text-sm transition-colors duration-200",
              disabled && "cursor-not-allowed opacity-50",
            )}
          >
            {label}
            {required && <span className="ml-1 text-destructive">*</span>}
          </label>
        )}

        {/* Input container */}
        <div className="relative">
          {/* Left icon */}
          {leftIcon && (
            <div
              className={cn(
                "-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 z-10 flex items-center justify-center",
                "transition-colors duration-200",
                isFocused ? "text-primary" : "text-muted-foreground",
                derivedState === "error" && "text-destructive",
                derivedState === "success" && "text-success",
              )}
            >
              {leftIcon}
            </div>
          )}

          {/* Prefix */}
          {prefix && (
            <span
              className={cn(
                "-translate-y-1/2 pointer-events-none absolute top-1/2 left-4 z-10 select-none",
                "text-muted-foreground text-sm transition-opacity duration-200",
                shouldFloat ? "opacity-100" : "opacity-0",
              )}
            >
              {prefix}
            </span>
          )}

          {/* Input element */}
          <input
            ref={inputRef}
            id={inputId}
            type={inputType}
            disabled={disabled}
            value={isControlled ? value : undefined}
            defaultValue={!isControlled ? defaultValue : undefined}
            onChange={handleChange}
            onFocus={handleFocus}
            onBlur={handleBlur}
            maxLength={maxLength}
            placeholder={floatingLabel ? undefined : placeholder}
            className={cn(
              inputVariants({ variant, inputSize, state: derivedState }),
              getPaddingClasses(),
              !floatingLabel && "pt-2 pb-2",
              className,
            )}
            aria-invalid={derivedState === "error"}
            aria-describedby={
              error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined
            }
            {...props}
          />

          {/* Floating label */}
          {floatingLabel && label && (
            <label
              ref={labelRef}
              htmlFor={inputId}
              className={cn(
                "-translate-y-1/2 pointer-events-none absolute top-1/2 origin-left",
                leftIcon ? "left-11" : "left-4",
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

          {/* Suffix */}
          {suffix && (
            <span
              className={cn(
                "-translate-y-1/2 pointer-events-none absolute top-1/2 right-4 z-10 select-none",
                "text-muted-foreground text-sm transition-opacity duration-200",
                shouldFloat ? "opacity-100" : "opacity-0",
              )}
            >
              {suffix}
            </span>
          )}

          {/* Right side elements */}
          {hasRightElements && (
            <div className="-translate-y-1/2 absolute top-1/2 right-4 flex items-center gap-2">
              {/* Clear button */}
              {clearable && hasValue && !disabled && (
                <button
                  type="button"
                  onClick={handleClear}
                  className={cn(
                    "flex items-center justify-center rounded-full p-1",
                    "bg-muted/50 text-muted-foreground",
                    "transition-all duration-200",
                    "hover:scale-110 hover:bg-muted hover:text-foreground",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    "active:scale-95",
                  )}
                  tabIndex={-1}
                  aria-label="Clear input"
                >
                  <X className="size-3" aria-hidden="true" />
                </button>
              )}

              {/* Password toggle */}
              {isPassword && (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={cn(
                    "flex items-center justify-center rounded-lg p-1",
                    "text-muted-foreground",
                    "transition-all duration-200",
                    "hover:bg-muted/50 hover:text-foreground",
                    "focus:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  )}
                  tabIndex={-1}
                  aria-pressed={showPassword}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Eye className="size-4" aria-hidden="true" />
                  )}
                </button>
              )}

              {/* Right icon */}
              {rightIcon && (
                <span
                  className={cn(
                    "transition-colors duration-200",
                    isFocused ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  {rightIcon}
                </span>
              )}
            </div>
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

        {/* Error, helper text, and character count */}
        {(error || helperText || (showCount && maxLength)) && (
          <div className="flex items-start justify-between gap-2 px-1">
            <div className="flex-1">
              {error && (
                <p
                  id={`${inputId}-error`}
                  className="fade-in slide-in-from-top-1 animate-in text-destructive text-xs duration-200"
                >
                  {error}
                </p>
              )}
              {!error && helperText && (
                <p id={`${inputId}-helper`} className="text-muted-foreground text-xs">
                  {helperText}
                </p>
              )}
            </div>
            {showCount && maxLength && (
              <span
                className={cn(
                  "text-xs tabular-nums transition-colors duration-200",
                  characterCount > maxLength * 0.9
                    ? "text-destructive"
                    : characterCount > maxLength * 0.7
                      ? "text-warning"
                      : "text-muted-foreground",
                )}
              >
                {characterCount}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

Input.displayName = "Input";

export default Input;
