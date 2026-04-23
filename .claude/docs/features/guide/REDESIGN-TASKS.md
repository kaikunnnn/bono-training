# ガイド詳細ページ リデザイン タスク一覧

**作成日**: 2026-04-13
**ブランチ**: `feature/guide-page`
**参照Figma**: https://www.figma.com/design/bJ33ufbqjh0TcxhbU7Mj4H?node-id=8-2

---

## 前提確認（調査済み）

| 項目 | 状況 |
|------|------|
| 背景色トークン | `--bg-base: #F9F9F7` がデザインシステムに定義済み |
| グラデーション | `.bg-Top` クラスが `src/index.css` に定義済み（Training headerで使用中） |
| `Guide.thumbnail` | `thumbnail?: string` フィールドが型定義・guideLoader に存在。一部Markdownに設定済み |
| `Guide.authorAvatar` | フィールドなし → 追加が必要 |
| アバター画像の置き場 | `public/assets/authors/` に配置 |
| Rounded M+ 1c Bold | Guide一覧ページで既にロード済み。詳細ページへの適用は問題なし |

---

## タスク一覧

### Task 1: ページ全体の背景・グラデーション適用
- **対象**: `src/pages/Guide/GuideDetail.tsx`
- **内容**:
  - 背景色を `bg-white` から `bg-[var(--bg-base)]` に変更
  - ページ上部に `.bg-Top` クラスのグラデーションオーバーレイを追加（高さ148px、`pointer-events-none` でコンテンツに影響しないよう設定）
- **備考**: 色はデザインシステムトークンを使用。Figmaの生値は使わない

---

### Task 2: ブレッドクラムを3階層に変更
- **対象**: `src/components/guide/GuideHeader.tsx`
- **内容**:
  - `ガイド > タイトル` → `ガイド > カテゴリ名 > タイトル` に変更
  - `guide.category` から日本語ラベルに変換（例: `career` → `キャリア`）
  - 既存の `GuideCategoryInfo` の `label` を参照
- **備考**: shadcn の `<Breadcrumb>` コンポーネントをそのまま使用

---

### Task 3: GuideHeader レイアウトを中央揃え・幅制限に変更
- **対象**: `src/components/guide/GuideHeader.tsx`
- **内容**:
  - ヘッダー全体を中央揃え（`flex flex-col items-center`）
  - コンテンツを `max-w-[640px] w-full` でレスポンシブに制限
  - 白背景エリア（`bg-white border-b`）を削除し、ページ背景と一体化

---

### Task 4: カテゴリ表示をシンプルテキストに変更
- **対象**: `src/components/guide/GuideHeader.tsx`
- **内容**:
  - `<CategoryBadge>` を削除
  - シンプルテキスト `text-[12px] font-medium text-foreground` に変更（デザインシステムトークン使用）

---

### Task 5: H1タイトルを Rounded M+ 1c Bold に変更
- **対象**: `src/components/guide/GuideHeader.tsx`
- **内容**:
  - フォント: `font-['Rounded_Mplus_1c_Bold',sans-serif]`
  - サイズ: `text-[41px]`
  - 揃え: 中央揃え
  - 幅: 固定しない。`text-balance` または `word-break: keep-all` で自然な改行

---

### Task 6: 著者情報を中央揃え・アバター付きに変更
- **対象**: `src/components/guide/GuideHeader.tsx`
- **内容**:
  - レイアウト: 中央揃え、横並び（アバター + 名前 + `・` + 日付）
  - アバター: `guide.authorAvatar` が存在すれば `<img>` で表示（20px円形）、なければ名前のみ
  - Lucide アイコン（User, Calendar, Clock）は削除
  - **読了時間（readingTime）は削除**
- **備考**: Task 7 の型追加が前提

---

### Task 7: Guide型に `authorAvatar` フィールドを追加
- **対象**:
  - `src/types/guide.ts`
  - `src/lib/guideLoader.ts`
- **内容**:
  - `authorAvatar?: string` フィールドを追加
  - guideLoaderで `frontmatter.authorAvatar` を読み込むよう追加
  - アバター画像の置き場: `public/assets/authors/{著者名}.jpg` を想定
  - Markdownフロントマターに `authorAvatar: /assets/authors/kaikun.jpg` 形式で設定

---

### Task 8: サムネイル画像ブロックを追加
- **対象**: `src/components/guide/GuideHeader.tsx`
- **内容**:
  - `guide.thumbnail` がある場合のみ表示（なければ省略）
  - アスペクト比: **16:9**（`aspect-video`）
  - 幅: `max-w-[640px] w-full`（レスポンシブ）
  - スタイル: `bg-white rounded-[20px] overflow-hidden`
  - 画像: `<img src={guide.thumbnail} className="w-full h-full object-cover" />`

---

### Task 9: コンテンツ本文の幅を640px中央揃えに変更
- **対象**: `src/components/guide/GuideContent.tsx` または `src/pages/Guide/GuideDetail.tsx`
- **内容**:
  - コンテンツラッパーに `max-w-[640px] w-full mx-auto` を適用
  - レスポンシブ対応

---

### Task 10: コンテンツ内の見出し・本文スタイルを更新
- **対象**: `src/components/guide/GuideContent.tsx`
- **内容**:
  - H1: `text-2xl font-bold leading-9 text-foreground` (24px)
  - H2: `text-lg font-bold leading-8 text-foreground border-b border-border pb-2` (18px)
  - H3: `text-base font-bold text-foreground` (16px、H2から2px差)
  - H4: `text-sm font-bold text-foreground` (14px、H3から2px差)
  - 段落: `text-[15px] leading-[26px] text-gray-700`（デザインシステムで近いもの: `text-muted-foreground` or `text-foreground/80`）
  - リスト: `text-[15px] leading-6 text-gray-700`
  - **セクション間 gap**: 親コンテナに `flex flex-col gap-[30px]` を適用
- **備考**: 色はデザインシステムトークン優先。Figmaの生値（#374151等）はそのまま使わない

---

### Task 11: タグ表示を削除
- **対象**: `src/components/guide/GuideHeader.tsx`
- **内容**:
  - タグ表示ブロックを削除

---

### Task 12: 目次（TableOfContents）をリッチテキスト内挿入方式に変更
- **対象**: `src/components/guide/GuideContent.tsx`、`src/components/guide/TableOfContents.tsx`
- **内容**:
  - Markdownの任意の位置に `[TOC]` と書くと目次ブロックとしてレンダリング
  - `ReactMarkdown` のカスタムパーサーで `[TOC]` トークンを検出し `<TableOfContents>` コンポーネントに置換
  - 実装方針: `remarkPlugins` に `remark-toc` を追加、または `p` コンポーネントで `[TOC]` テキストを検出してコンポーネントにスワップ
  - 現在のサイドバー的な目次表示は削除

---

### Task 13: 関連ガイドをシンプルデザインで共通コンポーネント化
- **対象**: `src/components/guide/RelatedGuides.tsx`（新規共通コンポーネントに移行）
- **内容**:
  - 現在の `RelatedGuides.tsx` を `src/components/common/RelatedContent.tsx` として汎用化（ガイド以外にも使えるように）
  - デザイン: 今のテイストを踏まえてシンプルに
    - セクションタイトル「関連ガイド」
    - カード形式（サムネイルあれば表示、タイトル、カテゴリ）
    - 横並び 2〜3カード、レスポンシブ
  - データ: `guide.relatedGuides`（slug配列）から記事を取得して表示

---

## 実装順序（推奨）

```
Task 7 (型追加) → Task 3+4+5+6 (Header刷新) → Task 8 (サムネイル)
→ Task 2 (パンくず) → Task 9+10 (コンテンツ本文) → Task 11 (タグ削除)
→ Task 1 (背景) → Task 12 (目次) → Task 13 (関連ガイド確認)
```

---

## 確認事項（解決済み）

| # | 質問 | 回答 |
|---|------|------|
| 1 | 目次の挿入方式 | Markdownリッチテキスト内に `[TOC]` で任意設置 |
| 2 | 関連ガイドのFigmaデザイン | なし → 今のテイストでシンプルに、コンポーネント共通化 |
| 3 | H3/H4スタイル | H2(18px)から2px差ずつ → H3=16px, H4=14px |
