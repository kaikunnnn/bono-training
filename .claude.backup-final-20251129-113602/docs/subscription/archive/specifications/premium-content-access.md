# プレミアムコンテンツ アクセス制御仕様

**作成日**: 2025-11-24
**ステータス**: ✅ 実装完了
**目的**: サブスクリプション加入者のみがアクセスできるプレミアムコンテンツの仕様を定義

---

## 📚 目次

1. [概要](#概要)
2. [アクセス制御の基本ルール](#アクセス制御の基本ルール)
3. [プラン別アクセス権限](#プラン別アクセス権限)
4. [実装アーキテクチャ](#実装アーキテクチャ)
5. [動画コンテンツのアクセス制御](#動画コンテンツのアクセス制御)
6. [ロック画面の表示](#ロック画面の表示)
7. [リアルタイム更新](#リアルタイム更新)
8. [実装ファイル](#実装ファイル)

---

## 概要

BONOでは、サブスクリプションプランに加入したユーザーのみがアクセスできる「プレミアムコンテンツ」を提供しています。

### プレミアムコンテンツとは

- 記事に付随する動画コンテンツ
- Sanity CMS の記事データに `isPremium: true` フラグが設定されているコンテンツ
- Standard または Feedback プランへの加入が必要

### 動作概要

```
未契約ユーザー → プレミアム記事を開く → 動画部分がロック表示 → 「プランを見る」ボタン
契約済みユーザー → プレミアム記事を開く → 動画が通常通り視聴可能
```

---

## アクセス制御の基本ルール

### ルール 1: 無料コンテンツは全員アクセス可能

```typescript
if (!isPremium) {
  return true; // 誰でもアクセス可能
}
```

**実装場所**: `src/utils/premiumAccess.ts:14-17`

### ルール 2: プレミアムコンテンツはサブスクリプション必須

```typescript
// プレミアムコンテンツへのアクセス条件
planType === 'standard' || planType === 'growth' || planType === 'community'
```

**実装場所**: `src/utils/premiumAccess.ts:19-21`

**注意**:
- `growth` プランは将来の拡張用
- `community` は内部的には `feedback` プランを指す

---

## プラン別アクセス権限

### アクセス権限マトリックス

| プラン | Learning コンテンツ | Member 限定コンテンツ | プレミアム動画 | 価格（月額） |
|--------|-------------------|---------------------|--------------|------------|
| **Standard 1M** | ✅ | ✅ | ✅ | ¥4,000 |
| **Standard 3M** | ✅ | ✅ | ✅ | ¥3,800 |
| **Feedback 1M** | ✅ | ✅ | ✅ | ¥1,480 |
| **Feedback 3M** | ✅ | ✅ | ✅ | ¥1,280 |
| **未登録** | ❌ | ❌ | ❌ | - |

**実装場所**: `src/utils/subscriptionPlans.ts:16-19`

### コンテンツタイプ定義

```typescript
type ContentAccessType = 'learning' | 'member';

const CONTENT_PERMISSIONS: Record<ContentAccessType, PlanType[]> = {
  learning: ['standard', 'feedback'], // 学習コンテンツ
  member: ['standard', 'feedback'],   // メンバー限定コンテンツ
};
```

**実装場所**: `src/utils/subscriptionPlans.ts:4, 16-19`

### プラン特典

**Standard プラン**:
- ✅ 学習コンテンツへのアクセス
- ✅ メンバー限定コンテンツへのアクセス
- ✅ トレーニングプログラムへの参加
- ✅ 実践的なスキルを身につけるハンズオン

**Feedback プラン** (Standard の全特典 + ):
- ✅ フィードバック機能の利用

**実装場所**: `src/utils/subscriptionPlans.ts:125-141`

---

## 実装アーキテクチャ

### データフロー

```
┌─────────────────────────────────────────────────────┐
│ 1. ユーザーがログイン                                  │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 2. useSubscription フックでサブスク状態を取得          │
│    - Supabase: user_subscriptions テーブル照会        │
│    - Edge Function: check-subscription 呼び出し       │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 3. SubscriptionContext に状態を保存                   │
│    - planType: 'standard' | 'feedback' | null        │
│    - isSubscribed: boolean                           │
│    - hasMemberAccess: boolean                        │
│    - hasLearningAccess: boolean                      │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 4. 記事ページで isPremium フラグをチェック             │
│    - Sanity CMS から取得                             │
└─────────────────┬───────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────┐
│ 5. VideoSection コンポーネントでアクセス判定           │
│    - canAccessContent(isPremium, planType)           │
└─────────────────┬───────────────────────────────────┘
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
  ✅ アクセス可能      ❌ アクセス不可
  動画プレイヤー表示    PremiumVideoLock 表示
```

### コンポーネント構成

```typescript
// 1. Context Provider (App.tsx)
<SubscriptionProvider>
  <Routes>
    <Route path="/articles/:slug" element={<ArticleDetail />} />
  </Routes>
</SubscriptionProvider>

// 2. Article Detail Page
const ArticleDetail = () => {
  const article = await getArticleWithContext(slug);
  return (
    <VideoSection
      videoUrl={article.videoUrl}
      isPremium={article.isPremium}  // ← Sanity から取得
    />
  );
};

// 3. Video Section Component
const VideoSection = ({ isPremium }) => {
  const { canAccessContent } = useSubscriptionContext();

  if (isPremium && !canAccessContent(isPremium)) {
    return <PremiumVideoLock />;  // ← ロック画面
  }

  return <VideoPlayer />; // ← 通常の動画プレイヤー
};
```

---

## 動画コンテンツのアクセス制御

### VideoSection コンポーネント

**実装場所**: `src/components/article/VideoSection.tsx:23-29`

```typescript
const VideoSection = ({
  videoUrl,
  thumbnail,
  thumbnailUrl,
  isPremium = false
}: VideoSectionProps) => {
  const { canAccessContent } = useSubscriptionContext();

  // プレミアムコンテンツで未契約の場合、ロック表示
  if (isPremium && !canAccessContent(isPremium)) {
    return <PremiumVideoLock />;
  }

  // YouTube/Vimeo の判定と表示
  const videoInfo = videoUrl ? getVideoInfo(videoUrl) : null;

  if (!videoInfo) {
    // サムネイルがあれば表示
    if (thumbnailSrc) return <ThumbnailImage />;
    return null;
  }

  // 通常の動画プレイヤー
  return <VideoPlayer videoInfo={videoInfo} />;
};
```

### アクセス判定ロジック

**実装場所**: `src/utils/premiumAccess.ts:10-22`

```typescript
export const canAccessContent = (
  isPremium: boolean,
  planType: PlanType | null
): boolean => {
  // 無料コンテンツは誰でもアクセス可能
  if (!isPremium) {
    return true;
  }

  // プレミアムコンテンツの場合、standardまたはcommunity（feedback）プランが必要
  return planType === 'standard' || planType === 'growth' || planType === 'community';
};
```

### コンテンツロック判定

**実装場所**: `src/utils/premiumAccess.ts:24-36`

```typescript
export const isContentLocked = (
  isPremium: boolean,
  planType: PlanType | null
): boolean => {
  return !canAccessContent(isPremium, planType);
};
```

---

## ロック画面の表示

### PremiumVideoLock コンポーネント

**実装場所**: `src/components/premium/PremiumVideoLock.tsx`

#### 表示内容

```
┌─────────────────────────────────────────┐
│                                         │
│            🔒 (ロックアイコン)             │
│                                         │
│        プレミアムコンテンツ                │
│                                         │
│     この動画を視聴するには                 │
│  スタンダードプラン以上が必要です            │
│                                         │
│      [🔒 プランを見る]                   │
│                                         │
│ スタンダードプランで全ての動画と            │
│      コンテンツにアクセス                  │
│                                         │
└─────────────────────────────────────────┘
```

#### デザイン仕様

- **アスペクト比**: 16:9（動画プレイヤーと同じサイズ）
- **背景**: グラデーション（gray-100 → gray-200）+ パターン
- **ロックアイコン**: 白い円形背景（w-20 h-20）、青いロックアイコン（w-10 h-10）
- **タイトル**: "プレミアムコンテンツ"（font-bold text-xl）
- **説明文**: "この動画を視聴するには<br>スタンダードプラン以上が必要です"（text-sm）
- **CTAボタン**: 青色（bg-blue-600）、ホバーで濃くなる（hover:bg-blue-700）

#### 動作

```typescript
const handleUpgrade = () => {
  navigate('/subscription'); // サブスクリプションページへ遷移
};
```

---

## リアルタイム更新

### Supabase Realtime による自動更新

**実装場所**: `src/hooks/useSubscription.ts:114-143`

```typescript
useEffect(() => {
  if (!user) return;

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
        fetchSubscriptionStatus(); // 即座に状態を再取得
      }
    )
    .subscribe();

  return () => {
    channel.unsubscribe();
  };
}, [user]);
```

### 自動更新されるケース

1. **プラン変更**: Customer Portal でプラン変更 → 即座に UI 更新
2. **新規登録**: Checkout で決済完了 → 即座に UI 更新
3. **キャンセル**: Customer Portal でキャンセル → 即座に UI 更新

### 更新の流れ

```
Stripe Webhook → Edge Function (stripe-webhook-test)
                      ↓
          user_subscriptions テーブル更新
                      ↓
          Supabase Realtime 通知
                      ↓
          useSubscription フック検知
                      ↓
          fetchSubscriptionStatus() 実行
                      ↓
          Context 更新 → UI 自動更新
```

---

## 実装ファイル

### コアロジック

| ファイル | 役割 | 主要な関数/コンポーネント |
|---------|------|------------------------|
| `src/utils/premiumAccess.ts` | アクセス判定ロジック | `canAccessContent()`, `isContentLocked()` |
| `src/utils/subscriptionPlans.ts` | プラン定義・権限設定 | `CONTENT_PERMISSIONS`, `hasMemberAccess()`, `hasLearningAccess()` |
| `src/hooks/useSubscription.ts` | サブスクリプション状態管理 | `useSubscription()` フック |
| `src/contexts/SubscriptionContext.tsx` | Context API 提供 | `SubscriptionProvider`, `useSubscriptionContext()` |

### UI コンポーネント

| ファイル | 役割 | 説明 |
|---------|------|------|
| `src/components/article/VideoSection.tsx` | 動画表示制御 | プレミアム判定 + 動画プレイヤー or ロック画面 |
| `src/components/premium/PremiumVideoLock.tsx` | ロック画面 | 未契約ユーザー向けの案内画面 |

### データ取得

| ファイル | 役割 | クエリフィールド |
|---------|------|---------------|
| `src/lib/sanity.ts` | Sanity CMS データ取得 | `isPremium` フィールドを含む記事データ取得 |
| `src/services/stripe.ts` | Stripe API 連携 | サブスクリプション状態確認 |

### Edge Functions

| ファイル | 役割 | 説明 |
|---------|------|------|
| `supabase/functions/check-subscription/index.ts` | サブスク状態確認 API | ユーザーの現在のプラン・アクセス権限を返す |
| `supabase/functions/stripe-webhook-test/index.ts` | Webhook ハンドラー | Stripe イベントを受信して DB 更新 |

---

## Sanity CMS でのプレミアム設定

### 記事スキーマ

```typescript
// sanity-studio/schemas/article.ts
{
  name: 'article',
  type: 'document',
  fields: [
    // ... 他のフィールド
    {
      name: 'isPremium',
      title: 'プレミアムコンテンツ',
      type: 'boolean',
      description: 'このコンテンツをプレミアム会員限定にする場合はONにしてください',
      initialValue: false
    }
  ]
}
```

### Sanity Studio での設定手順

1. Sanity Studio で記事を編集
2. 「プレミアムコンテンツ」トグルを **ON** にする
3. 保存・公開

### データ取得クエリ

**実装場所**: `src/lib/sanity.ts:27-100`

```groq
*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  videoUrl,
  isPremium,  // ← プレミアムフラグを取得
  // ... 他のフィールド
}
```

---

## テスト手順

### テストケース 1: 未契約ユーザーのアクセス

**前提条件**:
- ユーザーがログアウト状態、またはサブスクリプション未登録

**手順**:
1. プレミアム記事（`isPremium: true`）を開く
2. 動画部分を確認

**期待結果**:
- ✅ `PremiumVideoLock` コンポーネントが表示される
- ✅ 「プレミアムコンテンツ」というタイトルが表示される
- ✅ 「プランを見る」ボタンが表示される
- ✅ ボタンをクリックすると `/subscription` ページに遷移

### テストケース 2: Standard プラン契約ユーザー

**前提条件**:
- Standard 1M または 3M プランに登録済み

**手順**:
1. プレミアム記事（`isPremium: true`）を開く
2. 動画部分を確認

**期待結果**:
- ✅ 通常の動画プレイヤーが表示される
- ✅ YouTube/Vimeo 動画が再生可能
- ✅ ロック画面は表示されない

### テストケース 3: Feedback プラン契約ユーザー

**前提条件**:
- Feedback 1M または 3M プランに登録済み

**手順**:
1. プレミアム記事（`isPremium: true`）を開く
2. 動画部分を確認

**期待結果**:
- ✅ 通常の動画プレイヤーが表示される（Standard プランと同じ）
- ✅ YouTube/Vimeo 動画が再生可能

### テストケース 4: リアルタイム更新

**前提条件**:
- 未契約ユーザーがプレミアム記事を開いている

**手順**:
1. プレミアム記事を開く → ロック画面表示
2. 別タブで `/subscription` ページを開く
3. Standard プランで決済完了
4. 元の記事タブに戻る（リロードなし）

**期待結果**:
- ✅ 自動的にロック画面が消える
- ✅ 通常の動画プレイヤーが表示される
- ✅ ページリロード不要

### テストケース 5: 無料コンテンツ

**前提条件**:
- ユーザーが未契約状態

**手順**:
1. 通常記事（`isPremium: false` または未設定）を開く

**期待結果**:
- ✅ 通常の動画プレイヤーが表示される
- ✅ ロック画面は表示されない
- ✅ サブスクリプション不要で動画視聴可能

---

## トラブルシューティング

### 問題 1: 契約済みなのにロック画面が表示される

**原因**:
- Context の初期化が完了していない
- `useSubscription` フックの `loading` 状態が `true`

**確認方法**:
```typescript
const { isSubscribed, planType, loading } = useSubscriptionContext();
console.log({ isSubscribed, planType, loading });
```

**解決方法**:
- `loading` が `false` になるまで待つ
- VideoSection に loading 状態のハンドリングを追加

### 問題 2: プラン変更後も古い状態が表示される

**原因**:
- Realtime Subscription が正しく動作していない
- Webhook が失敗している

**確認方法**:
```bash
# Edge Functions のログを確認
npx supabase functions logs stripe-webhook-test --limit 20
```

**解決方法**:
1. Webhook が 200 で成功しているか確認
2. `user_subscriptions` テーブルが更新されているか確認
3. 手動で `refresh()` を呼び出してみる

```typescript
const { refresh } = useSubscriptionContext();
await refresh();
```

### 問題 3: TypeScript エラー "Property 'isPremium' does not exist"

**原因**:
- Sanity の型定義に `isPremium` が含まれていない

**解決方法**:

`src/types/sanity.ts` に `isPremium` を追加:

```typescript
export interface Article {
  _id: string;
  title: string;
  videoUrl?: string;
  isPremium?: boolean;  // ← 追加
  // ... 他のフィールド
}
```

---

## まとめ

### 実装済み機能

✅ プレミアムコンテンツのアクセス制御
✅ プラン別権限管理
✅ 動画ロック画面の表示
✅ リアルタイム状態更新
✅ Sanity CMS との連携

### 今後の拡張案

💡 **Growth プランの追加**:
- 現在は将来の拡張用として予約済み
- `premiumAccess.ts:21` で既に判定ロジックに含まれている

💡 **コンテンツタイプの拡張**:
- 現在は動画のみ
- 将来的にはテキストコンテンツ、ダウンロード資料なども制御可能

💡 **段階的アクセス制御**:
- 現在は「全部アクセス可能」or「全部ロック」の2段階
- 将来的にはコンテンツごとに異なるプランを要求可能

---

**最終更新日**: 2025-11-24
**ドキュメント管理**: `.claude/docs/subscription/specifications/`
