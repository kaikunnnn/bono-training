-- =============================================================================
-- Web Push 購読テーブル push_subscriptions（#160 Web Push）
-- 作成日: 2026-09-03
-- 関連: rebono/issues/WebPush通知.md
--
-- 目的:
--   ブラウザ/PWAの Push 購読（endpoint + 暗号鍵）を端末ごとに保存する。
--   送信時（web-push-send.ts, service_role）にここを引いて各端末へ送る。
--
-- 方式:
--   - endpoint はプッシュサービス（FCM/APNs等）が発行する端末ごとの一意URL。UNIQUE。
--   - 本人の authenticated クライアントから upsert（onConflict=endpoint）するため、
--     SELECT/INSERT/UPDATE/DELETE すべてに RLS（auth.uid() = user_id）を張る。
--   - 1ユーザーが複数端末を持てる（PK は id、端末識別は endpoint）。
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.push_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- プッシュサービスが発行する端末ごとの一意な送信先URL
  endpoint text NOT NULL,
  -- 送信ペイロード暗号化用の公開鍵とauthシークレット（PushSubscription.toJSON().keys）
  p256dh text NOT NULL,
  auth text NOT NULL,
  -- どの端末/ブラウザの購読か（デバッグ用スナップショット）
  user_agent text,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (id),
  CONSTRAINT push_subscriptions_endpoint_key UNIQUE (endpoint)
);

ALTER TABLE public.push_subscriptions OWNER TO postgres;

COMMENT ON TABLE public.push_subscriptions IS
  'Web Push の端末別購読（#160）。endpoint UNIQUE。RLSで本人のみ。送信は service_role で読み取り、404/410 の端末は削除する（stale pruning）';

-- ユーザー単位の引き当て（送信時に user_id で全端末を取得）
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user
  ON public.push_subscriptions USING btree (user_id);

-- 権限付与（article_view_history と同流儀）
GRANT ALL ON TABLE public.push_subscriptions TO anon;
GRANT ALL ON TABLE public.push_subscriptions TO authenticated;
GRANT ALL ON TABLE public.push_subscriptions TO service_role;

-- RLS: 本人の行のみ操作可能
ALTER TABLE public.push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can read own push subscriptions"
  ON public.push_subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "owner can insert own push subscriptions"
  ON public.push_subscriptions
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner can update own push subscriptions"
  ON public.push_subscriptions
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "owner can delete own push subscriptions"
  ON public.push_subscriptions
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);
