-- =============================================================================
-- 会員の活動ログ（member_activity_events）に記録の種類を2つ足す
-- 作成日: 2026-10-07
-- 関連: rebono/issues #232（トップとマイページのクリック計測）
-- 追加:
--   home_click  … /top・マイページ（と未ログインの /）で押したもの。
--                 meta に surface / section / item_type / position / content_id
--   event_view  … イベントのページ（/events/[slug]）を開いた。meta に slug
-- 既存の8種はそのまま。表・インデックス・RLS・権限は変えない。
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
    'event_view'
  ));
