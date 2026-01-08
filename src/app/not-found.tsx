import { ArrowLeft, Home, Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
};

export default function NotFound() {
  return (
    <main className="container mx-auto flex min-h-full flex-col items-center justify-center overflow-hidden px-4 py-16 text-center">
      {/* 404 Visual */}
      <div className="relative mb-8">
        <div className="flex items-center justify-center gap-28 font-bold text-[180px] text-primary/10 leading-none">
          <span>4</span>
          <span>4</span>
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-primary/10 p-6">
            <Search className="h-16 w-16 text-primary" />
          </div>
        </div>
      </div>

      {/* Message */}
      <h1 className="mb-3 font-bold text-2xl sm:text-3xl">Page Not Found</h1>
      <p className="mx-auto mb-8 max-w-md text-muted-foreground">
        Looks like this problem doesn't exist in our roadmap. The page you're looking for might have
        been moved or deleted.
      </p>

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Home className="h-4 w-4" />
          Go Home
        </Link>
        <Link
          href="/problems"
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-6 py-3 font-medium transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-4 w-4" />
          Browse Problems
        </Link>
      </div>

      {/* Quick Links */}
      <div className="mt-12 border-border border-t pt-8">
        <p className="mb-4 text-muted-foreground text-sm">Quick links</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/problems/search" className="text-primary text-sm hover:underline">
            Search Problems
          </Link>
          <Link href="/stats" className="text-primary text-sm hover:underline">
            Your Stats
          </Link>
          <Link href="/problems/favorites" className="text-primary text-sm hover:underline">
            Favorites
          </Link>
        </div>
      </div>
    </main>
  );
}
