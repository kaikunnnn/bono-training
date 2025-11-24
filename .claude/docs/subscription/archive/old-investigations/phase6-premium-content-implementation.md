# Phase 6: プレミアムコンテンツ & Stripe連携 実装計画

## 概要

このフェーズでは、プレミアムコンテンツの表示制御とStripe連携による課金・サブスクリプション管理を実装します。

## 要件定義

### 1. プラン構成

| プラン名 | 説明 | アクセス権限 | 既存プランマッピング |
|---------|------|-------------|-------------------|
| 無料 | デフォルトプラン | isPremium=false のコンテンツのみ | 新規追加（plan_type: null） |
| スタンダード | 全コンテンツアクセス | 全てのコンテンツ | 既存 'standard' |
| フィードバック | 全コンテンツ + フィードバック機能 | 全コンテンツ + 将来的なフィードバック機能 | 既存 'community' を 'feedback' に変更 |

### 2. プレミアムコンテンツ表示制御

#### 2.1 記事詳細ページ（ArticleDetail）

**常に表示される要素：**
- ヘッディングセクション（タイトル、説明文、アクションボタン）
- パンくずリスト
- 進捗管理UI

**プレミアム制御が必要な要素：**

1. **動画エリア**
   - isPremium=true かつ 未契約の場合：
     - 動画プレイヤーの代わりにプレミアムメッセージを表示
     - 「この動画を視聴するにはスタンダードプラン以上が必要です」
     - CTAボタン：「プランを見る」→ /subscription ページへ

2. **記事コンテンツ（Portable Text）**
   - 最初の3ブロック（段落）のみ表示
   - 4ブロック目以降はグラデーション + CTAで隠す
   - グラデーション：白から半透明へのlinear-gradient
   - CTAメッセージ：「続きを読むにはスタンダードプラン以上が必要です」
   - CTAボタン：「プランを見る」→ /subscription ページへ

#### 2.2 レッスン詳細ページ（LessonDetail）

**コンテンツリストのロックアイコン：**
- QuestCard内のContentItemにロックアイコン表示
- isPremium=true かつ 未契約の記事に 🔒 アイコンを表示
- アイコン位置：タイトルの左側

### 3. Stripe連携

#### 3.1 環境変数（必要な追加項目）

```env
# Stripe（テスト環境）
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxx
VITE_STRIPE_TEST_PRICE_ID=price_xxxxxxxxxxxxxxxx

# 本番環境では以下に切り替え
# VITE_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxxxxxx
# VITE_STRIPE_PRICE_ID=price_xxxxxxxxxxxxxxxx
```

#### 3.2 カスタマーポータル統合

- Stripeカスタマーポータルへのリンクを提供
- ユーザーができること：
  - プラン変更
  - 支払い方法の更新
  - キャンセル処理
  - 請求履歴の確認

#### 3.3 アカウント情報表示

新規ページ：`/account` または既存ページに追加

**表示情報：**
1. メールアドレス（auth.users から取得）
2. 現在のプラン名（user_subscriptions.plan_type から取得）
3. 更新日（user_subscriptions.updated_at から取得）
4. 次回更新日（Stripe APIから取得、可能であれば）

## 既存システムの調査結果

### データベーススキーマ

**テーブル: `user_subscriptions`**
```sql
- user_id: UUID (FK to auth.users)
- is_active: boolean
- plan_type: string ('standard', 'growth', 'community')
- plan_members: boolean
- stripe_subscription_id: string (nullable)
- updated_at: timestamp
```

### 既存ファイル

1. **`src/services/stripe.ts`**
   - `createCheckoutSession()`: チェックアウトセッション作成
   - `checkSubscriptionStatus()`: サブスクリプション状態確認

2. **`src/utils/subscriptionPlans.ts`**
   - プラン定義（standard, growth, community）
   - アクセス権限マッピング（learning, member）

3. **Supabase Edge Functions**
   - `create-checkout`: チェックアウトセッション作成
   - `check-subscription`: サブスクリプション確認
   - `stripe-webhook`: Webhook処理

## 実装ステップ

### Step 1: データベース更新（必要に応じて）

**目的**: プラン構成を新しい要件に合わせる

**タスク**:
1. `user_subscriptions`テーブルの`plan_type`のデフォルト値を確認
2. 無料プランの扱いを決定（null vs 'free'）
3. 'community'を'feedback'に名称変更するか検討
4. 必要に応じてマイグレーション作成

**成果物**:
- [ ] マイグレーションファイル（必要な場合）
- [ ] 更新されたテーブル定義

---

### Step 2: 環境変数設定

**目的**: Stripeキーを追加

**タスク**:
1. Stripeダッシュボードからテスト用の公開鍵を取得
2. テスト用の価格IDを取得（または作成）
3. `.env`に追加
4. `.env.example`を更新（セキュリティのため値はダミー）

**成果物**:
- [ ] 更新された`.env`ファイル
- [ ] 更新された`.env.example`ファイル

---

### Step 3: サブスクリプション状態管理の強化

**目的**: プレミアムコンテンツアクセス判定ロジックの実装

**タスク**:
1. `src/contexts/SubscriptionContext.tsx`を作成（または既存を更新）
2. サブスクリプション状態をReact Contextで管理
3. カスタムフック`useSubscription()`を提供
4. アクセス権限チェック関数を実装

**成果物**:
- [ ] `src/contexts/SubscriptionContext.tsx`
- [ ] `src/hooks/useSubscription.ts`
- [ ] `src/utils/premiumAccess.ts`（アクセス判定ロジック）

**実装例**:
```typescript
// src/contexts/SubscriptionContext.tsx
interface SubscriptionContextType {
  isSubscribed: boolean;
  planType: PlanType | null;
  hasLearningAccess: boolean;
  hasMemberAccess: boolean;
  loading: boolean;
  canAccessContent: (isPremium: boolean) => boolean;
}

// src/hooks/useSubscription.ts
export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) throw new Error('useSubscription must be used within SubscriptionProvider');
  return context;
};

// src/utils/premiumAccess.ts
export const canAccessContent = (
  isPremium: boolean,
  planType: PlanType | null
): boolean => {
  if (!isPremium) return true; // 無料コンテンツは誰でもアクセス可能
  return planType === 'standard' || planType === 'feedback';
};
```

---

### Step 4: 記事詳細ページのプレミアム制御実装

**目的**: 動画エリアとコンテンツのプレミアム表示制御

#### 4.1 動画エリアのロック表示

**タスク**:
1. `src/components/article/ArticleVideo.tsx`にプレミアムロック状態を追加
2. プレミアムメッセージコンポーネント作成
3. 条件分岐実装（isPremium && !hasAccess）

**成果物**:
- [ ] 更新された`src/components/article/ArticleVideo.tsx`
- [ ] `src/components/premium/PremiumVideoLock.tsx`（新規）

**実装例**:
```typescript
// src/components/article/ArticleVideo.tsx
import { useSubscription } from '@/hooks/useSubscription';
import PremiumVideoLock from '@/components/premium/PremiumVideoLock';

interface ArticleVideoProps {
  videoUrl?: string;
  isPremium?: boolean;
}

export default function ArticleVideo({ videoUrl, isPremium = false }: ArticleVideoProps) {
  const { canAccessContent } = useSubscription();

  if (isPremium && !canAccessContent(isPremium)) {
    return <PremiumVideoLock />;
  }

  if (!videoUrl) return null;

  return (
    <div className="video-container">
      {/* 既存の動画プレイヤー */}
    </div>
  );
}
```

#### 4.2 記事コンテンツのプレビュー制御

**タスク**:
1. Portable Textレンダラーにブロック数制限機能を追加
2. グラデーションオーバーレイコンポーネント作成
3. プレミアムCTAコンポーネント作成
4. 最初の3ブロックのみ表示するロジック実装

**成果物**:
- [ ] 更新された`src/components/article/ArticleContent.tsx`
- [ ] `src/components/premium/ContentPreviewOverlay.tsx`（新規）
- [ ] `src/components/premium/PremiumCTA.tsx`（新規）

**実装例**:
```typescript
// src/components/article/ArticleContent.tsx
import { PortableText } from '@portabletext/react';
import { useSubscription } from '@/hooks/useSubscription';
import ContentPreviewOverlay from '@/components/premium/ContentPreviewOverlay';

interface ArticleContentProps {
  content: any[];
  isPremium?: boolean;
}

export default function ArticleContent({ content, isPremium = false }: ArticleContentProps) {
  const { canAccessContent } = useSubscription();
  const hasAccess = canAccessContent(isPremium);

  // プレミアムコンテンツで未契約の場合、最初の3ブロックのみ表示
  const displayContent = isPremium && !hasAccess
    ? content.slice(0, 3)
    : content;

  return (
    <div className="relative">
      <PortableText value={displayContent} components={portableTextComponents} />

      {isPremium && !hasAccess && (
        <ContentPreviewOverlay />
      )}
    </div>
  );
}

// src/components/premium/ContentPreviewOverlay.tsx
export default function ContentPreviewOverlay() {
  return (
    <div className="relative -mt-20">
      {/* グラデーション */}
      <div
        className="absolute inset-x-0 top-0 h-40 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)'
        }}
      />

      {/* CTA */}
      <div className="relative bg-white pt-20 pb-12 text-center">
        <p className="text-gray-700 mb-4">
          続きを読むにはスタンダードプラン以上が必要です
        </p>
        <button
          onClick={() => window.location.href = '/subscription'}
          className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition"
        >
          プランを見る
        </button>
      </div>
    </div>
  );
}
```

---

### Step 5: レッスン詳細ページのロックアイコン表示

**目的**: コンテンツリストでプレミアム記事を視覚的に識別

**タスク**:
1. `ContentItem.tsx`にロックアイコン表示を追加
2. `QuestCard.tsx`から`isPremium`情報を渡す
3. ロックアイコンのスタイリング

**成果物**:
- [ ] 更新された`src/components/lesson/ContentItem.tsx`
- [ ] 更新された`src/components/lesson/QuestCard.tsx`

**実装例**:
```typescript
// src/components/lesson/ContentItem.tsx
import { Lock } from 'lucide-react';
import { useSubscription } from '@/hooks/useSubscription';

interface ContentItemProps {
  // ... 既存のprops
  isPremium?: boolean;
}

export default function ContentItem({
  // ... 既存のprops
  isPremium = false
}: ContentItemProps) {
  const { canAccessContent } = useSubscription();
  const isLocked = isPremium && !canAccessContent(isPremium);

  return (
    <div className="flex items-center gap-4 px-8 py-3 hover:bg-gray-50 rounded-lg cursor-pointer transition">
      {/* 既存の記事番号 */}

      {/* 既存のサムネイル */}

      {/* タイトルと動画時間 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isCompleted && <Check className="w-5 h-5 text-green-500 flex-shrink-0" strokeWidth={2.5} />}
          {isLocked && <Lock className="w-4 h-4 text-gray-400 flex-shrink-0" />}
          <p className="font-noto-sans-jp text-sm text-lesson-item-title font-medium truncate">
            {title}
          </p>
        </div>
        {/* 既存の動画時間表示 */}
      </div>
    </div>
  );
}
```

**修正が必要なファイル**:
```typescript
// src/components/lesson/QuestCard.tsx
interface Article {
  _id: string;
  articleNumber: number;
  title: string;
  slug: { current: string };
  thumbnail?: any;
  videoDuration?: number;
  isPremium?: boolean; // 追加
}

// ContentItemを呼び出す際にisPremiumを渡す
<ContentItem
  key={article._id}
  articleNumber={article.articleNumber}
  title={article.title}
  slug={article.slug.current}
  thumbnail={article.thumbnail}
  videoDuration={article.videoDuration}
  isCompleted={completedArticleIds.includes(article._id)}
  isPremium={article.isPremium} // 追加
/>
```

**Sanityクエリの更新**:
```typescript
// src/pages/LessonDetail.tsx
const query = `*[_type == "lesson" && slug.current == $slug][0] {
  // ... 既存のフィールド
  "quests": quests[]-> {
    _id,
    title,
    description,
    goal,
    estTimeMins,
    "articles": articles[]-> {
      _id,
      title,
      slug,
      thumbnail { _type, asset { _ref, _type } },
      videoDuration,
      isPremium  // 追加
    }
  }
}`;
```

---

### Step 6: アカウント情報ページ実装

**目的**: ユーザーのサブスクリプション情報を表示

**タスク**:
1. `/account`ページを作成
2. Supabaseからユーザー情報を取得
3. Stripe APIから次回更新日を取得（オプション）
4. カスタマーポータルへのリンクを追加

**成果物**:
- [ ] `src/pages/Account.tsx`（新規）
- [ ] `src/components/account/SubscriptionInfo.tsx`（新規）
- [ ] `src/services/stripe.ts`に`getCustomerPortalUrl()`追加

**実装例**:
```typescript
// src/pages/Account.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useSubscription } from '@/hooks/useSubscription';
import Layout from '@/components/layout/Layout';
import SubscriptionInfo from '@/components/account/SubscriptionInfo';

export default function Account() {
  const [email, setEmail] = useState<string>('');
  const { planType, loading } = useSubscription();

  useEffect(() => {
    const fetchUserInfo = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setEmail(user.email || '');
      }
    };
    fetchUserInfo();
  }, []);

  if (loading) {
    return <Layout><div>読み込み中...</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold mb-8">アカウント情報</h1>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">基本情報</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-600">メールアドレス:</span>
              <span className="ml-2 font-medium">{email}</span>
            </div>
          </div>
        </div>

        <SubscriptionInfo planType={planType} />
      </div>
    </Layout>
  );
}

// src/components/account/SubscriptionInfo.tsx
import { useState } from 'react';
import { getCustomerPortalUrl } from '@/services/stripe';

interface SubscriptionInfoProps {
  planType: PlanType | null;
}

export default function SubscriptionInfo({ planType }: SubscriptionInfoProps) {
  const [loading, setLoading] = useState(false);

  const planNames: Record<string, string> = {
    'standard': 'スタンダード',
    'feedback': 'フィードバック',
  };

  const handleManageSubscription = async () => {
    setLoading(true);
    try {
      const url = await getCustomerPortalUrl();
      window.location.href = url;
    } catch (error) {
      console.error('Error opening customer portal:', error);
      alert('カスタマーポータルを開けませんでした');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">サブスクリプション情報</h2>

      <div className="space-y-3 mb-6">
        <div>
          <span className="text-gray-600">現在のプラン:</span>
          <span className="ml-2 font-medium">
            {planType ? planNames[planType] || planType : '無料'}
          </span>
        </div>
      </div>

      {planType && (
        <button
          onClick={handleManageSubscription}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
        >
          {loading ? '読み込み中...' : 'プランを管理'}
        </button>
      )}
    </div>
  );
}

// src/services/stripe.ts に追加
export const getCustomerPortalUrl = async (): Promise<string> => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    throw new Error('Not authenticated');
  }

  const { data, error } = await supabase.functions.invoke('create-customer-portal', {
    body: { returnUrl: window.location.origin + '/account' }
  });

  if (error) throw error;
  return data.url;
};
```

**新規Edge Function必要**:
- [ ] `supabase/functions/create-customer-portal/index.ts`

---

### Step 7: Supabase Edge Function - カスタマーポータル

**目的**: Stripeカスタマーポータルセッション作成

**タスク**:
1. Edge Function作成
2. Stripe APIでカスタマーポータルセッション作成
3. デプロイ

**成果物**:
- [ ] `supabase/functions/create-customer-portal/index.ts`

**実装例**:
```typescript
// supabase/functions/create-customer-portal/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import Stripe from 'https://esm.sh/stripe@14.21.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
});

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') as string,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') as string
);

serve(async (req) => {
  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No authorization header' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { returnUrl } = await req.json();

    // ユーザーのStripeカスタマーIDを取得
    const { data: subscription } = await supabase
      .from('user_subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', user.id)
      .single();

    if (!subscription?.stripe_customer_id) {
      return new Response(JSON.stringify({ error: 'No subscription found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // カスタマーポータルセッション作成
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: returnUrl || `${req.headers.get('origin')}/account`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating customer portal session:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
});
```

**注意**: `user_subscriptions`テーブルに`stripe_customer_id`カラムが必要な場合、マイグレーション追加

---

### Step 8: ルーティング追加

**目的**: 新規ページへのルーティング設定

**タスク**:
1. `/account`ルートを追加
2. ナビゲーションメニューに「アカウント」リンク追加（必要に応じて）

**成果物**:
- [ ] 更新された`src/App.tsx`または`src/routes.tsx`
- [ ] 更新されたナビゲーションコンポーネント

---

### Step 9: テスト

**目的**: 全機能の動作確認

#### 9.1 プレミアムコンテンツ表示テスト

**テストケース**:
1. **未ログイン状態**
   - [ ] プレミアム記事の動画エリアがロックされている
   - [ ] プレミアム記事のコンテンツが最初の3ブロックのみ表示
   - [ ] ロックアイコンがレッスン詳細のコンテンツリストに表示

2. **ログイン済み・無料プラン**
   - [ ] プレミアム記事の動画エリアがロックされている
   - [ ] プレミアム記事のコンテンツが最初の3ブロックのみ表示
   - [ ] ロックアイコンがレッスン詳細のコンテンツリストに表示

3. **ログイン済み・スタンダードプラン**
   - [ ] 全てのプレミアム記事にアクセス可能
   - [ ] 動画が再生できる
   - [ ] コンテンツ全文が表示される
   - [ ] ロックアイコンが表示されない

#### 9.2 Stripe連携テスト

**テストケース**:
1. **チェックアウトフロー**
   - [ ] プラン選択からチェックアウトページへ遷移
   - [ ] テストカードで決済完了
   - [ ] Webhookで`user_subscriptions`が更新される
   - [ ] プレミアムコンテンツにアクセス可能になる

2. **カスタマーポータル**
   - [ ] アカウントページから「プランを管理」ボタンクリック
   - [ ] Stripeカスタマーポータルに遷移
   - [ ] プラン変更・キャンセルができる
   - [ ] 戻るボタンでアカウントページに戻る

3. **アカウント情報表示**
   - [ ] メールアドレスが正しく表示される
   - [ ] 現在のプラン名が正しく表示される

#### 9.3 Sanityデータ連携テスト

**テストケース**:
1. **CMSでisPremiumフラグ変更**
   - [ ] Sanityで記事のisPremiumをtrueに変更
   - [ ] フロントエンドで反映される（ロック表示）
   - [ ] 契約済みユーザーはアクセス可能

---

### Step 10: ドキュメント更新

**目的**: 実装内容の文書化

**タスク**:
1. README.mdに環境変数セクション追加
2. プレミアム機能の使い方を記載
3. Stripe設定手順を記載

**成果物**:
- [ ] 更新された`README.md`
- [ ] `docs/premium-features.md`（新規、オプション）

---

## チェックリスト

### 準備
- [ ] Stripeアカウント作成（テスト環境）
- [ ] 環境変数追加（VITE_STRIPE_PUBLISHABLE_KEY, VITE_STRIPE_TEST_PRICE_ID）
- [ ] Stripe Webhookエンドポイント設定

### データベース
- [ ] プラン構成の確認・調整
- [ ] 必要に応じてマイグレーション実行
- [ ] stripe_customer_id カラム追加（必要な場合）

### コンテキスト・フック
- [ ] SubscriptionContext作成
- [ ] useSubscription フック作成
- [ ] アクセス判定ロジック実装

### UI実装
- [ ] ArticleVideoのプレミアムロック
- [ ] ArticleContentのプレビュー制御
- [ ] ContentItemのロックアイコン
- [ ] PremiumCTAコンポーネント
- [ ] Accountページ
- [ ] SubscriptionInfoコンポーネント

### Sanity連携
- [ ] LessonDetailのクエリにisPremium追加
- [ ] ArticleDetailのクエリにisPremium追加
- [ ] Sanity Studioでサンプルプレミアム記事作成

### Stripe連携
- [ ] create-customer-portal Edge Function実装
- [ ] getCustomerPortalUrl 関数実装
- [ ] チェックアウトフロー確認

### テスト
- [ ] プレミアムコンテンツ表示テスト
- [ ] Stripe連携テスト
- [ ] Sanityデータ連携テスト

### ドキュメント
- [ ] README更新
- [ ] 環境変数ドキュメント
- [ ] プレミアム機能ガイド

---

## 補足事項

### Sanity Studioでの設定

記事スキーマに`isPremium`フィールドが必要です。既に存在する場合はスキップ。

```typescript
// sanity/schemas/article.ts
{
  name: 'isPremium',
  title: 'プレミアムコンテンツ',
  type: 'boolean',
  description: 'trueの場合、スタンダードプラン以上のユーザーのみアクセス可能',
  initialValue: false,
}
```

### Stripe設定手順

1. **Stripeダッシュボード**にログイン
2. **開発者 > APIキー**から公開鍵をコピー
3. **商品 > 商品を追加**でプランを作成
4. 各プランの価格IDをコピー
5. `.env`に追加
6. **開発者 > Webhook**でエンドポイント追加
   - URL: `https://<project-id>.supabase.co/functions/v1/stripe-webhook`
   - イベント: `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`

### テスト用Stripeカード

テスト環境では以下のカード番号を使用：
- 成功: `4242 4242 4242 4242`
- CVV: 任意の3桁
- 有効期限: 未来の日付

---

## 実装優先度

**Phase 6で実装する機能**:
1. ✅ プレミアムコンテンツ表示制御
2. ✅ Stripe連携（チェックアウト、カスタマーポータル）
3. ✅ アカウント情報表示

**Phase 6でスキップする機能**（ユーザー要望により）:
- ❌ 検索機能
- ❌ 通知機能
- ❌ プロフィール編集
- ❌ フィードバック機能（将来のフェーズ）

---

## 参考リンク

- [Stripe Documentation](https://stripe.com/docs)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/integrating-customer-portal)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Portable Text](https://github.com/portabletext/portabletext)
