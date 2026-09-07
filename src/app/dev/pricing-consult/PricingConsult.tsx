"use client";

/**
 * 料金ページ「相談導線」検証（/dev/pricing-consult）。
 *
 * ベースは pricing-final（L4 確定構成）を流用:
 *   Hero(簡潔) → 価格カード(詳細リンク付) → プラン説明 → 実績(社会的証明) → 価格カード再掲
 * 部品は全て production パスの共通コンポーネント（@/components/pricing/*）を合成する。
 *
 * このページの検証対象は「購入を迷う人を無料相談（＝お問い合わせ Google フォーム）に流して
 * クロージングする相談導線の配置」。
 *
 * ★大原則: 課金CV（主CTA＝PlanCtaButton）を落とさない。相談導線（ConsultCta）は全て
 *   セカンダリー・控えめ（outline / link / 小さな floating）で、主CTAより弱い見た目に統一する。
 *
 * 4 パターン（URL クエリ c で一度に 1 つだけ有効・既定 C1）:
 *  - C1 末尾セーフティネット : 下部再掲カードの「後」に ConsultCta(block)。
 *  - C2 カード直下サブリンク : 上の価格カードの「直下」に ConsultCta(link)。
 *  - C3 カード直下ブロック   : 上の価格カードの「直下」に ConsultCta(block)。
 *  - C4 スティッキー最小     : ConsultCta(floating) を右下に常設。
 *
 * レイアウト: ページ全体を左揃え（中央寄せクラスを使わない）。text-center を使わない。
 * 見出し階層: h1 は PricingHero が担う。相談 block は h2（末尾セクション見出しと同レベル）。
 */

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { PlanType, PlanDuration } from "@/types/subscription";
import { PricingHero } from "@/components/pricing/PricingHero";
import { PlanCards } from "@/components/pricing/PlanCards";
import { PlanDetail } from "@/components/pricing/PlanDetail";
import { getPlanPriceView } from "@/lib/pricing/price";
import { createCheckoutSession } from "@/lib/services/stripe";
import { trackBeginCheckout } from "@/lib/analytics";
import { ConsultCta } from "./ConsultCta";
import { DevControls } from "./DevControls";
import { parseConsultPattern, type ConsultPattern } from "./patterns";

interface PricingConsultProps {
  /** 実績・アウトプット（Server Component で Sanity 取得済みの ReactNode） */
  achievementSlot: ReactNode;
  // ---- 購読状態（Server で取得済み）。上下 2 つの PlanCards / PlanDetail へそのまま渡す。 ----
  isLoggedIn: boolean;
  isSubscribed: boolean;
  currentPlanType: PlanType | null;
  currentDuration: PlanDuration | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function PricingConsult({
  achievementSlot,
  isLoggedIn,
  isSubscribed,
  currentPlanType,
  currentDuration,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: PricingConsultProps) {
  // 期間 state（既定=3ヶ月主軸）。上下の PlanCards の期間トグルで共有・連動する。
  const [duration, setDuration] = useState<PlanDuration>(3);

  const router = useRouter();
  const searchParams = useSearchParams();
  // 相談導線の配置パターン（クエリ c・不正値は C1 へフォールバック）。
  const consult: ConsultPattern = parseConsultPattern(searchParams.get("c"));
  // intent の多重消費防止（同一マウント中に一度だけ自動 checkout を起動する）。
  const intentConsumed = useRef(false);

  // 上下 2 つの PlanCards / PlanDetail に共通で渡す購読状態。
  const subscriptionProps = {
    isLoggedIn,
    isSubscribed,
    currentPlanType,
    currentDuration,
    currentPeriodEnd,
    cancelAtPeriodEnd,
  };

  // 確認用スイッチャ: c を URL クエリに反映（c 以外のクエリは保持・scroll 維持）。
  const switchConsult = (next: ConsultPattern) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("c", next);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  // ---- 登録完了後の自動 Checkout（intent 消費）。pricing-final と同一挙動。 ----
  // 未ログイン CTA は /signup?redirectTo=/dev/pricing-consult?intent_plan=..&intent_duration=..
  // へ遷移する（PlanCtaButton）。登録完了でこの URL に戻ったとき、条件を満たせば一度だけ
  // 自動で Stripe Checkout を起動する（相談導線とは独立した主フロー）。
  useEffect(() => {
    if (intentConsumed.current) return;

    const intentPlan = searchParams.get("intent_plan");
    const intentDurationRaw = searchParams.get("intent_duration");
    if (!intentPlan || !intentDurationRaw) return;

    // 未ログイン（セッション無し）なら何もしない。intent は URL に残す。
    if (!isLoggedIn) return;
    // 既に課金中なら checkout 不要。
    if (isSubscribed) return;

    // intent の妥当性（standard/feedback × 1/3 のみ）。
    const validPlan = intentPlan === "standard" || intentPlan === "feedback";
    const intentDuration = Number(intentDurationRaw) as PlanDuration;
    const validDuration = intentDuration === 1 || intentDuration === 3;
    if (!validPlan || !validDuration) return;

    // ここで消費確定（多重起動防止）。
    intentConsumed.current = true;
    const plan = intentPlan as PlanType;

    // intent クエリを URL から除去（c 等その他のクエリは保持・scroll 維持）。
    const params = new URLSearchParams(searchParams.toString());
    params.delete("intent_plan");
    params.delete("intent_duration");
    const query = params.toString();
    router.replace(
      query ? `/dev/pricing-consult?${query}` : "/dev/pricing-consult",
      { scroll: false }
    );

    // 自動 Checkout 起動。
    void (async () => {
      const view = getPlanPriceView(plan, intentDuration);
      const totalForDuration =
        intentDuration === 3 ? view.total3m : view.monthly1m;
      trackBeginCheckout(plan, totalForDuration, intentDuration);
      const returnUrl = `${window.location.origin}/subscription/success?plan=${plan}&duration=${intentDuration}`;
      const { url } = await createCheckoutSession(
        returnUrl,
        plan,
        intentDuration
      );
      if (url) {
        window.location.href = url;
      }
    })();
  }, [searchParams, isLoggedIn, isSubscribed, router]);

  return (
    <>
      <div className="mx-auto w-full max-w-[1040px] px-4 py-12">
        {/* 確認用スイッチャ（dev のみ。相談導線の配置だけを切り替えて比較する） */}
        <DevControls c={consult} onC={switchConsult} />

        {/* ページ主見出し（h1）は PricingHero が担う */}
        <div className="mt-10 flex flex-col gap-16">
          {/* 1. ヘッダー＋価格カード（ファーストビュー統合ブロック） */}
          <div>
            <PricingHero />

            {/* 価格カード（トグル付き・各カード末尾に「詳細を見る」）。ヘッダーから 24px。 */}
            <div className="mt-6">
              <PlanCards
                duration={duration}
                onDurationChange={setDuration}
                detailAnchors={{
                  standard: "#detail-standard",
                  feedback: "#detail-feedback",
                }}
                {...subscriptionProps}
              />
            </div>

            {/* C2: 価格カード直下に控えめなテキストリンク（迷いのピークに設置） */}
            {consult === "C2" && (
              <div className="mt-6">
                <ConsultCta variant="link" />
              </div>
            )}

            {/* C3: 価格カード直下に相談ブロック（block型）。迷いのピークで無料相談へ拾う。 */}
            {consult === "C3" && (
              <div className="mt-6">
                <ConsultCta variant="block" />
              </div>
            )}
          </div>

          {/* 2. プラン説明（変化ストーリー・詳細）。CTA は共通課金フローに配線（期間連動）。 */}
          <PlanDetail duration={duration} {...subscriptionProps} />

          {/* 3. 実績・アウトプット（社会的証明。Server Component slot）。 */}
          <section className="border-t border-border pt-14">
            {achievementSlot}
          </section>

          {/* 4. 価格カード再掲（トグル無し・簡易見出しのみ。期間は上と連動）。 */}
          <section className="border-t border-border pt-14">
            <PlanCards
              duration={duration}
              onDurationChange={setDuration}
              heading="まずは気になるプランから始めよう"
              showToggle={false}
              {...subscriptionProps}
            />
          </section>

          {/* C1: 下部再掲カードの後に相談ブロック（読了・未購入層のセーフティネット） */}
          {consult === "C1" && <ConsultCta variant="block" />}
        </div>
      </div>

      {/* C4: 右下に小さな固定ボタンを常設（レイアウトを侵さないセーフティネット） */}
      {consult === "C4" && <ConsultCta variant="floating" />}
    </>
  );
}
