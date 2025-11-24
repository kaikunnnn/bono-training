# ステップ7: プラン変更機能 詳細仕様

**作成日**: 2025-11-17
**目的**: 既存契約者が安全にプラン変更できる機能を実装

---

## 🎯 実装方針

### Stripe Customer Portalを活用

- **新規登録**: Stripe Checkout
- **プラン変更**: Stripe Customer Portal
- **解約**: Stripe Customer Portal

---

## 📋 実装タスク一覧

### タスク1: 既存の誤った実装を削除 ✅
**所要時間**: 5分

**実施内容**:
- `supabase/functions/create-checkout/index.ts`の79-98行目を削除
- 理由: Customer Portalを使う場合、手動でのキャンセル処理は不要

**削除するコード**:
```typescript
// 2重サブスク防止: 既存サブスクリプションをキャンセル
try {
  await stripe.subscriptions.cancel(existingSubscriptionId);
  // ... データベース更新
} catch (cancelError) {
  // ...
}
```

**結果**: チェックアウトは新規登録専用に戻る

---

### タスク2: Subscription.tsxの修正
**所要時間**: 20分

**実施内容**:
`src/pages/Subscription.tsx`の`handleSubscribe`関数を修正

**現在のコード**:
```typescript
const handleSubscribe = async (selectedPlanType: PlanType) => {
  setIsLoading(true);
  try {
    // 常にチェックアウトに遷移
    const returnUrl = window.location.origin + '/subscription/success';
    const { url, error } = await createCheckoutSession(returnUrl, selectedPlanType, selectedDuration);

    if (url) {
      window.location.href = url;
    }
  } catch (error) {
    // エラー処理
  }
};
```

**修正後のコード**:
```typescript
const handleSubscribe = async (selectedPlanType: PlanType) => {
  setIsLoading(true);
  try {
    // 既存契約者かどうかで分岐
    if (isSubscribed) {
      // 既存契約者 → Customer Portalに遷移
      console.log('既存契約者: Customer Portalに遷移します');
      const portalUrl = await getCustomerPortalUrl('/subscription');
      window.location.href = portalUrl;
    } else {
      // 新規ユーザー → Checkoutに遷移
      console.log('新規ユーザー: Checkoutに遷移します');
      const returnUrl = window.location.origin + '/subscription/success';
      const { url, error } = await createCheckoutSession(returnUrl, selectedPlanType, selectedDuration);

      if (error) {
        throw error;
      }

      if (url) {
        window.location.href = url;
      }
    }
  } catch (error) {
    console.error('購読エラー:', error);
    toast({
      title: "エラーが発生しました",
      description: error instanceof Error ? error.message : "処理に失敗しました。もう一度お試しください。",
      variant: "destructive",
    });
  } finally {
    setIsLoading(false);
  }
};
```

**検証ポイント**:
- [ ] `isSubscribed`フラグが正しく動作するか
- [ ] 新規ユーザーはCheckoutに遷移するか
- [ ] 既存契約者はCustomer Portalに遷移するか

---

### タスク3: Stripe Customer Portalの設定確認
**所要時間**: 15分

**実施内容**:
Stripeダッシュボードで設定を確認・調整

**確認項目**:
1. Customer Portalが有効化されているか
2. プラン変更機能が有効化されているか
3. 表示するプラン（Standard, Feedback）が設定されているか
4. リダイレクトURL（`/subscription`）が設定されているか

**手順**:
1. https://dashboard.stripe.com/test/settings/billing/portal を開く
2. 「Customer Portal」セクションを確認
3. 「Products」で表示するプランを選択
4. 「Subscription changes」を有効化
5. 保存

**注意点**:
- テストモードと本番モードで別々に設定が必要
- 現在はテストモードで設定

---

### タスク4: PlanCardコンポーネントのUI改善（オプション）
**所要時間**: 15分
**優先度**: 中

**実施内容**:
既存契約者がプランカードを見たときに、「変更する」ボタンのラベルを調整

**現在**:
- すべてのプランで「購読する」ボタン

**改善案**:
```typescript
// src/components/subscription/PlanCard.tsx
const getButtonLabel = () => {
  if (isCurrentPlan) return '現在のプラン';
  if (isSubscribed) return 'このプランに変更';
  return '購読する';
};
```

**メリット**:
- ユーザーが「変更」であることを明確に理解できる
- UX向上

---

### タスク5: create-checkout Edge Functionの再デプロイ
**所要時間**: 3分

**実施内容**:
タスク1の変更を反映するため、再デプロイ

**コマンド**:
```bash
npx supabase functions deploy create-checkout --no-verify-jwt
```

**検証**:
- [ ] デプロイが成功したか
- [ ] 新規ユーザーのチェックアウトが正常に動作するか

---

### タスク6: 動作テスト
**所要時間**: 30分

#### テストケース1: 新規ユーザー
1. 未契約ユーザーでログイン
2. `/subscription`ページでプラン選択
3. 「購読する」ボタンをクリック
4. **期待**: Checkoutページに遷移
5. テストカード決済
6. `/subscription/success`に遷移
7. サブスクリプション情報が更新される

#### テストケース2: 既存契約者（プラン変更）
1. 既存契約者でログイン（例: Standard 1ヶ月）
2. `/subscription`ページで別プラン選択（例: Feedback 1ヶ月）
3. 「このプランに変更」ボタンをクリック
4. **期待**: Customer Portalに遷移
5. Customer Portalで：
   - 現在のプラン表示
   - 新しいプラン選択
   - **日割り計算後の金額表示**
   - 「変更する」ボタンをクリック
6. `/subscription`に戻る
7. 新しいプランが反映されている

#### テストケース3: 既存契約者（期間変更）
1. 既存契約者でログイン（例: Standard 1ヶ月）
2. `/subscription`ページで期間変更（Standard 3ヶ月）
3. 同様にCustomer Portalで変更
4. 期間が更新される

#### テストケース4: 既存契約者（同じプラン選択）
1. 既存契約者でログイン（例: Standard 1ヶ月）
2. `/subscription`ページで同じプラン選択（Standard 1ヶ月）
3. **期待**: ボタンが無効化される（`isCurrentPlan`）
4. 何も起こらない

---

## 🔍 技術的な詳細

### Customer Portalの動作

**遷移時**:
```typescript
const portalUrl = await getCustomerPortalUrl('/subscription');
// Edge Function: create-customer-portal が呼ばれる
// Stripe API: stripe.billingPortal.sessions.create()
// 戻り値: https://billing.stripe.com/session/xxx
```

**Customer Portal内での操作**:
1. ユーザーが「プランを変更」を選択
2. 利用可能なプランが表示される（Stripeダッシュボードで設定）
3. 新しいプランを選択
4. **日割り計算の金額が自動表示**
5. 「変更する」ボタンをクリック
6. Stripeが以下を自動実行:
   - `subscription.updated` Webhookイベント
   - 日割り計算の請求書作成
   - サブスクリプション情報の更新
7. 設定したリダイレクトURLに戻る（`/subscription`）

**Webhook処理**:
- `customer.subscription.updated`イベントが発火
- `supabase/functions/stripe-webhook/index.ts`で処理
- データベースの`user_subscriptions`テーブルを更新
  - `plan_type`
  - `duration`（必要に応じて）
  - `updated_at`

---

## 📊 実装の完成度

### 必須タスク
- [ ] タスク1: 誤った実装の削除
- [ ] タスク2: Subscription.tsxの修正
- [ ] タスク3: Customer Portal設定確認
- [ ] タスク5: Edge Function再デプロイ
- [ ] タスク6: 動作テスト

### オプションタスク
- [ ] タスク4: UI改善

---

## 🎯 完了条件

1. 新規ユーザーがCheckoutで決済できる
2. 既存契約者がCustomer Portalでプラン変更できる
3. 日割り計算が自動適用される
4. 2重サブスクが発生しない
5. Webhookでデータベースが正しく更新される

---

## ⚠️ 注意点

### Customer Portalの制限事項
- UIカスタマイズは限定的
- Stripeダッシュボードでの設定が必要
- テストモードと本番モードで別々の設定

### Webhookの依存性
- `customer.subscription.updated`イベントが正しく処理される必要がある
- 現在の`stripe-webhook` Edge Functionで対応済みか確認が必要

---

**次のアクション**: タスク1から順に実装開始
