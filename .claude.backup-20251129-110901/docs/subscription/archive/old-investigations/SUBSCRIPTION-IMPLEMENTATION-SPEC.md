# サブスクリプション実装仕様書

作成日: 2025-11-22

## 📋 目次

1. [現状分析](#現状分析)
2. [正しい仕様](#正しい仕様)
3. [実装計画](#実装計画)
4. [テスト計画](#テスト計画)

---

## 現状分析

### 🔍 実装調査結果

#### 1. 新規サブスクリプション作成フロー

**ファイル:** `supabase/functions/create-checkout/index.ts`

**動作:**
- ✅ Stripe Checkoutセッションを作成
- ✅ 既存のアクティブサブスクリプションを全てキャンセル（lines 196-290）
- ✅ 新しいサブスクリプションを作成
- ✅ 環境（test/live）を正しく分離

**使用箇所:**
- `src/pages/Subscription.tsx` line 80（新規ユーザーのみ）

**評価:** ✅ **正しく実装されている**

---

#### 2. サブスクリプション更新フロー（未使用）

**ファイル:** `supabase/functions/update-subscription/index.ts`

**動作:**
- ✅ `stripe.subscriptions.update()` を使用（line 133）
- ✅ `proration_behavior: 'create_prorations'` で日割り計算を有効化（line 138）
- ✅ 同じサブスクリプションIDを維持
- ✅ Subscription Itemsを更新

**使用箇所:**
- ❌ **どこからも呼ばれていない**

**評価:** ✅ 実装は正しいが未使用

---

#### 3. Customer Portalフロー（現在使用中）

**ファイル:** `supabase/functions/create-customer-portal/index.ts`

**動作:**
- Stripe Customer Portalセッションを作成
- `useDeepLink=true` でサブスクリプション更新画面に直接遷移（lines 121-153）
- Stripe側で `stripe.subscriptions.update()` + proration を処理

**使用箇所:**
- `src/pages/Subscription.tsx` line 70（既存契約者）

**評価:** ⚠️ **技術的には正しいが、UX的に問題あり**

**問題点:**
1. ユーザーがBonoのUIでプランを選択済み
2. Customer Portalで**もう一度**プラン選択が必要
3. 二重の操作で混乱を招く

---

#### 4. Webhook処理（誤った実装を追加済み）

**ファイル:** `supabase/functions/stripe-webhook-test/index.ts`

**動作:**
- ❌ `handleSubscriptionUpdated` に自動キャンセルロジックを追加（lines 443-477）
- ❌ `customer.subscription.updated` イベント時に他のサブスクリプションをキャンセル

**評価:** ❌ **誤った実装**

**問題点:**
1. `subscription.updated` は既存サブスクリプションの更新を意味する
2. 新しいサブスクリプションは作成されていない
3. 自動キャンセルロジックは不要で有害

---

### 🔑 重要な発見

#### Stripe Prorationの正しい動作

Stripeのドキュメント（`docs.stripe.com/billing/subscriptions/change-price`）より：

```typescript
// プラン変更の正しい方法
stripe.subscriptions.update('sub_xxxxx', {
  items: [{
    id: 'si_xxxxx',  // 既存のSubscription Item ID
    price: 'price_new' // 新しいPrice ID
  }],
  proration_behavior: 'create_prorations' // 日割り計算
});
```

**重要な点:**
1. **サブスクリプションIDは変わらない**
2. **Subscription Items**のみ更新される
3. **自動的に日割り計算**が行われる
4. **Invoice Item**として差額が計上される
5. **新しいサブスクリプションは作成されない**

#### Customer Portalの動作

- Stripe Customer Portalは内部で `stripe.subscriptions.update()` を呼び出す
- `proration_behavior` はCustomer Portal設定で制御される
- ユーザーは**StripeのUI**でプラン選択を行う

---

## 正しい仕様

### 🎯 サブスクリプション管理の設計方針

#### 方針A: Customer Portalを使用（現行）

**メリット:**
- Stripe公式UIで安全
- 決済情報更新、キャンセルも可能
- 実装がシンプル

**デメリット:**
- 二重のプラン選択が必要
- UXが悪い
- Bonoブランド体験が損なわれる

#### 方針B: update-subscription Edge Functionを使用（推奨）

**メリット:**
- ✅ シームレスなUX（ワンクリックでプラン変更）
- ✅ Bonoブランド体験を維持
- ✅ Stripe Prorationを正しく使用
- ✅ 既に実装済み

**デメリット:**
- 決済情報更新は別途Customer Portalが必要
- キャンセル処理も別途実装が必要

---

### ✅ 推奨仕様: 方針Bの採用

#### 1. 新規サブスクリプション作成

**ユーザーアクション:** プランを選択して「登録する」

**フロー:**
1. `createCheckoutSession()` を呼び出し
2. Stripe Checkoutページに遷移
3. 決済情報入力
4. `checkout.session.completed` Webhook
5. サブスクリプション作成完了

**使用関数:** `create-checkout`

**変更:** なし（現状維持）

---

#### 2. プラン変更（アップグレード/ダウングレード）

**ユーザーアクション:** 別のプランを選択して「変更する」

**フロー:**
1. ✅ `updateSubscription(planType, duration)` を呼び出し
2. ✅ `stripe.subscriptions.update()` で既存サブスクリプションを更新
3. ✅ `proration_behavior: 'create_prorations'` で日割り計算
4. ✅ `customer.subscription.updated` Webhook
5. ✅ DB更新完了

**使用関数:** `update-subscription`（既存・未使用）

**変更:** フロントエンドで呼び出すように修正

---

#### 3. 決済情報更新

**ユーザーアクション:** 「決済情報を変更する」ボタンをクリック

**フロー:**
1. `getCustomerPortalUrl(returnUrl, false)` を呼び出し
2. Customer Portalに遷移
3. ユーザーが決済情報を更新
4. リターンURLに戻る

**使用関数:** `create-customer-portal`

**変更:** なし（決済情報更新専用として継続使用）

---

#### 4. サブスクリプションキャンセル

**ユーザーアクション:** 「解約する」ボタンをクリック

**フロー:**
1. `getCustomerPortalUrl(returnUrl, false)` を呼び出し
2. Customer Portalに遷移
3. ユーザーがキャンセル操作
4. `customer.subscription.updated` または `customer.subscription.deleted` Webhook
5. DB更新完了

**使用関数:** `create-customer-portal`

**変更:** なし（キャンセル操作用として継続使用）

---

### 🗂️ Webhook処理の仕様

#### customer.subscription.updated

**意味:** 既存サブスクリプションが更新された

**トリガー例:**
- プラン変更（`update-subscription` による）
- 決済情報更新
- サブスクリプション期間延長
- キャンセル予約（`cancel_at_period_end = true`）

**処理:**
1. ✅ DB内の該当サブスクリプションを更新
2. ❌ **他のサブスクリプションはキャンセルしない**（誤った実装を削除）

---

#### customer.subscription.deleted

**意味:** サブスクリプションが削除された

**処理:**
1. DB内の該当サブスクリプションを `is_active = false` に更新

---

#### checkout.session.completed

**意味:** 新規サブスクリプション作成完了

**処理:**
1. サブスクリプション情報をDBに保存
2. 既存のアクティブサブスクリプションは `create-checkout` で既にキャンセル済み

---

## 実装計画

### Phase 1: Webhook修正（緊急）

**優先度:** 🔴 高

**作業内容:**
1. ❌ `stripe-webhook-test/index.ts` の `handleSubscriptionUpdated` から自動キャンセルロジックを削除
2. ✅ `customer.subscription.updated` は単純にDB更新のみ行う
3. ✅ 同様に `stripe-webhook/index.ts`（Live環境）も修正

**影響範囲:**
- `supabase/functions/stripe-webhook-test/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**テスト:**
- Test 2Dとして検証（TESTING-LOG.mdに記録）

---

### Phase 2: フロントエンド修正

**優先度:** 🟡 中

**作業内容:**
1. `src/pages/Subscription.tsx` の `handleSubscribe` を修正
2. 既存契約者の場合、`updateSubscription()` を呼び出し
3. Customer Portalは「決済情報変更」「解約」ボタン専用に

**修正箇所:**

```typescript
// Before（現在）
if (isSubscribed) {
  const portalUrl = await getCustomerPortalUrl('/subscription', true);
  window.location.href = portalUrl;
}

// After（推奨）
if (isSubscribed) {
  const { success, error } = await updateSubscription(selectedPlanType, selectedDuration);
  if (error) throw error;

  toast({
    title: "プランを変更しました",
    description: `${formatPlanDisplay(selectedPlanType, selectedDuration)}に変更しました`,
  });

  // サブスクリプション情報を再取得
  // SubscriptionContextのrefreshを呼び出す
}
```

**影響範囲:**
- `src/pages/Subscription.tsx`
- `src/components/account/SubscriptionInfo.tsx`（決済情報変更ボタン追加）

**テスト:**
- Test 2E: プラン変更のEnd-to-Endテスト

---

### Phase 3: update-subscription関数の環境対応

**優先度:** 🟢 低

**作業内容:**
1. `update-subscription/index.ts` を環境（test/live）に対応
2. `createStripeClient(environment)` を使用
3. Price ID取得を環境別に

**修正箇所:**

```typescript
// Before（現在）
const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
  apiVersion: "2023-10-16",
});

// After（推奨）
import { createStripeClient, type StripeEnvironment } from "../_shared/stripe-helpers.ts";

const environment: StripeEnvironment = useTestPrice ? "test" : "live";
const stripe = createStripeClient(environment);
```

**影響範囲:**
- `supabase/functions/update-subscription/index.ts`

---

### Phase 4: Customer Portal設定確認

**優先度:** 🟢 低（確認のみ）

**確認項目:**
1. Stripe Dashboard → Settings → Customer Portal
2. 「Subscription update」が有効か
3. 「Prorate subscription updates」が有効か

**期待値:**
- Customer Portalでもproration機能が有効
- ただしPhase 2以降は主にupdate-subscriptionを使用

---

## テスト計画

### Test 2D: Webhook修正の検証

**前提条件:**
- Phase 1完了
- テストモード使用

**手順:**
1. アクティブなサブスクリプションが1つ存在
2. プラン変更を実行（Feedback → Standard）
3. `customer.subscription.updated` Webhookを確認

**期待結果:**
- ✅ 既存サブスクリプションが更新される
- ✅ サブスクリプションIDは変わらない
- ✅ DB内のレコードは1つのまま
- ✅ 他のサブスクリプションはキャンセルされない

---

### Test 2E: プラン変更End-to-End

**前提条件:**
- Phase 2完了
- アクティブなサブスクリプション（Feedback 1ヶ月）

**手順:**
1. Subscriptionページでプラン変更（Standard 1ヶ月）
2. トースト通知を確認
3. Stripe Dashboardで確認
4. DBで確認

**期待結果:**
- ✅ `updateSubscription` が呼ばれる
- ✅ 即座に変更完了のトースト表示
- ✅ Stripeで同じサブスクリプションIDのまま更新
- ✅ Invoice ItemにProration（日割り計算）が追加
- ✅ DBの `plan_type` が更新される
- ✅ アクティブなサブスクリプションは常に1つ

---

## まとめ

### 現在の問題点

1. ❌ Webhookに誤った自動キャンセルロジック
2. ⚠️ 正しい `update-subscription` 関数が未使用
3. ⚠️ Customer Portalで二重のプラン選択

### 解決方針

1. ✅ Webhookから自動キャンセルロジックを削除
2. ✅ `updateSubscription()` をフロントエンドから呼び出す
3. ✅ Customer Portalは決済情報変更・キャンセル専用に
4. ✅ Stripe Prorationを正しく活用

### 期待される成果

- ✅ シームレスなプラン変更UX
- ✅ 日割り計算の正しい適用
- ✅ 重複サブスクリプションの防止
- ✅ Bonoブランド体験の維持
