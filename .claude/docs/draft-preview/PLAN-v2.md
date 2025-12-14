# 下書きプレビュー機能 実装計画 v2

**作成日**: 2025-12-12
**ステータス**: 計画中

---

## 前回の失敗の原因

### 根本的な問題

```
Lesson → Quest → Article の参照関係
```

1. **GROQの仕様**: 参照解決(`articles[]->`)でフィルタすると、条件に合わないドキュメントが**nullとして配列に残る**
2. **Sanityの仕様**: 参照されているドキュメントはUnpublishできない
3. **設計の問題**: 記事の公開/非公開を制御しようとしても、Quest/Lessonとの参照が切れない

### 前回試したアプローチの問題点

| アプローチ | 問題 |
|-----------|------|
| `perspective: previewDrafts` | 参照があるドキュメントはUnpublishできない |
| `status`フィールド追加 | nullが配列に残り、コンポーネントがクラッシュ |
| nullチェック追加 | 対応箇所が多すぎて、どこかで漏れる |

---

## 新しいアプローチ: Lessonレベルでの制御

### 考え方

記事単位ではなく、**Lessonまるごと**で公開/非公開を制御する。

```
✅ Lesson (status: draft)
   └── Quest（Lessonがdraftなら自動的に非表示）
       └── Article（Lessonがdraftなら自動的に非表示）

✅ Lesson (status: published)
   └── Quest（すべて表示）
       └── Article（すべて表示）
```

### なぜこれが良いのか

1. **参照関係を壊さない**: Quest/Articleの参照はそのまま
2. **フィルタが単純**: Lessonにだけstatusフィールドを追加
3. **既存クエリへの影響が最小**: LessonDetail, ArticleDetailのクエリは変更不要
4. **nullが発生しない**: 参照解決時にフィルタしない

---

## 実装計画

### Phase 1: Lessonにstatusフィールド追加

**変更ファイル**: `sanity-studio/schemaTypes/lesson.ts`

```typescript
defineField({
  name: 'status',
  title: '公開ステータス',
  type: 'string',
  options: {
    list: [
      { title: '下書き', value: 'draft' },
      { title: '公開', value: 'published' },
    ],
    layout: 'radio',
  },
  initialValue: 'draft',
  description: '下書き: 開発環境のみ表示 / 公開: 本番でも表示',
}),
```

### Phase 2: レッスン一覧のフィルタ

**変更ファイル**: `src/hooks/useLessons.ts`

```typescript
const isDev = import.meta.env.DEV;

const query = `*[_type == "lesson" ${isDev ? '' : '&& status == "published"'}] {
  // ... 既存のフィールド
}`;
```

**ポイント**:
- 開発環境では全レッスン表示（draft + published）
- 本番環境ではpublishedのみ

### Phase 3: レッスン詳細ページのフィルタ

**変更ファイル**: `src/pages/LessonDetail.tsx`

```typescript
const isDev = import.meta.env.DEV;

const query = `*[_type == "lesson" && slug.current == $slug ${isDev ? '' : '&& status == "published"'}][0] {
  // ... 既存のフィールド（変更なし）
}`;
```

**ポイント**:
- Quest/Articleへの参照解決は変更しない
- Lessonが取得できれば、その中のQuest/Articleはすべて表示

### Phase 4: 記事詳細ページのフィルタ

**変更ファイル**: `src/lib/sanity.ts` (getArticleWithContext)

```typescript
const isDev = import.meta.env.DEV;

// 記事からQuestを取得し、さらにLessonを取得
// Lessonのstatusがpublishedでなければ記事も表示しない
const articleQuery = `
  *[_type == "article" && slug.current == $slug][0] {
    // ... 既存のフィールド
    "questInfo": *[_type == "quest" && references(^._id)][0] {
      // ... 既存のフィールド
      "lessonInfo": lesson-> {
        // ... 既存のフィールド
        status  // ← これを追加
      }
    }
  }
`;

// 取得後にstatusをチェック
if (!isDev && article?.questInfo?.lessonInfo?.status !== 'published') {
  return null; // 非公開
}
```

### Phase 5: 既存データのマイグレーション

Sanity Studioで既存のLessonに`status: "published"`を設定。

---

## 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `sanity-studio/schemaTypes/lesson.ts` | statusフィールド追加 |
| `src/hooks/useLessons.ts` | クエリにstatusフィルタ追加 |
| `src/pages/LessonDetail.tsx` | クエリにstatusフィルタ追加 |
| `src/lib/sanity.ts` | getArticleWithContextでstatus取得&チェック |

**変更しないファイル**:
- `sanity-studio/schemaTypes/quest.ts` ← 変更なし
- `sanity-studio/schemaTypes/article.ts` ← 変更なし
- `src/components/**/*.tsx` ← 変更なし

---

## 開発フロー

### 新しいレッスンを作成する場合

1. Sanity Studioでレッスン作成（status: draft）
2. Quest、Articleを追加
3. ローカル開発環境で確認
4. OKなら status を published に変更
5. 本番にも表示される

### 既存レッスンを編集する場合

1. Sanity Studioで編集
2. 保存すれば即座にローカル/本番に反映（statusはそのまま）
3. もし大幅な変更をしたい場合は、新しいレッスンとして作成

---

## リスク評価

| リスク | 対策 |
|-------|------|
| 既存レッスンが消える | マイグレーションでstatus: publishedを設定 |
| 記事単位での制御ができない | Lessonまるごとの制御で十分か確認 |
| nullが発生する | 参照解決にフィルタを入れないので発生しない |

---

## 代替案: 記事単位で制御したい場合

もし記事単位で公開/非公開を制御したい場合は、以下のアプローチを検討：

### 案A: 参照解決を使わない別クエリ

```groq
"articles": *[_type == "article" && _id in ^.articles[]._ref && status == "published"] | order(articleNumber asc) {
  _id,
  title,
  slug
}
```

**メリット**: nullが発生しない
**デメリット**: 順序の保証が必要、クエリが複雑

### 案B: フロントエンドでフィルタ

```typescript
const publishedArticles = quest.articles?.filter(a => a && a.status === 'published') || [];
```

**メリット**: クエリ変更不要
**デメリット**: 全コンポーネントで対応が必要

---

## 質問事項

実装前に確認したいこと：

1. **Lessonまるごとでの公開制御で問題ないか？**
   - 「レッスンAの記事1だけ非公開」はできない
   - 「レッスンAまるごと非公開」はできる

2. **既存レッスンは全てpublishedにして良いか？**

3. **記事単位での制御が必要な場合、代替案A or Bのどちらが良いか？**
