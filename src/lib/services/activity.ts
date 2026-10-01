"use server";

import { createClient } from "@/lib/supabase/server";
import {
  buildActivityRow,
  type RecordActivityInput,
} from "@/lib/activity-utils";

/** Postgres の一意制約違反 */
const UNIQUE_VIOLATION = "23505";

/**
 * 会員の活動ログ（member_activity_events）を1行記録する（#213 A1）。
 *
 * - Client Component の実操作・マウント時からのみ呼ぶ（サーバー描画/Link先読みでは呼ばない）
 * - 未ログインは何もしない（no-op）
 * - event_type は固定8種のみ。不正入力は記録せずログだけ残す
 * - site_visit は 1人1日1回（部分一意インデックス）。重複は成功扱い（insert-ignore）
 * - 呼び出し側の体験を壊さないよう、決して throw しない
 *
 * 注意: insert に .select() を付けない（SELECT ポリシーが無いため RETURNING が失敗する）。
 */
export async function recordActivity(input: RecordActivityInput): Promise<void> {
  try {
    const row = buildActivityRow(input);
    if (!row) {
      console.warn("[activity] invalid input, skipped:", input);
      return;
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from("member_activity_events")
      .insert({ ...row, user_id: user.id });

    if (error) {
      if (row.event_type === "site_visit" && error.code === UNIQUE_VIOLATION) {
        return; // 今日の来訪は記録済み
      }
      console.error("[activity] insert failed:", row.event_type, error);
    }
  } catch (error) {
    console.error("[activity] record error:", error);
  }
}
