"use client";

/**
 * 価格カードセクション（/dev/pricing 本番プロト） — www.bo-no.design/plan 準拠。
 *
 * 「メンバーシップ」見出し + 期間トグル + プランカード×2（standard / feedback）を描画する。
 * カード内の順序・文言は現行 /plan のコンテンツ（説得コピー含む）に合わせている。
 *
 * 価格の数値/price_id はこのファイルに書かない。pricing-diff の価格ロジック
 * （getPlanPriceView = AVAILABLE_PLANS 由来の唯一の真実）を再利用して算出する。
 * 期間トグルも pricing-diff の PeriodToggle を再利用する。
 * CTA・再開リンクは Stripe を呼ばず console.log / href="#" のダミー。
 *
 * 見出し階層: ページ h1 → h2（このセクション見出し）→ h3（プラン名）→ h4（解放機能）。
 */

import { Button } from "@/components/ui/button";
import type { PlanType, PlanDuration } from "@/types/subscription";
import {
  DIFF_PLAN_TYPES,
  FEATURE_ROWS,
  featureValue,
  formatYen,
  getCtaLabel,
  getPlanPriceView,
  isFeatureAbsent,
} from "../pricing-diff/data";
import { FeatureRow } from "../pricing-diff/FeatureRow";
import { PeriodToggle } from "../pricing-diff/PeriodToggle";

// --- カードごとのコピー（価格でないため文言リテラルOK。/plan準拠） ---------------
// 解放機能リストは pricing-diff の FEATURE_ROWS（Figma順=差分→共通）を FeatureRow で描画。
// アイコン左＋ラベル＋値右。standard は差分3項目を「なし」表示（isFeatureAbsent）。

interface PlanContent {
  /** キャッチ見出し（太字タグライン） */
  catch: string;
  /** 説明文（説得コピー） */
  description: string;
}

const PLAN_CONTENT: Record<PlanType, PlanContent> = {
  standard: {
    catch: "デザイン力を伸ばす良い環境を作る",
    description:
      "飲み会1回分でデザイン力を向上する コミュニティと解説動画にアクセスしよう。",
  },
  feedback: {
    catch: "プロの添削で速く、深く成長したい",
    description:
      "プロがデザインをフィードバック。成長したい、キャリアに不安がある人にピッタリ。",
  },
};

// --- 価格ブロック（/plan準拠。全数値は getPlanPriceView 由来） -------------------

function CardPriceBlock({
  view,
}: {
  view: ReturnType<typeof getPlanPriceView>;
}) {
  if (view.duration === 3) {
    return (
      <div className="space-y-1">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold text-foreground">
            {formatYen(view.monthly3m)}
          </span>
          <span className="text-sm text-muted-foreground">
            /月(3ヶ月継続)
          </span>
          <span className="ml-1 text-xs text-muted-foreground">税込</span>
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="line-through">{formatYen(view.monthly1m)}</span>{" "}
          {/* ⚠ /planは¥1,199表記だが定数算出は¥2,000。要確認（issue#186） */}
          <span className="font-bold text-primary">
            約{formatYen(view.savingsPerMonth)}/月 お得
          </span>
        </p>
      </div>
    );
  }

  // 毎月払い（1ヶ月）
  return (
    <div className="flex items-baseline gap-1">
      <span className="text-3xl font-bold text-foreground">
        {formatYen(view.monthly1m)}
      </span>
      <span className="text-sm text-muted-foreground">/月</span>
      <span className="ml-1 text-xs text-muted-foreground">税込</span>
    </div>
  );
}

// --- 本体 --------------------------------------------------------------------

interface PlanCardsProps {
  duration: PlanDuration;
  onDurationChange: (duration: PlanDuration) => void;
  /** メンバーシップ見出し(h2)の差し替え。未指定なら現行 /plan コピー。 */
  heading?: string;
  /** 「メンバーシップ」バッジの表示可否（既定 true）。 */
  showBadge?: boolean;
  /** 「支払いに関する質問はこちら」リンクの表示可否（既定 true）。 */
  showPaymentLink?: boolean;
  /** 期間トグルの表示可否（既定 true）。 */
  showToggle?: boolean;
  /** 指定時、各カードの機能一覧末尾に「詳細を見る」リンク（該当アンカーへ）を表示。 */
  detailAnchors?: { standard: string; feedback: string };
}

export function PlanCards({
  duration,
  onDurationChange,
  heading,
  showBadge = true,
  showPaymentLink = true,
  showToggle = true,
  detailAnchors,
}: PlanCardsProps) {
  const handleCta = (plan: PlanType) => {
    console.log("[pricing] CTA", { plan });
  };

  return (
    <section aria-labelledby="membership-heading">
      {/* メンバーシップ見出し（カード群の上） */}
      <div className="text-center">
        {showBadge && (
          <p className="text-sm font-bold text-primary">メンバーシップ</p>
        )}
        <h2
          id="membership-heading"
          className={`font-heading text-2xl font-bold text-foreground sm:text-3xl ${
            showBadge ? "mt-2" : ""
          }`}
        >
          {heading ?? (
            <>月額制で成長する&quot;環境&quot;と&quot;知識&quot;にアクセス</>
          )}
        </h2>
        {showPaymentLink && (
          <a
            href="#"
            className="mt-3 inline-block text-sm text-muted-foreground underline underline-offset-4 hover:text-foreground"
          >
            支払いに関する質問はこちら
          </a>
        )}
      </div>

      {/* 期間トグル（既定=3ヶ月ごと） */}
      {showToggle && (
        <div className="mt-6 flex justify-center">
          <PeriodToggle duration={duration} onChange={onDurationChange} />
        </div>
      )}

      {/* 価格カード×2 */}
      <div className="mt-8 grid items-start gap-6 md:grid-cols-2">
        {DIFF_PLAN_TYPES.map((type) => {
          const view = getPlanPriceView(type, duration);
          const content = PLAN_CONTENT[type];
          const recommended = type === "feedback";

          return (
            <section
              key={type}
              id={type === "standard" ? "std" : "feedback"}
              className={`flex flex-col rounded-3xl border bg-surface px-6 py-8 ${
                recommended ? "border-primary" : "border-border"
              }`}
            >
              {/* 1. プランラベル */}
              <h3 className="font-heading text-xl font-bold text-foreground">
                {view.displayName}
              </h3>

              {/* 2. キャッチ見出し（太字タグライン） */}
              <p className="mt-2 font-heading text-lg font-bold text-foreground">
                {content.catch}
              </p>

              {/* 3. 価格ブロック */}
              <div className="mt-5">
                <CardPriceBlock view={view} />
              </div>

              {/* 4. CTAボタン */}
              <div className="mt-6">
                <Button
                  type="button"
                  className="w-full"
                  variant={recommended ? "default" : "outline"}
                  onClick={() => handleCta(type)}
                >
                  {getCtaLabel(type)}
                </Button>
              </div>

              {/* 5. キャンセルからの再開リンク */}
              <a
                href="#"
                className="mt-2 self-center text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
              >
                キャンセルからの再開はこちら
              </a>

              {/* 6. 説明文（説得コピー） */}
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {content.description}
              </p>

              {/* 7. 区切り線 + 解放機能 */}
              <hr className="my-6 border-border" />
              <h4 className="text-sm font-bold text-foreground">解放機能</h4>

              {/* 8. 解放機能リスト（アイコン+ラベル+値。standardは差分を「なし」表示） */}
              <ul className="mt-3 space-y-2">
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

              {/* 9. 詳細を見る（detailAnchors 指定時のみ。機能一覧の一番下・小さめリンク） */}
              {detailAnchors && (
                <a
                  href={detailAnchors[type]}
                  className="mt-4 inline-block text-xs text-muted-foreground underline underline-offset-4 hover:text-foreground"
                >
                  詳細を見る
                </a>
              )}
            </section>
          );
        })}
      </div>
    </section>
  );
}
