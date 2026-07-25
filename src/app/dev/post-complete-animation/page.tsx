/**
 * /dev/post-complete-animation — 投稿完了アニメ（StepDone）の再生確認ページ（#146 T22）
 *
 * 実フロー最終ステップの StepDone を isPreview で表示し、「リプレイ」で何度でも
 * 再生してアニメのタイミングを目視確認するための開発用ページ。
 * /dev は本番から遮断済み（#123）のため認証不要。
 */

import { Metadata } from "next";
import Link from "next/link";
import { PostCompleteAnimationDemo } from "./PostCompleteAnimationDemo";

export const metadata: Metadata = {
  title: "投稿完了アニメの再生確認 (/dev/post-complete-animation)",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-12 min-w-0">
        <header className="mb-8 pb-4 border-b border-gray-200">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            <Link
              href="/dev"
              className="hover:text-text-primary underline"
            >
              /dev
            </Link>{" "}
            / 投稿完了アニメ
          </p>
          <h1 className="text-2xl font-bold text-text-primary font-rounded-mplus mt-1">
            投稿完了アニメの再生確認
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            投稿フロー最終ステップの完了演出（チェック描画 → 白フラッシュ → 花吹雪 →
            🙌ARIGATO🙌 → 残りブロックのフェードイン）を、実コンポーネント（StepDone）で
            そのまま表示する。「リプレイ」で何度でも頭から再生できるので、タイミング調整の
            体感確認に使う。プレビュー表示（slug 無し）のため、ボタンの遷移先は一覧へ向く。
          </p>
        </header>

        <PostCompleteAnimationDemo />
      </div>
    </div>
  );
}
