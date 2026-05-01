import Link from "next/link";
import { cn } from "@/lib/utils";

interface FooterProps {
  className?: string;
}

/**
 * フッターコンポーネント
 * 元のViteプロジェクトのFooter.tsxと同じ構造
 */
export function Footer({ className }: FooterProps) {
  const isDev = process.env.NODE_ENV === "development";

  return (
    <footer className={cn("border-t", className)}>
      <div className="container py-12 md:py-16">
        <div className="text-center text-sm text-muted-foreground">
          {/* コミュニティ */}
          <div className="flex justify-center gap-4 mb-3">
            <Link href="/questions" className="hover:underline">
              みんなの質問
            </Link>
            <Link href="/feedbacks" className="hover:underline">
              フィードバック
            </Link>
            <Link href="/guide" className="hover:underline">
              ガイド
            </Link>
          </div>

          {/* サービス */}
          <div className="flex justify-center gap-4 mb-2">
            <Link href="/feedback-apply" className="hover:underline">
              15分フィードバック
            </Link>
            <Link href="/subscription" className="hover:underline">
              サブスクリプション
            </Link>
          </div>

          {/* 開発環境のみ: 隠しページへのリンク */}
          {isDev && (
            <div className="flex justify-center gap-4 mb-2 text-xs text-gray-400">
              <span className="text-gray-500">[Dev]</span>
              <Link href="/mypage" className="hover:underline">
                マイページ
              </Link>
              <Link href="/subscription/complete" className="hover:underline">
                サブスク完了
              </Link>
            </div>
          )}

          <p>© BONO. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
