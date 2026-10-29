-- =============================================================================
-- 会員の活動ログ（member_activity_events）に「メールのリンクから来た」を足す
-- 作成日: 2026-10-29
-- 関連: rebono/issues/264 §6-1（来訪の記録に ?from= が残らない問題の直し）/ 268 S1
-- 追加:
--   email_click … ?from=email_xxx の付いたURLを開いた（ログイン中のみ）。
--                 meta に from（例: email_weekly）。path 列に開いたページのパス（クエリなし）。
--                 site_visit と違い1日1回に絞らない（その日すでに来ていた人がメールを押しても残る）。
-- 既存の種類はそのまま。表・インデックス・RLS・権限は変えない。
-- アプリ側の一覧: src/lib/activity-utils.ts の ACTIVITY_EVENT_TYPES（この制約と一致させる）
--
-- ★書き方の注意: 別ブランチ（#262 feature/video-play-tracking）も同じ制約を作り直して
--   video_play / video_progress / video_complete を足している。どちらが先に入っても
--   相手の種類を消さないよう、「今の制約にある種類 + email_click」で作り直す。
--   （#262 側のマイグレーションは全体を固定の一覧で作り直すので、こちらより後に当てると
--    email_click が消えて失敗する。#262 を後でマージするときは、その一覧に email_click を足すこと）
-- =============================================================================

DO $$
DECLARE
  v_def text;
  v_types text[];
BEGIN
  SELECT pg_get_constraintdef(c.oid)
    INTO v_def
    FROM pg_constraint c
   WHERE c.conname = 'member_activity_events_event_type_check'
     AND c.conrelid = 'public.member_activity_events'::regclass;

  SELECT ARRAY(
    SELECT DISTINCT t
      FROM unnest(
        COALESCE(
          ARRAY(SELECT m[1] FROM regexp_matches(COALESCE(v_def, ''), '''([a-z_]+)''', 'g') AS m),
          '{}'::text[]
        )
        || ARRAY[
          'site_visit', 'article_view', 'article_complete', 'lesson_view', 'questions_view',
          'community_join_click', 'success_next_click', 'pricing_cta_click', 'home_click', 'event_view',
          'email_click'
        ]
      ) AS t
     ORDER BY t
  ) INTO v_types;

  ALTER TABLE public.member_activity_events
    DROP CONSTRAINT IF EXISTS member_activity_events_event_type_check;

  EXECUTE format(
    'ALTER TABLE public.member_activity_events ADD CONSTRAINT member_activity_events_event_type_check CHECK (event_type = ANY (%L::text[]))',
    v_types
  );
END;
$$;
