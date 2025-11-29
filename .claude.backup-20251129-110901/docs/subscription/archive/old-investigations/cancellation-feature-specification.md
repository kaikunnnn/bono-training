# 解約機能 - 詳細仕様書

**作成日**: 2025-11-18
**目的**: ユーザーが自分でサブスクリプションを解約できる機能を実装する

---

## 📋 要件定義

### 機能要件

1. **解約ボタンの配置**
   - `/account`ページに「サブスクリプションを管理」ボタンを追加
   - 既存の「プランを管理」ボタンと同じ場所に配置

2. **解約フロー**
   - ボタンクリック → Stripe Customer Portalに遷移
   - Customer Portal内で解約操作
   - 解約後、自動で`/account`ページに戻る

3. **解約後の処理**
   - Webhook（`customer.subscription.deleted`または`customer.subscription.updated`）が発火
   - データベースの`user_subscriptions`を更新
   - フロントエンドで状態を反映

---

## 🎯 実装方針

### オプションA: Stripe Customer Portal（推奨）✅

**メリット**:
- ✅ Stripeが提供する標準UI（信頼性が高い）
- ✅ 解約、プラン変更、支払い方法変更がすべて可能
- ✅ セキュアで安全
- ✅ **すでに実装済み**（`getCustomerPortalUrl`関数が存在）
- ✅ 実装時間: 30分

**デメリット**:
- ❌ UIカスタマイズ不可

### オプションB: カスタム解約画面

**メリット**:
- ✅ 完全なUIカスタマイズ

**デメリット**:
- ❌ 実装時間: 3-4時間
- ❌ エラーハンドリングが複雑
- ❌ セキュリティリスク

**結論**: **オプションA（Customer Portal）を採用**

---

## 🔍 既存実装の確認

### 1. Customer Portal関数（`src/services/stripe.ts`）

**関数**: `getCustomerPortalUrl`

```typescript
export const getCustomerPortalUrl = async (
  returnUrl?: string,
  useDeepLink?: boolean
): Promise<string>
```

**パラメータ**:
- `returnUrl`: ポータルから戻る際のURL
- `useDeepLink`: `true`の場合、サブスクリプション更新画面に直接遷移

**使い分け**:
- プラン変更: `useDeepLink: true`
- 解約・全般管理: `useDeepLink: false`（通常のPortal）

**既存の使用箇所**:
- `src/components/account/SubscriptionInfo.tsx:31`
- `src/pages/Subscription.tsx:69`

---

### 2. Webhook処理（`supabase/functions/stripe-webhook/index.ts`）

**解約関連のWebhookイベント**:

#### A. `customer.subscription.deleted`

**発火タイミング**: サブスクリプションが即座にキャンセルされた時

**処理内容**:
```typescript
async function handleSubscriptionDeleted(subscription: any) {
  // user_subscriptionsテーブルを更新
  // is_active: false に設定
}
```

**確認**: すでに実装されているか確認が必要

---

#### B. `customer.subscription.updated`（`cancel_at_period_end: true`）

**発火タイミング**: 期間終了時に解約が予約された時

**処理内容**:
```typescript
async function handleSubscriptionUpdated(subscription: any) {
  if (subscription.cancel_at_period_end) {
    // 期間終了時に解約予定
    // データベースに解約予定フラグを保存
  }
}
```

**確認**: この処理が実装されているか確認が必要

---

## 🚨 失敗しそうな点と対策

### 失敗パターン1: 解約ボタンが表示されない

**問題**:
```typescript
// SubscriptionInfo.tsx
{planType && isSubscribed && (
  <button>プランを管理</button> // ← すでに存在する
)}
```

**対策**:
既存の「プランを管理」ボタンが解約機能も兼ねている
→ 新しいボタンを追加するのではなく、既存ボタンの挙動を確認

---

### 失敗パターン2: ディープリンクで解約画面に遷移できない

**問題**:
```typescript
// 間違った実装
const url = await getCustomerPortalUrl('/account', true); // ← useDeepLink: true
// これだとサブスクリプション更新画面に遷移してしまう
```

**対策**:
```typescript
// 正しい実装
const url = await getCustomerPortalUrl('/account'); // ← useDeepLinkを省略（デフォルトfalse）
// または
const url = await getCustomerPortalUrl('/account', false);
```

---

### 失敗パターン3: Webhook処理が不完全

**問題**:
- `customer.subscription.deleted`のハンドラーが存在しない
- データベースが更新されない

**対策**:
1. Webhookハンドラーを確認
2. 存在しない場合は実装
3. テストして動作確認

---

### 失敗パターン4: 解約後にフロントエンドが更新されない

**問題**:
```typescript
// ユーザーがCustomer Portalで解約
// → /accountページに戻る
// → でも表示が「スタンダード（3ヶ月）」のまま
```

**対策**:
1. ページに戻った際に`useSubscription`が自動で再取得
2. または、手動で`refresh()`を呼び出す

---

### 失敗パターン5: 期間終了時解約（cancel_at_period_end）の表示

**問題**:
```typescript
// ユーザーが「期間終了時に解約」を選択
// → すぐには解約されない
// → でも画面には「解約済み」と表示されてしまう
```

**対策**:
1. `cancel_at_period_end`フラグをデータベースに保存
2. 「○月○日に解約予定」と表示
3. UI実装が複雑になる場合は、最初は無視してもOK

---

## 📁 修正が必要なファイル

### 1. `src/components/account/SubscriptionInfo.tsx`

**現状確認**:
- すでに「プランを管理」ボタンが存在するか？
- `getCustomerPortalUrl()`の引数は？

**修正内容（必要な場合）**:
```typescript
// 現在
const url = await getCustomerPortalUrl();

// 修正後（returnUrlを明示）
const url = await getCustomerPortalUrl('/account', false);
```

**または、ボタンテキストの変更**:
```typescript
// 「プランを管理」 → 「サブスクリプションを管理」
<button>サブスクリプションを管理</button>
```

---

### 2. `supabase/functions/stripe-webhook/index.ts`

**確認事項**:
- [ ] `customer.subscription.deleted`ハンドラーが存在するか
- [ ] `handleSubscriptionUpdated`で`cancel_at_period_end`を処理しているか

**修正内容（必要な場合）**:

#### A. `customer.subscription.deleted`ハンドラー追加

```typescript
async function handleSubscriptionDeleted(stripe: Stripe, supabase: any, subscription: any) {
  console.log("customer.subscription.deletedイベントを処理中");

  const subscriptionId = subscription.id;
  const customerId = subscription.customer;

  try {
    // ユーザーを検索
    const { data: customerData, error: customerError } = await supabase
      .from("stripe_customers")
      .select("user_id")
      .eq("stripe_customer_id", customerId)
      .single();

    if (customerError || !customerData) {
      console.error("顧客が見つかりません:", customerError);
      return;
    }

    const userId = customerData.user_id;

    // user_subscriptionsを無効化
    const { error: updateError } = await supabase
      .from("user_subscriptions")
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq("user_id", userId)
      .eq("stripe_subscription_id", subscriptionId);

    if (updateError) {
      console.error("user_subscriptions更新エラー:", updateError);
    } else {
      console.log("サブスクリプション解約完了:", { userId, subscriptionId });
    }

    // subscriptionsテーブルも更新
    const { error: subUpdateError } = await supabase
      .from("subscriptions")
      .update({
        end_timestamp: new Date().toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (subUpdateError) {
      console.error("subscriptions更新エラー:", subUpdateError);
    }
  } catch (error) {
    console.error("サブスクリプション解約処理エラー:", error.message);
  }
}
```

#### B. メインハンドラーに追加

```typescript
// serve関数内
switch (event.type) {
  case "customer.subscription.created":
    await handleSubscriptionCreated(stripe, supabase, subscription);
    break;
  case "customer.subscription.updated":
    await handleSubscriptionUpdated(stripe, supabase, subscription);
    break;
  case "customer.subscription.deleted": // ← 追加
    await handleSubscriptionDeleted(stripe, supabase, subscription);
    break;
  // ...
}
```

---

### 3. データベーススキーマ確認

**テーブル**: `user_subscriptions`

**必要なカラム**:
- `is_active`: boolean（解約時にfalseに設定）
- `stripe_subscription_id`: text
- `updated_at`: timestamptz

**オプション** (期間終了時解約の表示用):
- `cancel_at_period_end`: boolean
- `cancel_at`: timestamptz

---

## 📝 実装ステップ

### ステップ1: 既存実装の確認

1. `src/components/account/SubscriptionInfo.tsx`を確認
   - 「プランを管理」ボタンの存在
   - `getCustomerPortalUrl`の呼び出し方法

2. `supabase/functions/stripe-webhook/index.ts`を確認
   - `customer.subscription.deleted`ハンドラーの有無
   - イベントタイプのswitch文

---

### ステップ2: 必要に応じてボタンを修正

**修正が必要な場合**:
- ボタンテキストを「サブスクリプションを管理」に変更
- `getCustomerPortalUrl`の引数を明示

**修正不要な場合**:
- すでに正しく実装されている

---

### ステップ3: Webhookハンドラーの実装/確認

1. `customer.subscription.deleted`ハンドラーを実装（存在しない場合）
2. イベントタイプを追加
3. デプロイ

---

### ステップ4: テスト

#### テストケース1: 即時解約

1. `/account`ページで「サブスクリプションを管理」をクリック
2. Customer Portalで「Cancel subscription」をクリック
3. 即座に解約（Cancel immediately）を選択
4. `/account`ページに戻る
5. 表示が「無料」または「フリープラン」に変わる
6. データベース確認: `is_active: false`

#### テストケース2: 期間終了時解約（オプション）

1. `/account`ページで「サブスクリプションを管理」をクリック
2. Customer Portalで「Cancel subscription」をクリック
3. 期間終了時に解約（Cancel at period end）を選択
4. `/account`ページに戻る
5. 表示: 「スタンダード（3ヶ月）」のまま（期間終了まで有効）
6. データベース確認: `is_active: true`, `cancel_at_period_end: true`（オプション）

---

## ✅ 完了チェックリスト

### コード実装
- [ ] `SubscriptionInfo.tsx`でボタンが正しく設定されている
- [ ] `getCustomerPortalUrl`が正しい引数で呼ばれている
- [ ] `customer.subscription.deleted`ハンドラーが実装されている
- [ ] イベントタイプのswitch文に追加されている
- [ ] Webhook関数がデプロイされている

### テスト
- [ ] 「サブスクリプションを管理」ボタンをクリックできる
- [ ] Customer Portalに遷移できる
- [ ] 即時解約が機能する
- [ ] データベースが正しく更新される（`is_active: false`）
- [ ] フロントエンドで「無料」または「フリープラン」と表示される
- [ ] `/account`ページに正しく戻る

### ドキュメント
- [ ] 実装内容を記録
- [ ] テスト結果を記録

---

## 📊 見積もり

| ステップ | 所要時間 |
|---------|---------|
| ステップ1: 既存実装確認 | 5分 |
| ステップ2: ボタン修正（必要な場合） | 5分 |
| ステップ3: Webhookハンドラー実装 | 15分 |
| ステップ4: テスト | 15分 |
| **合計** | **40分** |

---

## 🔮 将来の拡張

### 拡張1: 解約理由の収集

Customer Portalには解約理由を収集する機能がある
- Stripe Dashboardで設定可能
- データはStripeに保存される

### 拡張2: 解約予定の表示

`cancel_at_period_end: true`の場合:
```typescript
// SubscriptionInfo.tsx
{cancelAtPeriodEnd && (
  <div className="bg-yellow-50 p-3 rounded-lg">
    <p>このプランは{formatDate(cancelAt)}に解約されます</p>
  </div>
)}
```

### 拡張3: 解約の取り消し

Customer Portalには「解約を取り消す」機能もある
- ユーザーが期間終了前に解約をキャンセルできる

---

## 🚀 次のアクション

### 今すぐ実施

1. `SubscriptionInfo.tsx`を確認
2. `stripe-webhook/index.ts`を確認
3. 必要な修正を実施
4. デプロイ
5. テスト

---

**作成者**: Claude Code
**作成日**: 2025-11-18
