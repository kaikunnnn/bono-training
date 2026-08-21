"use client";

/**
 * プラン説明セクション（フィードバック主役・変化ストーリー）。
 *
 * 設計方針:
 *  ① 見出しは2プランとも「同じ強さ」に統一（既存 TopSectionHeading = バッジ+見出し を流用）。
 *  ② 白カード（bg-surface/border）で囲まない。上の価格カードより下の階層に見せるため、
 *     背景直置き＋見出しデザイン＋余白/線でブロックを表現（/plan・トップ各ブロックと同様）。
 *  ③ スタンダードは情報を厚く（/plan フル6項目）。薄さで不安にさせない。
 *  ④ CTAは「見出しブロックの直下」に統一（両プラン同じ位置）。
 *
 * section id（detail-standard / detail-feedback）は価格カードの「詳細を見る」アンカー先。
 *
 * 変化ストーリーの「悩み」→「解決」コピーは @/lib/pricing/content の CHANGE_PAIRS。
 * 悩み側コピーは 2026-08-18 にユーザー確認済み（確定）。
 *
 * CTA（S1b）: 価格カード（PlanCards）と同じ共通 PlanCtaButton に配線し、同一の課金フローに
 * 統一（未ログイン=signup / 未課金=Checkout / 現行=disabled / 他=変更モーダル）。購読状態は
 * PricingFinal から props で受け取る（PlanCards と同じ6項目・任意）。CTA が起動する期間は
 * 上部の期間トグルと連動させるため duration も受け取る（未指定なら 3ヶ月）。
 *
 * 移植元: src/app/dev/pricing-detail/PatternE2.tsx
 */

import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STANDARD, FEEDBACK, CHANGE_PAIRS } from "@/lib/pricing/content";
import { PlanCtaButton } from "@/components/pricing/PlanCtaButton";
import type { PlanType, PlanDuration } from "@/types/subscription";

interface PlanDetailProps {
  /** CTA が起動する期間（上部トグルと連動。未指定なら 3ヶ月主軸）。 */
  duration?: PlanDuration;
  // ---- 購読状態（PlanCards と同じ6項目・任意）。未指定なら PlanCtaButton はダミー表示。 ----
  isLoggedIn?: boolean;
  isSubscribed?: boolean;
  currentPlanType?: PlanType | null;
  currentDuration?: PlanDuration | null;
  currentPeriodEnd?: string | null;
  cancelAtPeriodEnd?: boolean;
}

export function PlanDetail({
  duration = 3,
  isLoggedIn,
  isSubscribed,
  currentPlanType,
  currentDuration,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: PlanDetailProps = {}) {
  // 各 PlanCtaButton に共通で渡す購読状態。
  const subscriptionProps = {
    isLoggedIn,
    isSubscribed,
    currentPlanType,
    currentDuration,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  };

  return (
    <div className="flex flex-col gap-16">
      {/*
        --- フィードバック（プラン説明ブロック・Figma 43:4460 実測どおり） ---
        全幅ブロック（カードで囲まない）・左揃え。上端に border-t + pt-14(56px)。
        見出しは font-heading（M PLUS 1）。Figma は SF Pro Medium だが、アプリ規約どおり
        見出しフォントは font-heading を使う（近似・意図的なDS優先）。
      */}
      <section id="detail-feedback" className="border-t border-border pt-14">
        {/* eyebrow（背景なしラベル） */}
        <p className="text-xs tracking-[1.6px] text-foreground">
          {FEEDBACK.name}
        </p>

        {/* 見出し（badge→見出し 12px。太さは SemiBold=600 に統一） */}
        <h2 className="mt-3 font-heading text-[28px] font-semibold text-foreground">
          {FEEDBACK.detailHeading}
        </h2>

        {/* 説明（見出し→説明 9px） */}
        <p className="mt-[9px] max-w-2xl text-sm leading-relaxed text-foreground">
          {FEEDBACK.description}
        </p>

        {/* ボタン行（説明→ボタン 20px・gap-3・小サイズ） */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          {/* 「フィードバックで始める」= checkout配線を維持（compact=小サイズ濃色） */}
          <PlanCtaButton
            planType="feedback"
            duration={duration}
            variant="default"
            compact
            {...subscriptionProps}
          />
          {/* 「内容を見る」= フィードバックの使い方ページ /how-to/feedback へ。rule 03: Button asChild */}
          <Button
            asChild
            variant="outline"
            className="h-8 rounded-xl border-border px-5 text-[13px]"
          >
            <a href="/how-to/feedback">{FEEDBACK.secondaryCtaLabel}</a>
          </Button>
        </div>

        {/* 変化リスト見出し（ボタン→32px） */}
        <h3 className="mt-8 font-heading text-base font-bold text-foreground">
          フィードバックで何が変化する？
        </h3>

        {/* 変化リスト（Definition List）。上下 border-y + 行間 border-b（最終行なし） */}
        <dl className="mt-4 divide-y divide-border border-y border-border">
          {CHANGE_PAIRS.map((pair) => (
            <div
              key={pair.solved}
              className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:gap-4"
            >
              {/* 悩み（term・通常） */}
              <dt className="text-sm text-foreground">{pair.pain}</dt>
              {/* 中央の矢印（desktop のみ。dt→[矢印]→dd の横並び） */}
              <ArrowRight
                size={18}
                aria-hidden="true"
                className="hidden shrink-0 text-muted-foreground sm:block"
              />
              {/* 解決（description・太字・伸長）。
                  モバイルは縦積みなので解決文の行頭にインライン矢印を出す（sm では非表示・
                  中央矢印と二重にしない）。 */}
              <dd className="flex items-start gap-1.5 text-sm font-bold text-foreground sm:flex-1">
                <ArrowRight
                  size={18}
                  aria-hidden="true"
                  className="mt-0.5 shrink-0 text-muted-foreground sm:hidden"
                />
                <span>{pair.solved}</span>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/*
        --- スタンダード（③ プラン説明ブロック・Figma 43:4509 実測どおり） ---
        フィードバック（②）と同じ体裁。全幅ブロック・左揃え。上端に border-t + pt-14(56px)。
        見出しは font-heading（M PLUS 1）。Figma は SF Pro だが、アプリ規約どおり
        見出しフォントは font-heading を使う（近似・意図的なDS優先）。
      */}
      <section id="detail-standard" className="border-t border-border pt-14">
        {/* eyebrow（背景なしラベル） */}
        <p className="text-xs tracking-[1.6px] text-foreground">
          {STANDARD.name}
        </p>

        {/* 見出し（eyebrow→見出し 12px。太さは SemiBold=600 に統一） */}
        <h2 className="mt-3 font-heading text-[28px] font-semibold text-foreground">
          {STANDARD.detailHeading}
        </h2>

        {/* 説明（見出し→説明 24px） */}
        <p className="mt-6 max-w-[672px] text-sm leading-relaxed text-foreground">
          {STANDARD.description}
        </p>

        {/* CTA（説明→CTA 20px・小サイズ・outline系・単一ボタン）。checkout配線を維持。 */}
        <div className="mt-5 flex flex-col items-start">
          <PlanCtaButton
            planType="standard"
            duration={duration}
            variant="outline"
            className="h-8 rounded-xl border-border-strong px-5 text-[13px]"
            {...subscriptionProps}
          />
        </div>

        {/* /plan フル6項目（CTA→24px）。2カラム チェックリスト（モバイル1カラム） */}
        <ul className="mt-6 grid grid-cols-1 gap-x-4 gap-y-3 md:grid-cols-2">
          {STANDARD.fullPoints.map((point) => (
            <li
              key={point}
              className="flex items-start gap-2 border-b border-border pb-3 text-base text-foreground"
            >
              <Check
                size={16}
                aria-hidden="true"
                className="mt-1 shrink-0 text-foreground"
              />
              {point}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
