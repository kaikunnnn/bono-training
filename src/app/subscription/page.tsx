import type { Metadata } from "next";
import { Suspense } from "react";
import AchievementHighlightSection from "@/components/top/home/AchievementHighlightSection";
import { getAchievementGroups } from "@/lib/sanity";
import {
  getCurrentUser,
  getSubscriptionStatus,
  getPlanDisplayName,
} from "@/lib/subscription";
import { CustomerPortalButton } from "@/components/subscription/CustomerPortalButton";
import { PricingFinal } from "../dev/pricing-final/PricingFinal";

/**
 * 料金プラン（本番ページ）。
 *
 * 新デザイン（/dev/pricing-final の PricingFinal）を本番に昇格したもの。
 * サーバーロジックは /dev/pricing-final/page.tsx を踏襲:
 *  - 実績・アウトプットは Sanity から getAchievementGroups(3) で取得し、
 *    AchievementHighlightSection を組み立てて ReactNode として client へ渡す。
 *  - 状態（ログイン/課金）は getCurrentUser / getSubscriptionStatus で取得。
 *
 * /dev 版との差分:
 *  - 本番ページなので noindex にしない（SEO 資産化）。canonical は /subscription。
 *  - 有効契約者には managementSlot（現在プラン＋プラン管理導線）を渡す。
 */

export const metadata: Metadata = {
  // 親レイアウトの title.template（"%s | BONO"）が自動で " | BONO" を付ける。
  // og/twitter はテンプレートが効かないので明示的に付ける（faqページと同じパターン）。
  title: "料金プラン",
  description:
    "BONOの料金プラン。すべてのレッスンと記事にアクセスして、UIUXデザインのスキルを効率的に身につけよう。",
  openGraph: {
    title: "料金プラン | BONO",
    description:
      "BONOの料金プラン。すべてのレッスンと記事にアクセスして、UIUXデザインのスキルを効率的に身につけよう。",
  },
  twitter: {
    title: "料金プラン | BONO",
    description:
      "BONOの料金プラン。すべてのレッスンと記事にアクセスして、UIUXデザインのスキルを効率的に身につけよう。",
  },
  alternates: { canonical: "/subscription" },
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
      "[subscription] achievement 取得に失敗。fallback を表示します。",
      error
    );
    return (
      <p className="rounded-2xl border border-dashed border-border px-4 py-8 text-sm text-muted-foreground">
        （実績データは環境未接続のため非表示）
      </p>
    );
  }
}

/** 日付を「YYYY年M月D日」に整形する。 */
function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function SubscriptionPage() {
  const achievementSlot = await buildAchievementSlot();
  // 状態取得（Server）— /dev/pricing-final と同じ取得。実CTAの状態出し分けに使う。
  const user = await getCurrentUser();
  const subscription = await getSubscriptionStatus();

  // 有効契約者向けの管理ストリップ（PricingHero 直後に表示）。
  // 契約者かつ planType が確定しているときだけ組み立てる（非契約者は undefined＝非表示）。
  const managementSlot =
    subscription.isSubscribed && subscription.planType ? (
      <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-border px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">現在のプラン</p>
          <p className="mt-0.5 text-base font-semibold text-foreground">
            {getPlanDisplayName(subscription.planType)}
            {subscription.renewalDate && (
              <span className="ml-2 text-sm font-normal text-muted-foreground">
                {subscription.cancelAtPeriodEnd
                  ? `${formatDate(subscription.renewalDate)} に終了予定`
                  : `次回更新: ${formatDate(subscription.renewalDate)}`}
              </span>
            )}
          </p>
        </div>
        <CustomerPortalButton variant="outline">
          プランを管理
        </CustomerPortalButton>
      </div>
    ) : undefined;

  return (
    <Suspense fallback={<div className="p-8 text-sm">読み込み中…</div>}>
      <PricingFinal
        achievementSlot={achievementSlot}
        managementSlot={managementSlot}
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
