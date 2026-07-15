/**
 * /dev/question-post-feedback — 「質問を投稿する」押下時の応答フィードバック Before/After
 *
 * #137-A の改善記録。旧実装（無反応のまま遷移待ち）と新実装（ボタンスピナー →
 * loading.tsx のスケルトン）を、同じ擬似待ち時間で並べて体感比較できる。
 */

import { Metadata } from "next";
import Link from "next/link";
import { PostFeedbackDemo } from "./PostFeedbackDemo";

export const metadata: Metadata = {
  title: "投稿ボタンの応答フィードバック Before/After (/dev/question-post-feedback)",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-base">
      <div className="max-w-[960px] w-full mx-auto px-4 sm:px-6 py-12 min-w-0">
        <header className="mb-8 pb-4 border-b border-gray-200">
          <p className="text-sm font-bold text-text-primary/50 font-noto-sans-jp">
            <Link
              href="/dev/question-community"
              className="hover:text-text-primary underline"
            >
              掲示板 改善 Before/After
            </Link>{" "}
            / 投稿ボタンの応答
          </p>
          <h1 className="text-2xl font-bold text-text-primary font-rounded-mplus mt-1">
            「質問を投稿する」押下時の応答フィードバック
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            旧実装は押しても /questions/new のサーバー処理が終わるまで見た目が変わらず
            「動いてる？」と不安になっていた（#137-A）。
            新実装は ①押した瞬間ボタンにスピナー ②すぐスケルトン画面に切替、の2段階で応答する。
            下のボタンはどちらも同じ擬似待ち時間（約1.8秒）で動く。
          </p>
        </header>

        <PostFeedbackDemo />
      </div>
    </div>
  );
}
