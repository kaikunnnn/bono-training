# 太陽の装飾（Sun Decoration）実装仕様書

## 概要

BONO blog のページ右下に配置される装飾的な太陽のイラストコンポーネントの完全な実装仕様です。
温かみと希望を表現する視覚的なアクセントとして機能します。

**Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=1-6  
**Node ID**: `1:6`  
**コンポーネント名**: `Container` (sun image)  
**最終更新**: 2025 年 11 月 10 日

---

## デザイン情報

### Figma 情報

- **Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=1-6
- **Node ID**: `1:6`
- **コンポーネント名**: `Container` (sun image)
- **位置**: x=1724, y=1283 (Figma 上の配置)

### デザインスペック

- **サイズ**: 260×260px (固定)
- **形状**: 円形のグラデーション
- **配置**: ページ右下（固定位置）
- **透明度**: 100%
- **役割**: 装飾的要素

---

## ビジュアル

淡いピンクからパープルへのグラデーションが特徴的な円形の太陽イラスト。
柔らかく優しい色合いで、ページに温かみと希望を添えます。

### カラーグラデーション

- **ピンク系**: 淡いピーチピンク
- **オレンジ系**: #FC9F7C (Orange 74)
- **レッド系**: #EE6C6C (Red 68)
- **ブルー系**: #1135B3 (Blue 38)
- グラデーションが複雑に混ざり合い、夕日のような温かい雰囲気を演出

---

## コンポーネント構造

```
Container (1:6) - 260×260px
└── sun image (1:7) - 260×260px
    └── sun.svg fill (1:9) - 260×260px
        └── sun.svg (1:10) - 260×260px
            └── Vector (1:11) - グラデーション図形
```

---

## 詳細仕様

### 1. 外側コンテナ (1:6)

| プロパティ     | 値                |
| -------------- | ----------------- |
| **要素名**     | Container         |
| **サイズ**     | 260×260px         |
| **レイアウト** | flex-col          |
| **配置**       | items-start       |
| **役割**       | 位置決め用コンテナ |

### 2. sun image (1:7)

| プロパティ | 値        |
| ---------- | --------- |
| **要素名** | sun image |
| **サイズ** | 260×260px |
| **最大幅** | 260px     |
| **overflow** | clip    |

### 3. sun.svg fill (1:9)

| プロパティ     | 値                        |
| -------------- | ------------------------- |
| **要素名**     | sun.svg fill              |
| **サイズ**     | 260×260px                 |
| **レイアウト** | flex-col                  |
| **配置**       | items-center, justify-center |
| **overflow**   | clip                      |

### 4. sun.svg (1:10)

| プロパティ   | 値                                                          |
| ------------ | ----------------------------------------------------------- |
| **要素名**   | sun.svg                                                     |
| **サイズ**   | 260×260px                                                   |
| **透明度**   | 100%                                                        |
| **アセット** | `/assets/blog/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg` |

### 5. Vector (1:11)

| プロパティ | 値                              |
| ---------- | ------------------------------- |
| **要素名** | Vector                          |
| **X 座標** | -46.44px (オーバーフロー)       |
| **Y 座標** | 82.72px                         |
| **幅**     | 352.88px (実際の描画領域)       |
| **高さ**   | 352.88px                        |
| **役割**   | グラデーション図形              |

---

## デザイントークン

### カラー

```typescript
const colors = {
  blue38: "#1135B3",
  red68: "#EE6C6C",
  orange74: "#FC9F7C",
};
```

### サイズ

```typescript
const sizes = {
  sunSize: 260, // 固定サイズ
  strokeWeight: 0.8360128402709961,
};
```

### その他

```typescript
const tokens = {
  opacity: 100,
  width: 260,
};
```

---

## 完全な実装コード

### React + TypeScript + Tailwind CSS

```typescript
import React from "react";

const imgSunSvg = "/assets/blog/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg";

interface SunDecorationProps {
  className?: string;
}

export const SunDecoration: React.FC<SunDecorationProps> = ({
  className = "",
}) => {
  return (
    <div
      className={`content-stretch flex flex-col items-start relative size-full ${className}`}
      data-name="Container"
      data-node-id="1:6"
      aria-hidden="true"
    >
      <div
        className="content-stretch flex flex-col items-start max-w-[260px] overflow-clip relative shrink-0 w-[260px]"
        data-name="sun image"
        data-node-id="1:7"
      >
        <div
          className="content-stretch flex flex-col items-center justify-center overflow-clip relative shrink-0 size-[260px]"
          data-name="sun.svg fill"
          data-node-id="1:9"
        >
          <div
            className="opacity-100 relative shrink-0 size-[260px]"
            data-name="sun.svg"
            data-node-id="1:10"
          >
            <img
              alt=""
              className="block max-w-none size-full"
              src={imgSunSvg}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SunDecoration;
```

---

## 配置パターン

### 1. 右下固定配置（推奨）

```typescript
export const BlogPage = () => {
  return (
    <div className="relative min-h-screen">
      {/* 太陽の装飾 - 右下固定 */}
      <div
        className="
          fixed
          right-[5%] md:right-[3%] sm:right-[2%]
          bottom-[268px] md:bottom-[200px] sm:bottom-[150px]
          w-[260px] h-[260px]
          z-0
        "
        aria-hidden="true"
      >
        <SunDecoration />
      </div>

      {/* メインコンテンツ */}
      <main className="relative z-10">{/* コンテンツ */}</main>
    </div>
  );
};
```

### 2. 絶対位置配置

```typescript
<div className="relative">
  {/* 太陽の装飾 */}
  <div
    className="
      absolute
      right-0 bottom-0
      w-[260px] h-[260px]
      z-0
    "
    aria-hidden="true"
  >
    <SunDecoration />
  </div>

  {/* コンテンツ */}
  <div className="relative z-10">{/* コンテンツ */}</div>
</div>
```

### 3. カスタム位置

```typescript
<div
  className="
    fixed
    right-[100px]
    bottom-[300px]
    w-[260px] h-[260px]
  "
  style={{
    transform: "rotate(15deg)", // 回転も可能
  }}
>
  <SunDecoration />
</div>
```

---

## レスポンシブ対応

### ブレークポイント別配置

| デバイス                    | サイズ     | 右からの距離 | 下からの距離 |
| --------------------------- | ---------- | ------------ | ------------ |
| **デスクトップ** (1920px)   | 260×260px  | 5% (96px)    | 268px        |
| **タブレット** (768-1919px) | 260×260px  | 3%           | 200px        |
| **モバイル** (375-767px)    | 260×260px  | 2%           | 150px        |

### レスポンシブ実装

```typescript
export const ResponsiveSunDecoration = () => {
  return (
    <div
      className="
        fixed
        right-[5%] md:right-[3%] sm:right-[2%]
        bottom-[268px] md:bottom-[200px] sm:bottom-[150px]
        w-[260px] h-[260px]
        z-0
        pointer-events-none
      "
      aria-hidden="true"
    >
      <SunDecoration />
    </div>
  );
};
```

---

## アニメーション効果（オプション）

### 1. フェードイン

```typescript
export const AnimatedSunDecoration = () => {
  return (
    <div
      className="
        fixed right-[5%] bottom-[268px]
        w-[260px] h-[260px]
        animate-fade-in
      "
      aria-hidden="true"
    >
      <SunDecoration />
    </div>
  );
};

// Tailwind CSS設定
// tailwind.config.ts
export default {
  theme: {
    extend: {
      animation: {
        "fade-in": "fadeIn 1s ease-in-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
      },
    },
  },
};
```

### 2. ゆっくり回転

```css
@keyframes slowRotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.sun-rotate {
  animation: slowRotate 60s linear infinite;
}
```

### 3. パルス効果

```css
@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.8;
  }
}

.sun-pulse {
  animation: pulse 3s ease-in-out infinite;
}
```

---

## 使用例

### 1. 基本的な使用

```typescript
import { SunDecoration } from "@/components/blog/SunDecoration";

export const BlogPage = () => {
  return (
    <div className="relative min-h-screen">
      <div className="fixed right-[5%] bottom-[268px] w-[260px] h-[260px] z-0">
        <SunDecoration />
      </div>
      <main>{/* コンテンツ */}</main>
    </div>
  );
};
```

### 2. アニメーション付き

```typescript
<div className="fixed right-[5%] bottom-[268px] w-[260px] h-[260px] z-0 animate-fade-in">
  <SunDecoration />
</div>
```

### 3. カスタムスタイル

```typescript
<div
  className="fixed right-[5%] bottom-[268px] w-[260px] h-[260px] z-0"
  style={{
    opacity: 0.7,
    filter: "blur(2px)",
  }}
>
  <SunDecoration />
</div>
```

---

## アクセシビリティ

### 推奨設定

```typescript
<div
  role="presentation"
  aria-hidden="true"
  className="..."
>
  <img alt="" src={imgSunSvg} />
</div>
```

### 注意事項

- 装飾的な要素のため `aria-hidden="true"` を設定
- `alt=""` で空文字を設定（装飾画像）
- `pointer-events-none` でクリックイベントを無効化

---

## パフォーマンス最適化

### 1. 遅延読み込み

```typescript
<img
  alt=""
  className="block max-w-none size-full"
  src={imgSunSvg}
  loading="lazy"
/>
```

### 2. プリロード（重要な装飾の場合）

```html
<!-- index.html または _document.tsx -->
<link
  rel="preload"
  as="image"
  href="/assets/blog/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg"
/>
```

### 3. CSS による最適化

```css
.sun-decoration {
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

---

## 実装チェックリスト

### アセット

- [ ] 太陽 SVG を `/assets/blog/` に配置
- [ ] ファイルサイズの確認（最適化済みか）

### コンポーネント

- [ ] `SunDecoration.tsx` の作成
- [ ] TypeScript 型定義の追加
- [ ] Props の検証

### 配置

- [ ] 右下固定位置の確認
- [ ] z-index の設定（0 推奨）
- [ ] pointer-events-none の設定

### レスポンシブ

- [ ] Desktop（1920px）での表示確認
- [ ] Tablet（768px-1919px）での表示確認
- [ ] Mobile（375px-767px）での表示確認
- [ ] 位置調整の確認

### アクセシビリティ

- [ ] aria-hidden="true" の設定
- [ ] role="presentation" の設定
- [ ] alt="" の設定

### パフォーマンス

- [ ] 画像の遅延読み込み
- [ ] 不要な再レンダリングの防止
- [ ] アニメーションのパフォーマンス確認

---

## トラブルシューティング

### 画像が表示されない場合

1. **SVG ファイルのパスを確認**
   ```bash
   ls -la public/assets/blog/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg
   ```

2. **ビルド後の dist フォルダ確認**
   ```bash
   npm run build
   ls -la dist/assets/blog/
   ```

3. **ブラウザの開発者ツールでネットワークエラーを確認**

### 位置がずれる場合

1. **親要素の position を確認**
   - `relative` または `absolute` が必要

2. **z-index の確認**
   - 背景より上、コンテンツより下（0 推奨）

3. **レスポンシブクラスの確認**
   ```html
   <div className="right-[5%] md:right-[3%] sm:right-[2%]">
   ```

### アニメーションが動作しない場合

1. **Tailwind CSS の設定確認**
   ```typescript
   // tailwind.config.ts で animation を定義
   ```

2. **CSS の読み込み確認**
   ```css
   @keyframes fadeIn { ... }
   ```

3. **ブラウザの互換性確認**
   - CSS animations のサポート状況

### パフォーマンスが悪い場合

1. **SVG ファイルサイズの確認**
   ```bash
   # SVGの最適化
   npx svgo public/assets/blog/82c8bc0c7e4edf6d630d1c217268bbafd904b609.svg
   ```

2. **アニメーションの最適化**
   ```css
   /* GPU アクセラレーションを有効化 */
   transform: translateZ(0);
   will-change: transform;
   ```

3. **遅延読み込みの確認**
   ```html
   <img loading="lazy" ... />
   ```

---

## 関連ドキュメント

- [ブログページ全体レイアウト](./blog-page-layout-specification.md)
- [背景グラデーション](./background-gradation-implementation.md)
- [ヒーローセクション](./herosection.md)

---

## 更新履歴

- 2025-11-10: Figma デザインから自動生成（Node ID: 1:6）
- レスポンシブ対応を追加
- アニメーション効果を追加
- アクセシビリティとパフォーマンス最適化を追加

---

## 備考

この太陽の装飾は、BONO blog のページに温かみと希望を添える装飾的要素です。

### デザインの意図

- **温かみ**: ピンク〜オレンジのグラデーションで優しい印象
- **希望**: 太陽モチーフで明るく前向きなイメージ
- **控えめ**: 右下配置で主コンテンツを邪魔しない
- **ブランディング**: BONO の「HOPE」というメッセージと連動

### 配置の理由

- **右下**: 視線の流れを妨げない位置
- **固定サイズ**: 260×260px で一貫性を保つ
- **z-index: 0**: 背景より上、コンテンツより下
- **pointer-events-none**: クリックを透過

### カスタマイズ時の注意

- サイズを変更する場合は、ページ全体のバランスを考慮してください
- アニメーションを追加する場合は、パフォーマンスに注意してください
- 色を変更する場合は、グラデーションの SVG ファイルを編集する必要があります
- 配置を変更する場合は、レスポンシブ対応も忘れずに調整してください

カスタマイズが必要な場合は、`className` props を使用して Tailwind クラスを追加してください。

