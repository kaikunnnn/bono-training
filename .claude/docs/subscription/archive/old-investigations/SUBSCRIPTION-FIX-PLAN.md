# サブスクリプション機能 修正実装計画

**作成日**: 2025-11-16
**最終更新**: 2025-11-16
**目的**: サブスクリプション機能の問題を1つずつ確実に修正する
**ドキュメントの役割**: 具体的な実装手順とコード例

> **📌 このドキュメントを使う前に**
> まだ現状を把握していない場合は、先に `subscription-implementation-summary.md` を読んで全体像を理解してください。

---

## 📚 関連ドキュメント

### 現状把握用
- **[subscription-implementation-summary.md](./subscription-implementation-summary.md)** - **実装状況と問題点の全体像**
  - 何が完了していて、何が壊れているか
  - ファイル構成と完了率
  - 次のアクションアイテム

### このドキュメントとの使い分け
| ドキュメント | 役割 | いつ使う |
|------------|------|---------|
| `subscription-implementation-summary.md` | 現状把握 | 最初に全体を理解したい時 |
| `subscription-fix-plan.md`（このファイル） | 実装手順 | 今すぐコードを修正したい時 |

---

## 🎯 修正の全体方針

1. **段階的アプローチ**: 1つずつ修正→テスト→次へ進む
2. **優先順位**: 致命的なバグから順に対応
3. **確認方法**: 各ステップで動作確認を行う
4. **ロールバック**: 問題が起きたらすぐに戻せるようにコミット単位を小さく

---

## 📋 フェーズ1: 緊急バグ修正（優先度：最高）

### ステップ1: データベースのdurationカラム存在確認
**所要時間**: 5分
**目的**: マイグレーションが正しく実行されているか確認

#### 実施内容
1. Supabase Dashboardにログイン
2. SQL Editorで以下のクエリを実行:
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;
```

#### 期待される結果
- `duration`カラムが存在する
- データタイプが`integer`
- デフォルト値が設定されている

#### 結果が異なる場合のアクション
- マイグレーションファイルを探して実行
- または手動でカラムを追加:
```sql
ALTER TABLE user_subscriptions
ADD COLUMN duration INTEGER DEFAULT 1;
```

#### 完了条件
- [ ] `duration`カラムが存在することを確認
- [ ] 既存データに`duration = 1`が設定されていることを確認

---

### ステップ2: 二重課金の原因調査
**所要時間**: 30分
**目的**: Webhookログを確認して二重課金の原因を特定

#### 実施内容
1. **Stripe Dashboardで確認**
   - https://dashboard.stripe.com/test/subscriptions にアクセス
   - `takumi.kai.skywalker@gmail.com`のサブスクリプションを検索
   - アクティブなサブスクリプションが2つあるか確認
   - 各サブスクリプションIDをメモ

2. **Supabase Edge Function ログ確認**
   - Supabase Dashboard → Edge Functions → `stripe-webhook`
   - ログを確認して`checkout.session.completed`イベントを探す
   - `replace_subscription_id`が処理されているか確認

3. **データベース確認**
```sql
SELECT
  user_id,
  stripe_subscription_id,
  plan_type,
  duration,
  is_active,
  created_at,
  updated_at
FROM user_subscriptions
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'takumi.kai.skywalker@gmail.com'
)
ORDER BY created_at DESC;
```

#### 調査ポイント
- [ ] Webhookで`replace_subscription_id`メタデータが受信されているか
- [ ] 古いサブスクリプションのキャンセル処理が実行されているか
- [ ] エラーログが出力されているか

#### 結果の記録
調査結果を`subscription-fix-plan.md`に記録:
```
【調査結果】
- 二重課金の状態: [はい/いいえ]
- Webhook処理の状態: [正常/エラー]
- 原因: [記載]
```

#### 次のアクション
- 原因が判明したら、ステップ3で修正

---

### ステップ3: 期間変更ができない問題の修正
**所要時間**: 30分
**目的**: 同じプラン内で1ヶ月↔3ヶ月の変更を可能にする

#### 3-1. SubscriptionContext にduration情報を追加

**ファイル**: `src/hooks/useSubscription.ts`

**修正内容**:
```typescript
// 修正前
export interface SubscriptionState {
  isSubscribed: boolean;
  planType: PlanType | null;
  loading: boolean;
  error: Error | null;
  hasLearningAccess: boolean;
  hasMemberAccess: boolean;
}

// 修正後
export interface SubscriptionState {
  isSubscribed: boolean;
  planType: PlanType | null;
  duration: number | null;  // 追加
  loading: boolean;
  error: Error | null;
  hasLearningAccess: boolean;
  hasMemberAccess: boolean;
}
```

**修正箇所**:
- `useSubscription.ts`のクエリに`duration`を追加
- 返り値に`duration`を含める

#### 3-2. Subscription.tsx のisCurrentPlan判定を修正

**ファイル**: `src/pages/Subscription.tsx`

**修正内容**:
```typescript
// 修正前（129行目）
const isCurrentPlan = isSubscribed && planType === plan.id;

// 修正後
const { isSubscribed, planType, duration: currentDuration } = useSubscriptionContext();
const isCurrentPlan = isSubscribed && planType === plan.id && currentDuration === selectedDuration;
```

#### テスト方法
1. 既存契約者でログイン（takumi.kai.skywalker@gmail.com）
2. `/subscription`ページにアクセス
3. 現在のプラン（例: フィードバック 1ヶ月）が「現在のプラン」と表示されることを確認
4. 期間タブを「3ヶ月」に変更
5. 同じプランのボタンが「プラン変更」になることを確認
6. ボタンがクリック可能になることを確認

#### 完了条件
- [ ] `useSubscription.ts`に`duration`を追加
- [ ] `Subscription.tsx`の判定を修正
- [ ] テストで期間変更ボタンがクリック可能になることを確認

---

### ステップ4: /subscription/success ページの作成
**所要時間**: 45分
**目的**: チェックアウト完了後のページを作成し、データをリフレッシュ

#### 実施内容

**ファイル**: `src/pages/SubscriptionSuccess.tsx` （新規作成）

**実装内容**:
```typescript
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useSubscriptionContext } from '@/contexts/SubscriptionContext';
import { CheckCircle2, Loader2 } from 'lucide-react';

export default function SubscriptionSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [verifying, setVerifying] = useState(true);
  const { refetch } = useSubscriptionContext(); // refetch機能を追加が必要

  useEffect(() => {
    const sessionId = searchParams.get('session_id');

    const verifyAndRefresh = async () => {
      // 2秒待ってからSubscription情報をリフレッシュ
      // （Webhookが処理される時間を確保）
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (refetch) {
        await refetch();
      }

      setVerifying(false);
    };

    verifyAndRefresh();
  }, [searchParams, refetch]);

  if (verifying) {
    return (
      <Layout>
        <div className="container max-w-2xl mx-auto py-16 text-center">
          <Loader2 className="w-16 h-16 mx-auto mb-6 animate-spin text-blue-600" />
          <h1 className="text-2xl font-bold mb-4">決済を確認しています...</h1>
          <p className="text-gray-600">少々お待ちください</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-2xl mx-auto py-16 text-center">
        <CheckCircle2 className="w-16 h-16 mx-auto mb-6 text-green-600" />
        <h1 className="text-3xl font-bold mb-4">ありがとうございます！</h1>
        <p className="text-gray-600 mb-8">
          サブスクリプションの登録が完了しました。<br />
          すべてのプレミアムコンテンツをお楽しみいただけます。
        </p>

        <div className="space-y-4">
          <button
            onClick={() => navigate('/lessons')}
            className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            レッスンを見る
          </button>
          <button
            onClick={() => navigate('/account')}
            className="w-full sm:w-auto px-8 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition ml-0 sm:ml-4"
          >
            アカウント情報を確認
          </button>
        </div>
      </div>
    </Layout>
  );
}
```

#### useSubscription.tsにrefetch機能を追加

**修正箇所**: `src/hooks/useSubscription.ts`

```typescript
// React Queryを使用している場合
export const useSubscription = () => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['subscription'],
    queryFn: fetchSubscription,
  });

  return {
    isSubscribed: data?.isSubscribed || false,
    planType: data?.planType || null,
    duration: data?.duration || null,
    loading: isLoading,
    error,
    refetch, // refetch関数を返す
    // ...その他のプロパティ
  };
};
```

#### ルーティング追加

**ファイル**: `src/App.tsx` または `src/routes.tsx`

```typescript
import SubscriptionSuccess from '@/pages/SubscriptionSuccess';

// ルート定義に追加
{
  path: '/subscription/success',
  element: <SubscriptionSuccess />
}
```

#### テスト方法
1. テスト用新規アカウントでログイン
2. `/subscription`ページでプランを選択
3. Stripeチェックアウトでテストカード決済
4. `/subscription/success`にリダイレクトされることを確認
5. 「決済を確認しています...」→「ありがとうございます！」の流れを確認
6. 「アカウント情報を確認」ボタンで`/account`に遷移
7. 正しいプラン情報が表示されることを確認

#### 完了条件
- [ ] `SubscriptionSuccess.tsx`を作成
- [ ] ルーティングを追加
- [ ] `useSubscription`に`refetch`機能を追加
- [ ] テストで正常にリダイレクトされることを確認

---

### ステップ5: チェックアウトのcancel_url修正
**所要時間**: 15分
**目的**: チェックアウトで「戻る」を押したときに404にならないようにする

#### 実施内容

**ファイル**: `supabase/functions/create-checkout/index.ts`

**修正箇所を探す**:
```typescript
// 現在のコード（推測）
const session = await stripe.checkout.sessions.create({
  // ...
  success_url: returnUrl, // /subscription/success
  cancel_url: returnUrl,  // ❌ これも/subscription/successになっている
  // ...
});
```

**修正後**:
```typescript
const session = await stripe.checkout.sessions.create({
  // ...
  success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: returnUrl.replace('/success', ''), // /subscriptionに戻る
  // ...
});
```

#### デプロイ
```bash
cd /Users/kaitakumi/Documents/bono-training
npx supabase functions deploy create-checkout
```

#### テスト方法
1. `/subscription`ページでプランを選択
2. Stripeチェックアウトページに遷移
3. 左上の「← 戻る」ボタンをクリック
4. `/subscription`ページに戻ることを確認（404にならない）

#### 完了条件
- [ ] `create-checkout/index.ts`を修正
- [ ] Edge Functionをデプロイ
- [ ] テストで正常に戻れることを確認

---

### ステップ6: テストアカウントのクリーンアップ
**所要時間**: 10分
**目的**: 古いテストデータを削除

#### 実施内容

1. **Supabaseで確認**
```sql
-- kyasya00@gmail.comのユーザーIDを確認
SELECT id, email FROM auth.users WHERE email = 'kyasya00@gmail.com';

-- サブスクリプション情報を確認
SELECT * FROM user_subscriptions WHERE user_id = '[上記のID]';
SELECT * FROM stripe_customers WHERE user_id = '[上記のID]';
```

2. **Stripeで確認**
- https://dashboard.stripe.com/test/customers
- kyasya00@gmail.comで検索
- 顧客データが存在するか確認

3. **データ削除（必要な場合）**
```sql
-- user_subscriptionsから削除
DELETE FROM user_subscriptions WHERE user_id = '[ユーザーID]';

-- stripe_customersから削除
DELETE FROM stripe_customers WHERE user_id = '[ユーザーID]';
```

4. **Stripeでも削除（オプション）**
- 顧客ページで「削除」をクリック

#### 完了条件
- [ ] kyasya00@gmail.comのデータを確認
- [ ] 必要に応じてデータを削除
- [ ] 削除後、カスタマーポータルのエラーが解消されることを確認

---

## 📋 フェーズ2: 二重課金の根本修正（優先度：高）

### 前提条件
- ステップ2の調査が完了していること
- 二重課金の原因が特定されていること

### オプションA: Webhookの修正（既存のCheckoutフローを維持）

**実施内容**:

#### A-1. stripe-webhook/index.tsの修正

**ファイル**: `supabase/functions/stripe-webhook/index.ts`

**確認箇所**:
```typescript
// handleCheckoutCompleted関数を探す
const handleCheckoutCompleted = async (session: any) => {
  // ...

  // メタデータから古いサブスクリプションIDを取得
  const replaceSubscriptionId = session.metadata?.replace_subscription_id;

  if (replaceSubscriptionId) {
    console.log(`既存サブスクリプション ${replaceSubscriptionId} をキャンセルします`);

    try {
      // Stripeで古いサブスクリプションをキャンセル
      await stripe.subscriptions.cancel(replaceSubscriptionId);

      // データベースも更新
      await supabase
        .from('user_subscriptions')
        .update({ is_active: false })
        .eq('stripe_subscription_id', replaceSubscriptionId);

      console.log(`既存サブスクリプション ${replaceSubscriptionId} をキャンセルしました`);
    } catch (error) {
      console.error('既存サブスクリプションのキャンセルに失敗:', error);
      // エラーでも処理を続行（新しいサブスクリプションは作成する）
    }
  }

  // 新しいサブスクリプションを作成
  // ...
};
```

**修正ポイント**:
- エラーハンドリングの追加
- ログ出力の追加
- データベース更新の確実な実行

#### A-2. create-checkout/index.tsの修正

**ファイル**: `supabase/functions/create-checkout/index.ts`

**確認箇所**:
```typescript
// 既存サブスクリプションの確認
const { data: existingSubscription } = await supabase
  .from('user_subscriptions')
  .select('stripe_subscription_id')
  .eq('user_id', user.id)
  .eq('is_active', true)
  .single();

const metadata: any = {
  user_id: user.id,
  plan_type: planType,
  duration: duration.toString(),
};

// 既存サブスクリプションがある場合、メタデータに追加
if (existingSubscription?.stripe_subscription_id) {
  metadata.replace_subscription_id = existingSubscription.stripe_subscription_id;
  console.log('既存サブスクリプションを置き換えます:', existingSubscription.stripe_subscription_id);
}

const session = await stripe.checkout.sessions.create({
  // ...
  metadata,
  // ...
});
```

#### テスト方法
1. 既存契約者でログイン
2. 別プランを選択してチェックアウト
3. 決済完了
4. Stripeダッシュボードで確認:
   - 古いサブスクリプションが「Canceled」になっている
   - 新しいサブスクリプションが「Active」になっている
5. データベースで確認:
   - `is_active = true`のレコードが1つだけ

#### 完了条件
- [ ] Webhookのエラーハンドリングを追加
- [ ] create-checkoutのメタデータ設定を確認
- [ ] デプロイ
- [ ] テストで二重課金が発生しないことを確認

---

### オプションB: Customer Portal統合（推奨）

**実施内容**:

#### B-1. Subscription.tsxの修正

**ファイル**: `src/pages/Subscription.tsx`

**修正内容**:
```typescript
import { getCustomerPortalUrl } from '@/services/stripe';

const SubscriptionPage: React.FC = () => {
  // ...

  const handlePlanChange = async () => {
    if (!isSubscribed) {
      // 新規登録: Checkoutに進む
      await handleSubscribe(selectedPlanType);
    } else {
      // 既存契約者: Customer Portalに遷移
      setIsLoading(true);
      try {
        const url = await getCustomerPortalUrl();
        window.location.href = url;
      } catch (error) {
        console.error('Customer Portal error:', error);
        toast({
          title: "エラーが発生しました",
          description: "プラン管理ページを開けませんでした",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  // ...

  return (
    // ...
    <PlanCard
      // ...
      buttonText={isSubscribed ? "プランを管理" : "選択する"}
      onSubscribe={handlePlanChange}
    />
  );
};
```

#### B-2. services/stripe.tsの確認

**ファイル**: `src/services/stripe.ts`

**確認内容**:
- `getCustomerPortalUrl()`関数が存在するか
- 正しく実装されているか

#### メリット・デメリット

**メリット**:
- 二重課金のリスクがゼロ
- Stripeが自動的にサブスクリプションを管理
- カード情報の再入力が不要
- 実装がシンプル

**デメリット**:
- UIがStripeのデザインになる
- カスタマイズ制限あり

#### テスト方法
1. 既存契約者でログイン
2. `/subscription`ページで「プランを管理」ボタンをクリック
3. Stripe Customer Portalに遷移
4. プラン変更を実行
5. 戻るボタンで`/subscription`に戻る
6. プラン情報が更新されていることを確認

#### 完了条件
- [ ] `Subscription.tsx`を修正
- [ ] `getCustomerPortalUrl()`の実装を確認
- [ ] テストでCustomer Portalが正常に動作することを確認

---

## 🎯 実装の推奨順序

### 今日実施（1-2時間）
1. ✅ ステップ1: データベース確認（5分）
2. ✅ ステップ2: 二重課金の調査（30分）
3. ✅ ステップ3: 期間変更の修正（30分）

### 明日実施（2-3時間）
4. ✅ ステップ4: Successページ作成（45分）
5. ✅ ステップ5: cancel_url修正（15分）
6. ✅ ステップ6: テストアカウントクリーンアップ（10分）
7. ✅ フェーズ2: 二重課金の根本修正（1-2時間）
   - オプションAまたはBを選択

### テスト日（1時間）
8. ✅ 全機能の動作確認
9. ✅ テストレポートの更新

---

## 📝 進捗記録

### ステップ1: データベース確認
- [ ] 実施日時:
- [ ] 結果:
- [ ] 問題点:
- [ ] メモ:

### ステップ2: 二重課金の調査
- [ ] 実施日時:
- [ ] Stripe状態:
- [ ] Webhookログ:
- [ ] 原因:
- [ ] メモ:

### ステップ3: 期間変更の修正
- [ ] 実施日時:
- [ ] 修正ファイル:
- [ ] テスト結果:
- [ ] メモ:

### ステップ4: Successページ作成
- [ ] 実施日時:
- [ ] 作成ファイル:
- [ ] テスト結果:
- [ ] メモ:

### ステップ5: cancel_url修正
- [ ] 実施日時:
- [ ] デプロイ結果:
- [ ] テスト結果:
- [ ] メモ:

### ステップ6: テストアカウントクリーンアップ
- [ ] 実施日時:
- [ ] 削除データ:
- [ ] メモ:

### フェーズ2: 二重課金の根本修正
- [ ] 選択したオプション:
- [ ] 実施日時:
- [ ] 修正内容:
- [ ] テスト結果:
- [ ] メモ:

---

## ✅ 完了判定基準

### フェーズ1完了
- [ ] すべてのステップ（1-6）が完了
- [ ] 期間変更が正常に動作
- [ ] Successページが表示される
- [ ] チェックアウトから正常に戻れる
- [ ] テストアカウントのエラーが解消

### フェーズ2完了
- [ ] 二重課金が発生しない
- [ ] プラン変更が正常に動作
- [ ] Stripe↔Supabaseの同期が取れている

---

## 🔗 関連ドキュメント

### 必読
- **[subscription-implementation-summary.md](./subscription-implementation-summary.md)** - 実装状況サマリー（現状把握）

### 参考
- [subscription-issues-analysis.md](./subscription-issues-analysis.md) - 問題分析（詳細な調査結果）
- [subscription-test-report.md](./subscription-test-report.md) - テストレポート（実際のテスト結果）
- [subscription-page-specification.md](./subscription-page-specification.md) - 仕様書（要件定義）
- [phase6-premium-content-implementation.md](./phase6-premium-content-implementation.md) - プレミアムコンテンツ実装計画

---

## 📖 このドキュメントの使い方

### 推奨フロー
1. **準備**: `subscription-implementation-summary.md` で現状を把握
2. **実装**: このドキュメントのステップ1から順に実施
3. **記録**: 各ステップの「進捗記録」セクションに結果を記入
4. **テスト**: 各ステップの完了条件を確認
5. **次へ**: 問題なければ次のステップへ進む

### トラブル時
- エラーが発生したら、そのステップの「問題点」欄に記録
- 必要に応じて `subscription-issues-analysis.md` を参照
- 解決できない場合は一旦前のステップに戻る

---

**作成者**: Claude Code
**作成日**: 2025-11-16
**役割**: 具体的な実装手順とコード例
**前提**: `subscription-implementation-summary.md` で現状を把握済み
