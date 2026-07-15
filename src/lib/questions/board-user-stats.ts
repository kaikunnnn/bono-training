import "server-only";

import { createClient as createSupabaseServiceClient } from "@supabase/supabase-js";

/**
 * みんなの掲示板：ユーザーごとの投稿数・コメント数（board_user_stats）を
 * service role で増減する補助集計モジュール（#149）。
 *
 * 位置づけ:
 * - 真実は Sanity（投稿）/ Supabase question_comments（コメント）本体にある。
 *   これは「お祝い・実績」等に使う補助テーブルで、ズレたら再集計できる前提。
 * - RLS は本人 SELECT のみ許可。書き込みは service role でバイパスする。
 *
 * 呼び出しは全てベストエフォート（失敗しても本処理＝投稿/コメントは成功させる）。
 * 呼び出し側で try/catch する必要はなく、この関数内で握って console.error する。
 */

const supabaseUrl =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface AdjustResult {
  ok: boolean;
  /** 更新後の post_count（初投稿判定に使う）。失敗時は undefined。 */
  postCount?: number;
}

/**
 * board_user_stats を service role で upsert increment する。
 *
 * - 行が無ければ初期値0から delta を適用して INSERT。
 * - post_count / comment_count は 0 未満にしない（greatest(0, ...)）。
 * - postDelta > 0 かつ first_posted_at が null の場合のみ now() を設定する。
 * - 戻り値に更新後の post_count を含める（初投稿判定用）。
 *
 * 競合（同時INSERT）に強くするため単一の SQL（INSERT ... ON CONFLICT DO UPDATE）で行う。
 * @param userId 対象ユーザー
 * @param deltas postDelta / commentDelta（省略時 0）
 */
export async function adjustBoardUserStats(
  userId: string,
  deltas: { postDelta?: number; commentDelta?: number },
): Promise<AdjustResult> {
  const postDelta = deltas.postDelta ?? 0;
  const commentDelta = deltas.commentDelta ?? 0;

  if (!userId) {
    console.error("[adjustBoardUserStats] missing userId");
    return { ok: false };
  }
  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("[adjustBoardUserStats] Supabase service config missing");
    return { ok: false };
  }

  try {
    const service = createSupabaseServiceClient(supabaseUrl, supabaseServiceKey);

    // INSERT の初期値は greatest(0, delta)。UPDATE 側も greatest(0, 現値 + delta)。
    // first_posted_at は「投稿を増やす操作」で既存が null のときだけ now() を入れる。
    const setFirstPostedOnInsert = postDelta > 0;
    const { data, error } = await service.rpc("adjust_board_user_stats", {
      p_user_id: userId,
      p_post_delta: postDelta,
      p_comment_delta: commentDelta,
      p_set_first_posted: setFirstPostedOnInsert,
    });

    if (error) {
      console.error("[adjustBoardUserStats] rpc failed:", error);
      return { ok: false };
    }

    // rpc は更新後の post_count（int）を返す
    const postCount = typeof data === "number" ? data : undefined;
    return { ok: true, postCount };
  } catch (error) {
    console.error("[adjustBoardUserStats] threw:", error);
    return { ok: false };
  }
}
