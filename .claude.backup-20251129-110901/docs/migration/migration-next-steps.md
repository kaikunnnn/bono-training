# データ移行 - 次のステップ

**作成日**: 2025-11-19
**現在の状況**: データ収集完了、実装準備段階

---

## 📊 現状まとめ

### 収集済みデータ

✅ **Supabase テーブル状況**

- `stripe_customers`: 8 件（テストデータ）
- `user_subscriptions`: 1 件（テストデータ）
- `subscriptions`: 7 件（テストデータ）

✅ **Stripe 顧客サンプル**

- 顧客 1: 春奈 宮地 (harunaru888@gmail.com) - ¥17,400（3 ヶ月プラン）
- 顧客 2: Tanology (amiried@icloud.com) - ¥6,800/月

✅ **既存プラン情報**

- Standard 1 ヶ月: ¥6,800/月 (price_1RStBiKUVUnt8GtynMfKweby)
- Standard 3 ヶ月: ¥5,800/月 (price_1RStCiKUVUnt8GtyKJiieo6d)
- Feedback 1 ヶ月: ¥1,480/月 (price_1OIiMRKUVUnt8GtyMGSJIH8H)
- Feedback 3 ヶ月: ¥1,280/月 (price_1OIiMRKUVUnt8GtyttXJ71Hz)

✅ **移行規模**

- 総顧客数: 2,162 人
- アクティブサブスクリプション: 250 件

---

## ⚠️ 発見された重要な問題

### 1. 価格の不一致

| プラン          | 既存顧客（本番） | テスト実装 | 差額    |
| --------------- | ---------------- | ---------- | ------- |
| Standard 1 ヶ月 | ¥6,800/月        | ¥4,000/月  | -¥2,800 |
| Standard 3 ヶ月 | ¥5,800/月        | ¥3,800/月  | -¥2,000 |

**影響**:

- 既存顧客を新 Price ID に移行すると大幅な値下げになる
- 既存サブスクリプション ID を維持すれば価格は変わらない

**推奨対応**: 既存顧客は既存 Price ID を維持（移行不要）

---

### 2. MemberStack メタデータ

全顧客に以下のメタデータが付与されている:

```json
{
  "msAppId": "app_cl9jkke7100ij0vkwg01c7s4v",
  "msMemberId": "mem_xxxxx"
}
```

**推奨対応**: メタデータを保持して移行（将来の参照用）

---

## 🎯 実装方針（確定版）

### 基本戦略

**既存の Stripe サブスクリプション ID を完全に維持する方式**

理由:

1. ✅ 価格変更なし（既存顧客に影響ゼロ）
2. ✅ 課金継続（リスクなし）
3. ✅ Stripe Webhook がそのまま動作
4. ✅ ロールバックが容易

---

## 📋 実装手順（詳細版）

### Phase 1: 準備作業（1 日）

#### Step 1-1: Supabase テストデータのクリア

```sql
-- 実行前に確認
SELECT COUNT(*) FROM stripe_customers;  -- 8件
SELECT COUNT(*) FROM user_subscriptions; -- 1件
SELECT COUNT(*) FROM subscriptions;      -- 7件

-- テストデータを削除
DELETE FROM subscriptions;
DELETE FROM user_subscriptions;
DELETE FROM stripe_customers;

-- 確認（全て0件になっていること）
SELECT COUNT(*) FROM stripe_customers;
SELECT COUNT(*) FROM user_subscriptions;
SELECT COUNT(*) FROM subscriptions;
```

#### Step 1-2: Stripe データのエクスポート

**方法**: Stripe Dashboard → データエクスポート

必要なデータ:

1. **顧客データ** (Customers)

   - Email
   - Customer ID
   - Created date
   - Metadata

2. **サブスクリプションデータ** (Subscriptions)
   - Subscription ID
   - Customer ID
   - Status (active, canceled, trialing, etc.)
   - Current period end
   - Cancel at period end
   - Price ID
   - Created date

**エクスポート手順**:

```
1. https://dashboard.stripe.com にログイン
2. 必ず本番モード（Live mode）に切り替え
3. 左メニュー「顧客」→ 右上「エクスポート」→ CSV
4. 左メニュー「サブスクリプション」→ 右上「エクスポート」→ CSV
5. ダウンロードしたCSVを確認
```

#### Step 1-3: データの検証

エクスポートした CSV を確認:

- 顧客数が 2,162 件前後か
- アクティブなサブスクリプションが 250 件前後か
- メールアドレスが全て含まれているか

---

### Phase 2: 移行スクリプトの作成（2-3 日）

#### Script 1: Supabase Auth ユーザー作成

```typescript
// scripts/migrate-create-auth-users.ts
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface StripeCustomer {
  id: string; // Stripe Customer ID
  email: string;
  created: string;
  metadata_msAppId?: string;
  metadata_msMemberId?: string;
}

async function createAuthUsers() {
  // CSVを読み込み
  const csvContent = fs.readFileSync("./stripe-customers.csv", "utf-8");
  const customers: StripeCustomer[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Total customers to migrate: ${customers.length}`);

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ email: string; error: string }> = [];

  // バッチ処理（50件ずつ）
  for (let i = 0; i < customers.length; i += 50) {
    const batch = customers.slice(i, i + 50);

    await Promise.all(
      batch.map(async (customer) => {
        try {
          // Supabase Authユーザーを作成
          const { data: authData, error: authError } =
            await supabase.auth.admin.createUser({
              email: customer.email,
              email_confirm: true, // メール確認済みとする
              user_metadata: {
                stripe_customer_id: customer.id,
                memberstack_app_id: customer.metadata_msAppId,
                memberstack_member_id: customer.metadata_msMemberId,
                migrated_from: "stripe",
                migrated_at: new Date().toISOString(),
              },
            });

          if (authError) {
            throw authError;
          }

          console.log(
            `✅ Created user: ${customer.email} (${authData.user.id})`
          );
          successCount++;
        } catch (error: any) {
          console.error(
            `❌ Failed to create user: ${customer.email}`,
            error.message
          );
          errors.push({ email: customer.email, error: error.message });
          errorCount++;
        }
      })
    );

    // レート制限対策（1秒待機）
    if (i + 50 < customers.length) {
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // 結果サマリー
  console.log("\n========================================");
  console.log("Migration Summary");
  console.log("========================================");
  console.log(`Total: ${customers.length}`);
  console.log(`Success: ${successCount}`);
  console.log(`Error: ${errorCount}`);

  if (errors.length > 0) {
    console.log("\nErrors:");
    errors.forEach((e) => {
      console.log(`  - ${e.email}: ${e.error}`);
    });

    // エラーログをファイルに保存
    fs.writeFileSync(
      "./migration-errors-auth.json",
      JSON.stringify(errors, null, 2)
    );
  }
}

createAuthUsers().catch(console.error);
```

#### Script 2: stripe_customers テーブルの同期

```typescript
// scripts/migrate-stripe-customers.ts
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface StripeCustomer {
  id: string;
  email: string;
}

async function migrateStripeCustomers() {
  const csvContent = fs.readFileSync("./stripe-customers.csv", "utf-8");
  const customers: StripeCustomer[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Total customers to sync: ${customers.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (const customer of customers) {
    try {
      // メールアドレスからSupabase AuthのユーザーIDを取得
      const { data: users, error: getUserError } =
        await supabase.auth.admin.listUsers();

      if (getUserError) throw getUserError;

      const user = users.users.find((u) => u.email === customer.email);

      if (!user) {
        throw new Error(`User not found for email: ${customer.email}`);
      }

      // stripe_customersテーブルにupsert
      const { error: insertError } = await supabase
        .from("stripe_customers")
        .upsert({
          user_id: user.id,
          stripe_customer_id: customer.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      console.log(`✅ Synced: ${customer.email} → ${customer.id}`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed: ${customer.email}`, error.message);
      errorCount++;
    }
  }

  console.log("\n========================================");
  console.log(`Success: ${successCount} / ${customers.length}`);
  console.log(`Error: ${errorCount}`);
  console.log("========================================");
}

migrateStripeCustomers().catch(console.error);
```

#### Script 3: user_subscriptions テーブルの同期

```typescript
// scripts/migrate-subscriptions.ts
import { createClient } from "@supabase/supabase-js";
import { parse } from "csv-parse/sync";
import * as fs from "fs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface StripeSubscription {
  id: string; // Subscription ID
  customer: string; // Customer ID
  status: string;
  current_period_end: string;
  cancel_at_period_end: string;
  price: string; // Price ID
}

// Price IDからプラン情報を判定
function getPlanInfo(priceId: string) {
  const planMap: Record<string, { planType: string; duration: number }> = {
    price_1RStBiKUVUnt8GtynMfKweby: { planType: "standard", duration: 1 },
    price_1RStCiKUVUnt8GtyKJiieo6d: { planType: "standard", duration: 3 },
    price_1OIiMRKUVUnt8GtyMGSJIH8H: { planType: "feedback", duration: 1 },
    price_1OIiMRKUVUnt8GtyttXJ71Hz: { planType: "feedback", duration: 3 },
  };

  return planMap[priceId] || { planType: "standard", duration: 1 };
}

async function migrateSubscriptions() {
  const csvContent = fs.readFileSync("./stripe-subscriptions.csv", "utf-8");
  const subscriptions: StripeSubscription[] = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`Total subscriptions to migrate: ${subscriptions.length}`);

  let successCount = 0;
  let errorCount = 0;

  for (const sub of subscriptions) {
    try {
      // stripe_customersテーブルからuser_idを取得
      const { data: customerData, error: getCustomerError } = await supabase
        .from("stripe_customers")
        .select("user_id")
        .eq("stripe_customer_id", sub.customer)
        .single();

      if (getCustomerError || !customerData) {
        throw new Error(`Customer not found: ${sub.customer}`);
      }

      const planInfo = getPlanInfo(sub.price);
      const isActive = sub.status === "active" || sub.status === "trialing";
      const cancelAtPeriodEnd = sub.cancel_at_period_end === "true";

      // user_subscriptionsテーブルにupsert
      const { error: insertError } = await supabase
        .from("user_subscriptions")
        .upsert({
          user_id: customerData.user_id,
          stripe_subscription_id: sub.id,
          stripe_customer_id: sub.customer,
          plan_type: planInfo.planType,
          duration: planInfo.duration,
          is_active: isActive,
          plan_members: planInfo.planType === "standard", // Standardプランのみtrue
          cancel_at_period_end: cancelAtPeriodEnd,
          current_period_end: new Date(
            parseInt(sub.current_period_end) * 1000
          ).toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

      if (insertError) throw insertError;

      console.log(`✅ Migrated subscription: ${sub.id} (${sub.status})`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed: ${sub.id}`, error.message);
      errorCount++;
    }
  }

  console.log("\n========================================");
  console.log(`Success: ${successCount} / ${subscriptions.length}`);
  console.log(`Error: ${errorCount}`);
  console.log("========================================");
}

migrateSubscriptions().catch(console.error);
```

---

### Phase 3: テスト実行（1 日）

#### Test 1: サンプルデータでのテスト

1. 10 件のサンプルデータで移行テスト
2. データの整合性確認
3. エラーハンドリングの確認

#### Test 2: 全データ移行（本番）

1. 上記スクリプトを順番に実行
2. エラーログを確認
3. データ件数を確認

```sql
-- 移行後の確認
SELECT COUNT(*) FROM stripe_customers;      -- 2,162件前後
SELECT COUNT(*) FROM user_subscriptions;    -- 250件前後（アクティブのみ）
SELECT COUNT(*) FROM auth.users;            -- 2,162件前後

-- データの整合性確認
SELECT
  u.email,
  sc.stripe_customer_id,
  us.plan_type,
  us.duration,
  us.is_active
FROM auth.users u
LEFT JOIN stripe_customers sc ON u.id = sc.user_id
LEFT JOIN user_subscriptions us ON u.id = us.user_id
LIMIT 10;
```

---

### Phase 4: 並行稼働テスト（1-2 週間）

#### 既存サイト

- そのまま稼働
- MemberStack + Stripe

#### 新サイト

- Supabase + Stripe
- 同じ Stripe アカウント
- Webhook で自動同期

#### 確認事項

- [ ] 既存顧客が新サイトでログインできる
- [ ] サブスクリプション情報が正しく表示される
- [ ] Webhook が正常に動作する
- [ ] 課金が継続される
- [ ] キャンセル済みユーザーの状態が正しい

---

## 📝 必要なアクション

### あなたがやること

#### 1. Stripe データのエクスポート（必須）

以下の手順で CSV をエクスポート:

```
【顧客データ】
1. https://dashboard.stripe.com にログイン
2. 右上のトグルで「本番モード」に切り替え
3. 左メニュー「顧客」→ 右上「エクスポート」
4. 全データを選択 → CSV形式でダウンロード
5. ファイル名を stripe-customers.csv にリネーム

【サブスクリプションデータ】
1. 左メニュー「サブスクリプション」→ 右上「エクスポート」
2. 全データを選択 → CSV形式でダウンロード
3. ファイル名を stripe-subscriptions.csv にリネーム
```

#### 2. Supabase Service Role Key の取得（必須）

```
1. https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/settings/api
2. 「Project API keys」セクション
3. service_role の「Reveal」をクリック
4. コピーして .env に追加:
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### 3. テストデータのクリア（推奨）

Supabase Dashboard → SQL Editor で実行:

```sql
DELETE FROM subscriptions;
DELETE FROM user_subscriptions;
DELETE FROM stripe_customers;
```

---

### 私がやること

#### 1. 移行スクリプトの最終調整

- CSV の構造に合わせた調整
- エラーハンドリングの強化
- ログ出力の改善

#### 2. テスト実行のサポート

- サンプルデータでの動作確認
- エラー解析
- データ検証

#### 3. ドキュメント作成

- 移行手順書の詳細版
- トラブルシューティングガイド
- ロールバック手順

---

## ⏰ スケジュール（目安）

| フェーズ           | 内容                                      | 所要時間 |
| ------------------ | ----------------------------------------- | -------- |
| **準備**           | データエクスポート、Service Role Key 取得 | 30 分    |
| **スクリプト調整** | CSV に合わせた調整                        | 2-3 時間 |
| **サンプルテスト** | 10 件でテスト実行                         | 1 時間   |
| **本番移行**       | 全データ移行                              | 2-3 時間 |
| **検証**           | データ確認、修正                          | 2-3 時間 |
| **並行稼働**       | 両サイトでテスト                          | 1-2 週間 |

**合計**: 準備完了後、1 日で移行完了可能

---

## 🚨 リスクと対策

### リスク 1: メールアドレスの重複

**対策**: エラーログに記録し、手動で確認

### リスク 2: CSV の形式が異なる

**対策**: サンプルテストで事前確認

### リスク 3: レート制限

**対策**: バッチ処理 + 待機時間

### リスク 4: データの不整合

**対策**: 移行前後でカウント確認

---

## ✅ チェックリスト

移行前:

- [○] Stripe から顧客データをエクスポート (stripe-customers.csv)
- [○] Stripe からサブスクリプションデータをエクスポート (stripe-subscriptions.csv)
- [○] Supabase Service Role Key を取得
- [○] .env に SUPABASE_SERVICE_ROLE_KEY を追加
- [なし] Supabase のテストデータをクリア

移行中:

- [ ] Script 1: Auth ユーザー作成を実行
- [ ] Script 2: stripe_customers を実行
- [ ] Script 3: user_subscriptions を実行
- [ ] エラーログを確認
- [ ] データ件数を確認

移行後:

- [ ] 既存顧客でログインテスト
- [ ] サブスクリプション情報の表示確認
- [ ] Webhook の動作確認
- [ ] 1 週間の並行稼働

---

**次にやること**: 上記「あなたがやること」の 3 つを実行してください。完了したら教えてください！
