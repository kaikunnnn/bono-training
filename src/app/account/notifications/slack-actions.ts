"use server";

// ---------------------------------------------------------------------------
// 通知設定の「Slack の DM」のオン・オフ（#327-H）の Server Action
//
// 誰の設定かは引数で受け取らない。必ずログイン中の本人（getCurrentUser）の id を使う。
// 記録の読み書きは service_role のストア（src/lib/member-mail/slack-dm-store.ts）。Slack の ID は返さない。
// ---------------------------------------------------------------------------

import { getCurrentUser } from "@/lib/subscription";
import { getSlackDmStore } from "@/lib/member-mail/runtime";

export type SlackDmSettingResult = { success: true; enabled: boolean } | { success: false; error: string };

export async function updateSlackDmSetting(enabled: boolean): Promise<SlackDmSettingResult> {
  if (typeof enabled !== "boolean") return { success: false, error: "設定の保存に失敗しました。" };

  const user = await getCurrentUser();
  if (!user) return { success: false, error: "ログインし直してから、もう一度お試しください。" };

  const store = getSlackDmStore();
  if (!store) return { success: false, error: "いま設定を変えられません。時間をおいて再度お試しください。" };

  try {
    await store.setSlackDmEnabled(user.id, enabled, new Date());
    const now = await store.isSlackDmEnabled(user.id);
    console.log("[member-mail] slack dm settings updated", { enabled: now, source: "account" });
    return { success: true, enabled: now };
  } catch (error) {
    console.error("[member-mail] slack dm settings update failed:", error instanceof Error ? error.message : "unknown");
    return { success: false, error: "設定の保存に失敗しました。時間をおいて再度お試しください。" };
  }
}
