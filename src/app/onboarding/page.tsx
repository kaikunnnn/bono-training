/**
 * /onboarding — オンボーディング入口（暫定プレースホルダの「箱」）
 *
 * 課金完了（新規加入）画面の「使い方をセットアップする」CTA の遷移先。
 * 本オンボーディングレッスンは制作中。ここは箱だけ用意し、
 * レッスン公開後に本コンテンツ（または先頭記事へのリダイレクト）へ差し替える。
 */

import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "はじめかたガイド（オンボーディング） | BONO",
  robots: { index: false, follow: false },
};

const STEPS = [
  { step: "STEP 1-2", title: "コミュニティ（Slack）に参加する" },
  { step: "STEP 3-4", title: "トレーニング計画を立てる" },
  { step: "STEP 5-6", title: "質問・相談を1回やってみる" },
];

export default function OnboardingPage() {
  return (
    <div className="bg-base min-h-screen">
      <div className="max-w-[600px] w-full mx-auto px-6 py-12">
        <div className="flex flex-col items-start gap-3 mb-8">
          <span className="flex items-center justify-center h-12 w-12 rounded-full bg-[rgba(13,34,29,0.06)]">
            <Sparkles className="h-6 w-6 text-text-primary" />
          </span>
          <h1 className="font-rounded-mplus font-extrabold text-[28px] leading-tight text-text-primary">
            はじめかたガイド
          </h1>
          <p className="text-sm text-text-primary/70 font-noto-sans-jp leading-relaxed">
            7ステップでBONOをつかい倒す準備を進めましょう。
            このガイドは現在準備中です。まずはやることの流れを確認してください。
          </p>
        </div>

        <ul className="flex flex-col gap-3 mb-10">
          {STEPS.map((s) => (
            <li
              key={s.step}
              className="flex items-center gap-3 bg-white border border-gray-200/60 rounded-[16px] px-4 py-3"
            >
              <span className="flex-shrink-0 text-[11px] font-bold text-text-primary bg-[rgba(13,34,29,0.06)] rounded-md px-2 py-1 font-noto-sans-jp">
                {s.step}
              </span>
              <p className="text-sm font-bold text-text-primary font-noto-sans-jp">
                {s.title}
              </p>
            </li>
          ))}
        </ul>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild variant="primary" size="large">
            <Link href="/lessons">レッスン一覧を見る</Link>
          </Button>
          <Button asChild variant="outline-ghost" size="large">
            <Link href="/mypage">マイページへ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
