# Phase 2: Stripe料金取得実装計画（DBキャッシュ付き）

**作成日**: 2025-11-28
**優先度**: 高
**目的**: ハードコードされた料金を削除し、Stripeから実際の料金を取得・表示する

**関連ドキュメント**:
- `phase4-fix-implementation-plan.md`
- `2025-11-28-webhook-fix-success.md`

---

## 📋 実装概要

### 問題
- フロントエンド表示: スタンダード **¥4,000/月** ❌
- Stripe実際の料金: スタンダード **¥4,980/月** ✅
- プロレーション計算も間違った金額で行われている

### 解決策
**Option A改良版（DBキャッシュ付き）** を実装

**パフォーマンス目標**:
- 初回ユーザー: 500ms〜1秒（Stripe API呼び出し）
- 2回目以降のユーザー: **50ms以下**（DBキャッシュから取得）
- キャッシュ有効期間: 1時間

---

## 🏗️ アーキテクチャ設計

```
┌─────────────┐
│ Frontend    │
│ (React)     │
└──────┬──────┘
       │ GET /get-plan-prices
       ▼
┌─────────────────────────────┐
│ Edge Function               │
│ get-plan-prices             │
│                             │
│ 1. Check cache (DB)         │
│    ├─ Fresh? → Return cache │
│    └─ Stale? → Fetch Stripe │
│                             │
│ 2. Fetch from Stripe API    │
│ 3. Save to cache (DB)       │
│ 4. Return prices            │
└─────────────────────────────┘
       │                    │
       ▼                    ▼
┌─────────────┐      ┌─────────────┐
│ Supabase DB │      │ Stripe API  │
│ price_cache │      │ /v1/prices  │
└─────────────┘      └─────────────┘
```

---

## 📊 データベース設計

### テーブル: `price_cache`

```sql
CREATE TABLE price_cache (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  price_id TEXT NOT NULL UNIQUE,           -- Stripe Price ID (例: price_xxx)
  product_id TEXT NOT NULL,                 -- Stripe Product ID
  plan_type TEXT NOT NULL,                  -- 'standard' or 'feedback'
  duration INTEGER NOT NULL,                -- 1 or 3 (months)
  unit_amount INTEGER NOT NULL,             -- 料金（円単位、例: 4980）
  currency TEXT NOT NULL DEFAULT 'jpy',     -- 通貨
  recurring_interval TEXT,                  -- 'month'
  recurring_interval_count INTEGER,         -- 1 or 3
  environment TEXT NOT NULL,                -- 'test' or 'live'
  cached_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), -- キャッシュ保存日時
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- インデックス用
  CONSTRAINT unique_price_per_env UNIQUE (price_id, environment)
);

-- インデックス
CREATE INDEX idx_price_cache_plan ON price_cache(plan_type, duration, environment);
CREATE INDEX idx_price_cache_cached_at ON price_cache(cached_at);

-- RLS (Row Level Security)
ALTER TABLE price_cache ENABLE ROW LEVEL SECURITY;

-- 誰でも読める（料金は公開情報）
CREATE POLICY "Anyone can read price_cache"
  ON price_cache FOR SELECT
  USING (true);

-- Edge Functionのみ書き込める
CREATE POLICY "Service role can manage price_cache"
  ON price_cache FOR ALL
  USING (auth.role() = 'service_role');
```

---

## 🔧 実装ステップ

### Step 1: データベースマイグレーション作成

**ファイル**: `supabase/migrations/YYYYMMDDHHMMSS_create_price_cache_table.sql`

```sql
-- 上記のCREATE TABLE文を含める
```

**実行**:
```bash
npx supabase db push
```

---

### Step 2: Edge Function `get-plan-prices` 実装

**ファイル**: `supabase/functions/get-plan-prices/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
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

serve(async (req) => {
  // CORS対応
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Supabaseクライアント作成
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Step 1: キャッシュをチェック
    const { data: cachedPrices, error: cacheError } = await supabase
      .from('price_cache')
      .select('*')
      .eq('environment', ENVIRONMENT)
      .gte('cached_at', new Date(Date.now() - CACHE_TTL_SECONDS * 1000).toISOString());

    if (!cacheError && cachedPrices && cachedPrices.length > 0) {
      console.log(`✅ Cache hit: ${cachedPrices.length} prices from DB`);

      // キャッシュを整形して返す
      const formattedPrices = formatCachedPrices(cachedPrices);

      return new Response(JSON.stringify({
        prices: formattedPrices,
        source: 'cache',
        environment: ENVIRONMENT
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log('❌ Cache miss or stale, fetching from Stripe...');

    // Step 2: Stripe APIから取得
    const stripe = createStripeClient(ENVIRONMENT);
    const envPrefix = ENVIRONMENT === 'test' ? "STRIPE_TEST_" : "STRIPE_";

    const priceIds = {
      standard_1m: { id: Deno.env.get(`${envPrefix}STANDARD_1M_PRICE_ID`), plan_type: 'standard', duration: 1 },
      standard_3m: { id: Deno.env.get(`${envPrefix}STANDARD_3M_PRICE_ID`), plan_type: 'standard', duration: 3 },
      feedback_1m: { id: Deno.env.get(`${envPrefix}FEEDBACK_1M_PRICE_ID`), plan_type: 'feedback', duration: 1 },
      feedback_3m: { id: Deno.env.get(`${envPrefix}FEEDBACK_3M_PRICE_ID`), plan_type: 'feedback', duration: 3 },
    };

    const prices: Record<string, PriceData> = {};
    const cacheRecords: any[] = [];

    for (const [key, config] of Object.entries(priceIds)) {
      if (!config.id) {
        console.warn(`⚠️ Price ID not found for ${key}`);
        continue;
      }

      try {
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
      } catch (error) {
        console.error(`❌ Failed to fetch price ${key}:`, error);
      }
    }

    // Step 3: キャッシュをDBに保存（upsert）
    if (cacheRecords.length > 0) {
      const { error: upsertError } = await supabase
        .from('price_cache')
        .upsert(cacheRecords, { onConflict: 'price_id,environment' });

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
      environment: ENVIRONMENT
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
```

---

### Step 3: フロントエンド実装

#### 3-1. 料金取得サービス作成

**ファイル**: `src/services/pricing.ts` (新規作成)

```typescript
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

export async function getPlanPrices(): Promise<{
  prices: PlanPrices | null;
  source: 'cache' | 'stripe_api';
  error: any;
}> {
  try {
    const { data, error } = await supabase.functions.invoke('get-plan-prices');

    if (error) {
      console.error('料金取得エラー:', error);
      return { prices: null, source: 'cache', error };
    }

    return {
      prices: data.prices,
      source: data.source,
      error: null
    };
  } catch (error) {
    console.error('料金取得エラー:', error);
    return { prices: null, source: 'cache', error };
  }
}
```

#### 3-2. `Subscription.tsx` を更新

**変更箇所**: `src/pages/Subscription.tsx`

```typescript
import { useState, useEffect } from 'react';
import { getPlanPrices, PlanPrices } from '../services/pricing';

// ... 既存のコード ...

export default function Subscription() {
  const [planPrices, setPlanPrices] = useState<PlanPrices | null>(null);
  const [pricesLoading, setPricesLoading] = useState(true);

  // 料金を取得
  useEffect(() => {
    async function fetchPrices() {
      setPricesLoading(true);
      const { prices, source, error } = await getPlanPrices();

      if (!error && prices) {
        setPlanPrices(prices);
        console.log(`料金取得成功 (${source}):`, prices);
      } else {
        console.error('料金取得失敗:', error);
      }

      setPricesLoading(false);
    }

    fetchPrices();
  }, []);

  // プラン定義を動的に生成
  const plans = planPrices ? [
    {
      id: 'standard',
      name: 'スタンダード',
      description: '全てのコンテンツにアクセスできる基本プラン',
      durations: [
        {
          months: 1,
          price: planPrices.standard_1m.unit_amount,
          priceLabel: `¥${planPrices.standard_1m.unit_amount.toLocaleString()}/月`
        },
        {
          months: 3,
          price: planPrices.standard_3m.unit_amount,
          priceLabel: `¥${planPrices.standard_3m.unit_amount.toLocaleString()}/月（3ヶ月）`
        }
      ]
    },
    {
      id: 'feedback',
      name: 'フィードバック',
      description: 'デザインフィードバックを受けられるプラン',
      durations: [
        {
          months: 1,
          price: planPrices.feedback_1m.unit_amount,
          priceLabel: `¥${planPrices.feedback_1m.unit_amount.toLocaleString()}/月`
        },
        {
          months: 3,
          price: planPrices.feedback_3m.unit_amount,
          priceLabel: `¥${planPrices.feedback_3m.unit_amount.toLocaleString()}/月（3ヶ月）`
        }
      ]
    }
  ] : null; // ローディング中はnull

  // ローディング表示
  if (pricesLoading || !plans) {
    return (
      <div className="loading-container">
        <p>料金プランを読み込み中...</p>
      </div>
    );
  }

  // ... 残りのコード（plans変数を使用）...
}
```

#### 3-3. `subscriptionPlans.ts` を更新

**ファイル**: `src/utils/subscriptionPlans.ts`

**ハードコードされた料金を削除**:

```typescript
// ❌ 削除: ハードコードされた料金
// export const AVAILABLE_PLANS: PlanInfo[] = [
//   {
//     type: 'standard',
//     duration: 1,
//     pricePerMonth: 4000,  // ← 削除
//   },
//   // ...
// ];

// ✅ 代わりに: 型定義のみ保持
export interface PlanInfo {
  type: 'standard' | 'feedback';
  duration: 1 | 3;
  displayName: string;
  description: string;
  // pricePerMonth は削除（動的取得するため）
}

// 料金以外の情報のみ定義
export const PLAN_METADATA = {
  standard: {
    displayName: 'スタンダード',
    description: '全てのコンテンツにアクセスできる基本プラン',
  },
  feedback: {
    displayName: 'フィードバック',
    description: 'デザインフィードバックを受けられるプラン',
  },
} as const;
```

---

## 🧪 テスト計画

### テスト1: DBキャッシュが正しく動作するか

1. Edge Function `get-plan-prices` を呼び出す（初回）
   - ✅ Stripe APIから取得
   - ✅ DBに保存される
   - ✅ `source: 'stripe_api'` が返る

2. もう一度呼び出す（2回目、1時間以内）
   - ✅ DBキャッシュから取得
   - ✅ `source: 'cache'` が返る
   - ✅ レスポンスが50ms以下

3. 1時間後に呼び出す（キャッシュ期限切れ）
   - ✅ Stripe APIから再取得
   - ✅ DBを更新

### テスト2: フロントエンドで正しい料金が表示されるか

1. `/subscription` ページを開く
   - ✅ スタンダード1ヶ月: **¥4,980/月** と表示
   - ✅ スタンダード3ヶ月: 正しい料金が表示
   - ✅ フィードバック1ヶ月: 正しい料金が表示
   - ✅ フィードバック3ヶ月: 正しい料金が表示

2. プロレーション計算が正しいか
   - ✅ モーダルで正しい返金額・請求額が表示される

### テスト3: パフォーマンス測定

```javascript
// ブラウザのConsoleで測定
console.time('料金取得');
await getPlanPrices();
console.timeEnd('料金取得');

// 目標:
// 初回: 500ms〜1秒
// 2回目以降: 50ms以下
```

---

## ✅ 完了条件

- [ ] `price_cache` テーブルが作成されている
- [ ] Edge Function `get-plan-prices` がデプロイされている
- [ ] キャッシュロジックが正しく動作する（1時間TTL）
- [ ] フロントエンドで正しい料金が表示される
- [ ] ハードコードされた料金がすべて削除されている
- [ ] パフォーマンス目標達成（2回目以降50ms以下）
- [ ] エラーハンドリングが適切
- [ ] テストがすべてパスする

---

## 📝 注意事項

### 1. 環境変数の確認

実装前に以下の環境変数が設定されているか確認:
```bash
npx supabase secrets list | grep PRICE_ID
```

必要な変数:
- `STRIPE_TEST_STANDARD_1M_PRICE_ID`
- `STRIPE_TEST_STANDARD_3M_PRICE_ID`
- `STRIPE_TEST_FEEDBACK_1M_PRICE_ID`
- `STRIPE_TEST_FEEDBACK_3M_PRICE_ID`

### 2. キャッシュ無効化

テスト時や緊急時にキャッシュをクリアする方法:

```sql
-- すべてのキャッシュを削除
DELETE FROM price_cache;

-- 特定の環境のキャッシュのみ削除
DELETE FROM price_cache WHERE environment = 'test';
```

### 3. Stripe料金変更時の対応

Stripe Dashboardで料金を変更した場合:
1. 最大1時間後に自動反映される（キャッシュTTL）
2. 即座に反映したい場合はキャッシュをクリア

---

**作成日**: 2025-11-28
**最終更新**: 2025-11-28
**ステータス**: 実装準備完了
