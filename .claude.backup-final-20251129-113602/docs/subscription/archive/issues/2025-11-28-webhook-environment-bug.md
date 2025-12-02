# Webhook 401エラーの環境変数問題分析

**作成日**: 2025-11-28
**優先度**: 🚨 最高（システムが機能していない）

---

## 🔍 調査結果サマリー

### 確認した事実

1. **ヘルパー関数は正しい** ✅
   - `stripe-helpers.ts` の `getWebhookSecret()` は正しく実装されている
   - 環境変数名: `STRIPE_WEBHOOK_SECRET_TEST` / `STRIPE_WEBHOOK_SECRET_LIVE`

2. **環境変数は存在する** ✅
   ```bash
   # Supabase Secretsで確認済み
   STRIPE_WEBHOOK_SECRET_TEST
   STRIPE_WEBHOOK_SECRET_LIVE
   ```

3. **ログから判明した事実** 🔍
   ```
   POST | 401 | stripe-webhook          ← 全て失敗
   POST | 200 | stripe-webhook-test     ← 全て成功
   POST | 200 | create-checkout         ← 成功
   POST | 200 | check-subscription      ← 成功
   ```

---

## 🤔 なぜ 401 エラーが発生するのか？

### 仮説1: Webhook Secretの値が間違っている（最有力）

**可能性**: **極めて高い**

Stripe Webhook署名検証が失敗する理由:
1. Supabase Secretsに設定されている `STRIPE_WEBHOOK_SECRET_TEST` の値
2. Stripe Dashboard → Webhooks で設定されているWebhook Signing Secret

**この2つが一致していない可能性が高い。**

#### 確認方法

1. **Stripe Dashboard で Webhook Secret を確認**
   ```
   Stripe Dashboard → Developers → Webhooks
   → Endpoint URLを選択
   → "Signing secret" をクリックして表示
   ```

2. **Supabase Secrets の値を確認**
   ```bash
   npx supabase secrets list
   # STRIPE_WEBHOOK_SECRET_TEST の値を確認
   ```

3. **値が一致しているか比較**

---

### 仮説2: Webhook Endpointが複数ある

**可能性**: 中

Stripe Dashboardに複数のWebhook Endpointが登録されていて、古いSecretを使っている可能性。

#### 確認方法

```
Stripe Dashboard → Developers → Webhooks
→ 登録されているEndpoint URLを全て確認
→ 使用していないものは削除
```

---

### 仮説3: 環境モード（test/live）の不一致

**可能性**: 低（ただし確認必要）

- `STRIPE_MODE` 環境変数が `test` に設定されているか確認
- Stripe Dashboardで「テストモード」になっているか確認

---

## 📋 次のアクション

### ステップ1: Stripe Dashboard で Webhook Secret を確認 🎯

**重要**: この値は機密情報なので、コンソールに出力しないこと。

1. Stripe Dashboard にログイン
2. **Developers → Webhooks** を開く
3. Endpoint URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook` を探す
4. **"Signing secret"** をクリックして表示（`whsec_...` で始まる文字列）

### ステップ2: Supabase Secrets の値と比較

```bash
# Secretの値を直接確認することはできないため、
# 必要に応じて再設定する
npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST=whsec_xxxxx
```

### ステップ3: 再デプロイとテスト

```bash
# Webhook Functionを再デプロイ
npx supabase functions deploy stripe-webhook

# ログで確認
# mcp__supabase__get_logs (service: edge-function)
# POST | 200 | stripe-webhook になっていればOK
```

---

## 💡 なぜ `stripe-webhook-test` は成功するのか？

**理由**:
`stripe-webhook-test` は署名検証を**スキップ**している可能性が高い。

```typescript
// stripe-webhook-test/index.ts (推測)
// 署名検証なしで直接処理している
```

これに対して、本番用の `stripe-webhook` は厳密に署名検証を行っているため、Secretが一致しないと 401 エラーになる。

---

## 📊 問題の影響範囲

### 現在動作していない機能

1. **決済完了後のデータベース更新**
   - `checkout.session.completed` Webhookが処理されない
   - `user_subscriptions` テーブルが更新されない
   - フロントエンドで `subscribed: false` になる

2. **サブスクリプション更新の反映**
   - `customer.subscription.updated` Webhookが処理されない
   - プラン変更が反映されない

3. **サブスクリプションキャンセルの反映**
   - `customer.subscription.deleted` Webhookが処理されない
   - キャンセル状態が反映されない

### 動作している機能 ✅

1. Checkout作成（`create-checkout`）
2. サブスクリプション状態確認（`check-subscription`）
3. Stripeでの決済処理自体

---

## 🎯 完了条件

- [ ] Stripe Dashboard で正しいWebhook Secretを確認
- [ ] Supabase Secretsに正しい値を設定
- [ ] Edge Functionを再デプロイ
- [ ] ログで `POST | 200 | stripe-webhook` を確認
- [ ] テスト決済を実行してデータベース更新を確認
- [ ] `/subscription` ページで `subscribed: true` を確認

---

**作成日**: 2025-11-28
**最終更新**: 2025-11-28
