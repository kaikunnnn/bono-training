"use client";

/**
 * E2: フィードバック主役・変化ストーリー（改善版）
 *
 * ユーザーFB反映:
 *  ① 見出しは2プランとも「同じ強さ」に統一（既存 TopSectionHeading = バッジ+見出し を流用）。
 *  ② 白カード（bg-surface/border）で囲まない。上の価格カードより下の階層に見せるため、
 *     背景直置き＋見出しデザイン＋余白/線でブロックを表現（/plan・トップ各ブロックと同様）。
 *  ③ スタンダードは情報を厚く（/plan フル6項目）。薄さで不安にさせない。
 *  ④ CTAは「見出しブロックの直下」に統一（両プラン同じ位置）。
 *
 * ⚠️ 変化ストーリーの「悩み」側コピーは data.ts の CHANGE_PAIRS に仮コピー（ユーザー確認前提）。
 * CTA は Stripe を呼ばず console.log のダミー。
 */

import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import TopSectionHeading from "@/components/top2/TopSectionHeading";
import { STANDARD, FEEDBACK, CHANGE_PAIRS } from "./data";

/** 変化ストーリー等で使うサブ見出し（AchievementHighlightSection と同じ 20px 表現）。 */
const SUBHEADING =
  "font-rounded-mplus text-[20px] font-medium leading-[1.4] tracking-[1.6px] text-text-primary";

export function PatternE2() {
  const handleCta = (plan: string) => {
    console.log("[pricing-detail] CTA", { pattern: "E2", plan });
  };

  return (
    <div className="flex flex-col gap-16">
      {/* --- フィードバック（変化ストーリー・主役は"内容"で出す。見出しは同強度） --- */}
      <section id="detail-feedback">
        {/* ① 見出し（TopSectionHeading・スタンダードと同じ強さ） */}
        <TopSectionHeading badgeLabel={FEEDBACK.name} heading={FEEDBACK.sub} />

        {/* ④ CTA = 見出し直下（両プラン同じ位置） */}
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <Button
            type="button"
            variant="default"
            className="sm:min-w-[220px]"
            onClick={() => handleCta("feedback")}
          >
            {FEEDBACK.ctaLabel}
          </Button>
          {/* 「内容を見る」= 応募ページ想定（href="#" ダミー）。rule 03: Button asChild */}
          <Button asChild variant="secondary" className="sm:min-w-[160px]">
            <a href="#">{FEEDBACK.secondaryCtaLabel}</a>
          </Button>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {FEEDBACK.description}
        </p>

        {/* 変化ストーリー（悩み → 解決の対比）。② カードで囲まず線で表現 */}
        <div className="mt-8">
          <h3 className={SUBHEADING}>フィードバックで何が変化する？</h3>
          <dl className="mt-4 divide-y divide-border border-y border-border">
            {CHANGE_PAIRS.map((pair) => (
              <div
                key={pair.solved}
                className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4"
              >
                {/* 悩み側（⚠️ 仮コピー） */}
                <dt className="text-sm text-muted-foreground sm:flex-1">
                  {pair.pain}
                </dt>
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="hidden shrink-0 text-primary sm:block"
                />
                <dd className="text-sm font-bold text-foreground sm:flex-1">
                  {pair.solved}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* --- スタンダード（③ 情報を厚く・6項目。見出し/CTA位置はフィードバックと同一） --- */}
      <section id="detail-standard">
        {/* ① 見出し（同じ強さ） */}
        <TopSectionHeading badgeLabel={STANDARD.name} heading={STANDARD.sub} />

        {/* ④ CTA = 見出し直下（フィードバックと同じ位置） */}
        <div className="mt-5">
          <Button
            type="button"
            variant="outline"
            className="w-full sm:w-auto sm:min-w-[220px]"
            onClick={() => handleCta("standard")}
          >
            {STANDARD.ctaLabel}
          </Button>
        </div>

        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          {STANDARD.description}
        </p>

        {/* ③ /plan フル6項目（薄くしない）。2カラムの箇条書き */}
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {STANDARD.fullPoints.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2 text-sm text-foreground"
            >
              <Check
                size={16}
                aria-hidden="true"
                className="mt-0.5 shrink-0 text-primary"
              />
              {point}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
