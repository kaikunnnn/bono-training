-- =============================================================================
-- 会員の活動ログ（member_activity_events）に動画の記録を3つ足す
-- 作成日: 2026-10-27
-- 関連: rebono/issues #262（動画の再生を活動ログに記録する）
-- 追加:
--   video_play      … 記事の動画を最初に再生した（そのページ表示中、記事ごとに1回）
--   video_progress  … 25 / 50 / 75% に到達した（各1回）。meta に percent
--   video_complete  … 90% 以上まで見た、または最後まで再生した（1回）
--   いずれも article_id / lesson_id 列に記事・レッスンの ID を入れる
-- 既存の10種はそのまま。表・インデックス・RLS・権限は変えない。
-- アプリ側の一覧: src/lib/activity-utils.ts の ACTIVITY_EVENT_TYPES（この制約と一致させる）
-- =============================================================================

ALTER TABLE public.member_activity_events
  DROP CONSTRAINT IF EXISTS member_activity_events_event_type_check;

ALTER TABLE public.member_activity_events
  ADD CONSTRAINT member_activity_events_event_type_check CHECK (event_type IN (
    'site_visit',
    'article_view',
    'article_complete',
    'lesson_view',
    'questions_view',
    'community_join_click',
    'success_next_click',
    'pricing_cta_click',
    'home_click',
    'event_view',
    'video_play',
    'video_progress',
    'video_complete'
  ));
