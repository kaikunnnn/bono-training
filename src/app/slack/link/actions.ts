"use server";

// ---------------------------------------------------------------------------
// Slack とつなぐ（#263）の Server Actions
//
// 認可は各アクションの中で毎回やり直す（ボタンを出していなくても省略しない）。
// つながり・使い捨てリンクのテーブルは service_role 専用なので、ログイン確認はユーザーのセッション、
// 読み書きは service_role（src/lib/slack-member-sync/store.ts）で行う。
// メールは保存しない・ログに出さない。useActionState から呼ぶので (prevState, formData) の形。
// ---------------------------------------------------------------------------

import { revalidatePath } from "next/cache";
import { getCachedUser } from "@/lib/supabase/server";
import { confirmLink, requestMypageLink } from "@/lib/slack-member-sync/link-flow";
import type { LinkPageStatus, MypageLinkStatus } from "@/lib/slack-member-sync/link-copy";
import { siteUrl } from "@/lib/slack-member-sync/messages/common";
import { MYPAGE_CONFIRM_MESSAGE } from "@/lib/slack-member-sync/messages/mypage-confirm";
import { getSyncSlackClient, getSyncStore } from "@/lib/slack-member-sync/runtime";
import { newRawToken } from "@/lib/slack-member-sync/tokens";

export type ConfirmSlackLinkResult = { status: LinkPageStatus } | null;
export type RequestSlackLinkResult = { status: MypageLinkStatus } | null;

/** /slack/link の「つなぐ」 */
export async function confirmSlackLink(
  _prev: ConfirmSlackLinkResult,
  formData: FormData,
): Promise<ConfirmSlackLinkResult> {
  const user = await getCachedUser();
  if (!user) return { status: "unavailable" };
  const store = getSyncStore();
  if (!store) return { status: "unavailable" };
  const token = formData.get("t");
  try {
    const status = await confirmLink(store, typeof token === "string" ? token : null, user.id);
    if (status === "linked") revalidatePath("/mypage");
    return { status };
  } catch (error) {
    console.error("[slack-member-sync] link confirm failed:", error instanceof Error ? error.message : "unknown");
    return { status: "unavailable" };
  }
}

/** マイページの「Slackとつなぐ」 */
export async function requestSlackLink(
  _prev: RequestSlackLinkResult,
  formData: FormData,
): Promise<RequestSlackLinkResult> {
  const user = await getCachedUser();
  if (!user) return { status: "unavailable" };
  const store = getSyncStore();
  const slack = getSyncSlackClient();
  if (!store || !slack) return { status: "unavailable" };
  const email = formData.get("email");
  try {
    const status = await requestMypageLink(
      {
        store,
        slack: slack.slack,
        teamId: slack.teamId,
        siteUrl: siteUrl(),
        message: MYPAGE_CONFIRM_MESSAGE,
        now: () => new Date(),
        newToken: newRawToken,
      },
      user.id,
      typeof email === "string" ? email : "",
    );
    return { status };
  } catch (error) {
    console.error("[slack-member-sync] mypage link failed:", error instanceof Error ? error.message : "unknown");
    return { status: "unavailable" };
  }
}
