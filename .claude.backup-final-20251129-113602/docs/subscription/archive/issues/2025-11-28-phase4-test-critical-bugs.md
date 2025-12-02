# Phase 4 テスト時の重大バグ報告

**発生日時**: 2025-11-28 14:00頃
**テストユーザー**: kyasya00@gmail.com
**テストシナリオ**: Phase 4-3 Test 2B（Standard 1ヶ月 → Feedback 1ヶ月へのプラン変更）

---

## 🚨 発生した問題の概要

### 問題1: プラン料金表示の不一致 💰
**症状**:
- モーダル表示: Standard 1ヶ月 = ¥4,000/月
- Stripe実際の値: Standard 1ヶ月 = ¥4,980/月
- **プロレーション計算が間違った金額で行われている**

**影響**:
- ユーザーに誤った返金・請求額を表示
- 信頼性の喪失

**根本原因（推測）**:
- `src/utils/subscriptionPlans.ts` のハードコードされた料金を使用
- Stripe Product/Price の実際の値を取得していない

---

### 問題2: Checkout画面が「Subscribe to グロースプラン」（新規登録）になる 🔴
**症状**:
- 「プラン変更を確定」ボタンをクリック
- Stripe Checkoutに遷移
- **「Subscribe to グロースプラン」と表示される（新規登録モード）**
- 期待: **「Update subscription」（更新モード）**

**影響**:
- **二重課金が発生する可能性が極めて高い**
- Option 3実装が正しく動作していない

**根本原因（推測）**:
- `create-checkout` Edge Functionが新規登録として処理している
- 既存サブスクリプションのキャンセル→新規作成のロジックが動作していない
- または Deep Linkモードになっている可能性

---

### 問題3: 決済完了後に適切な画面に遷移しない ❌
**症状**:
- Stripe Checkoutで決済完了
- **何が起こったのか分からない画面に遷移**
- 期待: トースト通知「プランを変更しました」+ `/subscription?updated=true` に遷移

**影響**:
- ユーザーが混乱する
- 変更が成功したかどうか不明

**根本原因（推測）**:
- Checkout success_urlの設定ミス
- Webhookハンドラーが正しく動作していない可能性

---

### 問題4: /subscription ページで現在のプランが表示されない 🐛
**症状**:
- 決済完了後、`/subscription` ページで現在のプランが表示されない
- Console: `subscribed: false, planType: 'feedback'`
- **Stripe側では「グロースプラン」が有効になっている**

**影響**:
- ユーザーが自分のプラン状態を確認できない
- 明らかなバグ

**根本原因（推測）**:
- データベース `user_subscriptions` テーブルの更新が失敗
- または Webhook が正しく処理されていない
- `subscribed: false` なのに `planType: 'feedback'` というのは矛盾している

---

## 📊 Stripe側の状態確認

### 最終的なStripe状態（スクリーンショット3,4から）

**サブスクリプション**:
- 有効プラン: **グロースプラン** （¥9,999/月）
- ステータス: 有効
- 次回請求日: 2025年12月28日
- 次回請求額: ¥5,035

**旧サブスクリプション**:
- スタンダードプラン: **キャンセル済み**
- 今後の請求書はありません

**請求書（Invoice）**:
1. ¥4,980 JPY - 支払い済み（Standard作成時）
2. ¥9,999 JPY - 支払い済み（グロース作成時）

**保留中のインボイスアイテム**:
- (¥4,964) JPY - 11/28 14:38作成

### ❓ 疑問点
1. **なぜFeedbackではなくグロースになったのか？**
   - ユーザーはFeedback 1ヶ月を選択したはず
   - Checkout画面で「グロースプラン」と表示されたことと一致

2. **プロレーション（日割り計算）は正しく行われたのか？**
   - 保留中のインボイスアイテム: (¥4,964) → 返金？
   - 新規請求: ¥9,999
   - 差額計算が正しいか不明

3. **二重課金は発生していないか？**
   - Standard: キャンセル済み ✅
   - グロース: 有効 ✅
   - **アクティブなサブスクは1つのみ（二重課金は発生していない）**

---

## 🔍 根本原因の仮説

### 仮説1: Deep Linkモードが有効になっている
**可能性**: 高い

**根拠**:
- 前回のコミット `78b96c1` で Deep Link を無効化したはず
- しかし何らかの理由で Deep Link モードが有効になっている可能性
- Deep Link では「プラン変更確認」が表示されない

**確認方法**:
```typescript
// supabase/functions/create-customer-portal/index.ts
const isDeepLinkMode = false; // この値を確認
```

---

### 仮説2: Option 3のCheckoutロジックが動作していない
**可能性**: 高い

**根拠**:
- Checkout画面で「Subscribe to」（新規登録）と表示される
- Option 3では既存サブスクのキャンセル→新規Checkoutのはず
- しかし新規登録として処理されている

**確認方法**:
```typescript
// supabase/functions/create-checkout/index.ts
// 既存サブスクのキャンセル処理が実行されているか確認
```

---

### 仮説3: プラン選択時のロジックミス
**可能性**: 中

**根拠**:
- ユーザーは「Feedback 1ヶ月」を選択
- しかし実際には「グロース」が作成された
- モーダルで間違ったプランIDを渡している可能性

**確認方法**:
```typescript
// src/pages/Subscription.tsx
// handleSubscribe の引数 newPlanType, newDuration が正しいか確認
console.log('Selected plan:', { newPlanType, newDuration });
```

---

### 仮説4: Stripe Product/Price IDのマッピングミス
**可能性**: 高い

**根拠**:
- `subscriptionPlans.ts` のハードコードされた料金とStripe実際の値が不一致
- Price IDのマッピングが間違っている可能性

**確認方法**:
```typescript
// src/utils/subscriptionPlans.ts
// getStripePriceId() の返り値が正しいか確認
```

---

## 🛠️ 解決策の方針

### 優先度1: 料金情報をStripeから直接取得 🎯
**目的**: 料金の不一致を解消

**実装方針**:
1. Stripe Price API を使用して実際の料金を取得
2. `subscriptionPlans.ts` のハードコード値を削除
3. モーダルで表示する料金を Stripe から取得した値に変更

**参考ドキュメント**:
- Stripe API: `stripe.prices.retrieve(priceId)`
- または `stripe.prices.list()` で全プラン取得

---

### 優先度2: Option 3のCheckoutロジック修正 🎯
**目的**: 「Update subscription」として処理されるようにする

**実装方針**:
1. `create-checkout/index.ts` の実装を見直し
2. 既存サブスクのキャンセル処理が実行されているか確認
3. Checkout Session作成時のパラメータを確認
   - `mode: 'subscription'` が正しいか
   - `subscription_data` が設定されているか

**または**:
- Deep Linkモード（Customer Portal）に戻す
- ただし二重課金監視Webhookを強化

---

### 優先度3: Webhookハンドラーの修正 🎯
**目的**: 決済完了後にデータベースが正しく更新されるようにする

**実装方針**:
1. `stripe-webhook/index.ts` のログを確認
2. `checkout.session.completed` イベントが正しく処理されているか確認
3. データベース更新ロジックを見直し

---

### 優先度4: リダイレクト処理の修正
**目的**: 決済完了後に適切な画面に遷移するようにする

**実装方針**:
1. Checkout Session の `success_url` を確認
2. トースト通知の実装を確認
3. `/subscription?updated=true` のパラメータ処理を確認

---

## 📝 次のアクション

### ステップ1: 現状確認（コード調査）
- [ ] `supabase/functions/create-customer-portal/index.ts` の `isDeepLinkMode` 確認
- [ ] `supabase/functions/create-checkout/index.ts` のロジック確認
- [ ] `src/utils/subscriptionPlans.ts` のPrice ID確認
- [ ] Edge Function ログ確認（`mcp__supabase__get_logs`）

### ステップ2: 問題の特定
- [ ] なぜ「Subscribe to」（新規登録）になるのか特定
- [ ] なぜFeedbackではなくグロースになったのか特定
- [ ] なぜ料金が不一致なのか特定

### ステップ3: 修正計画の作成
- [ ] 料金取得ロジックの修正計画
- [ ] Checkoutロジックの修正計画
- [ ] Webhookハンドラーの修正計画
- [ ] テスト計画の見直し

### ステップ4: 実装
- [ ] 計画に従って修正を実装
- [ ] ユニットテストの追加
- [ ] E2Eテストの再実施

---

## 💡 ユーザー体験に関する検討事項

### モーダル確認 + Stripe Checkout の二重確認について
**ユーザーからの質問**:
> モーダルで確認を出すのに、Stripeでもう1度内容を表示するのもユーザー体験にどう思うか意見を聞きたい

**検討**:

#### パターンA: モーダル + Checkout（現在の実装）
- **メリット**:
  - モーダルで事前にプロレーション（差額）を確認できる
  - Checkoutで最終確認ができる（二段階確認）
- **デメリット**:
  - 確認が2回で冗長
  - ユーザーが混乱する可能性

#### パターンB: Checkoutのみ（モーダルなし）
- **メリット**:
  - シンプルで分かりやすい
  - Stripeの公式UIで信頼性が高い
- **デメリット**:
  - プロレーション（差額）の事前確認ができない
  - Option 3では「Subscribe to」（新規登録）と表示されるため不自然

#### パターンC: Deep Link（Customer Portal）
- **メリット**:
  - Stripeの公式「プラン変更」UI
  - プロレーション（差額）が表示される
  - 確認は1回のみ
- **デメリット**:
  - 二重課金のリスク（Webhook監視が必須）
  - Deep Linkが正しく動作しない場合がある

**推奨**:
1. まず Option 3（Checkout）を正しく動作させる
2. その後、UX改善のために Deep Link + 二重課金監視 に移行
3. または、モーダルを削除してCheckoutのみにする

---

## 🔗 関連ドキュメント
- `.claude/docs/subscription/issues/2025-11-28-deeplink-disabled-root-cause.md`
- `.claude/docs/subscription/plans/plan-change-modal-implementation.md`
- `.claude/docs/subscription/development-checklist.md`

---

**作成日**: 2025-11-28
**最終更新**: 2025-11-28
