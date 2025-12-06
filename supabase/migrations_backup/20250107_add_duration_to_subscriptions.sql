-- user_subscriptionsテーブルにdurationカラムを追加
-- プラン期間（1ヶ月 or 3ヶ月）を保存するため

-- durationカラムを追加（デフォルト値: 1）
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 1;

-- インデックスを追加してパフォーマンスを向上
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_duration
ON user_subscriptions(plan_type, duration);

-- コメントを追加
COMMENT ON COLUMN user_subscriptions.duration IS 'プランの契約期間（月単位）。1 = 1ヶ月、3 = 3ヶ月';

-- 既存データの確認（オプション）
-- SELECT user_id, plan_type, duration, is_active FROM user_subscriptions LIMIT 10;
