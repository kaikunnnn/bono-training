import { Skeleton } from "@/components/ui/skeleton";

/**
 * 記事詳細ページのローディングUI
 */
export default function ArticleDetailLoading() {
  return (
    <div className="min-h-screen">
      <div className="max-w-[800px] w-full mx-auto px-4 sm:px-6 py-8 min-w-0">
        {/* Article header skeleton */}
        <div className="mb-8">
          <Skeleton className="h-4 w-32 mb-3" />
          <Skeleton className="h-8 w-3/4 mb-4" />
          <Skeleton className="w-full aspect-video rounded-lg" />
        </div>

        {/* Article body skeleton */}
        <div className="space-y-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-4"
              style={{ width: `${70 + Math.random() * 30}%` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
