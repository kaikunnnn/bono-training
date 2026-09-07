/**
 * /dev/question-login-modal — 掲示板「質問を投稿する」ログイン訴求モーダル
 *
 * PostQuestionButton が出すメンバー限定モーダルを単体で表示する検討用ページ。
 * Figma でデザイン指定するための現状確認 + アニメーション確認に使う。
 */

import { Metadata } from "next";
import Link from "next/link";
import { QuestionLoginModalPlayground } from "./QuestionLoginModalPlayground";

export const metadata: Metadata = {
  title: "質問投稿ログイン訴求モーダル (/dev/question-login-modal)",
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
            / モーダル
          </p>
          <h1 className="text-2xl font-bold text-text-primary font-rounded-mplus mt-1">
            質問投稿：ログイン訴求モーダル
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            /questions の「質問を投稿する」押下時に非メンバーへ出すモーダル（
            <code>PostQuestionButton</code> と同一マークアップ）。
            開閉ボタンでフェードインのアニメーションも確認できる。
          </p>
        </header>

        <QuestionLoginModalPlayground />
      </div>
    </div>
  );
}
