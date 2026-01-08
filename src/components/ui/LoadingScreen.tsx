import { Sparkles } from "lucide-react";
import { tv, type VariantProps } from "tailwind-variants";
import { Logo } from "@/components/brand/Logo";
import { cn } from "@/lib/utils";

const loadingScreenVariants = tv({
  slots: {
    root: "container mx-auto px-4",
    wrap: "flex min-h-[calc(100vh-4rem)] items-center justify-center py-12",
    card: ["w-full max-w-md", "rounded-xl border border-border bg-card", "p-6 sm:p-8"],
    header: "flex items-center justify-between",
    badge: [
      "inline-flex items-center gap-2",
      "rounded-full border border-border bg-muted/60",
      "px-3 py-1",
      "text-muted-foreground text-xs",
    ],
    title: "mt-4 font-semibold text-base text-foreground",
    description: "mt-1 text-muted-foreground text-sm",
    bars: "mt-6 space-y-3",
    bar: ["h-2 w-full overflow-hidden rounded-full bg-muted", "motion-reduce:animate-none"],
    shimmer: [
      "h-full w-full",
      "bg-gradient-to-r from-muted via-muted-foreground/10 to-muted",
      "bg-[length:200%_100%] animate-shimmer",
      "motion-reduce:animate-none",
    ],
  },
  variants: {
    density: {
      cozy: {
        bars: "mt-6 space-y-3",
      },
      compact: {
        bars: "mt-5 space-y-2.5",
      },
    },
  },
  defaultVariants: {
    density: "cozy",
  },
});

export interface LoadingScreenProps extends VariantProps<typeof loadingScreenVariants> {
  className?: string;
  title?: string;
  description?: string;
}

export function LoadingScreen({
  className,
  density,
  title = "Getting things ready",
  description = "Loading your roadmap and progress…",
}: LoadingScreenProps) {
  const styles = loadingScreenVariants({ density });

  return (
    <main className={cn(styles.root(), className)}>
      <div className={styles.wrap()} aria-busy="true" aria-live="polite">
        <div className={styles.card()}>
          <div className={styles.header()}>
            <Logo size="md" withTagline={false} />
            <span className={styles.badge()}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
              Syncing
            </span>
          </div>

          <div className={styles.title()}>{title}</div>
          <div className={styles.description()}>{description}</div>

          <div className={styles.bars()}>
            <div className={cn(styles.bar(), "w-[88%]")}>
              <div className={styles.shimmer()} />
            </div>
            <div className={cn(styles.bar(), "w-[74%]")}>
              <div className={styles.shimmer()} />
            </div>
            <div className={cn(styles.bar(), "w-[62%]")}>
              <div className={styles.shimmer()} />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
