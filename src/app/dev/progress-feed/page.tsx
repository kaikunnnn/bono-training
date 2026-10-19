/**
 * /dev/progress-feed — 進捗フィードのプロトタイプ（#251）
 *
 * 学習者の「始めた」「終えた」が流れ、スタンプで反応し合える場所を、作り方の違う3パターン（A/B/C）で比べる。
 * 今回は土台（S0）とパターンA（自動で流れる型・S1）のみ。
 * 保存・ログイン・Server Action・DB・Sanity は使わない。状態はブラウザ内だけで、リロードで初期状態に戻る。
 * 仕様: rebono/issues/251_進捗フィードのプロトタイプ.md
 */

import { Metadata } from "next";
import Link from "next/link";
import { ProgressFeedPrototype } from "./_components/ProgressFeedPrototype";

export const metadata: Metadata = {
  title: "進捗フィードのプロトタイプ (/dev/progress-feed)",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="mx-auto w-full min-w-0 max-w-[1200px] px-4 py-10 sm:px-6">
        <header className="mb-6 border-b border-[var(--card-border-subtle)] pb-4">
          <p className="text-sm font-bold text-text-muted">
            <Link href="/dev" className="underline hover:text-text-primary">
              Dev Portal
            </Link>{" "}
            / #251 進捗フィード
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-text-primary">進捗フィードのプロトタイプ</h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            学習を始めた・終えたことが流れて、ほかの学習者と1タップで励まし合える場所を、3つの作り方で比べるためのページです。
            あなたは「BONOを始めて2週目」の学習者という設定です。右の体験ガイドに沿って、始める → 投稿する → 他の人の投稿を見る → 反応が届く → 戻ってくる、の順に触ってみてください。
            保存はしないので、リロードすると最初の状態に戻ります。
          </p>
        </header>

        <ProgressFeedPrototype />
      </div>
    </div>
  );
}
