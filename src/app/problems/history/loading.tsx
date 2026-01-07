import { Clock } from "lucide-react";
import { Skeleton } from "@/components/ui";

export default function HistoryLoading() {
  return (
    <main className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <div className="flex items-center gap-3">
          <Clock className="h-8 w-8 text-primary" />
          <div>
            <h1 className="font-bold text-3xl">Status History</h1>
            <p className="text-muted-foreground">Track your progress over time</p>
          </div>
        </div>
      </header>

      <div className="mb-6">
        <Skeleton width={180} height={16} />
      </div>

      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="flex items-center gap-4 rounded-lg border border-border bg-card p-4"
          >
            <Skeleton width={80} height={20} />
            <div className="min-w-0 flex-1">
              <Skeleton width="60%" height={20} className="mb-1" />
              <Skeleton width={120} height={14} />
            </div>
            <Skeleton width={100} height={24} />
          </div>
        ))}
      </div>
    </main>
  );
}
