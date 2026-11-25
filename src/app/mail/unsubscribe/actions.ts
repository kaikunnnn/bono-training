"use server";

// ---------------------------------------------------------------------------
// 会員メールの配信停止（#264 §5-8）の Server Actions
//
// ログインは要らない（会員の多くはログインしていない状態でメールを読む）。
// 誰の・どのカテゴリかは、フォームの t（署名つきトークン）で毎回確かめ直す。
// 記録の読み書きは service_role（src/lib/member-mail/store.ts）。メールアドレスは扱わない。
// 会員に見せるのは「BONOからのお知らせメール」1項目だけ。返すのも止めているかどうかだけ（#327-C）。
// useActionState から呼ぶので (prevState, formData) の形。
// ---------------------------------------------------------------------------

import { getMailStore, getUnsubscribeSecret } from "@/lib/member-mail/runtime";
import { isMemberMailFullyStopped, resubscribeAllMemberMail } from "@/lib/member-mail/self-settings";
import { unsubscribeByToken } from "@/lib/member-mail/unsubscribe";
import { verifyUnsubscribeToken } from "@/lib/member-mail/unsubscribe-token";

export type UnsubscribeActionState =
  /** stopped: 全カテゴリが止まっているか（1つでも受け取っていれば false） */
  | { status: "stopped" | "updated"; stopped: boolean }
  | { status: "invalid" | "unavailable" }
  | null;

/** 「受け取りをやめる」 */
export async function stopMemberMail(_prev: UnsubscribeActionState, formData: FormData): Promise<UnsubscribeActionState> {
  const secret = getUnsubscribeSecret();
  const store = getMailStore();
  if (!secret || !store) return { status: "unavailable" };
  const token = formData.get("t");
  try {
    const outcome = await unsubscribeByToken(store, secret, token, "link", new Date());
    if (outcome === "invalid_token") return { status: "invalid" };
    const verified = verifyUnsubscribeToken(secret, token)!;
    return { status: "stopped", stopped: await isMemberMailFullyStopped(store, verified.userId) };
  } catch (error) {
    console.error("[member-mail] unsubscribe failed:", error instanceof Error ? error.message : "unknown");
    return { status: "unavailable" };
  }
}

/** 止めたあとに「受け取りを再開する」（全カテゴリを戻す） */
export async function restartMemberMail(_prev: UnsubscribeActionState, formData: FormData): Promise<UnsubscribeActionState> {
  const secret = getUnsubscribeSecret();
  const store = getMailStore();
  if (!secret || !store) return { status: "unavailable" };
  const verified = verifyUnsubscribeToken(secret, formData.get("t"));
  if (!verified) return { status: "invalid" };
  try {
    await resubscribeAllMemberMail(store, verified.userId, new Date());
    console.log("[member-mail] resubscribed", { scope: "all" });
    return { status: "updated", stopped: await isMemberMailFullyStopped(store, verified.userId) };
  } catch (error) {
    console.error("[member-mail] resubscribe failed:", error instanceof Error ? error.message : "unknown");
    return { status: "unavailable" };
  }
}
