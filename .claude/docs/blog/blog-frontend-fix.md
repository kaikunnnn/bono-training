# BONO Blog フロント修正ドキュメント

## 📍 現在の実装コンポーネント一覧

### ページ

- **`src/pages/blog/index.tsx`**
  - メインブログページ
  - 構成: BackgroundGradation → BlogHeader → HeroSection → BlogList → Pagination → Footer

### コンポーネント

以下の内容を１つずつ実装します。丁寧にお願いします。
わからない内容や疑問点は実装前におしえてください

#### 1. BackgroundGradation

- **パス**: `src/components/blog/BackgroundGradation.tsx`
- **役割**: 全画面背景グラデーション（SVG）
- **仕様**: 99frontend/background-gradation-implementation.md

#### 2. BlogHeader

- **パス**: `src/components/blog/BlogHeader.tsx`
- **役割**: ヘッダー（BONO ロゴ）
- **サイズ**: 高さ 74.07px
- **仕様**: 99frontend/navigation-blog.md

#### 3. HeroSection

- **パス**: `src/components/blog/HeroSection.tsx`
- **役割**: "HOPE." タイトルセクション
- **サイズ**: 高さ 381px、背景色 #E8E6EA
- **仕様**: 99frontend/herosection.md

#### 4. BlogItem

- **パス**: `src/components/blog/BlogItem.tsx`
- **役割**: ブログカード（記事 1 件）
- **サイズ**: 1120px × 159px
- **仕様**: 99frontend/blogcard.md

#### 5. BlogList

- **パス**: `src/components/blog/BlogList.tsx`
- **役割**: 記事一覧（BlogItem の縦並び）
- **レイアウト**: 1 列表示

#### 6. Pagination

- **パス**: `src/components/blog/Pagination.tsx`
- **役割**: ページネーション
- **ボタンサイズ**: 40px × 40px

---

## 📐 全体レイアウト仕様

**仕様書**: [overall-layout.md](./99frontend/overall-layout.md)

- ページ構造図
- z-index 階層
- レスポンシブ対応
- 実装ポイント

---

## 🔧 修正項目チェックリスト

### BackgroundGradation

- 記事の詳細ページも共通のグラデーションしたい
- [ ]

### BlogHeader

- 白い背景が必要ないですし、BONO の部分もロゴデータを使います
- [ ]

### HeroSection

- 変な背景がついてます必要ないです。美しいグラーデションの上に表示 d す
- HOPE 部分が SVG を使えてないです
- [ ]

### BlogItem

- タイトルのフォントサイズがおかしいです
- [ ]

### BlogList

- 全体デザインを参考にデスクトップ時の横幅をまず決めてそのイメージで実装
- レスポンシブに関してはデスクトップのデザインをベースに同じ表現イメージになるように考えてほしいです
- [ ]

### footer

- /blog 配下の専用フッターです。
- こちらのデザインに変えてほしいです

- [ ]

### 全体レイアウト

- .claude/docs/blog/99frontend/overall-layout.md にきさい
- コンポーネントを使ってデザインします

---

## 📝 メモ
