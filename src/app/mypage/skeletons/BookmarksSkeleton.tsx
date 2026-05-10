import { Skeleton } from "@/components/ui/skeleton";

export function BookmarksSkeleton({ mode }: { mode: "preview" | "full" }) {
  const itemCount = mode === "preview" ? 4 : 6;

  return (
    <section className="w-full pt-8 pb-10 flex flex-col items-start gap-3 border-b border-black/10">
      {mode === "preview" && (
        <div className="flex items-center justify-between w-full">
          <Skeleton className="h-6 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
      )}
      <div className="flex w-full flex-col gap-0 rounded-2xl overflow-hidden shadow-[0px_1px_3px_0px_rgba(0,0,0,0.04)] bg-white">
        {Array.from({ length: itemCount }).map((_, i) => (
          <BookmarkItemSkeleton key={i} />
        ))}
      </div>
    </section>
  );
}

function BookmarkItemSkeleton() {
  return (
    <div className="flex items-center gap-3 bg-white p-4" style={{ minHeight: 68 }}>
      <Skeleton className="flex-shrink-0" style={{ width: 85, height: 48, borderRadius: 8 }} />
      <div className="flex flex-col flex-1 min-w-0 gap-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
      </div>
      <Skeleton className="w-9 h-9 rounded-full flex-shrink-0" />
    </div>
  );
}
