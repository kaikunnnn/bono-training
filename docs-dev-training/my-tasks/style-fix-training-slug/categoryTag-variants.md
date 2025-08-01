## categoryTag のパターン区別とスタイル

- index.md の category 名が一致する category の内容でスタイルを変更できるように実装してください（詳細は下部の ` ` の中身を参照）
- 対象コードの例：data-lov-id="src/components/training/CategoryTag.tsx:46:4"
- 各 Category 名ごとのスタイル内容は以下です。
- まずは内容を整理して開発に備えてください。わからない部分は質問して

````
# BONO カテゴリータグ 4バリエーション完全実装ガイド

## 情報抽出元
- **Figma Node ID**: `3523:33341`
- **抽出ツール**: Figma Dev Mode MCP
- **情報源**:
  1. `get_code`: 自動生成されたReactコード（4つのバリエーション）
  2. `get_image`: ビジュアル確認用画像（縦に並んだ4つのタグ）
  3. `get_variable_defs`: デザインシステム変数定義

---

## 1. 4つのバリエーション詳細

### バリエーション1: UXデザイン（uxdesign）
```jsx
// property1 = "uxdesign" (デフォルト)
<div className="bg-[rgba(248,158,61,0.13)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0">
  <div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#ac5f0c] text-[12px] text-center text-nowrap">
    <p className="block leading-[16px] whitespace-pre">UXデザイン</p>
  </div>
</div>
````

- **背景色**: `rgba(248,158,61,0.13)` (オレンジ系、透明度 13%)
- **テキスト色**: `#ac5f0c` (ダークオレンジ)
- **ラベル**: "UX デザイン"

### バリエーション 2: 情報設計（architecture）

```jsx
// property1 = "architecture"
<div className="bg-[rgba(13,147,77,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0">
  <div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#007b3b] text-[12px] text-center text-nowrap">
    <p className="block leading-[16px] whitespace-pre">情報設計</p>
  </div>
</div>
```

- **背景色**: `rgba(13,147,77,0.12)` (グリーン系、透明度 12%)
- **テキスト色**: `#007b3b` (ダークグリーン)
- **ラベル**: "情報設計"

### バリエーション 3: UI ビジュアル（uivisual）

```jsx
// property1 = "uivisual"
<div className="bg-[rgba(85,160,235,0.13)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0">
  <div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#146fc9] text-[12px] text-center text-nowrap">
    <p className="block leading-[16px] whitespace-pre">UIビジュアル</p>
  </div>
</div>
```

- **背景色**: `rgba(85,160,235,0.13)` (ブルー系、透明度 13%)
- **テキスト色**: `#146fc9` (ダークブルー)
- **ラベル**: "UI ビジュアル"

### バリエーション 4: Figma（Figma）

```jsx
// property1 = "Figma"
<div className="bg-[rgba(135,20,201,0.12)] box-border content-stretch flex flex-row gap-2.5 items-center justify-center overflow-clip px-1.5 py-0.5 relative rounded shrink-0">
  <div className="font-['Noto_Sans_JP:Medium',_sans-serif] font-medium leading-[0] relative shrink-0 text-[#8714c9] text-[12px] text-center text-nowrap">
    <p className="block leading-[16px] whitespace-pre">Figma</p>
  </div>
</div>
```

- **背景色**: `rgba(135,20,201,0.12)` (パープル系、透明度 12%)
- **テキスト色**: `#8714c9` (ダークパープル)
- **ラベル**: "Figma"

---

## 2. 共通スタイル仕様

### レイアウト

- **Flexbox**: `flex flex-row gap-2.5 items-center justify-center`
- **パディング**: `px-1.5 py-0.5` (左右 6px、上下 2px)
- **角丸**: `rounded` (4px)
- **オーバーフロー**: `overflow-clip`

### フォント

- **フォントファミリー**: `Noto Sans JP Medium`
- **フォントウェイト**: `font-medium` (500)
- **フォントサイズ**: `text-[12px]`
- **行高**: `leading-[16px]`
- **配置**: `text-center text-nowrap`

---

## 3. 改良版実装

```jsx
interface CategoryTagProps {
  category: "uxdesign" | "architecture" | "uivisual" | "figma";
  className?: string;
  onClick?: () => void;
}

const categoryConfig = {
  uxdesign: {
    label: "UXデザイン",
    bgColor: "rgba(248,158,61,0.13)",
    textColor: "#ac5f0c",
    bgColorClass: "bg-orange-50",
    textColorClass: "text-orange-700"
  },
  architecture: {
    label: "情報設計",
    bgColor: "rgba(13,147,77,0.12)",
    textColor: "#007b3b",
    bgColorClass: "bg-green-50",
    textColorClass: "text-green-700"
  },
  uivisual: {
    label: "UIビジュアル",
    bgColor: "rgba(85,160,235,0.13)",
    textColor: "#146fc9",
    bgColorClass: "bg-blue-50",
    textColorClass: "text-blue-700"
  },
  figma: {
    label: "Figma",
    bgColor: "rgba(135,20,201,0.12)",
    textColor: "#8714c9",
    bgColorClass: "bg-purple-50",
    textColorClass: "text-purple-700"
  }
} as const;

export default function CategoryTag({
  category,
  className = "",
  onClick
}: CategoryTagProps) {
  const config = categoryConfig[category];
  const isInteractive = !!onClick;

  return (
    <span
      className={`
        inline-flex items-center justify-center gap-2.5 px-1.5 py-0.5 rounded
        font-['Noto_Sans_JP'] font-medium text-[12px] leading-[16px] text-center whitespace-nowrap
        ${isInteractive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor
      }}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
      onKeyDown={(e) => {
        if (isInteractive && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick?.();
        }
      }}
    >
      {config.label}
    </span>
  );
}
```

---

## 4. Tailwind カスタムカラー対応版

```jsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'category-ux': {
          50: 'rgba(248,158,61,0.13)',
          700: '#ac5f0c'
        },
        'category-architecture': {
          50: 'rgba(13,147,77,0.12)',
          700: '#007b3b'
        },
        'category-ui': {
          50: 'rgba(85,160,235,0.13)',
          700: '#146fc9'
        },
        'category-figma': {
          50: 'rgba(135,20,201,0.12)',
          700: '#8714c9'
        }
      }
    }
  }
}

// コンポーネント
const categoryClasses = {
  uxdesign: "bg-category-ux-50 text-category-ux-700",
  architecture: "bg-category-architecture-50 text-category-architecture-700",
  uivisual: "bg-category-ui-50 text-category-ui-700",
  figma: "bg-category-figma-50 text-category-figma-700"
} as const;

export default function CategoryTag({ category, className = "", onClick }: CategoryTagProps) {
  const config = categoryConfig[category];
  const colorClasses = categoryClasses[category];
  const isInteractive = !!onClick;

  return (
    <span
      className={`
        inline-flex items-center justify-center gap-2.5 px-1.5 py-0.5 rounded
        font-noto-sans-jp font-medium text-[12px] leading-[16px] text-center whitespace-nowrap
        ${colorClasses}
        ${isInteractive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      onClick={onClick}
      role={isInteractive ? 'button' : undefined}
      tabIndex={isInteractive ? 0 : undefined}
    >
      {config.label}
    </span>
  );
}
```

---

## 5. CSS 変数定義

```css
:root {
  /* CategoryTag UXデザイン */
  --category-ux-bg: rgba(248, 158, 61, 0.13);
  --category-ux-text: #ac5f0c;

  /* CategoryTag 情報設計 */
  --category-architecture-bg: rgba(13, 147, 77, 0.12);
  --category-architecture-text: #007b3b;

  /* CategoryTag UIビジュアル */
  --category-ui-bg: rgba(85, 160, 235, 0.13);
  --category-ui-text: #146fc9;

  /* CategoryTag Figma */
  --category-figma-bg: rgba(135, 20, 201, 0.12);
  --category-figma-text: #8714c9;

  /* 共通スタイル */
  --category-tag-font-size: 12px;
  --category-tag-line-height: 16px;
  --category-tag-padding-x: 6px;
  --category-tag-padding-y: 2px;
  --category-tag-border-radius: 4px;
  --category-tag-gap: 10px;
}

.category-tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: var(--category-tag-gap);
  padding: var(--category-tag-padding-y) var(--category-tag-padding-x);
  border-radius: var(--category-tag-border-radius);
  font-family: "Noto Sans JP", sans-serif;
  font-weight: 500;
  font-size: var(--category-tag-font-size);
  line-height: var(--category-tag-line-height);
  text-align: center;
  white-space: nowrap;
}

.category-tag--uxdesign {
  background-color: var(--category-ux-bg);
  color: var(--category-ux-text);
}

.category-tag--architecture {
  background-color: var(--category-architecture-bg);
  color: var(--category-architecture-text);
}

.category-tag--uivisual {
  background-color: var(--category-ui-bg);
  color: var(--category-ui-text);
}

.category-tag--figma {
  background-color: var(--category-figma-bg);
  color: var(--category-figma-text);
}
```

---

## 6. TypeScript 型定義

```typescript
// types/CategoryTag.ts
export type CategoryType = "uxdesign" | "architecture" | "uivisual" | "figma";

export interface CategoryConfig {
  label: string;
  bgColor: string;
  textColor: string;
  bgColorClass?: string;
  textColorClass?: string;
}

export interface CategoryTagProps {
  /** カテゴリータイプ */
  category: CategoryType;
  /** 追加のCSSクラス */
  className?: string;
  /** クリックイベントハンドラ */
  onClick?: () => void;
  /** アクセシビリティ用のaria-label */
  ariaLabel?: string;
  /** サイズバリエーション */
  size?: "sm" | "md" | "lg";
}

export type CategoryConfigMap = Record<CategoryType, CategoryConfig>;
```

---

## 7. サイズバリエーション対応版

```jsx
interface CategoryTagProps {
  category: CategoryType;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  onClick?: () => void;
}

const sizeClasses = {
  sm: 'px-1 py-0.5 text-[10px] leading-[14px]',
  md: 'px-1.5 py-0.5 text-[12px] leading-[16px]', // デフォルト
  lg: 'px-2 py-1 text-[14px] leading-[18px]'
} as const;

export default function CategoryTag({
  category,
  size = 'md',
  className = "",
  onClick
}: CategoryTagProps) {
  const config = categoryConfig[category];
  const sizeClass = sizeClasses[size];
  const isInteractive = !!onClick;

  return (
    <span
      className={`
        inline-flex items-center justify-center gap-2.5 rounded
        font-noto-sans-jp font-medium text-center whitespace-nowrap
        ${sizeClass}
        ${isInteractive ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}
        ${className}
      `}
      style={{
        backgroundColor: config.bgColor,
        color: config.textColor
      }}
      onClick={onClick}
    >
      {config.label}
    </span>
  );
}
```

---

## 8. 使用例

```jsx
// 基本使用
<CategoryTag category="uxdesign" />
<CategoryTag category="architecture" />
<CategoryTag category="uivisual" />
<CategoryTag category="figma" />

// クリック可能
<CategoryTag
  category="uxdesign"
  onClick={() => console.log('UXデザインがクリックされました')}
/>

// サイズ指定
<CategoryTag category="figma" size="lg" />

// 複数表示
const categories: CategoryType[] = ["uxdesign", "architecture"];

{categories.map((category) => (
  <CategoryTag
    key={category}
    category={category}
    onClick={() => handleCategoryFilter(category)}
    className="mr-2 mb-2"
  />
))}
```

---

## 9. 実装チェックリスト

### 必須対応項目

- [ ] 4 つのバリエーションの正確な色再現
- [ ] Noto Sans JP Medium フォントの読み込み
- [ ] 透明度付き背景色の適切な実装
- [ ] 12px/16px のフォント・行高設定

### 推奨対応項目

- [ ] TypeScript 型定義の実装
- [ ] アクセシビリティ対応（ARIA 属性、キーボード操作）
- [ ] ホバー・フォーカス状態のデザイン
- [ ] サイズバリエーションの追加

### オプション対応項目

- [ ] アニメーション効果
- [ ] ダークモード対応
- [ ] 追加カテゴリーの拡張性
- [ ] Storybook ドキュメント作成
- [ ] 単体テスト作成

---

## 10. 注意事項

1. **透明度付き色**: rgba 値を正確に再現することが重要
2. **フォント依存**: Noto Sans JP Medium の読み込み確認が必要
3. **文字列の一致**: property1 の値とカテゴリーキーの正確な一致が必要
4. **アクセシビリティ**: クリック可能な場合のキーボード操作対応
5. **拡張性**: 新しいカテゴリー追加時の設計考慮

この情報により、4 つのバリエーションを持つ高品質なカテゴリータグコンポーネントが実装可能です。```
