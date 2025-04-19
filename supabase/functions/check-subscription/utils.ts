
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
  const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
  if (!stripeKey) {
    logDebug("Stripe APIキーが設定されていません");
    return null;
  }
  
  return new Stripe(stripeKey, {
    apiVersion: "2023-10-16",
  });
}
