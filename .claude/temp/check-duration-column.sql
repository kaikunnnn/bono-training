-- ステップ1: user_subscriptionsテーブルの全カラムを確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_subscriptions'
ORDER BY ordinal_position;

-- ステップ2: durationカラムの存在確認（期待: 1行返る）
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'user_subscriptions'
  AND column_name = 'duration';

-- ステップ3: 既存データのduration値を確認
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  created_at
FROM user_subscriptions
ORDER BY created_at DESC
LIMIT 10;
