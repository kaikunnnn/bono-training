-- =============================================================================
-- 会員の活動ログ（member_activity_events）に「記事を読んだ」（article_read）を足す
-- 作成日: 2026-10-31
-- 関連: rebono/issues #262（2026-10-31 オーナー決定「記事を進めている」の3つ目）
-- 追加:
--   article_read … 記事本文の70%まで届いた＋そのページに30秒以上（タブが裏の時間は除く）。
--                  1ページ表示につき1回。article_id / lesson_id 列に記事・レッスンの ID、
--                  meta に slug / percent(70) / max_percent / seconds
-- 既存の種類はそのまま。表・インデックス・RLS・権限は変えない。
-- アプリ側の一覧: src/lib/activity-utils.ts の ACTIVITY_EVENT_TYPES（この制約と一致させる）
--
-- ★書き方の注意: 別ブランチ（#264/#268 feature/member-mail-foundation, PR #284）も同じ制約を
--   作り直して email_click を足している。どちらが先に入っても相手の種類を消さないよう、
--   PR #284 と同じく「今の制約にある種類 + 既知の種類 + article_read」で作り直す（何度当てても同じ結果）。
--   今の制約の読み取りは2つの書き方に対応する:
--     ARRAY['a'::text, ...] 形式（IN (...) で作ったとき）と '{a,b}'::text[] 形式（配列リテラルで作ったとき）
--   作り直した制約は ARRAY['a'::text, ...] 形式にする（次に当てるマイグレーションが読める形）。
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
          ARRAY(SELECT m[1] FROM regexp_matches(COALESCE(v_def, ''), '(?<=[''{,])([a-z_]+)(?=[''},])', 'g') AS m),
          '{}'::text[]
        )
        || ARRAY[
          'site_visit', 'article_view', 'article_complete', 'lesson_view', 'questions_view',
          'community_join_click', 'success_next_click', 'pricing_cta_click', 'home_click', 'event_view',
          'video_play', 'video_progress', 'video_complete',
          'article_read'
        ]
      ) AS t
     ORDER BY t
  ) INTO v_types;

  ALTER TABLE public.member_activity_events
    DROP CONSTRAINT IF EXISTS member_activity_events_event_type_check;

  EXECUTE format(
    'ALTER TABLE public.member_activity_events ADD CONSTRAINT member_activity_events_event_type_check CHECK (event_type = ANY (ARRAY[%s]))',
    (SELECT string_agg(quote_literal(t) || '::text', ', ' ORDER BY t) FROM unnest(v_types) AS t)
  );
END;
$$;
