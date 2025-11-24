# create-checkout 500エラー 調査ドキュメント

**作成日**: 2025-11-21
**エラー発生日**: 2025-11-20から継続中
**優先度**: 🔴 最高（環境分離テストが進められない）

---

## 📋 エラー概要

### 症状
- URL: `POST https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/create-checkout`
- ステータス: `500 (Internal Server Error)`
- 発生タイミング: Subscriptionページで「今すぐ始める」ボタンをクリック時

### フロントエンドログ
```
Checkout開始: プラン=standard, 期間=1ヶ月, 環境=テスト
🔍 デバッグ: import.meta.env.MODE = development, useTestPrice = true
❌ Checkoutセッション作成エラー: FunctionsHttpError: Edge Function returned a non-2xx status code
```

---

## 🔍 原因仮説（優先順位順）

### 仮説1: データベースのunique制約エラー ⭐️ 最有力
**問題内容:**
- `stripe_customers`テーブルに`(user_id, environment)`の複合unique制約が存在しない
- コードでは`onConflict: 'user_id,environment'`を指定（create-checkout/index.ts:110）
- 制約が存在しない場合、upsertがエラーになる

**確認方法:**
```sql
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'stripe_customers'
ORDER BY tc.constraint_type, tc.constraint_name;
```

**期待される結果:**
- `user_id, environment`の複合UNIQUE制約が存在すること

**実際の結果（未確認）:**
- [ ] 確認待ち

**対応策（もし制約がない場合）:**
```sql
-- 複合unique制約を追加
ALTER TABLE stripe_customers
ADD CONSTRAINT stripe_customers_user_id_environment_key
UNIQUE (user_id, environment);
```

---

### 仮説2: 環境変数が実際には設定されていない
**問題内容:**
- `STRIPE_TEST_SECRET_KEY`が空文字列またはnull
- `npx supabase secrets list`ではハッシュ値しか見えないため、実際の値は不明

**確認方法:**
- Supabase Dashboard → Logs → Edge Functions → create-checkout
- エラーメッセージに「STRIPE_TEST_SECRET_KEY is not set」が含まれているか確認

**期待される結果:**
- `STRIPE_TEST_SECRET_KEY`が`sk_test_`で始まる正しい値

**実際の結果（未確認）:**
- [ ] ログ確認待ち

**対応策（もし設定されていない場合）:**
1. Stripe Dashboard（テストモード）でSecret keyを取得
2. `npx supabase secrets set STRIPE_TEST_SECRET_KEY="sk_test_xxxxx"`を実行

---

### 仮説3: Stripe SDKのインポート/初期化エラー
**問題内容:**
- `import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno'`が失敗
- または`createStripeClient()`関数内でエラー

**確認方法:**
- ログで「stripe」「import」「module」関連のエラーを確認

**実際の結果（未確認）:**
- [ ] ログ確認待ち

**対応策:**
- Stripeバージョンを変更
- インポート方法を修正

---

### 仮説4: リクエストボディのパース失敗
**問題内容:**
- `await req.json()`でエラー
- 送信されたJSONが不正

**確認方法:**
- ログで「JSON」「parse」関連のエラーを確認

**実際の結果（未確認）:**
- [ ] ログ確認待ち

**対応策:**
- フロントエンドの送信データを確認
- Edge Functionのエラーハンドリングを強化

---

## ✅ 調査タスク（実行順序）

### タスク1: Supabase Edge Functionログの確認 🔴 最優先
**目的:** 実際のエラーメッセージを取得して原因を特定

**手順:**
1. [ ] https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions を開く
2. [ ] Functions → **create-checkout** を選択
3. [ ] 最新のログエントリ（500エラーのもの）を探す
4. [ ] エラーメッセージ全体をコピー
5. [ ] このドキュメントの「ログ結果」セクションに貼り付け

**期待される情報:**
- `[CREATE-CHECKOUT]`で始まるログ
- `❌ Checkoutセッション作成エラー:`で始まるエラー
- スタックトレース

**結果:**
```
（ここにログを貼り付け）
```

---

### タスク2: データベース制約の確認
**目的:** stripe_customersテーブルに複合unique制約が存在するか確認

**手順:**
1. [ ] Supabase SQL Editor を開く: https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/sql/new
2. [ ] 以下のSQLを実行:
```sql
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'stripe_customers'
ORDER BY tc.constraint_type, tc.constraint_name;
```
3. [ ] 結果をスクリーンショット
4. [ ] `(user_id, environment)`の複合UNIQUE制約があるか確認

**結果:**
```
（ここに結果を貼り付け）
```

**判定:**
- [ ] 複合unique制約が存在する → 仮説1は除外
- [ ] 複合unique制約が存在しない → 仮説1が原因、修正が必要

---

### タスク3: 環境変数の値確認
**目的:** STRIPE_TEST_SECRET_KEYが正しく設定されているか確認

**手順:**
1. [ ] Supabase Dashboard → Project Settings → Edge Functions → Secrets
2. [ ] `STRIPE_TEST_SECRET_KEY`の値を確認
3. [ ] 値が`sk_test_`で始まっているか確認

**結果:**
- [ ] `sk_test_`で始まる値が設定されている
- [ ] 値が不正または空

---

## 🔧 修正手順（原因特定後）

### 原因が「仮説1: unique制約不足」の場合

**修正SQL:**
```sql
-- 複合unique制約を追加
ALTER TABLE stripe_customers
ADD CONSTRAINT stripe_customers_user_id_environment_key
UNIQUE (user_id, environment);

-- user_subscriptionsにも同様の制約を追加
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_user_id_stripe_subscription_id_key
UNIQUE (user_id, stripe_subscription_id);
```

**実行手順:**
1. [ ] Supabase SQL Editorで上記SQLを実行
2. [ ] 実行結果を確認
3. [ ] create-checkout関数を再デプロイ: `npx supabase functions deploy create-checkout`
4. [ ] Test 0を再実行

---

### 原因が「仮説2: 環境変数不正」の場合

**修正手順:**
1. [ ] Stripe Dashboard（テストモード）を開く: https://dashboard.stripe.com/test/apikeys
2. [ ] Secret keyをコピー（`sk_test_`で始まる）
3. [ ] 以下を実行:
```bash
npx supabase secrets set STRIPE_TEST_SECRET_KEY="sk_test_xxxxxxxxxxxxx"
```
4. [ ] Test 0を再実行

---

### 原因が「仮説3: Stripe SDK問題」の場合

**修正手順:**
1. [ ] `_shared/stripe-helpers.ts`のStripe importを修正
2. [ ] 関数を再デプロイ
3. [ ] Test 0を再実行

---

## 📊 進捗状況

**開始日時:** ___________
**調査担当:** Claude Code
**ユーザー確認担当:** takumi.kai.skywalker@gmail.com

### チェックリスト
- [ ] タスク1: ログ確認完了
- [ ] タスク2: データベース制約確認完了
- [ ] タスク3: 環境変数確認完了
- [ ] 原因特定完了
- [ ] 修正実施完了
- [ ] Test 0再実行完了
- [ ] エラー解決確認

---

## 📝 最終結果

**原因:**
✅ **仮説1が正解**: データベースに `(user_id, environment)` の複合unique制約が存在しなかった

**エラー詳細:**
- create-checkout/index.ts:110 で `onConflict: 'user_id,environment'` を指定
- しかしデータベースには該当する制約が存在せず、upsertが失敗
- エラーメッセージ: "顧客情報の保存に失敗しました"

**実施した修正:**
1. `stripe_customers` テーブルに複合unique制約を追加:
   - `UNIQUE (user_id, environment)`
2. `user_subscriptions` テーブルにも複合unique制約を追加:
   - `UNIQUE (stripe_subscription_id, environment)`
3. 既存の単一カラムのunique制約を削除

**実行日時:** 2025-11-21 10:53

**修正後の動作:**
- [ ] ✅ 正常動作（Test 0で確認予定）
- [ ] ❌ まだエラーあり

---

## 📌 重要な注意事項

1. **必ずタスク1（ログ確認）から順番に実行すること**
   - ログを見ずに推測で修正すると時間を無駄にする

2. **各タスクの結果を必ずこのドキュメントに記録すること**
   - 後で振り返りができるように

3. **修正は原因特定後に実施すること**
   - 複数の修正を同時に行わない

---

**次のアクション: タスク1（ログ確認）を実行してください**
