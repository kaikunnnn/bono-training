# セクションパターン集（gaaboo.jp解剖）

**作成日**: 2026-03-04
**目的**: 各セクションの具体的なサイズ感とパターンを再現可能な形で定義

---

## パターン一覧

| # | パターン名 | BONO適用先 |
|---|-----------|-----------|
| A | ヒーローセクション | ヘッダーセクション |
| B | データカードセクション | - |
| C | カードギャラリー | ステップ詳細 |
| D | ベネフィットリスト | 得られるもの |
| E | ステップフロー | 進め方サマリー |

---

## パターンA: ヒーローセクション

### 全体構成
```
┌─────────────────────────────────────────────────┐
│  padding-top: 100px                             │
├─────────────────────────────────────────────────┤
│                                                 │
│  [バッジ] ← 12px, 背景#f5533e, 角丸4px          │
│           margin-bottom: 16px                   │
│                                                 │
│  メインタイトル ← 42-52px, bold, line-height:1.35│
│           margin-bottom: 24px                   │
│                                                 │
│  サブタイトル ← 18-20px, line-height:1.7        │
│           margin-bottom: 24px                   │
│           max-width: 600px                      │
│                                                 │
│  [タグ群] ← gap: 8px                            │
│           margin-bottom: 32px                   │
│                                                 │
│  [CTAボタン] ← padding: 16px 32px              │
│                                                 │
│  padding-bottom: 80px                           │
└─────────────────────────────────────────────────┘
```

### 具体的なサイズ

| 要素 | プロパティ | 値 |
|------|-----------|-----|
| **セクション** | padding | `100px 24px 80px` |
| | max-width | `1200px` |
| | background | グラデーション or 画像 |
| **バッジ** | font-size | `12px` |
| | font-weight | `700` |
| | padding | `6px 12px` |
| | border-radius | `4px` |
| | background | `#f5533e` |
| | color | `white` |
| | margin-bottom | `16px` |
| **タイトル** | font-size | `42-52px` |
| | font-weight | `700` |
| | line-height | `1.35` |
| | letter-spacing | `0.02em` |
| | margin-bottom | `24px` |
| **サブタイトル** | font-size | `18-20px` |
| | font-weight | `400` |
| | line-height | `1.7` |
| | color | `#555` |
| | max-width | `600px` |
| | margin-bottom | `24px` |
| **タグ** | font-size | `13px` |
| | padding | `6px 12px` |
| | background | `#f0f0f0` |
| | border-radius | `4px` |
| | gap | `8px` |
| **CTA** | font-size | `15px` |
| | font-weight | `600` |
| | padding | `16px 32px` |
| | border-radius | `8px` |
| | margin-top | `32px` |

### Tailwindクラス

```html
<section class="pt-[100px] pb-20 px-6">
  <div class="max-w-[1200px] mx-auto">
    <!-- バッジ -->
    <span class="inline-block text-xs font-bold px-3 py-1.5 bg-[#f5533e] text-white rounded mb-4">
      ロードマップ
    </span>

    <!-- タイトル -->
    <h1 class="text-[52px] font-bold leading-[1.35] tracking-wide mb-6">
      UIビジュアル基礎を<br>習得するロードマップ
    </h1>

    <!-- サブタイトル -->
    <p class="text-xl leading-relaxed text-gray-600 max-w-[600px] mb-6">
      UI初心者が、使いやすい操作体験を実現するために...
    </p>

    <!-- タグ群 -->
    <div class="flex flex-wrap gap-2 mb-8">
      <span class="text-[13px] px-3 py-1.5 bg-gray-100 rounded">UI未経験</span>
      <span class="text-[13px] px-3 py-1.5 bg-gray-100 rounded">ジュニアデザイナー</span>
    </div>

    <!-- CTA -->
    <button class="text-[15px] font-semibold px-8 py-4 bg-[#f5533e] text-white rounded-lg">
      BONOをはじめる
    </button>
  </div>
</section>
```

---

## パターンB: データカードセクション

### 全体構成
```
┌─────────────────────────────────────────────────┐
│  padding: 80px 24px                             │
│  background: white                              │
├─────────────────────────────────────────────────┤
│  セクションタイトル ← 28-32px, bold, center     │
│           margin-bottom: 16px                   │
│                                                 │
│  説明文 ← 15-16px, max-width:720px, center      │
│           margin-bottom: 48px                   │
├─────────────────────────────────────────────────┤
│  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│  │ 250 │ │30.4 │ │ 50% │ │ 500+│  ← データカード│
│  │ 名  │ │ 歳  │ │男女比│ │投稿 │              │
│  └─────┘ └─────┘ └─────┘ └─────┘              │
│           gap: 24-32px                          │
│           grid: 3-4列                           │
└─────────────────────────────────────────────────┘
```

### 具体的なサイズ

| 要素 | プロパティ | 値 |
|------|-----------|-----|
| **セクション** | padding | `80px 24px` |
| | max-width | `1200px` |
| | background | `#ffffff` |
| **タイトル** | font-size | `28-32px` |
| | font-weight | `700` |
| | text-align | `center` |
| | margin-bottom | `16px` |
| **説明文** | font-size | `15-16px` |
| | line-height | `1.75` |
| | max-width | `720px` |
| | text-align | `center` |
| | margin-bottom | `48px` |
| **グリッド** | columns | `3-4` |
| | gap | `24-32px` |
| **データカード** | padding | `24px` |
| | background | `#f8f9fa` |
| | border-radius | `12px` |
| | text-align | `center` |
| **数値** | font-size | `42-48px` |
| | font-weight | `700` |
| | color | `#1a1a1a` |
| | line-height | `1.2` |
| **ラベル** | font-size | `14-15px` |
| | color | `#666` |
| | margin-top | `8px` |

### Tailwindクラス

```html
<section class="py-20 px-6 bg-white">
  <div class="max-w-[1200px] mx-auto">
    <!-- ヘッダー -->
    <div class="text-center mb-12">
      <h2 class="text-[32px] font-bold mb-4">データで見るBONO</h2>
      <p class="text-base leading-relaxed text-gray-600 max-w-[720px] mx-auto">
        説明文をここに
      </p>
    </div>

    <!-- データグリッド -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div class="p-6 bg-gray-50 rounded-xl text-center">
        <div class="text-[48px] font-bold text-gray-900 leading-tight">250</div>
        <div class="text-[15px] text-gray-600 mt-2">受講者数</div>
      </div>
      <!-- 他のカードも同様 -->
    </div>
  </div>
</section>
```

---

## パターンC: カードギャラリーセクション

### 全体構成
```
┌─────────────────────────────────────────────────┐
│  padding: 80px 24px                             │
│  background: #f8f9fa (グレー)                   │
├─────────────────────────────────────────────────┤
│  セクションタイトル ← 28-32px, bold             │
│           margin-bottom: 48px                   │
├─────────────────────────────────────────────────┤
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │  [画像]  │ │  [画像]  │ │  [画像]  │        │
│  │ 200px    │ │ 200px    │ │ 200px    │        │
│  ├──────────┤ ├──────────┤ ├──────────┤        │
│  │ タイトル │ │ タイトル │ │ タイトル │        │
│  │ 18px     │ │ 18px     │ │ 18px     │        │
│  │          │ │          │ │          │        │
│  │ 説明文   │ │ 説明文   │ │ 説明文   │        │
│  │ 14px     │ │ 14px     │ │ 14px     │        │
│  │          │ │          │ │          │        │
│  │ [→詳細]  │ │ [→詳細]  │ │ [→詳細]  │        │
│  └──────────┘ └──────────┘ └──────────┘        │
│           gap: 32px                             │
│           grid: 3列                             │
└─────────────────────────────────────────────────┘
```

### 具体的なサイズ

| 要素 | プロパティ | 値 |
|------|-----------|-----|
| **セクション** | padding | `80px 24px` |
| | background | `#f8f9fa` |
| **グリッド** | columns | `3` (PC), `2` (tablet), `1` (mobile) |
| | gap | `32px` |
| **カード** | background | `#ffffff` |
| | border-radius | `12px` |
| | box-shadow | `0 2px 8px rgba(0,0,0,0.08)` |
| | overflow | `hidden` |
| **カード:hover** | transform | `translateY(-4px)` |
| | box-shadow | `0 8px 24px rgba(0,0,0,0.12)` |
| **画像** | height | `200px` |
| | object-fit | `cover` |
| | aspect-ratio | `16/9` |
| **コンテンツ** | padding | `20px 24px 24px` |
| **タイトル** | font-size | `18px` |
| | font-weight | `600` |
| | margin-bottom | `8px` |
| **説明文** | font-size | `14px` |
| | line-height | `1.7` |
| | color | `#666` |
| | line-clamp | `3` |
| | margin-bottom | `16px` |
| **リンク** | font-size | `14px` |
| | font-weight | `500` |
| | color | `#0066cc` |

### Tailwindクラス

```html
<section class="py-20 px-6 bg-gray-50">
  <div class="max-w-[1200px] mx-auto">
    <h2 class="text-[32px] font-bold mb-12">カルチャー</h2>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- カード -->
      <article class="bg-white rounded-xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden">
        <img src="..." class="w-full h-[200px] object-cover" />
        <div class="p-6 pt-5">
          <h3 class="text-lg font-semibold text-gray-900 mb-2">タイトル</h3>
          <p class="text-sm leading-relaxed text-gray-600 mb-4 line-clamp-3">
            説明文...
          </p>
          <a href="#" class="text-sm font-medium text-blue-600 hover:text-blue-800 inline-flex items-center gap-1">
            詳しく見る <span>→</span>
          </a>
        </div>
      </article>
    </div>
  </div>
</section>
```

---

## パターンD: ベネフィットリストセクション

### 全体構成
```
┌─────────────────────────────────────────────────┐
│  padding: 80px 24px                             │
│  background: white                              │
├─────────────────────────────────────────────────┤
│  セクションタイトル ← 28px, bold                │
│           margin-bottom: 16px                   │
│                                                 │
│  説明文 ← 15px, max-width:720px                 │
│           margin-bottom: 32px                   │
├─────────────────────────────────────────────────┤
│  ┌────────────────────┐ ┌────────────────────┐  │
│  │ ✓ ベネフィット1     │ │ ✓ ベネフィット2     │  │
│  │   説明文            │ │   説明文            │  │
│  └────────────────────┘ └────────────────────┘  │
│  ┌────────────────────┐ ┌────────────────────┐  │
│  │ ✓ ベネフィット3     │ │ ✓ ベネフィット4     │  │
│  │   説明文            │ │   説明文            │  │
│  └────────────────────┘ └────────────────────┘  │
│           grid: 2列, gap: 24px                  │
└─────────────────────────────────────────────────┘
```

### 具体的なサイズ

| 要素 | プロパティ | 値 |
|------|-----------|-----|
| **セクション** | padding | `80px 24px` |
| | background | `#ffffff` |
| **タイトル** | font-size | `28px` |
| | font-weight | `700` |
| | margin-bottom | `16px` |
| **説明文** | font-size | `15px` |
| | line-height | `1.75` |
| | max-width | `720px` |
| | margin-bottom | `32px` |
| **グリッド** | columns | `2` |
| | gap-x | `48px` |
| | gap-y | `16px` |
| **アイテム** | padding | `16px 0` |
| | border-bottom | `1px solid #eee` (オプション) |
| **アイコン/チェック** | size | `24px` |
| | color | `#f5533e` |
| | margin-right | `12px` |
| **アイテムテキスト** | font-size | `15-16px` |
| | line-height | `1.6` |
| | color | `#333` |

### Tailwindクラス

```html
<section class="py-20 px-6 bg-white">
  <div class="max-w-[900px] mx-auto">
    <!-- ヘッダー -->
    <h2 class="text-[28px] font-bold mb-4">ロードマップで得られるもの</h2>
    <p class="text-[15px] leading-relaxed text-gray-700 max-w-[720px] mb-8">
      説明文...
    </p>

    <!-- ベネフィットグリッド -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4">
      <!-- アイテム -->
      <div class="flex items-start gap-3 py-4">
        <span class="text-[#f5533e] text-2xl flex-shrink-0">✓</span>
        <span class="text-[15px] leading-relaxed text-gray-800">
          UIの"ふつう"の知ることで自然な操作体験をつくれる
        </span>
      </div>
      <!-- 他のアイテムも同様 -->
    </div>
  </div>
</section>
```

---

## パターンE: ステップフローセクション

### 全体構成
```
┌─────────────────────────────────────────────────┐
│  padding: 80px 24px                             │
├─────────────────────────────────────────────────┤
│  セクションタイトル ← 28px, bold                │
│           margin-bottom: 16px                   │
│                                                 │
│  説明文 ← 15px                                  │
│           margin-bottom: 16px                   │
├─────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────┐    │
│  │ [サマリーカードヘッダー]                 │    │
│  │  background: #ececec, padding: 6px 20px │    │
│  │  font-size: 14px, font-weight: 700     │    │
│  ├─────────────────────────────────────────┤    │
│  │                                         │    │
│  │  01  タイトル1      説明文1             │    │
│  │  ─────────────────────────────────────  │    │
│  │  02  タイトル2      説明文2             │    │
│  │  ─────────────────────────────────────  │    │
│  │  03  タイトル3      説明文3             │    │
│  │  ─────────────────────────────────────  │    │
│  │  04  タイトル4      説明文4             │    │
│  │                                         │    │
│  │  padding: 24px                          │    │
│  └─────────────────────────────────────────┘    │
│  background: white, border-radius: 19px        │
│  padding: 4px (外側)                           │
└─────────────────────────────────────────────────┘
```

### 具体的なサイズ

| 要素 | プロパティ | 値 |
|------|-----------|-----|
| **セクション** | padding | `80px 24px` |
| **カード外側** | background | `#ffffff` |
| | border-radius | `19px` |
| | padding | `4px` |
| **カードヘッダー** | background | `#ececec` |
| | padding | `6px 20px` |
| | border-radius | `12px 12px 0 0` |
| | font-size | `14px` |
| | font-weight | `700` |
| **カード内側** | padding | `24px` |
| **ステップ行** | padding | `16px 0` |
| | border-bottom | `1px solid #eee` (最後以外) |
| | display | `flex` |
| | align-items | `center` |
| **番号** | font-size | `18-20px` |
| | font-weight | `700` |
| | color | `#1a1a1a` |
| | width | `40px` |
| | flex-shrink | `0` |
| **タイトル** | font-size | `16px` |
| | font-weight | `600` |
| | width | `180px` |
| | flex-shrink | `0` |
| **説明文** | font-size | `14-15px` |
| | color | `#666` |
| | flex | `1` |

### Tailwindクラス

```html
<section class="py-20 px-6">
  <div class="max-w-[900px] mx-auto">
    <h2 class="text-[28px] font-bold mb-4">進め方</h2>
    <p class="text-[15px] leading-relaxed text-gray-700 mb-4">
      説明文...
    </p>

    <!-- サマリーカード -->
    <div class="bg-white rounded-[19px] overflow-hidden p-1">
      <!-- ヘッダー -->
      <div class="bg-[#ececec] rounded-t-xl px-5 py-1.5">
        <span class="text-sm font-bold text-gray-900">道のりのサマリー</span>
      </div>

      <!-- ステップ行 -->
      <div class="px-6 py-4">
        <!-- 行1 -->
        <div class="flex items-center py-4 border-b border-gray-200">
          <span class="text-lg font-bold w-10 flex-shrink-0">01</span>
          <span class="text-base font-semibold w-[180px] flex-shrink-0">UIづくりに慣れる</span>
          <span class="text-sm text-gray-600">やり方をマネしてUIの見た目の構築をはじめよう</span>
        </div>

        <!-- 行2 -->
        <div class="flex items-center py-4 border-b border-gray-200">
          <span class="text-lg font-bold w-10 flex-shrink-0">02</span>
          <span class="text-base font-semibold w-[180px] flex-shrink-0">デザインの進め方</span>
          <span class="text-sm text-gray-600">スキルの土台を磨く『進め方』を理解して使えるようなる</span>
        </div>

        <!-- 最後の行（border-bなし） -->
        <div class="flex items-center py-4">
          <span class="text-lg font-bold w-10 flex-shrink-0">03</span>
          <span class="text-base font-semibold w-[180px] flex-shrink-0">UI表現の基本</span>
          <span class="text-sm text-gray-600">UIの表現の基本を身につける</span>
        </div>
      </div>
    </div>
  </div>
</section>
```

---

## BONO Pattern 11への適用マッピング

| BONOセクション | 適用パターン | 主な変更点 |
|---------------|-------------|-----------|
| ヘッダー | パターンA | padding調整、タイトルサイズ確認 |
| 得られるもの | パターンD | 2列グリッド、チェックアイコン追加 |
| 進め方 | パターンE | カードスタイル適用済み、微調整 |
| ステップ詳細 | パターンC | カード内レッスンリストをカード化 |

---

## CSS変数まとめ（コピー用）

```css
:root {
  /* セクション */
  --section-padding-y: 80px;
  --section-padding-x: 24px;
  --section-max-width: 900px;  /* BONOは1012px */

  /* ヘッダー */
  --header-title-size: 28px;
  --header-title-weight: 700;
  --header-title-mb: 16px;
  --header-desc-size: 15px;
  --header-desc-line-height: 1.75;
  --header-desc-mb: 32px;
  --header-to-content: 48px;

  /* グリッド */
  --grid-gap: 32px;
  --grid-gap-sm: 24px;

  /* カード */
  --card-radius: 12px;
  --card-radius-lg: 19px;
  --card-shadow: 0 2px 8px rgba(0,0,0,0.08);
  --card-shadow-hover: 0 8px 24px rgba(0,0,0,0.12);
  --card-padding: 24px;
  --card-hover-transform: translateY(-4px);

  /* 要素間 */
  --element-gap-sm: 8px;
  --element-gap-md: 16px;
  --element-gap-lg: 24px;

  /* トランジション */
  --transition: 200ms ease-out;
  --transition-slow: 300ms ease-out;
}
```

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-03-04 | 5セクションパターンの詳細分析完了 |
