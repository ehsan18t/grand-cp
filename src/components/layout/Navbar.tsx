"use client";

import { BarChart3, BookOpen, Clock, Heart, Lock, Menu, X } from "lucide-react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { LoginButton } from "../auth/LoginButton";
import { UserMenu } from "../auth/UserMenu";
import { ThemeSwitcher } from "./ThemeSwitcher";

const navLinks = [
  { href: "/problems", label: "Problems", icon: BookOpen, requiresAuth: false },
  { href: "/problems/favorites", label: "Favorites", icon: Heart, requiresAuth: true },
  { href: "/stats", label: "Stats", icon: BarChart3, requiresAuth: true },
  { href: "/problems/history", label: "History", icon: Clock, requiresAuth: true },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session, isPending } = authClient.useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isGuest = !session?.user;

  return (
    <nav className="sticky top-0 z-50 border-border border-b bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <span className="text-primary">Grand</span>
          <span>CP</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden items-center gap-1 md:flex">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/problems"
                ? pathname === "/problems" || pathname.startsWith("/problems/phase")
                : pathname.startsWith(link.href);
            const showLock = link.requiresAuth && isGuest && !isPending;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center gap-2 rounded-lg px-4 py-2 font-medium text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : showLock
                      ? "text-muted-foreground/60 hover:bg-accent hover:text-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                )}
                title={showLock ? "Sign in to access" : undefined}
              >
                <link.icon className="h-4 w-4" />
                {link.label}
                {showLock && <Lock className="h-3 w-3 opacity-50" />}
              </Link>
            );
          })}
        </div>

        {/* Auth Section */}
        <div className="hidden items-center gap-4 md:flex">
          <ThemeSwitcher />
          {isPending ? (
            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
          ) : session?.user ? (
            <UserMenu session={session} />
          ) : (
            <LoginButton size="sm" />
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileOpen(!mobileOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-accent md:hidden"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="border-border border-t bg-background p-4 md:hidden">
          <div className="space-y-2">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/problems"
                  ? pathname === "/problems" || pathname.startsWith("/problems/phase")
                  : pathname.startsWith(link.href);
              const showLock = link.requiresAuth && isGuest && !isPending;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-4 py-3 font-medium text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : showLock
                        ? "text-muted-foreground/60 hover:bg-accent hover:text-foreground"
                        : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {showLock && <Lock className="h-3 w-3 opacity-50" />}
                </Link>
              );
            })}
          </div>

          <div className="mt-4 flex items-center justify-between border-border border-t pt-4">
            <div className="text-muted-foreground text-xs">Theme</div>
            <ThemeSwitcher />
          </div>

          <div className="mt-4 border-border border-t pt-4">
            {isPending ? (
              <div className="h-10 w-full animate-pulse rounded-lg bg-muted" />
            ) : session?.user ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name}
                      width={40}
                      height={40}
                      sizes="40px"
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                      {session.user.name.charAt(0)}
                    </div>
                  )}
                  <div>
                    <div className="font-medium text-sm">{session.user.name}</div>
                    <div className="text-muted-foreground text-xs">{session.user.email}</div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    await authClient.signOut();
                    setMobileOpen(false);
                  }}
                  className="text-destructive text-sm"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <LoginButton className="w-full" />
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
