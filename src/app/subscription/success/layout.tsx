/**
 * /subscription/success 用のメタデータ。
 * ページ本体は "use client"（metadata を export できない）ため、この layout（Server）で付与する。
 * 決済完了後の遷移先ページなので noindex（検索インデックス不要・OGP共有も想定しない）。
 * 新規登録・プラン変更の両方が来るため、タイトルは中立的な文言にする。
 */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "お手続きが完了しました",
  robots: { index: false, follow: false },
};

export default function SubscriptionSuccessLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
