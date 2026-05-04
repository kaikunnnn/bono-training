import { Skeleton } from "@/components/ui/skeleton";

/**
 * トレーニングページのローディングUI
 *
 * TrainingHero + SectionHeading + カードグリッドのスケルトンレイアウトを表示する
 */
export default function TrainingLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6">
        {/* Hero skeleton */}
        <section className="flex flex-col items-center pt-10 w-full">
          <div className="w-full flex flex-col gap-4 border-b border-[#e2e8f0] pb-10">
            <Skeleton className="h-9 w-3/4 md:w-1/2" />
            <Skeleton className="h-5 w-2/3 md:w-1/3" />
          </div>
        </section>

        {/* Section 1 skeleton */}
        <div className="py-12">
          <div className="mb-8 flex flex-col gap-2">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-80" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="w-full flex flex-col gap-4 animate-pulse">
                <Skeleton className="w-full aspect-[3/4] rounded-3xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        {/* Separator */}
        <div className="h-px w-full bg-gray-200" />

        {/* Section 2 skeleton */}
        <div className="py-12">
          <div className="mb-8 flex flex-col gap-2">
            <Skeleton className="h-7 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-10 xl:gap-12">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="w-full flex flex-col gap-4 animate-pulse">
                <Skeleton className="w-full aspect-[3/4] rounded-3xl" />
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <Skeleton className="h-10 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
