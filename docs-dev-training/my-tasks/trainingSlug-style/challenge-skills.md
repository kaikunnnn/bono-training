※ 固定幅（特に Width）は Figma から撮ったデータ上そうなっているだけです。レスポンシブで考えたいです。

# BONO ブロックテキストセクション完全実装ガイド

## 情報抽出元

- **Figma Node ID**: `3449:4076`
- **抽出ツール**: Figma Dev Mode MCP
- **情報源**:
  1. `get_code`: 自動生成された React コード（構造・スタイル）
  2. `get_image`: ビジュアル確認用画像（💪 絵文字 + タイトル + 説明文）
  3. `get_variable_defs`: デザインシステム変数定義

---

## 1. 完全な React コード（Figma 自動生成・改良版）

```jsx
interface BlockTextProps {
  emoji?: string;
  title?: string;
  description?: string;
  className?: string;
}

export default function BlockText({
  emoji = "💪",
  title = "このチャレンジで伸ばせる力",
  description = "トレーニングはそのままやってもいいです。基礎も合わせて学習して、実践をトレーニングで行うと土台を築けるでしょう。",
  className = "",
}: BlockTextProps) {
  return (
    <div
      className={`box-border content-stretch flex flex-col gap-9 items-start justify-start px-0 py-6 relative size-full ${className}`}
      data-name="block-text"
    >
      <div className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full">
        {/* 絵文字 */}
        <div className="font-['Inter:Semi_Bold',_sans-serif] font-semibold relative shrink-0 text-[14px] text-center text-slate-900 w-[472px]">
          <p
            className="block leading-[20px] text-2xl"
            role="img"
            aria-label="力こぶ"
          >
            {emoji}
          </p>
        </div>

        {/* タイトル */}
        <div className="flex flex-col font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] justify-center relative shrink-0 text-white text-[24px] text-left text-nowrap tracking-[1px]">
          <h2 className="adjustLetterSpacing block leading-[1.6] whitespace-pre text-center">
            {title}
          </h2>
        </div>

        {/* 説明文 */}
        <div className="font-['Inter:Regular',_'Noto_Sans_JP:Regular',_sans-serif] font-normal relative shrink-0 text-[16px] text-center text-slate-900 w-[472px]">
          <p className="block leading-[1.88]">{description}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 2. デザインシステム変数（Figma 定義）

```json
{
  "Slate/900": "#0f172a",
  "text-sm/font-semibold": "Font(family: \"Inter\", style: Semi Bold, size: 14, weight: 600, lineHeight: 20)",
  "Text/Black": "#0d0f18",
  "Spacing/3": "12",
  "Spacing/9": "36",
  "Spacing/6": "24",
  "Text/LightGray": "#e2e8f0"
}
```

---

## 3. 構造解析（data-name 属性ベース）

### 階層構造

```
block-text (ルートコンテナ)
└── wrapper (中央配置ラッパー)
    ├── 絵文字 (💪、14px、中央揃え)
    ├── タイトル (24px、白色、トラッキング1px)
    └── 説明文 (16px、グレー、line-height: 1.88)
```

---

## 4. レイアウト詳細分析

### メインコンテナ (block-text)

- **Flexbox**: `flex flex-col` (縦方向)
- **ギャップ**: `gap-9` (36px)
- **配置**: `items-start justify-start`
- **パディング**: `px-0 py-6` (上下 24px、左右 0px)
- **サイズ**: `size-full` (100%)

### ラッパー (wrapper)

- **Flexbox**: `flex flex-col` (縦方向)
- **ギャップ**: `gap-3` (12px)
- **配置**: `items-center justify-start` (中央揃え)
- **幅**: `w-full` (100%)

### 絵文字

- **フォント**: `Inter Semi Bold`
- **サイズ**: `text-[14px]` (ただし絵文字は表示上大きく見える)
- **行高**: `leading-[20px]`
- **配置**: `text-center`
- **色**: `text-slate-900` (#0f172a)
- **幅**: `w-[472px]` (固定幅)

### タイトル

- **フォント**: `Rounded Mplus 1c Bold`
- **サイズ**: `text-[24px]`
- **色**: `text-white` (#ffffff)
- **文字間隔**: `tracking-[1px]`
- **行高**: `leading-[1.6]`
- **配置**: `text-left text-nowrap` (左揃え、改行なし)

### 説明文

- **フォント**: `Inter Regular` + `Noto Sans JP Regular`
- **サイズ**: `text-[16px]`
- **色**: `text-slate-900` (#0f172a)
- **行高**: `leading-[1.88]`
- **配置**: `text-center`
- **幅**: `w-[472px]` (固定幅)

---

## 5. レスポンシブ対応版

```jsx
export default function BlockText({
  emoji = "💪",
  title = "このチャレンジで伸ばせる力",
  description = "トレーニングはそのままやってもいいです。基礎も合わせて学習して、実践をトレーニングで行うと土台を築けるでしょう。",
  className = "",
}: BlockTextProps) {
  return (
    <div
      className={`box-border content-stretch flex flex-col gap-9 items-start justify-start px-4 md:px-0 py-6 relative size-full ${className}`}
      data-name="block-text"
    >
      <div className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full max-w-[472px] mx-auto">
        {/* 絵文字 */}
        <div className="font-inter font-semibold relative shrink-0 text-center text-slate-900 w-full">
          <p
            className="block text-2xl md:text-3xl leading-tight"
            role="img"
            aria-label="力こぶ"
          >
            {emoji}
          </p>
        </div>

        {/* タイトル */}
        <div className="flex flex-col font-rounded-mplus justify-center relative shrink-0 text-white text-center w-full">
          <h2 className="text-xl md:text-[24px] tracking-[1px] leading-[1.6] whitespace-normal md:whitespace-nowrap">
            {title}
          </h2>
        </div>

        {/* 説明文 */}
        <div className="font-inter font-normal relative shrink-0 text-[14px] md:text-[16px] text-center text-slate-900 w-full">
          <p className="block leading-[1.7] md:leading-[1.88]">{description}</p>
        </div>
      </div>
    </div>
  );
}
```

---

## 6. アクセシビリティ強化版

```jsx
interface BlockTextProps {
  emoji?: string;
  emojiLabel?: string;
  title?: string;
  description?: string;
  titleLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  id?: string;
}

export default function BlockText({
  emoji = "💪",
  emojiLabel = "力こぶ",
  title = "このチャレンジで伸ばせる力",
  description = "トレーニングはそのままやってもいいです。基礎も合わせて学習して、実践をトレーニングで行うと土台を築けるでしょう。",
  titleLevel = "h2",
  className = "",
  id,
}: BlockTextProps) {
  const TitleTag = titleLevel;

  return (
    <section
      className={`box-border content-stretch flex flex-col gap-9 items-start justify-start px-4 md:px-0 py-6 relative size-full ${className}`}
      data-name="block-text"
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full max-w-[472px] mx-auto">
        {/* 絵文字 */}
        {emoji && (
          <div className="font-inter font-semibold relative shrink-0 text-center text-slate-900 w-full">
            <span
              className="block text-2xl md:text-3xl leading-tight"
              role="img"
              aria-label={emojiLabel}
            >
              {emoji}
            </span>
          </div>
        )}

        {/* タイトル */}
        <TitleTag
          id={id ? `${id}-title` : undefined}
          className="font-rounded-mplus text-white text-xl md:text-[24px] tracking-[1px] leading-[1.6] text-center w-full whitespace-normal md:whitespace-nowrap"
        >
          {title}
        </TitleTag>

        {/* 説明文 */}
        <p className="font-inter font-normal text-[14px] md:text-[16px] text-center text-slate-900 leading-[1.7] md:leading-[1.88] w-full">
          {description}
        </p>
      </div>
    </section>
  );
}
```

---

## 7. バリエーション対応版

```jsx
// 複数のバリエーションに対応
interface BlockTextVariant {
  type: 'default' | 'success' | 'warning' | 'info';
  emoji: string;
  emojiLabel: string;
  bgColor?: string;
  textColor?: string;
}

const variants: Record<string, BlockTextVariant> = {
  default: {
    type: 'default',
    emoji: '💪',
    emojiLabel: '力こぶ',
    bgColor: 'transparent',
    textColor: 'text-white'
  },
  success: {
    type: 'success',
    emoji: '✅',
    emojiLabel: 'チェックマーク',
    bgColor: 'bg-green-50',
    textColor: 'text-green-800'
  },
  warning: {
    type: 'warning',
    emoji: '⚠️',
    emojiLabel: '警告',
    bgColor: 'bg-yellow-50',
    textColor: 'text-yellow-800'
  },
  info: {
    type: 'info',
    emoji: 'ℹ️',
    emojiLabel: '情報',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-800'
  }
};

interface BlockTextProps {
  variant?: keyof typeof variants;
  title?: string;
  description?: string;
  customEmoji?: string;
  customEmojiLabel?: string;
  titleLevel?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
  className?: string;
  id?: string;
}

export default function BlockText({
  variant = 'default',
  title = "このチャレンジで伸ばせる力",
  description = "トレーニングはそのままやってもいいです。基礎も合わせて学習して、実践をトレーニングで行うと土台を築けるでしょう。",
  customEmoji,
  customEmojiLabel,
  titleLevel = 'h2',
  className = "",
  id
}: BlockTextProps) {
  const config = variants[variant];
  const emoji = customEmoji || config.emoji;
  const emojiLabel = customEmojiLabel || config.emojiLabel;
  const TitleTag = titleLevel;

  return (
    <section
      className={`box-border content-stretch flex flex-col gap-9 items-start justify-start px-4 md:px-0 py-6 relative size-full ${config.bgColor || ''} ${className}`}
      data-name="block-text"
      data-variant={variant}
      id={id}
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="box-border content-stretch flex flex-col gap-3 items-center justify-start p-0 relative shrink-0 w-full max-w-[472px] mx-auto">
        {/* 絵文字 */}
        <div className="font-inter font-semibold relative shrink-0 text-center text-slate-900 w-full">
          <span
            className="block text-2xl md:text-3xl leading-tight"
            role="img"
            aria-label={emojiLabel}
          >
            {emoji}
          </span>
        </div>

        {/* タイトル */}
        <TitleTag
          id={id ? `${id}-title` : undefined}
          className={`font-rounded-mplus text-xl md:text-[24px] tracking-[1px] leading-[1.6] text-center w-full whitespace-normal md:whitespace-nowrap ${config.textColor || 'text-white'}`}
        >
          {title}
        </TitleTag>

        {/* 説明文 */}
        <p className="font-inter font-normal text-[14px] md:text-[16px] text-center text-slate-900 leading-[1.7] md:leading-[1.88] w-full">
          {description}
        </p>
      </div>
    </section>
  );
}
```

---

## 8. CSS 変数定義

```css
:root {
  /* BlockText専用カラー */
  --block-text-title-color: #ffffff;
  --block-text-description-color: #0f172a;
  --block-text-emoji-color: #0f172a;

  /* スペーシング */
  --block-text-gap-main: 36px; /* gap-9 */
  --block-text-gap-content: 12px; /* gap-3 */
  --block-text-padding-y: 24px; /* py-6 */

  /* フォント */
  --block-text-emoji-size: 14px;
  --block-text-title-size: 24px;
  --block-text-description-size: 16px;
  --block-text-title-tracking: 1px;
  --block-text-title-line-height: 1.6;
  --block-text-description-line-height: 1.88;

  /* 幅 */
  --block-text-max-width: 472px;
}

/* ダークモード対応 */
@media (prefers-color-scheme: dark) {
  :root {
    --block-text-description-color: #e2e8f0;
  }
}
```

---

## 9. TypeScript 型定義

```typescript
// types/BlockText.ts
export type BlockTextVariant = "default" | "success" | "warning" | "info";
export type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export interface BlockTextProps {
  /** 表示する絵文字 */
  emoji?: string;
  /** 絵文字のaria-label */
  emojiLabel?: string;
  /** タイトルテキスト */
  title?: string;
  /** 説明文テキスト */
  description?: string;
  /** タイトルのHTML要素レベル */
  titleLevel?: HeadingLevel;
  /** バリエーション */
  variant?: BlockTextVariant;
  /** カスタム絵文字 */
  customEmoji?: string;
  /** カスタム絵文字のaria-label */
  customEmojiLabel?: string;
  /** 追加のCSSクラス */
  className?: string;
  /** 要素のID */
  id?: string;
}

export interface BlockTextVariantConfig {
  type: BlockTextVariant;
  emoji: string;
  emojiLabel: string;
  bgColor?: string;
  textColor?: string;
}
```

---

## 10. 使用例

```jsx
// 基本使用
<BlockText />

// カスタムコンテンツ
<BlockText
  emoji="🎯"
  emojiLabel="的"
  title="目標達成への道のり"
  description="明確な目標設定から始めて、段階的にスキルを積み上げていきましょう。"
  titleLevel="h1"
/>

// バリエーション使用
<BlockText
  variant="success"
  title="完了しました！"
  description="おめでとうございます。次のステップに進みましょう。"
/>

// レスポンシブ対応
<div className="container mx-auto">
  <BlockText
    id="challenge-intro"
    className="mb-8"
  />
</div>
```

---

## 11. 実装チェックリスト

### 必須対応項目

- [ ] Tailwind CSS 設定確認
- [ ] Rounded Mplus 1c Bold フォントの読み込み
- [ ] Inter、Noto Sans JP フォントの読み込み
- [ ] `adjustLetterSpacing`クラスの実装
- [ ] 472px 固定幅の適切な処理

### 推奨対応項目

- [ ] セマンティック HTML（section 要素）への変更
- [ ] ARIA 属性の追加（labelledby）
- [ ] レスポンシブ対応（モバイル・タブレット）
- [ ] 絵文字のアクセシビリティ対応
- [ ] フォント読み込み失敗時のフォールバック

### オプション対応項目

- [ ] バリエーション機能の実装
- [ ] ダークモード対応
- [ ] アニメーション効果
- [ ] 多言語対応
- [ ] Storybook ドキュメント作成

---

## 12. 注意事項

1. **固定幅**: 472px 固定幅がレスポンシブ対応時に問題となる可能性
2. **白色テキスト**: タイトルが白色のため、背景色の設定が重要
3. **絵文字表示**: 絵文字のサイズが環境によって異なる可能性
4. **フォント依存**: `Rounded Mplus 1c Bold`の商用利用時ライセンス確認が必要
5. **行高設定**: 説明文の 1.88 という特殊な行高値に注意
6. **文字間隔**: `adjustLetterSpacing`クラスの具体的実装が必要

この情報により、デザイナーの意図を 100%再現した柔軟性の高いブロックテキストコンポーネントが実装可能です。
