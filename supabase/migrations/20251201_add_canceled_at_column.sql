-- Migration: Add canceled_at column to user_subscriptions
-- Date: 2025-12-01
-- Purpose: Track when a subscription was actually canceled (distinct from cancel_at which is the scheduled cancellation date)

-- Add canceled_at column if not exists
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;

-- Add comment to clarify the difference between cancel_at and canceled_at
COMMENT ON COLUMN user_subscriptions.cancel_at IS 'Scheduled cancellation date from Stripe (when cancellation is scheduled to take effect)';
COMMENT ON COLUMN user_subscriptions.canceled_at IS 'Actual timestamp when the subscription was canceled';
