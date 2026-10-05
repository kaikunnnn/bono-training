import "server-only";

/**
 * イベント参加申込（#218）のサーバー専用データ取得。
 * 純粋な定数・検証は `@/lib/events/onsite-registration` にある。
 */
import { createClient } from "@/lib/supabase/server";

export interface MyEventRegistration {
  comment: string;
  updatedAt: string;
}

/**
 * ログイン中ユーザー自身の申込（取り消し済みを除く）を取得する。
 * getEvent の unstable_cache とは別に、リクエストごとに最新を読む。
 * ユーザーのセッション（RLS適用）で読むので、他人の行は返らない。
 * 取得に失敗したときは「未申込」として扱い、ページは描画を続ける（ログのみ）。
 */
export async function getMyEventRegistration(
  eventId: string,
  userId: string,
): Promise<MyEventRegistration | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("event_registrations")
    .select("comment, updated_at")
    .eq("event_id", eventId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    console.error("[getMyEventRegistration] fetch failed:", error);
    return null;
  }
  if (!data) return null;
  return {
    comment: data.comment as string,
    updatedAt: data.updated_at as string,
  };
}
