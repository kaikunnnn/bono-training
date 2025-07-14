-- Phase 1: Create subscription tables with proper structure
-- This migration creates the core tables needed for billing system

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('free', 'community', 'standard', 'growth')),
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'trialing', 'past_due')),
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create stripe_customers table
CREATE TABLE IF NOT EXISTS stripe_customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_subscriptions table (for easier access pattern)
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type TEXT NOT NULL DEFAULT 'free' CHECK (plan_type IN ('free', 'community', 'standard', 'growth')),
  subscribed BOOLEAN DEFAULT FALSE,
  subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_user_id ON stripe_customers(user_id);
CREATE INDEX IF NOT EXISTS idx_stripe_customers_stripe_id ON stripe_customers(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);

-- Add unique constraints
ALTER TABLE user_subscriptions ADD CONSTRAINT unique_user_subscription UNIQUE(user_id);
ALTER TABLE stripe_customers ADD CONSTRAINT unique_user_customer UNIQUE(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_subscriptions_updated_at 
  BEFORE UPDATE ON subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_stripe_customers_updated_at 
  BEFORE UPDATE ON stripe_customers 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at 
  BEFORE UPDATE ON user_subscriptions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own stripe customer data" ON stripe_customers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view own user subscription data" ON user_subscriptions
  FOR SELECT USING (auth.uid() = user_id);

-- Service role policies (for Edge Functions)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage stripe customers" ON stripe_customers
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

CREATE POLICY "Service role can manage user subscriptions" ON user_subscriptions
  FOR ALL USING (auth.jwt() ->> 'role' = 'service_role');

-- Create function to initialize user subscription
CREATE OR REPLACE FUNCTION initialize_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_subscriptions (user_id, plan_type, subscribed)
  VALUES (NEW.id, 'free', FALSE)
  ON CONFLICT (user_id) DO NOTHING;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to initialize user subscription on signup
CREATE TRIGGER initialize_user_subscription_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION initialize_user_subscription();

-- Insert default free plan for existing users (if any)
INSERT INTO user_subscriptions (user_id, plan_type, subscribed)
SELECT id, 'free', FALSE FROM auth.users
ON CONFLICT (user_id) DO NOTHING;

-- Create helper function to get subscription status
CREATE OR REPLACE FUNCTION get_user_subscription_status(user_uuid UUID)
RETURNS TABLE(
  subscribed BOOLEAN,
  plan_type TEXT,
  has_member_access BOOLEAN,
  has_learning_access BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(us.subscribed, FALSE) as subscribed,
    COALESCE(us.plan_type, 'free') as plan_type,
    COALESCE(us.plan_type IN ('standard', 'growth', 'community'), FALSE) as has_member_access,
    COALESCE(us.plan_type IN ('standard', 'growth'), FALSE) as has_learning_access
  FROM user_subscriptions us
  WHERE us.user_id = user_uuid
  UNION ALL
  SELECT FALSE, 'free', FALSE, FALSE
  WHERE NOT EXISTS (
    SELECT 1 FROM user_subscriptions WHERE user_id = user_uuid
  )
  LIMIT 1;
END;
$$ language 'plpgsql';