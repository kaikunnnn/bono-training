# 下書きプレビュー機能 実装計画 v3（記事レベル制御）

**作成日**: 2025-12-13
**ステータス**: 計画承認待ち

---

## 概要

記事（Article）単位で公開/非公開を制御し、ローカル環境で下書きを確認できるようにする。

### 要件

- **制御単位**: Article（記事単位）
- **環境**: ローカル開発環境のみで下書き確認
- **本番**: 公開済み記事のみ表示
- **Unpublish対応**: Sanityの標準Unpublish機能が使えるようになる

---

## 前回の失敗の原因と解決策

### 原因

```groq
// この書き方だとUnpublish/draftの記事がnullになる
"articles": articles[]-> { ... }
```

### 解決策

```groq
// この書き方だとnullが発生しない（存在しないものは取得されない）
"articles": *[_type == "article" && _id in ^.articles[]._ref] { ... }
```

---

## 実装フェーズ

### Phase 1: Sanityクライアントの設定変更

**ファイル**: `src/lib/sanity.ts`

開発環境では `perspective: "previewDrafts"` を使用し、下書きドキュメントを取得可能にする。

```typescript
const isDevelopment = import.meta.env.DEV;

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || "2024-01-01",
  useCdn: !isDevelopment,
  perspective: isDevelopment ? "previewDrafts" : "published",
  token: isDevelopment ? import.meta.env.VITE_SANITY_TOKEN : undefined,
});
```

**必要な環境変数** (`.env.local`):
```bash
VITE_SANITY_TOKEN=sk...  # Viewer権限のトークン
```

---

### Phase 2: LessonDetail.tsx のクエリ修正

**ファイル**: `src/pages/LessonDetail.tsx`

Quest内のArticles取得方法を変更。

```groq
// Before（nullが発生する）
"articles": articles[]-> {
  _id, title, slug, ...
}

// After（nullが発生しない + 順序保持）
"articles": articles[]._ref,
"articlesData": *[_type == "article" && _id in ^.articles[]._ref] {
  _id, title, slug, thumbnailUrl, videoDuration, isPremium, articleNumber
}
```

フロントエンドで順序を復元：
```typescript
const orderedArticles = quest.articles
  .map(ref => quest.articlesData.find(a => a._id === ref))
  .filter(Boolean);
```

---

### Phase 3: getArticleWithContext のクエリ修正

**ファイル**: `src/lib/sanity.ts`

サイドナビ用のArticles取得を修正。

```groq
// questInfo内
"articles": articles[]._ref,
"articlesData": *[_type == "article" && _id in ^.articles[]._ref] {
  _id, title, slug, videoDuration, isPremium
}

// lessonInfo.quests内も同様
"quests": quests[]-> {
  _id, questNumber, title,
  "articles": articles[]._ref,
  "articlesData": *[_type == "article" && _id in ^.articles[]._ref] {
    _id, title, slug, videoDuration, isPremium
  }
}
```

---

### Phase 4: useLessons.ts のクエリ修正

**ファイル**: `src/hooks/useLessons.ts`

レッスン一覧ページ用（影響は少ないが念のため確認）。

---

### Phase 5: ArticleSideNav.tsx の修正

**ファイル**: `src/components/article/sidebar/ArticleSideNav.tsx`

データ構造の変更に対応。articlesDataから順序付きリストを生成。

---

### Phase 6: QuestCard.tsx の修正

**ファイル**: `src/components/lesson/QuestCard.tsx`

データ構造の変更に対応。

---

## 変更ファイル一覧

| Phase | ファイル | 変更内容 |
|-------|---------|---------|
| 1 | `src/lib/sanity.ts` | perspective設定追加 |
| 2 | `src/pages/LessonDetail.tsx` | クエリ修正 |
| 3 | `src/lib/sanity.ts` | getArticleWithContext修正 |
| 4 | `src/hooks/useLessons.ts` | クエリ確認・修正 |
| 5 | `src/components/article/sidebar/ArticleSideNav.tsx` | データ構造対応 |
| 6 | `src/components/lesson/QuestCard.tsx` | データ構造対応 |

---

## テスト計画

### Phase 1完了後

- [ ] ローカルで下書き記事が表示されることを確認
- [ ] 本番ビルド（`npm run build && npm run preview`）で下書きが表示されないことを確認

### Phase 2-6完了後

- [ ] 記事をUnpublishしてもエラーが出ないことを確認
- [ ] Unpublishした記事がローカルでは表示されることを確認
- [ ] Unpublishした記事が本番では表示されないことを確認
- [ ] サイドナビに正しく記事が表示されることを確認
- [ ] 記事の順序が正しいことを確認

---

## ロールバック計画

問題が発生した場合：

```bash
git restore src/lib/sanity.ts src/pages/LessonDetail.tsx src/hooks/useLessons.ts src/components/article/sidebar/ArticleSideNav.tsx src/components/lesson/QuestCard.tsx
```

---

## 実装順序

1. **Phase 1** を実装してローカルで動作確認
2. **Phase 2** を実装してLessonDetailで動作確認
3. **Phase 3** を実装してArticleDetailで動作確認
4. **Phase 4-6** を実装して全体動作確認
5. **テスト** を実行
6. **コミット**

各Phaseごとに動作確認し、問題があれば即座にロールバック。

---

## 見積もり工数

| Phase | 工数 |
|-------|------|
| Phase 1 | 10分 |
| Phase 2 | 30分 |
| Phase 3 | 30分 |
| Phase 4-6 | 30分 |
| テスト | 20分 |
| **合計** | **約2時間** |

---

## 承認後のアクション

1. この計画を承認してもらう
2. Phase 1から順番に実装
3. 各Phaseで動作確認
4. 完了後にコミット
