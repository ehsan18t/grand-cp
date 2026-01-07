import { Heart } from "lucide-react";
import { Skeleton } from "@/components/ui";
import { ProblemCardSkeletonList } from "@/components/ui/skeletons";

export default function FavoritesLoading() {
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

      <div className="mb-6">
        <Skeleton width={120} height={16} />
      </div>

      <ProblemCardSkeletonList count={6} />
    </main>
  );
}
