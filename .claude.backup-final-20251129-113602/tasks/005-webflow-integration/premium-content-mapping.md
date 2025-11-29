# Webflow プレミアムコンテンツ - 実装仕様

## 概要

WebflowのVideosコレクションには既に `FreeContent` フィールドが存在し、これを使用してコンテンツのアクセス制御を行う。

## Webflow設定

### FreeContent フィールド

**コレクション**: Videos
**フィールド名**: `FreeContent`（Webflow APIでは `free-content`）
**型**: Switch/Boolean

### ロジック

| FreeContent | 意味 | 対象ユーザー |
|------------|------|-------------|
| ✅ ON (true) | 無料コンテンツ | 全ユーザー（未ログイン含む） |
| ❌ OFF (false) | メンバー限定 | サブスクリプション購読者のみ |

## Sanity Article型への変換

### 変換ロジック

WebflowからSanity Article型に変換する際、**論理を反転**させる必要がある：

```typescript
// Edge Function: transformer.ts
export function transformWebflowArticle(webflowItem: any): Article {
  return {
    _id: `webflow-${webflowItem.id}`,
    _type: 'article',
    title: webflowItem.name,
    slug: { _type: 'slug', current: webflowItem.slug },
    videoUrl: webflowItem['video-url'],
    videoDuration: webflowItem['video-duration'],

    // 🔄 FreeContent の論理を反転して isPremium にマッピング
    isPremium: !webflowItem['free-content'],

    // その他のフィールド
    // ...
  };
}
```

### 変換例

#### 例1: 無料コンテンツ

**Webflow Videos**:
```json
{
  "id": "684f8307d2a12ade32efe83c",
  "name": "UIデザイン入門",
  "slug": "ui-design-basics",
  "free-content": true
}
```

**変換後 (Sanity Article型)**:
```json
{
  "_id": "webflow-684f8307d2a12ade32efe83c",
  "_type": "article",
  "title": "UIデザイン入門",
  "slug": { "current": "ui-design-basics" },
  "isPremium": false
}
```

#### 例2: メンバー限定コンテンツ

**Webflow Videos**:
```json
{
  "id": "abc123xyz",
  "name": "高度なUIテクニック",
  "slug": "advanced-ui-techniques",
  "free-content": false
}
```

**変換後 (Sanity Article型)**:
```json
{
  "_id": "webflow-abc123xyz",
  "_type": "article",
  "title": "高度なUIテクニック",
  "slug": { "current": "advanced-ui-techniques" },
  "isPremium": true
}
```

## フロントエンドでの動作

### 既存のプレミアム機能が自動的に動作

WebflowコンテンツもSanityコンテンツと同じように `isPremium` フラグを持つため、既存の `ContentGuard` がそのまま動作する。

```typescript
// LessonDetail.tsx または ArticleDetail.tsx
import ContentGuard from '@/components/subscription/ContentGuard';

// Webflowから取得したArticleも同じように扱える
<ContentGuard contentType="learning">
  <ArticleContent article={webflowArticle} />
  {/* webflowArticle.isPremium が true なら購読チェックが動く */}
</ContentGuard>
```

### ユーザー体験フロー

#### 無料コンテンツ（FreeContent=true → isPremium=false）

1. ユーザーがコンテンツにアクセス
2. `ContentGuard` が `isPremium: false` を確認
3. **アクセス許可** → コンテンツ表示

#### メンバー限定コンテンツ（FreeContent=false → isPremium=true）

1. ユーザーがコンテンツにアクセス
2. `ContentGuard` が `isPremium: true` を確認
3. `useSubscription` で購読状態をチェック
   - **購読あり** → コンテンツ表示
   - **購読なし** → サブスクリプション登録画面を表示

## セキュリティ考慮事項

### Edge Function側でのチェック（推奨）

将来的には、Edge Function側でも購読状態をチェックすることを推奨：

```typescript
// Edge Function: index.ts (将来実装)
async function handler(req: Request) {
  const userId = await getUserIdFromRequest(req);
  const hasSubscription = await checkSubscription(userId);

  const articles = await getWebflowArticles();

  // 購読していない場合、プレミアムコンテンツをフィルタリング
  if (!hasSubscription) {
    return articles.filter(article => !article.isPremium);
  }

  return articles;
}
```

### フロントエンド側での制御

現在の実装では `ContentGuard` がフロントエンド側で制御しているが、これは：
- ✅ UXとして適切（即座にフィードバック）
- ⚠️ セキュリティは完全ではない（技術的には回避可能）

**対策**:
- 動画URLは直接公開しない
- 動画再生時にサーバー側で再度認証チェック
- Vimeo/YouTubeのプライバシー設定を活用

## Webflowでの運用

### コンテンツを無料にする場合

1. Webflow管理画面を開く
2. Videos コレクションで対象Videoを選択
3. `FreeContent` フィールドを **ON** にする
4. 保存

→ アプリで即座に無料コンテンツとして表示される（キャッシュ後）

### コンテンツをメンバー限定にする場合

1. Webflow管理画面を開く
2. Videos コレクションで対象Videoを選択
3. `FreeContent` フィールドを **OFF** にする（またはチェックを外す）
4. 保存

→ アプリで購読者のみアクセス可能になる（キャッシュ後）

## テスト計画

### Phase 1: 変換テスト

- [ ] `free-content: true` のVideoが `isPremium: false` に変換されることを確認
- [ ] `free-content: false` のVideoが `isPremium: true` に変換されることを確認
- [ ] `free-content` フィールドがない場合のデフォルト動作を確認

### Phase 2: アクセス制御テスト

#### 無料コンテンツ
- [ ] 未ログインユーザーがアクセスできる
- [ ] ログイン済み（未購読）ユーザーがアクセスできる
- [ ] 購読ユーザーがアクセスできる

#### メンバー限定コンテンツ
- [ ] 未ログインユーザーがサブスクリプション登録画面を見る
- [ ] ログイン済み（未購読）ユーザーがサブスクリプション登録画面を見る
- [ ] 購読ユーザーがコンテンツにアクセスできる

### Phase 3: Stripe連携テスト

- [ ] 購読登録後、即座にメンバー限定コンテンツにアクセスできる
- [ ] 購読解約後、メンバー限定コンテンツにアクセスできなくなる
- [ ] プラン変更時の動作確認

## 既存のSanityコンテンツとの互換性

### 統一されたインターフェース

| 項目 | Sanity | Webflow |
|------|--------|---------|
| プレミアムフラグ | `isPremium` | `isPremium`（変換後） |
| 元フィールド | `isPremium` | `free-content`（反転） |
| 制御コンポーネント | `ContentGuard` | `ContentGuard`（同じ） |
| 購読チェック | `useSubscription` | `useSubscription`（同じ） |

### 混在時の動作

SanityとWebflowのコンテンツが同じLesson/Quest内に混在する場合も、両方とも `isPremium` フラグを持つため、統一的に処理される。

```typescript
// LessonDetail.tsx
const allArticles = [
  ...sanityArticles,  // isPremium あり
  ...webflowArticles, // isPremium あり（変換済み）
];

// すべて同じロジックで制御
allArticles.forEach(article => {
  if (article.isPremium && !hasSubscription) {
    showSubscriptionPrompt();
  } else {
    showContent();
  }
});
```

## 参考資料

- [Webflow CMS API - Field Types](https://developers.webflow.com/reference/field-types)
- [BONO Training - Subscription Plans](/.claude/docs/progress-and-subscription-plan.md)
- [ContentGuard Component](/src/components/subscription/ContentGuard.tsx)
- [useSubscription Hook](/src/hooks/useSubscription.ts)

## 更新履歴

- 2025-11-12: 初版作成（既存のFreeContentフィールドを使用する方針を確認）
