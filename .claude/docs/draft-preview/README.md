# 下書きプレビュー機能 実装記録

**作成日**: 2025-12-12
**ステータス**: 実装失敗 → 全て元に戻した

---

## 概要

Sanity CMSで作成したコンテンツを、本番公開前にローカル環境でプレビューできる機能を実装しようとした。

### 要件

- **プレビュー場所**: ローカル開発環境のみ（localhost:5173）
- **対象コンテンツ**: lesson, quest, article 全て
- **本番環境**: 公開済みのみ表示（変更なし）
- **追加要件**: 一度公開したコンテンツを下書き状態に戻せること

---

## 試したアプローチ

### アプローチ1: Sanity `perspective` オプション

**内容**: Sanityの組み込み機能を使用

```typescript
// src/lib/sanity.ts
const isDevelopment = import.meta.env.DEV;

export const client = createClient({
  // ...
  useCdn: !isDevelopment,
  perspective: isDevelopment ? "previewDrafts" : "published",
  token: isDevelopment ? import.meta.env.VITE_SANITY_TOKEN : undefined,
});
```

**結果**:
- 新規の下書きは表示可能
- **問題**: 一度公開したコンテンツを「Unpublish」しようとすると、参照エラーが発生
  - Sanityでは他のドキュメントから参照されているドキュメントはUnpublishできない
  - lesson → quest → article の参照関係があるため、articleをUnpublishできない

### アプローチ2: カスタム `status` フィールド

**内容**: 各スキーマにstatusフィールドを追加し、GROQクエリでフィルタリング

```typescript
// スキーマに追加
{
  name: 'status',
  title: 'ステータス',
  type: 'string',
  options: {
    list: [
      { title: '下書き', value: 'draft' },
      { title: '公開', value: 'published' },
    ],
  },
  initialValue: 'draft',
}

// クエリでフィルタリング
const statusFilter = isDevelopment ? '' : '&& status == "published"';
```

**結果**:
- 複数のエラーが連鎖的に発生
- 最終的にサイトが正常に表示されなくなった

---

## 発生したエラーと原因

### エラー1: QuestCard.tsx:136

```
Cannot read properties of undefined (reading 'current')
→ article.slug.current が undefined
```

**原因**: statusフィルターにより、questの中のarticles配列にnullが含まれるようになった

### エラー2: ArticleDetail.tsx:37

```
Cannot read properties of null (reading 'slug')
→ quest.articles 内の article が null
```

**原因**: ネストされたGROQクエリで、フィルタされたarticleがnullとして返された

### エラー3: ArticleSideNav.tsx:69

```
Cannot read properties of null (reading 'articles')
→ quest.articles が null
```

**原因**: lessonInfo.quests 配列内のquestがnullになっていた

### 根本原因

```
lesson → quest → article の参照関係
```

GROQクエリでネストされた参照（`articles[]->`）にstatusフィルターを適用すると：

1. フィルタに合わないドキュメントが**nullとして返される**（配列から除外されるのではなく）
2. 親コンポーネントがnullを想定していないためエラー発生
3. 各所にnullチェックを追加しても、新たなエラーが発生
4. 最終的にデータ構造が壊れ、レッスン一覧が表示されなくなった

---

## 影響を受けたファイル

### スキーマ（sanity-studio）
- `sanity-studio/schemaTypes/article.ts`
- `sanity-studio/schemaTypes/lesson.ts`
- `sanity-studio/schemaTypes/quest.ts`

### フロントエンド
- `src/lib/sanity.ts`
- `src/pages/LessonDetail.tsx`
- `src/pages/ArticleDetail.tsx`
- `src/components/article/sidebar/ArticleSideNav.tsx`
- `src/components/lesson/QuestCard.tsx`
- `src/hooks/useLessons.ts`
- `src/services/lessons.ts`
- `src/services/bookmarks.ts`

---

## 学んだこと

### 1. Sanityの参照制約

- Sanityでは参照されているドキュメントはUnpublishできない
- これはデータ整合性を保つための仕様

### 2. GROQの参照解決とフィルタリング

- `articles[]->` のような参照解決で、フィルタ条件に合わないドキュメントは**nullになる**
- 配列から除外されるわけではない
- `[_id != null]` のようなフィルタを追加しても、タイミングによっては効果がない

### 3. 変更の影響範囲

- データモデルの変更は、想像以上に広範囲に影響する
- 特にネストされた参照関係がある場合、1箇所の変更が連鎖的にエラーを引き起こす

---

## 次回実装時の推奨アプローチ

### オプション1: 完全に新しいドキュメントで管理

- 「公開用」と「下書き用」を別々のドキュメントとして管理
- 複雑だが、既存のデータ構造に影響しない

### オプション2: Sanity Studioのみでプレビュー

- Sanity Studioの「Preview」機能を使う
- フロントエンドは常に公開済みのみ表示
- 最もシンプルだが、実際のサイトでの見た目確認はできない

### オプション3: 別のプレビュー用エンドポイント

- `/preview/articles/:slug` のような別ルートを作成
- プレビュー専用のクライアントとクエリを使用
- 既存のルートには影響しない

### オプション4: 段階的な実装

1. まずarticleのみにstatusフィールドを追加
2. 全てのクエリで`defined()`と`.filter(Boolean)`を徹底的に使用
3. 動作確認後、quest、lessonに拡大

---

## 関連ファイル

- [失敗した計画書](./FAILED-PLAN.md)
- [GROQクエリの問題点](./GROQ-ISSUES.md)
