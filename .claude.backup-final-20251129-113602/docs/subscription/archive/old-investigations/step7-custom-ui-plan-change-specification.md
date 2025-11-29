# ステップ7: カスタムUIでのプラン変更機能 実装仕様

**作成日**: 2025-11-17
**実装方針**: カスタムUIで決済確認画面を実装（ChatGPT方式）

---

## 📋 要件定義

### ユーザー体験

1. **プラン選択**: `/subscription`ページでプランカードから「このプランに変更」をクリック
2. **確認画面表示**: `/subscription/confirm`ページで以下を表示:
   - 選択したプラン名・金額
   - 日割り計算（Adjustment）
   - Subtotal / Tax / Total due today
   - 登録済み支払い方法
   - 「Pay now」ボタン
3. **決済実行**: ボタンクリックで即座にプラン変更・決済
4. **完了画面**: `/subscription/success`に遷移

### 参考UI

ChatGPTのプラン変更画面:
- シンプルで明確な金額表示
- 日割りクレジット（-$6.51）の明示
- Total due todayの強調
- Cancelボタンとの明確な区別

---

## 🔍 技術調査結果

### Stripe APIの機能

#### 1. Subscription Update API
**エンドポイント**: `POST /v1/subscriptions/{subscription_id}`

**使用方法**:
```typescript
const updatedSubscription = await stripe.subscriptions.update(
  subscriptionId,
  {
    items: [{
      id: subscriptionItemId,
      price: newPriceId
    }],
    proration_behavior: 'always_invoice', // 即座に請求
    payment_behavior: 'default_incomplete'
  }
);
```

**パラメータ**:
- `items`: サブスクリプションアイテムIDと新しいPrice ID
- `proration_behavior`:
  - `always_invoice`: 即座に日割り計算して請求（アップグレード時）
  - `create_prorations`: 日割り計算を作成（ダウングレード時）
  - `none`: 日割り計算なし
- `payment_behavior`: 支払い失敗時の挙動

#### 2. Create Preview Invoice API（2025年新API）
**エンドポイント**: `POST /v1/invoices/create_preview`

**使用方法**:
```typescript
const previewInvoice = await stripe.invoices.createPreview({
  customer: customerId,
  subscription: subscriptionId,
  subscription_items: [{
    id: subscriptionItemId,
    price: newPriceId
  }],
  subscription_proration_behavior: 'always_invoice'
});
```

**レスポンス**:
```json
{
  "id": "in_preview_xxx",
  "amount_due": 21284, // Total due today (cent単位)
  "subtotal": 19349,
  "tax": 1935,
  "lines": {
    "data": [
      {
        "description": "ChatGPT Pro subscription",
        "amount": 20000,
        "proration": false
      },
      {
        "description": "Prorated credit for the remainder of your plus subscription",
        "amount": -651, // マイナス = クレジット
        "proration": true
      }
    ]
  }
}
```

**重要**: プレビューと実際の更新で同じ`proration_date`を使用すると、完全に一致した日割り計算が可能。

---

## 🏗️ システム設計

### アーキテクチャ

```
Frontend (React)
  ↓
  /subscription/confirm ページ
    - プラン情報表示
    - プレビューAPI呼び出し
    - 日割り計算表示
    - Pay nowボタン
  ↓
Edge Function: preview-subscription-change (新規)
  - Create Preview Invoice API
  - 日割り計算の取得
  ↓
Edge Function: update-subscription (新規)
  - Subscription Update API
  - 実際のプラン変更・決済
  ↓
Webhook: stripe-webhook (既存)
  - customer.subscription.updated
  - invoice.paid
  - データベース更新
```

### データフロー

#### 1. プレビュー取得（確認画面表示時）

```typescript
// Frontend: /subscription/confirm
const response = await fetch('/functions/preview-subscription-change', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    newPriceId: 'price_xxx',
    newPlanType: 'feedback',
    newDuration: 1
  })
});

const preview = await response.json();
// {
//   currentPlan: "スタンダードプラン",
//   newPlan: "フィードバックプラン",
//   newPlanAmount: 1480,
//   prorationCredit: -651,
//   subtotal: 829,
//   tax: 83,
//   totalDueToday: 912,
//   paymentMethod: "•••• 4242"
// }
```

#### 2. プラン変更実行（Pay nowクリック時）

```typescript
// Frontend: Pay nowボタン
const response = await fetch('/functions/update-subscription', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    newPriceId: 'price_xxx',
    newPlanType: 'feedback',
    newDuration: 1,
    prorationDate: Date.now() / 1000 // プレビューと同じタイムスタンプ
  })
});

const result = await response.json();
// {
//   success: true,
//   subscriptionId: "sub_xxx",
//   invoiceId: "in_xxx"
// }
```

---

## 📁 実装タスク

### タスク1: Edge Function - preview-subscription-change 作成

**ファイル**: `supabase/functions/preview-subscription-change/index.ts`

**処理内容**:
1. ユーザー認証
2. 現在のサブスクリプション情報取得
3. Create Preview Invoice API呼び出し
4. レスポンス整形（日本円、税込表示）

**入力**:
```typescript
{
  newPriceId: string;
  newPlanType: 'standard' | 'feedback';
  newDuration: 1 | 3;
}
```

**出力**:
```typescript
{
  currentPlan: string;
  currentDuration: number;
  newPlan: string;
  newDuration: number;
  newPlanAmount: number; // 円
  prorationCredit: number; // 円（マイナス値）
  subtotal: number; // 円
  tax: number; // 円
  totalDueToday: number; // 円
  paymentMethod: string; // "•••• 4242"
  isUpgrade: boolean;
  isDowngrade: boolean;
}
```

---

### タスク2: Edge Function - update-subscription 作成

**ファイル**: `supabase/functions/update-subscription/index.ts`

**処理内容**:
1. ユーザー認証
2. 現在のサブスクリプション情報取得
3. Subscription Update API呼び出し
4. 成功レスポンス返却

**入力**:
```typescript
{
  newPriceId: string;
  newPlanType: 'standard' | 'feedback';
  newDuration: 1 | 3;
  prorationDate?: number; // Unix timestamp
}
```

**出力**:
```typescript
{
  success: boolean;
  subscriptionId: string;
  invoiceId: string;
  error?: string;
}
```

**エラーハンドリング**:
- 支払い失敗
- サブスクリプション未契約
- 同じプランへの変更試行
- Stripe API エラー

---

### タスク3: フロントエンド - /subscription/confirm ページ作成

**ファイル**: `src/pages/SubscriptionConfirm.tsx`

**UI要素**:

#### ヘッダー
- タイトル: "プラン変更の確認"
- 戻るボタン（/subscriptionに戻る）

#### プラン情報セクション
```tsx
<div>
  <h2>新しいプラン</h2>
  <p>{newPlan}プラン</p>
  <p>{newDuration}ヶ月ごとに ¥{newPlanAmount}</p>
</div>
```

#### 金額内訳セクション
```tsx
<div>
  <div>
    <span>新しいプラン料金</span>
    <span>¥{newPlanAmount}</span>
  </div>

  {prorationCredit < 0 && (
    <div>
      <span>日割りクレジット</span>
      <span className="text-green">¥{prorationCredit}</span>
    </div>
  )}

  <div>
    <span>小計</span>
    <span>¥{subtotal}</span>
  </div>

  <div>
    <span>税金</span>
    <span>¥{tax}</span>
  </div>

  <div className="font-bold">
    <span>本日のお支払い額</span>
    <span>¥{totalDueToday}</span>
  </div>
</div>
```

#### 支払い方法セクション
```tsx
<div>
  <span>支払い方法</span>
  <span>{paymentMethod}</span>
</div>
```

#### アクションボタン
```tsx
<div>
  <button onClick={handleCancel}>キャンセル</button>
  <button onClick={handlePayNow} disabled={loading}>
    {loading ? '処理中...' : '今すぐ支払う'}
  </button>
</div>
```

**ステート管理**:
```typescript
const [preview, setPreview] = useState<PreviewData | null>(null);
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**ライフサイクル**:
1. マウント時: URLパラメータから新プラン情報取得
2. プレビューAPI呼び出し
3. ローディング表示 → プレビュー表示

---

### タスク4: Subscription.tsx の修正

**変更内容**:

現在:
```typescript
if (isSubscribed) {
  // Customer Portalに遷移
  const portalUrl = await getCustomerPortalUrl('/subscription');
  window.location.href = portalUrl;
}
```

修正後:
```typescript
if (isSubscribed) {
  // 確認画面に遷移
  navigate(`/subscription/confirm?plan=${selectedPlanType}&duration=${selectedDuration}`);
}
```

**注意**: Customer Portalは解約・支払い方法変更専用に使用

---

### タスク5: ルーティング追加

**ファイル**: `src/App.tsx`

```typescript
<Route path="/subscription/confirm" element={<SubscriptionConfirm />} />
```

---

## 🔐 セキュリティ考慮事項

### 1. 認証・認可
- すべてのEdge FunctionでSupabase認証を必須化
- ユーザーが自分のサブスクリプションのみ変更可能

### 2. 二重決済防止
- `update-subscription`呼び出し時に冪等性キーを使用
- フロントエンドで連打防止（ボタンdisable）

### 3. 金額検証
- フロントエンドで表示した金額とバックエンドでの計算結果を照合
- 不一致の場合はエラー

### 4. Stripe Webhookの検証
- 既存の`stripe-webhook`で署名検証済み
- `customer.subscription.updated`イベントで最終確認

---

## 🧪 テストケース

### テストケース1: アップグレード（Standard 3ヶ月 → Standard 1ヶ月）
**期待動作**:
- プレビューで日割りクレジットが表示される
- Total due todayが正しく計算される
- 即座に決済・プラン変更

### テストケース2: プラン変更（Standard → Feedback）
**期待動作**:
- ダウングレードの場合、次回請求時に変更
- または即座にクレジット適用

### テストケース3: 期間変更（Feedback 1ヶ月 → Feedback 3ヶ月）
**期待動作**:
- 同じプランタイプ内での変更が可能
- 日割り計算が正しく適用

### テストケース4: エラーハンドリング
- 支払い失敗時のエラー表示
- ネットワークエラー時のリトライ
- サブスクリプション未契約時のエラー

---

## 📊 Stripe商品構成の確認

### 現在の構成
- **スタンダードプラン**（1商品）
  - Price 1: 1ヶ月 ¥4,980
  - Price 2: 3ヶ月 ¥11,940
- **グロースプラン（= フィードバック）**（1商品）
  - Price 1: 1ヶ月 ¥1,480
  - Price 2: 3ヶ月 ¥3,840

### 同じ商品内での価格変更について

**Stripe公式ドキュメント**:
> "同じ商品内の異なる価格への変更も、Subscription Update APIで可能"

つまり、**現在の構成のまま実装可能**です。

---

## ⚠️ 既知の問題と対応

### 問題1: プラン表示の不一致

**現象**:
- Customer Portal: スタンダードプラン 3ヶ月
- アカウントページ: フィードバック
- サブスクリプションページ: フリープラン

**原因**:
- データベースの`user_subscriptions`テーブルと実際のStripeデータが不一致
- Webhookが正しく処理されていない可能性

**対応**（別タスク）:
1. 現在のStripeサブスクリプション情報を取得
2. データベースと照合
3. 不一致があれば修正
4. Webhook処理の見直し

---

## 🎯 実装順序

### フェーズ1: バックエンド実装（1つずつ）
1. ✅ タスク1: `preview-subscription-change` Edge Function作成
2. ✅ タスク2: `update-subscription` Edge Function作成
3. ✅ 動作テスト（Postmanなどで）

### フェーズ2: フロントエンド実装
4. ✅ タスク3: `/subscription/confirm`ページ作成
5. ✅ タスク5: ルーティング追加
6. ✅ タスク4: `Subscription.tsx`修正

### フェーズ3: 統合テスト
7. ✅ テストケース1-4を実行
8. ✅ エラーハンドリング確認
9. ✅ UI/UX調整

### フェーズ4: データ整合性修正（並行作業）
10. ✅ プラン表示不一致の調査・修正

---

## 📝 次のステップ

**今すぐ開始**: フェーズ1 - タスク1「preview-subscription-change Edge Function作成」

実装前の最終確認:
- [ ] 仕様に不明点はないか？
- [ ] UIデザインは承認されたか？
- [ ] Stripe商品構成は確認済みか？

すべてOKであれば、1つずつ実装を開始します。
