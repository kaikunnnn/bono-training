import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getSupabaseSecretKey } from "../_shared/supabase-keys.ts";
import { createStripeClient } from "../_shared/stripe-helpers.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';
const CACHE_TTL_SECONDS = 3600; // 1時間

interface PriceData {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  } | null;
}

interface CachedPrice {
  price_id: string;
  plan_type: string;
  duration: number;
  unit_amount: number;
  currency: string;
  cached_at: string;
}

Deno.serve(async (req) => {
  // CORS対応
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log(`📊 get-plan-prices called (environment: ${ENVIRONMENT})`);

    // Supabaseクライアント作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = getSupabaseSecretKey();
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: キャッシュをチェック
    const cacheThreshold = new Date(Date.now() - CACHE_TTL_SECONDS * 1000).toISOString();

    const { data: cachedPrices, error: cacheError } = await supabase
      .from('price_cache')
      .select('*')
      .eq('environment', ENVIRONMENT)
      .gte('cached_at', cacheThreshold);

    if (!cacheError && cachedPrices && cachedPrices.length >= 4) {
      console.log(`✅ Cache hit: ${cachedPrices.length} prices from DB (age: ${Math.round((Date.now() - new Date(cachedPrices[0].cached_at).getTime()) / 1000)}s)`);

      // キャッシュを整形して返す
      const formattedPrices = formatCachedPrices(cachedPrices);

      return new Response(JSON.stringify({
        prices: formattedPrices,
        source: 'cache',
        environment: ENVIRONMENT,
        cached_count: cachedPrices.length
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log(`❌ Cache miss or stale (found: ${cachedPrices?.length || 0}/4), fetching from Stripe...`);

    // Step 2: Stripe APIから取得
    const stripe = createStripeClient(ENVIRONMENT);
    const envPrefix = ENVIRONMENT === 'test' ? "STRIPE_TEST_" : "STRIPE_";

    const priceConfigs = {
      standard_1m: { id: Deno.env.get(`${envPrefix}STANDARD_1M_PRICE_ID`), plan_type: 'standard', duration: 1 },
      standard_3m: { id: Deno.env.get(`${envPrefix}STANDARD_3M_PRICE_ID`), plan_type: 'standard', duration: 3 },
      feedback_1m: { id: Deno.env.get(`${envPrefix}FEEDBACK_1M_PRICE_ID`), plan_type: 'feedback', duration: 1 },
      feedback_3m: { id: Deno.env.get(`${envPrefix}FEEDBACK_3M_PRICE_ID`), plan_type: 'feedback', duration: 3 },
    };

    const prices: Record<string, PriceData> = {};
    const cacheRecords: any[] = [];

    for (const [key, config] of Object.entries(priceConfigs)) {
      if (!config.id) {
        console.warn(`⚠️ Price ID not found for ${key}`);
        continue;
      }

      try {
        console.log(`🔄 Fetching price: ${key} (${config.id})`);
        const price = await stripe.prices.retrieve(config.id);

        prices[key] = {
          id: price.id,
          unit_amount: price.unit_amount || 0,
          currency: price.currency,
          recurring: price.recurring,
        };

        // キャッシュ用のレコードを準備
        cacheRecords.push({
          price_id: price.id,
          product_id: price.product as string,
          plan_type: config.plan_type,
          duration: config.duration,
          unit_amount: price.unit_amount || 0,
          currency: price.currency,
          recurring_interval: price.recurring?.interval || null,
          recurring_interval_count: price.recurring?.interval_count || null,
          environment: ENVIRONMENT,
          cached_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        console.log(`✅ Fetched ${key}: ¥${price.unit_amount?.toLocaleString()}`);
      } catch (error) {
        console.error(`❌ Failed to fetch price ${key}:`, error);
      }
    }

    // Step 3: キャッシュをDBに保存（upsert）
    if (cacheRecords.length > 0) {
      const { error: upsertError } = await supabase
        .from('price_cache')
        .upsert(cacheRecords, {
          onConflict: 'price_id,environment',
          ignoreDuplicates: false
        });

      if (upsertError) {
        console.error('⚠️ Failed to cache prices:', upsertError);
      } else {
        console.log(`✅ Cached ${cacheRecords.length} prices to DB`);
      }
    }

    // Step 4: レスポンスを返す
    return new Response(JSON.stringify({
      prices,
      source: 'stripe_api',
      environment: ENVIRONMENT,
      fetched_count: Object.keys(prices).length
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error) {
    console.error("❌ Error in get-plan-prices:", error);
    return new Response(JSON.stringify({
      error: error.message,
      details: error.toString()
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

function formatCachedPrices(cachedPrices: CachedPrice[]) {
  const formatted: Record<string, any> = {};

  for (const cached of cachedPrices) {
    const key = `${cached.plan_type}_${cached.duration}m`;
    formatted[key] = {
      id: cached.price_id,
      unit_amount: cached.unit_amount,
      currency: cached.currency,
      recurring: {
        interval: 'month',
        interval_count: cached.duration,
      },
    };
  }

  return formatted;
}
