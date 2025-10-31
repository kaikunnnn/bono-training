# レッスンページの作成

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ✅ 1. レッスン一覧ページ

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[x] 完了

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2. レッスン詳細ページ（Phase 1: 基本 MVP - Sanity CMS 版）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### 実装方針

- **Sanity CMS でコンテンツ管理**（最初から本番環境を想定）
- Phase 1 では進捗トラッキングなし（静的表示のみ）
- URL: `/lessons/[slug]`
- 表示要素: Hero、概要、目的、クエスト一覧
- Vimeo 動画対応を含む

### 技術スタック

- **Sanity CMS**: コンテンツ管理
- **Sanity Studio**: 管理画面（ブラウザベース）
- **@sanity/client**: データ取得
- **@sanity/image-url**: 画像最適化
- **GROQ**: クエリ言語（GraphQL ライク）

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🧪 Phase 1-A: Sanity 体験・検証（まず触ってみる）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

**目的:** 本格実装の前に、Sanity の管理画面とデータフローを体験して、使い勝手を確認する

**所要時間:** 30 分〜1 時間

**成果物:**

- Sanity Studio 管理画面でデータ追加・編集できる
- フロントエンドで Sanity からデータ取得・表示できる
- Sanity の雰囲気が掴める

---

### Step 1: 最小限の Sanity プロジェクト作成

**1-1. Sanity CLI インストールとログイン**

```bash
# グローバルインストール
npm install -g @sanity/cli

# Sanityにログイン（Google/GitHubアカウントで可能）
sanity login
```

**1-2. Sanity プロジェクト作成**

```bash
# プロジェクトルートで実行
cd /Users/kaitakumi/Documents/bono-training

# Sanityプロジェクト初期化
sanity init
```

**対話形式の質問に答える:**

```
? Select project to use: Create new project
? Your project name: bono-training-cms
? Use the default dataset configuration? Yes
? Project output path: sanity-studio
? Select project template: Clean project with no predefined schemas
? Package manager to use for installing dependencies? npm
```

**1-3. Sanity Studio ディレクトリに移動**

```bash
cd sanity-studio
ls
```

→ 以下のファイルが生成されていることを確認:

- `sanity.config.ts`
- `schemas/`
- `package.json`

---

### Step 2: シンプルなスキーマ作成（テスト用レッスン）

まずは 1 つのシンプルなスキーマで体験します。

**作成ファイル:** `sanity-studio/schemas/lesson.ts`

```typescript
import { defineType, defineField } from "sanity";

export default defineType({
  name: "lesson",
  title: "レッスン",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "説明",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "coverImage",
      title: "カバー画像",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "category",
      title: "カテゴリ",
      type: "string",
      options: {
        list: [
          { title: "情報設計", value: "ia" },
          { title: "UI", value: "ui" },
          { title: "UX", value: "ux" },
        ],
      },
    }),
    defineField({
      name: "isPremium",
      title: "有料レッスン",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      category: "category",
      isPremium: "isPremium",
    },
    prepare({ title, media, category, isPremium }) {
      return {
        title,
        media,
        subtitle: `${category || "未分類"}${isPremium ? " 🔒" : ""}`,
      };
    },
  },
});
```

**更新ファイル:** `sanity-studio/schemas/index.ts`

```typescript
import lesson from "./lesson";

export const schemaTypes = [lesson];
```

---

### Step 3: Sanity Studio 起動して管理画面を見る

**3-1. Studio 起動**

```bash
cd sanity-studio
npm run dev
```

**3-2. ブラウザでアクセス**

`http://localhost:3333` を開く

→ **Sanity Studio 管理画面が表示される**

**画面構成:**

- 左サイドバー: 「レッスン」が表示されている
- メインエリア: ドキュメント一覧（最初は空）

**3-3. データ追加体験**

1. 「レッスン」をクリック
2. 右上の「＋作成」ボタンをクリック
3. フォームが表示される:
   - タイトル: `ゼロからはじめるUI情報設計`
   - スラッグ: 「Generate」ボタンをクリック → 自動生成される
   - 説明: `情報設計の基礎を学びます`
   - カバー画像: 任意の画像をドラッグ&ドロップ（またはスキップ）
   - カテゴリ: `情報設計`を選択
   - 有料レッスン: チェックなし
4. 右下の「Publish」ボタンをクリック

→ **データが保存される！**

**3-4. 編集体験**

- 保存したレッスンをクリック
- タイトルを変更してみる
- 「Publish」をクリック → 即座に反映

**3-5. 画像アップロード体験（オプション）**

- カバー画像フィールドにドラッグ&ドロップ
- Hotspot（重要領域）を設定できる
- 自動的に CDN にアップロードされる

→ **ここまでで、Sanity の管理画面の使い勝手を確認できます**

---

### Step 4: フロントエンドでデータ取得

Sanity からデータを取得して、フロントエンドで表示してみます。

**4-1. Sanity Client 依存関係インストール**

```bash
# メインプロジェクトルートに戻る
cd /Users/kaitakumi/Documents/bono-training

# Sanity Clientをインストール
npm install @sanity/client @sanity/image-url
```

**4-2. 環境変数設定**

**作成ファイル:** `.env.local`

```bash
# Sanity Project IDを取得
cd sanity-studio
sanity manage
```

→ ブラウザで管理画面が開く → 「Settings」→「Project ID」をコピー

`.env.local` に追加:

```bash
VITE_SANITY_PROJECT_ID=your_project_id_here
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
```

**4-3. Sanity Client ファイル作成**

**作成ファイル:** `src/lib/sanity.ts`

```typescript
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || "2024-01-01",
  useCdn: true,
});

const builder = imageUrlBuilder(client);

export function urlFor(source: any) {
  return builder.image(source);
}
```

**4-4. テストページ作成**

**作成ファイル:** `src/pages/SanityTest.tsx`

```typescript
import React, { useState, useEffect } from "react";
import { client, urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";

interface TestLesson {
  _id: string;
  title: string;
  slug: { current: string };
  description?: string;
  coverImage?: any;
  category?: string;
  isPremium: boolean;
}

const SanityTest: React.FC = () => {
  const [lessons, setLessons] = useState<TestLesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = `*[_type == "lesson"] {
      _id,
      title,
      slug,
      description,
      coverImage,
      category,
      isPremium
    }`;

    client
      .fetch(query)
      .then((data) => {
        setLessons(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Sanityテスト</h1>
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <h1 className="text-2xl font-bold mb-4">Sanityテスト</h1>
          <p className="text-red-600">エラー: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8">
        <h1 className="text-2xl font-bold mb-6">Sanityテスト</h1>

        {lessons.length === 0 ? (
          <p>レッスンがありません。Sanity Studioでデータを追加してください。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {lessons.map((lesson) => (
              <div
                key={lesson._id}
                className="border rounded-lg p-4 shadow-sm hover:shadow-md transition"
              >
                {lesson.coverImage && (
                  <img
                    src={urlFor(lesson.coverImage).width(400).height(300).url()}
                    alt={lesson.title}
                    className="w-full h-48 object-cover rounded mb-4"
                  />
                )}
                <h2 className="text-xl font-bold mb-2">
                  {lesson.title}
                  {lesson.isPremium && <span className="ml-2">🔒</span>}
                </h2>
                <p className="text-sm text-gray-600 mb-2">{lesson.category}</p>
                <p className="text-gray-700">{lesson.description}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded">
          <h2 className="font-bold mb-2">次のステップ:</h2>
          <ol className="list-decimal list-inside space-y-1">
            <li>Sanity Studioでデータを追加・編集してみる</li>
            <li>このページをリロードして反映を確認</li>
            <li>画像アップロード、カテゴリ変更などを試す</li>
            <li>使い勝手が良ければ本実装に進む</li>
          </ol>
        </div>
      </div>
    </Layout>
  );
};

export default SanityTest;
```

**4-5. ルート追加**

**更新ファイル:** `src/App.tsx`

```typescript
import SanityTest from "./pages/SanityTest";

// ルート追加
<Route path="/sanity-test" element={<SanityTest />} />;
```

---

### Step 5: 動作確認

**5-1. 開発サーバー起動**

```bash
npm run dev
```

**5-2. テストページにアクセス**

`http://localhost:5173/sanity-test` を開く

**確認ポイント:**

- ✅ Sanity Studio で追加したデータが表示される
- ✅ 画像が Sanity CDN から配信される
- ✅ カテゴリ、有料フラグが正しく表示される

**5-3. リアルタイム更新を体験**

1. Sanity Studio（`http://localhost:3333`）を開く
2. レッスンのタイトルを変更 → Publish
3. フロントエンド（`http://localhost:5173/sanity-test`）をリロード
4. 変更が反映される！

**5-4. 画像管理を体験**

1. Sanity Studio でカバー画像を追加/変更
2. フロントエンドで自動的に最適化された画像が表示される
3. `urlFor().width(400).height(300)` で動的にサイズ変更できることを確認

---

### Phase 1-A 中間チェックリスト

- [x] Sanity CLI をインストールし、プロジェクト作成できた
- [x] Sanity Studio（`http://localhost:3333`）にアクセスできた
- [x] 管理画面でデータを追加・編集できた
- [x] 画像をアップロードできた
- [x] フロントエンド（`/sanity-test`）でデータが表示された
- [x] Sanity Studio での編集がフロントエンドに反映された
- [x] CORS設定が完了し、データ取得ができた

**✅ ここまでで基本的な使い方は確認できました！**

---

### Step 6: 記事コンテンツスキーマ作成（長文対応）

Sanity採用の判断で最も重要な「長文入力の快適さ」を確認するため、記事スキーマを作成します。

**目的:**
- 長文コンテンツの入力体験
- Canvas連携の試用
- レッスンと記事の関連付け

**6-1. article スキーマ作成**

**作成ファイル:** `sanity-studio/schemaTypes/article.ts`

```typescript
import { defineType, defineField } from "sanity";

export default defineType({
  name: "article",
  title: "記事",
  type: "document",
  options: {
    canvasApp: {
      exclude: false, // Canvasで使用可能に
    },
  },
  fields: [
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "title",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "要約",
      type: "text",
      description: "記事の短い要約（一覧ページで表示）",
      rows: 3,
      validation: (Rule) => Rule.max(200),
    }),
    defineField({
      name: "coverImage",
      title: "カバー画像",
      type: "image",
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: "content",
      title: "記事本文",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "太字", value: "strong" },
              { title: "斜体", value: "em" },
              { title: "コード", value: "code" },
            ],
            annotations: [
              {
                title: "リンク",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
          fields: [
            {
              name: "alt",
              type: "string",
              title: "代替テキスト",
            },
            {
              name: "caption",
              type: "string",
              title: "キャプション",
            },
          ],
        },
      ],
      options: {
        canvasApp: {
          purpose: "記事のメインコンテンツ。見出し、段落、画像、リンクを含む長文記事",
        },
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "relatedLesson",
      title: "関連レッスン",
      type: "reference",
      to: [{ type: "lesson" }],
      description: "この記事に関連するレッスン",
    }),
    defineField({
      name: "publishedAt",
      title: "公開日",
      type: "datetime",
      initialValue: () => new Date().toISOString(),
    }),
    defineField({
      name: "author",
      title: "著者",
      type: "string",
    }),
    defineField({
      name: "tags",
      title: "タグ",
      type: "array",
      of: [{ type: "string" }],
      options: {
        layout: "tags",
      },
    }),
    defineField({
      name: "isPremium",
      title: "有料記事",
      type: "boolean",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      author: "author",
      isPremium: "isPremium",
    },
    prepare({ title, media, author, isPremium }) {
      return {
        title,
        media,
        subtitle: `${author || "著者未設定"}${isPremium ? " 🔒" : ""}`,
      };
    },
  },
});
```

**6-2. スキーマをエクスポート**

**更新ファイル:** `sanity-studio/schemaTypes/index.ts`

```typescript
import lesson from "./lesson";
import article from "./article";

export const schemaTypes = [lesson, article];
```

**6-3. lesson スキーマに関連記事フィールド追加**

**更新ファイル:** `sanity-studio/schemaTypes/lesson.ts`

最後のフィールドとして以下を追加:

```typescript
defineField({
  name: "relatedArticles",
  title: "関連記事",
  type: "array",
  of: [{ type: "reference", to: [{ type: "article" }] }],
  description: "このレッスンに関連する記事",
}),
```

**6-4. Studioを再起動**

```bash
# Ctrl+C でStudioを停止
# 再起動
cd sanity-studio
npm run dev
```

→ `http://localhost:3333` で「記事」メニューが表示される

---

### Step 7: Canvas連携の設定（長文執筆体験のため）

Canvasで記事を執筆できるようにするため、Studioをアップデートしてdeployします。

**7-1. Studio バージョンアップ**

```bash
cd sanity-studio
npm install sanity@latest
```

**7-2. Studioをデプロイ（スキーマをクラウドに同期）**

```bash
npx sanity deploy
```

対話形式の質問:
```
? Studio hostname (leave empty for default): （Enterでスキップ）
```

→ デプロイ完了後、`https://your-project.sanity.studio` のURLが表示される

**7-3. Canvas で記事執筆テスト**

1. `https://www.sanity.io/@oGe8pMXOb/canvas` にアクセス
2. 新規ドキュメント作成
3. 長文を自由に書いてみる
4. AIアシスタント（Ghostwriter）を試してみる
5. Notes機能を試す（Context, Fact, Style, Inspiration）

**7-4. Canvas → Studio へContent Mapping**

1. Canvas で記事を書き終えたら
2. 右上の「Map to Studio」ボタンをクリック
3. `article` スキーマを選択
4. AIが自動的にフィールドにマッピング
5. Studioで確認・編集

---

### Step 8: Studioで直接長文記事を作成（Canvas比較用）

Canvas と Studio の両方で記事作成を体験して比較します。

**8-1. Studioで記事作成**

1. `http://localhost:3333` にアクセス
2. 「記事」→「新規作成」
3. 以下の内容で記事を作成:

```
タイトル: 情報設計の基礎知識
スラッグ: information-architecture-basics (Generate)
要約: 情報設計の基本概念とUIデザインへの応用方法を解説します
カバー画像: 任意の画像をアップロード
記事本文: ← ここで長文入力を試す

【記事本文のサンプル構成】
- H2: 情報設計とは
  - 段落: 長文テキスト（200-300文字）
  - 画像挿入
- H2: 4つの基本原則
  - 段落: 説明文
  - H3: 組織化
    - 段落: 詳細説明
  - H3: ラベリング
    - 段落: 詳細説明
  - 画像挿入
- H2: 実践方法
  - 段落: まとめ
  - リンク挿入

関連レッスン: 「ゼロから始めるUI情報設計」を選択
公開日: （自動設定）
著者: あなたの名前
タグ: 情報設計, UI, 基礎
```

4. 「Publish」をクリック

**8-2. 長文入力の使い心地チェック**

- [ ] 見出しの追加がスムーズか
- [ ] 段落の編集がしやすいか
- [ ] 画像の挿入が簡単か
- [ ] リンクの追加が直感的か
- [ ] プレビューが見やすいか
- [ ] 全体的な書き心地

---

### Step 9: レッスンに関連記事を設定

レッスンと記事の関連付けを体験します。

**9-1. 既存レッスンに関連記事を追加**

1. Studio で「レッスン」を開く
2. 「ゼロから始めるUI情報設計」をクリック
3. 「関連記事」フィールドで、作成した記事を選択
4. 「Publish」

**9-2. 記事からレッスンへの参照も確認**

- 記事の「関連レッスン」フィールドにレッスンが設定されているか確認

→ **双方向の関連付けが完成**

---

### Step 10: フロントエンドで記事表示

記事一覧と詳細ページを簡易実装して、レッスンとの連携を確認します。

**10-1. 記事一覧コンポーネント作成**

**作成ファイル:** `src/pages/SanityArticles.tsx`

```typescript
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { client, urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";

interface TestArticle {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  coverImage?: any;
  author?: string;
  publishedAt?: string;
  isPremium: boolean;
}

const SanityArticles: React.FC = () => {
  const [articles, setArticles] = useState<TestArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = `*[_type == "article"] | order(publishedAt desc) {
      _id,
      title,
      slug,
      excerpt,
      coverImage,
      author,
      publishedAt,
      isPremium
    }`;

    client
      .fetch(query)
      .then((data) => {
        setArticles(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="p-8">
          <p className="text-red-600">エラー: {error}</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-8 max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">記事一覧</h1>

        {articles.length === 0 ? (
          <p>記事がありません。</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {articles.map((article) => (
              <Link
                key={article._id}
                to={`/sanity-articles/${article.slug.current}`}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {article.coverImage && (
                  <img
                    src={urlFor(article.coverImage).width(400).height(250).url()}
                    alt={article.title}
                    className="w-full h-48 object-cover"
                  />
                )}
                <div className="p-4">
                  <h2 className="text-xl font-bold mb-2">
                    {article.title}
                    {article.isPremium && <span className="ml-2">🔒</span>}
                  </h2>
                  {article.excerpt && (
                    <p className="text-gray-600 text-sm mb-2">{article.excerpt}</p>
                  )}
                  {article.author && (
                    <p className="text-gray-500 text-xs">by {article.author}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SanityArticles;
```

**10-2. 記事詳細ページ作成**

**作成ファイル:** `src/pages/SanityArticleDetail.tsx`

```typescript
import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { client, urlFor } from "@/lib/sanity";
import Layout from "@/components/layout/Layout";

interface TestArticle {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  coverImage?: any;
  content: any[];
  author?: string;
  publishedAt?: string;
  tags?: string[];
  relatedLesson?: {
    title: string;
    slug: { current: string };
  };
}

const SanityArticleDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<TestArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const query = `*[_type == "article" && slug.current == $slug][0] {
      _id,
      title,
      slug,
      excerpt,
      coverImage,
      content,
      author,
      publishedAt,
      tags,
      "relatedLesson": relatedLesson-> {
        title,
        "slug": slug.current
      }
    }`;

    client
      .fetch(query, { slug })
      .then((data) => {
        setArticle(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <div className="p-8">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error || !article) {
    return (
      <Layout>
        <div className="p-8">
          <p className="text-red-600">記事が見つかりませんでした</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="max-w-3xl mx-auto p-8">
        {/* ヘッダー */}
        <header className="mb-8">
          <h1 className="text-4xl font-bold mb-4">{article.title}</h1>
          {article.excerpt && (
            <p className="text-xl text-gray-600 mb-4">{article.excerpt}</p>
          )}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            {article.author && <span>by {article.author}</span>}
            {article.publishedAt && (
              <span>{new Date(article.publishedAt).toLocaleDateString("ja-JP")}</span>
            )}
          </div>
          {article.tags && article.tags.length > 0 && (
            <div className="flex gap-2 mt-4">
              {article.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* カバー画像 */}
        {article.coverImage && (
          <img
            src={urlFor(article.coverImage).width(800).url()}
            alt={article.title}
            className="w-full rounded-lg mb-8"
          />
        )}

        {/* 本文 */}
        <div className="prose prose-lg max-w-none">
          {article.content.map((block: any, index: number) => {
            // 画像ブロック
            if (block._type === "image") {
              return (
                <figure key={index} className="my-8">
                  <img
                    src={urlFor(block).width(800).url()}
                    alt={block.alt || ""}
                    className="w-full rounded"
                  />
                  {block.caption && (
                    <figcaption className="text-sm text-gray-600 mt-2 text-center">
                      {block.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            // テキストブロック
            if (block._type === "block") {
              const text = block.children?.map((child: any) => child.text).join("") || "";

              switch (block.style) {
                case "h2":
                  return (
                    <h2 key={index} className="text-3xl font-bold mt-12 mb-4">
                      {text}
                    </h2>
                  );
                case "h3":
                  return (
                    <h3 key={index} className="text-2xl font-bold mt-8 mb-3">
                      {text}
                    </h3>
                  );
                case "blockquote":
                  return (
                    <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-6">
                      {text}
                    </blockquote>
                  );
                default:
                  return (
                    <p key={index} className="mb-4 leading-relaxed text-gray-800">
                      {text}
                    </p>
                  );
              }
            }

            return null;
          })}
        </div>

        {/* 関連レッスン */}
        {article.relatedLesson && (
          <div className="mt-12 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-bold mb-3">関連レッスン</h2>
            <Link
              to={`/sanity-test`}
              className="text-blue-600 hover:underline font-medium"
            >
              {article.relatedLesson.title} →
            </Link>
          </div>
        )}

        {/* 戻るリンク */}
        <div className="mt-8">
          <Link to="/sanity-articles" className="text-blue-600 hover:underline">
            ← 記事一覧に戻る
          </Link>
        </div>
      </article>
    </Layout>
  );
};

export default SanityArticleDetail;
```

**10-3. ルート追加**

**更新ファイル:** `src/App.tsx`

```typescript
import SanityArticles from "./pages/SanityArticles";
import SanityArticleDetail from "./pages/SanityArticleDetail";

// ルート追加
<Route path="/sanity-articles" element={<SanityArticles />} />
<Route path="/sanity-articles/:slug" element={<SanityArticleDetail />} />
```

**10-4. レッスンページに関連記事表示を追加**

**更新ファイル:** `src/pages/SanityTest.tsx`

GROQクエリを更新して関連記事も取得:

```typescript
const query = `*[_type == "lesson"] {
  _id,
  title,
  slug,
  description,
  coverImage,
  category,
  isPremium,
  "relatedArticles": relatedArticles[]-> {
    title,
    "slug": slug.current,
    excerpt
  }
}`;
```

レッスンカード内に関連記事リンクを追加:

```tsx
{lesson.relatedArticles && lesson.relatedArticles.length > 0 && (
  <div className="mt-4 pt-4 border-t">
    <p className="text-sm font-medium text-gray-700 mb-2">関連記事:</p>
    {lesson.relatedArticles.map((article: any) => (
      <Link
        key={article.slug}
        to={`/sanity-articles/${article.slug}`}
        className="text-sm text-blue-600 hover:underline block"
      >
        {article.title}
      </Link>
    ))}
  </div>
)}
```

---

### Step 11: 最終動作確認とSanity採用判定

すべての実装が完了したら、体験をもとにSanity採用を判断します。

**11-1. 動作確認フロー**

1. **レッスン一覧** (`/sanity-test`)
   - レッスンカードが表示される
   - 関連記事リンクが表示される

2. **記事一覧** (`/sanity-articles`)
   - 記事カードが表示される
   - カバー画像、要約、著者が表示される

3. **記事詳細** (`/sanity-articles/:slug`)
   - 長文記事が正しく表示される
   - 見出し階層が適切
   - 画像が埋め込まれている
   - 関連レッスンへのリンクが機能する

4. **連携確認**
   - レッスン → 記事へのリンク
   - 記事 → レッスンへのリンク
   - 双方向の行き来がスムーズ

**11-2. 判定チェックリスト**

以下の項目を実際に体験して評価してください:

#### ✅ 最重要: 長文入力の快適さ

**Studioでの執筆:**
- [ ] ブロックエディターは使いやすいか？
- [ ] 見出し・段落の追加がスムーズか？
- [ ] 画像挿入が直感的か？
- [ ] リンク追加が簡単か？
- [ ] 全体的な書き心地は良いか？

**Canvasでの執筆（試した場合）:**
- [ ] AIアシスタント（Ghostwriter）は役立つか？
- [ ] Notes機能は使いやすいか？
- [ ] 執筆に集中できるUIか？
- [ ] Content Mappingは正確か？
- [ ] Studio vs Canvas どちらが好みか？

#### 画像アップロード

- [ ] ドラッグ&ドロップが簡単か？
- [ ] Hotspot設定は便利か？
- [ ] 画像管理は直感的か？
- [ ] CDN配信は速いか？

#### レッスンと記事の関連付け

- [ ] reference fieldの設定は簡単か？
- [ ] 関連コンテンツの選択は直感的か？
- [ ] フロントエンドでの表示は自然か？
- [ ] データの整合性は保たれているか？

#### 全体的な開発体験

- [ ] GROQクエリは書きやすいか？
- [ ] データ取得は速いか？
- [ ] スキーマ定義は理解しやすいか？
- [ ] Studioのカスタマイズは柔軟か？
- [ ] ドキュメントは充実しているか？

**11-3. 最終判断**

**✅ Sanity採用（Phase 1-Bへ進む）** の条件:
- 長文執筆が快適
- 画像管理が簡単
- 関連付けが直感的
- 全体的な開発体験が良好

**🤔 もう少し検討** の条件:
- 一部に不満があるが、許容範囲
- 別のCMSと比較したい
- 追加機能を試したい

**❌ Sanity不採用** の条件:
- 長文執筆が不便
- 学習コストが高すぎる
- パフォーマンスに問題
- 別のアプローチ（MDX等）の方が良さそう

---

### Phase 1-A 完了チェックリスト（拡張版）

#### 基本機能
- [x] Sanity CLI をインストールし、プロジェクト作成できた
- [x] Sanity Studio（`http://localhost:3333`）にアクセスできた
- [x] lesson スキーマでデータを追加・編集できた
- [x] 画像をアップロードできた
- [x] CORS設定が完了し、データ取得ができた

#### 記事機能（新規追加）
- [ ] article スキーマを作成した
- [ ] Studioで長文記事を作成した
- [ ] Canvas連携を設定した（deploy完了）
- [ ] Canvas で記事執筆を試した（オプション）
- [ ] 記事に画像を複数挿入した
- [ ] 見出し・段落・リンクを試した

#### 連携機能
- [ ] レッスンに関連記事を設定した
- [ ] 記事に関連レッスンを設定した
- [ ] フロントエンドでレッスン一覧を表示した
- [ ] フロントエンドで記事一覧を表示した
- [ ] 記事詳細ページで長文が正しく表示された
- [ ] レッスン↔記事の相互リンクが機能した

#### 判定
- [ ] 長文執筆の快適さを確認した
- [ ] 画像アップロードの簡単さを確認した
- [ ] 関連付けの直感性を確認した
- [ ] Sanity採用可否を決定した

**✅ すべて完了したら、Sanity採用判定が完了です！**

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 🚀 Phase 1-B: 本実装（Sanity で本格的に構築）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Phase 1-A で体験して、Sanity で進めることが決まったら、以下の本実装に入ります。

### 実装ステップ

#### Step 1: Sanity プロジェクトのセットアップ

**1-1. Sanity アカウント作成と CLI インストール**

```bash
# Sanity CLIをグローバルインストール
npm install -g @sanity/cli

# Sanityにログイン（ブラウザが開く）
sanity login

# 新規プロジェクト作成
sanity init
```

**プロジェクト作成時の選択:**

- Project name: `bono-training-cms`
- Dataset: `production`
- Project template: `Clean project with no predefined schemas`
- Package manager: `npm`

**1-2. Sanity ディレクトリ構成**

作成されるディレクトリ構造:

```
sanity-studio/
├── schemas/
│   ├── index.ts           # スキーマ統合
│   ├── lesson.ts          # レッスンスキーマ
│   ├── quest.ts           # クエストスキーマ
│   ├── content.ts         # コンテンツスキーマ
│   ├── category.ts        # カテゴリスキーマ
│   └── roadmap.ts         # ロードマップスキーマ
├── sanity.config.ts       # Sanity設定
└── package.json
```

**1-3. Sanity 依存関係をメインプロジェクトに追加**

```bash
# メインプロジェクトのルートで実行
npm install @sanity/client @sanity/image-url
npm install -D @sanity/types
```

---

#### Step 2: Sanity スキーマ定義

すべてのコンテンツタイプのスキーマを定義します。

**2-1. Category（カテゴリ）スキーマ**

**作成ファイル:** `sanity-studio/schemas/category.ts`

```typescript
import { defineType, defineField } from "sanity";

export default defineType({
  name: "category",
  title: "カテゴリ",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "カテゴリ名",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "name",
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "説明",
      type: "text",
    }),
  ],
});
```

---

**2-2. Roadmap（ロードマップ）スキーマ**

**作成ファイル:** `sanity-studio/schemas/roadmap.ts`

```typescript
import { defineType, defineField } from "sanity";

export default defineType({
  name: "roadmap",
  title: "ロードマップ",
  type: "document",
  fields: [
    defineField({
      name: "name",
      title: "ロードマップ名",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "name",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "level",
      title: "レベル",
      type: "string",
      description: "例: Lv0, Lv1, Lv2...",
    }),
    defineField({
      name: "description",
      title: "説明",
      type: "text",
    }),
  ],
});
```

---

**2-3. Content（コンテンツ）スキーマ**

**作成ファイル:** `sanity-studio/schemas/content.ts`

```typescript
import { defineType, defineField } from "sanity";

export default defineType({
  name: "content",
  title: "コンテンツ",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "type",
      title: "種別",
      type: "string",
      options: {
        list: [
          { title: "動画", value: "video" },
          { title: "記事", value: "article" },
        ],
        layout: "radio",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "vimeoUrl",
      title: "Vimeo URL",
      type: "url",
      description: "例: https://vimeo.com/123456789",
      hidden: ({ document }) => document?.type !== "video",
      validation: (Rule) =>
        Rule.custom((value, context) => {
          const type = (context.document as any)?.type;
          if (type === "video" && !value) {
            return "動画の場合はVimeo URLが必須です";
          }
          return true;
        }),
    }),
    defineField({
      name: "articleBody",
      title: "記事本文",
      type: "array",
      of: [
        {
          type: "block",
          styles: [
            { title: "Normal", value: "normal" },
            { title: "H2", value: "h2" },
            { title: "H3", value: "h3" },
            { title: "Quote", value: "blockquote" },
          ],
          marks: {
            decorators: [
              { title: "Strong", value: "strong" },
              { title: "Emphasis", value: "em" },
              { title: "Code", value: "code" },
            ],
            annotations: [
              {
                title: "URL",
                name: "link",
                type: "object",
                fields: [
                  {
                    title: "URL",
                    name: "href",
                    type: "url",
                  },
                ],
              },
            ],
          },
        },
        {
          type: "image",
          options: { hotspot: true },
        },
      ],
      hidden: ({ document }) => document?.type !== "article",
    }),
    defineField({
      name: "estTimeMins",
      title: "所要時間（分）",
      type: "number",
      validation: (Rule) => Rule.min(1).max(180),
    }),
    defineField({
      name: "isRequired",
      title: "必須コンテンツ",
      type: "boolean",
      description: "クエスト完了に必須かどうか",
      initialValue: true,
    }),
    defineField({
      name: "isPremium",
      title: "有料コンテンツ",
      type: "boolean",
      description: "プレミアム会員限定",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      type: "type",
      isPremium: "isPremium",
    },
    prepare({ title, type, isPremium }) {
      return {
        title,
        subtitle: `${type === "video" ? "🎬 動画" : "📄 記事"}${
          isPremium ? " 🔒 有料" : ""
        }`,
      };
    },
  },
});
```

---

**2-4. Quest（クエスト）スキーマ**

**作成ファイル:** `sanity-studio/schemas/quest.ts`

```typescript
import { defineType, defineField } from "sanity";

export default defineType({
  name: "quest",
  title: "クエスト",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "goal",
      title: "ゴール",
      type: "text",
      description: "このクエストで達成する目標",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "estTimeMins",
      title: "所要時間（分）",
      type: "number",
      description: "クエスト全体の所要時間",
      validation: (Rule) => Rule.min(1).max(300),
    }),
    defineField({
      name: "contents",
      title: "コンテンツ",
      type: "array",
      of: [{ type: "reference", to: [{ type: "content" }] }],
      validation: (Rule) => Rule.required().min(1),
    }),
  ],
  preview: {
    select: {
      title: "title",
      goal: "goal",
      estTimeMins: "estTimeMins",
    },
    prepare({ title, goal, estTimeMins }) {
      return {
        title,
        subtitle: `${goal} (${estTimeMins}分)`,
      };
    },
  },
});
```

---

**2-5. Lesson（レッスン）スキーマ**

**作成ファイル:** `sanity-studio/schemas/lesson.ts`

```typescript
import { defineType, defineField } from "sanity";

export default defineType({
  name: "lesson",
  title: "レッスン",
  type: "document",
  fields: [
    defineField({
      name: "title",
      title: "タイトル",
      type: "string",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "slug",
      title: "スラッグ",
      type: "slug",
      options: {
        source: "title",
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "description",
      title: "短い説明",
      type: "text",
      description: "レッスンカードに表示される説明文",
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: "coverImage",
      title: "カバー画像",
      type: "image",
      description: "レッスン一覧で表示される画像（342x512px推奨）",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "icon",
      title: "アイコン",
      type: "image",
      description: "レッスン詳細で表示されるアイコン（240x240px推奨）",
      options: {
        hotspot: true,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "backgroundSvg",
      title: "背景SVG",
      type: "image",
      description: "ヒーローセクションの背景装飾（SVG推奨）",
      options: {
        accept: "image/svg+xml",
      },
    }),
    defineField({
      name: "categories",
      title: "カテゴリ",
      type: "array",
      of: [{ type: "reference", to: [{ type: "category" }] }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "roadmap",
      title: "ロードマップ",
      type: "reference",
      to: [{ type: "roadmap" }],
    }),
    defineField({
      name: "overview",
      title: "概要",
      type: "array",
      of: [{ type: "block" }],
      description: "レッスンの詳細説明",
    }),
    defineField({
      name: "objectives",
      title: "学習目標",
      type: "array",
      of: [{ type: "string" }],
      validation: (Rule) => Rule.required().min(1).max(10),
    }),
    defineField({
      name: "quests",
      title: "クエスト",
      type: "array",
      of: [{ type: "reference", to: [{ type: "quest" }] }],
      validation: (Rule) => Rule.required().min(1),
    }),
    defineField({
      name: "isPremium",
      title: "有料レッスン",
      type: "boolean",
      description: "プレミアム会員限定",
      initialValue: false,
    }),
    defineField({
      name: "isPublished",
      title: "公開",
      type: "boolean",
      description: "公開状態",
      initialValue: false,
    }),
  ],
  preview: {
    select: {
      title: "title",
      media: "coverImage",
      isPremium: "isPremium",
      isPublished: "isPublished",
    },
    prepare({ title, media, isPremium, isPublished }) {
      return {
        title,
        media,
        subtitle: `${isPublished ? "✅ 公開" : "📝 下書き"}${
          isPremium ? " 🔒 有料" : ""
        }`,
      };
    },
  },
});
```

---

**2-6. スキーマ統合**

**作成ファイル:** `sanity-studio/schemas/index.ts`

```typescript
import category from "./category";
import roadmap from "./roadmap";
import content from "./content";
import quest from "./quest";
import lesson from "./lesson";

export const schemaTypes = [
  // 基本データ
  category,
  roadmap,

  // コンテンツ階層
  content,
  quest,
  lesson,
];
```

---

#### Step 3: Sanity Studio 設定とカスタマイズ

**3-1. Sanity 設定ファイル**

**更新ファイル:** `sanity-studio/sanity.config.ts`

```typescript
import { defineConfig } from "sanity";
import { deskTool } from "sanity/desk";
import { visionTool } from "@sanity/vision";
import { schemaTypes } from "./schemas";

export default defineConfig({
  name: "default",
  title: "Bono Training CMS",

  projectId: "YOUR_PROJECT_ID", // sanity initで生成されたID
  dataset: "production",

  plugins: [
    deskTool({
      structure: (S) =>
        S.list()
          .title("コンテンツ")
          .items([
            S.listItem()
              .title("レッスン")
              .child(S.documentTypeList("lesson").title("レッスン")),
            S.listItem()
              .title("クエスト")
              .child(S.documentTypeList("quest").title("クエスト")),
            S.listItem()
              .title("コンテンツ")
              .child(S.documentTypeList("content").title("コンテンツ")),
            S.divider(),
            S.listItem()
              .title("カテゴリ")
              .child(S.documentTypeList("category").title("カテゴリ")),
            S.listItem()
              .title("ロードマップ")
              .child(S.documentTypeList("roadmap").title("ロードマップ")),
          ]),
    }),
    visionTool(), // GROQクエリテスト用
  ],

  schema: {
    types: schemaTypes,
  },
});
```

**3-2. Studio 起動**

```bash
cd sanity-studio
npm run dev
```

ブラウザで `http://localhost:3333` を開く → Sanity Studio 管理画面が表示される

---

#### Step 4: サンプルデータ作成

Sanity Studio を使って、サンプルレッスンを作成します。

**手順:**

1. **カテゴリ作成**

   - 「カテゴリ」→「新規作成」
   - 名前: `情報設計`、スラッグ: `information-architecture`

2. **ロードマップ作成**

   - 「ロードマップ」→「新規作成」
   - 名前: `UI基礎ロードマップ`、スラッグ: `ui-foundations`、レベル: `Lv0`

3. **コンテンツ作成（3 つ）**

   - コンテンツ 1: 動画

     - タイトル: `情報設計とは何か？`
     - 種別: `動画`
     - Vimeo URL: `https://vimeo.com/123456789`（実際の URL に置き換え）
     - 所要時間: `8`
     - 必須: `true`
     - 有料: `false`

   - コンテンツ 2: 記事

     - タイトル: `4つの基本原則を理解する`
     - 種別: `記事`
     - 記事本文: 適当なテキストを入力
     - 所要時間: `10`

   - コンテンツ 3: 動画
     - タイトル: `実例で見る情報設計`
     - 種別: `動画`
     - Vimeo URL: 入力
     - 所要時間: `7`

4. **クエスト作成**

   - タイトル: `情報設計の基本原則`
   - ゴール: `情報設計の4つの基本原則を理解する`
   - 所要時間: `25`
   - コンテンツ: 上記 3 つを選択

5. **レッスン作成**
   - タイトル: `ゼロからはじめるUI情報設計`
   - 説明: `「どこに何をなぜ置くべきか？」の情報設計基礎をトレースしながら身につけられます。必須!`
   - カバー画像: アップロード
   - アイコン: アップロード
   - カテゴリ: `情報設計`を選択
   - ロードマップ: `UI基礎ロードマップ`を選択
   - 学習目標: 3 つ追加
   - クエスト: 上記クエストを選択
   - 公開: `true`

---

#### Step 5: フロントエンド - Sanity Client 設定

**5-1. 環境変数設定**

**作成ファイル:** `.env.local`

```bash
VITE_SANITY_PROJECT_ID=your_project_id
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
```

**5-2. Sanity Client 作成**

**作成ファイル:** `src/lib/sanity.ts`

```typescript
import { createClient } from "@sanity/client";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";

export const client = createClient({
  projectId: import.meta.env.VITE_SANITY_PROJECT_ID,
  dataset: import.meta.env.VITE_SANITY_DATASET,
  apiVersion: import.meta.env.VITE_SANITY_API_VERSION || "2024-01-01",
  useCdn: true, // 本番環境ではtrue、開発時はfalse推奨
});

// 画像URL生成用ビルダー
const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}
```

**5-3. GROQ クエリ定義**

**作成ファイル:** `src/lib/queries.ts`

```typescript
// レッスン一覧取得
export const LESSONS_QUERY = `
  *[_type == "lesson" && isPublished == true] | order(_createdAt desc) {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    "category": categories[0]->name,
    isPremium
  }
`;

// レッスン詳細取得（slug指定）
export const LESSON_DETAIL_QUERY = `
  *[_type == "lesson" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    description,
    coverImage,
    icon,
    backgroundSvg,
    "categories": categories[]-> {
      "slug": slug.current,
      name
    },
    "roadmap": roadmap-> {
      "slug": slug.current,
      name,
      level
    },
    overview,
    objectives,
    "quests": quests[]-> {
      "slug": slug.current,
      title,
      goal,
      estTimeMins,
      "contents": contents[]-> {
        "slug": slug.current,
        type,
        title,
        estTimeMins,
        isRequired,
        isPremium,
        vimeoUrl,
        articleBody
      }
    },
    isPremium,
    isPublished
  }
`;
```

**5-4. データ取得フック作成**

**作成ファイル:** `src/hooks/useLessons.ts`

```typescript
import { useState, useEffect } from "react";
import { client } from "@/lib/sanity";
import { LESSONS_QUERY, LESSON_DETAIL_QUERY } from "@/lib/queries";
import type { Lesson } from "@/types/lesson";

export function useLessons() {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    client
      .fetch(LESSONS_QUERY)
      .then((data) => {
        setLessons(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  return { lessons, loading, error };
}

export function useLesson(slug: string) {
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!slug) return;

    client
      .fetch(LESSON_DETAIL_QUERY, { slug })
      .then((data) => {
        setLesson(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, [slug]);

  return { lesson, loading, error };
}
```

---

#### Step 6: TypeScript 型定義（Sanity 対応）

**更新ファイル:** `src/types/lesson.ts`

```typescript
// Sanity画像型
export interface SanityImage {
  _type: "image";
  asset: {
    _ref: string;
    _type: "reference";
  };
  hotspot?: {
    x: number;
    y: number;
    height: number;
    width: number;
  };
}

// Sanityブロックコンテンツ型
export interface SanityBlock {
  _type: "block";
  style: string;
  children: Array<{
    _type: "span";
    text: string;
    marks?: string[];
  }>;
}

// カテゴリ参照
export interface CategoryRef {
  slug: string;
  name: string;
}

// ロードマップ参照
export interface RoadmapRef {
  slug: string;
  name: string;
  level?: string;
}

// コンテンツ型
export type ContentType = "video" | "article";

// コンテンツ
export interface Content {
  slug: string;
  type: ContentType;
  title: string;
  estTimeMins?: number;
  isRequired: boolean;
  isPremium: boolean;
  vimeoUrl?: string;
  articleBody?: SanityBlock[];
}

// クエスト
export interface Quest {
  slug: string;
  title: string;
  goal: string;
  estTimeMins?: number;
  contents: Content[];
}

// レッスン
export interface Lesson {
  _id: string;
  slug: string;
  title: string;
  description: string;

  // 画像
  coverImage: SanityImage;
  icon: SanityImage;
  backgroundSvg?: SanityImage;

  // リレーション
  categories: CategoryRef[];
  roadmap?: RoadmapRef;

  // コンテンツ
  overview?: SanityBlock[];
  objectives: string[];
  quests: Quest[];

  // メタデータ
  isPremium: boolean;
  isPublished: boolean;

  // 一覧ページ用（後方互換）
  category?: string;
}
```

---

#### Step 7: 共通 UI コンポーネントの作成

**7-1. Pill コンポーネント**

**作成ファイル:** `src/components/common/Pill.tsx`

```typescript
import React from "react";
import { cn } from "@/lib/utils";

interface PillProps {
  text: string;
  variant?: "category" | "roadmap";
  className?: string;
}

const Pill: React.FC<PillProps> = ({
  text,
  variant = "category",
  className,
}) => {
  const variantStyles = {
    category: "bg-blue-100 text-blue-700",
    roadmap: "bg-purple-100 text-purple-700",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {text}
    </span>
  );
};

export default Pill;
```

**7-2. Badge コンポーネント**

**作成ファイル:** `src/components/common/Badge.tsx`

```typescript
import React from "react";
import { cn } from "@/lib/utils";

interface BadgeProps {
  text: string;
  variant?: "required" | "premium" | "optional";
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  text,
  variant = "required",
  className,
}) => {
  const variantStyles = {
    required: "bg-red-100 text-red-700",
    premium: "bg-amber-100 text-amber-700",
    optional: "bg-gray-100 text-gray-600",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        variantStyles[variant],
        className
      )}
    >
      {text}
    </span>
  );
};

export default Badge;
```

---

#### Step 8: 詳細ページ専用コンポーネントの作成

**8-1. VimeoPlayer コンポーネント（重要）**

**作成ファイル:** `src/components/content/VimeoPlayer.tsx`

```typescript
import React from "react";

interface VimeoPlayerProps {
  vimeoUrl: string;
  className?: string;
}

const VimeoPlayer: React.FC<VimeoPlayerProps> = ({ vimeoUrl, className }) => {
  // Vimeo URLからビデオIDを抽出
  const getVimeoId = (url: string): string | null => {
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  };

  const videoId = getVimeoId(vimeoUrl);

  if (!videoId) {
    return (
      <div className="bg-gray-100 rounded p-4 text-center text-gray-600">
        無効なVimeo URLです
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative w-full" style={{ paddingTop: "56.25%" }}>
        <iframe
          src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
          className="absolute top-0 left-0 w-full h-full rounded"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          title="Vimeo video player"
        />
      </div>
    </div>
  );
};

export default VimeoPlayer;
```

**8-2. SanityContent コンポーネント（リッチテキスト表示用）**

**作成ファイル:** `src/components/content/SanityContent.tsx`

````typescript
import React from 'react';
import type { SanityBlock } from '@/types/lesson';

interface SanityContentProps {
  blocks?: SanityBlock[];
  className?: string;
}

const SanityContent: React.FC<SanityContentProps> = ({ blocks, className }) => {
  if (!blocks || blocks.length === 0) {
    return null;
  }

  return (
    <div className={className}>
      {blocks.map((block, index) => {
        const text = block.children?.map(child => child.text).join('') || '';

        switch (block.style) {
          case 'h2':
            return <h2 key={index} className="text-2xl font-bold mb-4 mt-8">{text}</h2>;
          case 'h3':
            return <h3 key={index} className="text-xl font-bold mb-3 mt-6">{text}</h3>;
          case 'blockquote':
            return (
              <blockquote key={index} className="border-l-4 border-gray-300 pl-4 italic my-4">
                {text}
              </blockquote>
            );
          default:
            return <p key={index} className="mb-4 leading-relaxed">{text}</p>;
        }
      })}
    </div>
  );
};

export default SanityContent;

**8-3. LessonHero, LessonOverview, LessonObjectives コンポーネント**

これらのコンポーネントは既存の計画をSanity対応に調整して実装します。

**作成ファイル:**
- `src/components/lessons/detail/LessonHero.tsx`
- `src/components/lessons/detail/LessonOverview.tsx`
- `src/components/lessons/detail/LessonObjectives.tsx`
- `src/components/lessons/detail/QuestCard.tsx`
- `src/components/lessons/detail/ContentPreview.tsx`

**主な変更点:**
- 画像は `urlFor(lesson.icon).url()` で取得
- 概要は `SanityContent` コンポーネントで表示
- 背景SVGも `urlFor()` で処理

---

#### Step 9: レッスン一覧ページのSanity対応

既存の一覧ページをSanityからデータ取得するように変更します。

**更新ファイル:** `src/pages/Lessons/index.tsx`

**変更内容:**
```typescript
import { useLessons } from '@/hooks/useLessons';
import { urlFor } from '@/lib/sanity';

const Lessons: React.FC = () => {
  const navigate = useNavigate();
  const { lessons, loading, error } = useLessons();

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p>エラーが発生しました: {error.message}</p>
        </div>
      </Layout>
    );
  }

  // ...以降は同じ
};
````

**LessonCard の画像表示:**

```typescript
<img
  src={urlFor(lesson.coverImage).width(342).height(512).url()}
  alt={`${lesson.title}のカバー画像`}
  className="w-[85.55px] h-32 object-cover block"
/>
```

---

#### Step 10: レッスン詳細ページの実装

**作成ファイル:** `src/pages/Lessons/Detail.tsx`

```typescript
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useLesson } from "@/hooks/useLessons";
import { urlFor } from "@/lib/sanity";
import HeadingBlock2 from "@/components/common/HeadingBlock2";
import LessonHero from "@/components/lessons/detail/LessonHero";
import LessonOverview from "@/components/lessons/detail/LessonOverview";
import LessonObjectives from "@/components/lessons/detail/LessonObjectives";
import QuestCard from "@/components/lessons/detail/QuestCard";

const LessonDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { lesson, loading, error } = useLesson(slug || "");

  const handleStart = () => {
    if (!lesson || !lesson.quests || lesson.quests.length === 0) return;

    const firstQuest = lesson.quests[0];
    const firstContent = firstQuest.contents[0];

    // Phase 2で実装
    console.log(
      `Navigate to: /lessons/${slug}/quests/${firstQuest.slug}/${firstContent.slug}`
    );
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p>読み込み中...</p>
        </div>
      </Layout>
    );
  }

  if (error || !lesson) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <p>レッスンが見つかりませんでした</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex flex-col items-center py-12 px-4 md:px-6 lg:px-0 bg-white">
        <div className="flex flex-col gap-12 w-full max-w-[1088px]">
          {/* Hero */}
          <LessonHero
            title={lesson.title}
            description={lesson.description}
            icon={lesson.icon}
            backgroundSvg={lesson.backgroundSvg}
            categories={lesson.categories}
            roadmap={lesson.roadmap}
            onStart={handleStart}
          />

          {/* 概要 */}
          {lesson.overview && (
            <div className="flex flex-col gap-4">
              <HeadingBlock2>概要</HeadingBlock2>
              <LessonOverview overview={lesson.overview} />
            </div>
          )}

          {/* 学習目標 */}
          <div className="flex flex-col gap-4">
            <HeadingBlock2>学習目標</HeadingBlock2>
            <LessonObjectives objectives={lesson.objectives} />
          </div>

          {/* クエスト一覧 */}
          <div className="flex flex-col gap-6">
            <HeadingBlock2>クエスト一覧</HeadingBlock2>
            <div className="flex flex-col gap-4">
              {lesson.quests.map((quest, index) => (
                <QuestCard
                  key={quest.slug}
                  quest={quest}
                  questNumber={index + 1}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default LessonDetail;
```

---

#### Step 11: ルーティング設定

**更新ファイル:** `src/App.tsx`

```typescript
import LessonDetail from "./pages/Lessons/Detail";

// ルート追加（/lessonsより下に配置）
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/lessons" element={<Lessons />} />
  <Route path="/lessons/:slug" element={<LessonDetail />} />
  {/* その他のルート */}
</Routes>;
```

---

#### Step 12: 環境変数の設定

**1. Sanity Project ID の取得**

```bash
cd sanity-studio
sanity manage
```

→ ブラウザでプロジェクト設定を開き、Project ID をコピー

**2. .env.local ファイル作成**

**作成ファイル:** `.env.local`

```bash
VITE_SANITY_PROJECT_ID=your_actual_project_id_here
VITE_SANITY_DATASET=production
VITE_SANITY_API_VERSION=2024-01-01
```

**3. .gitignore に追加（既にある場合はスキップ）**

```
.env.local
```

---

#### Step 13: テスト・検証

**13-1. Sanity Studio でデータ確認**

```bash
cd sanity-studio
npm run dev
```

→ `http://localhost:3333` でサンプルレッスンが正しく作成されているか確認

**13-2. フロントエンドビルド**

```bash
npm run build
```

**13-3. 型チェック**

```bash
npm run typecheck
```

**13-4. Lint**

```bash
npm run lint
```

**13-5. 開発サーバー起動**

```bash
npm run dev
```

**13-6. 動作確認**

- `/lessons` - 一覧ページが表示される（Sanity からデータ取得）
- レッスンカードクリック → 詳細ページへ遷移
- `/lessons/[slug]` - 詳細ページが表示される
  - Hero、概要、学習目標、クエスト一覧がすべて表示
  - 画像が Sanity CDN から正しく読み込まれる
  - カテゴリ・ロードマップのピルが表示
  - 「はじめる」ボタンクリック → console.log が出力

**13-7. Vimeo 動画確認（コンテンツページ実装後）**

- Phase 2 で実装予定

---

### 成果物チェックリスト

Phase 1 完了時に以下がすべて実装されていること:

#### Sanity CMS

- [ ] Sanity プロジェクトが作成され、Studio 起動できる
- [ ] 全スキーマ（Category, Roadmap, Content, Quest, Lesson）が定義されている
- [ ] Sanity Studio で少なくとも 1 つのサンプルレッスンが作成されている
- [ ] サンプルレッスンに画像、クエスト、コンテンツが含まれている
- [ ] 動画コンテンツに Vimeo URL が設定されている

#### フロントエンド

- [ ] Sanity Client が設定され、データ取得できる
- [ ] TypeScript 型定義（Sanity 対応）が完成している
- [ ] 画像 URL 生成（urlFor）が機能している
- [ ] useLessons, useLesson フックが動作する
- [ ] GROQ クエリが正しくデータを取得する

#### UI コンポーネント

- [ ] Pill, Badge コンポーネントが作成されている
- [ ] VimeoPlayer コンポーネントが作成されている
- [ ] SanityContent コンポーネントが作成されている
- [ ] LessonHero, LessonOverview, LessonObjectives, QuestCard, ContentPreview が作成されている

#### ページ

- [ ] レッスン一覧ページが Sanity からデータ取得している
- [ ] レッスン詳細ページ (`/lessons/[slug]`) が表示される
- [ ] 一覧ページからカードクリックで詳細ページへ遷移できる
- [ ] 詳細ページですべてのセクション（Hero、概要、目標、クエスト）が表示される

#### 品質

- [ ] レスポンシブデザインが適切に機能している
- [ ] アクセシビリティ基準（見出し階層、ARIA 属性）を満たしている
- [ ] ビルド・リント・型チェックがすべてパスする
- [ ] ローディング・エラーハンドリングが実装されている

---

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 📋 Phase 2 以降の予定（参考）

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

### Phase 2: コンテンツページ

- [ ] `/lessons/[slug]/quests/[questSlug]/[contentSlug]`ルート実装
- [ ] 動画コンテンツページ（VimeoPlayer 使用）
- [ ] 記事コンテンツページ（SanityContent 使用）
- [ ] 前後のコンテンツへのナビゲーション
- [ ] Vimeo 埋め込みの動作確認

### Phase 3: 進捗トラッキング

- [ ] localStorage での進捗管理
- [ ] Progress 型の実装
- [ ] 完了状態の表示（バッジ、プログレスバー）
- [ ] 「はじめる」「続きから」の出し分けロジック
- [ ] クエスト・レッスン完了ロジック

### Phase 4: 高度な機能

- [ ] 動画 80%再生での自動完了
- [ ] 記事 90%スクロールでの自動完了
- [ ] GA 連携（イベントトラッキング）
- [ ] 関連レッスン表示
- [ ] StickyStart ボタン（モバイル）
- [ ] 有料/無料コンテンツの出し分け実装

---

## 補足: Sanity 運用 Tips

### 画像アップロード

- Sanity Studio で直接ドラッグ&ドロップ
- 自動的に最適化・CDN 配信
- hotspot 設定で重要領域を指定可能

### データ編集

- ブラウザベースで編集
- 下書き保存が可能
- 公開/非公開の切り替えが簡単

### 本番デプロイ時

1. Sanity Studio をデプロイ（オプション）

```bash
cd sanity-studio
sanity deploy
```

→ `https://your-project.sanity.studio` で Studio にアクセス可能

2. フロントエンドに環境変数設定

- Vercel/Netlify などで `VITE_SANITY_PROJECT_ID` を設定

### データ移行（将来的に）

- 既存の静的データを Sanity にインポートするスクリプトを作成可能
- Sanity Migration Toolkit 使用
