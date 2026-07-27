-- =============================================================================
-- 汎用通知システム：notifications & notification_preferences（#160 S1）
-- 作成日: 2026-07-27
-- 関連: rebono/issues/汎用通知システムの実装.md (#160)
-- 設計:
--   - 掲示板専用にせず「type + entity_type/entity_id の polymorphic 参照」で汎用化する。
--     将来の型追加（フィードバック返信通知など）は type の CHECK に値を足すだけで拡張できる。
--   - 表示に必要な情報（actor名/アバター・link_url・payload）は作成時に snapshot する。
--     読み取り時に Sanity へ問い合わせない・プロフィール変更後も通知文言を変えないため。
--   - 作成経路はアプリ層（Server Action）から service_role で INSERT する。
--     質問へのコメント通知の宛先（投稿主）が Sanity 側にしか無く DB 内で解決できないため、
--     DB トリガーではなくアプリ層で作成する（既存 board_user_stats と同じ service_role パターン）。
--   - RLS: 受信者本人のみ SELECT / UPDATE（既読化）可能。INSERT ポリシーは作らない
--     （user JWT からの直接作成を不可にし、作成は service_role の RLS bypass に限定する）。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. notifications：サイト内通知本体
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 受信者（本人）。退会で通知も消す。
  recipient_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  -- 通知を発生させた人。システム通知（NULL）も将来許容するため NULL 可。actor 退会時は NULL に落とす。
  actor_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  -- actor プロフィールを作成時に snapshot（auth.users への JOIN 回避・変更後も文言を固定）
  actor_name text,
  actor_avatar_url text,
  -- 通知種別。将来型追加は CHECK にリテラルを足すだけで拡張できる。
  type text NOT NULL CHECK (type IN ('question_comment', 'question_reaction', 'comment_reaction')),
  -- polymorphic 参照（question_reactions.target_type/target_id と同じ text 型の流儀）
  entity_type text NOT NULL,                          -- 例: 'question' / 'comment'
  entity_id text NOT NULL,                            -- Sanity _id or uuid::text
  -- 遷移先 URL。作成時に slug 解決済みで snapshot（読み取り時に Sanity へ問い合わせない）
  link_url text NOT NULL,
  -- 表示用の補足情報（例: {"questionTitle": "...", "preview": "..."}）
  payload jsonb,
  -- 既読時刻（NULL = 未読）
  read_at timestamptz,
  -- メール送信済み時刻。S1 では未使用だが将来の S5（メール通知）用に列だけ用意する。
  email_sent_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 一覧（Dropdown）用：受信者ごとに新しい順で引く
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_created
  ON public.notifications (recipient_id, created_at DESC);

-- 未読カウント用の部分インデックス（未読件数バッジ）
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_unread
  ON public.notifications (recipient_id)
  WHERE read_at IS NULL;

-- 重複抑止のチェック（createNotification 側の未読重複 SELECT）を効かせるための索引
CREATE INDEX IF NOT EXISTS idx_notifications_dedup
  ON public.notifications (type, entity_id, actor_id, recipient_id)
  WHERE read_at IS NULL;

COMMENT ON TABLE public.notifications IS
  '汎用サイト内通知（#160）。type + entity_type/entity_id の polymorphic 参照。表示情報は作成時 snapshot。作成は service_role のみ（INSERT ポリシー無し）';

-- -----------------------------------------------------------------------------
-- 2. RLS: notifications
--    SELECT: 受信者本人のみ
--    UPDATE: 受信者本人の行のみ（read_at 更新用）。USING/WITH CHECK 同条件。
--    INSERT: ポリシー無し（= authenticated からは不可）。作成は service_role が RLS を bypass する。
--    DELETE: ポリシー無し（今回は削除 UI を作らない）。
-- -----------------------------------------------------------------------------
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipient can read own notifications"
  ON public.notifications
  FOR SELECT
  TO authenticated
  USING (recipient_id = auth.uid());

CREATE POLICY "recipient can update own notifications"
  ON public.notifications
  FOR UPDATE
  TO authenticated
  USING (recipient_id = auth.uid())
  WITH CHECK (recipient_id = auth.uid());

-- -----------------------------------------------------------------------------
-- 3. notification_preferences：通知設定（S1 では箱だけ作る。UI/判定接続は S6）
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  -- コメント通知メール（デフォルト ON）
  email_on_comment boolean NOT NULL DEFAULT true,
  -- リアクション通知メール（デフォルト OFF＝スパム回避、サイト内/軽量プッシュのみ）
  email_on_reaction boolean NOT NULL DEFAULT false,
  -- 軽量ブラウザプッシュ（タブが開いている間のポップ）許可（デフォルト OFF）
  browser_push_enabled boolean NOT NULL DEFAULT false
);

COMMENT ON TABLE public.notification_preferences IS
  '通知設定（#160）。S1 では箱のみ。メール/ブラウザ通知の判定接続は S5/S6 で行う';

-- -----------------------------------------------------------------------------
-- 4. RLS: notification_preferences
--    SELECT/UPDATE を本人のみに限定。
--    （INSERT は S6 の設定保存時に別途 upsert 経路で扱う。今回は箱のみ。）
-- -----------------------------------------------------------------------------
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "owner can read own preferences"
  ON public.notification_preferences
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "owner can update own preferences"
  ON public.notification_preferences
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
