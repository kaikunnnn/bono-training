/**
 * /dev/progress-feed — 進捗フィードのプロトタイプ 入口（#251 フェーズ2）
 *
 * 今のBONOのページ（マイページ・/top・記事ページ）を /dev 配下に複製し、進捗フィードを組み込んだ。
 * 本物の画面遷移（始める → 記事 → 完了 → マイページ → 通知）で触れる。
 * 保存・ログイン・Server Action・DB・Sanity は使わない。状態は sessionStorage だけ。
 * 仕様: rebono/issues/251_進捗フィードのプロトタイプ.md（フェーズ2）
 */

import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MILESTONE_ARTICLE_SLUG, PROTO_MYPAGE, PROTO_TOP, articleHref } from "./_proto/data";
import { ResetButton } from "./_proto/ResetButton";

export const metadata: Metadata = {
  title: "進捗フィードのプロトタイプ (/dev/progress-feed)",
  robots: { index: false, follow: false },
};

const PLANS = [
  {
    href: PROTO_MYPAGE,
    title: "マイページ中心の案",
    lead: "会員がいつも最初に着地するマイページに組み込んだ案です。",
    points: [
      "一番上に「今やっている人」の帯（1行）",
      "進行中カードの「次👉」の横に「今日はこれをやる」",
      "「みんなの進捗」3件と、タブに「みんな」（全件）を追加",
    ],
  },
  {
    href: PROTO_TOP,
    title: "トップ（/top）中心の案",
    lead: "/top を会員の家にした場合の案です（#232 の判断材料）。",
    points: [
      "ヒーロー直下（会員は入会ボタンが出ない位置）に「今やっている人」の帯",
      "「みんなの進捗」3件と「続きから」のカード1枚",
      "それより下は今の /top のまま",
    ],
  },
];

const STEPS = [
  "マイページ案（またはトップ案）を開き、「今やっている人」を見る",
  "進行中カードの「今日はこれをやる」を押す → 帯にあなたが加わり、記事ページへ進む",
  "記事ページで「学習中・ほか4人も学習中」を確認。少しすると「👋 がんばろ」が届く",
  "「完了にする」を押す（クエストの最後の記事なので節目）→ クエスト完了の演出の中で「みんなの進捗に流れました」",
  "「みんなの進捗を見る」でマイページへ。体験ガイドの「反応を届ける」で時間を進める",
  "右上の「プロト用の通知」のベルを開いて通知を押す → 「みんな」タブであなたの投稿が強調される",
];

export default function Page() {
  return (
    <div className="min-h-screen bg-[var(--bg-base)]">
      <div className="mx-auto w-full min-w-0 max-w-[880px] px-4 py-10 sm:px-6">
        <header className="mb-8 border-b border-[var(--card-border-subtle)] pb-5">
          <p className="text-sm font-bold text-text-muted">
            <Link href="/dev" className="underline hover:text-text-primary">
              Dev Portal
            </Link>{" "}
            / #251 進捗フィード
          </p>
          <h1 className="mt-1 font-heading text-2xl font-bold text-text-primary">
            進捗フィードのプロトタイプ（今のページに組み込んだ版）
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-secondary">
            学習を始めた・終えたことがほかの学習者に見えて、1タップで励まし合える仕組みを、今のBONOのマイページ・トップ・記事ページに組み込みました。
            あなたは「BONOを始めて2週目」の学習者という設定です。ページを移っても状態は続きます（このタブを閉じると消えます）。
          </p>
        </header>

        <section aria-labelledby="plans-heading" className="mb-10">
          <h2 id="plans-heading" className="font-heading text-lg font-bold text-text-primary">
            2つの案
          </h2>
          <p className="mt-1 text-sm text-text-secondary">同じ部品を、置き場所だけ変えて組み込んでいます。両方触って見比べてください。</p>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {PLANS.map((plan) => (
              <article
                key={plan.href}
                className="flex flex-col gap-3 rounded-[24px] border border-[var(--card-border-subtle)] bg-surface p-5 shadow-[var(--shadow-board-card)]"
              >
                <h3 className="font-heading text-base font-bold text-text-primary">{plan.title}</h3>
                <p className="text-sm text-text-secondary">{plan.lead}</p>
                <ul className="flex list-disc flex-col gap-1 pl-5 text-xs leading-relaxed text-text-secondary">
                  {plan.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Button asChild className="mt-auto w-fit">
                  <Link href={plan.href}>
                    開く
                    <ArrowRight />
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="steps-heading" className="mb-10">
          <h2 id="steps-heading" className="font-heading text-lg font-bold text-text-primary">
            触る順番
          </h2>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-sm leading-relaxed text-text-secondary">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-relaxed text-text-muted">
            右下の「体験ガイド」にも同じ順番が出ます。待ち時間（がんばろ・応援が届くまで）はガイドのボタンで飛ばせます。
            節目の記事に直接行くときは{" "}
            <Link href={articleHref(MILESTONE_ARTICLE_SLUG)} className="underline hover:text-text-primary">
              「フレームとレイヤーの基本」
            </Link>
            から。
          </p>
        </section>

        <section aria-labelledby="notes-heading" className="mb-10">
          <h2 id="notes-heading" className="font-heading text-lg font-bold text-text-primary">
            見るときの注意
          </h2>
          <ul className="mt-3 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-text-secondary">
            <li>
              左のサイドバーは本物です。サイドバーのベルは掲示板の本物の通知なので、プロトの通知はページ右上の「プロト用の通知」のベルに届きます。
            </li>
            <li>記事ページは本番と同じく、サイドバーなしの2カラムで表示します。</li>
            <li>記事1本だけの完了（トースト）では流れません。クエストを終えたときだけ流れます。</li>
            <li>トップ案の下のほう（新着・ガイド・レッスン・実績）は本番と同じCMSのデータを読みます。CMSにつながらない環境では読み込み中の表示のままです。</li>
          </ul>
        </section>

        <section aria-labelledby="more-heading" className="flex flex-col gap-4">
          <h2 id="more-heading" className="font-heading text-lg font-bold text-text-primary">
            そのほか
          </h2>
          <ResetButton />
          <p className="text-sm text-text-secondary">
            前回の1ページで完結する体験デモは{" "}
            <Link href="/dev/progress-feed/demo" className="underline hover:text-text-primary">
              /dev/progress-feed/demo
            </Link>{" "}
            に移しました。
          </p>
        </section>
      </div>
    </div>
  );
}
