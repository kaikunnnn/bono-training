import "server-only";
import { cache } from "react";
import { getCachedAuth } from "@/lib/supabase/server";
import { traceServerStep } from "@/lib/performance/server-trace";

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
 * サーバーサイドのユーザー情報をレイアウト向けに絞る。
 * ページ/サービスと同じgetCachedAuthを使い、認証の往復を重複させない。
 * レイアウトが認証を待つ既存の挙動は変えない。
 */
export const UserProvider = cache(async (): Promise<UserProviderResult> => {
  return traceServerStep("layout.user_provider", async () => {
    try {
      const { user, invalidSession } = await getCachedAuth();

      if (user) {
        return {
          user: { id: user.id, email: user.email || "" },
          invalidSession: false,
        };
      }

      return { user: null, invalidSession };
    } catch {
      return { user: null, invalidSession: false };
    }
  });
});
