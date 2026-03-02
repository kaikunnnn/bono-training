# ユーザーアウトプット機能 実装計画

**作成日**: 2024-03-01
**ステータス**: 計画中

---

## 概要

15分フィードバック応募で投稿されたユーザーのアウトプット（ブログ記事等）を保存し、一覧表示およびレッスン/コースページで関連アウトプットとして表示する機能。

---

## 要件

| 項目 | 内容 |
|------|------|
| 保存先 | Sanity CMS |
| 保存データ | 記事URL、タイトル、OG画像、紐付けレッスン、投稿者情報 |
| 紐付け | レッスン（→ コース/ロードマップは自動判定） |
| 投稿元 | ユーザー投稿（フォーム） + 管理者追加（Studio） |
| 公開フロー | 承認制（管理者がStudioで公開ON） |
| 表示順序 | 管理者がStudioで並び替え可能 |

---

## データ設計

### Sanityスキーマ: `userOutput`

```typescript
// sanity-studio/schemaTypes/userOutput.ts
export default {
  name: 'userOutput',
  title: 'ユーザーアウトプット',
  type: 'document',
  fields: [
    // === 記事情報 ===
    {
      name: 'articleUrl',
      title: '記事URL',
      type: 'url',
      validation: (Rule) => Rule.required(),
    },
    {
      name: 'articleTitle',
      title: '記事タイトル',
      type: 'string',
      description: 'OGタイトルから自動取得、または手動入力',
    },
    {
      name: 'articleImage',
      title: '記事画像URL',
      type: 'url',
      description: 'OG画像から自動取得、または手動入力',
    },
    {
      name: 'articleDescription',
      title: '記事概要',
      type: 'text',
      rows: 3,
      description: 'OG descriptionから自動取得、または手動入力',
    },

    // === 紐付け ===
    {
      name: 'relatedLesson',
      title: '関連レッスン',
      type: 'reference',
      to: [{ type: 'lesson' }],
      validation: (Rule) => Rule.required(),
      description: 'このアウトプットが関連するレッスン',
    },

    // === 投稿者情報 ===
    {
      name: 'author',
      title: '投稿者',
      type: 'object',
      fields: [
        { name: 'userId', title: 'ユーザーID', type: 'string' },
        { name: 'displayName', title: '表示名', type: 'string' },
        { name: 'slackAccountName', title: 'Slackアカウント名', type: 'string' },
        { name: 'email', title: 'メールアドレス', type: 'string' },
      ],
    },

    // === メタ情報 ===
    {
      name: 'source',
      title: '登録元',
      type: 'string',
      options: {
        list: [
          { title: 'ユーザー投稿', value: 'user_submission' },
          { title: '管理者追加', value: 'admin_curated' },
        ],
      },
      initialValue: 'user_submission',
    },
    {
      name: 'submittedAt',
      title: '投稿日時',
      type: 'datetime',
    },
    {
      name: 'isPublished',
      title: '公開',
      type: 'boolean',
      initialValue: false,
      description: 'ONにすると一覧・レッスンページに表示されます',
    },
    {
      name: 'displayOrder',
      title: '表示順序',
      type: 'number',
      initialValue: 0,
      description: '数字が小さいほど上に表示',
    },

    // === 15分FB関連（オプション） ===
    {
      name: 'feedbackApply',
      title: '15分フィードバック応募情報',
      type: 'object',
      fields: [
        { name: 'bonoContent', title: '学んだBONOコンテンツ', type: 'string' },
        {
          name: 'checkedItems',
          title: '該当項目',
          type: 'array',
          of: [{ type: 'string' }],
        },
      ],
      hidden: ({ document }) => document?.source !== 'user_submission',
    },
  ],

  preview: {
    select: {
      title: 'articleTitle',
      subtitle: 'author.displayName',
      media: 'articleImage',
    },
  },

  orderings: [
    {
      title: '表示順序',
      name: 'displayOrderAsc',
      by: [{ field: 'displayOrder', direction: 'asc' }],
    },
    {
      title: '投稿日時（新しい順）',
      name: 'submittedAtDesc',
      by: [{ field: 'submittedAt', direction: 'desc' }],
    },
  ],
}
```

---

## 実装フェーズ

### Phase 1: データ保存基盤（まずこれ）

| タスク | ファイル | 内容 |
|--------|----------|------|
| 1.1 | `sanity-studio/schemaTypes/userOutput.ts` | スキーマ作成 |
| 1.2 | `sanity-studio/schemaTypes/index.ts` | スキーマ登録 |
| 1.3 | `api/feedback-apply/submit.ts` | Sanity保存処理を追加 |
| 1.4 | `src/lib/ogParser.ts` | OG情報取得ユーティリティ（API側で使用） |
| 1.5 | 環境変数 | `SANITY_WRITE_TOKEN` 設定 |

**Phase 1 完了条件**: 15分フィードバック応募 → Sanity Studioで確認できる

---

### Phase 2: フォーム改修

| タスク | ファイル | 内容 |
|--------|----------|------|
| 2.1 | `src/pages/feedback-apply/submit.tsx` | レッスン選択UIを追加 |
| 2.2 | `src/hooks/useLessons.ts` | レッスン一覧取得（既存を流用） |

**Phase 2 完了条件**: ユーザーがレッスンを選択して投稿できる

---

### Phase 3: 表示ページ

| タスク | ファイル | 内容 |
|--------|----------|------|
| 3.1 | `src/pages/outputs/index.tsx` | アウトプット一覧ページ |
| 3.2 | `src/components/outputs/OutputCard.tsx` | カード型表示コンポーネント |
| 3.3 | レッスン詳細ページ | 関連アウトプットセクション追加 |
| 3.4 | コース詳細ページ | 関連アウトプットセクション追加 |

**Phase 3 完了条件**: 一覧ページ・レッスンページでアウトプットが表示される

---

## API設計

### `api/feedback-apply/submit.ts` の変更

```typescript
// 現在: Slack通知のみ
// 変更後: Slack通知 + Sanity保存 + OG情報取得

export default async function handler(req, res) {
  // 1. バリデーション（既存）

  // 2. OG情報を取得（新規）
  const ogData = await fetchOgData(payload.articleUrl);

  // 3. Sanityに保存（新規）
  const result = await sanityClient.create({
    _type: 'userOutput',
    articleUrl: payload.articleUrl,
    articleTitle: ogData.title,
    articleImage: ogData.image,
    articleDescription: ogData.description,
    relatedLesson: { _type: 'reference', _ref: payload.lessonId },
    author: {
      userId: payload.userId,
      displayName: payload.slackAccountName,
      slackAccountName: payload.slackAccountName,
      email: payload.userEmail,
    },
    feedbackApply: {
      bonoContent: payload.bonoContent,
      checkedItems: payload.checkedItems,
    },
    source: 'user_submission',
    submittedAt: new Date().toISOString(),
    isPublished: false, // 承認制
  });

  // 4. Slack通知（既存）
  await sendSlackNotification(payload);

  // 5. レスポンス
  return res.status(200).json({ success: true, outputId: result._id });
}
```

---

## 表示クエリ

### 一覧ページ用

```groq
*[_type == "userOutput" && isPublished == true] | order(displayOrder asc, submittedAt desc) {
  _id,
  articleUrl,
  articleTitle,
  articleImage,
  author,
  submittedAt,
  "lesson": relatedLesson->{
    _id,
    title,
    slug,
    "course": *[_type == "course" && references(^._id)][0]{
      _id,
      title,
      slug
    }
  }
}
```

### レッスン詳細ページ用

```groq
*[_type == "userOutput" && isPublished == true && relatedLesson._ref == $lessonId] | order(displayOrder asc) {
  _id,
  articleUrl,
  articleTitle,
  articleImage,
  author,
  submittedAt
}
```

### コース詳細ページ用

```groq
// コースに含まれるレッスンのアウトプットを取得
*[_type == "userOutput" && isPublished == true && relatedLesson._ref in $lessonIds] | order(displayOrder asc) {
  _id,
  articleUrl,
  articleTitle,
  articleImage,
  author,
  submittedAt,
  "lesson": relatedLesson->{ title, slug }
}
```

---

## 必要な環境変数

| 変数名 | 用途 | 設定場所 |
|--------|------|----------|
| `SANITY_WRITE_TOKEN` | Sanity書き込み | `.env.local` + Vercel |

※ 質問機能と共通なので、既に設定済みなら追加不要

---

## ファイル構成（新規作成）

```
sanity-studio/schemaTypes/
└── userOutput.ts          # 新規

api/
└── feedback-apply/
    └── submit.ts          # 修正（Sanity保存追加）

src/
├── lib/
│   └── ogParser.ts        # 新規（OG情報取得）
├── pages/
│   └── outputs/
│       └── index.tsx      # 新規（一覧ページ）
└── components/
    └── outputs/
        └── OutputCard.tsx # 新規（カード）
```

---

## 次のアクション

Phase 1 から実装を開始しますか？

1. Sanityスキーマ作成
2. API修正（Sanity保存 + OG取得）
3. 環境変数設定
4. 動作確認

これで進めてよいですか？
