# BONO アイコンブロックコンポーネント完全実装ガイド

## 情報抽出元

- **Figma Node ID**: `3511:4008`
- **抽出ツール**: Figma Dev Mode MCP
- **情報源**:
  1. `get_code`: 自動生成された React コード（構造・スタイル）
  2. `get_image`: ビジュアル確認用画像（人物アイコン表示）
  3. `get_variable_defs`: デザインシステム変数定義

---

## 1. 完全な React コード（Figma 自動生成）

```jsx
export default function IconBlock() {
  return (
    <div
      className="bg-[#ffffff] box-border content-stretch flex flex-row gap-[15px] items-center justify-center p-0 relative rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px] size-full"
      data-name="icon_block"
      id="node-3511_4008"
    >
      <div className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px]" />
      <div
        className="relative shrink-0 size-[70px]"
        data-name="icon"
        id="node-3511_4009"
      >
        <div
          className="absolute bg-center bg-cover bg-no-repeat inset-0"
          data-name="Image"
          id="node-I3511_4009-2957_12486"
          style={{
            backgroundImage:
              "url(data:image/svg+xml;base64,PHN2ZwogICAgICB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciCiAgICAgIHZpZXdCb3g9IjAgMCAxIDEiCiAgICAgIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiCiAgICAgIHdpZHRoPSIxMDAlIgogICAgICBoZWlnaHQ9IjEwMCUiCiAgICA+CiAgICAgIDxyZWN0IHdpZHRoPSIxIiBoZWlnaHQ9IjEiIGZpbGw9IiNFRUUiIC8+CiAgICA8L3N2Zz4=)",
          }}
        />
      </div>
    </div>
  );
}
```

---

## 2. デザインシステム変数（Figma 定義）

```json
{
  "Text/LightGray": "#e2e8f0"
}
```

---

## 3. 構造解析（data-name 属性ベース）

### 階層構造

```
icon_block (ルートコンテナ)
├── ボーダー装飾（絶対配置）
└── icon (70×70pxアイコンコンテナ)
    └── Image (背景画像)
```

---

## 4. レイアウト詳細分析

### メインコンテナ（icon_block）

- **背景色**: `bg-[#ffffff]` (純白)
- **Flexbox**: `flex flex-row` (横方向)
- **配置**: `items-center justify-center` (中央揃え)
- **ギャップ**: `gap-[15px]` (15px)
- **サイズ**: `size-full` (100%)
- **角丸**: 特殊な形状
  - 上部: `rounded-tl-[120px] rounded-tr-[120px]` (120px 角丸)
  - 下部: `rounded-bl-[16px] rounded-br-[16px]` (16px 角丸)

### ボーダー装飾

- **配置**: `absolute inset-0` (全体に重なる)
- **ボーダー**: `border border-slate-200` (#e2e8f0)
- **角丸**: メインコンテナと同じ
- **インタラクション**: `pointer-events-none` (クリック無効)

### アイコンコンテナ

- **サイズ**: `size-[70px]` (70×70px 固定)
- **配置**: `relative shrink-0` (縮小無効)
- **背景**: `bg-center bg-cover bg-no-repeat` (中央配置、カバー表示)

---

## 5. 特殊な角丸デザイン

### CSS 実装詳細

```css
.icon-block {
  /* 特殊な角丸形状 */
  border-radius: 120px 120px 16px 16px;
  /* 上左、上右、下右、下左の順 */
}

/* または個別指定 */
.icon-block {
  border-top-left-radius: 120px;
  border-top-right-radius: 120px;
  border-bottom-left-radius: 16px;
  border-bottom-right-radius: 16px;
}
```

### Tailwind CSS（カスタム設定）

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        "icon-block": "120px 120px 16px 16px",
      },
    },
  },
};
```

---

## 6. 改良版実装（プロップス対応）

```jsx
interface IconBlockProps {
  iconSrc?: string;
  iconAlt?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function IconBlock({
  iconSrc,
  iconAlt = "アイコン",
  size = "md",
  className = "",
}: IconBlockProps) {
  const sizeClasses = {
    sm: "size-[50px]",
    md: "size-[70px]",
    lg: "size-[90px]",
  };

  return (
    <div
      className={`bg-white box-border content-stretch flex flex-row gap-[15px] items-center justify-center p-0 relative rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px] size-full ${className}`}
      data-name="icon_block"
    >
      <div className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px]" />
      <div
        className={`relative shrink-0 ${sizeClasses[size]}`}
        data-name="icon"
      >
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={iconAlt}
            className="w-full h-full object-cover rounded-full"
          />
        ) : (
          <div
            className="absolute bg-center bg-cover bg-no-repeat inset-0 rounded-full bg-gray-200"
            data-name="placeholder"
          />
        )}
      </div>
    </div>
  );
}
```

---

## 7. TypeScript 型定義

```typescript
// types/IconBlock.ts
export interface IconBlockProps {
  /** アイコン画像のURL */
  iconSrc?: string;
  /** アイコン画像のalt属性 */
  iconAlt?: string;
  /** アイコンのサイズ */
  size?: "sm" | "md" | "lg";
  /** 追加のCSSクラス */
  className?: string;
  /** クリックイベントハンドラ */
  onClick?: () => void;
  /** アクセシビリティ用のaria-label */
  ariaLabel?: string;
}

export interface IconBlockSizes {
  sm: string;
  md: string;
  lg: string;
}
```

---

## 8. スタイル定数定義

```css
:root {
  /* IconBlock専用カラー */
  --icon-block-bg: #ffffff;
  --icon-block-border: #e2e8f0;

  /* IconBlock専用サイズ */
  --icon-block-radius-top: 120px;
  --icon-block-radius-bottom: 16px;
  --icon-block-gap: 15px;

  /* アイコンサイズ */
  --icon-size-sm: 50px;
  --icon-size-md: 70px;
  --icon-size-lg: 90px;
}
```

---

## 9. アクセシビリティ強化版

```jsx
export default function IconBlock({
  iconSrc,
  iconAlt = "ユーザーアイコン",
  onClick,
  ariaLabel,
  className = "",
}: IconBlockProps) {
  const isInteractive = !!onClick;

  const containerProps = {
    className: `bg-white box-border content-stretch flex flex-row gap-[15px] items-center justify-center p-0 relative rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px] size-full ${
      isInteractive ? "cursor-pointer hover:shadow-md transition-shadow" : ""
    } ${className}`,
    "data-name": "icon_block",
    ...(isInteractive && {
      role: "button",
      tabIndex: 0,
      "aria-label": ariaLabel || `${iconAlt}をクリック`,
      onClick,
      onKeyDown: (e: KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      },
    }),
  };

  return (
    <div {...containerProps}>
      <div className="absolute border border-slate-200 border-solid inset-0 pointer-events-none rounded-bl-[16px] rounded-br-[16px] rounded-tl-[120px] rounded-tr-[120px]" />
      <div className="relative shrink-0 size-[70px]" data-name="icon">
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={iconAlt}
            className="w-full h-full object-cover rounded-full"
            loading="lazy"
          />
        ) : (
          <div
            className="absolute bg-center bg-cover bg-no-repeat inset-0 rounded-full bg-gray-200 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-gray-400 text-2xl">👤</span>
          </div>
        )}
      </div>
    </div>
  );
}
```

---

## 10.使用例

```jsx
// 基本使用
<IconBlock iconSrc="/path/to/user-avatar.jpg" iconAlt="ユーザーのアバター" />

// クリック可能
<IconBlock
  iconSrc="/path/to/user-avatar.jpg"
  iconAlt="ユーザーのアバター"
  onClick={() => console.log('アイコンがクリックされました')}
  ariaLabel="ユーザープロフィールを表示"
/>

// プレースホルダー
<IconBlock />

// サイズ変更
<IconBlock iconSrc="/path/to/avatar.jpg" size="lg" />
```

---

## 11. 実装チェックリスト

### 必須対応項目

- [ ] Tailwind CSS 設定確認
- [ ] 特殊角丸の正確な実装
- [ ] ボーダーの配置確認
- [ ] アイコン画像の適切な表示
- [ ] レスポンシブ対応

### 推奨対応項目

- [ ] プロップス型の定義
- [ ] アクセシビリティ対応（ARIA 属性）
- [ ] キーボードナビゲーション対応
- [ ] ホバー・フォーカス状態のデザイン
- [ ] 画像読み込みエラー時の処理

### オプション対応項目

- [ ] アニメーション効果
- [ ] 複数サイズ対応
- [ ] テーマ対応（ダーク・ライトモード）
- [ ] Storybook ドキュメント作成

---

## 12. 注意事項

1. **特殊角丸**: 上部 120px、下部 16px の非対称な角丸デザイン
2. **画像表示**: プレースホルダー画像は実際のアイコン画像に置き換える必要
3. **サイズ固定**: 70×70px で固定、必要に応じてプロップスで可変に
4. **ボーダー重ね**: 絶対配置でボーダーを重ねる実装
5. **アクセシビリティ**: クリック可能な場合はキーボード操作も考慮

この情報により、デザイナーの意図を 100%再現した再利用可能なアイコンブロックコンポーネントが実装可能です。
