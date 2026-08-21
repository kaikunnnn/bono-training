"use client";

/**
 * 料金ページ L4（確定仕様）— production 志向のクリーンな合成。
 *
 * L4 の並び（pricing-layout の検証で確定）:
 *   Hero(簡潔) → 価格カード(詳細リンク付) → プラン説明 → 実績(社会的証明) → 価格カード再掲
 *
 * 部品は全て production パスの共通コンポーネント（@/components/pricing/*）を合成する。
 * 期間 state（既定=3ヶ月主軸）を上下2つの PlanCards で共有し、トグル操作を連動させる。
 * 実績・アウトプットは Server Component（Sanity 取得済み）を achievementSlot として受け取る。
 *
 * レイアウト: ページ全体を左揃え（中央寄せクラスを使わない。max-width＋読みやすい幅）。
 * 見出し階層: h1 はこのページに1つだけ。各セクションは h2 以下（PlanCards=h2 等）。
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

interface PricingFinalProps {
  /** 実績・アウトプット（Server Component で Sanity 取得済みの ReactNode） */
  achievementSlot: ReactNode;
  // ---- 購読状態（Server で取得済み）。上下 2 つの PlanCards へそのまま渡す。 ----
  isLoggedIn: boolean;
  isSubscribed: boolean;
  currentPlanType: PlanType | null;
  currentDuration: PlanDuration | null;
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}

export function PricingFinal({
  achievementSlot,
  isLoggedIn,
  isSubscribed,
  currentPlanType,
  currentDuration,
  currentPeriodEnd,
  cancelAtPeriodEnd,
}: PricingFinalProps) {
  // 期間 state（既定=3ヶ月主軸）。上下の PlanCards の期間トグルで共有・連動する。
  const [duration, setDuration] = useState<PlanDuration>(3);

  const router = useRouter();
  const searchParams = useSearchParams();
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

  // ---- S2: 登録完了後の自動 Checkout（intent 消費） ----
  // 未ログイン CTA は /signup?redirectTo=/dev/pricing-final?intent_plan=..&intent_duration=..
  // へ遷移する（PlanCtaButton）。登録完了でこの URL に戻ってきたとき、下記条件を満たせば
  // 自動で Stripe Checkout を起動し、ユーザーの再クリックを省く。
  //
  // 発火条件（すべて満たすとき一度だけ）:
  //   ログイン済み && 未課金 && intent が有効（standard/feedback × 1/3）。
  //
  // ⚠️ email 確認が必要な設定の制約:
  //   signUp 直後にメール確認が要る場合、確認完了までセッションが張られず isLoggedIn=false。
  //   その間は何もしない（intent は URL に残す）。ユーザーが確認後に（intent 付き URL へ）
  //   再訪したときに、未消費 intent で自動起動する、という挙動になる。
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

    // intent クエリを URL から除去（scroll 維持）。戻る/再マウント時の再発火を防ぐ。
    const params = new URLSearchParams(searchParams.toString());
    params.delete("intent_plan");
    params.delete("intent_duration");
    const query = params.toString();
    router.replace(
      query ? `/dev/pricing-final?${query}` : "/dev/pricing-final",
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
    <div className="mx-auto w-full max-w-[1040px] px-4 py-12">
      {/* ページ主見出し（h1）は PricingHero が担う（「料金プラン」→統合h1） */}
      <div className="flex flex-col gap-16">
        {/* 1. ヘッダー＋価格カード（ファーストビュー統合ブロック）。
            Hero→トグルは 24px（mt-6）。この2要素を1グループにまとめることで、
            外側 gap-16（64px）は次セクション(PlanDetail)との間にのみ効く。 */}
        <div>
          {/* ヘッダー（料金プラン／統合h1／支払いリンク・border-b無し） */}
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
        </div>

        {/* 3. プラン説明（変化ストーリー・詳細）。CTA は共通課金フローに配線（期間連動）。 */}
        <PlanDetail duration={duration} {...subscriptionProps} />

        {/* 4. 実績・アウトプット（社会的証明。Server Component slot）。
            ②③⑤と同じセクション区切り（border-t + pt-14=56px）で整合させる。
            AchievementHighlightSection は paddingY={0} で内部上パディング無しのため二重にならない。 */}
        <section className="border-t border-border pt-14">{achievementSlot}</section>

        {/* 5. 価格カード再掲（トグル無し・簡易見出しのみ。期間は上と連動）。
            ②③④と同じセクション区切り（border-t + pt-14=56px）で整合させる。 */}
        <section className="border-t border-border pt-14">
          <PlanCards
            duration={duration}
            onDurationChange={setDuration}
            heading="まずは気になるプランから始めよう"
            showToggle={false}
            {...subscriptionProps}
          />
        </section>
      </div>
    </div>
  );
}
