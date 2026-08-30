"use server";

import { createClient } from "@/lib/supabase/server";
import { client as getClient } from "@/lib/sanity";

// ============================================
// 掲示板の新着ドット（board_views）
// ============================================
//
// 「新着」= 新しい質問(スレッド)が立ったら。コメントは含めない。
// 判定: 最新質問の publishedAt（Sanity・1件・キャッシュ）> 自分の last_seen_at。
// 消す: /questions 一覧を開いたら recordBoardSeen() で last_seen_at = now()。
// 対象: ログイン済みユーザーのみ（未ログインはドットなし）。

/**
 * 掲示板の「最新の活動時刻」= 最新質問の publishedAt を Sanity から1件だけ取得する。
 *
 * 掲示板は過去に Sanity API 枠超過の経緯があるため、必ずキャッシュする。
 * questions.ts の一覧クエリと同じ流儀（tag "questions" / revalidate 60）に合わせ、
 * 新規投稿時の revalidateTag("questions") で無効化される。
 *
 * @returns 最新質問の publishedAt（ISO 文字列）。質問が1件も無ければ null。
 */
export async function getLatestBoardActivityAt(): Promise<string | null> {
  try {
    const query = `*[_type == "question" && defined(publishedAt)] | order(publishedAt desc)[0].publishedAt`;
    const latest = await getClient().fetch<string | null>(
      query,
      {},
      { next: { revalidate: 60, tags: ["questions"] } },
    );
    return latest ?? null;
  } catch (error) {
    console.error("[getLatestBoardActivityAt]", error);
    return null;
  }
}

/**
 * 指定ユーザーに掲示板の未読（新着）があるかを返す。
 *
 * - 最新質問 publishedAt > 自分の last_seen_at → 未読(true)
 * - board_views に行が無い → まだ一度も開いていない＝未読(true)（ただし質問が存在する場合のみ）
 * - 質問が1件も無い → false（見るものが無い）
 *
 * レイアウト（全ページ）から呼ばれるため、失敗しても例外を投げず false を返してサイドバーを守る。
 */
export async function hasUnseenBoard(userId: string): Promise<boolean> {
  try {
    const latestActivityAt = await getLatestBoardActivityAt();
    // 掲示板に質問が無ければ新着も無い
    if (!latestActivityAt) return false;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("board_views")
      .select("last_seen_at")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      console.error("[hasUnseenBoard] select error:", error);
      return false;
    }

    // 行が無ければ一度も開いていない＝未読
    const lastSeenAt = (data?.last_seen_at as string | null) ?? null;
    if (!lastSeenAt) return true;

    // ISO 文字列は辞書順 = 時系列順
    return latestActivityAt > lastSeenAt;
  } catch (error) {
    console.error("[hasUnseenBoard]", error);
    return false;
  }
}

/**
 * 掲示板一覧（/questions）の閲覧を記録する（last_seen_at = now() で upsert）。
 *
 * viewHistory.recordViewHistory と同型：認証ユーザーが無ければ何もしない。
 * 失敗は console.error で握り、UI は壊さない（ベストエフォート）。
 * クライアント側 effect（BoardSeenRecorder）から1回呼ぶ想定。
 */
export async function recordBoardSeen(): Promise<void> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    const now = new Date().toISOString();
    const { error } = await supabase.from("board_views").upsert(
      {
        user_id: user.id,
        last_seen_at: now,
        updated_at: now,
      },
      { onConflict: "user_id" },
    );

    if (error) {
      console.error("[recordBoardSeen] upsert error:", error);
    }
  } catch (error) {
    console.error("[recordBoardSeen]", error);
  }
}
