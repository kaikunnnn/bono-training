-- ========================================
-- ステップ2: 二重課金の調査用SQL
-- ========================================

-- 1. takumi.kai.skywalker@gmail.comのユーザーIDを取得
SELECT id, email, created_at
FROM auth.users
WHERE email = 'takumi.kai.skywalker@gmail.com';

-- 2. このユーザーのサブスクリプション情報をすべて確認
-- （上記で取得したidを使用）
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  stripe_subscription_id,
  stripe_customer_id,
  created_at,
  updated_at
FROM user_subscriptions
WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' -- ステップ1で取得したIDに置き換え
ORDER BY created_at DESC;

-- 3. アクティブなサブスクリプションの数を確認
SELECT
  user_id,
  COUNT(*) as active_subscriptions
FROM user_subscriptions
WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' -- ステップ1で取得したIDに置き換え
  AND is_active = true
GROUP BY user_id;

-- 期待される結果: active_subscriptions = 1
-- もし2以上なら二重課金が発生している

-- 4. subscriptionsテーブルも確認
SELECT
  id,
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  status,
  price_id,
  start_timestamp,
  end_timestamp
FROM subscriptions
WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' -- ステップ1で取得したIDに置き換え
ORDER BY start_timestamp DESC;

-- 5. stripe_customersテーブルを確認
SELECT
  user_id,
  stripe_customer_id,
  email,
  created_at
FROM stripe_customers
WHERE user_id = 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'; -- ステップ1で取得したIDに置き換え
