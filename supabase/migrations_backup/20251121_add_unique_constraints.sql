-- stripe_customersテーブルに複合unique制約を追加
-- 既存のuser_id unique制約を削除して、(user_id, environment)の複合制約に置き換える

-- 既存のunique制約を確認（あれば削除）
DO $$
BEGIN
    -- 既存のuser_idのみのunique制約があれば削除
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'stripe_customers_user_id_key'
    ) THEN
        ALTER TABLE stripe_customers DROP CONSTRAINT stripe_customers_user_id_key;
    END IF;
END $$;

-- 複合unique制約を追加
ALTER TABLE stripe_customers
ADD CONSTRAINT stripe_customers_user_id_environment_key
UNIQUE (user_id, environment);

-- user_subscriptionsテーブルにも同様の制約を追加
-- 既存の制約を確認
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'user_subscriptions_stripe_subscription_id_key'
    ) THEN
        ALTER TABLE user_subscriptions DROP CONSTRAINT user_subscriptions_stripe_subscription_id_key;
    END IF;
END $$;

-- stripe_subscription_idとenvironmentの複合unique制約
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_stripe_subscription_id_environment_key
UNIQUE (stripe_subscription_id, environment);

COMMENT ON CONSTRAINT stripe_customers_user_id_environment_key ON stripe_customers
IS '1ユーザーは各環境（test/live）ごとに1つのStripe顧客IDを持つ';

COMMENT ON CONSTRAINT user_subscriptions_stripe_subscription_id_environment_key ON user_subscriptions
IS 'Stripeサブスクリプションは環境ごとに一意';
