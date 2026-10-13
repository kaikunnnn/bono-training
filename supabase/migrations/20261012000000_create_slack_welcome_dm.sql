-- =============================================================================
-- Slack 新規参加者へのウェルカムDM（#238）
-- 作成日: 2026-10-12
-- 関連: rebono/issues/238_Slack新規参加者へのウェルカムDM.md
--
-- 2つのテーブル:
--   1. slack_welcome_settings   … 止めるスイッチ（1行だけ）。再デプロイなしで off にできる
--   2. slack_welcome_deliveries … 1人1行の送信記録（team_id + slack_user_id で一意）
--
-- 保存しない: 名前・メール・プロフィール・リクエスト本文・DM本文・トークン。
-- 行は削除しない（退出→再参加しても同じ行が残るので、二度と送らない）。
--
-- RLS: 両テーブルとも有効・ポリシーなし。anon / authenticated から権限も剥奪し、
--      service_role（サーバー側の Route Handler / Cron）からだけ読み書きする。
--      ※ 既存の app_config は RLS 無効の警告があるため使わない。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. slack_welcome_settings：動作モードの設定（単一行）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slack_welcome_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  -- off: 何もしない / dry_run: 判定だけ記録 / test: test_user_ids の人だけ送る / live: 全員に送る
  mode text NOT NULL DEFAULT 'off' CHECK (mode IN ('off', 'dry_run', 'test', 'live')),
  -- 運用開始時刻。これより前に参加した人（event_time < enabled_from）は対象外。
  -- NULL のときは誰も対象にしない（設定し忘れで過去の参加者に送らないため）。
  enabled_from timestamptz,
  -- test モードで送ってよい Slack ユーザーID（例: カイクンの別アカウント）
  test_user_ids text[] NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.slack_welcome_settings IS 'Slack ウェルカムDM（#238）の動作モード。1行だけ。mode=off で即停止';

INSERT INTO public.slack_welcome_settings (id, mode)
VALUES (1, 'off')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. slack_welcome_deliveries：1人1行の送信記録
-- -----------------------------------------------------------------------------
-- status の流れ:
--   queued → processing（処理中の確保）→ sending（投稿直前に永続化）→ sent
--   processing → skipped / pending_activation / retry_wait / failed / queued（dry_run・off で戻す）
--   sending → needs_review（投稿したか分からない。自動で送り直さない）
CREATE TABLE IF NOT EXISTS public.slack_welcome_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id text NOT NULL,
  slack_user_id text NOT NULL,
  event_id text NOT NULL,                    -- 最初に受け取った team_join の event_id
  event_time timestamptz NOT NULL,           -- Slack の event_time（参加時刻）
  status text NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'processing', 'sending', 'sent', 'skipped',
    'pending_activation', 'retry_wait', 'needs_review', 'failed'
  )),
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  claim_token uuid,                          -- 処理中の持ち主（同時実行で二重送信しないため）
  locked_until timestamptz,                  -- processing の期限（過ぎたら拾い直してよい）
  last_error_code text,                      -- Slack のエラーコード / 除外理由（例: guest, bot）
  channel_id text,                           -- 送信先 DM の channel_id
  message_ts text,                           -- chat.postMessage の ts
  message_version integer,                   -- 送った本文の版番号（本文そのものは保存しない）
  dry_run_result text,                       -- dry_run での判定（would_send / 除外理由）
  dry_run_at timestamptz,
  first_received_at timestamptz NOT NULL DEFAULT now(),
  sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, slack_user_id)
);

-- 拾い直し（cron）用: 送るべき行を next_attempt_at 順に探す
CREATE INDEX IF NOT EXISTS idx_slack_welcome_deliveries_due
  ON public.slack_welcome_deliveries (next_attempt_at)
  WHERE status IN ('queued', 'retry_wait', 'pending_activation', 'processing');

-- 止まった sending を探す
CREATE INDEX IF NOT EXISTS idx_slack_welcome_deliveries_sending
  ON public.slack_welcome_deliveries (updated_at)
  WHERE status = 'sending';

COMMENT ON TABLE public.slack_welcome_deliveries IS 'Slack ウェルカムDM（#238）の送信記録。1人1行・削除しない。名前/メール/本文は保存しない';

-- updated_at を自動更新
CREATE OR REPLACE FUNCTION public.touch_slack_welcome_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_slack_welcome_deliveries_touch ON public.slack_welcome_deliveries;
CREATE TRIGGER trg_slack_welcome_deliveries_touch
  BEFORE UPDATE ON public.slack_welcome_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.touch_slack_welcome_updated_at();

DROP TRIGGER IF EXISTS trg_slack_welcome_settings_touch ON public.slack_welcome_settings;
CREATE TRIGGER trg_slack_welcome_settings_touch
  BEFORE UPDATE ON public.slack_welcome_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_slack_welcome_updated_at();

-- -----------------------------------------------------------------------------
-- 3. RLS（service_role のみ）
-- -----------------------------------------------------------------------------
ALTER TABLE public.slack_welcome_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slack_welcome_deliveries ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.slack_welcome_settings FROM anon, authenticated;
REVOKE ALL ON public.slack_welcome_deliveries FROM anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_slack_welcome_updated_at() FROM PUBLIC, anon, authenticated;
