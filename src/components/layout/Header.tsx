import 'server-only'
import { createClient } from "@/lib/supabase/server";
import { HeaderClient } from "./HeaderClient";

/**
 * ヘッダーコンポーネント（Server Component）
 * サーバーサイドでユーザー情報を取得し、クライアントコンポーネントに渡す
 */
export async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    />
  );
}
