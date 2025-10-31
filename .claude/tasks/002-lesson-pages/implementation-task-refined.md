# Phase 1 実装タスク - 詳細整理版

このドキュメントでは、requirements.mdとデザイン仕様書を精査した上で、実装タスクを詳細に整理します。

---

# 📊 実装の全体像

## 目標

素晴らしいレッスン詳細ページを作成するため、以下を重視します：

1. **Figmaデザインの忠実な再現**
2. **既存BONOとの統一感** - カラートークン・コンポーネントの再利用
3. **保守性の高いコード** - 役割ごとのトークン定義、コンポーネント分割
4. **将来の拡張性** - レスポンシブ対応の準備、Phase 2/3への対応

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎨 Step 0: デザイントークンとテーマ設定
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 目的

既存BONOとの統一感を保ちつつ、新しいレッスンページ用のカラートークンを定義します。

## タスク

### 0-1. 既存のカラートークンを確認

```bash
# 既存のテーマファイルを確認
- src/lib/theme.ts または類似ファイル
- tailwind.config.js の extend.colors セクション
```

**確認すべき項目：**
- Primary色
- Secondary色
- Text色（primary, secondary, tertiary）
- Background色
- Border色
- その他の役割ごとの色定義

---

### 0-2. レッスンページ用のカラートークンを定義

Figmaデザインから抽出した色を、役割ごとにトークン化します。

**新規トークン（tailwind.config.jsに追加）:**

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        // レッスンページ用のトークン
        lesson: {
          // Hero Section
          'hero-gradient-start': 'rgba(253, 251, 245, 0.88)',
          'hero-gradient-mid': 'rgba(244, 232, 223, 1)',
          'hero-gradient-end': 'rgba(239, 237, 255, 0.08)',
          'hero-overlay': 'rgba(0, 0, 0, 0.2)',
          'hero-text': '#0D221D',
          'hero-nav-text': '#909090',

          // Quest Section
          'quest-title': '#151834',
          'quest-detail': '#6F7178',
          'quest-meta': '#7D8691',
          'quest-border': 'rgba(0, 0, 0, 0.06)',
          'quest-card-bg': '#FFFFFF',
          'quest-divider': '#EEEEEE',

          // Content Item
          'item-number': '#414141',
          'item-title': '#5A5A5A',
          'item-duration': '#8C8C8C',
          'item-thumbnail-bg': '#E0DFDF',

          // Tab
          'tab-active': '#000000',
          'tab-inactive': '#737373',
          'tab-border': 'rgba(0, 0, 0, 0.1)',

          // Overview Tab
          'overview-heading': '#151834',
          'overview-text': '#0D0F18',
          'overview-checkbox-bg': '#FAFAFA',
          'overview-image-bg': '#F3F3F3',
        },
      },

      // フォントファミリー
      fontFamily: {
        'geist': ['Geist', 'sans-serif'],
        'rounded-mplus': ['Rounded Mplus 1c', 'sans-serif'],
        'noto-sans': ['Noto Sans JP', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
        'luckiest': ['Luckiest Guy', 'sans-serif'],
      },

      // グラデーション
      backgroundImage: {
        'hero-gradient': 'linear-gradient(252deg, rgba(253, 251, 245, 0.88) 15%, rgba(244, 232, 223, 1) 55%, rgba(239, 237, 255, 0.08) 94%)',
      },

      // ボックスシャドウ
      boxShadow: {
        'quest-card': '1px 1px 4px 0px rgba(0, 0, 0, 0.08)',
        'hero-icon': '1px 1px 13.56px 0px rgba(0, 0, 0, 0.33)',
      },
    },
  },
};
```

**アクション：**
- [ ] 既存のカラートークンを確認
- [ ] 新規トークンをtailwind.config.jsに追加
- [ ] フォントファミリーを設定（Google Fonts等から読み込み）
- [ ] グラデーション・シャドウを定義

---

### 0-3. フォントの読み込み設定

**必要なフォント：**
1. Geist（タブ用）
2. Rounded Mplus 1c（Heroタイトル・バックナビ用）
3. Noto Sans JP（クエストタイトル・見出し用）
4. Inter（説明文・リスト用）
5. Luckiest Guy（クエスト番号用）

**実装方法：**
```html
<!-- index.html または _app.tsx -->
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;700&family=Luckiest+Guy&display=swap" rel="stylesheet">
```

**アクション：**
- [ ] フォントをGoogle Fontsから読み込み
- [ ] Geist・Rounded Mplus 1cの入手方法を確認（ローカルフォントまたはCDN）

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🗄️ Step 1: Sanityスキーマの更新
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 目的

Figmaデザインに必要な全てのデータフィールドをSanityスキーマに追加します。

## タスク

### 1-1. lesson.ts の更新

**すでに追加済み：**
- ✅ `icon` フィールド（絵文字）
- ✅ `overview` フィールド（リッチテキスト）

**追加で必要なフィールド：**

```typescript
// レッスンの見出し（Figma: "デザインの旅を進めよう"）
defineField({
  name: "contentHeading",
  title: "コンテンツ見出し",
  type: "string",
  description: "クエスト一覧の上に表示される見出し（例: デザインの旅を進めよう）",
  validation: (Rule) => Rule.max(50),
}),

// ロードマップ情報（Phase 1では表示しないが、データ構造は準備）
defineField({
  name: "roadmap",
  title: "ロードマップ",
  type: "reference",
  to: [{ type: "roadmap" }], // 将来追加
  description: "このレッスンが所属するロードマップ（Phase 1では非表示）",
}),

// レベル情報（Phase 1では表示しないが、データ構造は準備）
defineField({
  name: "level",
  title: "レベル",
  type: "array",
  of: [{ type: "string" }],
  options: {
    list: [
      { title: "未経験", value: "beginner" },
      { title: "ジュニア", value: "junior" },
      { title: "ミドル", value: "middle" },
    ],
  },
  description: "このレッスンの対象レベル（Phase 1では非表示）",
}),
```

**アクション：**
- [ ] contentHeading フィールドを追加
- [ ] roadmap, level フィールドを追加（Phase 3用の準備）
- [ ] Sanity Studioを再起動して確認

---

### 1-2. quest.ts の更新

**現在のフィールド：**
- title, slug, description, goal, estTimeMins, articles

**追加が必要なフィールド：**

```typescript
// クエスト番号（表示順序）
defineField({
  name: "questNumber",
  title: "クエスト番号",
  type: "number",
  description: "クエストの順序番号（例: 1, 2, 3）",
  validation: (Rule) => Rule.required().min(1),
  initialValue: 1,
}),

// 完了数（Phase 3で使用、今は準備のみ）
// ※ これはフロントエンドで計算するため、スキーマには不要
```

**アクション：**
- [ ] questNumber フィールドを追加
- [ ] Sanity Studioを再起動して確認

---

### 1-3. article.ts の更新

**すでに追加済み：**
- ✅ `videoUrl` フィールド

**追加で必要なフィールド：**

```typescript
// 記事番号（表示順序）
defineField({
  name: "articleNumber",
  title: "記事番号",
  type: "number",
  description: "記事の順序番号（例: 1, 2, 3）",
  validation: (Rule) => Rule.min(1),
}),

// 動画の長さ（分）
defineField({
  name: "videoDuration",
  title: "動画の長さ（分）",
  type: "number",
  description: "動画の長さを分単位で入力（例: 20）",
  validation: (Rule) => Rule.min(1).max(300),
}),

// サムネイル画像（リスト表示用）
defineField({
  name: "thumbnail",
  title: "サムネイル画像",
  type: "image",
  options: {
    hotspot: true,
  },
  description: "クエスト一覧で表示される小さなサムネイル（57×32px推奨）",
}),
```

**アクション：**
- [ ] articleNumber フィールドを追加
- [ ] videoDuration フィールドを追加
- [ ] thumbnail フィールドを追加
- [ ] Sanity Studioを再起動して確認

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧩 Step 2: 共通コンポーネントの作成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 目的

再利用可能なコンポーネントを作成し、保守性を高めます。

## タスク

### 2-1. PortableTextRenderer.tsx

**機能：**
- Sanity Portable Textをレンダリング
- 概要・目的タブで使用

**実装：**

```typescript
// src/components/common/PortableTextRenderer.tsx
import { PortableText } from '@portabletext/react';
import { urlFor } from '@/lib/sanity';

const components = {
  block: {
    h2: ({ children }: any) => (
      <h2 className="font-noto-sans font-bold text-xl text-lesson-overview-heading mt-8 mb-4">
        {children}
      </h2>
    ),
    h3: ({ children }: any) => (
      <h3 className="font-noto-sans font-bold text-lg text-lesson-overview-heading mt-6 mb-3">
        {children}
      </h3>
    ),
    normal: ({ children }: any) => (
      <p className="font-inter text-base leading-relaxed text-lesson-overview-text mb-4">
        {children}
      </p>
    ),
  },
  marks: {
    strong: ({ children }: any) => (
      <strong className="font-bold">{children}</strong>
    ),
    em: ({ children }: any) => (
      <em className="italic">{children}</em>
    ),
    link: ({ value, children }: any) => {
      const target = (value?.href || '').startsWith('http') ? '_blank' : undefined;
      return (
        <a
          href={value?.href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          className="text-blue-600 underline hover:text-blue-700"
        >
          {children}
        </a>
      );
    },
  },
  types: {
    image: ({ value }: any) => (
      <div className="my-6">
        <img
          src={urlFor(value).width(764).height(400).url()}
          alt={value.alt || ''}
          className="w-full h-auto rounded bg-lesson-overview-image-bg"
        />
        {value.caption && (
          <p className="text-sm text-gray-600 mt-2 text-center">{value.caption}</p>
        )}
      </div>
    ),
  },
};

interface PortableTextRendererProps {
  value: any;
}

export default function PortableTextRenderer({ value }: PortableTextRendererProps) {
  return <PortableText value={value} components={components} />;
}
```

**アクション：**
- [ ] PortableTextRenderer.tsxを作成
- [ ] @portabletext/reactをインストール（まだの場合）
- [ ] コンポーネントをテスト

---

### 2-2. InfoBlock.tsx

**機能：**
- カテゴリ、ロードマップ、レベルなどの情報ブロックを表示
- Figma ID: 923:4882

**実装：**

```typescript
// src/components/lesson/InfoBlock.tsx
interface InfoBlockProps {
  label: string;
  values: string[];
}

export default function InfoBlock({ label, values }: InfoBlockProps) {
  return (
    <div className="flex items-center gap-1.5">
      {/* ラベル */}
      <div className="bg-gray-100 px-0.5 py-0.5">
        <span className="font-noto-sans text-[10px] leading-none text-gray-500">
          {label}
        </span>
      </div>

      {/* 値 */}
      <div className="flex items-center gap-2.5">
        {values.map((value, index) => (
          <span
            key={index}
            className="font-noto-sans text-xs leading-none text-black"
          >
            {value}
          </span>
        ))}
      </div>
    </div>
  );
}
```

**アクション：**
- [ ] InfoBlock.tsxを作成
- [ ] Figmaデザインと見比べてスタイルを調整

---

### 2-3. PrimaryButton.tsx

**機能：**
- CTA用の黒い丸ボタン
- Figma ID: 765:19157

**実装：**

```typescript
// src/components/common/PrimaryButton.tsx
import { Check } from 'lucide-react';

interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  icon?: boolean;
}

export default function PrimaryButton({ children, onClick, icon = true }: PrimaryButtonProps) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1 px-3 py-2 bg-black text-white rounded-full font-noto-sans font-bold text-sm hover:bg-gray-800 transition"
    >
      {icon && <Check size={18} />}
      {children}
    </button>
  );
}
```

**アクション：**
- [ ] PrimaryButton.tsxを作成
- [ ] lucide-reactのCheckアイコンを使用

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🏗️ Step 3: レッスン詳細ページのコンポーネント作成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## 目的

Figmaデザインに基づいて、各セクションのコンポーネントを作成します。

## タスク

### 3-1. LessonHero.tsx

**責務：**
- Heroセクション全体（グラデーション背景 + 詳細情報）
- Figma ID: 923:4962 + 923:4927

**実装のポイント：**
- 2つのブロック構成：
  1. グラデーション領域（高さ216px固定）
  2. 詳細情報領域（白背景、中央配置）
- アイコンを絶対配置で上にはみ出させる

**コンポーネント構造：**

```tsx
<LessonHero>
  ├── GradationArea (高さ216px)
  │   └── BackNavigation
  └── DetailHeroArea
      ├── Icon (絶対配置)
      ├── Title
      ├── Description
      ├── InfoBlocks (カテゴリ、ロードマップ、レベル)
      └── PrimaryButton ("スタートする")
</LessonHero>
```

**アクション：**
- [ ] LessonHero.tsxを作成
- [ ] グラデーション背景を実装（bg-hero-gradient）
- [ ] アイコンの絶対配置を実装
- [ ] BackNavigation を実装（ArrowLeft + "トレーニング一覧"）

---

### 3-2. LessonTabs.tsx

**責務：**
- タブUI（コンテンツ / 概要・目的）
- Figma ID: 927:5030

**実装のポイント：**
- Radix UI の Tabs コンポーネントを使用（すでにインストール済み）
- アクティブタブ：黒文字 + 2px下線
- 非アクティブタブ：グレー文字

**コンポーネント構造：**

```tsx
<Tabs defaultValue="content">
  <TabsList>
    <TabsTrigger value="content">コンテンツ</TabsTrigger>
    <TabsTrigger value="overview">概要・目的</TabsTrigger>
  </TabsList>

  <TabsContent value="content">
    <QuestList quests={quests} />
  </TabsContent>

  <TabsContent value="overview">
    <OverviewTab overview={overview} />
  </TabsContent>
</Tabs>
```

**アクション：**
- [ ] LessonTabs.tsxを作成
- [ ] Radix UI Tabsコンポーネントを使用
- [ ] カスタムスタイルを適用（Figmaデザイン準拠）

---

### 3-3. QuestList.tsx + QuestCard.tsx

**責務：**
- クエスト一覧の表示
- 各クエストカードの表示
- Figma ID: 866:14023

**QuestCard の構造：**

```tsx
<QuestCard>
  ├── QuestNumber ("クエスト 01")
  └── TaskTrainingCard
      ├── Heading
      │   ├── Left
      │   │   ├── QuestTitle
      │   │   ├── QuestDetail
      │   │   └── MetaInfo (目安: 1日, 完了数: 1/4)
      │   └── ArrowButton
      └── ContentList
          └── ContentItem × N
</QuestCard>
```

**実装のポイント：**
- カード全体: 幅743px、角丸24px、影付き
- ヘッダー: パディング20px 32px、下部ボーダー
- コンテンツリスト: パディング12px 32px

**アクション：**
- [ ] QuestList.tsxを作成
- [ ] QuestCard.tsxを作成
- [ ] MetaInfo（目安・完了数）を実装
- [ ] ArrowButton を実装（lucide-reactのChevronRight使用）

---

### 3-4. ContentItem.tsx

**責務：**
- 記事アイテムの表示
- Figma ID: 866:14103

**コンポーネント構造：**

```tsx
<ContentItem>
  ├── ContentNumber ("01")
  ├── Thumbnail (57×32px)
  └── ContentInfo
      ├── Title
      └── VideoDuration ("20分")
</ContentItem>
```

**実装のポイント：**
- 幅679px、ギャップ16px
- サムネイル: 角丸3.17px
- クリックで記事詳細ページへ遷移（/articles/:slug）

**アクション：**
- [ ] ContentItem.tsxを作成
- [ ] サムネイル画像の表示（urlForを使用）
- [ ] クリックハンドラを実装（useNavigate）

---

### 3-5. OverviewTab.tsx

**責務：**
- 概要・目的タブの表示
- Figma ID: 933:5209

**コンポーネント構造：**

```tsx
<OverviewTab>
  ├── Heading ("概要と目的")
  ├── Section1 (誰向けのコンテンツ？)
  │   ├── SectionHeading
  │   └── CheckList
  │       └── CheckListItem × N
  └── Section2 (コンテンツで得られること)
      ├── SectionHeading
      └── PortableTextRenderer
</OverviewTab>
```

**実装のポイント：**
- コンテナ幅: 768px
- ギャップ: 32px
- CheckListItem: チェックボックス風デコレーション（10×10px、角丸4px）

**アクション：**
- [ ] OverviewTab.tsxを作成
- [ ] CheckListItem コンポーネントを作成
- [ ] PortableTextRenderer を統合

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📄 Step 4: ページコンポーネントとルーティング
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## タスク

### 4-1. LessonDetail.tsx

**責務：**
- レッスン詳細ページ全体の構成
- URLパラメータからslugを取得
- Sanityからデータを取得

**GROQクエリ：**

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
  contentHeading,
  overview,
  "quests": quests[]-> {
    _id,
    questNumber,
    title,
    slug,
    description,
    goal,
    estTimeMins,
    "articles": articles[]-> {
      _id,
      articleNumber,
      title,
      slug,
      excerpt,
      thumbnail,
      videoDuration,
      isPremium
    }
  } | order(questNumber asc)
}
```

**実装のポイント：**
- useParams()でslugを取得
- useEffect()でデータフェッチ
- ローディング・エラー状態の表示
- データをコンポーネントに渡す

**アクション：**
- [ ] LessonDetail.tsxを作成
- [ ] GROQクエリを実装
- [ ] データフェッチロジックを実装
- [ ] ローディング・エラーUIを実装

---

### 4-2. ルーティング設定

**ルート追加：**

```typescript
// App.tsx または main.tsx
<Routes>
  <Route path="/lessons" element={<LessonList />} />
  <Route path="/lessons/:slug" element={<LessonDetail />} />
  <Route path="/articles/:slug" element={<ArticleDetail />} /> {/* Phase 2 */}
</Routes>
```

**SanityTest.tsx → LessonList.tsx へ移行：**

```bash
# ファイル名変更
mv src/pages/SanityTest.tsx src/pages/LessonList.tsx

# インポートパスの更新
# App.tsx内のimport文を更新
```

**アクション：**
- [ ] ルートを追加
- [ ] SanityTest.tsx を LessonList.tsx にリネーム
- [ ] /sanity-test → /lessons にパス変更

---

### 4-3. 「スタートする」ボタンの実装

**機能：**
- クエスト1の最初の記事へ遷移
- 記事がない場合はボタンを無効化

**実装：**

```typescript
const handleStart = () => {
  if (lesson.quests?.[0]?.articles?.[0]) {
    const firstArticle = lesson.quests[0].articles[0];
    navigate(`/articles/${firstArticle.slug.current}`);
  }
};
```

**アクション：**
- [ ] handleStart関数を実装
- [ ] PrimaryButtonにonClickを接続
- [ ] 記事がない場合の処理を実装

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🎨 Step 5: スタイリングとポリッシュ
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## タスク

### 5-1. Figmaデザインとの比較調整

**チェックリスト：**
- [ ] フォントサイズ・ウェイトが正確か
- [ ] 色が正確か（カラートークン使用）
- [ ] パディング・マージン・ギャップが正確か
- [ ] ボーダー・角丸が正確か
- [ ] 影が正確か

**調整方法：**
- Figmaデザインと並べて比較
- 1pxレベルで微調整
- TailwindCSSクラスで近い値を使用

---

### 5-2. ホバー・アクティブ状態の実装

**対象：**
- ContentItem: ホバー時に背景色変更
- QuestCard: ホバー時に影を強調
- タブ: ホバー時に色を濃く
- ボタン: ホバー時に背景色変更

**アクション：**
- [ ] ホバー状態を実装
- [ ] トランジションを追加（transition-all duration-200）

---

### 5-3. レスポンシブ対応の準備

**現時点の方針：**
- デスクトップファースト（768px固定幅）
- 将来のレスポンシブ対応のため、コンテナ幅を変数化

**実装例：**

```typescript
// コンテナ幅を変数で管理
const CONTENT_WIDTH = 768; // px

<div className="w-[768px] mx-auto"> {/* デスクトップ */}
  {/* 将来的に w-full max-w-[768px] に変更 */}
</div>
```

**アクション：**
- [ ] 固定幅を使用しつつ、将来の変更を見越した構造にする
- [ ] コメントで「レスポンシブ対応時に変更」と記載

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 🧪 Step 6: テストとデータ作成
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## タスク

### 6-1. Sanity Studioでテストデータ作成

**作成するデータ：**

**レッスン1つ：**
- タイトル: "社内で使う本貸し出しシステムのデザイン"
- slug: "book-lending-system-design"
- contentHeading: "デザインの旅を進めよう"
- icon: 📚
- category: "情報設計"
- overview: 概要・目的のリッチテキスト（2セクション）

**クエスト2つ：**

**クエスト1:**
- questNumber: 1
- title: "社内本貸し出しシステムをデザインしよう"
- goal: "ユーザーインタビューでリアルな課題を発見して、解決するプロトタイプをデザインする"
- estTimeMins: 1440 (1日)

**クエスト2:**
- questNumber: 2
- title: "プロトタイプを改善しよう"
- goal: "ユーザーフィードバックを元に改善する"
- estTimeMins: 720 (半日)

**記事各3つ：**

**クエスト1の記事:**
1. articleNumber: 1, title: "学ぶものとつくるものを把握しよう", videoDuration: 20
2. articleNumber: 2, title: "ユーザーインタビューの準備", videoDuration: 15
3. articleNumber: 3, title: "プロトタイプを作成", videoDuration: 30

**クエスト2の記事:**
1. articleNumber: 1, title: "フィードバックを収集", videoDuration: 10
2. articleNumber: 2, title: "改善点を特定", videoDuration: 15
3. articleNumber: 3, title: "最終プロトタイプ", videoDuration: 25

**アクション：**
- [ ] Sanity Studioでテストデータを作成
- [ ] サムネイル画像をアップロード（またはプレースホルダー使用）

---

### 6-2. 動作確認

**確認項目：**
- [ ] /lessonsでレッスン一覧が表示される
- [ ] レッスンカードをクリックして/lessons/:slugに遷移
- [ ] Heroセクションが正しく表示される
- [ ] タブ切り替えが動作する
- [ ] クエスト一覧が表示される
- [ ] 記事アイテムをクリックして/articles/:slugに遷移（Phase 2で実装）
- [ ] 「スタートする」ボタンが動作する
- [ ] 概要・目的タブが正しく表示される

---

# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
# 📋 実装チェックリスト（総まとめ）
# ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

## Step 0: デザイントークンとテーマ設定
- [ ] 既存のカラートークンを確認
- [ ] 新規カラートークンをtailwind.config.jsに追加
- [ ] フォントファミリーを設定
- [ ] グラデーション・シャドウを定義
- [ ] フォントを読み込み

## Step 1: Sanityスキーマの更新
- [ ] lesson: contentHeading, roadmap, level を追加
- [ ] quest: questNumber を追加
- [ ] article: articleNumber, videoDuration, thumbnail を追加
- [ ] Sanity Studioを再起動

## Step 2: 共通コンポーネントの作成
- [ ] PortableTextRenderer.tsx
- [ ] InfoBlock.tsx
- [ ] PrimaryButton.tsx

## Step 3: レッスン詳細ページのコンポーネント作成
- [ ] LessonHero.tsx
- [ ] LessonTabs.tsx
- [ ] QuestList.tsx + QuestCard.tsx
- [ ] ContentItem.tsx
- [ ] OverviewTab.tsx

## Step 4: ページコンポーネントとルーティング
- [ ] LessonDetail.tsx (GROQクエリ含む)
- [ ] ルーティング設定
- [ ] SanityTest → LessonList へ移行
- [ ] 「スタートする」ボタン実装

## Step 5: スタイリングとポリッシュ
- [ ] Figmaデザインとの比較調整
- [ ] ホバー・アクティブ状態の実装
- [ ] レスポンシブ対応の準備

## Step 6: テストとデータ作成
- [ ] Sanity Studioでテストデータ作成
- [ ] 動作確認

---

# 🎯 成功の定義

Phase 1の実装は、以下を満たした時点で完了とします：

1. ✅ Figmaデザインが忠実に再現されている
2. ✅ 既存BONOと統一感のあるカラートークン・コンポーネントを使用
3. ✅ すべてのインタラクションが動作する
4. ✅ Sanityのデータが正しく表示される
5. ✅ コードが保守しやすく、将来の拡張に対応できる構造になっている

---

# 📝 Phase 2への引き継ぎ事項

Phase 1完了後、Phase 2（記事詳細ページ）の実装に向けて以下を準備：

1. **記事詳細ページのルート追加**（/articles/:slug）
2. **動画埋め込みコンポーネント**（Vimeo対応）
3. **記事本文のレンダリング**（PortableTextRendererの拡張）
4. **ナビゲーション**（前の記事・次の記事）

---

このドキュメントを基に、1つずつタスクを実装していきましょう！
