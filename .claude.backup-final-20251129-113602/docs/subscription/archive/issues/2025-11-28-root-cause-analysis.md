# Phase 4 テスト失敗の根本原因分析

**作成日**: 2025-11-28
**関連ドキュメント**: `2025-11-28-phase4-test-critical-bugs.md`

---

## 🔍 根本原因の特定完了

### 原因1: プラン料金のハードコード（問題1）✅

**コード箇所**:
1. `src/utils/subscriptionPlans.ts` Line 28, 35, 42, 48
2. `src/pages/Subscription.tsx` Line 51-67

**問題**:
```typescript
// ❌ ハードコードされた料金
pricePerMonth: 4000  // 実際のStripe: ¥4,980

durations: [
  { months: 1, price: 4000, priceLabel: '4,000円/月' },  // 実際: ¥4,980
  { months: 3, price: 3800, priceLabel: '3,800円/月（3ヶ月）' }
]
```

**影響**:
- プロレーション計算が間違った金額で行われる
- ユーザーに誤った返金・請求額を表示
- **Stripeの実際の値段**: Standard 1ヶ月 = ¥4,980/月

**解決策**:
1. Stripe Price API を使用して実際の料金を取得
2. または環境変数で料金を管理
3. ハードコード値を完全に削除

---

### 原因2: Webhook 401エラー（問題2-4の根本原因）🚨

**Edge Function ログ分析**:
```
POST | 401 | stripe-webhook  ← 大量の401エラー
POST | 200 | stripe-webhook-test  ← テスト用は成功
POST | 200 | create-checkout  ← Checkout作成は成功
```

**発見した事実**:
1. **`stripe-webhook` が 401 Unauthorized を返している**
2. `stripe-webhook-test` は 200 OK（正常）
3. **決済完了後のWebhookが全て失敗している**

**これが意味すること**:
- Stripe Checkoutは成功して決済は完了している
- **しかし `checkout.session.completed` Webhookが401で失敗**
- **データベース `user_subscriptions` が更新されない**
- **フロントエンドで `subscribed: false` になる**

**401エラーの原因（推測）**:
1. Webhook署名検証の失敗
2. 環境変数 `STRIPE_WEBHOOK_SECRET` が間違っている
3. または本番とテストの環境が混在している

---

### 原因3: 「Subscribe to グロースプラン」表示の謎 🤔

**ユーザーの報告**:
- ユーザーは「Feedback 1ヶ月」を選択
- しかし Stripe Checkout で「Subscribe to グロースプラン」と表示
- 実際に作成されたのも「グロースプラン」

**可能性1: フロントエンドのバグ**
```typescript
// Subscription.tsx Line 92-95
setSelectedNewPlan({
  type: selectedPlanType,  // ← この値が正しいか？
  duration: selectedDuration,
});
```

**可能性2: Edge Functionのマッピングミス**
```typescript
// create-checkout/index.ts Line 156-158
const envVarName = `${envPrefix}${planTypeUpper}_${durationSuffix}_PRICE_ID`;
priceId = Deno.env.get(envVarName);
```

**要確認**:
- 環境変数 `STRIPE_TEST_FEEDBACK_1M_PRICE_ID` が正しく設定されているか
- または `STRIPE_TEST_GROWTH_1M_PRICE_ID` が誤って使用されているか

---

## 📊 問題の関連性マップ

```
問題1: 料金不一致
  ↓
  └── ハードコードされた料金を使用
      └── プロレーション計算が間違う

問題2: Subscribe to（新規登録）表示
  ↓
  └── 環境変数マッピングミス？
      └── 間違ったプランが作成される

問題3: 決済後に画面遷移しない
  ↓
  └── Webhook 401エラー
      └── データベース更新失敗
          └── 問題4: プラン情報が表示されない
```

**結論**: 問題3と問題4は同じ根本原因（Webhook 401エラー）から発生している。

---

## 🛠️ 修正の優先順位

### 優先度1: Webhook 401エラーの修正 🚨
**理由**: これを修正しないと何も動かない

**調査項目**:
1. `stripe-webhook/index.ts` のコード確認
2. 環境変数 `STRIPE_WEBHOOK_SECRET` の確認
3. Stripe Dashboard で Webhook Endpoint の設定確認

**修正方針**:
- Webhook署名検証の環境変数を修正
- テスト環境と本番環境の分離を確認

---

### 優先度2: プラン料金をStripeから取得 💰
**理由**: ユーザーに誤った金額を表示してはいけない

**実装方針**:
1. Stripe Price API を使用
2. Edge Functionで料金を取得
3. フロントエンドに返す

または

1. 環境変数で料金を管理
2. `subscriptionPlans.ts` から環境変数を読む

---

### 優先度3: プラン選択のバグ調査 🔍
**理由**: なぜFeedbackではなくグロースになったのか

**調査項目**:
1. フロントエンドのコンソールログ確認
2. Edge Functionのログ確認
3. 環境変数の確認

---

## 🧪 次のアクション

### ステップ1: Webhookエラーの詳細確認
```bash
# Webhook Secretを確認（Supabase Dashboard）
# Project Settings → Edge Functions → Secrets → STRIPE_WEBHOOK_SECRET
```

### ステップ2: stripe-webhook/index.ts のコード確認
```typescript
// Webhook署名検証のコードを確認
// 環境変数の取得方法を確認
```

### ステップ3: Stripe Dashboard確認
```
1. Stripe Dashboard → Developers → Webhooks
2. Webhook Endpoint URLを確認
3. Webhook Secretを確認
4. テスト環境か本番環境かを確認
```

### ステップ4: 環境変数の確認
```bash
# Supabase Dashboard
# STRIPE_MODE = test or live
# STRIPE_WEBHOOK_SECRET = sk_test_... or whsec_...
# STRIPE_TEST_FEEDBACK_1M_PRICE_ID = price_...
```

---

## 💡 暫定的な回避策

### ユーザー体験の改善案

#### 案1: モーダルを削除してCheckoutのみにする
- **メリット**: シンプルでバグが少ない
- **デメリット**: プロレーション（差額）が事前に見れない

#### 案2: Deep Link（Customer Portal）に戻す
- **メリット**: Stripeの公式UIでプロレーション表示
- **デメリット**: 二重課金のリスク（要Webhook監視）

#### 案3: Option 3を完全に修正する
- **メリット**: 二重課金を技術的に防止
- **デメリット**: 実装が複雑、Webhook必須

**推奨**: まずWebhookを修正してから、案3（Option 3）を完成させる。

---

## 📝 ユーザーからのフィードバック

> モーダルで確認を出すのに、Stripeでもう1度内容を表示するのもユーザー体験にどう思うか意見を聞きたい

**回答**:
1. **モーダル + Checkout の二重確認は冗長**
   - ユーザーが混乱する可能性がある
   - 特に Option 3 では Checkout が「新規登録」として表示されるため不自然

2. **推奨: Deep Link（Customer Portal）のみ**
   - Stripeの公式UIで信頼性が高い
   - プロレーション（差額）が表示される
   - 確認は1回のみでスムーズ
   - **ただし二重課金監視Webhookが必須**

3. **または: Checkoutのみ（モーダルなし）**
   - シンプルで分かりやすい
   - ただしプロレーション事前確認ができない

**最終的には**: プロダクトの要件とユーザーのニーズ次第
- **差額確認が必須** → Deep Link
- **二重課金防止が必須** → Option 3（ただしUX改善が必要）

---

**作成日**: 2025-11-28
**最終更新**: 2025-11-28
