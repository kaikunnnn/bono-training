-- =============================================================================
-- 通知の「種類別オプトアウト」設定テーブル notification_type_preferences（#160）
-- 作成日: 2026-08-27
-- 関連: rebono/issues/通知システム*.md（#160 の設定機能）
--
-- 背景 / 変更点:
--   - 20260727000000_create_notifications.sql で作った notification_preferences は
--     メール/プッシュ通知用の placeholder（user_id PK + email_on_comment /
--     email_on_reaction / browser_push_enabled）。将来のメール通知(S5)で使う予約席のため、
--     絶対に DROP / ALTER しない。
--   - 今回のアプリ内通知「種類ごとにオン/オフ」機能は、placeholder とは別の
--     新テーブル notification_type_preferences に分離して実装する。
--
-- 方式（オプトアウト）:
--   - 行が無ければ「オン」とみなす。オフにしたときだけ enabled=false の行を持つ
--     （オンに戻すと enabled=true で upsert）。
--   - type は notifications.type CHECK と同じ3値に限定する。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- notification_type_preferences：通知種別ごとのオプトアウト設定
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_type_preferences (
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 通知種別。notifications.type / src/types/notification.ts の NotificationType と一致させる。
  type text NOT NULL CHECK (type IN ('question_comment', 'question_reaction', 'comment_reaction')),
  -- false = この種別の通知を作らない（オプトアウト）。行が無い場合は true 扱い。
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, type)
);

COMMENT ON TABLE public.notification_type_preferences IS
  '通知種別ごとのオプトアウト設定（#160）。行が無ければ ON。オフ時のみ enabled=false 行を持つ。PK=(user_id, type)。メール/プッシュ用の notification_preferences とは別テーブル';

-- -----------------------------------------------------------------------------
-- RLS: 自分の行のみ SELECT / INSERT / UPDATE / DELETE 可能。
--   - 設定保存は本人の authenticated クライアントから upsert するため INSERT ポリシーが必須。
--   - USING / WITH CHECK ともに user_id = auth.uid() で本人限定。
-- -----------------------------------------------------------------------------
ALTER TABLE public.notification_type_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can read own notification type preferences"
  ON public.notification_type_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "owner can insert own notification type preferences"
  ON public.notification_type_preferences
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner can update own notification type preferences"
  ON public.notification_type_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "owner can delete own notification type preferences"
  ON public.notification_type_preferences
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());
