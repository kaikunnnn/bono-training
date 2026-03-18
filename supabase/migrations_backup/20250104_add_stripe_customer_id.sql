-- user_subscriptionsテーブルにstripe_customer_idカラムを追加
-- カスタマーポータル機能に必要

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- インデックスを追加してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer_id
ON user_subscriptions(stripe_customer_id);

-- コメントを追加
COMMENT ON COLUMN user_subscriptions.stripe_customer_id IS 'StripeのカスタマーID。カスタマーポータルへのアクセスに使用。';
