import { Skeleton } from "@/components/ui/skeleton";

/**
 * Progress セクションの Suspense fallback
 * preview: 横並び2件 / full: 縦並び複数件 を模す
 */
export function ProgressSkeleton({ mode }: { mode: "preview" | "full" }) {
  if (mode === "preview") {
    return (
      <section className="w-full pt-8 pb-10 flex flex-col items-start gap-3 border-b border-black/10">
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-6 w-20" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="flex gap-[10px] w-full">
          {[0, 1].map((i) => (
            <div key={i} className="flex-1 min-w-0">
              <ProgressCardSkeleton />
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <div className="space-y-3">
      <Skeleton className="h-5 w-24" />
      {Array.from({ length: 3 }).map((_, i) => (
        <ProgressCardSkeleton key={i} />
      ))}
    </div>
  );
}

function ProgressCardSkeleton() {
  return (
    <div
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: "20px",
        padding: "19px 24px",
        display: "flex",
        flexDirection: "column",
        gap: "12px",
        boxShadow: "0px 2px 8px rgba(0, 0, 0, 0.08)",
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-4 items-center flex-1 min-w-0">
          <Skeleton className="w-12 h-[73px] rounded-r-lg flex-shrink-0" />
          <div className="flex flex-col gap-2 flex-1 min-w-0">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-1.5 w-full rounded-full" />
          </div>
        </div>
        <Skeleton className="h-8 w-12 flex-shrink-0" />
      </div>
    </div>
  );
}
