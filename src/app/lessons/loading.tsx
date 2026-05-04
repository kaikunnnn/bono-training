import { Skeleton } from "@/components/ui/skeleton";

/**
 * レッスン一覧ページのローディングUI
 *
 * PageHeader + CategoryNav + SectionHeading + カードグリッドの
 * スケルトンレイアウトを表示する
 */
export default function LessonsLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        {/* PageHeader skeleton */}
        <div className="text-center -mt-12 md:mt-12 mb-10 md:mb-[88px]">
          <Skeleton className="h-4 w-32 mx-auto mb-2" />
          <Skeleton className="h-10 w-48 mx-auto mb-3" />
          <Skeleton className="h-4 w-72 mx-auto" />
        </div>

        {/* CategoryNav skeleton (tab bar) */}
        <div className="sticky top-14 xl:top-0 z-10 mb-8 -mx-4 sm:-mx-6 px-2 sm:px-4 md:px-6">
          <div className="flex gap-3 py-3 overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-8 w-20 rounded-full flex-shrink-0" />
            ))}
          </div>
        </div>

        {/* Section skeleton blocks */}
        <div className="space-y-8">
          {Array.from({ length: 2 }).map((_, sectionIdx) => (
            <section key={sectionIdx}>
              {/* SectionHeading skeleton */}
              <div className="mb-6 flex flex-col gap-3">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-px w-full" />
              </div>

              {/* Card grid skeleton */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {Array.from({ length: 4 }).map((_, cardIdx) => (
                  <div key={cardIdx} className="animate-pulse">
                    <Skeleton className="w-full aspect-video rounded-lg mb-3" />
                    <Skeleton className="h-4 w-3/4 mb-2" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
