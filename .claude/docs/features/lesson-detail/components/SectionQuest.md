# SectionQuest コンポーネント仕様

**作成日**: 2025-01-15
**現在の実装**: `src/components/lesson/QuestCard.tsx`

---

## 概要

クエスト1ブロック全体（番号行 + 縦点線 + カード）

**このコンポーネントが「クエスト完了状態」を管理する**

```
○ クエスト 01
┊
┊  ┌─────────────────────────────┐
┊  │  タイトル                   │
┊  │  ゴール説明                 │
┊  ├─────────────────────────────┤
┊  │  記事1                      │
┊  │  記事2                      │
┊  │  記事3                      │
┊  └─────────────────────────────┘
```

---

## クエスト完了状態

### 判定ロジック

```tsx
// 現在の実装 (QuestCard.tsx:40-43)
const totalCount = articles.length;
const isQuestCompleted = completedCount === totalCount && totalCount > 0;
```

**条件**:
- `completedCount === totalCount` （完了数 = 記事総数）
- `totalCount > 0` （記事が1つ以上ある）

### 完了状態で変化する要素

| 要素 | 未完了 | 完了 |
|------|--------|------|
| **チェックアイコン** | グレー背景 `#F3F3F3` | 緑背景 `#10B981` + 白チェック |
| **縦点線** | グレー `#E1E1E1` | 緑 `#10B981` |

---

## 現在の実装

### チェックアイコン（49-60行目）

```tsx
<div
  className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
  style={{
    background: isQuestCompleted ? '#10B981' : '#F3F3F3',
    border: isQuestCompleted ? '1px solid #10B981' : '1px solid rgba(0, 0, 0, 0.04)'
  }}
>
  {isQuestCompleted && (
    <Check className="w-3 h-3 text-white" strokeWidth={3} />
  )}
</div>
```

**未完了時:**
- 背景: `#F3F3F3`（薄いグレー）
- ボーダー: `1px solid rgba(0, 0, 0, 0.04)`
- チェックマーク: 非表示

**完了時:**
- 背景: `#10B981`（緑）
- ボーダー: `1px solid #10B981`
- チェックマーク: 白、12px、strokeWidth=3

### 縦点線（82-88行目）

```tsx
<div className="px-[7px] flex items-center">
  <div
    className="self-stretch"
    style={{
      borderLeft: isQuestCompleted ? '1px dotted #10B981' : '1px dotted #E1E1E1'
    }}
  />
</div>
```

**未完了時:**
- `1px dotted #E1E1E1`（グレーの点線）

**完了時:**
- `1px dotted #10B981`（緑の点線）

---

## 新デザインとの差分

### チェックアイコン

| 項目 | 現在の実装 | 新デザイン (Figma) |
|------|-----------|-------------------|
| 未完了背景 | `#F3F3F3` | transparent |
| 未完了ボーダー | `rgba(0,0,0,0.04)` | `rgba(0,0,0,0.05)` |
| 未完了チェック | 非表示 | グレー `#D5D5D5` で表示 |
| 完了背景 | `#10B981` (単色緑) | グラデーション (ピンク→青緑) |
| 完了チェック | 白 | 白/緑 |

### 縦点線

| 項目 | 現在の実装 | 新デザイン (Figma) |
|------|-----------|-------------------|
| 未完了 | `#E1E1E1` | `#E1E1E1` (同じ) |
| 完了 | `#10B981` | `#10B981` (同じ) |

**→ 縦点線の色は現在の実装のままでOK**

---

## レイアウト構造

```
SectionQuest (mb-6)
│
├── QuestHeader (mb-3, flex, items-center, gap-5)
│   ├── IconCheck (w-4 h-4)
│   └── QuestLabel
│       ├── 「クエスト」(font-noto-sans-jp, text-xs)
│       └── 「01」(font-luckiest, text-[13px])
│
└── QuestBody (flex, gap-3 md:gap-5)
    ├── VerticalDivider (px-[7px])
    │   └── border-left (1px dotted)
    │
    └── QuestCard (max-w-[743px])
        ├── QuestCardHeader (px-4 md:px-8, py-4 md:py-5)
        │   ├── Title (h3)
        │   ├── Goal (p)
        │   └── Meta (目安・完了数)
        │
        └── ArticleList (py-3)
            └── ContentItem[] / ArticleItem[]
```

---

## Props

```tsx
interface SectionQuestProps {
  /** クエスト番号 (1, 2, 3...) */
  questNumber: number;

  /** クエストタイトル */
  title: string;

  /** 説明文（現在未使用） */
  description?: string;

  /** ゴール説明 */
  goal?: string;

  /** 所要時間（分） */
  estTimeMins?: number;

  /** 記事リスト */
  articles: Article[];

  /** 完了した記事数 */
  completedCount?: number;

  /** 完了した記事IDリスト */
  completedArticleIds?: string[];
}
```

---

## データフロー

```
LessonDetail (ページ)
    │
    │  lessonProgress (Supabase から取得)
    │  └── completedArticleIds: string[]
    │
    ▼
QuestList
    │
    │  クエストごとに completedCount を計算
    │
    ▼
SectionQuest / QuestCard
    │
    │  isQuestCompleted = (completedCount === totalCount && totalCount > 0)
    │
    ├── チェックアイコンの表示切替
    ├── 縦点線の色切替
    │
    ▼
ArticleItem / ContentItem
    │
    │  isCompleted = completedArticleIds.includes(article._id)
    │
    └── 個別記事の完了状態表示
```

---

## 色まとめ

### 未完了状態

| 要素 | 色 | Hex |
|------|-----|-----|
| チェック背景（現在） | 薄グレー | #F3F3F3 |
| チェック背景（新） | 透明 | transparent |
| チェックボーダー | 黒4-5% | rgba(0,0,0,0.04-0.05) |
| チェックマーク（新） | グレー | #D5D5D5 |
| 縦点線 | グレー | #E1E1E1 |

### 完了状態

| 要素 | 色 | Hex |
|------|-----|-----|
| チェック背景（現在） | 緑 | #10B981 |
| チェック背景（新） | グラデ | rgba(255,75,111,0.68) → rgba(38,119,143,0.68) |
| チェックマーク | 白 | #FFFFFF |
| 縦点線 | 緑 | #10B981 |

---

## 実装時の注意

1. **completedCount の計算は親コンポーネント（QuestList）で行う**
   - 各クエストの `articles` と `completedArticleIds` を照合
   - `completedCount = articles.filter(a => completedArticleIds.includes(a._id)).length`

2. **縦点線の色は現在の実装を維持**
   - 新デザインでも `#E1E1E1` / `#10B981` で同じ

3. **チェックアイコンは新デザインに合わせて変更が必要**
   - グラデーション背景への変更
   - 未完了時もチェックマーク表示（グレー）

---

## 新デザイン用の実装コード（案）

```tsx
export function SectionQuest({
  questNumber,
  title,
  goal,
  estTimeMins,
  articles,
  completedCount = 0,
  completedArticleIds = [],
}: SectionQuestProps) {
  const totalCount = articles.length;
  const isQuestCompleted = completedCount === totalCount && totalCount > 0;

  return (
    <div className="mb-6">
      {/* クエスト番号行 */}
      <QuestHeader
        questNumber={questNumber}
        isCompleted={isQuestCompleted}
      />

      {/* カードエリア（縦点線 + カード） */}
      <div className="flex gap-5">
        {/* 縦点線 */}
        <div className="px-[7px] flex items-center">
          <div
            className="self-stretch"
            style={{
              borderLeft: isQuestCompleted
                ? '1px dotted #10B981'
                : '1px dotted #E1E1E1'
            }}
          />
        </div>

        {/* カード */}
        <QuestCard
          title={title}
          goal={goal}
          articles={articles}
          completedArticleIds={completedArticleIds}
        />
      </div>
    </div>
  );
}
```
