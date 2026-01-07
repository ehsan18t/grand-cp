"use client";

import { LogIn } from "lucide-react";
import { forwardRef } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { useToast } from "@/components/ui";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const loginButtonVariants = tv({
  base: [
    "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    "disabled:pointer-events-none disabled:opacity-50",
  ],
  variants: {
    variant: {
      default: "bg-primary text-primary-foreground hover:bg-primary/90",
      outline: "border border-border bg-background hover:bg-accent hover:text-accent-foreground",
      ghost: "hover:bg-accent hover:text-accent-foreground",
    },
    size: {
      sm: "h-8 px-3 text-sm",
      md: "h-10 px-4 text-sm",
      lg: "h-11 px-6 text-base",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "md",
  },
});

export interface LoginButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof loginButtonVariants> {
  showIcon?: boolean;
}

export const LoginButton = forwardRef<HTMLButtonElement, LoginButtonProps>(function LoginButton(
  { className, variant, size, showIcon = true, children, ...props },
  ref,
) {
  const { addToast } = useToast();

  const handleLogin = async () => {
    try {
      const result = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/problems",
      });

      // Check if result contains an error
      if (result && typeof result === "object" && "error" in result && result.error) {
        const errorObj = result.error as { message?: string };
        throw new Error(errorObj.message ?? "Sign in failed");
      }
    } catch {
      addToast({
        variant: "destructive",
        title: "Sign in failed",
        description: "Please try again. If it keeps failing, refresh the page.",
      });
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleLogin}
      className={cn(loginButtonVariants({ variant, size }), className)}
      {...props}
    >
      {showIcon && <LogIn className="h-4 w-4" />}
      {children ?? "Sign in with Google"}
    </button>
  );
});

LoginButton.displayName = "LoginButton";

export { loginButtonVariants };
