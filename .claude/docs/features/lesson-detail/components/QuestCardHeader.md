# QuestCardHeader コンポーネント仕様

**作成日**: 2025-01-15
**Figmaリンク**: [node-id=418:8075](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=418:8075)

---

## 概要

クエストカードのヘッダー部分（タイトル + ゴール説明）

```
┌─────────────────────────────────────────────────┐
│  UIデザインサイクル習得の旅をはじめよう🚢         │
│  👉️「UIデザインサイクル」を身に付ける...         │
└─────────────────────────────────────────────────┘
```

---

## レイアウト構造

```
QuestCardHeader (コンテナ)
└── Container (内部ラッパー)
    ├── Heading 3 (タイトル)
    └── Container (ゴール説明)
```

---

## Figma仕様

### コンテナ (QuestCardHeader)

| プロパティ | 値 |
|-----------|-----|
| レイアウト | flex, flex-col |
| 整列 | items-start |
| パディング上 | **20px** |
| パディング下 | **15px** |
| パディング左右 | **32px** |
| 幅 | 100% |

### タイトル (Heading 3)

| プロパティ | 値 |
|-----------|-----|
| フォント | **Noto Sans JP Bold** |
| サイズ | **18px** |
| 行高 | **28px** |
| 色 | **#151834** |
| 幅 | 100% |
| 折り返し | あり (whitespace-pre-wrap) |

### ゴール説明

| プロパティ | 値 |
|-----------|-----|
| フォント | **Noto Sans JP Medium** |
| サイズ | **14px** |
| 行高 | **20px** |
| 色 | **#6F7178** (グレー) |
| 幅 | 100% |
| 折り返し | あり (whitespace-pre-wrap) |
| マージン上 | **8px** (ギャップ) |

### タイトルとゴールの間

| プロパティ | 値 |
|-----------|-----|
| ギャップ | **8px** |

---

## Props

```tsx
interface QuestCardHeaderProps {
  /** クエストタイトル */
  title: string;

  /** ゴール説明（オプション） */
  goal?: string;
}
```

---

## 実装コード

```tsx
interface QuestCardHeaderProps {
  title: string;
  goal?: string;
}

export function QuestCardHeader({ title, goal }: QuestCardHeaderProps) {
  return (
    <div className="flex flex-col items-start pt-5 pb-[15px] px-8 w-full">
      <div className="flex flex-col gap-2 items-start w-full">
        {/* タイトル */}
        <h3 className="font-noto-sans-jp font-bold text-[18px] leading-[28px] text-[#151834] w-full whitespace-pre-wrap">
          {title}
        </h3>

        {/* ゴール説明 */}
        {goal && (
          <p className="font-noto-sans-jp font-medium text-[14px] leading-[20px] text-[#6f7178] w-full whitespace-pre-wrap">
            {goal}
          </p>
        )}
      </div>
    </div>
  );
}
```

---

## Tailwind クラス対応表

| Figma値 | Tailwind |
|---------|----------|
| padding-top: 20px | `pt-5` |
| padding-bottom: 15px | `pb-[15px]` |
| padding-left/right: 32px | `px-8` |
| gap: 8px | `gap-2` |
| font-size: 18px | `text-[18px]` |
| line-height: 28px | `leading-[28px]` |
| font-size: 14px | `text-[14px]` |
| line-height: 20px | `leading-[20px]` |
| color: #151834 | `text-[#151834]` |
| color: #6F7178 | `text-[#6f7178]` |
| Noto Sans JP Bold | `font-noto-sans-jp font-bold` |
| Noto Sans JP Medium | `font-noto-sans-jp font-medium` |

---

## 色まとめ

| 用途 | 色 | Hex |
|------|-----|-----|
| タイトル | 濃紺 | #151834 |
| ゴール説明 | グレー | #6F7178 |

---

## 注意事項

- タイトルは `h3` タグを使用（セマンティクス）
- ゴールは絵文字（👉️）を含むことがある
- パディング下が15pxと中途半端なのはFigma通り
- `whitespace-pre-wrap` で改行・スペースを保持
