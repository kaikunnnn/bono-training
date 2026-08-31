import type { Metadata } from "next";
import { getSubscriptionStatus } from "@/lib/subscription";
import { NewTopContent } from "@/components/top-next/NewTopContent";

export const metadata: Metadata = {
  title: "BONO - UIUXデザインを学ぶ",
  description:
    "UIUXデザインを体系的に学べるオンライン学習プラットフォーム。ロードマップ、レッスン、記事で効率的にスキルアップ。未経験からUIUXデザイナーへ。",
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
export default async function TopPage() {
  const subscription = await getSubscriptionStatus();
  return <NewTopContent isMember={subscription.hasMemberAccess} />;
}
