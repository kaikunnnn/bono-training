/**
 * Slack とつなぐ（#263）。DM のリンク（/slack/link?t=…）の行き先。
 *
 * - BONO へのログインが必要。未ログインならログイン画面へ送り、ログイン後このページ（t= 付き）へ戻す。
 *   （proxy の保護パスには入れない: proxy は redirectTo にパスしか入れず ?t= が落ちるため、ページ側でリダイレクトする。
 *    reauth=1 は /mypage と同じく、無効な cookie での /login ⇄ ページ の往復を断つため）
 * - 開いただけではつながない（リンクのプレビュー等で使われないように）。「つなぐ」ボタンを押すとつながる。
 * - 上書きしない。どちらかが別のアカウントとつながっていれば、その旨を出して断る。
 */
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/subscription";
import { inspectLinkToken, isPaidForLink } from "@/lib/slack-member-sync/link-flow";
import { getSyncStore } from "@/lib/slack-member-sync/runtime";
import { SlackLinkConfirm } from "./SlackLinkConfirm";
import { SlackLinkFrame as Frame } from "./SlackLinkFrame";
import { SlackLinkResult } from "./SlackLinkResult";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Slackとつなぐ",
  robots: { index: false, follow: false },
};

export default async function SlackLinkPage({
  searchParams,
}: {
  searchParams: Promise<{ t?: string | string[] }>;
}) {
  const [user, params] = await Promise.all([getCurrentUser(), searchParams]);
  const token = typeof params.t === "string" ? params.t : null;

  if (!user) {
    const back = token ? `/slack/link?t=${encodeURIComponent(token)}` : "/slack/link";
    redirect(`/login?reauth=1&redirectTo=${encodeURIComponent(back)}`);
  }

  const store = getSyncStore();
  if (!store) {
    return (
      <Frame>
        <SlackLinkResult status="unavailable" />
      </Frame>
    );
  }

  let state: Awaited<ReturnType<typeof inspectLinkToken>>;
  let paid = false;
  try {
    [state, paid] = await Promise.all([
      inspectLinkToken(store, token, user.id),
      isPaidForLink(store, user.id),
    ]);
  } catch (error) {
    console.error("[slack-member-sync] link page failed:", error instanceof Error ? error.message : "unknown");
    state = "unavailable";
  }

  if (state !== "valid") {
    return (
      <Frame>
        <SlackLinkResult status={state} />
      </Frame>
    );
  }
  if (!paid) {
    return (
      <Frame>
        <SlackLinkResult status="not_paid" />
        {user.email && (
          <p className="mt-4 text-base leading-relaxed text-text-secondary">
            ログイン中：<span className="font-medium text-text-primary">{user.email}</span>
          </p>
        )}
      </Frame>
    );
  }

  return (
    <Frame>
      <SlackLinkConfirm token={token!} email={user.email ?? null} />
    </Frame>
  );
}
