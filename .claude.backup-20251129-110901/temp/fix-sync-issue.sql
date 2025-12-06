-- ========================================
-- Stripe ⇔ Supabase 同期の修正
-- ========================================

-- 1. 現在の状態を確認
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  stripe_subscription_id,
  updated_at
FROM user_subscriptions
WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a';

-- 2. Stripeでキャンセル済みのサブスクリプションをSupabaseでも非アクティブに更新
UPDATE user_subscriptions
SET
  is_active = false,
  updated_at = NOW()
WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a'
  AND stripe_subscription_id = 'sub_1SQeCzKUVUnt8GtyNqXHzOoJ';

-- 3. 更新後の状態を確認
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  stripe_subscription_id,
  updated_at
FROM user_subscriptions
WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a';

-- 期待される結果: is_active = false
