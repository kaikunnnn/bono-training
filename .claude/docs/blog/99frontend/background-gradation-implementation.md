# 背景グラデーション実装仕様書

## 概要

BONO blog サイトの背景グラデーションコンポーネントの完全な実装仕様です。
この仕様書に基づいて、AI エージェントがそのまま実装できるようにすべての必要情報をまとめています。

**Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=19-113  
**Node ID**: `19:113`  
**コンポーネント名**: `background_gradation_color`  
**最終更新**: 2025 年 11 月 10 日

---

## デザイン情報

### Figma 情報

- **Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=19-113
- **Node ID**: `19:113`
- **コンポーネント名**: `background_gradation_color`

### デザインスペック

- **幅**: 1920px
- **高さ**: 1625.397px
- **位置**: x=1246, y=1860 (Figma 上の配置)
- **構成**: 3 つのベクターレイヤーで構成されたグラデーション
  - Vector (1:193) - ホワイトレイヤー
  - Vector (1:194) - オレンジ/ピーチレイヤー
  - Vector (1:195) - ブルー/パープルレイヤー

---

## デザイントークン

### カラー変数

```typescript
const colors = {
  white: "#FFFFFF",
  blue75: "#8388FA",
  orange75: "#FAA38300", // 透明度0%のオレンジ
};
```

### その他の変数

```typescript
const designTokens = {
  strokeWeight: 1.2698413133621216,
  opacity: 100, // 100%
};
```

---

## レイヤー構造

### 3 層のベクターレイヤー

#### Layer 1: ホワイトベース (1:193)

- **色**: `rgba(255, 255, 255, 1)` (#FFFFFF)
- **透明度**: 100%
- **位置**: absolute, inset-0
- **役割**: ベースとなる白色レイヤー

#### Layer 2: オレンジ/ピーチ (1:194)

- **色**: `rgba(255, 242, 227, 1)` (#FFF2E3)
- **透明度**: 100%
- **位置**: absolute, inset-0
- **役割**: 温かみのあるオレンジ/ピーチトーン

#### Layer 3: ブルー/パープル (1:195)

- **透明度**: 100%
- **位置**: absolute, inset-0
- **役割**: 淡いブルー/パープルのアクセント

---

## アセット情報

### SVG ファイル

- **Layer 1**: `/assets/blog/433ed0613bf25feb7bf8d3b6a7a1c4eba0d625a7.svg`
- **Layer 2**: `/assets/blog/3a6ecfd12b4419c7d8128d289ef5b66946b76dbd.svg`
- **Layer 3**: `/assets/blog/ee31314e116b707652dae3d9cd4c46fb7b9e0f26.svg`

### 保存場所

すべてのアセットは `/Users/kaitakumi/Documents/bono-training/public/assets/blog/` に保存済み

---

## ビジュアル

淡い紫がかったグラデーション背景で、柔らかく優雅な印象を与えるデザイン。
白をベースに、オレンジ/ピーチとブルー/パープルが重なり合い、微妙なグラデーション効果を生み出しています。

---

## 実装コード

### React + TypeScript + Tailwind CSS

```typescript
import React from "react";

const imgVector = "/assets/blog/433ed0613bf25feb7bf8d3b6a7a1c4eba0d625a7.svg";
const imgVector1 = "/assets/blog/3a6ecfd12b4419c7d8128d289ef5b66946b76dbd.svg";
const imgVector2 = "/assets/blog/ee31314e116b707652dae3d9cd4c46fb7b9e0f26.svg";

interface BackgroundGradationProps {
  className?: string;
}

export const BackgroundGradation: React.FC<BackgroundGradationProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`h-[1625.4px] opacity-100 w-[1920px] relative ${className}`}
      data-name="background_gradation_color"
      data-node-id="19:113"
      aria-hidden="true"
    >
      {/* Layer 1: ホワイトベース */}
      <div
        className="absolute inset-0 opacity-100"
        data-name="Vector"
        data-node-id="1:193"
      >
        <div className="absolute inset-0">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgVector}
            style={{ fill: "rgba(255, 255, 255, 1)" }}
          />
        </div>
      </div>

      {/* Layer 2: オレンジ/ピーチ */}
      <div
        className="absolute inset-0 opacity-100"
        data-name="Vector"
        data-node-id="1:194"
      >
        <div className="absolute inset-0">
          <img
            alt=""
            className="block max-w-none size-full"
            src={imgVector1}
            style={{ fill: "rgba(255, 242, 227, 1)" }}
          />
        </div>
      </div>

      {/* Layer 3: ブルー/パープル */}
      <div
        className="absolute inset-0 opacity-100"
        data-name="Vector"
        data-node-id="1:195"
      >
        <img alt="" className="block max-w-none size-full" src={imgVector2} />
      </div>
    </div>
  );
};

export default BackgroundGradation;
```

---

## 使用例

### 1. ページ全体の背景として使用

```typescript
// pages/BlogPage.tsx
import { BackgroundGradation } from "@/components/common/BackgroundGradation";

export const BlogPage = () => {
  return (
    <div className="relative min-h-screen">
      {/* 背景レイヤー */}
      <div className="fixed inset-0 -z-10">
        <BackgroundGradation />
      </div>

      {/* コンテンツ */}
      <main className="relative z-10">{/* ページコンテンツ */}</main>
    </div>
  );
};
```

### 2. セクションの背景として使用

```typescript
// components/sections/HeroSection.tsx
import { BackgroundGradation } from "@/components/common/BackgroundGradation";

export const HeroSection = () => {
  return (
    <section className="relative py-20 overflow-hidden">
      {/* 背景レイヤー */}
      <div className="absolute inset-0 -z-10">
        <BackgroundGradation />
      </div>

      {/* コンテンツ */}
      <div className="container mx-auto px-4">
        <h1 className="text-4xl font-bold">Welcome to BONO</h1>
      </div>
    </section>
  );
};
```

### 3. カスタムスタイルを適用

```typescript
import { BackgroundGradation } from "@/components/common/BackgroundGradation";

export const CustomSection = () => {
  return (
    <div className="relative">
      <BackgroundGradation className="opacity-50 blur-sm" />
      <div className="relative z-10">{/* コンテンツ */}</div>
    </div>
  );
};
```

---

## レスポンシブ対応

### 全画面対応版

```typescript
export const BackgroundGradation: React.FC<BackgroundGradationProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`w-full h-full min-h-screen opacity-100 relative ${className}`}
      data-name="background_gradation_color"
      data-node-id="19:113"
      aria-hidden="true"
    >
      {/* Layer 1: ホワイトベース */}
      <div className="absolute inset-0 opacity-100">
        <img
          alt=""
          className="block w-full h-full object-cover"
          src={imgVector}
        />
      </div>

      {/* Layer 2: オレンジ/ピーチ */}
      <div className="absolute inset-0 opacity-100">
        <img
          alt=""
          className="block w-full h-full object-cover"
          src={imgVector1}
        />
      </div>

      {/* Layer 3: ブルー/パープル */}
      <div className="absolute inset-0 opacity-100">
        <img
          alt=""
          className="block w-full h-full object-cover"
          src={imgVector2}
        />
      </div>
    </div>
  );
};
```

### 固定背景版（推奨）

```typescript
// ページ全体に固定表示
<div className="fixed inset-0 -z-10 w-full h-full overflow-hidden">
  <BackgroundGradation className="w-full h-full" />
</div>
```

---

## CSS カスタマイズオプション

### 透明度の調整

```css
/* 50%の透明度 */
.bg-gradation-fade {
  opacity: 0.5;
}

/* グラデーションオーバーレイ */
.bg-gradation-overlay::after {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(to bottom, transparent, rgba(255, 255, 255, 0.8));
}
```

### アニメーション効果

```css
/* フェードイン */
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.bg-gradation-animate {
  animation: fadeIn 1s ease-in-out;
}

/* スクロールパララックス */
.bg-gradation-parallax {
  transform: translateY(var(--scroll-y, 0));
  transition: transform 0.1s ease-out;
}
```

---

## パフォーマンス最適化

### 1. 遅延読み込み

```typescript
import { lazy, Suspense } from "react";

const BackgroundGradation = lazy(() =>
  import("@/components/common/BackgroundGradation").then((module) => ({
    default: module.BackgroundGradation,
  }))
);

export const OptimizedPage = () => {
  return (
    <Suspense fallback={<div className="bg-gray-100" />}>
      <BackgroundGradation />
    </Suspense>
  );
};
```

### 2. プリロード

```html
<!-- index.html or _document.tsx -->
<link
  rel="preload"
  as="image"
  href="/assets/blog/433ed0613bf25feb7bf8d3b6a7a1c4eba0d625a7.svg"
/>
<link
  rel="preload"
  as="image"
  href="/assets/blog/3a6ecfd12b4419c7d8128d289ef5b66946b76dbd.svg"
/>
<link
  rel="preload"
  as="image"
  href="/assets/blog/ee31314e116b707652dae3d9cd4c46fb7b9e0f26.svg"
/>
```

### 3. CSS 背景として使用（代替案）

```typescript
export const BackgroundGradationCSS = () => {
  return (
    <div
      className="w-full h-full"
      style={{
        backgroundImage: `
          url(/assets/blog/433ed0613bf25feb7bf8d3b6a7a1c4eba0d625a7.svg),
          url(/assets/blog/3a6ecfd12b4419c7d8128d289ef5b66946b76dbd.svg),
          url(/assets/blog/ee31314e116b707652dae3d9cd4c46fb7b9e0f26.svg)
        `,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    />
  );
};
```

---

## アクセシビリティ

### 推奨設定

```typescript
<div role="presentation" aria-hidden="true" className="...">
  <img
    alt="" // 装飾的な画像なので空文字
    role="presentation"
    className="..."
  />
</div>
```

### 動きの軽減対応

```css
@media (prefers-reduced-motion: reduce) {
  .bg-gradation-animate {
    animation: none;
  }
}
```

---

## テストケース

### Unit Test

```typescript
import { render } from "@testing-library/react";
import { BackgroundGradation } from "./BackgroundGradation";

describe("BackgroundGradation", () => {
  it("renders correctly", () => {
    const { container } = render(<BackgroundGradation />);
    const images = container.querySelectorAll("img");
    expect(images).toHaveLength(3);
  });

  it("applies custom className", () => {
    const { container } = render(
      <BackgroundGradation className="custom-class" />
    );
    expect(container.firstChild).toHaveClass("custom-class");
  });

  it("has correct data attributes", () => {
    const { container } = render(<BackgroundGradation />);
    const element = container.firstChild as HTMLElement;
    expect(element.getAttribute("data-name")).toBe(
      "background_gradation_color"
    );
    expect(element.getAttribute("data-node-id")).toBe("19:113");
  });

  it("renders all three layers", () => {
    const { container } = render(<BackgroundGradation />);
    const layers = container.querySelectorAll('[data-name="Vector"]');
    expect(layers).toHaveLength(3);
  });
});
```

---

## 実装チェックリスト

- [ ] SVG ファイルを `public/assets/blog/` に配置
  - [ ] 433ed0613bf25feb7bf8d3b6a7a1c4eba0d625a7.svg
  - [ ] 3a6ecfd12b4419c7d8128d289ef5b66946b76dbd.svg
  - [ ] ee31314e116b707652dae3d9cd4c46fb7b9e0f26.svg
- [ ] `BackgroundGradation.tsx` コンポーネントを作成
- [ ] TypeScript 型定義を追加
- [ ] Tailwind CSS クラスが正しく適用されることを確認
- [ ] 3 つのレイヤーが正しく重なっていることを確認
- [ ] レスポンシブデザインのテスト
- [ ] パフォーマンス測定（Lighthouse）
- [ ] アクセシビリティチェック
- [ ] 各ブラウザでの表示確認
- [ ] モバイルデバイスでの表示確認
- [ ] ユニットテストの実装と実行

---

## トラブルシューティング

### 画像が表示されない場合

1. SVG ファイルのパスを確認: `/public/assets/blog/*.svg`
2. ビルド後の dist フォルダにファイルがコピーされているか確認
3. ブラウザの開発者ツールでネットワークエラーを確認

### グラデーションが正しく表示されない場合

1. SVG ファイルの内容を確認（破損していないか）
2. 3 つのレイヤーが正しく重なっているか確認（z-index）
3. 親要素の`height`が設定されているか確認

### レイヤーの重なり順が正しくない場合

1. DOM の順序を確認（後に記述したものが上に表示される）
2. `absolute` positioning が正しく適用されているか確認
3. `inset-0` が正しく機能しているか確認

### パフォーマンスが悪い場合

1. 画像の遅延読み込み（`loading="lazy"`）を確認
2. SVG ファイルサイズを最適化（SVGO 等のツール使用）
3. CSS 背景として使用することを検討
4. 3 つのレイヤーを 1 つの画像に統合することを検討

---

## 関連ファイル

- コンポーネント: `src/components/common/BackgroundGradation.tsx`
- アセット: `public/assets/blog/*.svg` (3 ファイル)
- スタイル: Tailwind CSS（インライン）
- テスト: `src/components/common/__tests__/BackgroundGradation.test.tsx`

---

## 更新履歴

- 2025-11-10: Figma デザインから自動生成（Node ID: 19:113）
- 3 層のベクターレイヤー構造を詳細化
- アセットパスを `/assets/blog/` に更新
- レスポンシブ対応とパフォーマンス最適化を追加

---

## 備考

このコンポーネントは、BONO blog サイト全体で使用される基本的な背景グラデーションです。
デザインシステムの一部として、一貫性のある視覚体験を提供します。

### レイヤー構成の意図

1. **Layer 1 (ホワイト)**: ベースとなる明るい背景
2. **Layer 2 (オレンジ/ピーチ)**: 温かみと柔らかさを追加
3. **Layer 3 (ブルー/パープル)**: 深みと優雅さを演出

3 つのレイヤーが重なり合うことで、微妙で洗練されたグラデーション効果を実現しています。

### カスタマイズ時の注意

- レイヤーの順序を変更すると、グラデーションの見た目が大きく変わります
- 透明度を調整する場合は、3 つのレイヤー全体のバランスを考慮してください
- 単一のレイヤーのみを使用することも可能ですが、デザインの意図が失われる可能性があります

カスタマイズが必要な場合は、`className` props を使用して Tailwind クラスを追加してください。
コンポーネント自体の変更は、デザインシステム全体に影響するため、慎重に行ってください。
