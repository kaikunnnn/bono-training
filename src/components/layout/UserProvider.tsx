import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface UserProviderResult {
  user: { id: string; email: string } | null;
  /**
   * 認証エラー（refresh token 失効等）で user が取れなかった場合 true。
   * ネットワーク障害など一時的な失敗では false のまま（正常な cookie を
   * 誤って掃除しないため。#137-C）
   */
  invalidSession: boolean;
}

/**
 * サーバーサイドでユーザー情報を取得する
 * Suspense boundary 内で呼び出すことで、
 * ページコンテンツの描画をブロックしない
 */
export async function UserProvider(): Promise<UserProviderResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (user) {
      return {
        user: { id: user.id, email: user.email || "" },
        invalidSession: false,
      };
    }

    // 400/401/403 = トークン・セッション自体が無効（stale cookie）。
    // それ以外（5xx や AuthRetryableFetchError）は一時的失敗として扱う
    const invalidSession =
      !!error && typeof error.status === "number" && [400, 401, 403].includes(error.status);

    return { user: null, invalidSession };
  } catch {
    return { user: null, invalidSession: false };
  }
}
