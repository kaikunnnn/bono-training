/**
 * フィードバックのやり方（ガイド / LP）
 * - フィードバック機能の使い方を記事風に解説する説明ページ
 * - ヘッダーのレイアウトは /feedback-apply と似た形（タイトル+ボタン、下にメインビジュアル）
 *   だが、応募先はGoogleフォーム（この機能専用。15分フィードバックの
 *   /feedback-apply/submit とは別物のため、そちらのコンポーネントは使わない）。
 */

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getSubscriptionStatus } from "@/lib/subscription";
import TopSectionHeading from "@/components/top2/TopSectionHeading";

const FEEDBACK_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSe4lS_upTGN99sktg7CPFQtx3A3dgLYpvnuzspWH9lc2T2JDA/viewform?usp=header";

// このフィードバック機能はグロースプラン（planType === "feedback"）限定。
// standardプラン・非メンバー・非ログインは全て対象外
function ApplyButton({
  canApply,
  className,
}: {
  canApply: boolean;
  className?: string;
}) {
  if (canApply) {
    return (
      <Button
        asChild
        size="large"
        className={`bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-extrabold ${className ?? ""}`}
      >
        <Link href={FEEDBACK_FORM_URL} target="_blank" rel="noopener noreferrer">
          応募する →
        </Link>
      </Button>
    );
  }

  return (
    <Button
      asChild
      size="large"
      className={`bg-slate-900 hover:bg-slate-800 text-white shadow-sm font-extrabold ${className ?? ""}`}
    >
      <Link href="/subscription">グロースプランで応募 →</Link>
    </Button>
  );
}

// 見出し(40%) + 内容(60%) の並列ブロック（/feedback-apply の SectionLayout と同じ構造。
// アイコンは無し）。「前提」「フォームの内容について」という大見出し(h2)の中の
// 1トピック=1ブロックとして使うため、見出しは h3。
function SectionBlock({
  title,
  bordered = true,
  children,
}: {
  title: string;
  bordered?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className={bordered ? "border-b border-black/[0.12] py-10" : "py-10"}>
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-[40%] md:shrink-0">
          <h3 className="font-rounded-mplus text-lg font-bold text-text-primary">
            {title}
          </h3>
        </div>
        <div className="md:w-[60%] py-1">{children}</div>
      </div>
    </div>
  );
}

export const metadata: Metadata = {
  title: "フィードバックのやり方",
  description:
    "BONOのフィードバックの使い方・前提・フォームの選び方を解説します",
  openGraph: {
    title: "フィードバックのやり方 | BONO",
    description:
      "BONOのフィードバックの使い方・前提・フォームの選び方を解説します",
  },
  twitter: {
    title: "フィードバックのやり方 | BONO",
    description:
      "BONOのフィードバックの使い方・前提・フォームの選び方を解説します",
  },
  alternates: { canonical: "/feedback-apply/guide" },
};

// フォーム選択肢アイテム（○○ or ××、箇条書き1項目）
function ChoiceItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <span className="font-bold text-text-primary">{label}：</span>
      <span className="text-text-secondary">{children}</span>
    </li>
  );
}

export default async function FeedbackGuidePage() {
  const subscription = await getSubscriptionStatus();
  // このフィードバックはグロースプラン（planType === "feedback"）限定。
  // standardプラン・非メンバー・非ログインは応募不可
  const canApply = subscription.planType === "feedback";

  return (
    <div className="min-h-screen">
      <main className="max-w-[960px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダーセクション（/feedback-apply と同じレイアウト） */}
        <section className="border-b border-gray-200 pb-8 mb-4">
          <div className="flex flex-col md:flex-row md:items-end gap-8">
            {/* 左側: タイトル + ボタン（40%幅） */}
            <div className="md:w-[40%] md:shrink-0 flex flex-col gap-3">
              <div className="space-y-4">
                <h1 className="font-rounded-mplus text-[30px] font-bold text-text-primary leading-tight">
                  フィードバックのやり方
                </h1>
                <ApplyButton canApply={canApply} className="w-fit" />
              </div>
            </div>

            {/* 右側: 説明文（60%幅） */}
            <div className="md:w-[60%] text-text-muted leading-relaxed py-4">
              <p>BONOのフィードバックは「デザイナー上司への相談」として使える仕組みです。</p>
              <p>使い方・前提・フォームの選び方をまとめました。</p>
            </div>
          </div>
        </section>

        {/* メインビジュアル: 静止画の代わりに使い方解説動画を使用 */}
        <section className="mb-4">
          <div
            className="relative w-full overflow-hidden rounded-[48px] border aspect-[1926/1076]"
            style={{ borderColor: "var(--blog-color-hero-bg)" }}
          >
            <iframe
              src="https://player.vimeo.com/video/1120844381"
              className="absolute inset-0 h-full w-full"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="成長するフィードバックの使い方"
            />
          </div>
        </section>

        {/* 本文: 「前提」「フォームの内容について」を大見出し(h2)にして、
            その中の各トピックを1トピック=1並列ブロック(h3)の単位で並べる */}
        <article>
          {/* 前提 */}
          <section className="border-b border-black/[0.12] py-16">
            <TopSectionHeading badgeLabel="前提条件" heading="前提" className="mb-8" />

            <div>
              <SectionBlock title="グロースプランの方限定でフィードバックします">
                <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                  <p>
                    フィードバックはグロースプラン（フィードバックプラン）の方限定で行っています。月2回までご利用いただけます（2025年6月改定）。
                  </p>
                </div>
              </SectionBlock>

              <SectionBlock title="綺麗なアウトプットが無くても相談できます">
                <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                  <p>
                    フィードバックは「デザイナー上司への相談」として使ってください。自分なりに完成したデザインがなくても大丈夫です。
                  </p>
                  <p>
                    例えば「デザインの途中だけど行き詰まったので、プロの視点で方向性を示唆してほしい」「プロトタイプの段階までやってみたが、方向性に自信がない」といった相談も歓迎です。
                  </p>
                </div>
              </SectionBlock>

              <SectionBlock title="フィードバックには目的を含めましょう" bordered={false}>
                <div className="space-y-3 text-lg leading-relaxed text-text-secondary">
                  <p>
                    「何を見てほしいか／相談したい内容」が明確でないフィードバック依頼は、まず考えてみるよう案内されることがあります。何も考えずに依頼すると「いろいろできていない」と言われて凹んだり、言われたことをただやるだけになってしまい、成長につながりにくくなります。
                  </p>
                  <p>
                    まず自分の頭で「何が悪そうか」「どこを改善できそうか」「やっているけどよくわかっていない部分はどこか」を考えた上で、他者の目線を借りるのが効果的です。うまく言語化できなくても「なんとなくここが変な気がする」という状態で構いません。とにかく自分のデザインについて考えてみて、聞きたい部分を伝えることが重要です。
                  </p>
                </div>
              </SectionBlock>
            </div>
          </section>

          {/* フォームの内容について */}
          <section className="py-16">
            <TopSectionHeading
              badgeLabel="フォームの選び方"
              heading="フォームの内容について"
              className="mb-8"
            />

            <div>
              <SectionBlock title="全体 or フォーカス">
                <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
                  <ChoiceItem label="全体">
                    今のアウトプットが正しい方向かをざっくり見てほしい人向け。プロトタイプ全体を見て、直したほうが良いポイントにコメントをつけます。全体を見る分、詳しい解説の時間は取れません。
                  </ChoiceItem>
                  <ChoiceItem label="フォーカス">
                    特定の箇所についてきちんとフィードバックを受けて理解を深めたい人向け。アウトプットの中から最大2箇所を指定して、その部分について詳しく相談・フィードバックを受けられます。問題点や改善に必要なことをできるだけ詳しく解説し、次につながるToDoを作ることを目標に添削します。
                  </ChoiceItem>
                </ul>
              </SectionBlock>

              <SectionBlock title="通常 or オンライン">
                <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
                  <ChoiceItem label="通常">
                    基本的にテキストベースのフィードバックです。時間が限られるため「改善したほうが良い箇所」を中心に指摘します。一方通行なので、テキストを理解して自分で改善する必要がありますが、その分広い範囲を見てもらえる可能性が高くなります。
                  </ChoiceItem>
                  <ChoiceItem label="オンライン通話">
                    50分の通話でフィードバックや相談、質問ができる双方向のスタイルです。広いトピックを扱うのは苦手ですが、質問しながら「何が伸びしろか」「改善すべきポイントは何か」を相談できます。定期的に利用して相談や質問の場として使うのもおすすめです。
                  </ChoiceItem>
                </ul>
              </SectionBlock>

              <SectionBlock title="公開 or 非公開" bordered={false}>
                <ul className="list-disc space-y-2 pl-5 text-lg leading-relaxed">
                  <ChoiceItem label="公開">
                    BONO限定のコンテンツとして、解説コンテンツになる可能性があります。
                  </ChoiceItem>
                  <ChoiceItem label="非公開">
                    動画などとして公開されることはなく、コメントいただければコミュニティに公開せずDMなどで添削内容を共有します。
                  </ChoiceItem>
                </ul>
              </SectionBlock>
            </div>
          </section>
        </article>

        {/* ボトムCTA */}
        <div className="mt-16 rounded-2xl border border-gray-200 bg-muted-custom px-6 py-10 text-center">
          <h2 className="font-rounded-mplus text-xl font-bold text-text-primary">
            フィードバックを使ってみよう
          </h2>
          <p className="mt-3 text-text-muted leading-relaxed">
            相談したいことを整理して、応募してみましょう。
          </p>
          <div className="mt-6 flex justify-center">
            <ApplyButton canApply={canApply} />
          </div>
        </div>
      </main>
    </div>
  );
}
