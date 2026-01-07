import { Code2 } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";
import { cn } from "@/lib/utils";

const logoVariants = tv({
  slots: {
    root: "inline-flex select-none items-center gap-2 font-sans leading-none",
    mark: [
      "grid place-items-center",
      "rounded-lg",
      "border border-primary/20",
      "bg-primary/10",
      "text-primary",
      "shadow-sm",
    ],
    icon: "shrink-0",
    wordmark: "inline-flex items-baseline gap-2",
    grand: "font-semibold tracking-[-0.03em] text-foreground",
    cpChip: [
      "inline-flex items-center",
      "relative -top-px",
      "rounded-full",
      "border border-border",
      "bg-muted/70",
      "text-foreground",
    ],
    cpText: "font-mono font-semibold uppercase",
    tagline: "hidden text-muted-foreground text-xs sm:inline",
  },
  variants: {
    size: {
      sm: {
        mark: "h-8 w-8",
        icon: "size-4",
        wordmark: "text-base",
        cpChip: "px-1.5 py-0.5",
        cpText: "text-[0.72em] tracking-[0.2em] -mr-[0.2em]",
      },
      md: {
        mark: "h-9 w-9",
        icon: "size-4",
        wordmark: "text-lg",
        cpChip: "px-2 py-0.5",
        cpText: "text-[0.7em] tracking-[0.22em] -mr-[0.22em]",
      },
      lg: {
        mark: "h-10 w-10",
        icon: "size-5",
        wordmark: "text-xl",
        cpChip: "px-2.5 py-1",
        cpText: "text-[0.68em] tracking-[0.24em] -mr-[0.24em]",
      },
    },
    variant: {
      full: {
        root: "",
      },
      mark: {
        root: "",
        wordmark: "hidden",
      },
    },
    withTagline: {
      true: {
        root: "gap-2.5",
      },
      false: {},
    },
  },
  defaultVariants: {
    size: "md",
    variant: "full",
    withTagline: false,
  },
});

export type LogoProps = {
  className?: string;
  label?: string;
} & VariantProps<typeof logoVariants>;

export function Logo({ className, size, variant, withTagline, label = "GrandCP" }: LogoProps) {
  const styles = logoVariants({ size, variant, withTagline });

  return (
    <span className={cn(styles.root(), className)} role="img" aria-label={label}>
      <span className={styles.mark()} aria-hidden="true">
        <Code2 className={styles.icon()} aria-hidden="true" />
      </span>

      <span className={styles.wordmark()}>
        <span className={styles.grand()}>Grand</span>
        <span className={styles.cpChip()} aria-hidden="true">
          <span className={styles.cpText()}>CP</span>
        </span>
      </span>

      {withTagline ? <span className={styles.tagline()}>Competitive Programming</span> : null}
    </span>
  );
}
