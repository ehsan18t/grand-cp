"use client";

import { BarChart3, ChevronDown, LogOut, User } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { forwardRef, useState } from "react";
import { tv } from "tailwind-variants";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const userMenuVariants = tv({
  slots: {
    trigger: [
      "flex items-center gap-2 rounded-full border border-border bg-background p-1 pr-3",
      "cursor-pointer transition-colors hover:bg-accent",
    ],
    avatar: "flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary",
    avatarImage: "h-8 w-8 rounded-full object-cover",
    menu: [
      "absolute right-0 top-full z-50 mt-2 min-w-[200px]",
      "rounded-lg border border-border bg-popover p-1 shadow-lg",
    ],
    menuItem: [
      "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm",
      "cursor-pointer transition-colors hover:bg-accent",
    ],
    separator: "my-1 h-px bg-border",
  },
});

interface UserMenuUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  username?: string | null;
}

export interface UserMenuProps {
  user: UserMenuUser;
  className?: string;
}

export const UserMenu = forwardRef<HTMLDivElement, UserMenuProps>(function UserMenu(
  { user, className },
  ref,
) {
  const [isOpen, setIsOpen] = useState(false);
  const styles = userMenuVariants();

  const handleSignOut = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          window.location.href = "/";
        },
      },
    });
  };

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button type="button" onClick={() => setIsOpen(!isOpen)} className={styles.trigger()}>
        {user.image ? (
          <Image
            src={user.image}
            alt={user.name}
            width={32}
            height={32}
            sizes="32px"
            className={styles.avatarImage()}
          />
        ) : (
          <div className={styles.avatar()}>
            <User className="h-4 w-4" />
          </div>
        )}
        <span className="max-w-30 truncate font-medium text-sm">{user.name}</span>
        <ChevronDown className={cn("h-4 w-4 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />

          {/* Menu */}
          <div className={styles.menu()}>
            {/* User Info */}
            <div className="px-3 py-2">
              <div className="truncate font-medium text-sm">{user.name}</div>
              <div className="truncate text-muted-foreground text-xs">{user.email}</div>
            </div>

            <div className={styles.separator()} />

            {/* Links */}
            <Link
              href={`/u/${user.username ?? user.id}`}
              onClick={() => setIsOpen(false)}
              className={styles.menuItem()}
            >
              <User className="h-4 w-4" />
              Your Profile
            </Link>

            <Link href="/stats" onClick={() => setIsOpen(false)} className={styles.menuItem()}>
              <BarChart3 className="h-4 w-4" />
              Your Stats
            </Link>

            <div className={styles.separator()} />

            {/* Sign Out */}
            <button
              type="button"
              onClick={handleSignOut}
              className={cn(styles.menuItem(), "text-destructive")}
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </>
      )}
    </div>
  );
});

UserMenu.displayName = "UserMenu";
