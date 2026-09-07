-- =============================================================================
-- みんなの掲示板：ユーザーごとの投稿数・コメント数（補助テーブル）
-- 作成日: 2026-07-15
-- 関連: rebono/issues/掲示板：ユーザー投稿コメント数の保存.md (#149)
-- 設計: 1ユーザー1行。真実は Sanity（投稿）/ Supabase（コメント）本体にあり、
--       これはお祝い・実績等に使う補助集計テーブル（ズレたら再集計できる）。
--       書き込みはサーバー（service role）のみ。RLS は SELECT を本人に限定する。
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.board_user_stats (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  post_count int NOT NULL DEFAULT 0,
  comment_count int NOT NULL DEFAULT 0,
  first_posted_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.board_user_stats IS 'みんなの掲示板：ユーザーごとの投稿数・コメント数の補助集計（service role のみが書き込む）';

-- -----------------------------------------------------------------------------
-- RLS: SELECT は本人のみ。INSERT/UPDATE/DELETE ポリシーは作らない
--      （= authenticated からは書き込み不可。service role がバイパスして書く）。
-- -----------------------------------------------------------------------------
ALTER TABLE public.board_user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can read own stats"
  ON public.board_user_stats
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- -----------------------------------------------------------------------------
-- adjust_board_user_stats: 投稿数・コメント数を1文の upsert increment で増減する。
--   - 行が無ければ初期値0から delta を適用して INSERT
--   - post_count / comment_count は 0 未満にしない（greatest(0, ...)）
--   - p_set_first_posted=true かつ first_posted_at が null のとき now() を設定
--   - 戻り値は更新後の post_count（初投稿判定用。0→1 のとき呼び出し側で祝う）
-- SECURITY DEFINER にはしない（service role からのみ呼ぶ前提。RLS を跨がない）。
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.adjust_board_user_stats(
  p_user_id uuid,
  p_post_delta int,
  p_comment_delta int,
  p_set_first_posted boolean
)
RETURNS int
LANGUAGE plpgsql
AS $$
DECLARE
  v_post_count int;
BEGIN
  INSERT INTO public.board_user_stats AS s (
    user_id, post_count, comment_count, first_posted_at, updated_at
  )
  VALUES (
    p_user_id,
    GREATEST(0, p_post_delta),
    GREATEST(0, p_comment_delta),
    CASE WHEN p_set_first_posted AND p_post_delta > 0 THEN now() ELSE NULL END,
    now()
  )
  ON CONFLICT (user_id) DO UPDATE SET
    post_count = GREATEST(0, s.post_count + p_post_delta),
    comment_count = GREATEST(0, s.comment_count + p_comment_delta),
    first_posted_at = CASE
      WHEN s.first_posted_at IS NULL AND p_set_first_posted AND p_post_delta > 0
        THEN now()
      ELSE s.first_posted_at
    END,
    updated_at = now()
  RETURNING s.post_count INTO v_post_count;

  RETURN v_post_count;
END;
$$;

COMMENT ON FUNCTION public.adjust_board_user_stats IS 'board_user_stats を1文で upsert increment（0未満にしない・初投稿時刻を設定・更新後 post_count を返す）';
