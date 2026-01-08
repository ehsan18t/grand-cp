import { Loader2 } from "lucide-react";

/**
 * Global loading state.
 * Shows a centered spinner while the page is loading.
 */
export default function Loading() {
  return (
    <main className="container mx-auto flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4 py-16">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    </main>
  );
}
