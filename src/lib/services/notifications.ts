"use server";

import { createClient } from "@/lib/supabase/server";
import type { NotificationItem, NotificationType } from "@/types/notification";

/**
 * 汎用通知システム（#160 S1）：読み取り + 既読化の Server Action 群。
 *
 * - 読み取り（getUnreadCount / getRecentNotifications）と既読化（markAllAsRead）は
 *   いずれもユーザー本人の JWT クライアントで行う。RLS が recipient_id = auth.uid() で
 *   絞るため、他人の通知は見えない / 更新できない。
 * - 通知の「作成」は service_role 経由のため別モジュール（notifications-create.ts, server-only）
 *   に置く。こちらを Server Action として公開すると recipient/actor の詐称が可能になるため。
 */

const NOTIFICATION_COLUMNS =
  "id, actor_name, actor_avatar_url, type, entity_type, entity_id, link_url, payload, read_at, created_at";

type NotificationRow = {
  id: string;
  actor_name: string | null;
  actor_avatar_url: string | null;
  type: string;
  entity_type: string;
  entity_id: string;
  link_url: string;
  payload: Record<string, unknown> | null;
  read_at: string | null;
  created_at: string;
};

function rowToItem(r: NotificationRow): NotificationItem {
  return {
    id: r.id,
    actorName: r.actor_name,
    actorAvatarUrl: r.actor_avatar_url,
    type: r.type as NotificationType,
    entityType: r.entity_type,
    entityId: r.entity_id,
    linkUrl: r.link_url,
    payload: r.payload,
    readAt: r.read_at,
    createdAt: r.created_at,
  };
}

/**
 * 未読件数を返す（Header の未読バッジ用）。失敗時は 0 を返し UI をクラッシュさせない。
 */
export async function getUnreadCount(userId: string): Promise<number> {
  if (!userId) return 0;
  const supabase = await createClient();
  const { count, error } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("[getUnreadCount]", error);
    return 0;
  }
  return count ?? 0;
}

/**
 * 直近の通知一覧を返す（Dropdown 用）。RLS が recipient_id で絞るため
 * ユーザー本人の JWT クライアントで良い。失敗時は空配列。
 */
export async function getRecentNotifications(
  userId: string,
  limit = 10,
): Promise<NotificationItem[]> {
  if (!userId) return [];
  const safeLimit = Math.min(Math.max(limit, 1), 50);
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("notifications")
    .select(NOTIFICATION_COLUMNS)
    .eq("recipient_id", userId)
    .order("created_at", { ascending: false })
    .limit(safeLimit);

  if (error) {
    console.error("[getRecentNotifications]", error);
    return [];
  }
  return ((data as NotificationRow[]) ?? []).map(rowToItem);
}

/**
 * 未読の通知を全て既読化する（Dropdown を開いたときに呼ぶ）。
 * 本人の JWT クライアントで UPDATE。RLS（recipient_id = auth.uid()）で本人行のみ更新される。
 */
export async function markAllAsRead(
  userId: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!userId) return { ok: false, error: "ユーザーが特定できません" };
  const supabase = await createClient();
  const { error } = await supabase
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("recipient_id", userId)
    .is("read_at", null);

  if (error) {
    console.error("[markAllAsRead]", error);
    return { ok: false, error: "既読処理に失敗しました" };
  }
  return { ok: true };
}
