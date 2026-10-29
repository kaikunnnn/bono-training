/**
 * 「Slackとつなぐ」の詳細ページ（/mypage/slack・#263）。マイページの入口から来る。
 * Slack で使っているメールを入れると、確認DMが届く（DM のリンク先は /slack/link）。
 *
 * 出し分けはマイページの入口と同じ判定（loadMypageLinkState）:
 * - show: フォームを出す / linked・not_paid・unavailable: フォームの代わりに文だけ出す
 * - hidden（off / dry_run・未設定・本文が未承認・test の対象外）: ページ自体がないことにする（404）
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/subscription";
import { loadMypageLinkState } from "@/lib/slack-member-sync/mypage-link-state";
import { SlackLinkPageBody } from "./SlackLinkPageBody";

export const metadata: Metadata = {
  title: "Slackとつなぐ",
  robots: { index: false, follow: false },
};

export default async function MypageSlackPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?reauth=1&redirectTo=/mypage/slack");
  }

  const state = await loadMypageLinkState(user.id);
  if (state === "hidden") notFound();

  return <SlackLinkPageBody state={state} />;
}
