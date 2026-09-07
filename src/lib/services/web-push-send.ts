import "server-only";

import webpush from "web-push";
import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";

/**
 * Web Push 送信モジュール（#160 Web Push, server-only）。
 *
 * - service_role で push_subscriptions を引き、そのユーザーの全端末へ送る。
 * - 404/410（購読が失効・消滅）は当該購読を削除する（stale pruning）。
 * - 全体をベストエフォートにする: 送信の失敗が本処理（通知作成/コメント投稿など）を
 *   壊してはいけない。関数は throw しない（内部で握って console.error する）。
 *
 * VAPID subject は必ず mailto: を使う。https://localhost を subject にすると Safari の
 * push endpoint が BadJwtToken を返すため（出典: web-push npm README）。
 */

/** 送信内容（SW側の payload と対応） */
export interface WebPushPayload {
  title: string;
  body: string;
  url: string;
}

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

// VAPID の連絡先。push サービスが問題時に連絡するための subject（mailto: 必須）。
const VAPID_SUBJECT = "mailto:info@bo-no.design";

let vapidConfigured = false;
function ensureVapidConfigured(): boolean {
  if (vapidConfigured) return true;
  if (!vapidPublicKey || !vapidPrivateKey) return false;
  webpush.setVapidDetails(VAPID_SUBJECT, vapidPublicKey, vapidPrivateKey);
  vapidConfigured = true;
  return true;
}

interface SubscriptionRow {
  id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
}

/**
 * 指定ユーザーの全購読端末へ Web Push を送る（ベストエフォート）。
 * 失敗しても throw しない。
 */
export async function sendWebPush(
  userId: string,
  payload: WebPushPayload,
): Promise<void> {
  try {
    if (!userId) return;
    if (!supabaseUrl || !supabaseServiceKey) return;
    if (!ensureVapidConfigured()) {
      // VAPID 未設定（env 未投入）。push は無効だが本処理は止めない。
      return;
    }

    const service = createSupabaseServiceClient(supabaseUrl, supabaseServiceKey);

    const { data, error } = await service
      .from("push_subscriptions")
      .select("id, endpoint, p256dh, auth")
      .eq("user_id", userId);

    if (error) {
      console.error("[sendWebPush] select subscriptions failed:", error);
      return;
    }

    const subs = (data ?? []) as SubscriptionRow[];
    if (subs.length === 0) return;

    const body = JSON.stringify(payload);

    await Promise.all(
      subs.map(async (sub) => {
        try {
          await webpush.sendNotification(
            {
              endpoint: sub.endpoint,
              keys: { p256dh: sub.p256dh, auth: sub.auth },
            },
            body,
          );
        } catch (err) {
          const statusCode = (err as { statusCode?: number })?.statusCode;
          // 404/410 = 購読が失効・消滅 → 削除（stale pruning）
          if (statusCode === 404 || statusCode === 410) {
            const { error: delError } = await service
              .from("push_subscriptions")
              .delete()
              .eq("id", sub.id);
            if (delError) {
              console.error("[sendWebPush] prune failed:", delError);
            }
          } else {
            console.error(
              "[sendWebPush] sendNotification failed:",
              statusCode,
              err,
            );
          }
        }
      }),
    );
  } catch (err) {
    console.error("[sendWebPush] unexpected error:", err);
  }
}
