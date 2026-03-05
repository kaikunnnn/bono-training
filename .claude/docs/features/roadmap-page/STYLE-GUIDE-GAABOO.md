# gaaboo.jp スタイルガイド解剖

**分析対象**: https://gaaboo.jp/recruit/
**作成日**: 2026-03-04
**目的**: BONOロードマップページへのスタイル適用

---

## エグゼクティブサマリー

gaaboo採用ページは**「親しみやすさ」と「プロフェッショナリズム」のバランス**を取った、モダンで読みやすいデザイン。以下が主要な特徴：

| 特徴 | 値 | 印象 |
|------|-----|------|
| コンテンツ幅 | **900px** | 読みやすさ最優先 |
| プライマリ色 | **#f5533e**（赤橙） | 活気・情熱 |
| 本文サイズ | **15px** | 日本語に最適化 |
| 行間 | **1.75** | ゆったり |
| セクション余白 | **80px** | 呼吸感 |

---

## 1. タイポグラフィ

### フォントサイズスケール

```css
:root {
  /* 文字サイズ階層 */
  --text-xs: 13px;      /* キャプション、注釈 */
  --text-sm: 14px;      /* 小テキスト */
  --text-base: 15px;    /* 本文（基準） */
  --text-md: 18px;      /* h4、カードタイトル */
  --text-lg: 20px;      /* h3、サブ見出し */
  --text-xl: 28px;      /* h2、セクション見出し */
  --text-2xl: 42px;     /* h1、キャッチコピー */
}
```

### サイズ比率

| 要素 | サイズ | 本文比 | 用途 |
|------|--------|--------|------|
| h1 | 42px | **2.8x** | メインキャッチコピー |
| h2 | 28px | **1.9x** | セクション見出し |
| h3 | 20px | **1.3x** | サブセクション |
| h4 | 18px | **1.2x** | カードタイトル |
| 本文 | 15px | **1.0x** | 基準 |
| small | 13px | **0.87x** | キャプション |

### フォントウェイト

```css
:root {
  --font-weight-normal: 400;    /* 本文 */
  --font-weight-medium: 500;    /* 軽い強調 */
  --font-weight-semibold: 600;  /* h3, h4 */
  --font-weight-bold: 700;      /* h1, h2, 強調 */
}
```

### 行間（line-height）

```css
:root {
  --leading-tight: 1.35;    /* 見出し */
  --leading-snug: 1.45;     /* サブ見出し */
  --leading-normal: 1.6;    /* 引用、キャプション */
  --leading-relaxed: 1.75;  /* 本文（重要！） */
}
```

**ポイント**: 日本語本文は **1.75** という広めの行間で読みやすさを確保。

### 字間（letter-spacing）

```css
:root {
  --tracking-tight: -0.01em;   /* 英語見出し */
  --tracking-normal: 0.01em;   /* 本文 */
  --tracking-wide: 0.03em;     /* 日本語見出し */
}
```

---

## 2. 余白・スペーシング

### スペーシングスケール

```css
:root {
  /* 8pxベースのスケール */
  --space-1: 4px;     /* 0.25rem */
  --space-2: 8px;     /* 0.5rem - 基本単位 */
  --space-3: 12px;    /* 0.75rem */
  --space-4: 16px;    /* 1rem */
  --space-5: 20px;    /* 1.25rem */
  --space-6: 24px;    /* 1.5rem */
  --space-8: 32px;    /* 2rem */
  --space-10: 40px;   /* 2.5rem */
  --space-12: 48px;   /* 3rem */
  --space-16: 64px;   /* 4rem */
  --space-20: 80px;   /* 5rem - セクション間 */
}
```

### セクション構成

```
┌─────────────────────────────────────┐
│  上部余白: 80px (--space-20)        │
├─────────────────────────────────────┤
│  セクションヘッダー                  │
│  ├── タイトル (h2)                  │
│  └── 説明文 (margin-top: 16px)      │
│                                     │
│  コンテンツ余白: 40px (--space-10)   │
├─────────────────────────────────────┤
│  コンテンツエリア                    │
│  ├── カード間: 24px (--space-6)     │
│  └── 要素間: 16px (--space-4)       │
│                                     │
│  下部余白: 80px (--space-20)        │
└─────────────────────────────────────┘
```

### 具体的な余白ルール

| 場所 | 値 | 説明 |
|------|-----|------|
| セクション間 | **80px** | 大きな呼吸感 |
| 見出し→本文 | **16px** | 視覚的グループ化 |
| 本文→コンテンツ | **40px** | 情報の塊を分離 |
| カード間 | **24px** | 適度な分離 |
| カード内 | **20-38px** | ゆとり |

---

## 3. カラーパレット

### メインカラー

```css
:root {
  /* プライマリ（アクション） */
  --color-primary: #f5533e;       /* 赤橙 - CTA、アクセント */
  --color-primary-hover: #e04a35;

  /* セカンダリ（補助） */
  --color-secondary: #30abe6;     /* シアン - リンク、補助 */
  --color-secondary-hover: #2899d1;
}
```

### テキストカラー

```css
:root {
  /* テキスト階層 */
  --color-text-primary: #1a1a1a;   /* 見出し */
  --color-text-body: #333333;      /* 本文 */
  --color-text-secondary: #555555; /* 補足 */
  --color-text-muted: #9e9e9e;     /* 淡いテキスト */
}
```

### 背景カラー

```css
:root {
  /* 背景の階層 */
  --color-bg-white: #ffffff;
  --color-bg-light: #f5f5f5;       /* セクション交互 */
  --color-bg-dark: #32373c;        /* フッター、ダーク */
}
```

### 色の使い分けルール

| 用途 | カラー | 説明 |
|------|--------|------|
| CTAボタン | `--color-primary` | 最も目立たせる |
| リンク | `--color-primary` | クリック可能を示す |
| セクション見出し | `--color-text-primary` | 階層を明確に |
| 本文 | `--color-text-body` | 読みやすさ |
| キャプション | `--color-text-muted` | 控えめに |
| 背景交互 | white / light | セクション区切り |

---

## 4. セクション構成

### 1セクションの黄金比率

```
ヘッダー部分:  15-20%
コンテンツ部分: 60-70%
フッター部分:  10-15%
余白:          10-15%
```

### スクロールリズム

```
[大] → [中] → [大] → [小] → [大] → [中]
Hero   Msg   Data   Logo   Content  CTA
```

**ポイント**: 大きなセクションの後に小さなセクションを配置し、スクロール疲れを軽減。

### セクションテンプレート

#### A. ヒーローセクション
```
- 高さ: 70-80vh
- 背景: グラデーション + イラスト
- タイトル: 42px、中央揃え
- パディング: 上下100px
```

#### B. データセクション
```
- 高さ: 60-80vh
- 背景: 白
- グリッド: 3-4列
- パディング: 上下80px
```

#### C. カードギャラリー
```
- 高さ: 40-50vh
- 背景: ライトグレー
- グリッド: 3列
- パディング: 上下60px
```

---

## 5. 装飾・エフェクト

### 角丸（border-radius）

```css
:root {
  --radius-sm: 4px;      /* 入力、小要素 */
  --radius-md: 8px;      /* ボタン、カード */
  --radius-lg: 12px;     /* 大きなカード */
  --radius-xl: 16px;     /* モーダル */
  --radius-full: 9999px; /* ピル型 */
}
```

### シャドウ

```css
:root {
  /* 軽いシャドウ（カード） */
  --shadow-sm: 0 2px 8px rgba(0, 0, 0, 0.08);

  /* 標準シャドウ */
  --shadow-md: 6px 6px 9px rgba(0, 0, 0, 0.2);

  /* 強いシャドウ（ホバー） */
  --shadow-lg: 12px 12px 50px rgba(0, 0, 0, 0.4);

  /* ポップなシャドウ（アクセント） */
  --shadow-crisp: 6px 6px 0px rgba(0, 0, 0, 0.2);
}
```

### トランジション

```css
:root {
  --transition-fast: 150ms ease-out;
  --transition-base: 200ms ease-out;
  --transition-slow: 300ms ease-out;

  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

### ホバーエフェクト

```css
.interactive:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  transition: var(--transition-base);
}
```

---

## 6. レイアウト

### コンテナ

```css
:root {
  --container-width: 900px;     /* メインコンテンツ */
  --text-max-width: 720px;      /* 読みやすいテキスト幅 */
  --gutter: 20px;               /* 左右余白 */
}
```

### グリッドパターン

```css
/* 3列グリッド（最も使用） */
.grid-3 {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
}

/* 4列グリッド（ロゴなど） */
.grid-4 {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
}
```

---

## 7. 視覚階層

### 優先順位と表現

| 優先度 | 要素 | サイズ | ウェイト | 色 |
|--------|------|--------|----------|-----|
| 1 | 数字・統計 | 42px | 700 | primary |
| 2 | セクション見出し | 28px | 700 | text-primary |
| 3 | CTAボタン | 15px | 700 | white/primary-bg |
| 4 | 説明文 | 15px | 400 | text-body |
| 5 | キャプション | 13px | 400 | text-muted |

### 数字の見せ方

```css
.metric {
  font-size: 42px;
  font-weight: 700;
  color: var(--color-text-primary);
  line-height: 1.2;
}

.metric-label {
  font-size: 15px;
  color: var(--color-text-muted);
  margin-top: 8px;
}
```

---

## 8. BONOロードマップへの適用方針

### 直接適用するもの

| 要素 | gaaboo値 | 適用理由 |
|------|----------|----------|
| コンテンツ幅 | 900px → **1012px** | Pattern 11で調整済み |
| 本文サイズ | 15px | そのまま |
| 行間 | 1.75 | 日本語に最適 |
| セクション余白 | 80px | そのまま |
| カード間 | 24px | そのまま |

### BONO用にカスタマイズするもの

| 要素 | gaaboo | BONO | 理由 |
|------|--------|------|------|
| プライマリ色 | #f5533e | 既存ブランド色 | ブランド一貫性 |
| 見出しサイズ | 42px | 52px | より大きなインパクト |
| 背景 | 白/グレー交互 | #F9F9F7 | 既存の温かみ |

### 適用CSS

```css
/* BONOロードマップ用スタイル（gaabooベース） */

:root {
  /* タイポグラフィ */
  --text-body: 15px;
  --text-h1: 52px;
  --text-h2: 28px;
  --text-h3: 20px;
  --text-caption: 13px;

  --leading-body: 1.75;
  --leading-heading: 1.35;

  /* スペーシング */
  --section-padding: 80px;
  --content-gap: 40px;
  --card-gap: 24px;
  --element-gap: 16px;

  /* レイアウト */
  --container-max: 1012px;
  --text-max: 720px;

  /* 装飾 */
  --radius-card: 19px;  /* Pattern 11既存 */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);

  /* トランジション */
  --transition: 200ms ease-out;
}

/* セクション */
.roadmap-section {
  padding: var(--section-padding) 0;
}

/* 見出し */
.section-title {
  font-size: var(--text-h2);
  font-weight: 700;
  line-height: var(--leading-heading);
  letter-spacing: 0.03em;
  margin-bottom: var(--element-gap);
}

/* 本文 */
.section-description {
  font-size: var(--text-body);
  line-height: var(--leading-body);
  color: var(--color-text-body);
  max-width: var(--text-max);
}

/* カード */
.roadmap-card {
  background: white;
  border-radius: var(--radius-card);
  padding: 20px 38px;
  box-shadow: var(--shadow-card);
  transition: var(--transition);
}

.roadmap-card:hover {
  transform: translateY(-2px);
  box-shadow: 6px 6px 9px rgba(0, 0, 0, 0.15);
}
```

---

## 9. チェックリスト

Pattern 11に適用する際のチェック項目：

### タイポグラフィ
- [ ] 本文サイズを15pxに
- [ ] 行間を1.75に
- [ ] 見出しの字間を0.03emに
- [ ] キャプションを13pxに

### 余白
- [ ] セクション間を80pxに
- [ ] 見出し→本文を16pxに
- [ ] 本文→コンテンツを40pxに
- [ ] カード間を24pxに

### 装飾
- [ ] カードシャドウを軽く
- [ ] ホバー時にtranslateY(-2px)
- [ ] トランジション200ms

### レイアウト
- [ ] 最大幅を維持（1012px）
- [ ] テキストブロック最大720px
- [ ] 左右余白20-40px

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-03-04 | 初版作成（5エージェント並行分析） |
