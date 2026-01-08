import { Loader2 } from "lucide-react";
import { forwardRef, type HTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const spinnerVariants = tv({
  base: [
    "inline-flex items-center justify-center",
    // Smoother animation (GPU + will-change), and respect reduced-motion.
    "motion-reduce:animate-none",
    "transform-gpu will-change-transform",
  ],
  variants: {
    size: {
      xs: "h-3 w-3",
      sm: "h-4 w-4",
      md: "h-6 w-6",
      lg: "h-8 w-8",
      xl: "h-10 w-10",
    },
    tone: {
      muted: "text-muted-foreground",
      primary: "text-primary",
      inherit: "text-current",
    },
    speed: {
      normal: "animate-spin",
      fast: "animate-[spin_800ms_linear_infinite]",
      slow: "animate-[spin_1200ms_linear_infinite]",
    },
  },
  defaultVariants: {
    size: "sm",
    tone: "inherit",
    speed: "normal",
  },
});

export interface SpinnerProps
  extends Omit<HTMLAttributes<HTMLSpanElement>, "children">,
    VariantProps<typeof spinnerVariants> {
  label?: string;
}

export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(
  ({ className, size, tone, speed, label = "Loading", ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(spinnerVariants({ size, tone, speed }), className)}
        role="status"
        aria-label={label}
        {...props}
      >
        <Loader2 className="h-full w-full" aria-hidden="true" />
      </span>
    );
  },
);

Spinner.displayName = "Spinner";
