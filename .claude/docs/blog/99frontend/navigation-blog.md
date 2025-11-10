# ブログヘッダー（header）実装仕様書

## 概要

BONO blog のヘッダーコンポーネントの完全な実装仕様です。
BONO ロゴを左側に配置したシンプルなヘッダーデザインです。

**Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=3-207  
**Node ID**: `3:207`  
**コンポーネント名**: `header`  
**最終更新**: 2025 年 11 月 10 日

---

## デザイン情報

### Figma 情報

- **Figma URL**: https://www.figma.com/design/ee9rQHm0c0QLHpMgCqZpRe/BONO-blog-2025-data?node-id=3-207
- **Node ID**: `3:207`
- **コンポーネント名**: `header`
- **位置**: x=-408, y=-133 (Figma 上の配置)

### デザインスペック

- **幅**: 1920px (全幅)
- **高さ**: 74.07px
- **パディング**: 24px (上下左右)
- **レイアウト**: flex, justify-between
- **配置**: 固定位置（ページ上部）

---

## コンポーネント構造

```
header (3:207) - 1920×74.07px
├── left (3:208) - 112px
│   └── Link (3:209)
│       └── BONO (3:210) - 88×26.07px
│           └── logo.svg fill (3:211)
│               └── logo.svg (3:212) - 88×26.074px
└── right (27:139) - 112px (空スペース)
```

---

## 詳細仕様

### 1. ヘッダー全体 (3:207)

| プロパティ     | 値                        |
| -------------- | ------------------------- |
| **要素名**     | header                    |
| **サイズ**     | 1920×74.07px              |
| **パディング** | 24px (上下左右)           |
| **レイアウト** | flex                      |
| **配置**       | items-center, justify-between |
| **位置**       | 固定（top: 0）            |
| **z-index**    | 50 (推奨)                 |

### 2. 左側コンテナ (3:208)

| プロパティ | 値        |
| ---------- | --------- |
| **要素名** | left      |
| **幅**     | 112px     |
| **高さ**   | 26.07px   |
| **配置**   | flex-col  |

### 3. リンク (3:209)

| プロパティ | 値        |
| ---------- | --------- |
| **要素名** | Link      |
| **幅**     | 112px     |
| **高さ**   | 26.07px   |
| **役割**   | ホームへのリンク |

### 4. BONO ロゴコンテナ (3:210)

| プロパティ | 値        |
| ---------- | --------- |
| **要素名** | BONO      |
| **幅**     | 88px      |
| **高さ**   | 26.07px   |
| **最大幅** | 112px     |
| **overflow** | clip    |

### 5. ロゴ SVG (3:211, 3:212)

| プロパティ   | 値                                                          |
| ------------ | ----------------------------------------------------------- |
| **要素名**   | logo.svg                                                    |
| **サイズ**   | 88×26.074px                                                 |
| **透明度**   | 100%                                                        |
| **色**       | #151834 (Ebony)                                             |
| **アセット** | `/assets/blog/d6495cc76015bd725cb662d469f2c31129d53e32.svg` |

### 6. 右側スペース (27:139)

| プロパティ | 値        |
| ---------- | --------- |
| **要素名** | right     |
| **幅**     | 112px     |
| **高さ**   | 26.07px   |
| **役割**   | 将来の拡張用スペース |

---

## デザイントークン

### カラー

```typescript
const colors = {
  ebony: "#151834", // ロゴ色
};
```

### サイズ

```typescript
const sizes = {
  headerWidth: 1920,
  headerHeight: 74.07,
  logoWidth: 88,
  logoHeight: 26.074,
  containerWidth: 112,
  padding: 24,
};
```

### その他

```typescript
const tokens = {
  strokeWeight: 0.8148148059844971,
  opacity: 100,
};
```

---

## 完全な実装コード

### React + TypeScript + Tailwind CSS

```typescript
import React from "react";
import Link from "next/link"; // Next.js の場合

const imgLogoSvg = "/assets/blog/d6495cc76015bd725cb662d469f2c31129d53e32.svg";

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <header
      className={`
        box-border content-stretch
        flex items-center justify-between
        p-6
        relative w-full
        ${className}
      `}
      data-name="header"
      data-node-id="3:207"
    >
      {/* 左側: ロゴ */}
      <div
        className="content-stretch flex flex-col items-start relative shrink-0 w-[112px]"
        data-name="left"
        data-node-id="3:208"
      >
        <Link
          href="/"
          className="content-stretch flex items-start relative shrink-0 w-full no-underline"
          data-name="Link"
          data-node-id="3:209"
        >
          <div
            className="content-stretch flex flex-col items-start max-w-[112px] overflow-clip relative shrink-0 w-[88px]"
            data-name="BONO"
            data-node-id="3:210"
          >
            <div
              className="content-stretch flex flex-col h-[26.07px] items-center justify-center overflow-clip relative shrink-0 w-[88px]"
              data-name="logo.svg fill"
              data-node-id="3:211"
            >
              <div
                className="h-[26.074px] opacity-100 relative shrink-0 w-[88px]"
                data-name="logo.svg"
                data-node-id="3:212"
              >
                <img
                  alt="BONO"
                  className="block max-w-none size-full"
                  src={imgLogoSvg}
                />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* 右側: 将来の拡張用スペース */}
      <div
        className="h-[26.07px] shrink-0 w-[112px]"
        data-name="right"
        data-node-id="27:139"
      />
    </header>
  );
};

export default Header;
```

---

## レスポンシブ対応

### ブレークポイント別レイアウト

| デバイス                    | ヘッダー幅 | パディング | ロゴサイズ |
| --------------------------- | ---------- | ---------- | ---------- |
| **デスクトップ** (1920px)   | 100%       | 24px       | 88×26.07px |
| **タブレット** (768-1919px) | 100%       | 24px       | 88×26.07px |
| **モバイル** (375-767px)    | 100%       | 16px       | 88×26.07px |

### レスポンシブ実装

```typescript
export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <header
      className={`
        box-border content-stretch
        flex items-center justify-between
        p-6 md:p-6 sm:p-4
        relative w-full
        ${className}
      `}
      data-name="header"
      data-node-id="3:207"
    >
      {/* 左側: ロゴ */}
      <div className="content-stretch flex flex-col items-start relative shrink-0 w-[112px]">
        <Link
          href="/"
          className="content-stretch flex items-start relative shrink-0 w-full no-underline"
          aria-label="BONO ホームページへ"
        >
          <div className="content-stretch flex flex-col items-start max-w-[112px] overflow-clip relative shrink-0 w-[88px]">
            <div className="content-stretch flex flex-col h-[26.07px] items-center justify-center overflow-clip relative shrink-0 w-[88px]">
              <div className="h-[26.074px] opacity-100 relative shrink-0 w-[88px]">
                <img
                  alt="BONO"
                  className="block max-w-none size-full"
                  src={imgLogoSvg}
                />
              </div>
            </div>
          </div>
        </Link>
      </div>

      {/* 右側: 将来の拡張用スペース */}
      <div className="h-[26.07px] shrink-0 w-[112px]" />
    </header>
  );
};
```

---

## 固定ヘッダー実装

### ページ上部に固定

```typescript
export const FixedHeader: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <header
      className={`
        fixed top-0 left-0 right-0
        z-50
        bg-white
        box-border content-stretch
        flex items-center justify-between
        p-6 md:p-6 sm:p-4
        w-full
        shadow-sm
        ${className}
      `}
    >
      {/* ... 同じ内容 ... */}
    </header>
  );
};
```

### スクロール時の背景追加

```typescript
import { useState, useEffect } from "react";

export const ScrollAwareHeader: React.FC<HeaderProps> = ({
  className = "",
}) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`
        fixed top-0 left-0 right-0
        z-50
        box-border content-stretch
        flex items-center justify-between
        p-6 md:p-6 sm:p-4
        w-full
        transition-all duration-200
        ${isScrolled ? "bg-white shadow-md" : "bg-transparent"}
        ${className}
      `}
    >
      {/* ... 同じ内容 ... */}
    </header>
  );
};
```

---

## 使用例

### 1. 基本的な使用

```typescript
import { Header } from "@/components/blog/Header";

export const BlogPage = () => {
  return (
    <div>
      <Header />
      <main>{/* コンテンツ */}</main>
    </div>
  );
};
```

### 2. 固定ヘッダーとして使用

```typescript
import { FixedHeader } from "@/components/blog/Header";

export const BlogLayout = ({ children }) => {
  return (
    <div className="min-h-screen">
      <FixedHeader />
      {/* ヘッダーの高さ分のスペース */}
      <div className="pt-[74.07px]">{children}</div>
    </div>
  );
};
```

### 3. スクロール対応ヘッダー

```typescript
import { ScrollAwareHeader } from "@/components/blog/Header";

export const BlogPage = () => {
  return (
    <div>
      <ScrollAwareHeader />
      <main className="pt-[74.07px]">{/* コンテンツ */}</main>
    </div>
  );
};
```

---

## アクセシビリティ

### 推奨設定

```typescript
<header role="banner" aria-label="サイトヘッダー">
  <Link href="/" aria-label="BONO ホームページへ">
    <img alt="BONO ロゴ" src={imgLogoSvg} />
  </Link>
</header>
```

### キーボードナビゲーション

```css
a:focus-visible {
  outline: 2px solid #151834;
  outline-offset: 2px;
  border-radius: 4px;
}
```

---

## パフォーマンス最適化

### 1. ロゴのプリロード

```html
<!-- index.html または _document.tsx -->
<link
  rel="preload"
  as="image"
  href="/assets/blog/d6495cc76015bd725cb662d469f2c31129d53e32.svg"
/>
```

### 2. メモ化

```typescript
export const Header = React.memo<HeaderProps>(({ className = "" }) => {
  // ...
});
```

### 3. CSS による固定ヘッダー最適化

```css
.fixed-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  will-change: transform;
  transform: translateZ(0);
  backface-visibility: hidden;
}
```

---

## 実装チェックリスト

### アセット

- [ ] BONO ロゴ SVG を `/assets/blog/` に配置
- [ ] ロゴの色が #151834 (Ebony) であることを確認

### コンポーネント

- [ ] `Header.tsx` の作成
- [ ] TypeScript 型定義の追加
- [ ] Link コンポーネントの設定

### スタイリング

- [ ] Tailwind CSS クラスの確認
- [ ] パディング（24px）の確認
- [ ] justify-between の確認
- [ ] ロゴサイズ（88×26.07px）の確認

### レスポンシブ

- [ ] Desktop（1920px）での表示確認
- [ ] Tablet（768px-1919px）での表示確認
- [ ] Mobile（375px-767px）での表示確認
- [ ] パディングの調整確認

### 固定ヘッダー（オプション）

- [ ] fixed positioning の確認
- [ ] z-index (50) の確認
- [ ] 背景色の設定
- [ ] 影の追加
- [ ] スクロール時の挙動確認

### アクセシビリティ

- [ ] role="banner" の設定
- [ ] aria-label の設定
- [ ] alt 属性の設定
- [ ] キーボードナビゲーションの確認

### パフォーマンス

- [ ] ロゴのプリロード
- [ ] コンポーネントのメモ化
- [ ] 不要な再レンダリングの防止

---

## トラブルシューティング

### ロゴが表示されない場合

1. **SVG ファイルのパスを確認**
   ```bash
   ls -la public/assets/blog/d6495cc76015bd725cb662d469f2c31129d53e32.svg
   ```

2. **ビルド後の dist フォルダ確認**
   ```bash
   npm run build
   ls -la dist/assets/blog/
   ```

3. **ブラウザの開発者ツールでネットワークエラーを確認**

### レイアウトが崩れる場合

1. **justify-between が適用されているか確認**
   ```html
   <header className="flex items-center justify-between">
   ```

2. **パディングが正しいか確認**
   - Desktop/Tablet: 24px (p-6)
   - Mobile: 16px (sm:p-4)

3. **左右のコンテナ幅が正しいか確認**
   - 左: 112px
   - 右: 112px

### 固定ヘッダーが正しく動作しない場合

1. **z-index が十分に高いか確認**
   ```css
   z-index: 50;
   ```

2. **背景色が設定されているか確認**
   ```css
   background-color: white;
   ```

3. **コンテンツがヘッダーの下に隠れていないか確認**
   ```html
   <main className="pt-[74.07px]">
   ```

---

## 関連ドキュメント

- [ブログページ全体レイアウト](./blog-page-layout-specification.md)
- [ヒーローセクション](./herosection.md)
- [ブログカード](./blogcard.md)
- [背景グラデーション](./background-gradation-implementation.md)

---

## 更新履歴

- 2025-11-10: Figma デザインから自動生成（Node ID: 3:207）
- 完全なレスポンシブ対応を追加
- 固定ヘッダーとスクロール対応を追加
- アクセシビリティとパフォーマンス最適化を追加

---

## 備考

このコンポーネントは、BONO blog のヘッダーとして使用される基本的なナビゲーションコンポーネントです。

### デザインの意図

- **シンプルなデザイン**: ロゴのみの最小限の構成
- **左寄せレイアウト**: ロゴを左側に配置
- **拡張性**: 右側に将来的にメニューやボタンを追加可能
- **固定高さ**: 74.07px で一貫性を保つ

### 将来の拡張

右側のスペース（27:139）は、以下のような要素を追加できます：

- ナビゲーションメニュー
- 検索ボタン
- ログイン/サインアップボタン
- ダークモード切り替え
- 言語切り替え

### カスタマイズ時の注意

- ロゴサイズを変更する場合は、ヘッダーの高さも調整してください
- 固定ヘッダーを使用する場合は、メインコンテンツに適切なパディングを追加してください
- スクロール時の背景色変更は、パフォーマンスに影響する可能性があるため、必要に応じて使用してください

カスタマイズが必要な場合は、`className` props を使用して Tailwind クラスを追加してください。
