# レッスンページ実装計画

## 📊 実装ステータス

```
Phase 1: レッスン詳細ページ  ← 現在ここ
├── Sanityスキーマ更新       [ ]
├── GROQクエリ設計          [ ]
├── ルーティング設定         [ ]
├── コンポーネント設計       [ ]
└── 実装                    [ ]

Phase 2: 記事詳細ページ
Phase 3: 追加機能
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔧 1. Sanityスキーマ更新計画
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 1-1. lesson スキーマ更新

### 追加するフィールド

```typescript
// 概要・目的タブ用のリッチテキストコンテンツ
defineField({
  name: "overview",
  title: "概要・目的",
  type: "array",
  of: [
    {
      type: "block",
      styles: [
        { title: "Normal", value: "normal" },
        { title: "H2", value: "h2" },
        { title: "H3", value: "h3" },
      ],
      marks: {
        decorators: [
          { title: "太字", value: "strong" },
          { title: "斜体", value: "em" },
        ],
      },
    },
  ],
  description: "誰向けか、レッスンの説明（概要・目的タブに表示）",
}),

// レッスンアイコン（絵文字または画像）
defineField({
  name: "icon",
  title: "アイコン",
  type: "string",
  description: "レッスンを表すアイコン（絵文字推奨: 📚, 🎨, 💻など）",
  validation: (Rule) => Rule.max(10),
}),
```

### 既存フィールド
- title ✅
- slug ✅
- description ✅（Heroエリアのディスクリプション）
- coverImage ✅
- category ✅
- isPremium ✅
- quests ✅

---

## 1-2. article スキーマ更新

### 追加するフィールド

```typescript
// 動画URL（Phase 2で使用するが、今のうちに追加）
defineField({
  name: "videoUrl",
  title: "動画URL",
  type: "url",
  description: "Vimeo動画のURL（任意）",
  validation: (Rule) =>
    Rule.uri({
      scheme: ["https"],
    }),
}),
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🔍 2. GROQクエリ設計
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 2-1. レッスン詳細ページ用クエリ

```groq
*[_type == "lesson" && slug.current == $slug][0] {
  _id,
  title,
  slug,
  description,
  icon,
  coverImage,
  category,
  isPremium,
  overview,
  "quests": quests[]-> {
    _id,
    title,
    slug,
    description,
    goal,
    estTimeMins,
    "articles": articles[]-> {
      _id,
      title,
      slug,
      excerpt,
      isPremium
    }
  }
}
```

**クエリのポイント:**
- `quests[]->` でクエストを展開
- `articles[]->` で記事を展開
- ネストした構造で一度に取得（N+1問題を回避）

---

## 2-2. レッスン一覧ページ用クエリ

```groq
*[_type == "lesson"] | order(publishedAt desc) {
  _id,
  title,
  slug,
  description,
  icon,
  coverImage,
  category,
  isPremium,
  "questCount": count(quests),
  "articleCount": count(quests[]->articles)
}
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🗂️ 3. ルーティング設計
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 3-1. ページ構成

```
/lessons              → LessonList.tsx （既存のSanityTest.tsxを移行）
/lessons/:slug        → LessonDetail.tsx （新規作成）
/articles/:slug       → ArticleDetail.tsx （Phase 2で作成）
```

## 3-2. React Router設定

```typescript
// src/main.tsx または App.tsx
<Routes>
  <Route path="/lessons" element={<LessonList />} />
  <Route path="/lessons/:slug" element={<LessonDetail />} />
  <Route path="/articles/:slug" element={<ArticleDetail />} />
</Routes>
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎨 4. コンポーネント設計
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 4-1. ページコンポーネント

### LessonDetail.tsx
```
src/pages/LessonDetail.tsx
```

**責務:**
- URLパラメータからslugを取得
- Sanityからレッスンデータを取得
- 子コンポーネントにデータを渡す

---

## 4-2. 子コンポーネント

### LessonHero.tsx
```
src/components/lessons/LessonHero.tsx
```

**責務:**
- Hero + 概要エリアの表示
- 背景グラデーション
- バックナビゲーション
- アイコン、タイトル、ディスクリプション
- カテゴリ、有料フラグの表示

**Props:**
```typescript
interface LessonHeroProps {
  title: string;
  description?: string;
  icon?: string;
  category?: string;
  isPremium: boolean;
  coverImage?: any;
}
```

---

### LessonTabs.tsx
```
src/components/lessons/LessonTabs.tsx
```

**責務:**
- タブ切り替えUI
- 2つのタブ: "コンテンツ" / "概要・目的"

**Props:**
```typescript
interface LessonTabsProps {
  quests: Quest[];
  overview?: any[]; // Portable Text
}
```

**State:**
```typescript
const [activeTab, setActiveTab] = useState<"content" | "overview">("content");
```

---

### QuestAccordion.tsx
```
src/components/lessons/QuestAccordion.tsx
```

**責務:**
- クエストのアコーディオン表示
- 展開/折りたたみ機能
- 記事リストの表示

**Props:**
```typescript
interface QuestAccordionProps {
  quests: Quest[];
}

interface Quest {
  _id: string;
  title: string;
  description?: string;
  goal: string;
  estTimeMins?: number;
  articles: Article[];
}

interface Article {
  _id: string;
  title: string;
  slug: { current: string };
  excerpt?: string;
  isPremium: boolean;
}
```

**State:**
```typescript
const [openQuestIds, setOpenQuestIds] = useState<Set<string>>(new Set());
```

---

### ArticleListItem.tsx
```
src/components/lessons/ArticleListItem.tsx
```

**責務:**
- 記事のリストアイテム表示
- クリックで記事詳細ページへ遷移
- 有料フラグの表示

**Props:**
```typescript
interface ArticleListItemProps {
  article: Article;
}
```

---

### PortableTextRenderer.tsx
```
src/components/common/PortableTextRenderer.tsx
```

**責務:**
- Sanity Portable Textのレンダリング
- 概要・目的タブで使用

**使用ライブラリ:**
```bash
npm install @portabletext/react
```

---

## 4-3. コンポーネント階層

```
LessonDetail
├── LessonHero
├── LessonTabs
│   ├── Tab: コンテンツ
│   │   └── QuestAccordion
│   │       └── ArticleListItem (複数)
│   └── Tab: 概要・目的
│       └── PortableTextRenderer
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📝 5. 実装ステップ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## ステップ1: Sanityスキーマ更新

- [ ] lesson.ts に `overview` フィールドを追加
- [ ] lesson.ts に `icon` フィールドを追加
- [ ] article.ts に `videoUrl` フィールドを追加
- [ ] Sanity Studioを再起動
- [ ] Studioでテストデータを更新

---

## ステップ2: 共通コンポーネント作成

- [ ] PortableTextRenderer.tsx を作成
- [ ] @portabletext/react をインストール

---

## ステップ3: レッスン詳細ページのコンポーネント作成

- [ ] LessonHero.tsx を作成
- [ ] LessonTabs.tsx を作成
- [ ] QuestAccordion.tsx を作成
- [ ] ArticleListItem.tsx を作成

---

## ステップ4: ページコンポーネント作成

- [ ] LessonDetail.tsx を作成
- [ ] GROQクエリを実装
- [ ] データフローを確認

---

## ステップ5: ルーティング設定

- [ ] React Routerにルートを追加
- [ ] SanityTest.tsx を LessonList.tsx にリネーム
- [ ] /sanity-test を /lessons に変更

---

## ステップ6: スタイリング

- [ ] Hero エリアのグラデーション背景
- [ ] タブのアクティブ状態
- [ ] アコーディオンのアニメーション
- [ ] レスポンシブ対応

---

## ステップ7: テスト

- [ ] レッスン詳細ページの表示確認
- [ ] タブ切り替えの動作確認
- [ ] アコーディオンの展開/折りたたみ確認
- [ ] 記事へのリンク確認
- [ ] モバイル表示確認

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎯 6. デザイン仕様（暫定）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 6-1. Heroエリア

```
背景: グラデーション（primary色ベース）
パディング: py-12 md:py-16
カラー: 白テキスト

レイアウト:
├── バックナビゲーション（← レッスン一覧）
├── アイコン（大きめ表示）
├── タイトル（text-3xl md:text-4xl font-bold）
├── ディスクリプション（text-lg opacity-90）
└── インフォエリア
    ├── カテゴリバッジ
    └── 有料フラグ（🔒）
```

---

## 6-2. タブUI

```
デザイン: ボーダー下線付きタブ
アクティブタブ: 下線を強調、太字

レイアウト:
[コンテンツ] [概要・目的]
─────────
```

---

## 6-3. クエストアコーディオン

```
ボーダー付きカード
├── ヘッダー（クリック可能）
│   ├── クエストタイトル
│   ├── 所要時間
│   └── 展開アイコン（▼/▲）
└── コンテンツ（展開時）
    ├── ゴール
    └── 記事リスト
```

---

## 6-4. 記事リストアイテム

```
ホバー可能なカード
├── 記事タイトル
├── 要約（excerpt）
└── 有料フラグ（🔒）
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📦 7. 必要なパッケージ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

```bash
# Portable Text レンダリング用
npm install @portabletext/react

# React Router（すでにインストール済みの可能性あり）
npm install react-router-dom
```

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🚀 次のアクション
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **ステップ1から順番に実装を開始**
2. **各ステップ完了後に動作確認**
3. **問題があれば随時調整**

準備ができたら「実装を開始してください」と教えてください！
