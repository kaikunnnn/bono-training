-- user_subscriptionsテーブルにcanceled_atカラムを追加
-- Purpose: サブスクリプションキャンセル日時を記録

-- canceled_atカラムを追加
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS canceled_at timestamptz;

-- コメントを追加
COMMENT ON COLUMN user_subscriptions.canceled_at IS 'サブスクリプションがキャンセルされた日時（customer.subscription.deletedイベント発火時に記録）';
