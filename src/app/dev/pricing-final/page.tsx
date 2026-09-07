import type { Metadata } from "next";
import { Suspense } from "react";
import AchievementHighlightSection from "@/components/top/home/AchievementHighlightSection";
import { getAchievementGroups } from "@/lib/sanity";
import { getCurrentUser, getSubscriptionStatus } from "@/lib/subscription";
import { PricingFinal } from "./PricingFinal";

/**
 * 料金ページ L4（確定仕様）— production 志向のクリーンな部品ホーム。
 *
 * 探索用 /dev/pricing-* から canonical 部品を @/components/pricing/* / @/lib/pricing/* に
 * 集約し、確定した L4 の並び順で組み直したクリーン版。既存の探索版は撤去せず残す。
 *
 * データ取得（Server Component）:
 *  - 実績・アウトプットは Sanity から getAchievementGroups(3) で取得し、
 *    AchievementHighlightSection を組み立てて ReactNode として client（PricingFinal）へ渡す。
 *  - ⚠ Sanity 未設定環境（.env.local 無し）では取得が失敗しうる。try/catch し、失敗時は
 *    実績セクションを出さず fallback メッセージに差し替えてページを壊さない。
 *
 * /dev 配下なので本番では 404（dev/layout.tsx でゲート）。noindex。
 */

export const metadata: Metadata = {
  title: "料金プラン（L4確定 /dev/pricing-final）",
  robots: { index: false, follow: false },
};

async function buildAchievementSlot() {
  try {
    const groups = await getAchievementGroups(3);
    return (
      <AchievementHighlightSection
        compact
        paddingY={0}
        className="border-b-0"
        cardGridClassName="gap-[40px] sm:gap-[24px]"
        headingSlot={
          <div>
            <p className="text-xs tracking-[1.6px] text-foreground">
              MEMBER&apos;S VOICE
            </p>
            <h2 className="mt-3 font-heading text-[28px] font-semibold text-foreground">
              みんなの実績
            </h2>
          </div>
        }
        storyItems={groups.stories}
        outputItems={groups.outputs}
      />
    );
  } catch (error) {
    // Sanity 未接続（.env.local 無し）等で取得失敗 → セクションは出さず fallback を表示
    console.warn(
      "[pricing-final] achievement 取得に失敗。fallback を表示します。",
      error
    );
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
        （実績データは環境未接続のため非表示）
      </p>
    );
  }
}

export default async function PricingFinalPage() {
  const achievementSlot = await buildAchievementSlot();
  // 状態取得（Server）— /subscription/page.tsx と同じ取得。実CTAの状態出し分けに使う。
  const user = await getCurrentUser();
  const subscription = await getSubscriptionStatus();

  return (
    <Suspense fallback={<div className="p-8 text-sm">読み込み中…</div>}>
      <PricingFinal
        achievementSlot={achievementSlot}
        isLoggedIn={!!user}
        isSubscribed={subscription.isSubscribed}
        currentPlanType={subscription.planType}
        currentDuration={subscription.duration}
        currentPeriodEnd={subscription.renewalDate}
        cancelAtPeriodEnd={subscription.cancelAtPeriodEnd}
      />
    </Suspense>
  );
}
