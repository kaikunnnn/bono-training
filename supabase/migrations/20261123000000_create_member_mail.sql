-- =============================================================================
-- 会員へのメールを送る共通の土台（#264 スライス1 / #268 S1）
-- 作成日: 2026-10-29
-- 関連: rebono/issues/264_メール配信の仕組み_利用シーンと優先度.md（§5・§9 スライス1）
--       rebono/issues/268_会員への連絡_実行計画.md（S1: 開いた・押したの記録、ワンクリック配信停止）
--
-- テーブル:
--   1. member_mail_settings        … 全体の大きなスイッチ・オーナー・1日の上限（1行だけ）
--   2. member_mail_kind_settings   … メールの種類ごとのスイッチ
--   3. member_mail_campaigns       … 1回分の文面（件名・本文）と承認の記録
--   4. member_mail_deliveries      … 1通1行の送信記録（user_id だけ。メールアドレスは持たない）
--   5. member_mail_unsubscribes    … 配信停止（カテゴリごと・いつ・どの方法で）
--   6. member_mail_suppressions    … 届かなかった・迷惑メール報告で以後送らない人
--   7. member_mail_webhook_events  … Resend の webhook の受付記録（二重処理の防止。アドレスは持たない）
-- 関数（service_role 専用）:
--   - member_mail_approve_campaign … 今の文面の版を「承認済み」にする
--   - member_mail_apply_event      … Resend の webhook 1件を記録する（重複は無視・届かなかった/迷惑報告は以後送らない）
--
-- スイッチ（mode）: off（止める）/ count（人数だけ出す）/ owner（オーナーだけに送る）/ all（全員に送る）
--   実際のモード = 全体と種類ごとの「弱いほう」（off < count < owner < all）
--
-- 保存しない: メールアドレス・名前・本文の差し込み結果・webhook の本文（宛先アドレスを含むため）。
-- RLS: 全テーブル有効・ポリシーなし。anon / authenticated から権限も剥奪し、
--      service_role（サーバー側の Route Handler / Cron / Server Action）からだけ読み書きする。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. member_mail_settings：全体のスイッチ（単一行）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_mail_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  mode text NOT NULL DEFAULT 'off' CHECK (mode IN ('off', 'count', 'owner', 'all')),
  -- 「オーナーだけに送る」の相手（BONO のユーザーID。アドレスは送る直前に認証の表から読む）
  owner_user_ids uuid[] NOT NULL DEFAULT '{}',
  -- 1日（日本時間）に送ってよい通数。Resend 無料枠（1日100通）を課金まわりのメールと分け合うため（264 決定）
  daily_limit integer NOT NULL DEFAULT 80 CHECK (daily_limit BETWEEN 0 AND 1000),
  -- 送ってよい時間帯（日本時間・時）。start <= 時 < end のときだけ送る（264 §5-9）
  send_hour_start smallint NOT NULL DEFAULT 8 CHECK (send_hour_start BETWEEN 0 AND 23),
  send_hour_end smallint NOT NULL DEFAULT 21 CHECK (send_hour_end BETWEEN 1 AND 24),
  -- 送る処理の実行ロック（同時に2つ走らないように）
  run_locked_until timestamptz,
  -- 最後に自動で止めた理由（例: complained）。人が見て mode を戻す
  auto_stopped_reason text,
  auto_stopped_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK (send_hour_start < send_hour_end)
);

COMMENT ON TABLE public.member_mail_settings IS '会員メール（#264）の全体スイッチ。1行だけ。mode=off で全部止まる';

INSERT INTO public.member_mail_settings (id, mode)
VALUES (1, 'off')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. member_mail_kind_settings：種類ごとのスイッチ
-- -----------------------------------------------------------------------------
-- weekly: 週1回のメルマガ / comeback: 14日止まり / renewal: 3ヶ月プランの相談案内
-- signup: 登録だけの人 / winback: 元会員（後で使う）
CREATE TABLE IF NOT EXISTS public.member_mail_kind_settings (
  kind text PRIMARY KEY CHECK (kind IN ('weekly', 'comeback', 'renewal', 'signup', 'winback')),
  mode text NOT NULL DEFAULT 'off' CHECK (mode IN ('off', 'count', 'owner', 'all')),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.member_mail_kind_settings IS '会員メール（#264）の種類ごとのスイッチ。全体スイッチと弱いほうが効く';

INSERT INTO public.member_mail_kind_settings (kind, mode) VALUES
  ('weekly', 'off'), ('comeback', 'off'), ('renewal', 'off'), ('signup', 'off'), ('winback', 'off')
ON CONFLICT (kind) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 3. member_mail_campaigns：1回分の文面と承認の記録
-- -----------------------------------------------------------------------------
-- 文面（subject / preheader / body）が1文字でも変わると content_version が上がり、承認が外れる（トリガー）。
-- 承認済み = approved_version = content_version。承認は member_mail_approve_campaign() で行う。
CREATE TABLE IF NOT EXISTS public.member_mail_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kind text NOT NULL CHECK (kind IN ('weekly', 'comeback', 'renewal', 'signup', 'winback')),
  -- 人が読む名前（例: 週1回のメルマガ・11/10号）。種類の中で一意
  label text NOT NULL,
  subject text NOT NULL DEFAULT '',
  -- 受信箱で件名の横に見える1行
  preheader text NOT NULL DEFAULT '',
  -- 本文（段落は空行で区切る。リンクは [文字](https://...)。見出しは行頭 "## "）
  body text NOT NULL DEFAULT '',
  content_version integer NOT NULL DEFAULT 1,
  approved_version integer,
  approved_at timestamptz,
  -- 送り始めてよい時刻。NULL なら送る処理が拾わない
  scheduled_at timestamptz,
  -- 「全員に送る」で対象を記録に書き出した時刻（書き出しは1回だけ）
  enqueued_at timestamptz,
  -- 「人数だけ出す」の最新の結果（人数だけ。名前・アドレスは入れない）
  last_count jsonb,
  last_counted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (kind, label)
);

COMMENT ON TABLE public.member_mail_campaigns IS '会員メール（#264）の1回分の文面と承認。文面が変わると承認が外れる';

CREATE OR REPLACE FUNCTION public.member_mail_campaigns_before_write()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    NEW.content_version := 1;
    NEW.approved_version := NULL;
    NEW.approved_at := NULL;
  ELSIF NEW.subject IS DISTINCT FROM OLD.subject
     OR NEW.preheader IS DISTINCT FROM OLD.preheader
     OR NEW.body IS DISTINCT FROM OLD.body
     OR NEW.kind IS DISTINCT FROM OLD.kind THEN
    -- 文面が変わったら版を上げ、承認を外す（同じ UPDATE で承認を付けても外れる）
    NEW.content_version := OLD.content_version + 1;
    NEW.approved_version := NULL;
    NEW.approved_at := NULL;
  ELSE
    -- 版は手で書き換えさせない
    NEW.content_version := OLD.content_version;
  END IF;
  NEW.updated_at := pg_catalog.now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_mail_campaigns_before_write ON public.member_mail_campaigns;
CREATE TRIGGER trg_member_mail_campaigns_before_write
  BEFORE INSERT OR UPDATE ON public.member_mail_campaigns
  FOR EACH ROW EXECUTE FUNCTION public.member_mail_campaigns_before_write();

-- 今の版を承認する。p_expected_version を渡すと、その版のときだけ承認する（読んだ版と違えば何もしない）
CREATE OR REPLACE FUNCTION public.member_mail_approve_campaign(p_campaign_id uuid, p_expected_version integer DEFAULT NULL)
RETURNS integer
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_version integer;
BEGIN
  UPDATE public.member_mail_campaigns
     SET approved_version = content_version,
         approved_at = pg_catalog.now()
   WHERE id = p_campaign_id
     AND (p_expected_version IS NULL OR content_version = p_expected_version)
  RETURNING content_version INTO v_version;
  RETURN v_version; -- 承認できなければ NULL
END;
$$;

-- -----------------------------------------------------------------------------
-- 4. member_mail_deliveries：1通1行の送信記録
-- -----------------------------------------------------------------------------
-- status の流れ:
--   queued → processing（処理中の確保）→ sending（送る直前に永続化）→ sent
--   processing → skipped（対象外になった）/ failed / queued（スイッチが止まった・上限で戻す）
--   sending → needs_review（送れたか分からない。自動で送り直さない）
CREATE TABLE IF NOT EXISTS public.member_mail_deliveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id uuid NOT NULL REFERENCES public.member_mail_campaigns(id) ON DELETE RESTRICT,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  kind text NOT NULL,
  -- 配信停止のカテゴリ（notice / comeback / signup / winback）
  category text NOT NULL CHECK (category IN ('notice', 'comeback', 'signup', 'winback')),
  -- owner: オーナー確認用 / all: 本番の送信
  audience text NOT NULL CHECK (audience IN ('owner', 'all')),
  -- 送った文面の版（本文そのものは保存しない）
  content_version integer NOT NULL,
  status text NOT NULL DEFAULT 'queued' CHECK (status IN (
    'queued', 'processing', 'sending', 'sent', 'skipped', 'needs_review', 'failed'
  )),
  -- 対象外になった理由・失敗のコード（例: unsubscribed, weekly_cap, suppressed, validation_error）
  reason text,
  attempts integer NOT NULL DEFAULT 0,
  next_attempt_at timestamptz NOT NULL DEFAULT now(),
  claim_token uuid,
  locked_until timestamptz,
  resend_email_id text,
  sending_at timestamptz,
  sent_at timestamptz,
  -- Resend の webhook で埋まる（268 S1: 開いた・押した）
  delivered_at timestamptz,
  first_opened_at timestamptz,
  open_count integer NOT NULL DEFAULT 0,
  first_clicked_at timestamptz,
  click_count integer NOT NULL DEFAULT 0,
  bounced_at timestamptz,
  complained_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 「同じメールを同じ人に1回だけ」（本番の送信）
CREATE UNIQUE INDEX IF NOT EXISTS uq_member_mail_deliveries_all
  ON public.member_mail_deliveries (campaign_id, user_id)
  WHERE audience = 'all';
-- オーナー確認は文面の版ごとに1回だけ
CREATE UNIQUE INDEX IF NOT EXISTS uq_member_mail_deliveries_owner
  ON public.member_mail_deliveries (campaign_id, user_id, content_version)
  WHERE audience = 'owner';
CREATE UNIQUE INDEX IF NOT EXISTS uq_member_mail_deliveries_resend_id
  ON public.member_mail_deliveries (resend_email_id)
  WHERE resend_email_id IS NOT NULL;
-- 送る処理が拾う行
CREATE INDEX IF NOT EXISTS idx_member_mail_deliveries_due
  ON public.member_mail_deliveries (next_attempt_at)
  WHERE status IN ('queued', 'processing');
-- 週の上限・1日の上限の判定
CREATE INDEX IF NOT EXISTS idx_member_mail_deliveries_user_sending
  ON public.member_mail_deliveries (user_id, sending_at)
  WHERE sending_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_member_mail_deliveries_sending_at
  ON public.member_mail_deliveries (sending_at)
  WHERE sending_at IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_member_mail_deliveries_stale
  ON public.member_mail_deliveries (updated_at)
  WHERE status = 'sending';

COMMENT ON TABLE public.member_mail_deliveries IS '会員メール（#264）の送信記録。1通1行。user_id だけを持ち、メールアドレスは持たない';

CREATE OR REPLACE FUNCTION public.touch_member_mail_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_member_mail_deliveries_touch ON public.member_mail_deliveries;
CREATE TRIGGER trg_member_mail_deliveries_touch
  BEFORE UPDATE ON public.member_mail_deliveries
  FOR EACH ROW EXECUTE FUNCTION public.touch_member_mail_updated_at();

DROP TRIGGER IF EXISTS trg_member_mail_settings_touch ON public.member_mail_settings;
CREATE TRIGGER trg_member_mail_settings_touch
  BEFORE UPDATE ON public.member_mail_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_member_mail_updated_at();

DROP TRIGGER IF EXISTS trg_member_mail_kind_settings_touch ON public.member_mail_kind_settings;
CREATE TRIGGER trg_member_mail_kind_settings_touch
  BEFORE UPDATE ON public.member_mail_kind_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_member_mail_updated_at();

-- -----------------------------------------------------------------------------
-- 5. member_mail_unsubscribes：配信停止
-- -----------------------------------------------------------------------------
-- 1人×カテゴリで1行。resubscribed_at が NULL のあいだ止まっている。
-- 誰が（user_id）・どのカテゴリを・いつ・どの方法で止めたかを残す（特定電子メール法のパンフレットの推奨）。
CREATE TABLE IF NOT EXISTS public.member_mail_unsubscribes (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category text NOT NULL CHECK (category IN ('notice', 'comeback', 'signup', 'winback')),
  -- link: 本文のリンクの画面で押した / one_click: メールソフトのボタン（RFC 8058）/ reply: 返信で頼まれて手で / manual: 運営が手で
  method text NOT NULL CHECK (method IN ('link', 'one_click', 'reply', 'manual')),
  unsubscribed_at timestamptz NOT NULL DEFAULT now(),
  resubscribed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, category)
);

COMMENT ON TABLE public.member_mail_unsubscribes IS '会員メール（#264）の配信停止。resubscribed_at が NULL のあいだ止まっている';

DROP TRIGGER IF EXISTS trg_member_mail_unsubscribes_touch ON public.member_mail_unsubscribes;
CREATE TRIGGER trg_member_mail_unsubscribes_touch
  BEFORE UPDATE ON public.member_mail_unsubscribes
  FOR EACH ROW EXECUTE FUNCTION public.touch_member_mail_updated_at();

-- -----------------------------------------------------------------------------
-- 6. member_mail_suppressions：届かなかった・迷惑メール報告で以後送らない人
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_mail_suppressions (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  reason text NOT NULL CHECK (reason IN ('bounced', 'complained')),
  delivery_id uuid REFERENCES public.member_mail_deliveries(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.member_mail_suppressions IS '会員メール（#264）で届かなかった・迷惑メール報告をした人。以後どの種類も送らない';

-- -----------------------------------------------------------------------------
-- 7. member_mail_webhook_events：Resend の webhook の受付記録
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.member_mail_webhook_events (
  -- svix-id（Resend の webhook の一意な番号）。同じ番号は2回処理しない
  webhook_id text PRIMARY KEY,
  event_type text NOT NULL,
  resend_email_id text,
  delivery_id uuid REFERENCES public.member_mail_deliveries(id) ON DELETE SET NULL,
  -- 押されたリンクのパス（クエリは from= だけ残す。個人を表す値は入れない）
  link_path text,
  occurred_at timestamptz,
  received_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_member_mail_webhook_events_delivery
  ON public.member_mail_webhook_events (delivery_id)
  WHERE delivery_id IS NOT NULL;

COMMENT ON TABLE public.member_mail_webhook_events IS '会員メール（#264）の Resend webhook の受付記録。本文・宛先アドレスは保存しない';

-- Resend の webhook 1件を記録する。戻り値:
--   duplicate（同じ webhook_id は処理済み）/ unknown（この仕組みで送ったメールではない）/ recorded / suppressed（以後送らない人に入れた）
CREATE OR REPLACE FUNCTION public.member_mail_apply_event(
  p_webhook_id text,
  p_event_type text,
  p_resend_email_id text,
  p_occurred_at timestamptz,
  p_link_path text DEFAULT NULL
)
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  v_inserted text;
  v_delivery_id uuid;
  v_user_id uuid;
  v_at timestamptz := COALESCE(p_occurred_at, pg_catalog.now());
BEGIN
  INSERT INTO public.member_mail_webhook_events (webhook_id, event_type, resend_email_id, link_path, occurred_at)
  VALUES (p_webhook_id, p_event_type, p_resend_email_id, p_link_path, p_occurred_at)
  ON CONFLICT (webhook_id) DO NOTHING
  RETURNING webhook_id INTO v_inserted;
  IF v_inserted IS NULL THEN
    RETURN 'duplicate';
  END IF;

  SELECT id, user_id INTO v_delivery_id, v_user_id
    FROM public.member_mail_deliveries
   WHERE resend_email_id = p_resend_email_id;
  IF v_delivery_id IS NULL THEN
    RETURN 'unknown';
  END IF;

  UPDATE public.member_mail_webhook_events SET delivery_id = v_delivery_id WHERE webhook_id = p_webhook_id;

  IF p_event_type = 'email.delivered' THEN
    UPDATE public.member_mail_deliveries
       SET delivered_at = COALESCE(delivered_at, v_at)
     WHERE id = v_delivery_id;
  ELSIF p_event_type = 'email.opened' THEN
    UPDATE public.member_mail_deliveries
       SET first_opened_at = LEAST(COALESCE(first_opened_at, v_at), v_at),
           open_count = open_count + 1
     WHERE id = v_delivery_id;
  ELSIF p_event_type = 'email.clicked' THEN
    UPDATE public.member_mail_deliveries
       SET first_clicked_at = LEAST(COALESCE(first_clicked_at, v_at), v_at),
           click_count = click_count + 1
     WHERE id = v_delivery_id;
  ELSIF p_event_type IN ('email.bounced', 'email.complained') THEN
    UPDATE public.member_mail_deliveries
       SET bounced_at = CASE WHEN p_event_type = 'email.bounced' THEN COALESCE(bounced_at, v_at) ELSE bounced_at END,
           complained_at = CASE WHEN p_event_type = 'email.complained' THEN COALESCE(complained_at, v_at) ELSE complained_at END
     WHERE id = v_delivery_id;
    INSERT INTO public.member_mail_suppressions (user_id, reason, delivery_id)
    VALUES (v_user_id, CASE WHEN p_event_type = 'email.bounced' THEN 'bounced' ELSE 'complained' END, v_delivery_id)
    ON CONFLICT (user_id) DO UPDATE
      -- 迷惑メール報告は、届かなかったより強い理由として上書きする
      SET reason = CASE WHEN EXCLUDED.reason = 'complained' THEN 'complained' ELSE public.member_mail_suppressions.reason END;
    RETURN 'suppressed';
  END IF;

  RETURN 'recorded';
END;
$$;

-- -----------------------------------------------------------------------------
-- 8. RLS・権限（service_role のみ）
-- -----------------------------------------------------------------------------
ALTER TABLE public.member_mail_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_mail_kind_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_mail_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_mail_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_mail_unsubscribes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_mail_suppressions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.member_mail_webhook_events ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.member_mail_settings FROM anon, authenticated;
REVOKE ALL ON public.member_mail_kind_settings FROM anon, authenticated;
REVOKE ALL ON public.member_mail_campaigns FROM anon, authenticated;
REVOKE ALL ON public.member_mail_deliveries FROM anon, authenticated;
REVOKE ALL ON public.member_mail_unsubscribes FROM anon, authenticated;
REVOKE ALL ON public.member_mail_suppressions FROM anon, authenticated;
REVOKE ALL ON public.member_mail_webhook_events FROM anon, authenticated;

REVOKE ALL ON FUNCTION public.member_mail_campaigns_before_write() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.touch_member_mail_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.member_mail_approve_campaign(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.member_mail_apply_event(text, text, text, timestamptz, text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.member_mail_approve_campaign(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.member_mail_apply_event(text, text, text, timestamptz, text) TO service_role;
