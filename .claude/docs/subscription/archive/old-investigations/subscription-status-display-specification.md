# サブスクリプション状態表示機能 - 詳細仕様書

**作成日**: 2025-11-18
**目的**: ユーザーがサブスクリプションの状態（更新日、キャンセル状態）を正しく理解できるようにする

---

## 📋 要件定義

### 要件1: 更新日の表示

**表示対象**: すべてのアクティブなサブスクリプション

**表示場所**: `/account`ページのサブスクリプション情報

**表示内容**:
```
現在のプラン: スタンダード（3ヶ月）
次回更新日: 2025年12月18日
```

**データソース**:
- Stripeの`subscription.current_period_end`
- データベース: `subscriptions.end_timestamp`

---

### 要件2: キャンセル済み状態の表示

**表示対象**: `cancel_at_period_end: true`のサブスクリプション

**表示場所**: `/account`ページのサブスクリプション情報

**表示内容**:
```
現在のプラン: スタンダード（3ヶ月）【キャンセル済み】
利用期限: 2025年12月18日まで利用可能
プランを再開する: /subscription へのリンク
```

**データソース**:
- Stripeの`subscription.cancel_at_period_end`
- Stripeの`subscription.cancel_at`
- データベース: `user_subscriptions.cancel_at_period_end`（新規カラム）
- データベース: `user_subscriptions.cancel_at`（新規カラム）

---

### 要件3: 再開リンクの表示

**表示条件**: キャンセル済みの場合のみ

**リンク先**: `/subscription`ページ

**デザイン**:
- テキストリンク（青色、下線）
- または、ボタン形式

---

## 🎯 画面デザイン仕様

### パターンA: 通常のアクティブなサブスクリプション

```
┌─────────────────────────────────────────┐
│ サブスクリプション情報                    │
├─────────────────────────────────────────┤
│ 現在のプラン: スタンダード（3ヶ月）        │
│ 次回更新日: 2025年12月18日                │
│                                         │
│ [サブスクリプションを管理]                │
│ プランの変更、お支払い方法の更新、        │
│ 解約はStripeのカスタマーポータルで行えます │
└─────────────────────────────────────────┘
```

---

### パターンB: キャンセル済みのサブスクリプション

```
┌─────────────────────────────────────────┐
│ サブスクリプション情報                    │
├─────────────────────────────────────────┤
│ 現在のプラン: スタンダード（3ヶ月）        │
│                【キャンセル済み】         │
│                                         │
│ ⚠️ 利用期限: 2025年12月18日まで利用可能   │
│                                         │
│ プランを再開する → /subscription         │
│                                         │
│ [サブスクリプションを管理]                │
│ 解約の取り消しや、お支払い方法の更新は    │
│ Stripeのカスタマーポータルで行えます      │
└─────────────────────────────────────────┘
```

**デザイン詳細**:
- 【キャンセル済み】: 赤色バッジ、またはテキスト
- ⚠️ 利用期限: 黄色の背景、目立つ表示
- プランを再開する: 青色リンク

---

### パターンC: 無料プラン（未契約）

```
┌─────────────────────────────────────────┐
│ サブスクリプション情報                    │
├─────────────────────────────────────────┤
│ 現在のプラン: 無料                        │
│                                         │
│ プレミアムプランにアップグレードして、    │
│ 全てのコンテンツにアクセスしましょう      │
│                                         │
│ [プランを見る]                           │
└─────────────────────────────────────────┘
```

---

## 🗄️ データベーススキーマ

### 必要な新規カラム

**テーブル**: `user_subscriptions`

```sql
ALTER TABLE user_subscriptions
ADD COLUMN cancel_at_period_end boolean DEFAULT false,
ADD COLUMN cancel_at timestamptz;
```

**カラム説明**:
- `cancel_at_period_end`: 期間終了時にキャンセル予定か
- `cancel_at`: キャンセルが実行される日時（期間終了日）

---

## 🔍 データフロー

### 1. 更新日（next_renewal_date）の取得

**ソース**:
- データベース: `subscriptions.end_timestamp`
- または、Webhook経由で`subscription.current_period_end`を保存

**データフロー**:
```
Stripe: subscription.current_period_end (Unix timestamp)
    ↓
Webhook: handleSubscriptionUpdated
    ↓
データベース: subscriptions.end_timestamp (ISO 8601)
    ↓
フロントエンド: useSubscriptionContext
    ↓
表示: formatDate("2025年12月18日")
```

---

### 2. キャンセル状態の取得

**ソース**:
- Webhook: `subscription.cancel_at_period_end`
- Webhook: `subscription.cancel_at`

**データフロー**:
```
Stripe Customer Portalでキャンセル
    ↓
Webhook: customer.subscription.updated
    ↓
subscription.cancel_at_period_end: true
subscription.cancel_at: Unix timestamp
    ↓
データベース: user_subscriptions
  - cancel_at_period_end: true
  - cancel_at: ISO 8601
    ↓
フロントエンド: useSubscriptionContext
    ↓
表示: 【キャンセル済み】
```

---

## 🚨 失敗しそうな点と対策

### 失敗パターン1: `cancel_at_period_end`がデータベースにない

**問題**:
- 新規カラムを追加していない
- Webhookで保存していない

**対策**:
1. マイグレーションを実行してカラム追加
2. Webhookハンドラーを修正

---

### 失敗パターン2: 日付のフォーマットがおかしい

**問題**:
```typescript
// Unix timestamp → 日本語表示
const date = 1734480000; // 2025-12-18 00:00:00
// → "1734480000" と表示されてしまう
```

**対策**:
```typescript
// 日付フォーマット関数を作成
function formatDate(timestamp: number | string): string {
  const date = typeof timestamp === 'number'
    ? new Date(timestamp * 1000) // Unix timestamp
    : new Date(timestamp); // ISO 8601

  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}
```

---

### 失敗パターン3: キャンセル済みなのに通常表示

**問題**:
- `cancel_at_period_end`を確認していない
- 条件分岐が不足

**対策**:
```typescript
// SubscriptionInfo.tsx
if (cancelAtPeriodEnd) {
  // キャンセル済み表示
} else {
  // 通常表示
}
```

---

### 失敗パターン4: 期限切れ後も「キャンセル済み」と表示

**問題**:
```typescript
// 2025年12月18日を過ぎても「キャンセル済み」と表示
// → 実際は無料プランになっているはず
```

**対策**:
```typescript
// 期限をチェック
const now = new Date();
const cancelDate = new Date(cancelAt);

if (cancelAtPeriodEnd && cancelDate > now) {
  // まだ有効期間中 → キャンセル済み表示
} else if (cancelAtPeriodEnd && cancelDate <= now) {
  // 期限切れ → 無料プラン表示
}
```

**または**: Webhookで`customer.subscription.deleted`が発火したら自動で`is_active: false`になるので、フロントエンドでは`isSubscribed`が`false`になり、無料プラン表示になる

---

### 失敗パターン5: Contextに新しいフィールドがない

**問題**:
- `useSubscription`に`cancelAtPeriodEnd`と`cancelAt`がない
- コンパイルエラー

**対策**:
1. `SubscriptionState`型に追加
2. `checkSubscriptionStatus`の戻り値に追加
3. `useSubscription`で取得・設定

---

## 📁 修正が必要なファイル

### 1. データベースマイグレーション

**ファイル**: 新規SQLファイル、またはSupabase Dashboard経由

```sql
-- user_subscriptionsテーブルにカラム追加
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS cancel_at_period_end boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS cancel_at timestamptz;
```

---

### 2. `supabase/functions/stripe-webhook/index.ts`

**修正箇所**: `handleSubscriptionUpdated`関数

**追加内容**:
```typescript
// subscription.cancel_at_period_end を取得
const cancelAtPeriodEnd = subscription.cancel_at_period_end || false;
const cancelAt = subscription.cancel_at
  ? new Date(subscription.cancel_at * 1000).toISOString()
  : null;

// user_subscriptionsを更新
const { error: updateError } = await supabase
  .from("user_subscriptions")
  .update({
    plan_type: planType,
    duration: duration,
    is_active: subscription.status === "active",
    stripe_subscription_id: subscriptionId,
    cancel_at_period_end: cancelAtPeriodEnd,
    cancel_at: cancelAt,
    updated_at: new Date().toISOString()
  })
  .eq("user_id", userId);
```

---

### 3. `src/services/stripe.ts`

**修正箇所**: `checkSubscriptionStatus`の戻り値型

**追加内容**:
```typescript
export const checkSubscriptionStatus = async (): Promise<{
  isSubscribed: boolean;
  subscribed: boolean;
  planType: PlanType | null;
  duration: number | null;
  cancelAtPeriodEnd: boolean; // 追加
  cancelAt: string | null; // 追加
  renewalDate: string | null; // 追加（次回更新日）
  hasMemberAccess: boolean;
  hasLearningAccess: boolean;
  error: Error | null;
}> => {
  // ...
}
```

**データベースクエリ修正**:
```typescript
const { data: subscription, error: dbError } = await supabase
  .from('user_subscriptions')
  .select('plan_type, duration, is_active, cancel_at_period_end, cancel_at')
  .eq('user_id', session.user.id)
  .single();

// 次回更新日を取得
const { data: renewalData } = await supabase
  .from('subscriptions')
  .select('end_timestamp')
  .eq('user_id', session.user.id)
  .single();

return {
  // ...
  cancelAtPeriodEnd: subscription?.cancel_at_period_end || false,
  cancelAt: subscription?.cancel_at || null,
  renewalDate: renewalData?.end_timestamp || null,
};
```

---

### 4. `src/hooks/useSubscription.ts`

**修正箇所**: `SubscriptionState`型と状態管理

**追加内容**:
```typescript
export interface SubscriptionState {
  isSubscribed: boolean;
  planType: PlanType | null;
  duration: number | null;
  cancelAtPeriodEnd: boolean; // 追加
  cancelAt: string | null; // 追加
  renewalDate: string | null; // 追加
  loading: boolean;
  error: Error | null;
  refresh: () => Promise<void>;
  hasMemberAccess: boolean;
  hasLearningAccess: boolean;
  canAccessContent: (isPremium: boolean) => boolean;
}

// state管理
const [cancelAtPeriodEnd, setCancelAtPeriodEnd] = useState(false);
const [cancelAt, setCancelAt] = useState<string | null>(null);
const [renewalDate, setRenewalDate] = useState<string | null>(null);

// APIレスポンスから取得
const cancelPending = response.cancelAtPeriodEnd ?? false;
const cancelDate = response.cancelAt ?? null;
const renewal = response.renewalDate ?? null;

setCancelAtPeriodEnd(cancelPending);
setCancelAt(cancelDate);
setRenewalDate(renewal);

// returnで公開
return {
  // ...
  cancelAtPeriodEnd,
  cancelAt,
  renewalDate,
};
```

---

### 5. `src/utils/dateFormat.ts` （新規作成）

**目的**: 日付フォーマット関数

**内容**:
```typescript
/**
 * 日付を日本語フォーマットで表示
 * @param date - ISO 8601文字列、Unix timestamp、またはDateオブジェクト
 * @returns "2025年12月18日" 形式の文字列
 */
export function formatDate(date: string | number | Date | null): string {
  if (!date) return '';

  let dateObj: Date;

  if (typeof date === 'number') {
    // Unix timestamp (秒)
    dateObj = new Date(date * 1000);
  } else if (typeof date === 'string') {
    // ISO 8601文字列
    dateObj = new Date(date);
  } else {
    // Dateオブジェクト
    dateObj = date;
  }

  return dateObj.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * 日付を「○月○日」形式で表示（簡潔版）
 */
export function formatDateShort(date: string | number | Date | null): string {
  if (!date) return '';

  let dateObj: Date;

  if (typeof date === 'number') {
    dateObj = new Date(date * 1000);
  } else if (typeof date === 'string') {
    dateObj = new Date(date);
  } else {
    dateObj = date;
  }

  return dateObj.toLocaleDateString('ja-JP', {
    month: 'long',
    day: 'numeric'
  });
}
```

---

### 6. `src/components/account/SubscriptionInfo.tsx`

**修正箇所**: 表示ロジック全体

**追加内容**:

#### A. import追加
```typescript
import { formatDate } from '@/utils/dateFormat';
```

#### B. propsに追加
```typescript
interface SubscriptionInfoProps {
  planType: PlanType | null;
  duration: number | null;
  cancelAtPeriodEnd: boolean; // 追加
  cancelAt: string | null; // 追加
  renewalDate: string | null; // 追加
  isSubscribed: boolean;
}
```

#### C. 表示ロジック

```typescript
export default function SubscriptionInfo({
  planType,
  duration,
  cancelAtPeriodEnd,
  cancelAt,
  renewalDate,
  isSubscribed
}: SubscriptionInfoProps) {
  // ...

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="font-noto-sans-jp font-bold text-xl text-gray-800 mb-4">
        サブスクリプション情報
      </h2>

      <div className="space-y-3 mb-6">
        {/* プラン名 */}
        <div>
          <span className="font-noto-sans-jp text-sm text-gray-600">現在のプラン:</span>
          <span className="ml-2 font-noto-sans-jp font-medium text-base text-gray-800">
            {isSubscribed ? formatPlanDisplay(planType, duration) : '無料'}
          </span>

          {/* キャンセル済みバッジ */}
          {cancelAtPeriodEnd && (
            <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
              キャンセル済み
            </span>
          )}
        </div>

        {/* 次回更新日 or 利用期限 */}
        {isSubscribed && renewalDate && (
          <div>
            {cancelAtPeriodEnd ? (
              // キャンセル済み: 利用期限を表示
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                <p className="font-noto-sans-jp text-sm text-yellow-800">
                  ⚠️ <strong>{formatDate(cancelAt || renewalDate)}</strong>まで利用可能
                </p>
              </div>
            ) : (
              // 通常: 次回更新日を表示
              <>
                <span className="font-noto-sans-jp text-sm text-gray-600">次回更新日:</span>
                <span className="ml-2 font-noto-sans-jp font-medium text-base text-gray-800">
                  {formatDate(renewalDate)}
                </span>
              </>
            )}
          </div>
        )}

        {/* プラン再開リンク（キャンセル済みの場合のみ） */}
        {cancelAtPeriodEnd && (
          <div className="mt-3">
            <a
              href="/subscription"
              className="font-noto-sans-jp text-sm text-blue-600 hover:text-blue-800 hover:underline"
            >
              プランを再開する →
            </a>
          </div>
        )}
      </div>

      {/* エラー表示 */}
      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="font-noto-sans-jp text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* サブスクリプション管理ボタン */}
      {planType && isSubscribed && (
        <div>
          <button
            onClick={handleManageSubscription}
            disabled={loading}
            className="inline-flex items-center bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {/* ... ローディング状態 ... */}
            {loading ? (
              <span className="font-noto-sans-jp text-sm">読み込み中...</span>
            ) : (
              <span className="font-noto-sans-jp text-sm">サブスクリプションを管理</span>
            )}
          </button>
          <p className="font-noto-sans-jp text-xs text-gray-500 mt-3">
            {cancelAtPeriodEnd
              ? '解約の取り消しや、お支払い方法の更新はStripeのカスタマーポータルで行えます'
              : 'プランの変更、お支払い方法の更新、解約はStripeのカスタマーポータルで行えます'
            }
          </p>
        </div>
      )}

      {/* 無料プランの場合 */}
      {(!planType || !isSubscribed) && (
        <div className="border-t border-gray-200 pt-4">
          <p className="font-noto-sans-jp text-sm text-gray-600 mb-4">
            プレミアムプランにアップグレードして、全てのコンテンツにアクセスしましょう
          </p>
          <a
            href="/subscription"
            className="inline-flex items-center bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
          >
            <span className="font-noto-sans-jp text-sm">プランを見る</span>
          </a>
        </div>
      )}
    </div>
  );
}
```

---

### 7. `src/pages/Account.tsx`

**修正箇所**: `SubscriptionInfo`に追加propsを渡す

**修正内容**:
```typescript
const {
  planType,
  duration,
  cancelAtPeriodEnd,
  cancelAt,
  renewalDate,
  isSubscribed,
  loading
} = useSubscriptionContext();

// ...

<SubscriptionInfo
  planType={planType}
  duration={duration}
  cancelAtPeriodEnd={cancelAtPeriodEnd}
  cancelAt={cancelAt}
  renewalDate={renewalDate}
  isSubscribed={isSubscribed}
/>
```

---

## 📝 実装ステップ

### ステップ1: データベースマイグレーション（5分）

1. Supabase Dashboardでカラム追加
2. または、マイグレーションSQLを実行

---

### ステップ2: Webhook修正（10分）

1. `handleSubscriptionUpdated`に`cancel_at_period_end`と`cancel_at`を追加
2. データベース更新処理に含める
3. デプロイ

---

### ステップ3: 日付フォーマット関数作成（5分）

1. `src/utils/dateFormat.ts`を作成
2. `formatDate`関数を実装

---

### ステップ4: API修正（10分）

1. `checkSubscriptionStatus`の戻り値型に追加
2. データベースクエリに`cancel_at_period_end`, `cancel_at`, `end_timestamp`を追加
3. 返却オブジェクトに含める

---

### ステップ5: useSubscription修正（10分）

1. `SubscriptionState`型に追加
2. state管理を追加
3. APIレスポンスから取得
4. returnで公開

---

### ステップ6: SubscriptionInfo修正（15分）

1. propsに追加
2. キャンセル済みバッジ表示
3. 更新日/利用期限表示
4. プラン再開リンク表示

---

### ステップ7: Account.tsx修正（5分）

1. Contextから新しいフィールドを取得
2. `SubscriptionInfo`に渡す

---

### ステップ8: テスト（10分）

1. 通常のサブスクリプション表示確認
2. キャンセル後の表示確認
3. 日付が正しく表示されるか確認

---

## ✅ 完了チェックリスト

### データベース
- [ ] `user_subscriptions`に`cancel_at_period_end`カラム追加
- [ ] `user_subscriptions`に`cancel_at`カラム追加

### バックエンド
- [ ] Webhookで`cancel_at_period_end`を保存
- [ ] Webhookで`cancel_at`を保存
- [ ] `checkSubscriptionStatus`が新しいフィールドを返す

### フロントエンド
- [ ] `dateFormat.ts`を作成
- [ ] `SubscriptionState`に新しいフィールド追加
- [ ] `useSubscription`で新しいフィールドを管理
- [ ] `SubscriptionInfo`で更新日を表示
- [ ] `SubscriptionInfo`でキャンセル済みバッジ表示
- [ ] `SubscriptionInfo`で利用期限を表示
- [ ] `SubscriptionInfo`でプラン再開リンク表示

### テスト
- [ ] 通常のサブスクリプション: 更新日が表示される
- [ ] キャンセル済み: バッジと利用期限が表示される
- [ ] キャンセル済み: プラン再開リンクが表示される
- [ ] 日付が正しいフォーマット（"2025年12月18日"）で表示される

---

## 📊 見積もり

| ステップ | 所要時間 |
|---------|---------|
| ステップ1: データベース | 5分 |
| ステップ2: Webhook修正 | 10分 |
| ステップ3: dateFormat作成 | 5分 |
| ステップ4: API修正 | 10分 |
| ステップ5: useSubscription修正 | 10分 |
| ステップ6: SubscriptionInfo修正 | 15分 |
| ステップ7: Account修正 | 5分 |
| ステップ8: テスト | 10分 |
| **合計** | **70分** |

---

## 🚀 次のアクション

### 今すぐ実施

1. データベースにカラム追加
2. Webhookハンドラー修正
3. フロントエンド実装
4. テスト

---

**作成者**: Claude Code
**作成日**: 2025-11-18
