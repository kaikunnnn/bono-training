-- Migration: Create price_cache table for Stripe pricing data
-- Purpose: Cache Stripe prices to improve performance (target: <50ms for cached requests)
-- Created: 2025-11-28

-- Create price_cache table
CREATE TABLE IF NOT EXISTS price_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_id TEXT NOT NULL,                       -- Stripe Price ID (e.g., price_xxx)
  product_id TEXT NOT NULL,                      -- Stripe Product ID
  plan_type TEXT NOT NULL,                       -- 'standard' or 'feedback'
  duration INTEGER NOT NULL,                     -- 1 or 3 (months)
  unit_amount INTEGER NOT NULL,                  -- Price in currency minor units (e.g., 4980 for ¥4,980)
  currency TEXT NOT NULL DEFAULT 'jpy',          -- Currency code
  recurring_interval TEXT,                       -- 'month'
  recurring_interval_count INTEGER,              -- 1 or 3
  environment TEXT NOT NULL,                     -- 'test' or 'live'
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),  -- Cache timestamp
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- Last update timestamp

  -- Unique constraint: one price per price_id per environment
  CONSTRAINT unique_price_per_env UNIQUE (price_id, environment)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_price_cache_plan
  ON price_cache(plan_type, duration, environment);

CREATE INDEX IF NOT EXISTS idx_price_cache_cached_at
  ON price_cache(cached_at);

-- Enable Row Level Security
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read price_cache (pricing is public information)
CREATE POLICY "Anyone can read price_cache"
  ON price_cache FOR SELECT
  USING (true);

-- Policy: Only service role can insert/update/delete
CREATE POLICY "Service role can manage price_cache"
  ON price_cache FOR ALL
  USING (auth.role() = 'service_role');

-- Add comment for documentation
COMMENT ON TABLE price_cache IS 'Cache table for Stripe pricing data. TTL: 1 hour. Improves pricing page load time from 500ms-1s to <50ms.';
COMMENT ON COLUMN price_cache.price_id IS 'Stripe Price ID from Stripe API';
COMMENT ON COLUMN price_cache.unit_amount IS 'Price in minor units (e.g., 4980 = ¥4,980)';
COMMENT ON COLUMN price_cache.cached_at IS 'When this price was cached. Used for TTL calculation.';
