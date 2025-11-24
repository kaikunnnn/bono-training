# タスク4・5 実装完了レポート

実装日: 2025-11-18

---

## 実装したタスク

### ✅ タスク4: 解約同期改善（1-2時間）
### ✅ タスク5: エラーリトライ処理（2-3時間）

---

## タスク4: 解約同期改善

### 目的
Stripeカスタマーポータルで解約した際に、アカウントページで即座に反映されるようにする

### 実装内容

#### 1. Webhook対応の確認 ✅

**ファイル**: `supabase/functions/stripe-webhook/index.ts`

**確認結果**:
- `customer.subscription.updated` イベントが既に実装されている（行83-84, 434-547）
- `cancel_at_period_end` の更新が正しく処理されている（行498-526）
- プランタイプと期間の判定も正しく実装済み

**処理フロー**:
1. Stripeカスタマーポータルで「キャンセル」をクリック
2. `customer.subscription.updated` イベントが発火
3. Webhookが `cancel_at_period_end: true` を検知
4. `user_subscriptions` テーブルを更新:
   - `cancel_at_period_end = true`
   - `cancel_at` = キャンセル予定日
   - `current_period_end` = 利用期限

**コード例** (行515-527):
```typescript
const { error: updateError } = await supabase
  .from("user_subscriptions")
  .update({
    plan_type: planType,
    duration: duration,
    is_active: subscription.status === "active",
    stripe_subscription_id: subscriptionId,
    cancel_at_period_end: cancelAtPeriodEnd,
    cancel_at: cancelAt,
    current_period_end: currentPeriodEnd,
    updated_at: new Date().toISOString()
  })
  .eq("user_id", userId);
```

#### 2. Realtime機能の追加 ✅

**ファイル**: `src/hooks/useSubscription.ts`

**追加した機能**:
- Supabase Realtime Subscriptionsを使用
- `user_subscriptions` テーブルの `UPDATE` イベントを監視
- DB変更時に自動的に `fetchSubscriptionStatus()` を実行

**実装コード** (行114-143):
```typescript
// Realtime Subscription: user_subscriptionsテーブルの変更を監視
useEffect(() => {
  if (!user) return;

  console.log('Realtime Subscriptionを設定:', { userId: user.id });

  const channel = supabase
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
        // DB変更時に即座に状態を更新
        fetchSubscriptionStatus();
      }
    )
    .subscribe((status) => {
      console.log('Realtime Subscription status:', status);
    });

  return () => {
    console.log('Realtime Subscriptionをクリーンアップ');
    channel.unsubscribe();
  };
}, [user]);
```

**動作フロー**:
1. ユーザーがStripeカスタマーポータルで解約
2. Webhookが `user_subscriptions` を更新
3. Realtimeが変更を検知
4. 自動的に `fetchSubscriptionStatus()` が実行
5. UIが即座に更新される

**メリット**:
- ✅ ページリロード不要
- ✅ リアルタイム更新
- ✅ UX向上

---

## タスク5: エラーリトライ処理

### 目的
ネットワークエラーや一時的なサーバーエラー時に自動的にリトライし、安定性を向上させる

### 実装内容

#### 1. リトライユーティリティの作成 ✅

**ファイル**: `src/utils/retry.ts` (新規作成)

**実装した関数**:

##### `retryWithBackoff<T>`
汎用的な指数バックオフリトライ関数

**特徴**:
- 最大リトライ回数: 3回（デフォルト）
- 初回遅延: 1秒（デフォルト）
- 指数バックオフ: 1秒 → 2秒 → 4秒 → ...
- 最大遅延: 10秒
- リトライ対象: ネットワークエラー、5xxエラー、429エラー

**コード**:
```typescript
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
      const result = await fn();

      if (attempt > 0) {
        console.log(`リトライ成功（${attempt}回目の試行で成功）`);
      }

      return result;
    } catch (error) {
      lastError = error;

      if (attempt === maxRetries) {
        console.error(`最大リトライ回数 (${maxRetries}) に達しました`);
        throw error;
      }

      if (!shouldRetry(error)) {
        console.error('リトライ対象外のエラーです');
        throw error;
      }

      const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
      const nextAttempt = attempt + 1;

      console.log(`リトライ ${nextAttempt}/${maxRetries} を ${delay}ms 後に実行します`);

      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}
```

##### `defaultShouldRetry`
リトライ対象を判定する関数

**リトライする条件**:
- ✅ ネットワークエラー（`response` なし）
- ✅ 5xxエラー（500-599）
- ✅ 429エラー（Too Many Requests）

**リトライしない条件**:
- ❌ 4xxエラー（400, 401, 403, 404など）

**コード**:
```typescript
function defaultShouldRetry(error: any): boolean {
  // ネットワークエラー（response がない場合）
  if (!error.response) {
    console.log('ネットワークエラーのためリトライします');
    return true;
  }

  const status = error.response?.status;

  // 5xx系エラー（サーバーエラー）
  if (status >= 500 && status < 600) {
    console.log(`サーバーエラー (${status}) のためリトライします`);
    return true;
  }

  // 429 Too Many Requests
  if (status === 429) {
    console.log('レート制限エラー (429) のためリトライします');
    return true;
  }

  console.log(`エラー (${status}) はリトライ対象外です`);
  return false;
}
```

##### `retrySupabaseFunction<T>`
Supabase Edge Function専用のリトライラッパー

**特徴**:
- Supabase functions.invokeのエラーハンドリングに対応
- `{ data, error }` 形式のレスポンスを処理

**コード**:
```typescript
export async function retrySupabaseFunction<T>(
  fn: () => Promise<{ data: T | null; error: any }>
): Promise<{ data: T | null; error: any }> {
  return retryWithBackoff(
    async () => {
      const result = await fn();

      // Supabase Edge Functionのエラーハンドリング
      if (result.error) {
        // エラーをthrowしてリトライ対象にする
        const error: any = new Error(result.error.message || 'Supabase function error');
        error.response = { status: result.error.status || 500 };
        throw error;
      }

      return result;
    },
    {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000
    }
  );
}
```

#### 2. stripe.tsへの適用 ✅

**ファイル**: `src/services/stripe.ts`

**適用した関数**:
1. ✅ `createCheckoutSession` (行28-38)
2. ✅ `checkSubscriptionStatus` (行87-90)
3. ✅ `getCustomerPortalUrl` (行189-196)
4. ✅ `updateSubscription` (行234-241)

**実装例** (`createCheckoutSession`):
```typescript
import { retrySupabaseFunction } from '@/utils/retry';

// リトライ付きでSupabase Edge Functionを呼び出してCheckoutセッションを作成
const { data, error } = await retrySupabaseFunction(() =>
  supabase.functions.invoke('create-checkout', {
    body: {
      returnUrl,
      planType,
      duration,
      useTestPrice: isTest || import.meta.env.MODE !== 'production'
    }
  })
);
```

**メリット**:
- ✅ 一時的なネットワークエラーを自動リトライ
- ✅ Supabaseの負荷が高い時にも対応
- ✅ ユーザーが手動でリトライする必要なし
- ✅ エラーログで何回リトライしたか確認可能

---

## デプロイ完了

### デプロイしたもの:
1. ✅ `stripe-webhook` Edge Function
   - `customer.subscription.updated` 処理を確認済み
   - デプロイ完了

### デプロイ不要（フロントエンドのみ）:
1. `src/hooks/useSubscription.ts` - Realtime機能追加
2. `src/utils/retry.ts` - 新規ファイル
3. `src/services/stripe.ts` - リトライ適用

**これらはフロントエンドコードなので、開発サーバーで即座に反映されます。**

---

## 動作確認方法

### タスク4: 解約同期改善のテスト

#### ステップ1: Realtime Subscriptionの確認
1. http://localhost:8081/account にアクセス
2. ブラウザの開発者ツールを開く
3. Consoleで以下のログを確認:
   ```
   Realtime Subscriptionを設定: {userId: "..."}
   Realtime Subscription status: SUBSCRIBED
   ```

#### ステップ2: 解約テスト
1. アカウントページで「サブスクリプション管理」をクリック
2. Stripeカスタマーポータルで「キャンセル」を実行
3. 「期間終了時にキャンセル」を選択
4. **元のタブに戻らずに待機**
5. Consoleで以下のログを確認:
   ```
   サブスクリプション更新を検知: {new: {...}, old: {...}}
   サブスクリプション取得エラー: ...（または成功ログ）
   ```
6. アカウントページがリロードなしで更新されることを確認
7. 「解約予定」のバッジが表示されることを確認

#### ステップ3: Webhookログ確認
1. https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions
2. `stripe-webhook` のログを確認
3. 以下のログがあることを確認:
   ```
   customer.subscription.updatedイベントを処理中
   プラン変更情報: {...}
   プラン変更完了: standard (1ヶ月)
   ```

### タスク5: エラーリトライのテスト

#### テスト方法1: ネットワークを切断
1. ブラウザの開発者ツール > Network タブ
2. 「Offline」に設定
3. アカウントページをリロード
4. Consoleで以下のログを確認:
   ```
   ネットワークエラーのためリトライします
   リトライ 1/3 を 1000ms 後に実行します
   リトライ 2/3 を 2000ms 後に実行します
   ...
   ```
5. ネットワークを「Online」に戻す
6. 自動的にリトライ成功することを確認

#### テスト方法2: 正常系
1. 通常どおりプラン変更を実行
2. Consoleでリトライログが**出ない**ことを確認
3. → エラーなし=リトライしない=正常動作

---

## 期待される効果

### タスク4: 解約同期改善

#### Before:
- Stripeで解約してもアカウントページに反映されない
- ページリロードが必要
- ユーザーが混乱

#### After:
- ✅ Stripeで解約すると**即座に**アカウントページが更新
- ✅ ページリロード不要
- ✅ リアルタイム更新でUX向上

### タスク5: エラーリトライ

#### Before:
- 一時的なネットワークエラーで決済失敗
- ユーザーが手動でリトライ
- エラー率が高い

#### After:
- ✅ 自動的に3回までリトライ
- ✅ 一時的なエラーを吸収
- ✅ 成功率が大幅に向上
- ✅ ユーザーの手間が減少

---

## 技術的な詳細

### Realtime Subscriptionsの仕組み

**Supabase Realtime**:
- PostgreSQLの `LISTEN/NOTIFY` を使用
- WebSocket経由でリアルタイム通知
- 行レベルの変更を検知

**実装の流れ**:
```
1. ユーザーがログイン
   ↓
2. useSubscription フックが Realtime Subscription を設定
   ↓
3. user_subscriptions テーブルを監視
   ↓
4. Webhookが user_subscriptions を UPDATE
   ↓
5. Realtime が変更を検知
   ↓
6. payload を受信
   ↓
7. fetchSubscriptionStatus() を実行
   ↓
8. UIが自動更新
```

**パフォーマンス**:
- WebSocket接続1つのみ
- 変更時のみデータ取得
- 非常に軽量

### 指数バックオフの計算

**遅延時間の計算式**:
```
delay = min(initialDelay × 2^attempt, maxDelay)
```

**実際の遅延時間**:
- 1回目のリトライ: 1秒後
- 2回目のリトライ: 2秒後
- 3回目のリトライ: 4秒後
- （最大10秒）

**合計時間**:
- 最大リトライ時間: 約7秒（1 + 2 + 4）
- ユーザー体験を損なわない範囲

---

## トラブルシューティング

### Realtimeが動作しない場合

#### 1. Realtime機能が有効か確認
```sql
-- Supabase SQL Editorで実行
SELECT * FROM pg_publication;
```

`supabase_realtime` が存在することを確認

#### 2. RLSポリシーを確認
```sql
-- user_subscriptionsテーブルのポリシーを確認
SELECT policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'user_subscriptions';
```

`SELECT` ポリシーが存在することを確認

#### 3. Consoleログを確認
```
Realtime Subscription status: SUBSCRIBED
```

`SUBSCRIBED` になっていない場合は接続失敗

### リトライが動作しない場合

#### 1. ログを確認
エラー時に以下のログが出るか確認:
```
ネットワークエラーのためリトライします
リトライ 1/3 を 1000ms 後に実行します
```

#### 2. shouldRetry 関数を確認
4xxエラーはリトライ対象外です。

#### 3. maxRetries を増やす
必要に応じて `retry.ts` の `maxRetries` を変更

---

## まとめ

### 実装完了項目
1. ✅ タスク4: 解約同期改善
   - Webhook処理確認
   - Realtime機能追加

2. ✅ タスク5: エラーリトライ処理
   - リトライユーティリティ作成
   - stripe.tsへの適用

### デプロイ完了
- ✅ `stripe-webhook` Edge Function

### 次のステップ
- テスト実施（`.claude/docs/test-checklist-double-billing.md` 参照）
- 二重課金防止テスト
- 解約同期テスト
- リトライ動作テスト

### 推定効果
- ✅ UX向上: リアルタイム更新で即座に反映
- ✅ 安定性向上: 自動リトライでエラー率減少
- ✅ ユーザー満足度向上: スムーズな決済体験

---

**これで、タスク4とタスク5の実装が完了しました！**

テストの準備が整いましたので、`.claude/docs/test-checklist-double-billing.md` に従ってテストを実施してください。
