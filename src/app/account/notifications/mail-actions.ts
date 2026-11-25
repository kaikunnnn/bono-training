"use server";

// ---------------------------------------------------------------------------
// 通知設定の「BONOからのお知らせメール」のオン・オフ（#327-C）の Server Action
//
// 誰の設定かは引数で受け取らない。必ずログイン中の本人（getCurrentUser）の id を使う。
// 記録の読み書きは service_role のストア（src/lib/member-mail/store.ts）。メールアドレスは扱わない。
// 返すのはオンかオフかだけ（内部のカテゴリ名はブラウザに渡さない）。
// ---------------------------------------------------------------------------

import { getCurrentUser } from "@/lib/subscription";
import { getMailStore } from "@/lib/member-mail/runtime";
import { SETTINGS_UNSUBSCRIBE_METHOD, setMemberMailEnabled } from "@/lib/member-mail/self-settings";

export type MemberMailSettingResult = { success: true; enabled: boolean } | { success: false; error: string };

export async function updateMemberMailSetting(enabled: boolean): Promise<MemberMailSettingResult> {
  if (typeof enabled !== "boolean") return { success: false, error: "設定の保存に失敗しました。" };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: "ログインし直してから、もう一度お試しください。" };

  const store = getMailStore();
  if (!store) return { success: false, error: "いま設定を変えられません。時間をおいて再度お試しください。" };

  try {
    const now = await setMemberMailEnabled(store, user.id, enabled, SETTINGS_UNSUBSCRIBE_METHOD, new Date());
    console.log("[member-mail] settings updated", { enabled: now, source: "account" });
    return { success: true, enabled: now };
  } catch (error) {
    console.error("[member-mail] settings update failed:", error instanceof Error ? error.message : "unknown");
    return { success: false, error: "設定の保存に失敗しました。時間をおいて再度お試しください。" };
  }
}
