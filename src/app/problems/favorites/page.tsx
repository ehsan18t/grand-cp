import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { Heart } from "lucide-react";
import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { FavoritesList } from "@/components/problems/FavoritesList";
import { createDb } from "@/db";
import { problems, userFavorites } from "@/db/schema";
import { createAuth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Favorites | Grand CP",
  description: "Your favorited competitive programming problems",
};

interface FavoriteProblem {
  id: number;
  number: number;
  platform: "leetcode" | "codeforces" | "cses" | "atcoder" | "other";
  name: string;
  url: string;
  phaseId: number;
  topic: string;
  isStarred: boolean;
  note: string | null;
  favoritedAt: Date;
}

export default async function FavoritesPage() {
  let favorites: FavoriteProblem[] = [];
  let isAuthenticated = false;

  try {
    const { env } = await getCloudflareContext();
    const db = createDb(env.DB);
    const auth = createAuth(env.DB, env);
    const requestHeaders = await headers();
    const session = await auth.api.getSession({ headers: requestHeaders });

    if (session?.user?.id) {
      isAuthenticated = true;

      const results = await db
        .select({
          id: problems.id,
          number: problems.number,
          platform: problems.platform,
          name: problems.name,
          url: problems.url,
          phaseId: problems.phaseId,
          topic: problems.topic,
          isStarred: problems.isStarred,
          note: problems.note,
          favoritedAt: userFavorites.createdAt,
        })
        .from(userFavorites)
        .innerJoin(problems, eq(userFavorites.problemId, problems.id))
        .where(eq(userFavorites.userId, session.user.id))
        .orderBy(userFavorites.createdAt)
        .all();

      favorites = results as FavoriteProblem[];
    }
  } catch {
    // Database not available
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <Heart className="h-8 w-8 text-destructive" />
          <div>
            <h1 className="font-bold text-3xl">Your Favorites</h1>
            <p className="text-muted-foreground">
              Problems you've marked as favorites for quick access
            </p>
          </div>
        </div>
      </header>

      {!isAuthenticated ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-semibold text-xl">Sign in to save favorites</h2>
          <p className="mb-4 text-muted-foreground">
            Create an account to save problems to your favorites list and track your progress.
          </p>
          <Link
            href="/api/auth/signin"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Sign In
          </Link>
        </div>
      ) : favorites.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-8 text-center">
          <Heart className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="mb-2 font-semibold text-xl">No favorites yet</h2>
          <p className="mb-4 text-muted-foreground">
            Start adding problems to your favorites by clicking the heart icon on any problem card.
          </p>
          <Link
            href="/problems"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Browse Problems
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-muted-foreground text-sm">
            {favorites.length} problem{favorites.length !== 1 ? "s" : ""} saved
          </div>
          <FavoritesList favorites={favorites} />
        </>
      )}
    </main>
  );
}
