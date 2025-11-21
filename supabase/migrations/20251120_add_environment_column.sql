-- Stripe環境（テスト/本番）を管理するカラムを追加
-- 作成日: 2025-11-20

-- stripe_customersテーブルにenvironmentカラムを追加
ALTER TABLE stripe_customers
ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'live' CHECK (environment IN ('test', 'live'));

-- user_subscriptionsテーブルにenvironmentカラムを追加
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS environment TEXT DEFAULT 'live' CHECK (environment IN ('test', 'live'));

-- インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_stripe_customers_environment ON stripe_customers(environment);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_environment ON user_subscriptions(environment);

-- 既存データは全て本番環境として設定
UPDATE stripe_customers SET environment = 'live' WHERE environment IS NULL;
UPDATE user_subscriptions SET environment = 'live' WHERE environment IS NULL;

-- コメントを追加
COMMENT ON COLUMN stripe_customers.environment IS 'Stripe環境: test（テスト環境）またはlive（本番環境）';
COMMENT ON COLUMN user_subscriptions.environment IS 'Stripe環境: test（テスト環境）またはlive（本番環境）';
