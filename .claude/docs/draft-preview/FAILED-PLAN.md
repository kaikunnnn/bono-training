# 失敗した実装計画

## 当初の計画（シンプルだと思っていた）

### Phase 1: perspective オプションのみ

```typescript
// src/lib/sanity.ts の変更のみ
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

**期待**: 1ファイルの変更で、開発環境では下書きが見え、本番では公開済みのみ

**現実**:
- 新規下書きは見える
- 既存公開コンテンツを下書きに戻せない（参照エラー）

---

## 急遽追加した計画: status フィールド

### 変更ファイル一覧

#### 1. スキーマ追加

**article.ts, lesson.ts, quest.ts**:
```typescript
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
```

#### 2. フィルター関数

**src/lib/sanity.ts**:
```typescript
const isDevelopment = import.meta.env.DEV;

export function statusFilter(prefix: string = ''): string {
  if (isDevelopment) {
    return '';
  }
  const fieldPath = prefix ? `${prefix}.status` : 'status';
  return `&& (${fieldPath} == "published" || !defined(${fieldPath}))`;
}
```

#### 3. 各クエリの修正

**LessonDetail.tsx**:
```groq
"quests": quests[]-> {
  // ...
  "articles": articles[]->[_id != null ${statusFilter()}] {
    // ...
  }
}
```

**getArticleWithContext (sanity.ts)**:
```groq
"questInfo": *[_type == "quest" && references(^._id) ${statusFilter()}][0] {
  "articles": articles[]-> [_id != null ${statusFilter()}] {
    // ...
  },
  "lessonInfo": lesson-> {
    "quests": quests[]-> [_id != null ${statusFilter()}] {
      "articles": articles[]-> [_id != null ${statusFilter()}] {
        // ...
      }
    }
  }
}
```

---

## 何が問題だったか

### 問題1: フィルタの適用タイミング

GROQでは `articles[]->` の参照解決後にフィルタが適用される。
しかし、参照解決の時点で存在しないドキュメントは**null**として配列に残る。

```
// 期待した動作
articles: [article1, article3]  // article2は除外

// 実際の動作
articles: [article1, null, article3]  // article2はnullとして残る
```

### 問題2: ネストの深さ

```
lesson
  └── quests[]->
        └── articles[]->
              └── (参照)
```

4階層のネストがあり、各レベルでnullが発生する可能性がある。
全ての階層でnullチェックを追加しても、どこかで漏れが発生した。

### 問題3: 既存データとの互換性

既存のドキュメントには`status`フィールドがない。
`!defined(status)` で対応しようとしたが、クエリの複雑さが増し、予期しない動作を引き起こした。

---

## 時系列

1. **perspective オプション追加** → 動作確認OK
2. **ユーザーがUnpublish試行** → 参照エラー発生
3. **status フィールド追加を決定**
4. **スキーマ修正** → デプロイ
5. **クエリにstatusFilter追加** → QuestCard.tsxでエラー
6. **nullチェック追加** → ArticleDetail.tsxでエラー
7. **さらにnullチェック追加** → ArticleSideNav.tsxでエラー
8. **さらに修正** → レッスン一覧が表示されなくなる
9. **全て元に戻す**

---

## 教訓

1. **データモデルの変更は慎重に**
   - 特に参照関係があるドキュメントは影響範囲が広い

2. **GROQの動作を理解してから実装**
   - フィルタリングの挙動（nullが残る）を事前に検証すべきだった

3. **段階的にテスト**
   - 一気に全ファイルを修正せず、1つずつ確認すべきだった

4. **バックアップを取る**
   - 大きな変更前にブランチを切るべきだった
