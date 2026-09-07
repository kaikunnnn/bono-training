"use client";

/**
 * 価格カードセクション（production 集約版） — www.bo-no.design/plan 準拠。
 *
 * 期間トグル + プランカード×2（standard / feedback）を描画する。
 * カード内の順序・文言は現行 /plan のコンテンツ（説得コピー含む）に合わせている。
 * ヘッダー（料金プラン/主見出し/支払いリンク）は PricingHero に統合済みのため本体には持たない。
 * ただし下部再掲用に heading prop（簡易 h2）だけは残す（指定時のみ描画）。
 *
 * 価格の数値/price_id はこのファイルに書かない。@/lib/pricing/price の価格ロジック
 * （getPlanPriceView = AVAILABLE_PLANS 由来の唯一の真実）を使う。文言は @/lib/pricing/content。
 * 期間トグルは @/components/pricing/PeriodToggle。
 * CTA は状態認識モードでは実課金フロー、未指定時は console.log のダミー（再開リンクは廃止）。
 *
 * レイアウト: 全体を左揃え（中央寄せクラスを使わない）。
 * 見出し階層: ページ h1（PricingHero）→ h3（プラン名）→ h4（解放機能）。
 *   ※下部再掲で heading 指定時のみ h2 を挟む。上部（heading 無し）は h1→h3 となる
 *     （メンバーシップ見出し撤去に伴う設計。ファーストビュー圧縮を優先）。
 *
 * 移植元: src/app/dev/pricing/PlanCards.tsx
 */

import type { PlanType, PlanDuration } from "@/types/subscription";
import {
  FEATURE_ROWS,
  PLAN_CONTENT,
  featureValue,
  isFeatureAbsent,
} from "@/lib/pricing/content";
import { DIFF_PLAN_TYPES, getPlanPriceView } from "@/lib/pricing/price";
import { FeatureRow } from "@/components/pricing/FeatureRow";
import { PeriodToggle } from "@/components/pricing/PeriodToggle";
import { PriceBlock } from "@/components/pricing/PriceBlock";
import { PlanCtaButton } from "@/components/pricing/PlanCtaButton";

interface PlanCardsProps {
  duration: PlanDuration;
  onDurationChange: (duration: PlanDuration) => void;
  /** 下部再掲用の簡易見出し(h2)。指定時のみ描画（未指定=見出し無し）。 */
  heading?: string;
  /** 期間トグルの表示可否（既定 true）。 */
  showToggle?: boolean;
  /** 指定時、各カードの機能一覧末尾に「詳細を見る」リンク（該当アンカーへ）を表示。 */
  detailAnchors?: { standard: string; feedback: string };
  // ---- 状態認識（S1）: いずれか渡された場合のみ実CTA配線に切り替わる。 ----
  // 全て未指定なら現行のダミー表示（console.log / href="#"）を維持（後方互換）。
  /** ログイン済みか（undefined=ダミーモード / boolean=状態認識モード） */
  isLoggedIn?: boolean;
  /** 課金中か */
  isSubscribed?: boolean;
  /** 既存サブスクのプランタイプ（現在のプラン判定・変更モーダル用） */
  currentPlanType?: PlanType | null;
  /** 既存サブスクの期間（現在のプラン判定・変更モーダル用） */
  currentDuration?: PlanDuration | null;
  /** 既存サブスクの期間終了日（変更モーダルのプロレーション表示用） */
  currentPeriodEnd?: string | null;
  /** キャンセル予約中か（現行プランに「プランを管理」導線を出す） */
  cancelAtPeriodEnd?: boolean;
}

export function PlanCards({
  duration,
  onDurationChange,
  heading,
  showToggle = true,
  detailAnchors,
  isLoggedIn,
  isSubscribed = false,
  currentPlanType = null,
  currentDuration = null,
  currentPeriodEnd = null,
  cancelAtPeriodEnd = false,
}: PlanCardsProps) {
  // 上に何か（見出し or トグル）がある時だけカードグリッドに上余白を付ける。
  const cardsHaveHeader = Boolean(heading) || showToggle;

  // 「詳細を見る」= ページ内アンカーへスムーズスクロール（どこに来たか分かるように）。
  // prefers-reduced-motion 時は即時。対象が無ければ既定のアンカー挙動に委ねる。
  const handleDetailClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string,
  ) => {
    const target = document.getElementById(href.replace("#", ""));
    if (!target) return;
    e.preventDefault();
    const reduce = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    target.scrollIntoView({
      behavior: reduce ? "auto" : "smooth",
      block: "start",
    });
    history.replaceState(null, "", href);
  };

  return (
    <section aria-labelledby={heading ? "membership-heading" : undefined}>
      {/* 下部再掲用の簡易見出し（指定時のみ・左揃え） */}
      {heading && (
        <h2
          id="membership-heading"
          className="font-heading text-[28px] font-bold text-foreground"
        >
          {heading}
        </h2>
      )}

      {/* 期間トグル（既定=3ヶ月ごと・左揃え）。見出しがある時は 24px 空ける。 */}
      {showToggle && (
        <div className={`flex justify-start ${heading ? "mt-6" : ""}`}>
          <PeriodToggle duration={duration} onChange={onDurationChange} />
        </div>
      )}

      {/* 価格カード×2（上のヘッダー/トグルから 32px） */}
      <div
        className={`grid items-start gap-6 md:grid-cols-2 ${
          cardsHaveHeader ? "mt-8" : ""
        }`}
      >
        {DIFF_PLAN_TYPES.map((type) => {
          const view = getPlanPriceView(type, duration);
          const content = PLAN_CONTENT[type];
          const recommended = type === "feedback";

          return (
            <section
              key={type}
              id={type === "standard" ? "std" : "feedback"}
              // feedback は強調のためグラデ枠を巡回アニメ＋影1段強く（.feedback-card-anim / globals.css）。
              // グラデ枠 = 透明borderに padding-box/border-box 背景トリック（DSトークン参照）。
              className={`flex flex-col gap-8 rounded-3xl px-6 py-8 ${
                recommended
                  ? "feedback-card-anim"
                  : "border border-border bg-surface"
              }`}
            >
              {/* 上部（プラン名→タグライン→価格→CTA）。下線で機能部と区切る。 */}
              <div className="border-b border-border pb-8">
                {/* 1. プラン名 */}
                <h3 className="font-heading text-xl font-bold text-foreground">
                  {view.displayName}
                </h3>

                {/* 2. タグライン（Regular・foreground。旧説明文ブロックはここに統合） */}
                <p className="mt-2 font-heading text-base font-normal text-foreground">
                  {content.catch}
                </p>

                {/* 3. 価格ブロック */}
                <div className="mt-5">
                  <PriceBlock view={view} />
                </div>

                {/* 4. CTAボタン（共通 PlanCtaButton。状態認識 or ダミー）。
                    flex-col でエラー文の mt-2 を効かせる。再開リンクは撤去済（Figmaに無し）。 */}
                <div className="mt-6 flex flex-col">
                  <PlanCtaButton
                    planType={type}
                    duration={duration}
                    variant={recommended ? "default" : "outline"}
                    // standard(outline) は境界が薄いので border を濃色トークンに上書き（twMerge）。
                    // feedback(default/濃色) は className 無しで不変。
                    className={recommended ? undefined : "border-border-strong"}
                    fullWidth
                    isLoggedIn={isLoggedIn}
                    isSubscribed={isSubscribed}
                    currentPlanType={currentPlanType}
                    currentDuration={currentDuration}
                    currentPeriodEnd={currentPeriodEnd}
                    cancelAtPeriodEnd={cancelAtPeriodEnd}
                  />
                </div>
              </div>

              {/* 下部（解放機能） */}
              <div>
                <h4 className="text-sm font-bold text-foreground">解放機能</h4>

                {/* 解放機能リスト（アイコン+ラベル+値。standardは差分を「なし」表示） */}
                <ul className="mt-5 flex flex-col gap-[9px]">
                  {FEATURE_ROWS.map((row) => {
                    const value = featureValue(row, type);
                    return (
                      <FeatureRow
                        key={row.label}
                        row={row}
                        value={value}
                        absent={isFeatureAbsent(value)}
                      />
                    );
                  })}
                </ul>

                {/* 詳細を見る（detailAnchors 指定時のみ。機能一覧の一番下・小さめリンク） */}
                {detailAnchors && (
                  <a
                    href={detailAnchors[type]}
                    onClick={(e) => handleDetailClick(e, detailAnchors[type])}
                    className="mt-4 inline-block text-xs text-text-link underline underline-offset-4 hover:text-text-link-hover"
                  >
                    詳細を見る
                  </a>
                )}
              </div>
            </section>
          );
        })}
      </div>
    </section>
  );
}
