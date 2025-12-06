
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import Stripe from "https://esm.sh/stripe@14.21.0";

/**
 * デバッグ用ログ出力関数
 */
export function logDebug(message: string, data?: any) {
  console.log(`[CHECK-SUBSCRIPTION] ${message}`, data ? JSON.stringify(data) : '');
}

/**
 * CORSヘッダー
 */
export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * Supabaseクライアントの作成
 */
export function createSupabaseClients() {
  const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
  const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

  // 🔍 DEBUG: 環境変数の実際の値を確認
  console.log(`🔍 [CHECK-SUBSCRIPTION DEBUG] SUPABASE_URL: ${supabaseUrl}`);
  console.log(`🔍 [CHECK-SUBSCRIPTION DEBUG] SUPABASE_ANON_KEY (first 20): ${supabaseAnonKey.substring(0, 20)}...`);
  console.log(`🔍 [CHECK-SUBSCRIPTION DEBUG] SUPABASE_SERVICE_ROLE_KEY (first 20): ${supabaseServiceKey.substring(0, 20)}...`);

  return {
    supabaseClient: createClient(supabaseUrl, supabaseAnonKey),
    supabaseAdmin: createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false }
    })
  };
}

/**
 * Stripeクライアントの作成
 */
export function createStripeClient(): Stripe | null {
  // Test環境かLive環境かを判定してキーを取得
  const testKey = Deno.env.get("STRIPE_TEST_SECRET_KEY");
  const liveKey = Deno.env.get("STRIPE_LIVE_SECRET_KEY");

  logDebug("環境変数チェック", {
    hasTestKey: !!testKey,
    hasLiveKey: !!liveKey,
    testKeyPrefix: testKey?.substring(0, 10),
    liveKeyPrefix: liveKey?.substring(0, 10)
  });

  // Test keyが存在する場合はTest環境として動作
  const stripeKey = testKey || liveKey;

  if (!stripeKey) {
    logDebug("Stripe APIキーが設定されていません");
    return null;
  }

  logDebug(`Stripe初期化: ${testKey ? 'test' : 'live'}環境`);
  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
}

/**
 * 現在の環境（test/live）を判定
 * 環境変数 STRIPE_MODE から判定します（デフォルトは test）
 */
export function getCurrentEnvironment(): 'test' | 'live' {
  const environment = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';
  logDebug(`環境判定: ${environment} (STRIPE_MODE=${Deno.env.get('STRIPE_MODE') || 'デフォルト'})`);
  return environment;
}
