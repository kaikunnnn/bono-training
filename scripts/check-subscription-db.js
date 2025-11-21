/**
 * データベース直接確認スクリプト
 * サブスクリプション情報を確認する
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://fryogvfhymnpiqwssmuu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZyeW9ndmZoeW1ucGlxd3NzbXV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjgxMDc2MjEsImV4cCI6MjA0MzY4MzYyMX0.QR-060G9GY5ZMFw1potnVjF3C79KxCUNRQokmj1lHug';

const USER_ID = 'c2930eb2-edde-486a-8594-780dbac4f744';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function checkSubscription() {
  console.log('=== サブスクリプション情報確認 ===\n');

  // 1. user_subscriptions を確認
  console.log('1. user_subscriptions テーブルを確認...');
  const { data: subscriptions, error: subError } = await supabase
    .from('user_subscriptions')
    .select('*')
    .eq('user_id', USER_ID)
    .order('created_at', { ascending: false });

  if (subError) {
    console.error('❌ エラー:', subError);
  } else {
    console.log(`✅ ${subscriptions.length}件のレコードが見つかりました\n`);
    subscriptions.forEach((sub, index) => {
      console.log(`--- レコード ${index + 1} ---`);
      console.log('stripe_subscription_id:', sub.stripe_subscription_id);
      console.log('plan_type:', sub.plan_type);
      console.log('duration:', sub.duration);
      console.log('is_active:', sub.is_active);
      console.log('environment:', sub.environment);
      console.log('created_at:', sub.created_at);
      console.log('updated_at:', sub.updated_at);
      console.log('');
    });
  }

  // 2. stripe_customers を確認
  console.log('2. stripe_customers テーブルを確認...');
  const { data: customers, error: custError } = await supabase
    .from('stripe_customers')
    .select('*')
    .eq('user_id', USER_ID);

  if (custError) {
    console.error('❌ エラー:', custError);
  } else {
    console.log(`✅ ${customers.length}件のレコードが見つかりました\n`);
    customers.forEach((cust, index) => {
      console.log(`--- レコード ${index + 1} ---`);
      console.log('stripe_customer_id:', cust.stripe_customer_id);
      console.log('environment:', cust.environment);
      console.log('created_at:', cust.created_at);
      console.log('');
    });
  }
}

checkSubscription().catch(console.error);
