import { Skeleton } from "@/components/ui/skeleton";

/**
 * 記事一覧ページのローディングUI
 */
export default function ArticlesLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        {/* PageHeader skeleton */}
        <div className="text-center -mt-12 md:mt-12 mb-10 md:mb-[88px]">
          <Skeleton className="h-4 w-24 mx-auto mb-2" />
          <Skeleton className="h-10 w-40 mx-auto mb-3" />
          <Skeleton className="h-4 w-64 mx-auto" />
        </div>

        {/* Article card grid skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse">
              <Skeleton className="w-full aspect-video rounded-lg mb-3" />
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
