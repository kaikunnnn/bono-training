import type { Metadata } from "next";
import { Suspense } from "react";
import { getSubscriptionStatus } from "@/lib/subscription";
import { NewTopContent } from "@/components/top-next/NewTopContent";
import { MembershipCta } from "@/components/top-next/organisms/HeroSection";
import { traceServerStep } from "@/lib/performance/server-trace";
import { HOME_DESCRIPTION, HOME_TITLE } from "@/lib/seo-metadata";

export const metadata: Metadata = {
  // #236: / と同じ文言（absolute でテンプレの「| BONO」二重付与を防ぐ）
  title: { absolute: HOME_TITLE },
  description: HOME_DESCRIPTION,
  // `/` と同一内容のため重複コンテンツを避ける（正規URLは / 、/top はインデックスさせない）
  alternates: { canonical: "/" },
  robots: { index: false, follow: true },
};

/**
 * トップページ（/top）
 *
 * 本番トップ `/` と同一の新トップ（NewTopContent = 1ソース）を表示する。`/` は
 * ログイン済みを /mypage へリダイレクトするため、ログイン中でも新トップを確認・
 * 利用できるURLとして /top を用意する（リダイレクトなし）。会員（standard/feedback）
 * はヒーローの入会CTAを非表示。重複コンテンツ回避のため canonical=/ + noindex。
 */
async function TopMembershipCta() {
  const subscription = await traceServerStep(
    "top.subscription",
    getSubscriptionStatus,
  );

  return subscription.hasMemberAccess ? null : <MembershipCta />;
}

export default function TopPage() {
  return (
    <NewTopContent
      surface="top"
      membershipCta={
        <Suspense fallback={null}>
          <TopMembershipCta />
        </Suspense>
      }
    />
  );
}
