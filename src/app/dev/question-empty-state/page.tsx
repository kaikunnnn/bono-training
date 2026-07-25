/**
 * /dev/question-empty-state — 一覧 Empty 状態 Before/After
 *
 * #137-B の改善記録。「まだ質問がありません」だけの表示（Before）と、
 * BONOのステート原則（空状態はアクションを促す）に沿った表示（After）の比較。
 * After は本体と同じコンポーネント構成なので実装が変われば追従する。
 */

import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PostQuestionButton } from "@/components/questions/PostQuestionButton";

export const metadata: Metadata = {
  title: "一覧 Empty 状態 Before/After (/dev/question-empty-state)",
  robots: { index: false, follow: false },
};

function SectionLabel({
  tone,
  title,
  note,
}: {
  tone: "before" | "after";
  title: string;
  note: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <span
        className={
          tone === "before"
            ? "text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-noto-sans-jp"
            : "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-noto-sans-jp"
        }
      >
        {title}
      </span>
      <span className="text-xs text-text-primary/50 font-noto-sans-jp">{note}</span>
    </div>
  );
}

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
            / Empty 状態
          </p>
          <h1 className="text-2xl font-bold text-text-primary font-rounded-mplus mt-1">
            一覧 Empty 状態をアクション促しに
          </h1>
          <p className="text-sm text-text-primary/60 mt-2 font-noto-sans-jp leading-relaxed">
            BONOのステート原則: 空状態は「情報がありません」で終わらせず、次のアクションを促す
            （`.claude/rules/03-ui-conventions.md` に追記済み）。
            After のボタンは本体と同じ `PostQuestionButton`（セカンダリー）で、
            メンバーは投稿フローへ、非メンバーは訴求モーダルが開く。
          </p>
        </header>

        <div className="space-y-10">
          <section className="space-y-3">
            <SectionLabel
              tone="before"
              title="Before（旧実装）"
              note="状態の説明だけで行き止まり"
            />
            <Card className="rounded-2xl border border-border/60 bg-white">
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                まだ質問がありません。
              </CardContent>
            </Card>
          </section>

          <section className="space-y-3">
            <SectionLabel
              tone="after"
              title="After（新実装）"
              note="アクションを促す + セカンダリーボタンで導線"
            />
            <Card className="rounded-2xl border border-border/60 bg-white">
              <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
                <div>
                  <p className="text-base font-medium">最初の質問を投稿してみよう</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    デザインの悩みや聞いてみたいことを、メンバーと共有できます。
                  </p>
                </div>
                {/* デモ用: 非メンバー扱いにして訴求モーダルの動きも確認できるようにする */}
                <PostQuestionButton
                  hasMemberAccess={false}
                  isLoggedIn={false}
                  variant="secondary"
                  label="最初の質問を投稿する"
                />
              </CardContent>
            </Card>
            <p className="text-xs text-text-primary/40 font-noto-sans-jp">
              ※ このデモは非メンバー扱いなので、押すとログイン訴求モーダルが開く（モーダルの整列・アニメも合わせて確認できる）
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
