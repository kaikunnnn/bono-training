import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface PlanPrice {
  id: string;
  unit_amount: number;
  currency: string;
  recurring: {
    interval: string;
    interval_count: number;
  };
}

export interface PlanPrices {
  standard_1m: PlanPrice;
  standard_3m: PlanPrice;
  feedback_1m: PlanPrice;
  feedback_3m: PlanPrice;
}

export interface GetPlanPricesResponse {
  prices: PlanPrices | null;
  source: 'frontend_cache' | 'edge_function_cache' | 'stripe_api';
  error: any;
}

// フロントエンドキャッシュの設定
const CACHE_KEY = 'bono_plan_prices_v1';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5分

// メモリキャッシュ（セッション内で瞬時にアクセス）
let memoryCache: { prices: PlanPrices; timestamp: number } | null = null;

interface CachedData {
  prices: PlanPrices;
  timestamp: number;
}

/**
 * localStorageからキャッシュを取得
 */
function getLocalStorageCache(): PlanPrices | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;

    const data: CachedData = JSON.parse(cached);

    // TTLチェック
    if (Date.now() - data.timestamp > CACHE_TTL_MS) {
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    // データ構造バリデーション
    if (!data.prices?.standard_1m?.unit_amount ||
        !data.prices?.standard_3m?.unit_amount ||
        !data.prices?.feedback_1m?.unit_amount ||
        !data.prices?.feedback_3m?.unit_amount) {
      console.warn('⚠️ Invalid cache data structure, removing cache');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }

    return data.prices;
  } catch (error) {
    console.warn('⚠️ Cache read error:', error);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

/**
 * localStorageにキャッシュを保存
 */
function setLocalStorageCache(prices: PlanPrices): void {
  try {
    const data: CachedData = {
      prices,
      timestamp: Date.now()
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch (error) {
    console.warn('⚠️ Cache write error:', error);
  }
}

/**
 * Stripe料金を取得（3段階キャッシュ）
 * - メモリキャッシュヒット: 0ms（同一セッション内）
 * - localStorageキャッシュヒット: 0-5ms（5分以内の再訪問）
 * - Edge Functionキャッシュヒット: 700ms（DBキャッシュ経由）
 * - Stripe APIフェッチ: 4000-5000ms（初回のみ）
 */
export async function getPlanPrices(): Promise<GetPlanPricesResponse> {
  const startTime = performance.now();

  // Step 1: メモリキャッシュチェック（最速）
  if (memoryCache && Date.now() - memoryCache.timestamp < CACHE_TTL_MS) {
    const duration = Math.round(performance.now() - startTime);
    console.log(`✅ 料金取得成功 (frontend_cache [memory], ${duration}ms):`, memoryCache.prices);
    return {
      prices: memoryCache.prices,
      source: 'frontend_cache',
      error: null
    };
  }

  // Step 2: localStorageキャッシュチェック（高速）
  const cachedPrices = getLocalStorageCache();
  if (cachedPrices) {
    const duration = Math.round(performance.now() - startTime);
    console.log(`✅ 料金取得成功 (frontend_cache [localStorage], ${duration}ms):`, cachedPrices);

    // メモリキャッシュも更新
    memoryCache = {
      prices: cachedPrices,
      timestamp: Date.now()
    };

    return {
      prices: cachedPrices,
      source: 'frontend_cache',
      error: null
    };
  }

  // Step 3: Edge Function経由で取得（中速 or 低速）
  try {
    const { data, error } = await supabase.functions.invoke('get-plan-prices');

    const duration = Math.round(performance.now() - startTime);

    if (error) {
      console.warn('⚠️ Edge Functionエラー、DBフォールバックを試行:', error);
      return await fetchFromPriceCache(startTime);
    }

    console.log(`✅ 料金取得成功 (${data.source}, ${duration}ms):`, data.prices);

    // キャッシュに保存
    if (data.prices) {
      setLocalStorageCache(data.prices);
      memoryCache = {
        prices: data.prices,
        timestamp: Date.now()
      };
    }

    return {
      prices: data.prices,
      source: data.source === 'cache' ? 'edge_function_cache' : 'stripe_api',
      error: null
    };
  } catch (error) {
    console.warn('⚠️ Edge Functionエラー、DBフォールバックを試行:', error);
    return await fetchFromPriceCache(startTime);
  }
}

/**
 * price_cacheテーブルから直接料金を取得（フォールバック用）
 */
async function fetchFromPriceCache(startTime: number): Promise<GetPlanPricesResponse> {
  try {
    // 本番環境かどうかを判定（VITEの環境変数で判断）
    const isProduction = import.meta.env.PROD;
    const environment = isProduction ? 'live' : 'test';

    const { data: cachedPrices, error } = await supabase
      .from('price_cache')
      .select('*')
      .eq('environment', environment);

    if (error || !cachedPrices || cachedPrices.length < 4) {
      console.warn('⚠️ DBフォールバック失敗、ハードコード価格を使用:', error);
      return getHardcodedPrices(startTime, isProduction);
    }

    // キャッシュデータを整形
    const prices: PlanPrices = {} as PlanPrices;
    for (const cached of cachedPrices) {
      const key = `${cached.plan_type}_${cached.duration}m` as keyof PlanPrices;
      prices[key] = {
        id: cached.price_id,
        unit_amount: cached.unit_amount,
        currency: cached.currency,
        recurring: {
          interval: cached.recurring_interval || 'month',
          interval_count: cached.recurring_interval_count || cached.duration,
        },
      };
    }

    const duration = Math.round(performance.now() - startTime);
    console.log(`✅ 料金取得成功 (db_fallback, ${duration}ms):`, prices);

    // キャッシュに保存
    setLocalStorageCache(prices);
    memoryCache = {
      prices,
      timestamp: Date.now()
    };

    return {
      prices,
      source: 'edge_function_cache',
      error: null
    };
  } catch (error) {
    console.warn('⚠️ DBフォールバック失敗、ハードコード価格を使用:', error);
    const isProduction = import.meta.env.PROD;
    return getHardcodedPrices(startTime, isProduction);
  }
}

/**
 * ハードコードされた価格（最終フォールバック）
 * 本番のprice_cacheテーブルの値と同期させること
 */
function getHardcodedPrices(startTime: number, isProduction: boolean): GetPlanPricesResponse {
  const duration = Math.round(performance.now() - startTime);

  // 本番価格（2026-01-13時点のprice_cache値）
  const livePrices: PlanPrices = {
    standard_1m: { id: 'price_1RStBiKUVUnt8GtynMfKweby', unit_amount: 6800, currency: 'jpy', recurring: { interval: 'month', interval_count: 1 } },
    standard_3m: { id: 'price_1RStCiKUVUnt8GtyKJiieo6d', unit_amount: 17400, currency: 'jpy', recurring: { interval: 'month', interval_count: 3 } },
    feedback_1m: { id: 'price_1RStgOKUVUnt8GtyVPVelPg3', unit_amount: 15800, currency: 'jpy', recurring: { interval: 'month', interval_count: 1 } },
    feedback_3m: { id: 'price_1RSuB1KUVUnt8GtyAwgTK4Cp', unit_amount: 41400, currency: 'jpy', recurring: { interval: 'month', interval_count: 3 } },
  };

  // テスト価格
  const testPrices: PlanPrices = {
    standard_1m: { id: 'price_1OIiOUKUVUnt8GtyOfXEoEvW', unit_amount: 4980, currency: 'jpy', recurring: { interval: 'month', interval_count: 1 } },
    standard_3m: { id: 'price_1OIiPpKUVUnt8Gty0OH3Pyip', unit_amount: 11940, currency: 'jpy', recurring: { interval: 'month', interval_count: 3 } },
    feedback_1m: { id: 'price_1OIiMRKUVUnt8GtyMGSJIH8H', unit_amount: 9999, currency: 'jpy', recurring: { interval: 'month', interval_count: 1 } },
    feedback_3m: { id: 'price_1OIiMRKUVUnt8GtyttXJ71Hz', unit_amount: 26400, currency: 'jpy', recurring: { interval: 'month', interval_count: 3 } },
  };

  const prices = isProduction ? livePrices : testPrices;

  console.log(`✅ 料金取得成功 (hardcoded_fallback, ${duration}ms):`, prices);

  // キャッシュに保存
  setLocalStorageCache(prices);
  memoryCache = {
    prices,
    timestamp: Date.now()
  };

  return {
    prices,
    source: 'frontend_cache',
    error: null
  };
}
