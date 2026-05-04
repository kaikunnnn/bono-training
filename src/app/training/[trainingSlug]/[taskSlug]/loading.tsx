import { Skeleton } from "@/components/ui/skeleton";

/**
 * タスク詳細ページのローディングUI
 */
export default function TaskDetailLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        {/* Task header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-8 w-3/4 mb-4" />
        </div>

        {/* Task content skeleton */}
        <div className="space-y-6">
          <Skeleton className="w-full aspect-video rounded-lg" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ width: `${65 + Math.random() * 35}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
