-- user_subscriptionsテーブルにcurrent_period_endカラムを追加
-- Stripeサブスクリプションの次回更新日を保存するため

-- current_period_endカラムを追加
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS current_period_end timestamptz;

-- コメントを追加
COMMENT ON COLUMN user_subscriptions.current_period_end IS 'サブスクリプションの次回更新日（Stripeのcurrent_period_endから取得）';
