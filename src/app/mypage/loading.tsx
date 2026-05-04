import { Skeleton } from "@/components/ui/skeleton";

/**
 * マイページのローディングUI
 *
 * タブバー + コンテンツエリアのスケルトンレイアウトを表示する
 */
export default function MyPageLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        {/* Page title skeleton */}
        <div className="mb-6">
          <Skeleton className="h-8 w-36 mb-2" />
          <Skeleton className="h-4 w-56" />
        </div>

        {/* Tab bar skeleton */}
        <div className="flex gap-2 border-b border-gray-200 mb-8 pb-2">
          {["すべて", "進捗", "お気に入り", "閲覧履歴"].map((_, i) => (
            <Skeleton key={i} className="h-9 w-20 rounded-lg" />
          ))}
        </div>

        {/* Content area: lesson card list skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-gray-100 animate-pulse">
              <Skeleton className="w-10 h-10 rounded-lg flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
                {/* Progress bar skeleton */}
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
