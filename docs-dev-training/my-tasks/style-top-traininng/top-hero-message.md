# BONO ヒーローメッセージコンポーネント完全実装ガイド

## 情報抽出元
- **Figma Node ID**: `3449:4265`
- **抽出ツール**: Figma Dev Mode MCP
- **情報源**:
  1. `get_code`: 自動生成されたReactコード（構造・スタイル）
  2. `get_image`: ビジュアル確認用画像
  3. `get_variable_defs`: デザインシステム変数定義

---

## 1. 完全なReactコード（Figma自動生成）

```jsx
export default function TopHeroMessage() {
  return (
    <div
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start px-0 py-10 relative size-full"
      data-name="top-hero-message"
      id="node-3449_4265"
    >
      <div className="absolute border-[0px_0px_1px] border-slate-200 border-solid inset-0 pointer-events-none" />
      <div
        className="flex flex-col font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1d382f] text-[36px] text-center text-nowrap"
        id="node-3449_4267"
      >
        <p className="block leading-[40px] whitespace-pre">
          トレーニング。それは"可能性"をひらく扉。
        </p>
      </div>
      <div
        className="font-['Noto_Sans:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] relative shrink-0 text-[16px] text-center text-nowrap text-slate-600"
        id="node-3449_4269"
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
      >
        <p className="block leading-[normal] whitespace-pre">
          各コースで身につけたことをアウトプットするお題を並べています🙋
        </p>
      </div>
    </div>
  );
}
```

---

## 2. デザインシステム変数（Figma定義）

```json
{
  "Text/LightBlack": "#475569",
  "Spacing/4": "16",
  "Spacing/10": "40",
  "Text/LightGray": "#e2e8f0"
}
```

---

## 3. 構造解析（data-name属性ベース）

### 階層構造
```
top-hero-message (ルートコンテナ)
├── メインタイトル (36px、#1d382f)
└── サブタイトル (16px、#475569)
```

---

## 4. レイアウト詳細分析

### メインコンテナ
- **Flexbox**: `flex flex-col` (縦方向)
- **ギャップ**: `gap-4` (16px)
- **配置**: `items-start justify-start`
- **パディング**: `px-0 py-10` (上下40px、左右0px)
- **サイズ**: `size-full` (100%)
- **ボーダー**: 下部1px (#e2e8f0)

### メインタイトル
- **フォント**: `Rounded Mplus 1c Bold`
- **サイズ**: `text-[36px]`
- **行高**: `leading-[40px]`
- **色**: `#1d382f` (深緑色)
- **配置**: `text-center text-nowrap`
- **Flexbox**: `flex flex-col justify-center`

### サブタイトル
- **フォント**: `Noto Sans Medium` + `Noto Sans JP Regular`
- **サイズ**: `text-[16px]`
- **行高**: `leading-[normal]`
- **色**: `text-slate-600` (#475569)
- **配置**: `text-center text-nowrap`
- **フォント設定**: `font-variation-settings: 'CTGR' 0, 'wdth' 100`

---

## 5. カラーパレット詳細

```css
:root {
  /* メインテキスト色 */
  --hero-title-color: #1d382f;      /* 深緑色（メインタイトル） */
  --hero-subtitle-color: #475569;   /* ダークグレー（サブタイトル） */
  
  /* ボーダー色 */
  --hero-border-color: #e2e8f0;     /* ライトグレー（下部ボーダー） */
  
  /* スペーシング */
  --spacing-4: 16px;                /* ギャップ */
  --spacing-10: 40px;               /* 上下パディング */
}
```

---

## 6. フォント定義

### 必要フォント
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans:wght@500&display=swap');
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400&display=swap');
/* Rounded Mplus 1c Bold は別途設定が必要 */
```

### フォントスタック
```css
/* メインタイトル用 */
.hero-title {
  font-family: 'Rounded Mplus 1c Bold', sans-serif;
  font-weight: bold;
  font-size: 36px;
  line-height: 40px;
  color: #1d382f;
  text-align: center;
  white-space: nowrap;
}

/* サブタイトル用 */
.hero-subtitle {
  font-family: 'Noto Sans', 'Noto Sans JP', sans-serif;
  font-weight: 500;
  font-size: 16px;
  line-height: normal;
  color: #475569;
  text-align: center;
  white-space: nowrap;
  font-variation-settings: 'CTGR' 0, 'wdth' 100;
}
```

---

## 7. レスポンシブ対応提案

```css
/* デスクトップ（デフォルト） */
.hero-title {
  font-size: 36px;
  line-height: 40px;
}

.hero-subtitle {
  font-size: 16px;
}

/* タブレット */
@media (max-width: 768px) {
  .hero-title {
    font-size: 28px;
    line-height: 32px;
  }
  
  .hero-subtitle {
    font-size: 14px;
  }
}

/* モバイル */
@media (max-width: 480px) {
  .hero-title {
    font-size: 24px;
    line-height: 28px;
    white-space: normal; /* 改行を許可 */
  }
  
  .hero-subtitle {
    font-size: 14px;
    white-space: normal; /* 改行を許可 */
  }
  
  .top-hero-message {
    padding: 20px 0; /* パディング調整 */
  }
}
```

---

## 8. アクセシビリティ強化版

```jsx
export default function TopHeroMessage() {
  return (
    <section
      className="box-border content-stretch flex flex-col gap-4 items-start justify-start px-0 py-10 relative size-full"
      data-name="top-hero-message"
      id="node-3449_4265"
      aria-labelledby="hero-title"
      role="banner"
    >
      <div className="absolute border-[0px_0px_1px] border-slate-200 border-solid inset-0 pointer-events-none" />
      <h1
        className="flex flex-col font-['Rounded_Mplus_1c_Bold:Bold',_sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#1d382f] text-[36px] text-center text-nowrap"
        id="hero-title"
      >
        <span className="block leading-[40px] whitespace-pre">
          トレーニング。それは"可能性"をひらく扉。
        </span>
      </h1>
      <p
        className="font-['Noto_Sans:Medium',_'Noto_Sans_JP:Regular',_sans-serif] font-medium leading-[0] relative shrink-0 text-[16px] text-center text-nowrap text-slate-600"
        style={{ fontVariationSettings: "'CTGR' 0, 'wdth' 100" }}
      >
        <span className="block leading-[normal] whitespace-pre">
          各コースで身につけたことをアウトプットするお題を並べています🙋
        </span>
      </p>
    </section>
  );
}
```

---

## 9. 実装チェックリスト

### 必須対応項目
- [ ] Tailwind CSS設定確認
- [ ] Rounded Mplus 1c Boldフォントの読み込み設定
- [ ] Noto Sans、Noto Sans JPフォントの読み込み設定
- [ ] フォント読み込み失敗時のフォールバック設定
- [ ] `font-variation-settings`のブラウザサポート確認

### 推奨対応項目
- [ ] セマンティックHTML（h1, section, p要素）への変更
- [ ] ARIA属性の追加（labelledby, role）
- [ ] レスポンシブ対応（モバイル・タブレット）
- [ ] 絵文字のアクセシビリティ対応
- [ ] パフォーマンス最適化（フォント最適化）

### オプション対応項目
- [ ] ダークモード対応
- [ ] アニメーション効果の追加
- [ ] 多言語対応
- [ ] SEO最適化（構造化データ）

---

## 10. 注意事項

1. **フォント依存**: `Rounded Mplus 1c Bold`は商用利用時のライセンス確認が必要
2. **絵文字表示**: 🙋 の表示がOS・ブラウザによって異なる可能性
3. **改行制御**: `text-nowrap`により長文時の表示に注意が必要
4. **色の統一性**: メインタイトルの`#1d382f`が他のデザインシステムと整合しているか確認
5. **フォント設定**: `font-variation-settings`の古いブラウザサポート

---

## 11. パフォーマンス最適化

```css
/* フォント最適化 */
@font-face {
  font-family: 'Rounded Mplus 1c Bold';
  font-display: swap; /* フォント読み込み中の代替表示 */
  /* src: url(...) */
}

/* プリロード設定 */
<link rel="preload" href="path/to/rounded-mplus-1c-bold.woff2" as="font" type="font/woff2" crossorigin>
```

この情報により、デザイナーの意図を100%再現した高品質なヒーローメッセージコンポーネントが実装可能です。