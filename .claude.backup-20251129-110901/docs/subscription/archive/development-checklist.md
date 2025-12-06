# Supabase Edge Functions 開発チェックリスト

**目的**: 環境変数関連のバグを防ぐための開発・デプロイ時チェックリスト

---

## 📋 編集前チェックリスト

### ✅ 1. 関連ファイルの洗い出し

修正する機能に関連する**全てのEdge Functions**をリストアップ:

```bash
# 関連するEdge Functionsを検索
ls supabase/functions/ | grep -E "(webhook|checkout|portal|subscription)"

# 期待される出力例:
# stripe-webhook/
# stripe-webhook-test/
# create-checkout/
# create-customer-portal/
# check-subscription/
```

**確認ポイント:**
- [ ] 類似の名前のファイルがないか（例: webhook vs webhook-test）
- [ ] テスト用と本番用が分かれていないか
- [ ] 全てのファイルをエディタで開いたか

### ✅ 2. 環境変数の現状確認

```bash
# 環境変数ENVIRONMENTの使用状況を確認
grep -r "const ENVIRONMENT" supabase/functions/ --include="*.ts"

# 期待される形式:
# const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';
```

**NGパターン:**
```typescript
❌ const ENVIRONMENT = 'live' as const;  // ハードコード
❌ const ENVIRONMENT = 'test';  // ハードコード
❌ const env = process.env.NODE_ENV;  // 間違った環境変数
```

**OKパターン:**
```typescript
✅ const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';
```

---

## 📝 編集中チェックリスト

### ✅ 3. 環境変数の統一

**全てのEdge Functionsで同じパターンを使用:**

```typescript
// supabase/functions/*/index.ts の冒頭
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// 環境変数から環境を取得（デフォルトはtest）
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';
```

**確認項目:**
- [ ] `Deno.env.get('STRIPE_MODE')`を使用しているか
- [ ] デフォルト値が`'test'`になっているか
- [ ] 型アノテーションが`as 'test' | 'live'`になっているか

### ✅ 4. 環境フィルタの追加

**データベースクエリで環境フィルタを必ず追加:**

```typescript
// ❌ 環境フィルタなし
const { data } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', userId);

// ✅ 環境フィルタあり
const { data } = await supabase
  .from('user_subscriptions')
  .select('*')
  .eq('user_id', userId)
  .eq('environment', ENVIRONMENT);  // 必須
```

**確認項目:**
- [ ] `.from('stripe_customers')`に`.eq('environment', ENVIRONMENT)`があるか
- [ ] `.from('user_subscriptions')`に`.eq('environment', ENVIRONMENT)`があるか
- [ ] INSERT/UPSERTで`environment: ENVIRONMENT`を含めているか

### ✅ 5. Stripe APIクライアントの初期化

**環境に応じたStripe APIキーを使用:**

```typescript
// _shared/stripe-helpers.ts の使用
import { createStripeClient, getWebhookSecret } from "../_shared/stripe-helpers.ts";

// ✅ 環境に応じたStripeクライアント
const stripe = createStripeClient(ENVIRONMENT);

// ✅ 環境に応じたWebhookシークレット
const webhookSecret = getWebhookSecret(ENVIRONMENT);
```

**確認項目:**
- [ ] `createStripeClient(ENVIRONMENT)`を使用しているか
- [ ] `getWebhookSecret(ENVIRONMENT)`を使用しているか
- [ ] ハードコードされたAPIキーがないか

---

## 🧪 デプロイ前チェックリスト

### ✅ 6. コミット前の差分確認

```bash
# 1. ハードコードされた環境変数がないか確認
git diff | grep -E "ENVIRONMENT.*=.*'(test|live)'" | grep -v "as 'test' | 'live'"

# 期待: 何も出力されない（ハードコードがない）

# 2. 環境変数の使用箇所を確認
git diff | grep -A2 -B2 "ENVIRONMENT"

# 期待: Deno.env.get('STRIPE_MODE') の形式

# 3. 全ての変更ファイルを確認
git status

# 期待: 関連する全てのEdge Functionsが含まれている
```

**確認項目:**
- [ ] 意図しないハードコードがないか
- [ ] 関連ファイルが全て修正されているか
- [ ] テスト用と本番用が両方修正されているか

### ✅ 7. ローカルテスト（任意）

```bash
# Supabase Local Development（セットアップ済みの場合）
npx supabase functions serve stripe-webhook

# 別ターミナルでテストリクエスト
curl -X POST http://localhost:54321/functions/v1/stripe-webhook \
  -H "Content-Type: application/json" \
  -d '{"test": "data"}'
```

---

## 🚀 デプロイ後チェックリスト

### ✅ 8. デプロイ確認

```bash
# 1. デプロイ実行
npx supabase functions deploy stripe-webhook

# 2. デプロイ成功確認
npx supabase functions list | grep stripe-webhook

# 期待される出力:
# stripe-webhook | ACTIVE | [新しいバージョン番号] | [タイムスタンプ]
```

**確認項目:**
- [ ] デプロイが成功したか（エラーがないか）
- [ ] 新しいバージョン番号が付与されたか
- [ ] ステータスがACTIVEになっているか

### ✅ 9. ログ確認

```bash
# Edge Functionログを確認（MCPツール使用）
# Supabase Dashboard → Edge Functions → Logs でも確認可能
```

または Claude Code で:
```
mcp__supabase__get_logs --service edge-function
```

**確認ポイント:**
- [ ] 新しいバージョン番号でリクエストが処理されているか
- [ ] 401エラーが出ていないか（Webhook署名検証）
- [ ] 500エラーが出ていないか（実行時エラー）
- [ ] 環境ログが正しいか（`🧪 [TEST環境]` or `🚀 [本番環境]`）

### ✅ 10. 実テスト実行

**Test 1: 新規登録テスト（テスト環境）**

1. 新しいテストユーザーでサインアップ
2. Stripe Checkoutで決済実行（テストカード使用）
3. 決済完了後、以下を確認:
   - [ ] Stripe Dashboard: サブスクリプション作成成功
   - [ ] Database: `user_subscriptions.is_active = true`
   - [ ] Database: `environment = 'test'`
   - [ ] Frontend: サブスクリプション状態が正しく表示される

**Test 2: Webhookログ確認**

```bash
# Webhookログで200 OKを確認
# 期待されるログ:
# POST | 200 | stripe-webhook | version="[新バージョン]"
# ✅ [TEST環境] Webhook署名検証成功: checkout.session.completed
```

---

## 📊 環境確認コマンド集

### 現在の環境設定を確認

```bash
# Supabase Secretsを確認（CLIでは不可、Dashboard参照）
# Dashboard → Project Settings → Edge Functions → Secrets

# 期待される設定:
# STRIPE_MODE = (未設定 or 'test') → テスト環境
# STRIPE_MODE = 'live' → 本番環境
```

### 環境変数を使用している箇所を検索

```bash
# ENVIRONMENTを使用しているファイル
grep -r "ENVIRONMENT" supabase/functions/ --include="*.ts" -n

# STRIPE_MODEを参照している箇所
grep -r "STRIPE_MODE" supabase/functions/ --include="*.ts" -n

# 環境フィルタを使用している箇所
grep -r "eq('environment'" supabase/functions/ --include="*.ts" -n
```

---

## 🔥 緊急時の対応

### デプロイ後に問題が発生した場合

1. **即座にログ確認**
   ```bash
   # MCPツールでログ取得
   mcp__supabase__get_logs --service edge-function
   ```

2. **エラーパターンで判定**
   - `401 Unauthorized` → Webhook署名検証エラー → 環境変数の問題
   - `500 Internal Server Error` → 実行時エラー → コードのバグ
   - `200 OK` だがDB未更新 → イベントハンドラの問題

3. **ロールバック（必要に応じて）**
   ```bash
   # 前のバージョンに戻す（Git経由）
   git log supabase/functions/stripe-webhook/index.ts
   git checkout [前のコミットハッシュ] supabase/functions/stripe-webhook/index.ts
   npx supabase functions deploy stripe-webhook
   ```

---

---

## 🔄 プラン変更実装時の特別チェックリスト

### ✅ 1. ユーザー要件の明確化

**実装前に必ず確認:**

- [ ] **プロレーション表示は必須か？**
  - ✅ 必須 → Deep Link（Customer Portal）を使用
  - ❌ 不要 → Option 3（Checkout）を使用

- [ ] **二重課金の完全防止は必須か？**
  - ✅ 必須 → Option 3（Checkout）を使用
  - ❌ Webhook監視でOK → Deep Link使用可能

**重要**: この2つは**両立できない**場合がある。優先順位を明確にする。

---

### ✅ 2. 実装方式の選択と理由の記録

#### Option 2: Deep Link（Customer Portal）

**メリット**:
- ✅ プロレーション（差額）が表示される
- ✅ ユーザーが金額を確認してから決済できる
- ✅ Stripeの公式UIで信頼性が高い

**デメリット**:
- ⚠️ Stripe Customer Portalが更新を保証しない
- ⚠️ 二重課金のリスクあり（Webhook + 監視で対応）

**推奨ケース**:
- ユーザー体験を最優先する場合
- 差額確認が**必須要件**の場合

**実装ファイル**:
- `supabase/functions/create-customer-portal/index.ts`: `isDeepLinkMode = true`
- `src/pages/Subscription.tsx`: `getCustomerPortalUrl()` を呼び出し

---

#### Option 3: Checkout（新規登録として処理）

**メリット**:
- ✅ 二重課金を**技術的に完全防止**
- ✅ 既存サブスクのキャンセル → 新規作成の順序保証
- ✅ Fail-Safe設計（キャンセル失敗時はCheckout作成しない）

**デメリット**:
- ❌ プロレーション（差額）が表示されない
- ❌ 「Subscribe to プラン名」（新規登録）として表示される
- ❌ ユーザーが金額を確認できない

**推奨ケース**:
- 二重課金を技術的に完全防止することが**必須要件**の場合
- プロレーション表示が不要な場合

**実装ファイル**:
- `supabase/functions/create-customer-portal/index.ts`: `isDeepLinkMode = false`
- `src/pages/Subscription.tsx`: `createCheckoutSession()` を呼び出し

---

### ✅ 3. テスト実施チェックリスト

#### Test 2B: プラン変更テスト

**画面表示の確認（最重要）**:

- [ ] **Checkout/Portal画面の表示内容**
  - Deep Link: 「プラン変更」または「Update subscription」と表示される
  - Option 3: 「Subscribe to プラン名」（新規登録）と表示される

- [ ] **プロレーション表示**
  - Deep Link: ✅ 差額（proration）が表示される
  - Option 3: ❌ 表示されない

- [ ] **次回請求額**
  - Deep Link: ✅ 表示される
  - Option 3: ❌ 新規登録として表示される

**決済完了後の確認**:

- [ ] **Stripe Dashboard確認**
  - [ ] アクティブなサブスクリプションが**1つだけ**
  - [ ] 旧サブスクがキャンセルされている
  - [ ] 二重課金が発生していない

- [ ] **データベース確認**
  ```sql
  SELECT
    stripe_subscription_id,
    plan_type,
    duration,
    is_active
  FROM user_subscriptions
  WHERE user_id = '[テストユーザーID]'
  ORDER BY created_at DESC;
  ```
  - [ ] アクティブなレコードが1つだけ
  - [ ] プラン・期間が正しく更新されている

- [ ] **Webhook Log確認**
  ```bash
  mcp__supabase__get_logs --service edge-function
  ```
  - [ ] `checkout.session.completed` イベント成功
  - [ ] 既存サブスクのキャンセル成功（Option 3の場合）

---

### ✅ 4. ドキュメント化

**実装後に必ず記録:**

- [ ] **選択した方式と理由**
  - `.claude/docs/subscription/README.md` に記載
  - なぜDeep LinkまたはOption 3を選んだのか明記

- [ ] **トレードオフの認識**
  - プロレーション表示 vs 二重課金防止
  - どちらを優先したかを明記

- [ ] **テスト結果**
  - `.claude/docs/subscription/testing/TEST_SUMMARY.md` に記録
  - 画面表示のスクリーンショットまたは詳細説明

---

### ✅ 5. 二重課金監視（Deep Link使用時）

**Webhook強化（推奨）**:

```typescript
// supabase/functions/stripe-webhook/index.ts

if (event.type === 'checkout.session.completed') {
  const session = event.data.object;

  // 顧客の全サブスクリプションを取得
  const subscriptions = await stripe.subscriptions.list({
    customer: session.customer,
    status: 'active',
  });

  // アクティブなサブスクが2つ以上 = 二重課金
  if (subscriptions.data.length > 1) {
    console.error('⚠️ 二重課金検知:', {
      customer: session.customer,
      subscriptions: subscriptions.data.map(s => s.id),
    });

    // 古いサブスクを自動キャンセル
    const oldestSub = subscriptions.data.sort((a, b) => a.created - b.created)[0];
    await stripe.subscriptions.cancel(oldestSub.id, { prorate: true });

    console.log('✅ 古いサブスクを自動キャンセル:', oldestSub.id);
  }
}
```

**確認項目**:
- [ ] Webhook実装済み
- [ ] ログで二重課金検知を確認
- [ ] 自動キャンセルが動作することを確認

---

## 📚 参考資料

- **環境変数バグ事例**: `.claude/docs/subscription/issues/2025-11-28-webhook-environment-bug.md`
- **Deep Link無効化の経緯**: `.claude/docs/subscription/issues/2025-11-28-deeplink-disabled-root-cause.md`
- **テストサマリー**: `.claude/docs/subscription/testing/TEST_SUMMARY.md`
- **環境分離実装**: コミット `50217e0` (2025-11-27)
- **Deep Link無効化**: コミット `78b96c1` (2025-11-28)

---

**最終更新**: 2025-11-28
**メンテナンス**: このチェックリストは定期的に見直し、新しい知見を追加する
