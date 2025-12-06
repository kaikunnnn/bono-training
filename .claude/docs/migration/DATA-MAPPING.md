# データマッピング詳細

**作成日**: 2025-12-04

---

## データフロー

```
Memberstack              →  Supabase Auth     →  Supabase DB
─────────────────────────────────────────────────────────────
email                    →  auth.users.email  →  (参照のみ)
(password hash不可)      →  (仮パスワード)    →  -
stripe_customer_id       →  -                 →  stripe_customers.stripe_customer_id
                                              →  user_subscriptions.stripe_customer_id
```

---

## 入力データ形式（Memberstack エクスポート）

### CSV形式

```csv
email,stripe_customer_id,memberstack_id,plan_name
user1@example.com,cus_ABC123,mem_xxx,Pro Plan
user2@example.com,cus_DEF456,mem_yyy,Standard Plan
```

### 必須フィールド

| フィールド | 説明 | 例 |
|------------|------|-----|
| email | ユーザーのメールアドレス | user@example.com |
| stripe_customer_id | StripeカスタマーID | cus_ABC123 |

### オプションフィールド

| フィールド | 説明 | 用途 |
|------------|------|------|
| memberstack_id | MemberstackユーザーID | ログ・追跡用 |
| plan_name | Memberstackプラン名 | 参考情報 |

---

## Supabase Auth ユーザー作成

### 作成されるデータ

```typescript
// auth.users に作成されるレコード
{
  id: "uuid-generated",           // 自動生成
  email: "user@example.com",      // CSVから
  encrypted_password: "...",      // 仮パスワード（ランダム生成）
  email_confirmed_at: "now()",    // 移行時に確認済みとする
  raw_user_meta_data: {
    migrated_from: "memberstack",
    migrated_at: "2025-12-04T00:00:00Z"
  }
}
```

### パスワード処理

- Memberstackのパスワードハッシュは取得不可
- 仮パスワードを生成してユーザー作成
- 移行完了後、パスワードリセットメールを送信

---

## stripe_customers テーブル

### 挿入データ

```typescript
{
  id: "uuid-generated",
  user_id: "auth.users.id",        // 新規作成されたユーザーID
  stripe_customer_id: "cus_ABC123", // CSVから
  environment: "live",
  created_at: "now()",
  updated_at: "now()"
}
```

### 重複チェック

```sql
-- 移行前に実行
SELECT stripe_customer_id, COUNT(*)
FROM stripe_customers
WHERE environment = 'live'
GROUP BY stripe_customer_id
HAVING COUNT(*) > 1;
```

---

## user_subscriptions テーブル

### Stripeからの取得データ

```typescript
// Stripe API レスポンス
{
  id: "sub_ABC123",
  customer: "cus_ABC123",
  status: "active",  // active, canceled, past_due, etc.
  items: {
    data: [{
      price: {
        id: "price_xxx",
        product: "prod_xxx"
      }
    }]
  },
  current_period_end: 1735689600,  // Unix timestamp
  cancel_at_period_end: false,
  canceled_at: null
}
```

### プランタイプマッピング

| Stripe Price ID | plan_type | plan_members | duration |
|-----------------|-----------|--------------|----------|
| price_1RStBiKUVUnt8GtynMfKweby | standard | true | 1 |
| price_1RStCiKUVUnt8GtyKJiieo6d | standard | true | 3 |
| price_1RStgOKUVUnt8GtyVPVelPg3 | feedback | true | 1 |
| price_1RSuB1KUVUnt8GtyAwgTK4Cp | feedback | true | 3 |

### 挿入データ

```typescript
{
  id: "uuid-generated",
  user_id: "auth.users.id",
  plan_type: "standard",           // Price IDから判定
  is_active: true,                 // Stripe statusから判定
  stripe_subscription_id: "sub_ABC123",
  stripe_customer_id: "cus_ABC123",
  plan_members: true,              // standard/feedbackは両方true
  duration: 1,                     // Price IDから判定
  cancel_at_period_end: false,     // Stripeから
  current_period_end: "2025-01-01T00:00:00Z",  // Stripeから
  environment: "live",
  created_at: "now()",
  updated_at: "now()"
}
```

---

## is_active 判定ロジック

```typescript
function determineIsActive(stripeStatus: string): boolean {
  const activeStatuses = ['active', 'trialing'];
  return activeStatuses.includes(stripeStatus);
}

// Stripe subscription.status の値
// - active: アクティブ
// - trialing: トライアル中
// - past_due: 支払い遅延（まだアクセス可能な場合あり）
// - canceled: キャンセル済み
// - unpaid: 未払い
// - incomplete: 未完了
// - incomplete_expired: 未完了で期限切れ
```

---

## サブスクなしユーザーの処理

Stripeにサブスクリプションがないユーザーの場合：

```typescript
{
  user_id: "auth.users.id",
  plan_type: "free",
  is_active: false,
  stripe_subscription_id: null,
  stripe_customer_id: "cus_ABC123",  // 顧客IDは保持
  plan_members: false,
  duration: null,
  current_period_end: null,
  environment: "live"
}
```

---

## バリデーションルール

### 移行前チェック

| チェック項目 | 条件 | 対応 |
|--------------|------|------|
| メール形式 | 有効なメールアドレス | 無効な場合スキップ |
| メール重複 | auth.usersに既存 | スキップ（ログ記録） |
| Stripe顧客ID形式 | cus_で始まる | 無効な場合スキップ |
| Stripe顧客存在 | Stripe APIで確認 | 存在しない場合スキップ |

### 移行後確認

| 確認項目 | 方法 |
|----------|------|
| ユーザー作成 | auth.usersにレコード存在 |
| 顧客紐付け | stripe_customersにレコード存在 |
| サブスク同期 | user_subscriptionsの内容がStripeと一致 |

---

## エラーハンドリング

```typescript
interface MigrationResult {
  email: string;
  stripe_customer_id: string;
  success: boolean;
  user_id?: string;
  error?: {
    code: string;
    message: string;
    step: 'auth_create' | 'stripe_customers' | 'user_subscriptions' | 'stripe_api';
  };
}
```

### エラーコード

| コード | 説明 | 対応 |
|--------|------|------|
| DUPLICATE_EMAIL | メール重複 | スキップ |
| INVALID_EMAIL | 無効なメール形式 | スキップ |
| STRIPE_CUSTOMER_NOT_FOUND | Stripe顧客不存在 | スキップ |
| AUTH_CREATE_FAILED | Auth作成失敗 | リトライ |
| DB_INSERT_FAILED | DB挿入失敗 | ロールバック |

---

## 重要：既存ユーザーとの互換性

既存のMemberstack + Stripeユーザーは、新システムと**同じPrice ID**を使用しています。

### 確認済み

- 既存ユーザー (tomopcherry@gmail.com) の Price ID: `price_1RStCiKUVUnt8GtyKJiieo6d`
- 新システムの Standard 3M Price ID: `price_1RStCiKUVUnt8GtyKJiieo6d`
- 結果: **一致** → マッピング不要

### 移行時の挙動

1. **Price IDの変換は不要** - 既存と新システムで同じIDを使用
2. **サブスクリプションはそのまま継続** - Stripeのデータは変更しない
3. **課金スケジュールに影響なし** - 既存の請求サイクルを維持

### プラン対応表

| プラン名 | Price ID | 総額 | 月額換算 |
|----------|----------|------|----------|
| Standard 1ヶ月 | price_1RStBiKUVUnt8GtynMfKweby | ¥6,800/月 | - |
| Standard 3ヶ月 | price_1RStCiKUVUnt8GtyKJiieo6d | ¥17,400/3ヶ月 | ¥5,800/月相当 |
| Feedback 1ヶ月 | price_1RStgOKUVUnt8GtyVPVelPg3 | ¥15,800/月 | - |
| Feedback 3ヶ月 | price_1RSuB1KUVUnt8GtyAwgTK4Cp | ¥41,400/3ヶ月 | ¥13,800/月相当 |

※3ヶ月プランは一括払い、3ヶ月毎に更新
