-- =============================================================================
-- 通知種別に「運営からのお知らせ」(announcement) を追加する（#245）
-- 作成日: 2026-10-14
-- 関連: rebono/issues/245_運営からのお知らせ通知.md
--
-- 背景 / 変更点:
--   - 20260727000000_create_notifications.sql の設計どおり「type の CHECK に値を足すだけ」で拡張する。
--   - announcement は運営からのシステム通知のため actor_id / actor_name / actor_avatar_url は NULL。
--     本文は payload.title に入れる（表示は src/lib/notifications-display.ts）。
--   - link_url は外部URL（Slack 等）も入りうる。
--   - notification_type_preferences.type の CHECK にも同じ値を足して型をそろえる
--     （今回は設定UIを作らない。行が無ければ ON のオプトアウト方式のまま）。
--
-- 制約名について:
--   - 元のマイグレーションは列定義に無名の CHECK を書いているため、Postgres の自動命名で
--     notifications_type_check / notification_type_preferences_type_check になっている。
--     DROP CONSTRAINT IF EXISTS → ADD で張り替える。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. notifications.type に 'announcement' を追加
-- -----------------------------------------------------------------------------
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('question_comment', 'question_reaction', 'comment_reaction', 'announcement'));

-- -----------------------------------------------------------------------------
-- 2. notification_type_preferences.type に 'announcement' を追加
-- -----------------------------------------------------------------------------
ALTER TABLE public.notification_type_preferences
  DROP CONSTRAINT IF EXISTS notification_type_preferences_type_check;

ALTER TABLE public.notification_type_preferences
  ADD CONSTRAINT notification_type_preferences_type_check
  CHECK (type IN ('question_comment', 'question_reaction', 'comment_reaction', 'announcement'));
