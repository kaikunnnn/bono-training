# BONO ブログ - ヒーローセクション 実装仕様書

## 📋 概要

BONO ブログのトップページに配置されるヒーローセクション。大きなタイトル「HOPE.」とサブタイトルが表示される視覚的なインパクトが強いセクション。

**Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=21-119  
**Node ID**: `21:119`  
**コンポーネント名**: `herosection`  
**最終更新**: 2025 年 11 月 10 日

---

## 🎯 全体構造

```
herosection (21:119) - 1920×461px
└── Container (1:37)
    ├── Frame (12:13) - "HOPE." ロゴ画像 (344×89px)
    └── Container (1:46) - サブタイトル
        └── Text (1:47) - "BONOをつくる30代在宅独身男性のクラフト日誌"
```

---

## 📐 レイアウト仕様

### ヒーローセクション全体 (21:119)

| プロパティ           | 値                                     |
| -------------------- | -------------------------------------- |
| **要素名**           | herosection                            |
| **タイプ**           | Frame                                  |
| **サイズ**           | 1920×461px                             |
| **レイアウトモード** | Horizontal (flex)                      |
| **配置**             | items-start, justify-center            |
| **パディング**       | 上: 80px, 下: 0px, 左右: 0px           |
| **ボックスサイジング** | border-box                           |

### Container (1:37) - 内部コンテナ

| プロパティ           | 値                                     |
| -------------------- | -------------------------------------- |
| **要素名**           | Container                              |
| **タイプ**           | Frame                                  |
| **レイアウトモード** | Vertical (flex-col)                    |
| **配置**             | items-center, justify-center           |
| **間隔**             | gap: 32px                              |
| **パディング**       | 上: 96px, 下: 144px, 左右: 0px         |
| **Flex**             | basis: 0, grow: 1, shrink: 0           |
| **最小サイズ**       | min-h: 1px, min-w: 1px                 |

---

## 🔧 コンポーネント詳細

### 1. "HOPE." ロゴ画像 (12:13)

| プロパティ   | 値                                                |
| ------------ | ------------------------------------------------- |
| **要素名**   | Frame                                             |
| **タイプ**   | Frame (画像コンテナ)                              |
| **サイズ**   | 344×89px                                          |
| **配置**     | 中央寄せ                                          |
| **アセット** | `/assets/blog/bbde0d9860756a76727bcbe17eabccd0d60e09f6.svg` |

**実装コード**:

```typescript
<div className="h-[89px] relative shrink-0 w-[344px]">
  <img
    alt="HOPE."
    className="block max-w-none size-full"
    src="/assets/blog/bbde0d9860756a76727bcbe17eabccd0d60e09f6.svg"
  />
</div>
```

### 2. サブタイトルコンテナ (1:46)

| プロパティ     | 値                        |
| -------------- | ------------------------- |
| **要素名**     | Container                 |
| **タイプ**     | Frame                     |
| **幅**         | 100% (full width)         |
| **レイアウト** | flex-col, items-center    |
| **配置**       | 中央寄せ                  |

### 3. サブタイトルテキスト (1:47)

| プロパティ                 | 値                                            |
| -------------------------- | --------------------------------------------- |
| **要素名**                 | Text                                          |
| **テキスト内容**           | BONO をつくる 30 代在宅独身男性のクラフト日誌 |
| **フォントファミリー**     | Noto Sans JP                                  |
| **フォントサイズ**         | 14px                                          |
| **フォントウェイト**       | 500 (Medium)                                  |
| **行高**                   | 20px                                          |
| **文字間隔**               | 0.7px                                         |
| **テキスト色**             | #9CA3AF (Gray Chateau)                        |
| **テキストアラインメント** | Center                                        |
| **white-space**            | pre (改行なし)                                |

**実装コード**:

```typescript
<div className="flex flex-col font-['Noto_Sans_JP'] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[#9ca3af] text-center text-nowrap tracking-[0.7px]">
  <p className="leading-[20px] whitespace-pre">
    BONOをつくる30代在宅独身男性のクラフト日誌
  </p>
</div>
```

---

## 🎨 デザイントークン

Figma から取得した設計変数：

| 変数名                             | 値           | 用途                   |
| ---------------------------------- | ------------ | ---------------------- |
| `color/azure/65`                   | #9CA3AF      | サブタイトルテキスト色 |
| `kaikun.bo-no.design/Gray Chateau` | #9CA3AF      | グレーカラー（別名）   |
| `font family/Font 2`               | Noto Sans JP | フォントファミリー     |
| `font weight/500`                  | 500          | ミディアムウェイト     |
| `letter spacing/0_7`               | 0.7px        | 文字間隔               |
| `line height/20`                   | 20px         | 行高                   |

---

## 💻 完全な実装コード

### React + TypeScript + Tailwind CSS

```typescript
import React from "react";

const imgHopeLogo = "/assets/blog/bbde0d9860756a76727bcbe17eabccd0d60e09f6.svg";

interface HerosectionProps {
  className?: string;
  subtitle?: string;
}

export const Herosection: React.FC<HerosectionProps> = ({
  className = "",
  subtitle = "BONOをつくる30代在宅独身男性のクラフト日誌",
}) => {
  return (
    <div
      className={`box-border content-stretch flex items-start justify-center pb-0 pt-[80px] px-0 w-[1920px] ${className}`}
      data-name="herosection"
      data-node-id="21:119"
    >
      <div className="basis-0 box-border content-stretch flex flex-col gap-[32px] grow items-center justify-center min-h-px min-w-px pb-[144px] pt-[96px] px-0 relative self-stretch shrink-0">
        {/* HOPE. ロゴ */}
        <div className="h-[89px] relative shrink-0 w-[344px]">
          <img
            alt="HOPE."
            className="block max-w-none size-full"
            src={imgHopeLogo}
          />
        </div>

        {/* サブタイトル */}
        <div className="content-stretch flex flex-col items-center relative shrink-0 w-full">
          <div className="flex flex-col font-['Noto_Sans_JP'] font-medium justify-center leading-[0] relative shrink-0 text-[14px] text-[#9ca3af] text-center text-nowrap tracking-[0.7px]">
            <p className="leading-[20px] whitespace-pre">{subtitle}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Herosection;
```

---

## 📱 レスポンシブ対応

### ブレークポイント別レイアウト

| デバイス                  | 外側幅 | 内側パディング上 | 内側パディング下 | ロゴサイズ | ロゴ縮小率 | サブタイトルサイズ |
| ------------------------- | ------ | ---------------- | ---------------- | ---------- | ---------- | ------------------ |
| **デスクトップ** (1920px) | 1920px | 96px             | 144px            | 344×89px   | 100%       | 14px               |
| **タブレット** (768-1919px) | 100%   | 80px             | 120px            | 280×72px   | 81%        | 13px               |
| **モバイル** (375-767px)  | 100%   | 60px             | 80px             | 200×52px   | 58%        | 12px               |

### レスポンシブ実装例

```typescript
export const Herosection: React.FC<HerosectionProps> = ({
  className = "",
  subtitle = "BONOをつくる30代在宅独身男性のクラフト日誌",
}) => {
  return (
    <div
      className={`
        box-border content-stretch flex items-start justify-center
        pb-0 pt-[80px] md:pt-[60px] sm:pt-[48px]
        px-0
        w-full max-w-[1920px]
        ${className}
      `}
      data-name="herosection"
      data-node-id="21:119"
    >
      <div
        className="
          basis-0 box-border content-stretch
          flex flex-col
          gap-[32px] md:gap-[24px] sm:gap-[16px]
          grow items-center justify-center
          min-h-px min-w-px
          pb-[144px] md:pb-[120px] sm:pb-[80px]
          pt-[96px] md:pt-[80px] sm:pt-[60px]
          px-0
          relative self-stretch shrink-0
        "
      >
        {/* HOPE. ロゴ */}
        <div
          className="
            h-[89px] md:h-[72px] sm:h-[52px]
            w-[344px] md:w-[280px] sm:w-[200px]
            relative shrink-0
          "
        >
          <img
            alt="HOPE."
            className="block max-w-none size-full"
            src={imgHopeLogo}
          />
        </div>

        {/* サブタイトル */}
        <div className="content-stretch flex flex-col items-center relative shrink-0 w-full px-4">
          <div
            className="
              flex flex-col
              font-['Noto_Sans_JP'] font-medium
              justify-center leading-[0]
              relative shrink-0
              text-[14px] md:text-[13px] sm:text-[12px]
              text-[#9ca3af]
              text-center
              text-nowrap sm:text-wrap
              tracking-[0.7px]
            "
          >
            <p className="leading-[20px] whitespace-pre sm:whitespace-normal">
              {subtitle}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
```

---

## 🎨 Tailwind CSS 設定

### 必要なカスタム設定

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      fontFamily: {
        noto: ["Noto Sans JP", "sans-serif"],
      },
      colors: {
        "gray-chateau": "#9CA3AF",
      },
      letterSpacing: {
        "0.7": "0.7px",
      },
      screens: {
        sm: "375px",
        md: "768px",
        lg: "1920px",
      },
    },
  },
};
```

---

## 🔐 アクセシビリティ

### 推奨設定

```typescript
<div
  role="banner"
  aria-label="Hero Section"
  className="..."
>
  <img
    alt="HOPE. - BONOブログのメインタイトル"
    src={imgHopeLogo}
  />
  <p aria-label="サブタイトル">
    {subtitle}
  </p>
</div>
```

### コントラスト比

- **サブタイトル** (#9CA3AF on 背景):
  - 背景が白系の場合: WCAG AA 準拠
  - 確認推奨: 実際の背景色とのコントラスト比を計算

---

## 📝 実装チェックリスト

### アセット

- [ ] HOPE.ロゴSVGを `/assets/blog/` に配置
- [ ] 画像パスの確認

### フォント

- [ ] Noto Sans JP の読み込み
- [ ] フォントウェイト 500 (Medium) の確認

### レイアウト

- [ ] 1920px幅の確認（デスクトップ）
- [ ] 中央揃えの確認
- [ ] パディング値の確認（上: 80px+96px, 下: 144px）
- [ ] ロゴとサブタイトルの間隔 32px

### レスポンシブ

- [ ] タブレット（768px-1919px）での表示確認
- [ ] モバイル（375px-767px）での表示確認
- [ ] ロゴサイズの段階的縮小
- [ ] サブタイトルの折り返し（モバイル）

### アクセシビリティ

- [ ] alt属性の設定
- [ ] role属性の設定
- [ ] aria-label の設定
- [ ] コントラスト比の確認

### パフォーマンス

- [ ] 画像の最適化
- [ ] フォントの遅延読み込み
- [ ] 不要な再レンダリングの防止

---

## 🎯 デザイン意図・使用シーン

### 目的

- サイト訪問時に「希望（HOPE）」というメッセージを視覚的に伝える
- BONO ブログの主軸とコンセプトを明確に示す
- 視覚的なインパクトで訪問者の注意を引く

### 配置

- ページ最上部（ヘッダーの下）
- 全ページで共通のヒーローセクション

### 効果

- 大きなタイトルで強い印象を与える
- サブタイトルで運営者の人柄を伝える
- シンプルで洗練されたデザイン

---

## 🚀 使用方法

### 1. アセットの準備

```bash
# HOPEロゴSVGを配置
cp bbde0d9860756a76727bcbe17eabccd0d60e09f6.svg public/assets/blog/
```

### 2. フォントの読み込み

```html
<!-- index.html または _document.tsx -->
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@500&display=swap"
  rel="stylesheet"
/>
```

### 3. コンポーネントの使用

```typescript
import { Herosection } from "@/components/blog/Herosection";

export const BlogPage = () => {
  return (
    <div>
      <Herosection />
      {/* 他のコンテンツ */}
    </div>
  );
};
```

### 4. カスタマイズ

```typescript
// サブタイトルをカスタマイズ
<Herosection subtitle="カスタムサブタイトル" />

// クラスを追加
<Herosection className="my-custom-class" />
```

---

## 🔗 関連ドキュメント

- [ブログページ全体レイアウト](./blog-page-layout-specification.md)
- [背景グラデーション](./background-gradation-implementation.md)
- [ブログカード](./blogcard.md)
- [ナビゲーション](./navigation-blog.md)

---

## 📊 技術仕様まとめ

### サイズ

- **全体**: 1920×461px
- **HOPEロゴ**: 344×89px
- **サブタイトル**: 幅100%、高さ20px

### スペーシング

- **外側パディング**: 上80px、下0px
- **内側パディング**: 上96px、下144px
- **要素間隔**: 32px

### カラー

- **サブタイトル**: #9CA3AF (Gray Chateau)

### タイポグラフィ

- **フォント**: Noto Sans JP
- **サイズ**: 14px
- **ウェイト**: 500 (Medium)
- **行高**: 20px
- **文字間隔**: 0.7px

---

**仕様書作成日**: 2025 年 11 月 10 日  
**作成者**: Claude (Figma MCP データ抽出)  
**Figma File**: ee9rQHm0c0QLHpMgCqZpRe  
**Node ID**: 21:119
