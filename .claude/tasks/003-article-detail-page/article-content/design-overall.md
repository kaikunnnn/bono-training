# Article コンテンツ - 全体仕様

## 他の各コンポーネントを使って全体を作ってください

基本的にはほかコンポーネントの集まりです。BONO のロゴが含まれるブロック以外は。
なので以下の内容は全体イメージの参考に使ってください

## 仕様

# 📚 記事詳細ページ 全体統合実装ガイド

## 概要

記事詳細ページは、以下の 4 つの主要セクションで構成されています。各セクションは独立したコンポーネントとして設計されており、本ガイドではそれらを統合して完全なページを実装する方法を説明します。

---

## 🎯 ページ全体の構造

```
📄 Article Detail Page
├─ 🎬 Video Embed Section（ビデオ埋め込み）
│  └─ Vimeo プレーヤー + プログレスバー
│
├─ 📖 Article Content Wrapper（幅720px）
│  ├─ 1️⃣ Heading Section（ヘッダーセクション）
│  │  ├─ クエスト情報（クエスト2 / ステップ5）
│  │  ├─ タイトル（Noto Sans JP, 28px, Bold）
│  │  ├─ 説明文（Inter, 16px, Regular）
│  │  └─ アクションボタン群
│  │     ├─ 完了にする（Secondary Button）
│  │     ├─ お気に入り（Tertiary Button）
│  │     ├─ シェア（Tertiary Button）
│  │     └─ 次の動画（Next Content Button）
│  │
│  ├─ 2️⃣ TODO Section（身につけること）
│  │  ├─ ヘッダーブロック（#F5F5F5背景）
│  │  │  └─ タイトル「身につけること」
│  │  └─ コンテンツエリア
│  │     └─ TODO項目リスト（複数）
│  │        ├─ 円マーク（6x6px）
│  │        └─ テキスト（Noto Sans JP, 14px）
│  │
│  ├─ 3️⃣ Rich Text Section（本文コンテンツ）
│  │  ├─ Heading 2（見出し, Inter 20px, Bold）
│  │  ├─ Heading 3（副見出し, Inter 16px, SemiBold）
│  │  ├─ 段落テキスト（Inter 16px, Regular）
│  │  └─ リスト（箇条書き）
│  │     ├─ リスト項目（インデント21.5px）
│  │     └─ リスト項目（ギャップ8px）
│  │
│  └─ 4️⃣ Content Navigation（前後記事遷移）
│     ├─ 前の記事カード
│     │  ├─ 左矢印アイコン
│     │  ├─ ラベル「前」（Noto Sans JP, 10px）
│     │  └─ タイトル（Hind, 12px, SemiBold）
│     └─ 次の記事カード（右矢印）
│        ├─ ラベル「次」
│        ├─ タイトル
│        └─ 右矢印アイコン
```

---

## 📐 ページレイアウト仕様

### 全体コンテナ（Wrapper）

| プロパティ     | 値                      |
| -------------- | ----------------------- |
| **幅**         | 1260px（デスクトップ）  |
| **パディング** | 0px 45px（左右各 45px） |
| **レイアウト** | Column（縦並び）        |
| **ギャップ**   | 24px                    |
| **配置**       | Center（中央揃え）      |

### コンテンツ領域（Article Container）

| プロパティ     | 値                     |
| -------------- | ---------------------- |
| **幅**         | 720px（固定）          |
| **パディング** | 32px 0px（上下 32px）  |
| **ギャップ**   | 24px（各セクション間） |
| **背景**       | 継承（白）             |

---

## 🔤 セクション 1: Heading Section（ヘッダーセクション）

### 位置とサイズ

```
Article Container の最上部
幅: 720px（Fill）
高さ: Hug（自動調整）
```

### 構成

```
Heading Section
├─ Quest Info
│  ├─ "クエスト2"（12px, Inter, #747474）
│  ├─ "/"（12px, Inter, #C0C0C0）
│  └─ "ステップ5"（12px, Inter, #747474）
│
├─ Title
│  └─ "学ぶものとつくるものを把握しよう"
│     （28px, Noto Sans JP, Bold, #102028）
│
├─ Description
│  └─ "基本的なToDoリストUIをつくるうえで何を学ぶのか？..."
│     （16px, Inter, Regular, #4A5565）
│
└─ Action Area
   ├─ Left Buttons
   │  ├─ Complete Button
   │  │  ├─ Icon: チェック（18x18px）
   │  │  ├─ Text: "完了にする"
   │  │  └─ Style: Secondary（#F3F5F5背景）
   │  ├─ Favorite Button
   │  │  ├─ Icon: 星（18x18px）
   │  │  └─ Text: "お気に入り"
   │  │  └─ Style: Tertiary
   │  └─ Share Button
   │     ├─ Icon: 共有（18x18px）
   │     └─ Text: "シェア"
   │     └─ Style: Tertiary
   │
   └─ Right Button
      ├─ Text: "次の動画"
      ├─ Arrow: ">>"
      └─ Height: 36px
```

### スペーシング詳細

| 要素            | ギャップ | 説明                                      |
| --------------- | -------- | ----------------------------------------- |
| Quest Info 内   | 4px      | 要素間                                    |
| セクション内    | 12px     | quest_info ↔ title ↔ description ↔ action |
| Action 左ボタン | 8px      | 各ボタン間                                |
| ボタン内        | 4px      | アイコン ↔ テキスト                       |

### データ例

```json
{
  "headingSection": {
    "questNumber": 2,
    "stepNumber": 5,
    "title": "学ぶものとつくるものを把握しよう",
    "description": "基本的なToDoリストUIをつくるうえで何を学ぶのか？をまずは理解するところから始めていきましょう。",
    "actions": {
      "completed": false,
      "favorited": false
    },
    "nextContentId": "content_123"
  }
}
```

### 仕様書参照

📄 [heading-section_design_spec.md](heading-section_design_spec.md)

---

## ✓ セクション 2: TODO Section（身につけること）

### 位置とサイズ

```
Heading Section の下（ギャップ24px）
幅: 720px（Fill）
高さ: Hug（自動調整）
```

### 構成

```
TODO Section
├─ Heading Block
│  ├─ Background: #F5F5F5（ライトグレー）
│  ├─ Border-radius: 10px 10px 0px 0px（上部のみ）
│  ├─ Padding: 5px 16px
│  └─ Title: "身につけること"
│     （12px, Noto Sans JP, Bold, #656668）
│
└─ Content Wrapper
   ├─ Padding: 12px 8px
   ├─ Gap: 12px（各項目間）
   └─ TODO Items（複数）
      ├─ Circle Marker（6x6px, rgba(23,23,23,0.64)）
      ├─ Text（Noto Sans JP, 14px, Bold, #171717）
      └─ onClick → state toggle（completed）
```

### スペーシング詳細

| 箇所                 | サイズ   |
| -------------------- | -------- |
| コンテナ外パディング | 2px      |
| ヘッダーパディング   | 5px 16px |
| コンテンツパディング | 12px 8px |
| ヘッダー内ギャップ   | 10px     |
| 項目間ギャップ       | 12px     |
| 項目内ギャップ       | 10px     |

### データ例

```json
{
  "todoSection": {
    "title": "身につけること",
    "items": [
      {
        "id": "todo_001",
        "text": "基本的なToDoリストのUIパターンを理解する",
        "completed": false
      },
      {
        "id": "todo_002",
        "text": "ユーザーのニーズと実装の考え方を把握する",
        "completed": false
      }
    ]
  }
}
```

### 仕様書参照

📄 [todo-section_design_spec.md](todo-section_design_spec.md)

---

## 📝 セクション 3: Rich Text Section（本文コンテンツ）

### 位置とサイズ

```
TODO Section の下（ギャップ24px）
幅: 720px（Fill）
高さ: Hug（自動調整）
```

### 構成（複数セクション繰り返し）

```
Rich Text Section
├─ Padding: 24px 0px（上下）
├─ Gap: 48px（セクション間）
│
├─ Section 1
│  ├─ Heading 2
│  │  └─ "アウトプット目標の重要性"
│  │     （20px, Inter, Bold, #101828）
│  └─ Paragraph
│     └─ "「Figmaを学ぶ」よりも「Figmaでポートフォリオ..."
│        （16px, Inter, Regular, #364153）
│
├─ Section 2
│  ├─ Heading 2: "良い目標設定の例"
│  └─ Container
│     ├─ Heading 3: "❌ 悪い例"（16px, 600, #101828）
│     ├─ List Item Text（複数行）
│     ├─ Heading 3: "✅ 良い例"
│     └─ List（Column, Gap: 8px）
│        ├─ List Item 1
│        ├─ List Item 2
│        └─ List Item 3
│
└─ Section 3
   ├─ Heading 2: "効果的な目標の立て方"
   └─ Paragraph: "SMART原則（具体的・測定可能..."
```

### 詳細スペーシング

| 箇所                 | サイズ | 説明                |
| -------------------- | ------ | ------------------- |
| セクション間         | 48px   | 大きな見出し区切り  |
| Heading 2 直下       | 24px   | 見出し ↔ 段落       |
| 段落下               | 24px   | 段落 ↔ 次の要素     |
| リスト項目間         | 8px    | 箇条書き項目        |
| リスト左インデント   | 21.5px | 記号 + テキスト開始 |
| 複数要素セクション内 | 32px   | 異なるブロック間    |

### テキストスタイル一覧

| 用途       | フォント | サイズ | ウェイト | 行高 | 色      |
| ---------- | -------- | ------ | -------- | ---- | ------- |
| Heading 2  | Inter    | 20px   | 700      | 32px | #101828 |
| Heading 3  | Inter    | 16px   | 600      | 28px | #101828 |
| 段落       | Inter    | 16px   | 400      | 26px | #364153 |
| リスト項目 | Inter    | 16px   | 400      | 26px | #364153 |

### データ例

```json
{
  "richTextSection": {
    "sections": [
      {
        "type": "section",
        "content": [
          {
            "type": "heading2",
            "text": "アウトプット目標の重要性"
          },
          {
            "type": "paragraph",
            "text": "「Figmaを学ぶ」よりも「Figmaでポートフォリオ..."
          }
        ]
      },
      {
        "type": "section",
        "content": [
          {
            "type": "heading2",
            "text": "良い目標設定の例"
          },
          {
            "type": "container",
            "content": [
              {
                "type": "heading3",
                "text": "❌ 悪い例"
              },
              {
                "type": "list",
                "items": [
                  { "text": "架空のECサイトのUIデザインを3画面作成する" },
                  { "text": "Daily UIチャレンジを30日間続けて..." }
                ]
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### 仕様書参照

📄 [richtext-section_design_spec.md](richtext-section_design_spec.md)

---

## 🔗 セクション 4: Content Navigation（前後記事遷移）

### 位置とサイズ

```
Rich Text Section の下（ギャップ24px）
幅: 720px（Fill）
高さ: Hug（自動調整）
```

### 構成

```
Content Navigation
├─ Layout: Row（space-between）
├─ Gap: 216px（前後カード間）
│
├─ Previous Article Card
│  ├─ Layout: Row
│  ├─ Padding: 16px
│  ├─ Border: 1px #DEDEDE
│  ├─ Border-radius: 16px
│  ├─ Background: #FFFFFF
│  │
│  ├─ Left Arrow Icon（24x24px）
│  │  └─ SVG: 左向き矢印
│  │
│  └─ Text Container
│     ├─ Label: "前"
│     │  （10px, Noto Sans JP, 500, #787878）
│     └─ Title: "ToDoサービスの基本UIをつくろう 💪"
│        （12px, Hind, 600, #101828）
│
└─ Next Article Card（Variant2）
   ├─ Layout: Row（mirror）
   ├─ Padding: 16px
   ├─ Border: 1px #DEDEDE
   ├─ Border-radius: 16px
   ├─ Background: #FFFFFF
   │
   ├─ Text Container（左側）
   │  ├─ Label: "次"
   │  └─ Title: "動画のやり方を真似して進めよう"
   │
   └─ Right Arrow Icon（24x24px, 右側）
      └─ SVG: 右向き矢印
```

### スペーシング詳細

| 箇所                   | サイズ |
| ---------------------- | ------ |
| メインコンテナギャップ | 216px  |
| カード内ギャップ       | 11px   |
| カードパディング       | 16px   |
| テキスト内ギャップ     | 4px    |

### インタラクション

- **クリック**: 記事 URL にナビゲート
- **ホバー**: 背景 #F5F5F5、ボーダー #CCCCCC
- **キーボード**: Tab で フォーカス、Enter で 実行

### データ例

```json
{
  "contentNavigation": {
    "previousArticle": {
      "id": "article_prev",
      "label": "前",
      "title": "ToDoサービスの基本UIをつくろう 💪",
      "articleUrl": "/articles/article_prev"
    },
    "nextArticle": {
      "id": "article_next",
      "label": "次",
      "title": "動画のやり方を真似して進めよう",
      "articleUrl": "/articles/article_next"
    }
  }
}
```

### 仕様書参照

📄 [content-navigation_design_spec.md](content-navigation_design_spec.md)

---

## 🎬 ビデオ埋め込みセクション（上部）

### 概要

記事のメインコンテンツの前に、ビデオプレーヤー（Vimeo）が配置されます。ページの上部に固定。

| プロパティ | 値             |
| ---------- | -------------- |
| **幅**     | 1260px（全幅） |
| **高さ**   | 692px          |
| **背景**   | 黒（#000000）  |
| **配置**   | ページ最上部   |

### 内部構成

```
Video Embed Container
├─ Vimeo Player
│  ├─ Size: 1260x692px
│  ├─ Play Button: Center（80x80px）
│  └─ Overlay: Gradient（下部）
│
└─ Player Controls
   ├─ Progress Bar
   │  ├─ Background: グレー #DEDEDE
   │  ├─ Progress: グラデーション
   │  ├─ Duration: "0分" ← "12分"
   │  └─ Height: 4px
   │
   └─ Playback Info
      ├─ Current: "0分"（14px, Inter）
      ├─ Total: "12分"（14px, Inter）
      └─ Color: #FFFFFF
```

---

## 🔢 完全なページ統合レイアウト

### HTML 構造

```html
<div class="page-wrapper">
  <!-- 1. ビデオ埋め込み -->
  <div class="video-section">
    <div class="vimeo-embed">
      <!-- Vimeo プレーヤー -->
    </div>
  </div>

  <!-- 2. 記事コンテンツ（720px中央）-->
  <div class="article-container">
    <!-- 2-1. ヘッダーセクション -->
    <div class="heading-section">
      <!-- heading-section コンポーネント -->
    </div>

    <!-- 2-2. TODO セクション -->
    <div class="todo-section">
      <!-- todo コンポーネント -->
    </div>

    <!-- 2-3. Richテキスト -->
    <div class="richtext-section">
      <!-- richtext コンポーネント -->
    </div>

    <!-- 2-4. コンテンツナビゲーション -->
    <div class="content-navigation">
      <!-- content_navigation コンポーネント -->
    </div>
  </div>
</div>
```

### CSS 構造

```css
/* ページ全体 */
.page-wrapper {
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* ビデオセクション（全幅） */
.video-section {
  width: 100vw;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

.vimeo-embed {
  width: 1260px;
  height: 692px;
  background-color: #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

/* 記事コンテナ（720px） */
.article-container {
  width: 720px;
  padding: 32px 0;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* 各セクション */
.heading-section,
.todo-section,
.richtext-section,
.content-navigation {
  width: 100%;
}
```

### React コンポーネント統合例

```jsx
import React, { useState, useEffect } from "react";
import { HeadingSection } from "./components/HeadingSection";
import { TodoSection } from "./components/TodoSection";
import { RichTextSection } from "./components/RichTextSection";
import { ContentNavigation } from "./components/ContentNavigation";
import { VideoEmbed } from "./components/VideoEmbed";

export function ArticleDetailPage({ articleId }) {
  const [articleData, setArticleData] = useState(null);

  useEffect(() => {
    // API から記事データを取得
    fetch(`/api/articles/${articleId}`)
      .then((res) => res.json())
      .then((data) => setArticleData(data));
  }, [articleId]);

  if (!articleData) return <div>Loading...</div>;

  return (
    <div className="page-wrapper">
      {/* ビデオセクション */}
      <VideoEmbed videoUrl={articleData.videoUrl} />

      {/* 記事コンテンツ */}
      <div className="article-container">
        <HeadingSection data={articleData.headingSection} />
        <TodoSection data={articleData.todoSection} />
        <RichTextSection data={articleData.richTextSection} />
        <ContentNavigation data={articleData.contentNavigation} />
      </div>
    </div>
  );
}
```

---

## 📐 ページレスポンシブ対応

### デスクトップ（1260px+）

- ビデオ幅: 1260px（固定）
- 記事コンテナ: 720px（中央）
- パディング: 45px（外側）
- すべてのセクション: 満幅表示

### タブレット（820px - 1260px）

```css
.page-wrapper {
  padding: 0 20px;
}

.video-section {
  /* 全幅表示を維持 */
}

.article-container {
  width: 100%;
  max-width: 720px;
}
```

### モバイル（360px - 820px）

```css
.article-container {
  width: 100%;
  padding: 16px;
  gap: 16px;
}

.video-section {
  width: 100vw;
  height: auto;
  aspect-ratio: 16 / 9;
}

/* 各セクション内のレスポンシブ対応 */
.heading-section {
  /* 別途メディアクエリで対応 */
}

.todo-section {
  /* 別途メディアクエリで対応 */
}

.content-navigation {
  flex-direction: column;
  gap: 12px;
}
```

---

## 📊 ページ全体のデータフロー

```
API / CMS
  ↓
  ↓ GET /api/articles/{articleId}
  ↓
ArticleData JSON
  {
    videoUrl: "...",
    headingSection: { ... },
    todoSection: { ... },
    richTextSection: { ... },
    contentNavigation: { ... }
  }
  ↓
  ↓ React Props
  ↓
ArticleDetailPage Component
  ├─ VideoEmbed
  ├─ HeadingSection
  ├─ TodoSection
  ├─ RichTextSection
  └─ ContentNavigation
  ↓
ブラウザに表示
```

### API レスポンス例

```json
{
  "article": {
    "id": "article_001",
    "videoUrl": "https://vimeo.com/...",
    "headingSection": {
      "questNumber": 2,
      "stepNumber": 5,
      "title": "学ぶものとつくるものを把握しよう",
      "description": "...",
      "actions": {
        "completed": false,
        "favorited": false
      }
    },
    "todoSection": {
      "title": "身につけること",
      "items": [
        { "id": "todo_001", "text": "...", "completed": false },
        { "id": "todo_002", "text": "...", "completed": false }
      ]
    },
    "richTextSection": {
      "sections": [
        {
          "type": "section",
          "content": [ ... ]
        }
      ]
    },
    "contentNavigation": {
      "previousArticle": { ... },
      "nextArticle": { ... }
    }
  }
}
```

---

## 🔄 ユーザーインタラクションフロー

### ページロード時

1. ビデオプレーヤーロード
2. ヘッダーセクション表示
3. TODO リスト表示
4. 本文コンテンツ表示
5. 前後記事ナビゲーション表示

### ユーザーアクション

**ボタンクリック（ヘッダー）**

```
完了にする → todo 状態を completed: true に更新 → UI 更新（色変更）
お気に入り → favorited: true に更新 → 表示更新
シェア → シェアダイアログを表示
次の動画 → 次のコンテンツページへナビゲート
```

**TODO 項目クリック（TODO セクション）**

```
クリック → completed フラグをトグル → UI 更新（色変更、取り消し線）
```

**前後記事カードクリック（ナビゲーション）**

```
クリック → 記事 URL にナビゲート
```

---

## ✅ 統合実装チェックリスト

### ビジュアル確認

- [ ] ビデオセクション（1260x692px）が表示される
- [ ] 記事コンテナが 720px 幅で中央表示される
- [ ] すべてのセクションが 24px ギャップで区切られている
- [ ] すべての色値が仕様通り
- [ ] すべてのフォントサイズ・ウェイトが仕様通り

### Heading Section

- [ ] クエスト情報表示（クエスト N / ステップ N）
- [ ] タイトル表示（28px, Noto Sans JP, Bold）
- [ ] 説明文表示（16px, Inter, Regular）
- [ ] 3 つの左ボタン表示（完了・お気に入い・シェア）
- [ ] 右側に「次の動画」ボタン表示
- [ ] ボタンの色・スタイルが正確

### TODO Section

- [ ] ヘッダーブロック背景 #F5F5F5
- [ ] 「身につけること」タイトル表示
- [ ] 複数の TODO 項目が表示される
- [ ] 各項目に 6x6px の円マーク
- [ ] テキストが Noto Sans JP 14px
- [ ] TODO 項目のクリック時に状態が更新される

### Rich Text Section

- [ ] Heading 2 が 20px で表示
- [ ] Heading 3 が 16px で表示
- [ ] 段落テキストが 16px で表示
- [ ] リスト項目に「・」マークが表示
- [ ] リスト左インデント 21.5px
- [ ] テキストが自動折返し

### Content Navigation

- [ ] 前の記事カードに左矢印
- [ ] 次の記事カードに右矢印
- [ ] ラベル「前」「次」が表示
- [ ] タイトルが表示
- [ ] 前後カード間のギャップ 216px
- [ ] クリック時にナビゲーション

### インタラクション

- [ ] すべてのボタンがクリック可能
- [ ] ホバー時に視覚的フィードバック
- [ ] 状態変更が正しく反映
- [ ] ナビゲーション機能が動作

### レスポンシブ

- [ ] デスクトップ（1260px+）で正常表示
- [ ] タブレット（820px ～）で正常表示
- [ ] モバイル（360px ～）で正常表示
- [ ] モバイルで縦配置（content-navigation）

### パフォーマンス

- [ ] ページ読み込み速度 < 3 秒
- [ ] スクロール時のフレームレート > 60fps
- [ ] 大量コンテンツ時にも対応

### セキュリティ

- [ ] XSS 対策（入力テキストのサニタイズ）
- [ ] CSRF 対策（トークン確認）
- [ ] 認証チェック

### アクセシビリティ

- [ ] キーボード操作可能
- [ ] スクリーンリーダー対応（ARIA ラベル）
- [ ] カラーコントラスト基準を満たす
- [ ] 見出しレベルが正しい（h1, h2, h3）

---

## 🚀 実装ステップ

### Phase 1: 基盤構築

1. ページラッパーコンポーネント作成
2. レイアウト CSS 定義
3. API 連携設定

### Phase 2: コンポーネント実装

1. HeadingSection コンポーネント実装
2. TodoSection コンポーネント実装
3. RichTextSection コンポーネント実装
4. ContentNavigation コンポーネント実装

### Phase 3: 統合テスト

1. ビジュアル確認
2. インタラクション確認
3. レスポンシブテスト
4. ブラウザ互換性テスト

### Phase 4: 本番リリース

1. パフォーマンス最適化
2. SEO 対応
3. アナリティクス設定
4. A/B テスト準備

---

## 📚 参照ドキュメント

各コンポーネントの詳細仕様は以下を参照してください：

1. **Heading Section** → [heading-section_design_spec.md](heading-section_design_spec.md)
2. **TODO Section** → [todo-section_design_spec.md](todo-section_design_spec.md)
3. **Rich Text Section** → [richtext-section_design_spec.md](richtext-section_design_spec.md)
4. **Content Navigation** → [content-navigation_design_spec.md](content-navigation_design_spec.md)

---

## 🎯 実装上の注意点

### 1. データ整合性

すべてのコンポーネントは単一の `articleData` オブジェクトから生成されます。データの不整合を防ぐため：

```jsx
// Good: 単一のソースから各セクションにデータを渡す
const articleData = fetchArticle(articleId);
<HeadingSection data={articleData.headingSection} />
<TodoSection data={articleData.todoSection} />

// Bad: 複数の API 呼び出し（不整合リスク）
const heading = fetchHeading();
const todos = fetchTodos();
```

### 2. 状態管理

ボタンクリック時の状態変更は、Redux または Context API を使用してグローバル状態として管理することを推奨します：

```jsx
// Redux 例
const dispatch = useDispatch();
const onCompleteClick = () => {
  dispatch(updateArticleCompletion({ articleId, completed: true }));
};
```

### 3. パフォーマンス最適化

大量の TODO 項目がある場合は、仮想スクロール（react-window）の使用を検討：

```jsx
import { FixedSizeList } from "react-window";

<FixedSizeList height={600} itemCount={todos.length} itemSize={26}>
  {({ index, style }) => <TodoItem key={todos[index].id} style={style} />}
</FixedSizeList>;
```

### 4. SEO 対応

記事ページは SEO が重要です。以下を実装してください：

```jsx
// Next.js 例
export async function getServerSideProps({ params }) {
  const article = await fetchArticle(params.id);
  return {
    props: { article },
    revalidate: 3600, // 1時間ごとに再生成
  };
}

// Head タグ設定
<Head>
  <title>{article.title} | Kaizen Onboarding</title>
  <meta name="description" content={article.description} />
  <meta property="og:title" content={article.title} />
  <meta property="og:description" content={article.description} />
</Head>;
```

### 5. アナリティクス

ユーザーインタラクションを追跡：

```jsx
const trackEvent = (eventName, data) => {
  gtag("event", eventName, data);
};

// ボタンクリック時
const onCompleteClick = () => {
  trackEvent("article_completed", { articleId });
  // ...
};
```

---

## 📞 質問・トラブルシューティング

### Q: コンポーネント間でデータ共有する最良の方法は？

**A:** React Context または Redux を使用してください。複数のコンポーネント間で共有される `completed`, `favorited` などの状態は特にグローバル状態管理が必要です。

### Q: ビデオの読み込みが遅い場合の対策は？

**A:** Vimeo iframe に `loading="lazy"` 属性を追加するか、Intersection Observer API を使用して画面内に入ったときにのみ読み込みを開始してください。

### Q: モバイルで読みやすくするには？

**A:** フォントサイズを 90-95% に縮小し、行高を 1.5em 統一。パディングを 12px に縮小してください。

### Q: TODO 項目が 100 個以上ある場合の対応は？

**A:** 仮想スクロール（react-window）またはページネーション機能の実装を検討してください。

---

## 🔗 関連リンク

- **Figma Design**: [記事詳細ページデザイン](https://www.figma.com/design/v4tNiQnPCjzSFFDmdcEYSh)
- **GitHub Repository**: `kaizen-onboarding`
- **API Documentation**: `/api-docs`
- **Component Library**: `@kaizen/components`

---

## 最後に

このガイドに従うことで、一貫性のある高品質な記事詳細ページを実装できます。各コンポーネントは独立して設計されていますが、全体で一つの統合されたユーザー体験を提供します。

何か不明な点がございましたら、デザインチームまでお問い合わせください。

**Happy Coding! 🚀**
