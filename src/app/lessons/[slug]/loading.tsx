import { Skeleton } from "@/components/ui/skeleton";

/**
 * レッスン詳細ページのローディングUI
 */
export default function LessonDetailLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        {/* Lesson header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-8 w-2/3 mb-2" />
          <Skeleton className="h-4 w-1/2" />
        </div>

        {/* Quest list skeleton */}
        <div className="space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-48" />
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, j) => (
                  <div key={j} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 animate-pulse">
                    <Skeleton className="w-8 h-8 rounded flex-shrink-0" />
                    <Skeleton className="h-4 w-3/4" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
