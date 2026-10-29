"use server";

// ---------------------------------------------------------------------------
// 会員メールの配信停止（#264 §5-8）の Server Actions
//
// ログインは要らない（会員の多くはログインしていない状態でメールを読む）。
// 誰の・どのカテゴリかは、フォームの t（署名つきトークン）で毎回確かめ直す。
// 記録の読み書きは service_role（src/lib/member-mail/store.ts）。メールアドレスは扱わない。
// useActionState から呼ぶので (prevState, formData) の形。
// ---------------------------------------------------------------------------

import { getMailStore, getUnsubscribeSecret } from "@/lib/member-mail/runtime";
import { MAIL_CATEGORIES, type MailCategory } from "@/lib/member-mail/types";
import { unsubscribeByToken } from "@/lib/member-mail/unsubscribe";
import { verifyUnsubscribeToken } from "@/lib/member-mail/unsubscribe-token";

export type UnsubscribeActionState =
  | { status: "stopped" | "updated"; stopped: MailCategory[] }
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
    return { status: "stopped", stopped: await store.listStoppedCategories(verified.userId) };
  } catch (error) {
    console.error("[member-mail] unsubscribe failed:", error instanceof Error ? error.message : "unknown");
    return { status: "unavailable" };
  }
}

/** 止めたあとに、カテゴリごとに戻す */
export async function restartMemberMail(_prev: UnsubscribeActionState, formData: FormData): Promise<UnsubscribeActionState> {
  const secret = getUnsubscribeSecret();
  const store = getMailStore();
  if (!secret || !store) return { status: "unavailable" };
  const verified = verifyUnsubscribeToken(secret, formData.get("t"));
  if (!verified) return { status: "invalid" };
  const category = formData.get("category");
  if (typeof category !== "string" || !(MAIL_CATEGORIES as readonly string[]).includes(category)) {
    return { status: "invalid" };
  }
  try {
    await store.resubscribe(verified.userId, category as MailCategory, new Date());
    console.log("[member-mail] resubscribed", { category });
    return { status: "updated", stopped: await store.listStoppedCategories(verified.userId) };
  } catch (error) {
    console.error("[member-mail] resubscribe failed:", error instanceof Error ? error.message : "unknown");
    return { status: "unavailable" };
  }
}
