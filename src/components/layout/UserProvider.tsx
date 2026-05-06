import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * サーバーサイドでユーザー情報を取得する
 * Suspense boundary 内で呼び出すことで、
 * ページコンテンツの描画をブロックしない
 */
export async function UserProvider(): Promise<{
  id: string;
  email: string;
} | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    return user
      ? {
          id: user.id,
          email: user.email || "",
        }
      : null;
  } catch {
    return null;
  }
}
