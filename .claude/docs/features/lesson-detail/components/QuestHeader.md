# QuestHeader コンポーネント仕様

**作成日**: 2025-01-15
**Figmaリンク**:
- 未完了: [node-id=437:3486](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=437:3486)
- 完了: [node-id=437:3487](https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D?node-id=437:3487)

---

## 概要

クエスト番号行（チェックアイコン + 「クエスト 01」ラベル）

```
[ ○ ]  クエスト 01
```

---

## 状態

| 状態 | 説明 |
|------|------|
| 未完了 | グレーのチェックアイコン（empty） |
| 完了 | グラデーション背景のチェックアイコン（on） |

---

## レイアウト構造

```
QuestHeader (コンテナ)
├── IconCheck (チェックアイコン) ← 別コンポーネント（共通）
└── QuestLabel (ラベル)
    ├── 「クエスト」テキスト
    └── 「01」番号
```

---

## Figma仕様

### コンテナ (QuestHeader)

| プロパティ | 値 |
|-----------|-----|
| レイアウト | flex |
| 方向 | row (横並び) |
| 整列 | items-center |
| ギャップ | **20px** |

### チェックアイコン (IconCheck)

**※別ファイル `IconCheck.md` で詳細定義**

- サイズ: 16px × 16px
- 状態: `empty` / `on`
- 共通コンポーネント（記事詳細サイドナビと同じ）

### クエストラベル (QuestLabel)

| プロパティ | 値 |
|-----------|-----|
| レイアウト | flex |
| 方向 | row |
| 整列 | items-center |
| ギャップ | **4px** |
| 色 | **#151834** |

#### 「クエスト」テキスト

| プロパティ | 値 |
|-----------|-----|
| フォント | **Noto Sans JP Bold** |
| サイズ | **14px** |
| 行高 | 14.4px (1.028) |
| 色 | #151834 (親から継承) |

#### 番号「01」テキスト

| プロパティ | 値 |
|-----------|-----|
| フォント | **Unbounded SemiBold** |
| サイズ | **13px** |
| 行高 | 15.6px (1.2) |
| 色 | #151834 (親から継承) |
| フォーマット | 2桁ゼロ埋め (01, 02, ...) |

---

## Props

```tsx
interface QuestHeaderProps {
  /** クエスト番号 (1, 2, 3...) */
  questNumber: number;

  /** 完了状態 */
  isCompleted: boolean;
}
```

---

## 実装コード

```tsx
import { IconCheck } from "./IconCheck";

interface QuestHeaderProps {
  questNumber: number;
  isCompleted: boolean;
}

export function QuestHeader({ questNumber, isCompleted }: QuestHeaderProps) {
  // 番号を2桁ゼロ埋め
  const formattedNumber = String(questNumber).padStart(2, "0");

  return (
    <div className="flex items-center gap-5">
      {/* チェックアイコン */}
      <IconCheck status={isCompleted ? "on" : "empty"} />

      {/* クエストラベル */}
      <div className="flex items-center gap-1 text-[#151834]">
        <span className="font-noto-sans-jp font-bold text-[14px] leading-[14.4px]">
          クエスト
        </span>
        <span className="font-unbounded font-semibold text-[13px] leading-[15.6px]">
          {formattedNumber}
        </span>
      </div>
    </div>
  );
}
```

---

## Tailwind クラス対応表

| Figma値 | Tailwind |
|---------|----------|
| gap: 20px | `gap-5` |
| gap: 4px | `gap-1` |
| font-size: 14px | `text-[14px]` |
| font-size: 13px | `text-[13px]` |
| color: #151834 | `text-[#151834]` |
| Noto Sans JP Bold | `font-noto-sans-jp font-bold` |
| Unbounded SemiBold | `font-unbounded font-semibold` |

---

## 注意事項

- IconCheckは共通コンポーネントとして別ファイルで管理
- 番号は必ず2桁ゼロ埋めで表示
- フォント `font-unbounded` がtailwind.configに定義されていることを確認
