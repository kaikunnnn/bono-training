-- ==========================================================
-- user_subscriptionsテーブルにdurationカラムを追加
-- Supabase Dashboard > SQL Editor で実行してください
-- ==========================================================

-- ステップ1: 現在のテーブル構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- ステップ2: durationカラムを追加（既に存在する場合はスキップ）
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 1;

-- ステップ3: インデックスを追加（既に存在する場合はスキップ）
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_duration
ON user_subscriptions(plan_type, duration);

-- ステップ4: カラムにコメントを追加
COMMENT ON COLUMN user_subscriptions.duration IS 'プランの契約期間（月単位）。1 = 1ヶ月、3 = 3ヶ月';

-- ステップ5: 追加後のテーブル構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- ステップ6: 既存データのduration値を確認（全てデフォルト値の1になっているはず）
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  stripe_subscription_id,
  created_at
FROM user_subscriptions
ORDER BY created_at DESC;
