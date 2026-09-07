import { Skeleton } from "@/components/ui/skeleton";

/**
 * 記事詳細ページのローディングUI
 *
 * layout.tsx でサイドナビが描画されたあと、main 領域の位置にだけ表示される。
 * （サイドナビは記事間遷移で保持されるため、loading 時には触れない）
 */
export default function ArticleDetailLoading() {
  return (
    <main className="flex-1 min-w-0 flex flex-col items-center gap-4 pb-12">
      {/* 動画スケルトン（メイン領域） */}
      <div className="w-full px-4 sm:px-6 md:px-0 min-[1680px]:px-2 min-[1680px]:pt-8 pt-16 md:pt-8">
        <Skeleton className="w-full aspect-video rounded-2xl" />
      </div>

      {/* タイトル & 本文スケルトン */}
      <div className="w-full px-4 sm:px-6 md:px-0 py-0 min-[1680px]:px-2">
        <div className="flex flex-col gap-4">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-3 pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-4"
                style={{ width: `${70 + ((i * 13) % 30)}%` }}
              />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
