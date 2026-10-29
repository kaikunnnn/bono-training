/**
 * 「Slackとつなぐ」の詳細ページ（/account/slack・#263）。アカウント情報の「Slack」カードから来る。
 * Slack で使っているメールを入れると、確認DMが届く（DM のリンク先は /slack/link）。
 *
 * 出し分けは /account の Slack カードと同じ判定（loadSlackLinkState）:
 * - show: フォームを出す / linked・not_paid・unavailable: フォームの代わりに文だけ出す
 * - hidden（off / dry_run・未設定・本文が未承認・test の対象外）: ページ自体がないことにする（404）
 */
import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/subscription";
import { loadSlackLinkState } from "@/lib/slack-member-sync/slack-link-state";
import { SlackLinkPageBody } from "./SlackLinkPageBody";

export const metadata: Metadata = {
  title: "Slackとつなぐ",
  robots: { index: false, follow: false },
};

export default async function AccountSlackPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?reauth=1&redirectTo=/account/slack");
  }

  const state = await loadSlackLinkState(user.id);
  if (state === "hidden") notFound();

  return <SlackLinkPageBody state={state} />;
}
