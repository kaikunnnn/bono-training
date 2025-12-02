# ガイドページ最終仕様書

**決定日:** 2025-10-31
**方式:** Markdown + 開発環境プレビュー
**理由:** 月額コスト $0、Obsidian連携、実デザインプレビュー可能

---

## 📋 概要

学習ガイド記事（転職ロードマップ、AI×デザイナー、学習方法など）を管理・表示するシステム。
既存の `/training` と同じMarkdownベースで実装し、Obsidianでの執筆をサポート。

---

## 🎯 要件

### 機能要件

#### 1. ガイド一覧ページ (`/guide`)
- カテゴリ別にガイド記事を表示
- 各記事のサムネイル、タイトル、概要、読了時間を表示
- カテゴリフィルター機能
- レスポンシブ対応

#### 2. ガイド詳細ページ (`/guide/:slug`)
- Markdown形式の記事コンテンツを表示
- 目次（Table of Contents）自動生成
- 関連記事の表示
- カテゴリ/タグ表示
- パンくずリスト
- 著者・公開日・更新日・読了時間表示

#### 3. カテゴリページ (`/guide/category/:category`)
- 特定カテゴリの記事一覧表示
- Wiki風のナビゲーション

### 非機能要件

- ✅ Obsidianで執筆可能
- ✅ `npm run dev` で実デザインプレビュー
- ✅ Git でバージョン管理
- ✅ レスポンシブ対応
- ✅ SEO対応（メタタグ、OGP）
- ✅ アクセシビリティ対応
- ✅ 画像の自動圧縮（スクリプト）

---

## 📂 ディレクトリ構造

```
content/
  guide/
    career/                     # キャリア関連
      job-change-roadmap/
        index.md
        assets/                 # 記事専用の画像
          hero.jpg
      designer-career-path/
        index.md
    learning/                   # 学習方法
      good-bad-study-methods/
        index.md
      how-to-learn-design/
        index.md
    industry/                   # 業界動向
      ai-and-designers/
        index.md
      design-tools-guide/
        index.md
    tools/                      # ツール・技術
      figma-tips/
        index.md
```

---

## 📝 Frontmatter 仕様

各 `index.md` のメタデータ：

```yaml
---
# 基本情報
title: "転職を成功させるデザイナーのロードマップ"
description: "未経験からデザイナーへ、またはデザイナーとしてキャリアアップするための具体的なステップを解説します"
slug: "job-change-roadmap"

# 分類
category: "career"              # career | learning | industry | tools
tags:
  - "転職"
  - "キャリア"
  - "ロードマップ"

# 表示設定
thumbnail: "/assets/guide/job-change-roadmap/hero.jpg"
icon: "/assets/emoji/rocket.svg"
order_index: 1                  # カテゴリ内での表示順

# メタ情報
author: "BONO"
publishedAt: "2025-01-15"
updatedAt: "2025-01-20"         # オプション
readingTime: "10分"

# アクセス制限
isPremium: false                # 将来のプレミアム対応

# 関連記事（slug で指定）
relatedGuides:
  - "designer-career-path"
  - "good-bad-study-methods"
  - "how-to-learn-design"
---

# 記事タイトル

記事本文をMarkdownで記述...

## セクション1

内容...

## セクション2

内容...
```

---

## 🎨 カテゴリ定義

| ID | 名称 | 説明 | アイコン |
|----|------|------|----------|
| `career` | キャリア | 転職やキャリアパスに関するガイド | 💼 briefcase |
| `learning` | 学習方法 | 効果的な学習方法とスキルアップのコツ | 📚 book-open |
| `industry` | 業界動向 | デザイン業界のトレンドと未来 | 📈 trending-up |
| `tools` | ツール・技術 | デザインツールの使い方と選び方 | 🔧 wrench |

---

## 💻 技術仕様

### データ型定義

```typescript
// src/types/guide.ts

export type GuideCategory = "career" | "learning" | "industry" | "tools";

export interface Guide {
  // 基本情報
  title: string;
  description: string;
  slug: string;

  // 分類
  category: GuideCategory;
  tags: string[];

  // 表示設定
  thumbnail?: string;
  icon?: string;
  order_index: number;

  // メタ情報
  author: string;
  publishedAt: string;
  updatedAt?: string;
  readingTime: string;

  // アクセス制限
  isPremium: boolean;

  // 関連記事
  relatedGuides?: string[];

  // コンテンツ
  content?: string;           // Markdown本文
}

export interface GuideCategoryInfo {
  id: GuideCategory;
  label: string;
  description: string;
  icon: string;
}
```

### データローダー

```typescript
// src/lib/guideLoader.ts

import yaml from 'js-yaml';

export async function loadGuides(): Promise<Guide[]> {
  const modules = import.meta.glob('/content/guide/**/index.md', {
    as: 'raw',
    eager: true
  });

  const guides = Object.entries(modules).map(([path, content]) => {
    const { frontmatter, markdown } = parseFrontmatter(content);
    return {
      ...frontmatter,
      content: markdown,
      slug: extractSlugFromPath(path)
    } as Guide;
  });

  return guides.sort((a, b) => a.order_index - b.order_index);
}

export async function loadGuide(slug: string): Promise<Guide | null> {
  const guides = await loadGuides();
  return guides.find(g => g.slug === slug) || null;
}

export async function loadGuidesByCategory(category: GuideCategory): Promise<Guide[]> {
  const guides = await loadGuides();
  return guides.filter(g => g.category === category);
}

function parseFrontmatter(content: string) {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) throw new Error('Invalid frontmatter');

  const frontmatter = yaml.load(match[1]);
  const markdown = match[2];

  return { frontmatter, markdown };
}

function extractSlugFromPath(path: string): string {
  // /content/guide/career/job-change-roadmap/index.md
  // → job-change-roadmap
  const parts = path.split('/');
  return parts[parts.length - 2];
}
```

### React Query Hooks

```typescript
// src/hooks/useGuides.ts

import { useQuery } from '@tanstack/react-query';
import { loadGuides, loadGuide, loadGuidesByCategory } from '@/lib/guideLoader';

export const useGuides = () => {
  return useQuery({
    queryKey: ['guides'],
    queryFn: loadGuides,
    staleTime: 5 * 60 * 1000, // 5分
  });
};

export const useGuide = (slug: string) => {
  return useQuery({
    queryKey: ['guide', slug],
    queryFn: () => loadGuide(slug),
    enabled: !!slug,
  });
};

export const useGuidesByCategory = (category: GuideCategory) => {
  return useQuery({
    queryKey: ['guides', 'category', category],
    queryFn: () => loadGuidesByCategory(category),
    enabled: !!category,
  });
};
```

---

## 🖼️ UI コンポーネント設計

### コンポーネント一覧

```
src/components/guide/
  ├── GuideLayout.tsx           # 共通レイアウト
  ├── GuideCard.tsx             # ガイドカード
  ├── GuideGrid.tsx             # グリッド表示
  ├── GuideHero.tsx             # ヒーローセクション
  ├── CategorySection.tsx       # カテゴリセクション
  ├── CategoryBadge.tsx         # カテゴリバッジ
  ├── CategoryFilter.tsx        # カテゴリフィルター
  ├── GuideHeader.tsx           # 記事ヘッダー
  ├── GuideContent.tsx          # Markdownレンダラー
  ├── TableOfContents.tsx       # 目次
  └── RelatedGuides.tsx         # 関連記事
```

### ページ構成

```
src/pages/Guide/
  ├── index.tsx                 # /guide - 一覧ページ
  ├── GuideDetail.tsx           # /guide/:slug - 詳細ページ
  └── Category.tsx              # /guide/category/:category
```

---

## 🔄 ワークフロー

### Obsidianでの執筆フロー

#### 1. **Obsidianの設定**

Vaultを `bono-training/content/guide/` に設定：

```
Obsidian設定 > Vault > Open folder as vault
→ /path/to/bono-training/content/guide/ を選択
```

#### 2. **新規記事作成**

```
content/guide/career/job-change-roadmap/index.md
```

Obsidianで上記ファイルを作成し、Frontmatter + Markdown を記述。

#### 3. **プレビュー確認**

```bash
# ターミナルで開発サーバー起動
cd /path/to/bono-training
npm run dev
```

ブラウザで `http://localhost:5173/guide` を開く。

- ファイル保存すると自動でプレビュー更新（Hot Reload）
- 実際のサイトデザインで確認

#### 4. **下書き管理**

Gitブランチで管理：

```bash
# 下書きブランチ作成
git checkout -b draft/job-change-roadmap

# 執筆中のコミット
git add content/guide/career/job-change-roadmap/
git commit -m "下書き: 転職ロードマップ"

# プレビュー確認後、公開
git checkout main
git merge draft/job-change-roadmap
git push
```

#### 5. **画像追加**

```
content/guide/career/job-change-roadmap/
  ├── index.md
  └── assets/
      ├── hero.jpg
      ├── step1.png
      └── diagram.svg
```

Markdown内で参照：

```markdown
![転職ロードマップ](./assets/hero.jpg)
```

画像圧縮（自動化スクリプト）：

```bash
npm run optimize-images
```

---

## 🚀 ルーティング

### App.tsx

```tsx
import GuidePage from '@/pages/Guide';
import GuideDetailPage from '@/pages/Guide/GuideDetail';
import CategoryPage from '@/pages/Guide/Category';

function App() {
  return (
    <Routes>
      {/* 既存ルート */}
      <Route path="/" element={<Index />} />
      <Route path="/training" element={<TrainingHome />} />

      {/* ガイドページ */}
      <Route path="/guide" element={<GuidePage />} />
      <Route path="/guide/:slug" element={<GuideDetailPage />} />
      <Route path="/guide/category/:category" element={<CategoryPage />} />
    </Routes>
  );
}
```

### グローバルナビゲーション

既存のサイドナビゲーションに「ガイド」を追加：

```tsx
// src/components/navigation/SideNav.tsx

const navItems = [
  { label: "ロードマップ", href: "/roadmap", icon: "map" },
  { label: "レッスン", href: "/lessons", icon: "book" },
  { label: "ガイド", href: "/guide", icon: "compass" }, // 追加
];
```

---

## 🎨 デザイン仕様

### ガイド一覧ページ

- ヒーローセクション
  - タイトル: "学習ガイド"
  - 説明文
- カテゴリセクション（4つ）
  - キャリア
  - 学習方法
  - 業界動向
  - ツール・技術
- 各セクション内でカード表示（3列グリッド）

### ガイド詳細ページ

- パンくずリスト
- 記事ヘッダー
  - カテゴリバッジ
  - タイトル
  - メタ情報（著者、公開日、読了時間）
- 目次（サイドバー or トップ）
- Markdownコンテンツ
  - シンタックスハイライト対応
  - 画像最適化
  - リンクカード
- 関連記事（3-6件）

### レスポンシブ

- モバイル: 1列
- タブレット: 2列
- デスクトップ: 3列

---

## 🛠️ 実装フェーズ

### フェーズ1: データ基盤（2-3時間）

- [ ] `src/types/guide.ts` - 型定義
- [ ] `src/lib/guideCategories.ts` - カテゴリ定義
- [ ] `src/lib/guideLoader.ts` - データローダー
- [ ] `src/hooks/useGuides.ts` - React Query hooks

### フェーズ2: UIコンポーネント（3-4時間）

- [ ] `GuideLayout.tsx`
- [ ] `GuideCard.tsx`
- [ ] `GuideGrid.tsx`
- [ ] `GuideHero.tsx`
- [ ] `CategorySection.tsx`
- [ ] `CategoryBadge.tsx`
- [ ] `GuideHeader.tsx`
- [ ] `GuideContent.tsx`
- [ ] `TableOfContents.tsx`
- [ ] `RelatedGuides.tsx`

### フェーズ3: ページ実装（2-3時間）

- [ ] `src/pages/Guide/index.tsx`
- [ ] `src/pages/Guide/GuideDetail.tsx`
- [ ] `src/pages/Guide/Category.tsx`

### フェーズ4: ルーティング（0.5時間）

- [ ] `App.tsx` にルート追加
- [ ] サイドナビゲーションに「ガイド」追加

### フェーズ5: サンプルコンテンツ（1-2時間）

- [ ] `content/guide/career/job-change-roadmap/index.md`
- [ ] `content/guide/learning/good-bad-study-methods/index.md`
- [ ] `content/guide/industry/ai-and-designers/index.md`

### フェーズ6: 画像最適化（1時間）

- [ ] 画像圧縮スクリプト作成
- [ ] `npm run optimize-images` コマンド追加

### フェーズ7: SEO & アクセシビリティ（1時間）

- [ ] メタタグ設定
- [ ] OGP設定
- [ ] JSON-LD（Article schema）
- [ ] キーボードナビゲーション

### フェーズ8: テスト & デプロイ（1時間）

- [ ] 動作確認
- [ ] レスポンシブテスト
- [ ] パフォーマンステスト
- [ ] デプロイ

**合計: 11.5-14.5時間**

---

## 📸 画像最適化スクリプト

### package.json に追加

```json
{
  "scripts": {
    "optimize-images": "node scripts/optimize-images.js"
  }
}
```

### scripts/optimize-images.js

```javascript
// Sharp などの画像圧縮ライブラリを使用
// content/guide/**/assets/ 配下の画像を自動圧縮
```

詳細は実装時に作成。

---

## 📚 参考実装

既存の `/training` 実装を参考：

- `src/pages/Training/index.tsx`
- `src/hooks/useTrainingCache.ts`
- `src/lib/trainingCache.ts`
- `src/components/training/`
- `content/training/`

同じパターンで実装することで、一貫性を保ちます。

---

## ✅ 完了条件

- [ ] ガイド一覧ページが正常に表示される
- [ ] カテゴリ別にガイドが分類表示される
- [ ] ガイド詳細ページでMarkdownが正しくレンダリングされる
- [ ] 目次が自動生成される
- [ ] 関連記事が表示される
- [ ] レスポンシブデザインが機能する
- [ ] Obsidianで執筆→プレビュー確認のフローが動作する
- [ ] 画像最適化スクリプトが動作する
- [ ] SEO対応が完了している

---

## 📖 運用ドキュメント

実装完了後、以下を作成：

- `docs/guide-workflow.md` - Obsidianでの執筆フロー
- `docs/guide-content-guide.md` - コンテンツ作成ガイド
- `docs/guide-image-optimization.md` - 画像最適化手順

---

以上が最終仕様書です！
