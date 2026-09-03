"use server";

import { createClient } from "@/lib/supabase/server";
import { sendWebPush } from "@/lib/services/web-push-send";

/**
 * Web Push 購読の保存/削除（#160 Web Push）。
 *
 * - 本人の authenticated クライアントで操作する（RLS: auth.uid() = user_id）。
 * - クライアントの pushManager.subscribe() で得た PushSubscription を toJSON() した
 *   プレーンオブジェクトを受け取る（生の PushSubscription は RPC 境界を越えられない）。
 */

/** PushSubscription.toJSON() のうち保存に使う形。 */
export interface PushSubscriptionJSON {
  endpoint: string;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
}

export interface PushSubscriptionResult {
  success: boolean;
  error?: string;
}

/**
 * 購読を保存する（endpoint 衝突時は upsert で更新）。
 *
 * 注意（既知の制限）: endpoint はグローバルに UNIQUE だが upsert は本人として実行される。
 * 共有ブラウザで別ユーザーが同じ endpoint を握っている場合、RLS で弾かれて失敗しうる。
 * opt-in ベータの許容範囲として、その場合は汎用エラーを返す。
 */
export async function savePushSubscription(
  sub: PushSubscriptionJSON,
  userAgent?: string | null,
): Promise<PushSubscriptionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です。" };
  }

  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;

  if (!endpoint || !p256dh || !auth) {
    return { success: false, error: "購読情報が不正です。" };
  }

  const { error } = await supabase.from("push_subscriptions").upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: userAgent ?? null,
    },
    { onConflict: "endpoint" },
  );

  if (error) {
    console.error("[savePushSubscription] upsert failed:", error);
    return { success: false, error: "購読の保存に失敗しました。" };
  }

  return { success: true };
}

/**
 * 指定 endpoint の購読を削除する（トグルOFF時）。
 * 自分の行のみ RLS で対象になる。
 */
export async function deletePushSubscription(
  endpoint: string,
): Promise<PushSubscriptionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です。" };
  }

  if (!endpoint) {
    return { success: false, error: "購読情報が不正です。" };
  }

  const { error } = await supabase
    .from("push_subscriptions")
    .delete()
    .eq("endpoint", endpoint);

  if (error) {
    console.error("[deletePushSubscription] delete failed:", error);
    return { success: false, error: "購読の解除に失敗しました。" };
  }

  return { success: true };
}

/**
 * 現在のログインユーザー自身へテスト通知を送る（設定の「テスト送信」ボタン用）。
 * 購読が無い/VAPID未設定なら送信自体は no-op になる（sendWebPush がベストエフォート）。
 */
export async function sendTestPush(): Promise<PushSubscriptionResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "認証が必要です。" };
  }

  await sendWebPush(user.id, {
    title: "テスト通知",
    body: "Web Push が届いています🎉",
    url: "/questions",
  });

  return { success: true };
}
