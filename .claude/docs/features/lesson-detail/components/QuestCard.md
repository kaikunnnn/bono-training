# QuestCard コンポーネント仕様

**作成日**: 2025-01-15
**Figmaリンク**: [node-id=437:3414](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=437:3414)

---

## 概要

クエストカード全体（ヘッダー + 記事リスト）

```
┌─────────────────────────────────────────────────┐
│  QuestCardHeader                                │
│  (タイトル + ゴール説明)                         │
├─────────────────────────────────────────────────┤
│  ArticleItem 1                                  │
├─────────────────────────────────────────────────┤
│  ArticleItem 2                                  │
├─────────────────────────────────────────────────┤
│  ArticleItem 3                                  │
└─────────────────────────────────────────────────┘
```

---

## レイアウト構造

```
QuestCard (カード全体)
├── Border (内側ボーダー)
├── Background+Shadow (背景 + シャドウ)
│   ├── QuestCardHeader (ヘッダー)
│   └── ArticleLists (記事リストコンテナ)
│       └── ArticleItem[] (記事アイテム × n)
```

---

## Figma仕様

### 外側コンテナ

| プロパティ | 値 |
|-----------|-----|
| 最大幅 | **743px** |
| 幅 | 100% |
| レイアウト | flex, flex-col |
| 整列 | items-start, justify-center |

### ボーダー（内側）

| プロパティ | 値 |
|-----------|-----|
| 位置 | absolute, inset: 1px |
| ボーダー | **1px solid rgba(0, 0, 0, 0.06)** |
| 角丸 | **23px** |

### 背景 + シャドウ

| プロパティ | 値 |
|-----------|-----|
| 背景色 | **#FFFFFF** (白) |
| 角丸 | **24px** |
| シャドウ | **1px 1px 4px rgba(0, 0, 0, 0.08)** |
| オーバーフロー | hidden (clip) |
| 最大幅 | 743px |
| 幅 | 100% |

---

## 子コンポーネント

### QuestCardHeader

**別ファイル参照**: `QuestCardHeader.md`

### ArticleItem

**別ファイル参照**: `ArticleItem.md`

記事リストのコンテナ仕様:
| プロパティ | 値 |
|-----------|-----|
| レイアウト | flex, flex-col |
| 整列 | items-start |
| 幅 | 100% |

---

## Props

```tsx
interface QuestCardProps {
  /** クエストタイトル */
  title: string;

  /** ゴール説明（オプション） */
  goal?: string;

  /** 記事リスト */
  articles: Article[];

  /** 完了済み記事IDリスト */
  completedArticleIds?: string[];
}

interface Article {
  _id: string;
  articleNumber: number;
  title: string;
  slug: { current: string };
  thumbnail?: any;
  thumbnailUrl?: string;
  videoDuration?: number;
  articleType: "video" | "text";
  tag?: string;
  isPremium?: boolean;
}
```

---

## 実装コード

```tsx
import { QuestCardHeader } from "./QuestCardHeader";
import { ArticleItem } from "./ArticleItem";

interface QuestCardProps {
  title: string;
  goal?: string;
  articles: Article[];
  completedArticleIds?: string[];
}

export function QuestCard({
  title,
  goal,
  articles,
  completedArticleIds = [],
}: QuestCardProps) {
  return (
    <div className="relative max-w-[743px] w-full">
      {/* 内側ボーダー */}
      <div className="absolute inset-px border border-black/[0.06] rounded-[23px] pointer-events-none" />

      {/* 背景 + シャドウ */}
      <div className="bg-white rounded-[24px] shadow-[1px_1px_4px_rgba(0,0,0,0.08)] overflow-hidden w-full">
        {/* ヘッダー */}
        <QuestCardHeader title={title} goal={goal} />

        {/* 記事リスト */}
        <div className="flex flex-col items-start w-full">
          {articles.map((article) => (
            <ArticleItem
              key={article._id}
              articleNumber={article.articleNumber}
              title={article.title}
              slug={article.slug.current}
              thumbnail={article.thumbnail}
              thumbnailUrl={article.thumbnailUrl}
              videoDuration={article.videoDuration}
              articleType={article.articleType}
              isCompleted={completedArticleIds.includes(article._id)}
              tag={article.tag}
              isPremium={article.isPremium}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
```

---

## Tailwind クラス対応表

| Figma値 | Tailwind |
|---------|----------|
| max-width: 743px | `max-w-[743px]` |
| border-radius: 24px | `rounded-[24px]` |
| border-radius: 23px | `rounded-[23px]` |
| border: 1px solid rgba(0,0,0,0.06) | `border border-black/[0.06]` |
| box-shadow: 1px 1px 4px rgba(0,0,0,0.08) | `shadow-[1px_1px_4px_rgba(0,0,0,0.08)]` |
| background: white | `bg-white` |
| overflow: hidden | `overflow-hidden` |
| position: absolute, inset: 1px | `absolute inset-px` |

---

## 注意事項

- ボーダーは**内側**に1px入れる設計（inset-px）
- カードの角丸（24px）とボーダーの角丸（23px）は**1px差**がある
- シャドウは軽め（0.08透明度）
- 記事リストの境界線は ArticleItem 側で定義（border-b）
