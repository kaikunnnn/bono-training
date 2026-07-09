import { Skeleton } from "@/components/ui/skeleton";

/**
 * /questions/new の初期 loading（auth / サブスク判定 / カテゴリ取得中に表示）
 * 「質問を投稿する」押下後すぐに画面が切り替わり、応答が返っている感を出す（#137-A）
 */
export default function NewQuestionLoading() {
  return (
    <div className="container py-8">
      <div className="mx-auto max-w-2xl">
        {/* 戻るボタン */}
        <Skeleton className="mb-4 h-8 w-28" />

        {/* フォームカード */}
        <div className="rounded-xl border bg-card p-6 space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>

          {/* 投稿者情報 */}
          <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/40 px-4 py-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-1.5">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
          </div>

          {/* ステップフォーム（プログレスバー + カテゴリグリッド） */}
          <div className="mx-auto max-w-lg space-y-8">
            <Skeleton className="h-2 w-full rounded-full" />
            <div className="grid grid-cols-2 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-20 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
