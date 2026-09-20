import { Skeleton } from "@/components/ui/skeleton";

export default function RoadmapLoading() {
  return (
    <div className="min-h-screen">
      <main
        className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6"
        aria-busy="true"
        aria-label="ロードマップを読み込み中"
      >
        <div className="mb-10 text-center md:mb-[88px] md:mt-12">
          <Skeleton className="mx-auto mb-2 h-4 w-24" />
          <Skeleton className="mx-auto mb-3 h-10 w-56" />
          <Skeleton className="mx-auto h-4 w-72 max-w-full" />
        </div>

        <div className="mb-8 flex justify-center gap-3 overflow-hidden py-3">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-8 w-28 shrink-0 rounded-full" />
          ))}
        </div>

        <div className="space-y-16">
          {Array.from({ length: 2 }).map((_, sectionIndex) => (
            <section key={sectionIndex}>
              <Skeleton className="mb-3 h-7 w-72 max-w-full" />
              <Skeleton className="mb-6 h-4 w-96 max-w-full" />
              <div className="grid grid-cols-1 gap-x-4 gap-y-5 md:grid-cols-2">
                {Array.from({ length: 2 }).map((_, cardIndex) => (
                  <Skeleton
                    key={cardIndex}
                    className="aspect-[4/3] w-full rounded-[32px]"
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
