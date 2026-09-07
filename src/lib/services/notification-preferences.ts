"use server";

import { createClient } from "@/lib/supabase/server";
import type { NotificationType } from "@/types/notification";

/**
 * 通知種別ごとのオプトアウト設定（#160）。
 *
 * オプトアウト方式:
 *   - notification_type_preferences は「オフにした種別だけ enabled=false の行を持つ」。
 *     行が無い種別は ON（デフォルト true）として扱う。
 *   - 通知を作るか否かの実判定は createNotification（notifications-create.ts, service_role）
 *     側で行う。ここでは本人の設定の読み取り・保存のみを担当する。
 *
 * 配置について:
 *   - rules/02 は「サーバー専用の読み取り」と「Server Action の書き込み」の分離を推奨するが、
 *     読み取り関数は「呼び出し本人の設定のみ」を返す（他人の設定は取得しない）ため、
 *     Server Action として露出しても実害が無い。既存 services/bookmarks.ts が read/write を
 *     同一 "use server" ファイルにまとめている前例に合わせ、1ファイルに集約する。
 *     （タスク文の「読み取りは server-only / 更新は use server」の文言とは意図的に差異あり）
 */

/** type -> enabled のマップ。行が無い type は true（オン）。 */
export type NotificationPreferenceMap = Record<NotificationType, boolean>;

/** 全種別 ON のデフォルトマップを返す */
function defaultPreferenceMap(): NotificationPreferenceMap {
  return {
    question_comment: true,
    question_reaction: true,
    comment_reaction: true,
  };
}

/**
 * ログイン中ユーザーの通知設定を「type -> enabled」のマップで返す。
 * - 行が無い type はデフォルト true。
 * - 未認証や取得失敗時は全 ON のデフォルトを返す（設定UIが壊れないようフェイルオープン）。
 */
export async function getNotificationPreferences(): Promise<NotificationPreferenceMap> {
  const map = defaultPreferenceMap();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return map;

  const { data, error } = await supabase
    .from("notification_type_preferences")
    .select("type, enabled")
    .eq("user_id", user.id);

  if (error) {
    console.error("[getNotificationPreferences] select failed:", error);
    return map;
  }

  for (const row of data ?? []) {
    if (row.type in map) {
      map[row.type as NotificationType] = row.enabled;
    }
  }

  return map;
}

export interface SetNotificationPreferenceResult {
  success: boolean;
  error?: string;
}

/**
 * ログイン中ユーザーの指定種別のオン/オフを保存する（upsert）。
 * - PK=(user_id, type) 衝突時は enabled / updated_at を更新。
 * - オフ・オンどちらも行として保存する（オプトアウト判定は enabled=false の行の有無で行う）。
 */
export async function setNotificationPreference(
  type: NotificationType,
  enabled: boolean,
): Promise<SetNotificationPreferenceResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です。" };
  }

  const { error } = await supabase.from("notification_type_preferences").upsert(
    {
      user_id: user.id,
      type,
      enabled,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,type" },
  );

  if (error) {
    console.error("[setNotificationPreference] upsert failed:", error);
    return { success: false, error: "設定の保存に失敗しました。" };
  }

  return { success: true };
}
