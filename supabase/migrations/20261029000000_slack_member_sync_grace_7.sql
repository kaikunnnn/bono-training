-- #263 Slack 定期整理: つなぐお願いの猶予を 14日 → 7日 に（オーナー決定 2026-10-29）
-- あわせて解約予約・解約済みの人への「外れるお知らせDM」を廃止した（コード側）。
-- min_notice_days 列と slack_member_sync_state.removal_notice_dm_at / removal_notice_version 列は
-- 使わなくなったが、本番に既にあるので残す。
ALTER TABLE public.slack_member_sync_settings ALTER COLUMN link_grace_days SET DEFAULT 7;
UPDATE public.slack_member_sync_settings SET link_grace_days = 7 WHERE id = 1 AND link_grace_days = 14;
