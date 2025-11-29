# 残タスクと優先順位（二重課金対応後）

最終更新: 2025-11-18

---

## ✅ 完了したタスク

### P0-Critical（全て完了）
1. ✅ **タスク1: 二重課金問題の修正**
   - 複数サブスクリプション対応
   - Webhook重複チェック追加
   - upsert変更

2. ✅ **タスク2: cancel_url設定の修正**
   - `new URL(returnUrl).origin` を使用
   - 正しいURLパースに変更済み

3. ✅ **タスク3: 期間変更機能**
   - `Subscription.tsx` の `isCurrentPlan` ロジックが既に正しく実装済み
   - プランタイプと期間の両方をチェック

---

## 🔄 テスト待ちのタスク

以下のタスクは実装完了済みですが、実際のテストが必要です：

### テスト1: プラン変更
- [ ] feedback → standard へのプラン変更
- [ ] Stripe Dashboardで二重課金なし確認
- [ ] DBで is_active=true が1つだけ確認

### テスト2: 期間変更
- [ ] 1ヶ月 → 3ヶ月への期間変更
- [ ] 料金が正しく変更されているか確認

### テスト3: キャンセルURL
- [ ] Checkout画面でキャンセルボタンをクリック
- [ ] `/subscription` ページに正しく戻るか確認

**テストドキュメント**: `.claude/docs/test-checklist-double-billing.md`

---

## 📋 先に開発できるタスク

### 🟡 優先度: 中（テスト前に開発可能）

#### タスク4: 解約同期遅延の調査・改善

**現状の問題**:
- Stripeカスタマーポータルで解約しても、アカウントページで即時反映されない可能性

**開発内容**:
1. **Webhook処理の確認**
   - `customer.subscription.updated` イベント処理の追加
   - `cancel_at_period_end` の即座反映

2. **リアルタイム更新機能の追加**
   - Supabase Realtime Subscriptionsを使用
   - DB変更時にUIを自動更新

**所要時間**: 1-2時間

**実装ファイル**:
- `supabase/functions/stripe-webhook/index.ts`
- `src/hooks/useSubscription.ts`

---

#### タスク5: エラーリトライ処理

**現状の問題**:
- ネットワークエラー時に自動リトライなし
- 一時的なエラーでも失敗扱い

**開発内容**:
1. **リトライユーティリティ関数の作成**
   ```typescript
   // src/utils/retry.ts
   async function retryWithBackoff<T>(
     fn: () => Promise<T>,
     maxRetries = 3,
     delay = 1000
   ): Promise<T>
   ```

2. **stripe.tsの各関数に適用**
   - `createCheckoutSession`
   - `checkSubscriptionStatus`
   - `getCustomerPortalUrl`

**所要時間**: 2-3時間

**実装ファイル**:
- `src/utils/retry.ts` (新規)
- `src/services/stripe.ts`

---

### 🔵 優先度: 低（余裕があれば）

#### タスク6: RLSセキュリティ強化

**現状の問題**:
- RLS（Row Level Security）設定が未確認
- 他ユーザーのデータにアクセスできる可能性

**開発内容**:
1. **現在のRLS設定を確認**
   ```sql
   SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
   FROM pg_policies
   WHERE schemaname = 'public'
   AND tablename IN ('stripe_customers', 'user_subscriptions', 'subscriptions');
   ```

2. **不足しているポリシーを追加**
   - `stripe_customers`: ユーザーは自分のデータのみ参照
   - `user_subscriptions`: ユーザーは自分のデータのみ参照
   - `subscriptions`: ユーザーは自分の履歴のみ参照

**所要時間**: 1-2時間

**実装ファイル**:
- Supabase SQL Editor（マイグレーション）

---

#### タスク7: DB制約追加

**現状の問題**:
- `user_subscriptions.user_id` に一意制約がない可能性
- `upsert` が正しく機能しない可能性

**開発内容**:
```sql
-- 既存の重複データをクリーンアップ
DELETE FROM user_subscriptions
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id) id
  FROM user_subscriptions
  ORDER BY user_id, updated_at DESC NULLS LAST
);

-- 一意制約を追加
ALTER TABLE user_subscriptions
ADD CONSTRAINT user_subscriptions_user_id_key UNIQUE (user_id);
```

**所要時間**: 30分

**実装ファイル**:
- Supabase SQL Editor（マイグレーション）

---

## 🎯 推奨する実施計画

### Phase 1: テスト実施（所要時間: 30分）
1. `.claude/docs/test-checklist-double-billing.md` に従ってテスト
2. 問題がなければPhase 2へ

### Phase 2: 中優先度タスク（所要時間: 3-5時間）
1. **タスク4: 解約同期改善**（1-2時間）
   - リアルタイム更新機能を追加
   - UX向上

2. **タスク5: エラーリトライ**（2-3時間）
   - 安定性向上
   - ネットワークエラー対策

**この段階でまとめてテスト可能**

### Phase 3: 低優先度タスク（所要時間: 2-3時間）
1. **タスク7: DB制約追加**（30分）
   - データ整合性保証

2. **タスク6: RLSセキュリティ強化**（1-2時間）
   - セキュリティ向上

---

## 📊 タスク一覧表

| タスク | 優先度 | 状態 | 所要時間 | 実装前テスト可能 |
|--------|--------|------|----------|------------------|
| タスク1: 二重課金 | 🔴 P0 | ✅ 完了 | - | - |
| タスク2: cancel_url | 🔴 P0 | ✅ 完了 | - | - |
| タスク3: 期間変更 | 🔴 P0 | ✅ 完了 | - | - |
| **テスト実施** | 🔴 **必須** | ⏳ **待ち** | **30分** | - |
| タスク4: 解約同期 | 🟡 中 | 未着手 | 1-2時間 | ✅ 可能 |
| タスク5: リトライ | 🟡 中 | 未着手 | 2-3時間 | ✅ 可能 |
| タスク6: RLS | 🔵 低 | 未着手 | 1-2時間 | ✅ 可能 |
| タスク7: DB制約 | 🔵 低 | 未着手 | 30分 | ✅ 可能 |

---

## 🚀 次のアクション

### すぐにできること（テスト前）

#### オプション1: Phase 2のタスクを先に開発
- タスク4（解約同期）とタスク5（リトライ）を実装
- まとめてテスト実施
- **推奨**: テストを1回で済ませられる

#### オプション2: Phase 3のタスクを先に開発
- タスク7（DB制約）は影響範囲が小さい
- タスク6（RLS）も独立して実装可能
- **メリット**: 短時間で完了

#### オプション3: まずテスト実施
- 現在の実装を先にテスト
- 問題がないことを確認してから次の開発
- **最も安全**: リスク最小

---

## 📝 実装の詳細ドキュメント

### タスク4: 解約同期改善の実装案

**ファイル**: `src/hooks/useSubscription.ts`

```typescript
useEffect(() => {
  if (!user) return;

  // Realtime Subscriptionを設定
  const subscription = supabase
    .channel('user_subscriptions_changes')
    .on('postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'user_subscriptions',
        filter: `user_id=eq.${user.id}`
      },
      (payload) => {
        console.log('サブスクリプション更新を検知:', payload);
        // 即座に状態を更新
        fetchSubscriptionStatus();
      }
    )
    .subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [user]);
```

**ファイル**: `supabase/functions/stripe-webhook/index.ts`

`customer.subscription.updated` イベントに対応:

```typescript
case "customer.subscription.updated":
  await handleSubscriptionUpdated(stripe, supabase, event.data.object);
  break;

async function handleSubscriptionUpdated(stripe: Stripe, supabase: any, subscription: any) {
  console.log("customer.subscription.updatedイベントを処理中");

  const subscriptionId = subscription.id;
  const userId = subscription.metadata?.user_id;

  if (!userId) {
    console.error("ユーザーIDが見つかりません");
    return;
  }

  // cancel_at_period_end が true の場合、即座にDBを更新
  if (subscription.cancel_at_period_end) {
    const { error } = await supabase
      .from("user_subscriptions")
      .update({
        cancel_at_period_end: true,
        cancel_at: subscription.cancel_at ? new Date(subscription.cancel_at * 1000).toISOString() : null,
        updated_at: new Date().toISOString()
      })
      .eq("stripe_subscription_id", subscriptionId);

    if (error) {
      console.error("サブスクリプション更新エラー:", error);
    } else {
      console.log("サブスクリプション解約予定を更新しました");
    }
  }
}
```

---

### タスク5: エラーリトライの実装案

**ファイル**: `src/utils/retry.ts` (新規)

```typescript
export interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  shouldRetry?: (error: any) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    shouldRetry = defaultShouldRetry
  } = options;

  let lastError: any;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      console.log(`リトライ ${attempt + 1}/${maxRetries} (${delay}ms後)`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

function defaultShouldRetry(error: any): boolean {
  // ネットワークエラーまたは5xxエラーの場合のみリトライ
  if (!error.response) {
    // ネットワークエラー
    return true;
  }

  const status = error.response.status;
  // 5xx系エラー、または429 (Too Many Requests)
  return (status >= 500 && status < 600) || status === 429;
}
```

**ファイル**: `src/services/stripe.ts`

```typescript
import { retryWithBackoff } from '@/utils/retry';

export const createCheckoutSession = async (
  returnUrl: string,
  planType: PlanType = 'community',
  duration: 1 | 3 = 1,
  isTest?: boolean
): Promise<{ url: string | null; error: Error | null }> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      throw new Error('認証されていません。ログインしてください。');
    }

    console.log(`Checkout開始: プラン=${planType}, 期間=${duration}ヶ月`);

    // リトライ付きで実行
    const { data, error } = await retryWithBackoff(
      () => supabase.functions.invoke('create-checkout', {
        body: {
          returnUrl,
          planType,
          duration,
          useTestPrice: isTest || import.meta.env.MODE !== 'production'
        }
      }),
      {
        maxRetries: 3,
        initialDelay: 1000
      }
    );

    if (error) {
      console.error('Checkoutセッション作成エラー:', error);
      throw new Error('決済処理の準備に失敗しました。');
    }

    console.log('Checkoutセッション作成成功:', data.url);

    return { url: data.url, error: null };
  } catch (error) {
    console.error('Stripe決済エラー:', error);
    return { url: null, error: error as Error };
  }
};
```

---

## まとめ

### 現在の状態
✅ **P0-Critical タスクは全て完了**
⏳ **テスト実施待ち**

### 推奨する次のステップ

**パターンA: 安全第一**
1. まずテスト実施（30分）
2. 問題なければPhase 2開発（3-5時間）
3. まとめてテスト

**パターンB: 効率重視（推奨）**
1. Phase 2開発（3-5時間）
2. まとめてテスト実施（30分）
3. 問題なければPhase 3開発

**パターンC: 段階的**
1. タスク7（DB制約）を先に実装（30分）
2. テスト実施（30分）
3. 問題なければPhase 2開発

### どのパターンで進めますか？

個人的には**パターンB（効率重視）**を推奨します。理由：
- Phase 2のタスク（解約同期、リトライ）は二重課金とは独立
- まとめてテストすることで効率的
- タスク4の解約同期はUX向上で価値が高い
