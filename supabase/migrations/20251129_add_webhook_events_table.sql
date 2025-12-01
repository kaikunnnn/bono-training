-- Webhook Events Table
-- Purpose: Webhook冪等性チェック用テーブル
-- 同じWebhookイベントを複数回受信しても、1回しか処理されないようにする

CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW(),
  environment TEXT CHECK (environment IN ('test', 'live'))
);

-- インデックス作成（event_idでの検索を高速化）
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_environment ON webhook_events(environment);

-- コメント
COMMENT ON TABLE webhook_events IS 'Webhook冪等性チェック用テーブル。同じイベントIDを複数回受信しても1回しか処理されない';
COMMENT ON COLUMN webhook_events.event_id IS 'Stripeから送信されるWebhookイベントID（evt_xxx）';
COMMENT ON COLUMN webhook_events.event_type IS 'Webhookイベントタイプ（checkout.session.completed等）';
COMMENT ON COLUMN webhook_events.processed_at IS '処理完了日時';
COMMENT ON COLUMN webhook_events.environment IS 'Stripe環境（test または live）';
