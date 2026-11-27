-- =============================================================================
-- 会員メール: 常設の文面（はじめの案内）を Slack の DM でも送る（#327-H）
-- 作成日: 2026-11-27
-- 関連: rebono/issues/327-H_SlackのDMでも送る.md / 327-C_通知の設定画面_メール・SlackもON・OFF.md
--       土台: 20261123000000_create_member_mail.sql / 20261125090715_member_mail_standing_campaigns.sql
--             20261027000000_create_slack_member_sync.sql（slack_member_links）
--
-- 変えること（足すだけ。既存の行・既存の動き（メール）は変えない）:
--   1. member_mail_settings.slack_dm_mode
--        Slack の DM のスイッチ。メールと同じ off / count / owner / all。既定は off（入れても何も変わらない）。
--        count … 運用 Slack の人数のお知らせに Slack の人数（slack_candidates / slack_will_send）を足すだけ
--        owner … owner_user_ids の人にだけ DM / all … 対象の人全員に DM
--        DM はメールを送れた（status=sent）人にだけ、毎朝の実行の最後にまとめて送る。
--        送るのは「同じ日（日本時間）、かつスイッチを off / count から上げた時刻（slack_dm_raised_at）より後」に送れたメールの分だけ。
--        slack_dm_raised_at はトリガーが入れる（手で書いても元に戻る）。
--        どの常設の文面を DM でも送るかはアプリの定数（SLACK_DM_STANDING_KEYS。今は onboarding_day2 だけ）。
--   2. member_mail_slack_dm_preferences
--        会員本人の「Slack の DM で受け取る」のオン・オフ（通知設定の画面から）。行が無ければオン。
--   3. member_mail_slack_dms
--        会員への DM 1通1行の記録。delivery_id（メールの送信記録）に一意＝同じメールに DM は1通まで。
--        status: sending（Slack を呼ぶ直前に入れる）→ sent / failed（送られていないことが確実）/
--                needs_review（送れたか分からない。自動で送り直さない）/
--                deferred（速さの上限などで送っていない。次の実行で送り直してよい）
--        10分より古い sending は needs_review にする（メールの markStaleSending と同じ）。
--   4. member_mail_slack_dm_previews
--        オーナーだけに送る確認用の DM の記録（会員の行とは別。スイッチに関係なく、手動の実行からだけ送る）。
--        同じ文面の版・同じ人には1回だけ。
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

-- スイッチを off / count から owner / all に上げた最後の時刻（トリガーが入れる。手で書かない）。
-- DM を送るのは、この時刻より後で、かつ同じ日（日本時間）に送れたメールの分だけ（上げたときに昔の分をまとめて送らない）
ALTER TABLE public.member_mail_settings
  ADD COLUMN IF NOT EXISTS slack_dm_raised_at timestamptz;

COMMENT ON COLUMN public.member_mail_settings.slack_dm_raised_at IS
  'slack_dm_mode を off / count から owner / all に上げた最後の時刻（#327-H。トリガーが入れる）。これより前に送ったメールの分は DM しない';

CREATE OR REPLACE FUNCTION public.member_mail_settings_slack_dm_raised()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF NEW.slack_dm_mode IN ('owner', 'all')
     AND (TG_OP = 'INSERT' OR OLD.slack_dm_mode IS DISTINCT FROM NEW.slack_dm_mode)
     AND (TG_OP = 'INSERT' OR OLD.slack_dm_mode IN ('off', 'count')) THEN
    NEW.slack_dm_raised_at := pg_catalog.now();
  ELSIF TG_OP = 'UPDATE' THEN
    -- 手では書き換えさせない
    NEW.slack_dm_raised_at := OLD.slack_dm_raised_at;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_mail_settings_slack_dm_raised ON public.member_mail_settings;
CREATE TRIGGER trg_member_mail_settings_slack_dm_raised
  BEFORE INSERT OR UPDATE ON public.member_mail_settings
  FOR EACH ROW EXECUTE FUNCTION public.member_mail_settings_slack_dm_raised();

REVOKE ALL ON FUNCTION public.member_mail_settings_slack_dm_raised() FROM PUBLIC, anon, authenticated;

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

-- 3. 会員への DM 1通1行の記録
CREATE TABLE IF NOT EXISTS public.member_mail_slack_dms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  delivery_id uuid NOT NULL UNIQUE REFERENCES public.member_mail_deliveries(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES public.member_mail_campaigns(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  audience text NOT NULL CHECK (audience IN ('owner', 'all')),
  content_version integer NOT NULL,
  team_id text NOT NULL,
  slack_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'sending' CHECK (status IN ('sending', 'sent', 'failed', 'needs_review', 'deferred')),
  -- Slack のエラーコード（例: channel_not_found / timeout / ratelimited / stale_sending）。本文は入れない
  reason text,
  slack_channel_id text,
  slack_ts text,
  sending_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_mail_slack_dms_user_sent
  ON public.member_mail_slack_dms (user_id)
  WHERE status = 'sent';
CREATE INDEX IF NOT EXISTS idx_member_mail_slack_dms_stale
  ON public.member_mail_slack_dms (updated_at)
  WHERE status = 'sending';
-- DM を送る候補（送れたメール）を拾うため
CREATE INDEX IF NOT EXISTS idx_member_mail_deliveries_sent_at
  ON public.member_mail_deliveries (campaign_id, sent_at)
  WHERE status = 'sent';

COMMENT ON TABLE public.member_mail_slack_dms IS
  '会員メールの Slack DM（#327-H）の記録。メールの送信記録1行に DM は1通まで。本文は保存しない';

DROP TRIGGER IF EXISTS trg_member_mail_slack_dms_touch ON public.member_mail_slack_dms;
CREATE TRIGGER trg_member_mail_slack_dms_touch
  BEFORE UPDATE ON public.member_mail_slack_dms
  FOR EACH ROW EXECUTE FUNCTION public.touch_member_mail_updated_at();

-- 4. オーナーだけに送る確認用の DM の記録（会員の行とは別）
CREATE TABLE IF NOT EXISTS public.member_mail_slack_dm_previews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.member_mail_campaigns(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_version integer NOT NULL,
  team_id text NOT NULL,
  slack_user_id text NOT NULL,
  status text NOT NULL DEFAULT 'sending' CHECK (status IN ('sending', 'sent', 'failed', 'needs_review', 'deferred')),
  reason text,
  slack_channel_id text,
  slack_ts text,
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, user_id, content_version)
);

COMMENT ON TABLE public.member_mail_slack_dm_previews IS
  '会員メールの Slack DM（#327-H）をオーナーだけに送る確認用の記録。会員の行（member_mail_slack_dms）とは別';

DROP TRIGGER IF EXISTS trg_member_mail_slack_dm_previews_touch ON public.member_mail_slack_dm_previews;
CREATE TRIGGER trg_member_mail_slack_dm_previews_touch
  BEFORE UPDATE ON public.member_mail_slack_dm_previews
  FOR EACH ROW EXECUTE FUNCTION public.touch_member_mail_updated_at();

-- RLS・権限（service_role のみ）
ALTER TABLE public.member_mail_slack_dm_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_mail_slack_dms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_mail_slack_dm_previews ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.member_mail_slack_dm_preferences FROM anon, authenticated;
REVOKE ALL ON public.member_mail_slack_dms FROM anon, authenticated;
REVOKE ALL ON public.member_mail_slack_dm_previews FROM anon, authenticated;
