# GROQクエリの問題点

## 現在のデータ構造

```
Lesson
  ├── _id
  ├── title
  ├── quests[] → Quest への参照配列
  └── ...

Quest
  ├── _id
  ├── title
  ├── lesson → Lesson への参照
  ├── articles[] → Article への参照配列
  └── ...

Article
  ├── _id
  ├── title
  ├── slug
  └── ...
```

---

## 問題のあったクエリ

### LessonDetail.tsx のクエリ

```groq
*[_type == "lesson" && slug.current == $slug][0] {
  _id,
  title,
  "quests": quests[]-> {
    _id,
    title,
    "articles": articles[]-> {
      _id,
      title,
      slug
    }
  }
}
```

**statusフィルター追加後**:

```groq
*[_type == "lesson" && slug.current == $slug][0] {
  _id,
  title,
  "quests": quests[]-> {
    _id,
    title,
    "articles": articles[]->[status == "published"] {
      _id,
      title,
      slug
    }
  }
}
```

**問題**: `articles[]->` の解決時に、statusがdraftのarticleは**nullとして配列に残る**

```javascript
// 期待
articles: [
  { _id: "a1", title: "Article 1", slug: {...} },
  { _id: "a3", title: "Article 3", slug: {...} }
]

// 実際
articles: [
  { _id: "a1", title: "Article 1", slug: {...} },
  null,  // Article 2 がnullとして残る
  { _id: "a3", title: "Article 3", slug: {...} }
]
```

---

## getArticleWithContext のクエリ

```groq
*[_type == "article" && slug.current == $slug][0] {
  _id,
  title,
  "questInfo": *[_type == "quest" && references(^._id)][0] {
    _id,
    "articles": articles[]-> {
      _id,
      title,
      slug
    },
    "lessonInfo": lesson-> {
      _id,
      "quests": quests[]-> {
        _id,
        "articles": articles[]-> {
          _id,
          title,
          slug
        }
      }
    }
  }
}
```

**ネストの深さ**: 4階層

```
article
  └── questInfo (逆引き)
        ├── articles (参照解決)
        └── lessonInfo (参照解決)
              └── quests (参照解決)
                    └── articles (参照解決)
```

各階層でフィルタリングが必要になり、どこかでnullが残るとエラーになる。

---

## 試した解決策と結果

### 1. `[_id != null]` フィルタ

```groq
"articles": articles[]->[_id != null && status == "published"] {
  ...
}
```

**結果**: 一部は改善したが、全てのケースをカバーできなかった

### 2. `defined()` 関数

```groq
"articles": articles[]->[defined(_id) && status == "published"] {
  ...
}
```

**結果**: 同様に完全には解決しなかった

### 3. 後処理でのnullフィルタリング

```typescript
// フロントエンドでnullを除外
const filteredArticles = quest.articles?.filter(Boolean) || [];
```

**結果**: 一部は改善したが、TypeScriptの型とランタイムの実際の値が乖離し、別のエラーが発生

---

## 正しいアプローチ（推測）

### 方法A: 参照解決前にフィルタ

```groq
"articles": *[_type == "article" && _id in ^.articles[]._ref && status == "published"] {
  _id,
  title,
  slug
}
```

参照配列を直接解決するのではなく、別クエリとして取得することでnullを回避。

**デメリット**: クエリが複雑になり、順序が保証されない

### 方法B: coalesce でデフォルト値

```groq
"articles": articles[]-> {
  "_id": coalesce(_id, ""),
  "title": coalesce(title, ""),
  "slug": slug,
  "status": coalesce(status, "published")
}[status == "published" && _id != ""]
```

**デメリット**: 冗長で、パフォーマンスに影響する可能性

### 方法C: 別のプレビューシステム

- フロントエンドの通常ルートは変更しない
- プレビュー専用の別ルート（`/preview/*`）を作成
- プレビュールートでのみdraftを含むクエリを使用

**メリット**: 既存コードへの影響がない
**デメリット**: 実装が必要

---

## 参考: Sanity公式ドキュメント

### perspective オプション

```typescript
const client = createClient({
  // ...
  perspective: 'previewDrafts', // 下書きを優先表示
});
```

- `published`: 公開済みのみ（デフォルト）
- `previewDrafts`: 下書きを優先、なければ公開済み
- `raw`: 全てのドキュメント（バージョン別）

### フィルタリングの注意点

Sanityの公式ドキュメントより:
> When using reference arrays and dereferencing, documents that don't exist or are filtered out will result in `null` values in the array.

つまり、参照配列のフィルタリングでnullが残るのは**仕様**。
