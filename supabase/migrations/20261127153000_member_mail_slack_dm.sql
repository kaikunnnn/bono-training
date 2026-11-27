-- =============================================================================
-- 会員メール: 常設の文面（はじめの案内など）を Slack の DM でも送る（#327-H）
-- 作成日: 2026-11-27
-- 関連: rebono/issues/327-H_SlackのDMでも送る.md / 327-C_通知の設定画面_メール・SlackもON・OFF.md
--       土台: 20261123000000_create_member_mail.sql / 20261125090715_member_mail_standing_campaigns.sql
--             20261027000000_create_slack_member_sync.sql（slack_member_links）
--
-- 変えること（足すだけ。既存の行・既存の動き（メール）は変えない）:
--   1. member_mail_settings.slack_dm_mode
--        Slack の DM のスイッチ。メールと同じ off / count / owner / all。既定は off（入れても何も変わらない）。
--        count … 運用 Slack の人数のお知らせに Slack の人数（slack_candidates / slack_will_send）を足すだけ（DM は送らない）
--        owner … owner_user_ids の人にだけ DM
--        all   … 対象の人全員に DM
--        DM はメールを送れた人にだけ送る（メールのスイッチ・承認・配信停止・対象の条件をすべて通った人）。
--   2. member_mail_slack_dm_preferences
--        会員本人の「Slack の DM で受け取る」のオン・オフ（通知設定の画面から）。行が無ければオン。
--   3. member_mail_slack_dms
--        DM 1通1行の記録。delivery_id（メールの送信記録）に一意。
--        メールの記録は「本番は同じ人に同じ文面1回」「オーナー確認は版ごとに1回」なので、DM もそれに従う。
--        送る前に status=sending の行を入れ、入らなければ（もうある）送らない＝ cron の再実行でも二重に送らない。
--        送れたか分からない（タイムアウト等）ときは needs_review にして、自動で送り直さない。
--
-- 保存しない: メッセージ本文・メールアドレス・名前。持つのは ID とエラーコードだけ。
-- RLS: 全テーブル有効・ポリシーなし。anon / authenticated から権限も剥奪し、service_role からだけ読み書きする。
-- =============================================================================

-- 1. Slack の DM のスイッチ（既定 off）
ALTER TABLE public.member_mail_settings
  ADD COLUMN IF NOT EXISTS slack_dm_mode text NOT NULL DEFAULT 'off'
    CHECK (slack_dm_mode IN ('off', 'count', 'owner', 'all'));

COMMENT ON COLUMN public.member_mail_settings.slack_dm_mode IS
  '常設の文面を Slack の DM でも送るスイッチ（#327-H）。off / count（人数だけ）/ owner（オーナーだけ）/ all（全員）。メールを送れた人にだけ DM する';

-- 2. 会員本人の Slack の DM のオン・オフ（行が無ければオン）
CREATE TABLE IF NOT EXISTS public.member_mail_slack_dm_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.member_mail_slack_dm_preferences IS
  '会員メールの Slack DM（#327-H）を受け取るか。行が無ければ受け取る。通知設定の画面から本人が変える';

DROP TRIGGER IF EXISTS trg_member_mail_slack_dm_preferences_touch ON public.member_mail_slack_dm_preferences;
CREATE TRIGGER trg_member_mail_slack_dm_preferences_touch
  BEFORE UPDATE ON public.member_mail_slack_dm_preferences
  FOR EACH ROW EXECUTE FUNCTION public.touch_member_mail_updated_at();

-- 3. DM 1通1行の記録
-- status の流れ: sending（送る直前に入れる）→ sent / failed（送られていないことが確実）/ needs_review（分からない）
CREATE TABLE IF NOT EXISTS public.member_mail_slack_dms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL UNIQUE REFERENCES public.member_mail_deliveries(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.member_mail_campaigns(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audience text NOT NULL CHECK (audience IN ('owner', 'all')),
  content_version integer NOT NULL,
  team_id text NOT NULL,
  slack_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'sending' CHECK (status IN ('sending', 'sent', 'failed', 'needs_review')),
  -- Slack のエラーコード（例: channel_not_found / timeout）。本文は入れない
  reason text,
  slack_channel_id text,
  slack_ts text,
  sending_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_mail_slack_dms_campaign
  ON public.member_mail_slack_dms (campaign_id, status);

COMMENT ON TABLE public.member_mail_slack_dms IS
  '会員メールの Slack DM（#327-H）の記録。メールの送信記録1行に DM は1通まで。本文は保存しない';

DROP TRIGGER IF EXISTS trg_member_mail_slack_dms_touch ON public.member_mail_slack_dms;
CREATE TRIGGER trg_member_mail_slack_dms_touch
  BEFORE UPDATE ON public.member_mail_slack_dms
  FOR EACH ROW EXECUTE FUNCTION public.touch_member_mail_updated_at();

-- RLS・権限（service_role のみ）
ALTER TABLE public.member_mail_slack_dm_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_mail_slack_dms ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.member_mail_slack_dm_preferences FROM anon, authenticated;
REVOKE ALL ON public.member_mail_slack_dms FROM anon, authenticated;
