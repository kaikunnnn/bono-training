# サブスクリプション機能 完全実装プラン

**最終更新**: 2025-11-17
**目標**: ユーザーが必要とする決済機能をすべて実装する

---

## 📊 全体進捗

**完了**: 5/9 ステップ (56%)

```
[███████████░░░░░░░░░] 56%
```

---

## 🎯 実装する機能一覧

### フェーズ1: 新規登録 ✅ (ほぼ完了)
- [x] データベーススキーマ確認
- [x] Webhook同期
- [x] 期間選択機能（1ヶ月/3ヶ月）
- [x] 成功ページ作成
- [x] キャンセルURL修正
- [ ] 新規決済テスト（実施中）

### フェーズ2: プラン変更 ⏳ (未実装)
- [ ] 2重サブスク防止
- [ ] 既存プランのキャンセル処理
- [ ] 新プランへの即時切り替え
- [ ] プラン変更のテスト

### フェーズ3: 解約 ⏳ (未実装)
- [ ] 解約ボタンの実装
- [ ] Stripe Customer Portalとの連携
- [ ] 解約確認モーダル
- [ ] 解約後の状態管理
- [ ] 解約のテスト

### フェーズ4: 統合テスト ⏳ (未実装)
- [ ] 全フローの動作確認
- [ ] エラーハンドリング確認
- [ ] UIフィードバック確認

---

## 📋 詳細実装ステップ

### ✅ ステップ1-5: 新規登録の基盤実装（完了）

詳細は `subscription-progress-tracker.md` を参照

---

### ⏳ ステップ6: 新規ユーザー決済テスト（実施中）

**目的**: 新規ユーザーが問題なく決済できることを確認

**テスト項目**:
1. `/subscription`ページでプラン選択
2. Stripeチェックアウトで決済（テストカード: `4242 4242 4242 4242`）
3. `/subscription/success`に遷移
4. サブスクリプション情報が更新される
5. `/account`ページでプラン表示

**検証ポイント**:
- [ ] チェックアウトURLが正しく生成される
- [ ] 決済完了後に`checkout.session.completed` Webhookが発火
- [ ] データベースに正しくサブスクリプション情報が保存される
- [ ] フロントエンドでサブスクリプション状態が反映される

---

### ⏳ ステップ7: 2重サブスク防止の実装

**目的**: 既存契約者が新しいプランを選択したときに、古いサブスクリプションを自動キャンセル

**現在の問題**:
- 既存サブスクリプションがある状態で新規チェックアウトすると、2つのサブスクリプションが作成される
- ユーザーが2重課金される可能性がある

**実装方針**:

#### オプションA: チェックアウト前にキャンセル（推奨）
```typescript
// create-checkout/index.ts
if (existingSubscriptionId) {
  // 既存サブスクリプションをキャンセル
  await stripe.subscriptions.cancel(existingSubscriptionId);
  logDebug("既存サブスクリプションをキャンセル:", { existingSubscriptionId });
}
```

#### オプションB: Webhook内で古いサブスクを検出してキャンセル
```typescript
// stripe-webhook/index.ts の checkout.session.completed 内
const existingSubs = await stripe.subscriptions.list({
  customer: customerId,
  status: 'active'
});

if (existingSubs.data.length > 1) {
  // 古いサブスクリプションをキャンセル
}
```

**推奨**: オプションA（チェックアウト前にキャンセル）

**実装ファイル**:
- `supabase/functions/create-checkout/index.ts`

**テスト手順**:
1. 既存サブスクリプションがあるユーザーでログイン
2. 別のプランを選択
3. チェックアウト開始
4. Stripeで既存サブスクがキャンセルされていることを確認
5. 新しいサブスクが作成されることを確認

---

### ⏳ ステップ8: プラン変更（アップグレード/ダウングレード）実装

**目的**: 既存契約者が同じ決済サイクル内でプランを変更できるようにする

**実装方針**:

#### オプションA: Stripe Subscription Updateを使用（推奨）
```typescript
// 新しいEdge Function: update-subscription
await stripe.subscriptions.update(subscriptionId, {
  items: [{
    id: subscriptionItemId,
    price: newPriceId,
  }],
  proration_behavior: 'create_prorations', // 日割り計算
});
```

#### オプションB: 既存サブスクをキャンセルして新規作成
- ステップ7と同じ方法
- チェックアウトを使用

**推奨**:
- 即時変更が必要な場合: オプションA
- チェックアウトで確認してほしい場合: オプションB（現在の実装）

**現在の実装状況**:
- `src/services/stripe.ts`に`updateSubscription`関数が存在
- `supabase/functions/update-subscription`が必要

**実装内容**:
1. `supabase/functions/update-subscription/index.ts`を作成
2. Stripe Subscription Update APIを呼び出し
3. データベースを更新
4. フロントエンドで即時反映

**UI実装**:
- `src/pages/Subscription.tsx`で「プラン変更」ボタン表示
- 既存契約者には「現在のプラン」表示
- 変更時に確認モーダル

---

### ⏳ ステップ9: サブスクリプション解約機能

**目的**: ユーザーが自分でサブスクリプションを解約できるようにする

**実装方針**:

#### オプションA: Stripe Customer Portal（推奨）
```typescript
// すでに実装済み: src/services/stripe.ts の getCustomerPortalUrl
const portalUrl = await getCustomerPortalUrl('/account');
window.location.href = portalUrl;
```

**メリット**:
- Stripeが提供する標準UI
- 解約、プラン変更、支払い方法変更がすべて可能
- セキュアで信頼性が高い

#### オプションB: カスタム実装
```typescript
// 新しいEdge Function: cancel-subscription
await stripe.subscriptions.cancel(subscriptionId, {
  cancel_at_period_end: true // 期間終了時にキャンセル
});
```

**推奨**: オプションA（Customer Portal）

**実装内容**:

1. **`src/pages/Account.tsx`に解約ボタン追加**
```typescript
<Button
  onClick={async () => {
    const url = await getCustomerPortalUrl('/account');
    window.location.href = url;
  }}
>
  プランを管理
</Button>
```

2. **`supabase/functions/create-customer-portal/index.ts`確認**
- すでに存在する場合は動作確認
- 存在しない場合は作成

3. **解約後のWebhook処理確認**
- `customer.subscription.deleted`イベント（すでに実装済み）
- `customer.subscription.updated`イベント（`cancel_at_period_end`の場合）

**UI実装**:
- アカウントページに「プランを管理」ボタン
- クリックでStripe Customer Portalに遷移
- ポータルで解約操作
- 解約後にアカウントページに戻る

---

### ⏳ ステップ10: 全決済フローの統合テスト

**目的**: すべての機能が正常に動作することを確認

**テストケース**:

#### 1. 新規登録フロー
- [ ] 未ログインユーザーは決済ページにアクセスできない
- [ ] ログイン後、プラン選択ができる
- [ ] チェックアウトで決済完了
- [ ] 成功ページに遷移
- [ ] サブスクリプション情報が反映

#### 2. プラン変更フロー
- [ ] 既存契約者が別プランを選択
- [ ] 古いサブスクが自動キャンセル
- [ ] 新しいサブスクが作成
- [ ] 2重課金されない

#### 3. 解約フロー
- [ ] アカウントページで「プラン管理」ボタンをクリック
- [ ] Customer Portalで解約
- [ ] Webhookでデータベース更新
- [ ] フロントエンドで状態反映

#### 4. エラーハンドリング
- [ ] 決済失敗時のエラー表示
- [ ] Webhook失敗時の再試行
- [ ] ネットワークエラー時のフィードバック

---

## 🔧 実装が必要なファイル

### 新規作成が必要
- [ ] `supabase/functions/update-subscription/index.ts`（オプション）
- [ ] `supabase/functions/create-customer-portal/index.ts`（未確認）
- [ ] `supabase/functions/cancel-subscription/index.ts`（オプション）

### 修正が必要
- [ ] `supabase/functions/create-checkout/index.ts`（2重サブスク防止）
- [ ] `src/pages/Account.tsx`（解約ボタン追加）
- [ ] `src/pages/Subscription.tsx`（プラン変更UI改善）

---

## 📝 次のアクション

### 今すぐ実施: ステップ6
新規ユーザー決済テストを実施して、基本フローが動作することを確認

### その後の優先順位
1. **ステップ7**: 2重サブスク防止（高優先度）
2. **ステップ9**: 解約機能（高優先度）
3. **ステップ8**: プラン変更（中優先度・現在のチェックアウト方式でも動作する）
4. **ステップ10**: 統合テスト

---

**作成者**: Claude Code
**作成日**: 2025-11-17
