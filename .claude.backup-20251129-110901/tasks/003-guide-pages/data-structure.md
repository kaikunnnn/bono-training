# データ構造

## ディレクトリ構造

```
content/
  guide/
    career/
      job-change-roadmap/
        index.md          # 転職ロードマップ
      designer-career-path/
        index.md          # デザイナーのキャリアパス
    learning/
      good-bad-study-methods/
        index.md          # 良い勉強法・悪い勉強法
      how-to-learn-design/
        index.md          # デザインの学び方
    industry/
      ai-and-designers/
        index.md          # AIでデザイナー職がどう変わるのか
      design-tools-guide/
        index.md          # デザインツールの選び方
```

## Frontmatter 構造

各 `index.md` のメタデータ（YAML形式）

```yaml
---
# 基本情報
title: "転職を成功させるデザイナーのロードマップ"
description: "未経験からデザイナーへ、またはデザイナーとしてキャリアアップするための具体的なステップを解説"
slug: "job-change-roadmap"

# 分類
category: "career"           # キャリア、学習方法、業界動向など
tags:                        # 複数タグ対応
  - "転職"
  - "キャリア"
  - "ロードマップ"

# 表示設定
thumbnail: "/assets/guide/job-change-roadmap.jpg"
icon: "/assets/emoji/rocket.svg"
order_index: 1               # カテゴリ内での表示順

# メタ情報
author: "BONO"
publishedAt: "2025-01-15"
updatedAt: "2025-01-20"
readingTime: "10分"

# アクセス制限
isPremium: false             # プレミアム限定かどうか

# SEO
seo:
  title: "転職を成功させるデザイナーのロードマップ | BONO"
  description: "未経験からデザイナーへ転職する方法を徹底解説"
  keywords: ["デザイナー", "転職", "ロードマップ", "キャリア"]

# 関連記事
relatedGuides:
  - "designer-career-path"
  - "good-bad-study-methods"
---

# 記事本文（Markdown）
## 見出し1
本文...
```

## TypeScript 型定義

```typescript
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

  // SEO
  seo?: {
    title: string;
    description: string;
    keywords: string[];
  };

  // 関連記事
  relatedGuides?: string[];

  // コンテンツ
  content?: string; // Markdown本文
}

export type GuideCategory =
  | "career"      // キャリア
  | "learning"    // 学習方法
  | "industry"    // 業界動向
  | "tools";      // ツール・技術

export interface GuideCategoryInfo {
  id: GuideCategory;
  label: string;
  description: string;
  icon?: string;
}
```

## カテゴリ定義

```typescript
export const GUIDE_CATEGORIES: GuideCategoryInfo[] = [
  {
    id: "career",
    label: "キャリア",
    description: "転職やキャリアパスに関するガイド",
    icon: "briefcase"
  },
  {
    id: "learning",
    label: "学習方法",
    description: "効果的な学習方法とスキルアップのコツ",
    icon: "book-open"
  },
  {
    id: "industry",
    label: "業界動向",
    description: "デザイン業界のトレンドと未来",
    icon: "trending-up"
  },
  {
    id: "tools",
    label: "ツール・技術",
    description: "デザインツールの使い方と選び方",
    icon: "wrench"
  }
];
```

## API / Hooks

既存の `/training` パターンを踏襲

```typescript
// src/hooks/useGuides.ts
export const useGuides = () => {
  return useQuery({
    queryKey: ['guides'],
    queryFn: async () => {
      const guides = await loadGuides();
      return guides;
    }
  });
};

export const useGuide = (slug: string) => {
  return useQuery({
    queryKey: ['guide', slug],
    queryFn: async () => {
      const guide = await loadGuide(slug);
      return guide;
    }
  });
};

export const useGuidesByCategory = (category: GuideCategory) => {
  return useQuery({
    queryKey: ['guides', 'category', category],
    queryFn: async () => {
      const guides = await loadGuidesByCategory(category);
      return guides;
    }
  });
};
```

## ファイル読み込み

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
      slug: extractSlug(path)
    } as Guide;
  });

  return guides.sort((a, b) => a.order_index - b.order_index);
}
```
