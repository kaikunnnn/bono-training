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
      console.error('❌ 料金取得エラー:', error);
      return { prices: null, source: 'edge_function_cache', error };
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
    const duration = Math.round(performance.now() - startTime);
    console.error(`❌ 料金取得エラー (${duration}ms):`, error);
    return { prices: null, source: 'edge_function_cache', error };
  }
}
