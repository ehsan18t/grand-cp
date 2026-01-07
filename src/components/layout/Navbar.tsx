"use client";

import { BarChart3, BookOpen, Clock, Heart, Menu, Search, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/stores/app-store";
import { LoginButton } from "../auth/LoginButton";
import { UserMenu } from "../auth/UserMenu";
import { ThemeSwitcher } from "./ThemeSwitcher";

const navLinks = [
  { href: "/problems", label: "Problems", icon: BookOpen },
  { href: "/problems/favorites", label: "Favorites", icon: Heart },
  { href: "/stats", label: "Stats", icon: BarChart3 },
  { href: "/problems/history", label: "History", icon: Clock },
];

export function Navbar() {
  const pathname = usePathname();
  const user = useAppStore((s) => s.user);
  const isInitialized = useAppStore((s) => s.isInitialized);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close mobile menu on route change
  // biome-ignore lint/correctness/useExhaustiveDependencies: Intentionally re-run when pathname changes
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const isSearchActive = pathname === "/problems/search";

  return (
    <>
      <nav className="sticky top-0 z-50 border-border border-b bg-background/95 backdrop-blur-md supports-backdrop-filter:bg-background/80">
        <div className="container mx-auto flex h-14 items-center justify-between gap-4 px-4 sm:h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center transition-opacity hover:opacity-80"
            aria-label="GrandCP Home"
          >
            <Logo size="md" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden flex-1 items-center justify-center gap-1 md:flex">
            {navLinks.map((link) => {
              const isActive =
                link.href === "/problems"
                  ? pathname === "/problems" || pathname.startsWith("/problems/phase")
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-3 py-2 font-medium text-sm transition-all",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Desktop Right Section - Utility Icons + Auth */}
          <div className="hidden items-center gap-2 md:flex">
            {/* Utility Icons */}
            <div className="flex items-center gap-1">
              <Link
                href="/problems/search"
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition-colors",
                  isSearchActive
                    ? "border-primary/20 bg-primary/10 text-primary"
                    : "text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
                )}
                title="Search Problems"
              >
                <Search className="h-4 w-4" />
              </Link>
              <ThemeSwitcher />
            </div>

            {/* Auth */}
            {!isInitialized ? (
              <div className="h-9 w-24 animate-pulse rounded-full bg-muted" />
            ) : user ? (
              <UserMenu user={user} />
            ) : (
              <LoginButton size="sm" />
            )}
          </div>

          {/* Mobile Right Section */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Utility Icons */}
            <Link
              href="/problems/search"
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition-colors",
                isSearchActive
                  ? "border-primary/20 bg-primary/10 text-primary"
                  : "text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
              )}
              title="Search"
            >
              <Search className="h-4 w-4" />
            </Link>
            <ThemeSwitcher />

            <button
              type="button"
              onClick={() => setMobileOpen(!mobileOpen)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border border-transparent transition-colors",
                mobileOpen
                  ? "border-border bg-muted text-foreground"
                  : "text-muted-foreground hover:border-border hover:bg-muted hover:text-foreground",
              )}
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity duration-300 md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Panel */}
      <div
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-xs border-border border-l bg-background shadow-xl transition-transform duration-300 ease-out md:hidden",
          mobileOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        {/* Mobile Menu Header */}
        <div className="flex h-14 items-center justify-between border-border border-b px-4 sm:h-16">
          <span className="font-semibold text-sm">Menu</span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile Menu Content */}
        <div className="flex h-[calc(100%-3.5rem)] flex-col overflow-y-auto sm:h-[calc(100%-4rem)]">
          {/* Navigation Links */}
          <div className="flex-1 space-y-1 p-4">
            <p className="mb-2 px-3 font-medium text-muted-foreground text-xs uppercase tracking-wider">
              Navigation
            </p>
            {navLinks.map((link) => {
              const isActive =
                link.href === "/problems"
                  ? pathname === "/problems" || pathname.startsWith("/problems/phase")
                  : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-3 font-medium text-sm transition-colors",
                    isActive ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted",
                  )}
                >
                  <link.icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* User Section */}
          <div className="border-border border-t p-4">
            {!isInitialized ? (
              <div className="h-12 w-full animate-pulse rounded-lg bg-muted" />
            ) : user ? (
              <div className="space-y-3">
                <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                  {user.image ? (
                    <Image
                      src={user.image}
                      alt={user.name}
                      width={40}
                      height={40}
                      sizes="40px"
                      className="h-10 w-10 rounded-full object-cover ring-2 ring-primary/20"
                    />
                  ) : (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary ring-2 ring-primary/20">
                      {user.name.charAt(0)}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium text-sm">{user.name}</div>
                    <div className="truncate text-muted-foreground text-xs">{user.email}</div>
                  </div>
                </div>
                <Link
                  href={`/u/${user.username ?? user.id}`}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-border py-2.5 text-sm transition-colors hover:bg-muted"
                >
                  View Profile
                </Link>
                <button
                  type="button"
                  onClick={async () => {
                    await authClient.signOut();
                    setMobileOpen(false);
                  }}
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-destructive/10 py-2.5 text-destructive text-sm transition-colors hover:bg-destructive/20"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <LoginButton className="w-full" />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
