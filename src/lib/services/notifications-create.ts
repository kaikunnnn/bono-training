import "server-only";

import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";
import type { NotificationType } from "@/types/notification";
import { reportNotificationError } from "@/lib/services/notifications-monitoring";

/**
 * 汎用通知の作成（service_role で INSERT）モジュール（#160 S1）。
 *
 * 位置づけ:
 * - notifications テーブルは RLS で「受信者本人の SELECT/UPDATE」のみ許可し、INSERT ポリシーを
 *   持たない。作成は service_role で RLS を bypass する（board-user-stats.ts と同じパターン）。
 * - あえて "use server" ではなく server-only にしている。createNotification を Server Action
 *   として公開すると、クライアントが任意の recipient / actor を詐称して通知を作れてしまうため。
 *   サーバー側（questions.ts 等の Server Action 内）からのみ import して使う。
 *
 * 呼び出しは全てベストエフォート（fire-and-forget）。失敗しても本処理（コメント投稿など）は
 * 成功させる。呼び出し側で try/catch する必要はなく、この関数内で握って console.error する
 * （既存 sendCommentSlackNotification / adjustBoardUserStats と同じ粒度）。
 */

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export interface CreateNotificationInput {
  /** 受信者（通知される本人） */
  recipientId: string;
  /** 通知を発生させた人（コメント投稿者など） */
  actorId: string;
  /** actor 表示名（作成時 snapshot） */
  actorName: string | null;
  /** actor アバターURL（作成時 snapshot） */
  actorAvatarUrl: string | null;
  type: NotificationType;
  /** polymorphic 参照の種別（'question' / 'comment' など） */
  entityType: string;
  /** polymorphic 参照の ID（Sanity _id or uuid::text） */
  entityId: string;
  /** 遷移先 URL（作成時に slug 解決済みで snapshot） */
  linkUrl: string;
  /** 表示用の補足情報 */
  payload?: Record<string, unknown> | null;
}

/**
 * 通知を1件作成する（ベストエフォート）。
 *
 * - 自己通知抑止: recipientId === actorId なら何もせず return。
 * - 重複抑止: 同一 (type, entity_id, actor_id, recipient_id) の「未読」通知が既にあれば skip。
 *   （リアクション連打などで未読通知が積み上がるのを防ぐ。既読になっていれば再度作成される）
 */
export async function createNotification(
  input: CreateNotificationInput,
): Promise<void> {
  // 自己通知は作らない
  if (input.recipientId === input.actorId) return;

  if (!input.recipientId || !input.actorId) {
    void reportNotificationError({
      stage: "missing_recipient",
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      recipientId: input.recipientId,
      actorId: input.actorId,
      message: "missing recipientId/actorId",
    });
    return;
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    void reportNotificationError({
      stage: "config_missing",
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      recipientId: input.recipientId,
      actorId: input.actorId,
      message: "Supabase service config missing",
    });
    return;
  }

  try {
    const service = createSupabaseServiceClient(supabaseUrl, supabaseServiceKey);

    // オプトアウト判定: 受信者がこの種別の通知をオフにしていたら作らない（DBに記録も残さない）。
    // notification_type_preferences は「オフ時のみ enabled=false 行を持つ」ため、
    // 行が無い / enabled=true なら従来通り作成する。
    // 取得失敗時はフェイルオープン（インフラ障害で通知を落とさない。重複抑止と同じ方針）。
    const { data: pref, error: prefError } = await service
      .from("notification_type_preferences")
      .select("enabled")
      .eq("user_id", input.recipientId)
      .eq("type", input.type)
      .maybeSingle();

    if (prefError) {
      void reportNotificationError({
        stage: "preference_select",
        type: input.type,
        entityType: input.entityType,
        entityId: input.entityId,
        recipientId: input.recipientId,
        actorId: input.actorId,
        error: prefError,
      });
      // 判定に失敗しても作成は試みる（設定取得障害 < 通知取りこぼしの回避を優先）
    } else if (pref && pref.enabled === false) {
      return;
    }

    // 重複抑止: 同一 (type, entity_id, actor_id, recipient_id) の未読通知が既にあれば作らない
    const { data: existing, error: selectError } = await service
      .from("notifications")
      .select("id")
      .eq("type", input.type)
      .eq("entity_id", input.entityId)
      .eq("actor_id", input.actorId)
      .eq("recipient_id", input.recipientId)
      .is("read_at", null)
      .limit(1)
      .maybeSingle();

    if (selectError) {
      void reportNotificationError({
        stage: "dedup_select",
        type: input.type,
        entityType: input.entityType,
        entityId: input.entityId,
        recipientId: input.recipientId,
        actorId: input.actorId,
        error: selectError,
      });
      // 判定に失敗しても作成は試みる（重複 < 通知取りこぼしの回避を優先）
    } else if (existing) {
      return;
    }

    const { error: insertError } = await service.from("notifications").insert({
      recipient_id: input.recipientId,
      actor_id: input.actorId,
      actor_name: input.actorName,
      actor_avatar_url: input.actorAvatarUrl,
      type: input.type,
      entity_type: input.entityType,
      entity_id: input.entityId,
      link_url: input.linkUrl,
      payload: input.payload ?? null,
    });

    if (insertError) {
      // 重大: 通知の完全な取りこぼし。運用Slackへ通知（fetch完了を待つ）。
      await reportNotificationError({
        stage: "insert",
        type: input.type,
        entityType: input.entityType,
        entityId: input.entityId,
        recipientId: input.recipientId,
        actorId: input.actorId,
        error: insertError,
      });
    }
  } catch (error) {
    await reportNotificationError({
      stage: "threw",
      type: input.type,
      entityType: input.entityType,
      entityId: input.entityId,
      recipientId: input.recipientId,
      actorId: input.actorId,
      error,
    });
  }
}
