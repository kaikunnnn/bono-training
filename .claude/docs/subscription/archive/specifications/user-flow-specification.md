# サブスクリプション ユーザーフロー仕様書

**最終更新**: 2025-11-20
**バージョン**: 1.0

---

## 📋 目次

1. [新規登録フロー](#新規登録フロー)
2. [プラン変更フロー](#プラン変更フロー)
3. [サブスクリプション確認](#サブスクリプション確認)
4. [キャンセルフロー](#キャンセルフロー)
5. [二重課金防止](#二重課金防止)
6. [エラーハンドリング](#エラーハンドリング)

---

## 新規登録フロー

### パターン1: ログイン済みユーザーの新規登録

**前提条件**: ユーザーが既にアカウントを作成してログイン済み

**フロー**:
```
1. ユーザーがアカウント作成・ログイン完了
   ↓
2. /subscription ページにアクセス
   ↓
3. プランと期間（1ヶ月 or 3ヶ月）を選択
   ↓
4. 「今すぐ始める」ボタンをクリック
   ↓
5. Stripe Checkoutページに自動遷移
   ↓
6. カード情報入力・決済完了
   ↓
7. /subscription/success ページにリダイレクト
   ↓
8. Webhookでサブスクリプション情報がDBに保存
   ↓
9. コンテンツにアクセス可能
```

**実装状態**: ✅ 実装済み

---

### パターン2: 未ログインユーザーの新規登録（推奨フロー）

**前提条件**: ユーザーがログインしていない状態でサブスクリプションページに到達

**ユーザー体験の要件**:
- プランを選択した後に認証を要求する
- 認証完了後、選択したプランの情報を保持
- スムーズにStripe Checkoutに遷移

**推奨フロー**:
```
1. 未ログインユーザーが /subscription にアクセス
   ↓
2. プランと期間（1ヶ月 or 3ヶ月）を選択
   ↓
3. 「このプランで始める」ボタンをクリック
   ↓
4. プラン情報をローカルストレージに保存
   - selectedPlan: 'standard' | 'feedback' | 'growth'
   - selectedDuration: 1 | 3
   ↓
5. /login ページにリダイレクト
   - リダイレクト先: /subscription?plan=standard&duration=1
   ↓
6. ユーザーがログイン or 新規アカウント作成
   ↓
7. 認証完了後、/subscription に自動リダイレクト
   - URLパラメータからプラン情報を取得
   ↓
8. 選択済みプラン情報を復元
   ↓
9. 自動的にStripe Checkoutに遷移
   - または、確認画面を表示して「決済に進む」ボタンを表示
   ↓
10. カード情報入力・決済完了
   ↓
11. /subscription/success にリダイレクト
   ↓
12. コンテンツにアクセス可能
```

**実装状態**: ❌ 未実装

**現在の挙動（問題）**:
```
1. 未ログインユーザーが /subscription にアクセス
   ↓
2. プランを選択
   ↓
3. 「今すぐ始める」ボタンをクリック
   ↓
4. エラー: 「認証されていません。ログインしてください。」
   ↓
5. ユーザーは何をすればいいかわからない（UX悪い）
```

---

### 実装方針（パターン2）

#### オプションA: URLパラメータで状態を保持（推奨）

**メリット**:
- シンプル
- ブラウザの戻るボタンで動作が壊れない
- ローカルストレージ不要

**実装**:
1. 未ログイン時、ボタンクリックで `/login?redirect=/subscription&plan=standard&duration=1` にリダイレクト
2. ログイン成功後、`redirect` URLにリダイレクト
3. `/subscription` ページでURLパラメータを読み取り
4. プラン情報があれば自動的にCheckoutに遷移

**コード例**:
```typescript
// Subscription.tsx
const handleSubscribe = async (selectedPlanType: PlanType) => {
  // 未ログイン時
  if (!user) {
    const redirectUrl = `/subscription?plan=${selectedPlanType}&duration=${selectedDuration}`;
    navigate(`/login?redirect=${encodeURIComponent(redirectUrl)}`);
    return;
  }

  // ログイン済み（既存の処理）
  // ...
};

// ページロード時にURLパラメータをチェック
useEffect(() => {
  const params = new URLSearchParams(location.search);
  const plan = params.get('plan');
  const duration = params.get('duration');

  if (user && plan && duration) {
    // 自動的にCheckoutに遷移
    createCheckoutSession(
      window.location.origin + '/subscription/success',
      plan as PlanType,
      Number(duration) as 1 | 3
    ).then(({ url }) => {
      if (url) window.location.href = url;
    });
  }
}, [user, location.search]);
```

---

#### オプションB: ローカルストレージで状態を保持

**メリット**:
- URLが汚れない

**デメリット**:
- ローカルストレージの管理が必要
- タブを閉じると失われる可能性

**実装**:
```typescript
// 未ログイン時
if (!user) {
  localStorage.setItem('pendingSubscription', JSON.stringify({
    plan: selectedPlanType,
    duration: selectedDuration
  }));
  navigate('/login?redirect=/subscription');
  return;
}

// ページロード時
useEffect(() => {
  if (user) {
    const pending = localStorage.getItem('pendingSubscription');
    if (pending) {
      const { plan, duration } = JSON.parse(pending);
      localStorage.removeItem('pendingSubscription');
      // Checkoutに遷移
      createCheckoutSession(...);
    }
  }
}, [user]);
```

---

## プラン変更フロー

### 要件

1. **複数プラン対応**
   - Standard プラン
   - Feedback プラン
   - Growth プラン（将来）

2. **期間変更対応**
   - 1ヶ月払い ⇔ 3ヶ月払い

3. **UI要件**
   - サブスクリプションページで希望するプランを選択
   - 「プラン変更」ボタンをクリック
   - 選択したプランの変更画面に直接遷移（ディープリンク）

### フロー

```
1. ログイン済みユーザーが /subscription にアクセス
   ↓
2. 現在のプラン: Standard 1ヶ月（例）
   ↓
3. 新しいプランを選択: Feedback 3ヶ月（例）
   ↓
4. 「プラン変更」ボタンをクリック
   ↓
5. create-customer-portal Edge Function呼び出し
   - useDeepLink: true
   - 現在のサブスクリプションIDを指定
   ↓
6. Stripe Customer Portal（プラン変更画面）に直接遷移
   ↓
7. ユーザーが新しいプランを確認・選択
   ↓
8. Stripe側で自動処理:
   - 古いサブスクリプションをキャンセル
   - 新しいサブスクリプションを作成
   - 日割り計算（差額請求 or 返金）
   ↓
9. Webhook受信（customer.subscription.updated/deleted/created）
   ↓
10. DBを更新:
   - 古いサブスク: is_active = false
   - 新しいサブスク: 新規レコード作成
   ↓
11. Realtime機能でフロントエンドに通知
   ↓
12. UIが自動更新（ページリロード不要）
```

**実装状態**: ✅ 実装済み

### 期間変更の例

**1ヶ月 → 3ヶ月の場合**:
```
現在: Standard 1ヶ月 3,480円/月
  ↓
変更: Standard 3ヶ月 2,980円/月

Stripeの処理:
- 残り日数分の返金（日割り計算）
- 3ヶ月分の新規請求（2,980円 × 3 = 8,940円）
- 差額を請求
```

**3ヶ月 → 1ヶ月の場合**:
```
現在: Standard 3ヶ月 2,980円/月
  ↓
変更: Standard 1ヶ月 3,480円/月

Stripeの処理:
- 残り日数分の返金（日割り計算）
- 1ヶ月分の新規請求（3,480円）
- 次回更新日が1ヶ月後に変更
```

---

## サブスクリプション確認

### 要件

アカウントページで以下を表示：
1. **プラン名**: Standard / Feedback / Growth
2. **期間**: 1ヶ月払い / 3ヶ月払い
3. **更新日**: 次回更新日（YYYY年MM月DD日）
4. **キャンセル状態**: 解約予定の場合、バッジと利用期限を表示

### 表示例

#### 通常時
```
┌─────────────────────────────────┐
│ サブスクリプション情報          │
├─────────────────────────────────┤
│ プラン: Standard（1ヶ月払い）   │
│ 更新日: 2025年12月20日          │
│                                 │
│ [サブスクリプションを管理]      │
└─────────────────────────────────┘
```

#### 解約予定時
```
┌─────────────────────────────────┐
│ サブスクリプション情報          │
├─────────────────────────────────┤
│ プラン: Standard（1ヶ月払い）   │
│ 🔴 解約予定                     │
│ 利用期限: 2025年12月20日        │
│                                 │
│ [サブスクリプションを管理]      │
└─────────────────────────────────┘
```

**実装状態**: ✅ 実装済み

**実装ファイル**: `src/pages/Account.tsx`

---

## キャンセルフロー

### 要件

1. **即時キャンセルではない**
   - 更新日まで利用可能
   - `cancel_at_period_end: true` を設定

2. **UI要件**
   - アカウントページに「サブスクリプションを管理」ボタン
   - クリックでStripe Customer Portalに遷移
   - キャンセル後、アカウントページに「解約予定」表示

### フロー

```
1. ユーザーが /account ページにアクセス
   ↓
2. 「サブスクリプションを管理」ボタンをクリック
   ↓
3. create-customer-portal Edge Function呼び出し
   - useDeepLink: false
   ↓
4. Stripe Customer Portalに遷移
   ↓
5. 「キャンセル」ボタンをクリック
   ↓
6. 「期間終了時にキャンセル」を選択
   ↓
7. Webhook受信（customer.subscription.updated）
   - cancel_at_period_end: true
   - cancel_at: 期間終了日
   ↓
8. DBを更新:
   - cancel_at_period_end = true
   - cancel_at = キャンセル予定日
   - is_active = true（期間中は有効）
   ↓
9. Realtime機能でフロントエンドに通知（即座）
   ↓
10. UIが自動更新（ページリロード不要）
   - 「解約予定」バッジ表示
   - 「利用期限: YYYY年MM月DD日」表示
   ↓
11. 期間終了日まで利用可能
   ↓
12. 期間終了日にStripeが自動的にサブスクを削除
   ↓
13. Webhook受信（customer.subscription.deleted）
   ↓
14. DBを更新:
   - is_active = false
   ↓
15. コンテンツアクセス不可
```

**実装状態**: ✅ 実装済み

### キャンセル後の表示（詳細）

**解約予定時**:
- ✅ 「解約予定」バッジを赤色で表示
- ✅ 「利用期限: 2025年12月20日まで利用可能」を表示
- ✅ 「サブスクリプションを管理」ボタンは表示（再開可能）

**期間終了後**:
- ✅ 「サブスクリプション未登録」を表示
- ✅ 「プランを見る」ボタンで /subscription に遷移可能

---

## 二重課金防止

### 要件

**絶対に避けるべき状態**:
- 同じユーザーに2つ以上のアクティブサブスクリプションが存在する
- 新しいプランに変更したのに、古いプランも課金され続ける

### 実装方針

#### 1. Checkout作成前にキャンセル（create-checkout）

**処理**:
1. 既存のアクティブサブスクリプションを全て取得
2. ループで全てをStripeでキャンセル（`prorate: true`）
3. DBで`is_active = false`に更新
4. **キャンセル失敗時はCheckout作成を中止**（原子性保証）

**コード**: `supabase/functions/create-checkout/index.ts`

---

#### 2. Webhook受信時に重複チェック（stripe-webhook）

**処理（checkout.session.completed）**:
1. 新規サブスクリプション作成イベント受信
2. 既存のアクティブサブスクリプションを検索
3. 既存サブスクがあれば`is_active = false`に更新
4. 新しいサブスクをupsert

**コード**: `supabase/functions/stripe-webhook/index.ts:161-197`

---

#### 3. upsertで重複を防止

**処理**:
- `stripe_subscription_id`をユニーク制約として設定
- upsertで既存レコードを更新（重複insert防止）

**SQL**:
```sql
.upsert({
  stripe_subscription_id: subscriptionId,
  // ...
}, { onConflict: 'stripe_subscription_id' })
```

---

### 日割り計算

**Stripeの機能**:
- Customer Portalでプラン変更すると自動的に日割り計算
- `prorate: true`を設定することで、残り日数分を返金/請求

**例**:
```
現在: Standard 1ヶ月 3,480円/月（10日間利用済み）
変更: Feedback 1ヶ月 1,480円/月

計算:
- Standard残り20日分を返金: 3,480円 × (20/30) = 2,320円
- Feedback 30日分を請求: 1,480円
- 差額: 1,480円 - 2,320円 = -840円（返金）
```

---

## エラーハンドリング

### 未ログイン時のエラー

**現在の問題**:
```
エラー: 「認証されていません。ログインしてください。」
→ ユーザーは何をすればいいかわからない
```

**改善後**:
```
未ログイン時は、ボタンクリックで自動的にログインページにリダイレクト
→ プラン情報を保持したまま
→ 認証後、自動的にCheckoutに遷移
```

---

### ネットワークエラー

**実装**:
- エラーリトライ処理（指数バックオフ）
- 最大3回リトライ
- ネットワークエラー・5xxエラー・429エラーに対応

**コード**: `src/utils/retry.ts`

---

### Stripe APIエラー

**処理**:
1. Edge FunctionでStripe APIエラーをキャッチ
2. エラーメッセージをフロントエンドに返す
3. ユーザーにわかりやすいメッセージを表示

**例**:
```
Stripeエラー: "カードが拒否されました"
→ フロントエンド表示: "決済に失敗しました。別のカードをお試しください。"
```

---

## バリデーション

### プラン選択のバリデーション

**チェック項目**:
1. ✅ プランタイプが有効か（'standard', 'feedback', 'growth'）
2. ✅ 期間が有効か（1 or 3）
3. ✅ Price ID環境変数が設定されているか

**エラー処理**:
```typescript
if (!priceId) {
  throw new Error(`Price ID環境変数 ${envVarName} が設定されていません`);
}
```

---

### サブスクリプション状態のバリデーション

**チェック項目**:
1. ✅ 既存サブスクリプションが複数ないか（警告ログ）
2. ✅ Stripe Customer IDが存在するか
3. ✅ サブスクリプションの顧客IDが一致するか

---

## まとめ

### 実装済み機能

| 機能 | 状態 |
|------|------|
| パターン1: ログイン済み新規登録 | ✅ 実装済み |
| パターン2: 未ログイン新規登録 | ❌ 未実装 |
| プラン変更（複数プラン対応） | ✅ 実装済み |
| 期間変更（1ヶ月⇔3ヶ月） | ✅ 実装済み |
| サブスクリプション確認 | ✅ 実装済み |
| キャンセル（期間終了時） | ✅ 実装済み |
| 解約予定表示 | ✅ 実装済み |
| 二重課金防止 | ✅ 実装済み |
| 日割り計算 | ✅ 実装済み |
| Realtime更新 | ✅ 実装済み |
| エラーリトライ | ✅ 実装済み |

### 未実装機能

1. **未ログイン時のスムーズな登録フロー**
   - プラン選択 → 認証 → 自動的にCheckout遷移
   - 推奨: URLパラメータで状態を保持

---

**最終更新日**: 2025-11-20
**ステータス**: 要件定義完了・一部未実装
