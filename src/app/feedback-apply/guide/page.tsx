/**
 * フィードバックのやり方（ガイド / LP）
 * - フィードバック機能の使い方を記事風に解説する説明ページ
 * - 有料プラン未加入者向けのCTAをページ上部・下部に配置
 *
 * 兄弟ページ /feedback-apply（応募フォーム）へ誘導する
 */

import type { Metadata } from "next";
import Link from "next/link";
import { getSubscriptionStatus } from "@/lib/subscription";
import { Button } from "@/components/ui/button";

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

// CTAブロック
// - canApply が false: 有料プラン訴求（/subscription へ）
// - canApply が true: すでに利用可能 → 応募フォーム（/feedback-apply へ）
function CtaBlock({ canApply }: { canApply: boolean }) {
  if (canApply) {
    return (
      <div className="rounded-2xl border border-gray-200 bg-slate-50 px-6 py-8 text-center">
        <h2 className="font-rounded-mplus text-xl font-bold text-slate-900">
          フィードバックを使ってみよう
        </h2>
        <p className="mt-3 text-slate-600 leading-relaxed">
          あなたのプランではフィードバックを利用できます。相談したいことを整理して、応募フォームから申し込みましょう。
        </p>
        <div className="mt-6">
          <Button asChild size="lg">
            <Link href="/feedback-apply">フィードバックを使ってみる</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-gray-200 bg-slate-50 px-6 py-8 text-center">
      <h2 className="font-rounded-mplus text-xl font-bold text-slate-900">
        グロースプランでフィードバックが受けられます
      </h2>
      <p className="mt-3 text-slate-600 leading-relaxed">
        フィードバックはグロースプラン（フィードバックプラン）の方限定の機能です。プロの視点で自分のデザインを相談したい方は、プランをチェックしてみてください。
      </p>
      <div className="mt-6">
        <Button asChild size="lg">
          <Link href="/subscription">グロースプランでフィードバックを使う</Link>
        </Button>
      </div>
    </div>
  );
}

// 前提アイテム
function PremiseItem({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <h3 className="font-rounded-mplus text-lg font-bold text-slate-900">
        {title}
      </h3>
      <div className="space-y-2 text-lg leading-relaxed text-slate-700">
        {children}
      </div>
    </div>
  );
}

// フォーム選択肢アイテム（○○ or ××）
function ChoiceItem({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <p className="font-bold text-slate-900 text-lg">{label}</p>
      <p className="text-lg leading-relaxed text-slate-700">{children}</p>
    </div>
  );
}

export default async function FeedbackGuidePage() {
  const subscription = await getSubscriptionStatus();

  // Standard / feedbackプランかどうか
  const canApply =
    subscription.planType === "standard" ||
    subscription.planType === "feedback";

  return (
    <div className="min-h-screen">
      <main className="max-w-[960px] mx-auto px-4 sm:px-6 py-8">
        {/* ヘッダー */}
        <header className="space-y-4">
          <h1 className="font-rounded-mplus text-[30px] font-bold text-slate-900 leading-tight">
            フィードバックのやり方
          </h1>
          <p className="text-lg leading-relaxed text-slate-600">
            BONOのフィードバックは「デザイナー上司への相談」として使える仕組みです。使い方・前提・フォームの選び方をまとめました。
          </p>
        </header>

        {/* トップCTA */}
        <div className="mt-8">
          <CtaBlock canApply={canApply} />
        </div>

        {/* 本文 */}
        <article className="mt-14 space-y-14">
          {/* フィードバック応募フォーム */}
          <section className="space-y-4">
            <h2 className="font-rounded-mplus text-2xl font-bold text-slate-900">
              フィードバック応募フォーム
            </h2>
            <p className="text-lg leading-relaxed text-slate-700">
              フィードバックをお願いしたい場合は、
              <Link
                href="/feedback-apply"
                className="text-slate-900 font-bold underline underline-offset-4 hover:no-underline"
              >
                こちらの応募フォーム
              </Link>
              から申し込めます。
            </p>
          </section>

          {/* 成長するフィードバックの使い方（動画） */}
          <section className="space-y-4">
            <h2 className="font-rounded-mplus text-2xl font-bold text-slate-900">
              成長するフィードバックの使い方
            </h2>
            <p className="text-lg leading-relaxed text-slate-700">
              フィードバックの使い方を解説した動画です。
            </p>
            <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-gray-200 bg-black">
              <iframe
                src="https://player.vimeo.com/video/1120844381"
                className="absolute inset-0 h-full w-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="成長するフィードバックの使い方"
              />
            </div>
          </section>

          {/* 前提 */}
          <section className="space-y-6">
            <h2 className="font-rounded-mplus text-2xl font-bold text-slate-900">
              前提
            </h2>

            <PremiseItem title="グロースプランの方限定でフィードバックします">
              <p>
                フィードバックはグロースプラン（フィードバックプラン）の方限定で行っています。月2回までご利用いただけます（2025年6月改定）。
              </p>
            </PremiseItem>

            <PremiseItem title="綺麗なアウトプットが無くても相談できます">
              <p>
                フィードバックは「デザイナー上司への相談」として使ってください。自分なりに完成したデザインがなくても大丈夫です。
              </p>
              <p>
                例えば「デザインの途中だけど行き詰まったので、プロの視点で方向性を示唆してほしい」「プロトタイプの段階までやってみたが、方向性に自信がない」といった相談も歓迎です。
              </p>
            </PremiseItem>

            <PremiseItem title="フィードバックには目的を含めましょう">
              <p>
                「何を見てほしいか／相談したい内容」が明確でないフィードバック依頼は、まず考えてみるよう案内されることがあります。何も考えずに依頼すると「いろいろできていない」と言われて凹んだり、言われたことをただやるだけになってしまい、成長につながりにくくなります。
              </p>
              <p>
                まず自分の頭で「何が悪そうか」「どこを改善できそうか」「やっているけどよくわかっていない部分はどこか」を考えた上で、他者の目線を借りるのが効果的です。うまく言語化できなくても「なんとなくここが変な気がする」という状態で構いません。とにかく自分のデザインについて考えてみて、聞きたい部分を伝えることが重要です。
              </p>
            </PremiseItem>
          </section>

          {/* フォームの内容について */}
          <section className="space-y-8">
            <h2 className="font-rounded-mplus text-2xl font-bold text-slate-900">
              フォームの内容について
            </h2>

            {/* 全体 or フォーカス */}
            <div className="space-y-3">
              <h3 className="font-rounded-mplus text-lg font-bold text-slate-900">
                全体 or フォーカス
              </h3>
              <div className="space-y-4">
                <ChoiceItem label="全体">
                  今のアウトプットが正しい方向かをざっくり見てほしい人向け。プロトタイプ全体を見て、直したほうが良いポイントにコメントをつけます。全体を見る分、詳しい解説の時間は取れません。
                </ChoiceItem>
                <ChoiceItem label="フォーカス">
                  特定の箇所についてきちんとフィードバックを受けて理解を深めたい人向け。アウトプットの中から最大2箇所を指定して、その部分について詳しく相談・フィードバックを受けられます。問題点や改善に必要なことをできるだけ詳しく解説し、次につながるToDoを作ることを目標に添削します。
                </ChoiceItem>
              </div>
            </div>

            {/* 通常 or オンライン */}
            <div className="space-y-3">
              <h3 className="font-rounded-mplus text-lg font-bold text-slate-900">
                通常 or オンライン
              </h3>
              <div className="space-y-4">
                <ChoiceItem label="通常">
                  基本的にテキストベースのフィードバックです。時間が限られるため「改善したほうが良い箇所」を中心に指摘します。一方通行なので、テキストを理解して自分で改善する必要がありますが、その分広い範囲を見てもらえる可能性が高くなります。
                </ChoiceItem>
                <ChoiceItem label="オンライン通話">
                  50分の通話でフィードバックや相談、質問ができる双方向のスタイルです。広いトピックを扱うのは苦手ですが、質問しながら「何が伸びしろか」「改善すべきポイントは何か」を相談できます。定期的に利用して相談や質問の場として使うのもおすすめです。
                </ChoiceItem>
              </div>
            </div>

            {/* 公開 or 非公開 */}
            <div className="space-y-3">
              <h3 className="font-rounded-mplus text-lg font-bold text-slate-900">
                公開 or 非公開
              </h3>
              <div className="space-y-4">
                <ChoiceItem label="公開">
                  BONO限定のコンテンツとして、解説コンテンツになる可能性があります。
                </ChoiceItem>
                <ChoiceItem label="非公開">
                  動画などとして公開されることはなく、コメントいただければコミュニティに公開せずDMなどで添削内容を共有します。
                </ChoiceItem>
              </div>
            </div>
          </section>
        </article>

        {/* ボトムCTA */}
        <div className="mt-16">
          <CtaBlock canApply={canApply} />
        </div>
      </main>
    </div>
  );
}
