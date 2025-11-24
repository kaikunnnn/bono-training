# エラー分析 - テスト決済結果

**作成日:** 2025-11-21 14:38 JST

---

## テスト結果サマリー

### ✅ 成功した部分
1. ✅ Stripe決済: 成功 (¥4,980)
2. ✅ Webhook受信: 成功
3. ✅ Webhook署名検証: 成功

### ❌ 失敗した部分
1. ❌ データベースへのデータ保存: 失敗
2. ❌ ユーザーにサブスクリプションが反映されない

---

## 検出されたエラー（3種類）

### エラー1: user_subscriptionsテーブルの保存エラー
```
🧪 [TEST環境] ユーザーサブスクリプション情報の保存エラー: {
  code: "42P10",
  details: null,
  hint: null,
  message: "there is no unique or exclusion constraint matching the ON CONFLICT specification"
}
```

**原因:**
- Edge Functionコード（stripe-webhook-test/index.ts）で `onConflict: 'user_id,environment'` を指定している
- しかし、データベースに `(user_id, environment)` の複合UNIQUE制約が存在しない

**該当コード箇所:**
- stripe-webhook-test/index.ts: 226行目付近
  ```typescript
  const { error: userSubError } = await supabase
    .from("user_subscriptions")
    .upsert({
      ...
    }, { onConflict: 'user_id,environment' });
  ```

**修正方法:**
- user_subscriptionsテーブルに `UNIQUE(user_id, environment)` 制約を追加

---

### エラー2: subscriptionsテーブルのenvironmentカラム不存在
```
🧪 [TEST環境] サブスクリプションに紐づくユーザーが見つかりません: {
  code: "42703",
  details: null,
  hint: null,
  message: "column subscriptions.environment does not exist"
}
```

**原因:**
- Edge Functionコードで `subscriptions.environment` カラムを参照している
- しかし、subscriptionsテーブルに `environment` カラムが存在しない

**該当コード箇所:**
- stripe-webhook-test/index.ts: 複数箇所
  - 320行目: `.eq("environment", ENVIRONMENT)`
  - 339行目: `.eq("environment", ENVIRONMENT)`
  - 395行目: `.eq("environment", ENVIRONMENT)`
  - 412行目: `.eq("environment", ENVIRONMENT)`
  - 553行目: `.eq("environment", ENVIRONMENT)`

**修正方法:**
- subscriptionsテーブルに `environment TEXT` カラムを追加

---

### エラー3: Deno.core.runMicrotasks() エラー（4件）
```
"event loop error: Error: Deno.core.runMicrotasks() is not supported in this environment
    at Object.core.runMicrotasks (https://deno.land/std@0.177.1/node/_core.ts:23:11)
    ...
```

**原因:**
- Edge Functionが終了する際の内部エラー
- 主要な問題ではないが、Denoランタイムの互換性問題の可能性

**優先度:** 低（エラー1,2を修正後に再確認）

---

## Stripeデータ（成功）

### 決済情報
- **Payment Intent ID:** pi_3SVmyDKUVUnt8Gty0NeAGoq6
- **Customer ID:** cus_TSgoDjZruK8uEK
- **Subscription ID:** sub_1SVmyCKUVUnt8Gty09sp8sRT
- **金額:** ¥4,980
- **プラン:** スタンダードプラン (price_1OIiOUKUVUnt8GtyOfXEoEvW)
- **メールアドレス:** takumi.kai.skywalker@gmail.com
- **ステータス:** 成功

### Webhookイベント（時系列）
1. payment_intent.created - 14:33:21
2. invoice.created - 14:33:21
3. invoice.finalized - 14:33:21
4. customer.subscription.created - 14:33:21
5. charge.succeeded - 14:33:22
6. payment_method.attached - 14:33:22
7. payment_intent.succeeded - 14:33:22
8. invoice.updated - 14:33:23
9. invoice.paid - 14:33:23 ✅
10. invoice.payment_succeeded - 14:33:23
11. customer.subscription.updated - 14:33:24 ✅
12. checkout.session.completed - 14:33:24 ✅

**重要:** checkout.session.completed, customer.subscription.updated, invoice.paid が正常に処理されているはず

---

## データベース状態確認（必要）

現在のデータベースにデータが保存されているか確認が必要:

```sql
-- Test環境のサブスクリプションを確認
SELECT
  id,
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  plan_type,
  is_active,
  environment,
  created_at
FROM user_subscriptions
WHERE stripe_customer_id = 'cus_TSgoDjZruK8uEK'
OR stripe_subscription_id = 'sub_1SVmyCKUVUnt8Gty09sp8sRT'
ORDER BY created_at DESC;
```

---

## 修正アクションプラン

### アクション1: subscriptionsテーブルにenvironmentカラムを追加
```sql
ALTER TABLE subscriptions
ADD COLUMN environment TEXT;

-- 既存データをliveに設定（必要に応じて）
UPDATE subscriptions
SET environment = 'live'
WHERE environment IS NULL;
```

### アクション2: user_subscriptionsテーブルに複合UNIQUE制約を追加
```sql
-- 既存の制約を確認
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'user_subscriptions';

-- 複合UNIQUE制約を追加
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_user_id_environment_key
UNIQUE (user_id, environment);
```

### アクション3: 修正後にテスト決済を再実施
- 同じユーザーで新規決済を実施
- データベースに正しく保存されるか確認

---

## 現時点での状態

### Webhook処理
✅ Webhook受信: 成功
✅ 署名検証: 成功
❌ データベース保存: 失敗（スキーマ問題）

### ユーザー体験
❌ 決済完了後、「無料プラン」のまま
❌ サブスクリプションデータが反映されない

### 原因
データベーススキーマの不整合により、Edge Functionがデータを保存できない

---

## 実施した修正

### ✅ 修正1: subscriptionsテーブルにenvironmentカラムを追加（完了）
**実施日時:** 2025-11-21 14:40 JST
**マイグレーション名:** add_environment_column_to_subscriptions

```sql
ALTER TABLE subscriptions ADD COLUMN environment TEXT;
UPDATE subscriptions SET environment = 'live' WHERE environment IS NULL;
ALTER TABLE subscriptions ALTER COLUMN environment SET NOT NULL;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_environment_check CHECK (environment IN ('test', 'live'));
```

**結果:** ✅ 成功

### ✅ 修正2: user_subscriptionsテーブルのUNIQUE制約を修正（完了）
**実施日時:** 2025-11-21 14:41 JST
**マイグレーション名:** fix_user_subscriptions_unique_constraint

```sql
ALTER TABLE user_subscriptions DROP CONSTRAINT IF EXISTS user_subscriptions_user_id_key;
ALTER TABLE user_subscriptions ADD CONSTRAINT user_subscriptions_user_id_environment_key UNIQUE (user_id, environment);
```

**結果:** ✅ 成功

---

## 次のステップ

### 📋 残タスク
1. ⏳ 再度テスト決済を実施
2. ⏳ Webhookログでエラーが出ないか確認
3. ⏳ データベースに正しく保存されることを確認
4. ⏳ ユーザー画面で正しいプランが表示されることを確認
