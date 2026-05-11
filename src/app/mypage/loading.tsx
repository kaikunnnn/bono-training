import { Skeleton } from "@/components/ui/skeleton";

/**
 * /mypage 全体の初期 loading（getCurrentUser 中のみ表示）
 * その後は Suspense fallback（各セクションの skeleton）に置き換わる
 */
export default function MyPageLoading() {
  return (
    <div className="min-h-screen">
      <div className="pt-10 pb-0 px-4 max-w-3xl mx-auto">
        {/* ヘッダー */}
        <div className="flex items-center justify-between mb-6">
          <Skeleton className="h-7 w-32" />
          <Skeleton className="h-9 w-9 rounded-full" />
        </div>

        {/* タブ */}
        <div className="p-[3px] bg-zinc-100 rounded-lg outline outline-1 outline-offset-[-1px] outline-black/5 inline-flex items-center gap-2">
          {["すべて", "進捗", "お気に入り", "閲覧履歴"].map((label, i) => (
            <Skeleton key={i} className="h-6 w-16 rounded-md" />
          ))}
        </div>
      </div>
    </div>
  );
}
