# IconCheck コンポーネント仕様

**作成日**: 2025-01-15
**Figmaリンク**:
- empty状態: [node-id=388:2800](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=388:2800)
- on状態: [node-id=388:2799](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=388:2799)

---

## 概要

チェックアイコン（共通コンポーネント）

**使用箇所:**
- QuestHeader（クエスト番号行）
- 記事詳細サイドナビの記事一覧

---

## 状態

| 状態 | property1 | 説明 | 見た目 |
|------|-----------|------|--------|
| 未完了 | `empty` | グレーの円 + グレーチェック | ○ |
| 完了 | `on` | グラデーション背景 + 白/緑チェック | ✓ |

---

## Figma仕様

### 共通（両状態）

| プロパティ | 値 |
|-----------|-----|
| サイズ | **16px × 16px** |
| 角丸 | **9999px** (円形) |
| backdrop-blur | **2px** |
| レイアウト | flex, items-center, justify-center |

### empty状態（未完了）

| プロパティ | 値 |
|-----------|-----|
| 背景 | transparent |
| ボーダー | **1px solid rgba(0, 0, 0, 0.05)** |
| チェックマーク色 | **rgba(213, 213, 213, 1)** = #D5D5D5 |

### on状態（完了）

| プロパティ | 値 |
|-----------|-----|
| 背景 | **グラデーション** (下記参照) |
| ボーダー | なし |
| チェックマーク色 | **rgba(48, 162, 94, 1)** = #30A25E (緑) |
| チェックマーク色2 | **rgba(255, 255, 255, 1)** = 白 |

#### グラデーション詳細

```css
background: linear-gradient(
  to bottom,
  rgba(255, 75, 111, 0.68),  /* #FF4B6F 68%透明度 (ピンク) */
  rgba(38, 119, 143, 0.68)   /* #26778F 68%透明度 (青緑) */
);
```

### チェックマークアイコン

| プロパティ | 値 |
|-----------|-----|
| サイズ | **10px × 10px** |
| 位置 | 中央配置 |
| アイコン | Interface / Check (SVG) |

---

## Props

```tsx
interface IconCheckProps {
  /** 状態: empty(未完了) / on(完了) */
  status: "empty" | "on";

  /** カスタムクラス */
  className?: string;
}
```

---

## 実装コード

```tsx
import { Check } from "lucide-react";

interface IconCheckProps {
  status: "empty" | "on";
  className?: string;
}

export function IconCheck({ status, className }: IconCheckProps) {
  const isCompleted = status === "on";

  return (
    <div
      className={cn(
        "size-4 rounded-full backdrop-blur-[2px] flex items-center justify-center",
        isCompleted
          ? "bg-gradient-to-b from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)]"
          : "border border-black/5",
        className
      )}
    >
      <Check
        className={cn(
          "size-2.5",
          isCompleted ? "text-white" : "text-[#d5d5d5]"
        )}
        strokeWidth={2.5}
      />
    </div>
  );
}
```

---

## Tailwind クラス対応表

| Figma値 | Tailwind |
|---------|----------|
| size: 16px | `size-4` |
| border-radius: 9999px | `rounded-full` |
| backdrop-blur: 2px | `backdrop-blur-[2px]` |
| border: 1px solid rgba(0,0,0,0.05) | `border border-black/5` |
| チェックアイコン: 10px | `size-2.5` |

### グラデーション

```
from-[rgba(255,75,111,0.68)] to-[rgba(38,119,143,0.68)]
```

または Tailwind config に定義:
```js
// tailwind.config.js
backgroundImage: {
  'check-gradient': 'linear-gradient(to bottom, rgba(255,75,111,0.68), rgba(38,119,143,0.68))',
}
```

---

## 色まとめ

| 用途 | 色 | Hex |
|------|-----|-----|
| empty チェック | グレー | #D5D5D5 |
| empty ボーダー | 黒5% | rgba(0,0,0,0.05) |
| on グラデーション上 | ピンク68% | rgba(255,75,111,0.68) |
| on グラデーション下 | 青緑68% | rgba(38,119,143,0.68) |
| on チェック | 白 | #FFFFFF |

---

## 注意事項

- このコンポーネントは**共通コンポーネント**として `src/components/ui/` または `src/components/icons/` に配置
- QuestHeader と 記事詳細サイドナビ で共用
- lucide-react の `Check` アイコンを使用（または専用SVG）
