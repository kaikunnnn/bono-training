import 'server-only'
import { getCachedUser } from "@/lib/supabase/server";
import { getUnreadCount } from "@/lib/services/notifications";
import { HeaderClient } from "./HeaderClient";

/**
 * ヘッダーコンポーネント（Server Component）
 * サーバーサイドでユーザー情報を取得し、クライアントコンポーネントに渡す。
 *
 * ユーザー取得は getCachedUser（リクエストスコープでメモ化）を使い、
 * 他の Server Component と認証往復を共有する（rules/09 パフォーマンス）。
 */
export async function Header() {
  const user = await getCachedUser();

  // ログイン中のみ未読件数を取得（未ログイン時はベル自体を出さない）
  const unreadCount = user ? await getUnreadCount(user.id) : 0;

  return (
    <HeaderClient
      user={
        user
          ? {
              id: user.id,
              email: user.email || "",
              avatarUrl: user.user_metadata?.avatar_url,
            }
          : null
      }
      unreadCount={unreadCount}
    />
  );
}
