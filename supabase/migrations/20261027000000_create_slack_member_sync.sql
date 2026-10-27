-- =============================================================================
-- Slack を課金メンバーだけに保つ定期整理（#263）
-- 作成日: 2026-10-27
-- 関連: rebono/issues/263_Slackを課金メンバーだけにする定期整理.md / 238（ウェルカムDM）
--
-- 4つのテーブル:
--   1. slack_member_sync_settings … 止めるスイッチ（1行だけ）。再デプロイなしで off にできる
--   2. slack_member_links         … BONO ユーザー ↔ Slack ユーザーのつながり（1人1つ）
--   3. slack_member_sync_state    … Slack メンバー1人1行の判定と DM の記録
--   4. slack_link_tokens          … 使い捨てリンク（値はハッシュだけ・有効期限つき・一度使ったら無効）
-- 2つの関数（どちらも service_role 専用）:
--   - slack_member_sync_lookup   … メールのハッシュ / ユーザーID → BONO ユーザーと課金の要約
--   - slack_member_link_claim    … 使い捨てリンクでつなぐ（確認・つなぐ・リンクを無効化を1つの処理で）
--
-- 保存しない: 名前・メール・プロフィール・DM本文・リンクの値（ハッシュだけ）・トークン。
-- Slack から人を外す操作はしない（無料プランでは API がない）。判定・DM・オーナーへの報告だけ。
--
-- RLS: 全テーブル有効・ポリシーなし。anon / authenticated から権限も剥奪し、
--      service_role（サーバー側の Route Handler / Cron / Server Action）からだけ読み書きする。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. slack_member_sync_settings：動作モードの設定（単一行）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slack_member_sync_settings (
  id smallint PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  -- off: 何もしない / dry_run: 判定だけ記録（DMなし）/ test: test_user_ids の人だけ DM / live: 全員に DM
  mode text NOT NULL DEFAULT 'off' CHECK (mode IN ('off', 'dry_run', 'test', 'live')),
  -- test モードで DM を送ってよい Slack ユーザーID（例: カイクンの別アカウント）
  test_user_ids text[] NOT NULL DEFAULT '{}',
  -- 外れるお知らせDMから外す日までの最短日数（外す日 = max(終わる日の翌日, お知らせ日 + この日数)）
  min_notice_days integer NOT NULL DEFAULT 7 CHECK (min_notice_days BETWEEN 1 AND 60),
  -- つなぐお願いDMから、つながらなければ外す候補にするまでの日数
  link_grace_days integer NOT NULL DEFAULT 14 CHECK (link_grace_days BETWEEN 1 AND 90),
  -- オーナーへの報告DMを最後に送った日（JST）。同じ日に二度送らない
  owner_report_sent_on date,
  -- 日次 cron の実行ロック（同時に2つ走らないように）
  run_locked_until timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.slack_member_sync_settings IS 'Slack 定期整理（#263）の動作モード。1行だけ。mode=off で即停止';

INSERT INTO public.slack_member_sync_settings (id, mode)
VALUES (1, 'off')
ON CONFLICT (id) DO NOTHING;

-- -----------------------------------------------------------------------------
-- 2. slack_member_links：BONO ↔ Slack のつながり
-- -----------------------------------------------------------------------------
-- 1人の BONO ユーザーは1つの Slack アカウントとだけ、1つの Slack アカウントは1人の BONO ユーザーとだけつながる。
-- 上書きはしない（つなぎ直しは手で行を消してから）。
CREATE TABLE IF NOT EXISTS public.slack_member_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  team_id text NOT NULL,
  slack_user_id text NOT NULL,
  -- email: 課金中の BONO アカウントとメールが一致して自動でつないだ / dm_link: DM のリンクから / mypage: マイページから
  linked_via text NOT NULL CHECK (linked_via IN ('email', 'dm_link', 'mypage')),
  linked_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, slack_user_id)
);

COMMENT ON TABLE public.slack_member_links IS 'BONO ユーザー ↔ Slack ユーザーのつながり（#263）。IDだけを保存する';

-- -----------------------------------------------------------------------------
-- 3. slack_member_sync_state：Slack メンバー1人1行の判定と DM の記録
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.slack_member_sync_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id text NOT NULL,
  slack_user_id text NOT NULL,
  classification text NOT NULL CHECK (classification IN (
    'keep', 'remove_scheduled', 'needs_link', 'excluded', 'resolved'
  )),
  -- 判定の理由（例: canceled / cancel_reserved / link_expired / not_linked / no_paid_record / guest / admin）
  reason text,
  -- 外す日（JST）。外れるお知らせDMを送れた時点（link_expired は期限切れの時点）で決まる
  remove_after date,
  -- つなぐお願いの期限（JST。この日まではつながるのを待つ）
  link_deadline date,
  link_request_dm_at timestamptz,
  link_request_version integer,          -- 送った本文の版番号（本文そのものは保存しない）
  removal_notice_dm_at timestamptz,
  removal_notice_version integer,
  dry_run_result text,                   -- dry_run / test の対象外での判定（would_send:... 等）
  dry_run_at timestamptz,
  -- 確認が必要（送れたか分からない・送れなかった・本文未承認）。立っている間は DM を送らない（本文未承認は除く）
  needs_review boolean NOT NULL DEFAULT false,
  review_reason text,
  resolved_at timestamptz,
  resolved_reason text CHECK (resolved_reason IN ('deactivated', 'resubscribed', 'linked')),
  first_seen_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (team_id, slack_user_id)
);

-- オーナー報告用: 外す日が来た人を探す
CREATE INDEX IF NOT EXISTS idx_slack_member_sync_state_due
  ON public.slack_member_sync_state (remove_after)
  WHERE classification = 'remove_scheduled';

COMMENT ON TABLE public.slack_member_sync_state IS 'Slack 定期整理（#263）の判定と DM の記録。1人1行。名前/メール/本文は保存しない';

-- -----------------------------------------------------------------------------
-- 4. slack_link_tokens：使い捨てリンク
-- -----------------------------------------------------------------------------
-- リンクの値そのものは保存しない（sha256 の16進ハッシュだけ）。
-- purpose=mypage の行は、マイページからの申し込み回数（1日3回まで）の数え方にも使う。
-- そのため Slack に該当者がいなかった申し込みも、slack_user_id=NULL（使えない行）として残す。
CREATE TABLE IF NOT EXISTS public.slack_link_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token_hash text NOT NULL UNIQUE CHECK (token_hash ~ '^[0-9a-f]{64}$'),
  team_id text NOT NULL,
  slack_user_id text,
  -- link_request: 日次チェックのつなぐお願いDM / mypage: マイページからの確認DM
  purpose text NOT NULL CHECK (purpose IN ('link_request', 'mypage')),
  requested_by_user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  used_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (purpose = 'mypage' OR slack_user_id IS NOT NULL)
);

-- マイページからの申し込み回数を数える
CREATE INDEX IF NOT EXISTS idx_slack_link_tokens_requested_by
  ON public.slack_link_tokens (requested_by_user_id, created_at)
  WHERE requested_by_user_id IS NOT NULL;

COMMENT ON TABLE public.slack_link_tokens IS 'Slack とつなぐ使い捨てリンク（#263）。値はハッシュだけ・有効期限つき・一度使ったら無効';

-- -----------------------------------------------------------------------------
-- updated_at を自動更新
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.touch_slack_member_sync_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = pg_catalog.now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_slack_member_sync_state_touch ON public.slack_member_sync_state;
CREATE TRIGGER trg_slack_member_sync_state_touch
  BEFORE UPDATE ON public.slack_member_sync_state
  FOR EACH ROW EXECUTE FUNCTION public.touch_slack_member_sync_updated_at();

DROP TRIGGER IF EXISTS trg_slack_member_sync_settings_touch ON public.slack_member_sync_settings;
CREATE TRIGGER trg_slack_member_sync_settings_touch
  BEFORE UPDATE ON public.slack_member_sync_settings
  FOR EACH ROW EXECUTE FUNCTION public.touch_slack_member_sync_updated_at();

-- -----------------------------------------------------------------------------
-- 5. slack_member_sync_lookup：メールのハッシュ / ユーザーID → 課金の要約
-- -----------------------------------------------------------------------------
-- サーバーが全員のメールを読み出さずに照合するための関数。
-- Slack 側のメールを md5(lower(trim(email))) にして渡し、一致した BONO ユーザーだけを返す。
-- つながり（slack_member_links）経由の人は p_user_ids で渡す（Slack のメールが違っても判定できるように）。
--
-- 課金の数え方: environment='live' かつ stripe_subscription_id があるものだけ。その人の最新の行で判定する。
-- 返すのは ID と課金の列だけ（メール・名前は返さない）。email_hash はメールで一致したときだけ入る。
CREATE OR REPLACE FUNCTION public.slack_member_sync_lookup(p_email_hashes text[], p_user_ids uuid[])
RETURNS TABLE (
  email_hash text,
  user_id uuid,
  has_paid_record boolean,
  is_active boolean,
  cancel_at_period_end boolean,
  cancel_at timestamptz,
  current_period_end timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  WITH matched AS (
    SELECT
      u.id,
      CASE
        WHEN u.email IS NOT NULL
          AND pg_catalog.md5(pg_catalog.lower(pg_catalog.btrim(u.email))) = ANY (COALESCE(p_email_hashes, '{}'::text[]))
        THEN pg_catalog.md5(pg_catalog.lower(pg_catalog.btrim(u.email)))
      END AS email_hash
    FROM auth.users u
    WHERE u.deleted_at IS NULL
      AND (
        (u.email IS NOT NULL
          AND pg_catalog.md5(pg_catalog.lower(pg_catalog.btrim(u.email))) = ANY (COALESCE(p_email_hashes, '{}'::text[])))
        OR u.id = ANY (COALESCE(p_user_ids, '{}'::uuid[]))
      )
  )
  SELECT
    m.email_hash,
    m.id,
    s.user_id IS NOT NULL,
    COALESCE(s.is_active, false),
    COALESCE(s.cancel_at_period_end, false),
    s.cancel_at,
    s.current_period_end
  FROM matched m
  LEFT JOIN LATERAL (
    SELECT us.user_id, us.is_active, us.cancel_at_period_end, us.cancel_at, us.current_period_end
    FROM public.user_subscriptions us
    WHERE us.user_id = m.id
      AND us.environment = 'live'
      AND us.stripe_subscription_id IS NOT NULL
    ORDER BY us.updated_at DESC, us.created_at DESC
    LIMIT 1
  ) s ON true;
$$;

COMMENT ON FUNCTION public.slack_member_sync_lookup(text[], uuid[]) IS
  'Slack 定期整理（#263）: メールのハッシュ(md5(lower(trim)))/ユーザーID → 最新の live 課金行の要約。メール・名前は返さない。service_role 専用';

-- -----------------------------------------------------------------------------
-- 6. slack_member_link_claim：使い捨てリンクでつなぐ
-- -----------------------------------------------------------------------------
-- 確認（ある・未使用・期限内）→ つながりの確認 → つなぐ → リンクを無効化 を1つのトランザクションで行う。
-- 上書きはしない:
--   - その Slack アカウントが別の BONO アカウントとつながっている → slack_linked_to_other
--   - この BONO アカウントが別の Slack アカウントとつながっている → user_linked_to_other
-- 戻り値: linked / already_linked / invalid / used / expired / slack_linked_to_other / user_linked_to_other / conflict
-- 課金中かどうかの確認は呼び出し側（Server Action）で先に行う。
CREATE OR REPLACE FUNCTION public.slack_member_link_claim(p_token_hash text, p_user_id uuid)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  t public.slack_link_tokens%ROWTYPE;
  linked_user uuid;
BEGIN
  IF p_token_hash IS NULL OR p_user_id IS NULL THEN
    RETURN 'invalid';
  END IF;

  SELECT * INTO t FROM public.slack_link_tokens WHERE token_hash = p_token_hash FOR UPDATE;
  IF NOT FOUND OR t.slack_user_id IS NULL THEN
    RETURN 'invalid';
  END IF;
  IF t.used_at IS NOT NULL THEN
    RETURN 'used';
  END IF;
  IF t.expires_at <= pg_catalog.now() THEN
    RETURN 'expired';
  END IF;

  SELECT l.user_id INTO linked_user
  FROM public.slack_member_links l
  WHERE l.team_id = t.team_id AND l.slack_user_id = t.slack_user_id;
  IF FOUND THEN
    IF linked_user = p_user_id THEN
      UPDATE public.slack_link_tokens SET used_at = pg_catalog.now() WHERE id = t.id;
      RETURN 'already_linked';
    END IF;
    RETURN 'slack_linked_to_other';
  END IF;

  IF EXISTS (SELECT 1 FROM public.slack_member_links l WHERE l.user_id = p_user_id) THEN
    RETURN 'user_linked_to_other';
  END IF;

  INSERT INTO public.slack_member_links (user_id, team_id, slack_user_id, linked_via)
  VALUES (
    p_user_id,
    t.team_id,
    t.slack_user_id,
    CASE t.purpose WHEN 'mypage' THEN 'mypage' ELSE 'dm_link' END
  );
  UPDATE public.slack_link_tokens SET used_at = pg_catalog.now() WHERE id = t.id;
  RETURN 'linked';
EXCEPTION
  WHEN unique_violation THEN
    -- 同時に別の処理がつないだ（上書きしない）
    RETURN 'conflict';
END;
$$;

COMMENT ON FUNCTION public.slack_member_link_claim(text, uuid) IS
  'Slack 定期整理（#263）: 使い捨てリンクで BONO ↔ Slack をつなぐ。上書きしない。service_role 専用';

-- -----------------------------------------------------------------------------
-- 7. RLS・権限（service_role のみ）
-- -----------------------------------------------------------------------------
ALTER TABLE public.slack_member_sync_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slack_member_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slack_member_sync_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slack_link_tokens ENABLE ROW LEVEL SECURITY;

REVOKE ALL ON public.slack_member_sync_settings FROM anon, authenticated;
REVOKE ALL ON public.slack_member_links FROM anon, authenticated;
REVOKE ALL ON public.slack_member_sync_state FROM anon, authenticated;
REVOKE ALL ON public.slack_link_tokens FROM anon, authenticated;

-- 関数は既定で PUBLIC が実行できるため、剥奪してから service_role にだけ許可する
REVOKE ALL ON FUNCTION public.touch_slack_member_sync_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.slack_member_sync_lookup(text[], uuid[]) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.slack_member_link_claim(text, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.slack_member_sync_lookup(text[], uuid[]) TO service_role;
GRANT EXECUTE ON FUNCTION public.slack_member_link_claim(text, uuid) TO service_role;
