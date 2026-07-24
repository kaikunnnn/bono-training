-- =============================================================================
-- みんなの掲示板：一覧用コメント集計View（#153）
-- 作成日: 2026-07-21
-- 関連: rebono/issues/掲示板：一覧の速度改善とコメント者アイコン表示.md (#153)
-- 目的: 一覧カードで使う「コメント数・最新コメント時刻・直近コメント者（最大3人）」を
--       1本のViewにまとめ、Supabaseへの3クエリ（comment_counts / 全コメント行取得）を
--       1クエリに統合して転送量を削減する。
-- 前提: 20260622_create_question_comments_and_reactions.sql の question_comment_counts /
--       question_reaction_counts と同じく WITH (security_invoker = true) を付与し、
--       ベーステーブル question_comments の RLS（メンバーのみSELECT可）をそのまま伝播させる。
--       → 非メンバー / 未ログインでは 0 行になり、コメント者アイコンも出ない。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- question_comment_summaries：質問ごとの集計 + 直近コメント者（重複除去・最大3人）
-- 出力列:
--   question_id          : Sanity 質問 _id
--   comment_count        : 論理削除を除いたコメント数
--   latest_commented_at  : 最新コメントの created_at（浮上ソート用）
--   recent_commenters    : 直近コメント者の jsonb 配列（最新順・同一ユーザーは1件に集約・最大3人）
--                          各要素 = { "user_id": ..., "author_name": ..., "author_avatar_url": ... }
--
-- 実装: window関数2段。
--   1) dedup CTE: PARTITION BY (question_id, user_id) ORDER BY created_at DESC で
--      同一ユーザーの最新コメント1件だけに絞る（重複除去）。
--   2) ranked CTE: 絞り込んだ行を PARTITION BY question_id ORDER BY created_at DESC で
--      rank付けし、rank <= 3 のみ jsonb_agg（created_at 昇順で agg し、配列先頭が最新になるよう
--      ranked では DESC の rank を採用）。
--   ※ DISTINCT ON 単独では「質問ごとに複数人」を1行に畳めないため使わない。
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.question_comment_summaries
WITH (security_invoker = true) AS
WITH dedup AS (
  -- 同一 (question_id, user_id) は最新コメント1件のみに絞る（重複除去）
  SELECT
    question_id,
    user_id,
    author_name,
    author_avatar_url,
    created_at,
    row_number() OVER (
      PARTITION BY question_id, user_id
      ORDER BY created_at DESC
    ) AS rn_user
  FROM public.question_comments
  WHERE deleted_at IS NULL
),
ranked AS (
  -- 各質問内で最新コメント順にランク付け（重複除去済みユーザーに対して）
  SELECT
    question_id,
    user_id,
    author_name,
    author_avatar_url,
    created_at,
    row_number() OVER (
      PARTITION BY question_id
      ORDER BY created_at DESC
    ) AS rn_question
  FROM dedup
  WHERE rn_user = 1
),
counts AS (
  -- コメント数と最新コメント時刻（重複除去前の全行が対象）
  SELECT
    question_id,
    count(*)::int AS comment_count,
    max(created_at) AS latest_commented_at
  FROM public.question_comments
  WHERE deleted_at IS NULL
  GROUP BY question_id
),
top_commenters AS (
  -- 上位3人を最新順（rn_question 昇順）で jsonb 配列に集約。配列先頭が最新コメント者。
  SELECT
    question_id,
    jsonb_agg(
      jsonb_build_object(
        'user_id', user_id,
        'author_name', author_name,
        'author_avatar_url', author_avatar_url
      )
      ORDER BY rn_question
    ) AS recent_commenters
  FROM ranked
  WHERE rn_question <= 3
  GROUP BY question_id
)
SELECT
  c.question_id,
  c.comment_count,
  c.latest_commented_at,
  COALESCE(t.recent_commenters, '[]'::jsonb) AS recent_commenters
FROM counts c
LEFT JOIN top_commenters t ON t.question_id = c.question_id;

COMMENT ON VIEW public.question_comment_summaries IS
  '質問ごとのコメント数 / 最新コメント時刻 / 直近コメント者（重複除去・最新順・最大3人のjsonb配列）。一覧カード用（#153）';

-- View自体はベーステーブルの RLS が伝播するため authenticated に grant（既存Viewと同じパターン）
GRANT SELECT ON public.question_comment_summaries TO authenticated;
