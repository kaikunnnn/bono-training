# 【Claude Code 実装指示書】マイページ - レイアウト仕様

## 📸 完成イメージ

デスクトップ版のマイページ全体レイアウト

---

## 🎯 実装範囲

**コンポーネント自体は既に提供済み**のため、以下のレイアウト部分のみ実装：

✅ ページ全体のレイアウト構造  
✅ タブナビゲーション  
✅ セクション見出し  
✅ 各セクションの配置・余白  
✅ レスポンシブ対応（デスクトップ→スマホ）  

❌ 左のグローバルナビゲーション（対象外）  
❌ 個別カードコンポーネント（既に実装済み）  

---

## 📐 ページ全体の構造

```
┌─────────────────────────────────────────────────────┐
│ [左ナビ]  │  マイページ              [アカウント情報] [プロフィール]  │
│           │  ─────────────────────────                │
│           │  [すべて] [進捗] [お気に入り] [閲覧履歴]     │
│           │                                           │
│           │  進行中                          すべてみる │
│           │  レッスン                                  │
│           │  [ProgressLesson] [ProgressLesson]        │
│           │                                           │
│           │  お気に入り                      すべてみる │
│           │  [FavoriteArticleCard]                    │
│           │  [FavoriteArticleCard]                    │
│           │  [FavoriteArticleCard]                    │
│           │  [FavoriteArticleCard]                    │
│           │                                           │
│           │  閲覧履歴                        すべてみる │
│           │  [ArticleCard]                            │
│           │  [ArticleCard]                            │
└─────────────────────────────────────────────────────┘
```

---

## 🎨 デザイントークン

### カラーパレット

```typescript
const colors = {
  // 背景
  pageBg: '#F8F9FA',           // ページ全体の背景
  contentBg: '#FFFFFF',        // コンテンツエリアの背景
  
  // テキスト
  heading: '#1A1A1A',          // 見出し
  body: '#666666',             // 本文
  link: '#1976D2',             // リンク
  
  // タブ
  tabActive: '#1A1A1A',        // アクティブなタブのテキスト
  tabInactive: '#999999',      // 非アクティブなタブのテキスト
  tabBorder: '#1A1A1A',        // アクティブなタブの下線
  
  // ボーダー
  border: '#E5E5E5',           // 区切り線
};
```

### タイポグラフィ

```typescript
const typography = {
  // ページタイトル
  pageTitle: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: '1.4',
  },
  
  // タブテキスト
  tab: {
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '1.5',
  },
  
  // セクション見出し
  sectionHeading: {
    fontSize: '20px',
    fontWeight: '700',
    color: '#1A1A1A',
    lineHeight: '1.4',
  },
  
  // サブ見出し（「レッスン」など）
  subHeading: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#666666',
    lineHeight: '1.5',
  },
  
  // 「すべてみる」リンク
  viewAllLink: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#1976D2',
    lineHeight: '1.5',
  },
};
```

### スペーシング

```typescript
const spacing = {
  // ページレベル
  pageMaxWidth: '1200px',           // コンテンツエリアの最大幅
  pagePadding: '40px',              // ページ全体のパディング（左右）
  pagePaddingMobile: '20px',        // スマホ時のパディング
  
  // ヘッダーエリア
  headerPaddingBottom: '24px',      // ページタイトル下の余白
  
  // タブナビゲーション
  tabContainerPaddingY: '16px',     // タブエリアの上下パディング
  tabGap: '32px',                   // タブ間の間隔
  tabBorderBottom: '2px',           // アクティブタブの下線の太さ
  tabSectionMarginBottom: '40px',   // タブエリア下の余白
  
  // セクション
  sectionMarginBottom: '56px',      // セクション間の余白
  sectionHeadingMarginBottom: '20px', // セクション見出し下の余白
  subHeadingMarginBottom: '16px',   // サブ見出し下の余白
  
  // カードグリッド
  cardGapVertical: '16px',          // カードの縦方向の間隔
  cardGapHorizontal: '24px',        // カードの横方向の間隔（2列時）
  
  // 見出し行
  headingRowGap: '16px',            // 見出しと「すべてみる」の間隔
};
```

---

## 🏗️ レイアウト仕様

### 1. ページ全体のコンテナ

```tsx
<div style={{
  backgroundColor: '#F8F9FA',
  minHeight: '100vh',
  padding: '40px',
}}>
  <div style={{
    maxWidth: '1200px',
    margin: '0 auto',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    padding: '32px',
  }}>
    {/* コンテンツ */}
  </div>
</div>
```

**数値:**
- ページ背景: `#F8F9FA`
- コンテンツ最大幅: `1200px`
- 外側パディング: `40px`
- コンテンツパディング: `32px`
- 角丸: `12px`

---

### 2. ヘッダーエリア

```tsx
<div style={{
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: '24px',
}}>
  {/* ページタイトル */}
  <h1 style={{
    fontSize: '28px',
    fontWeight: '700',
    color: '#1A1A1A',
    margin: 0,
  }}>
    マイページ
  </h1>
  
  {/* 右側ボタン */}
  <div style={{ display: 'flex', gap: '16px' }}>
    <button>アカウント情報</button>
    <button>プロフィール</button>
  </div>
</div>
```

**数値:**
- タイトルフォントサイズ: `28px`
- タイトルフォントウェイト: `700`
- 下マージン: `24px`
- ボタン間ギャップ: `16px`

---

### 3. タブナビゲーション

```tsx
<div style={{
  borderBottom: '1px solid #E5E5E5',
  marginBottom: '40px',
}}>
  <div style={{
    display: 'flex',
    gap: '32px',
    paddingBottom: '16px',
  }}>
    {tabs.map((tab) => (
      <button
        key={tab.id}
        style={{
          fontSize: '16px',
          fontWeight: '600',
          color: tab.active ? '#1A1A1A' : '#999999',
          background: 'none',
          border: 'none',
          borderBottom: tab.active ? '2px solid #1A1A1A' : 'none',
          paddingBottom: '16px',
          cursor: 'pointer',
          transition: 'color 0.2s',
        }}
      >
        {tab.label}
      </button>
    ))}
  </div>
</div>
```

**数値:**
- タブ間ギャップ: `32px`
- タブフォントサイズ: `16px`
- タブフォントウェイト: `600`
- アクティブ色: `#1A1A1A`
- 非アクティブ色: `#999999`
- アクティブ下線: `2px solid #1A1A1A`
- パディング下: `16px`
- ボーダー下: `1px solid #E5E5E5`
- 下マージン: `40px`

---

### 4. セクション構造

```tsx
<section style={{ marginBottom: '56px' }}>
  {/* 見出し行 */}
  <div style={{
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
  }}>
    <h2 style={{
      fontSize: '20px',
      fontWeight: '700',
      color: '#1A1A1A',
      margin: 0,
    }}>
      進行中
    </h2>
    <a
      href="#"
      style={{
        fontSize: '14px',
        fontWeight: '600',
        color: '#1976D2',
        textDecoration: 'none',
      }}
    >
      すべてみる
    </a>
  </div>
  
  {/* サブ見出し（オプション） */}
  <h3 style={{
    fontSize: '16px',
    fontWeight: '600',
    color: '#666666',
    marginBottom: '16px',
  }}>
    レッスン
  </h3>
  
  {/* コンテンツ */}
  <div>{/* カード配置 */}</div>
</section>
```

**数値:**
- セクション下マージン: `56px`
- 見出しフォントサイズ: `20px`
- 見出しフォントウェイト: `700`
- 見出し下マージン: `20px`
- サブ見出しフォントサイズ: `16px`
- サブ見出し下マージン: `16px`
- 「すべてみる」フォントサイズ: `14px`
- リンク色: `#1976D2`

---

### 5. カード配置パターン

#### パターンA: 進行中セクション（2列グリッド）

```tsx
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '24px',
}}>
  <ProgressLesson {...lesson1} />
  <ProgressLesson {...lesson2} />
</div>
```

**数値:**
- グリッド列数: `2`
- カード間ギャップ: `24px`（横・縦共通）

**レスポンシブ（スマホ）:**
```tsx
// 768px以下
gridTemplateColumns: '1fr',  // 1列に変更
```

---

#### パターンB: お気に入り・閲覧履歴セクション（縦並び）

```tsx
<div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}}>
  <FavoriteArticleCard {...article1} />
  <FavoriteArticleCard {...article2} />
  <FavoriteArticleCard {...article3} />
  <FavoriteArticleCard {...article4} />
</div>
```

**数値:**
- カード間ギャップ: `16px`

---

## 📱 レスポンシブ対応

### ブレイクポイント

```typescript
const breakpoints = {
  mobile: '768px',    // タブレット以下
  desktop: '769px',   // デスクトップ以上
};
```

### デスクトップ（769px以上）

```css
.page-container {
  padding: 40px;
}

.content-wrapper {
  padding: 32px;
  max-width: 1200px;
}

.progress-grid {
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}
```

### スマホ・タブレット（768px以下）

```css
.page-container {
  padding: 20px;
}

.content-wrapper {
  padding: 20px;
}

.progress-grid {
  grid-template-columns: 1fr;  /* 1列に変更 */
  gap: 16px;
}

.tab-container {
  gap: 16px;  /* タブ間を狭く */
  overflow-x: auto;  /* 横スクロール可能に */
}

.section-heading {
  font-size: 18px;  /* 見出しを小さく */
}
```

---

## 🎬 タブ切り替え動作

### タブの状態管理

```tsx
const [activeTab, setActiveTab] = useState<'all' | 'progress' | 'favorite' | 'history'>('all');

const tabs = [
  { id: 'all', label: 'すべて' },
  { id: 'progress', label: '進捗' },
  { id: 'favorite', label: 'お気に入り' },
  { id: 'history', label: '閲覧履歴' },
];
```

### 表示内容の切り替え

```tsx
{activeTab === 'all' && (
  <>
    {/* 全セクション表示 */}
    <ProgressSection />
    <FavoriteSection />
    <HistorySection />
  </>
)}

{activeTab === 'progress' && (
  <ProgressSection />
)}

{activeTab === 'favorite' && (
  <FavoriteSection />
)}

{activeTab === 'history' && (
  <HistorySection />
)}
```

### 「すべてみる」リンクの動作

```tsx
<a
  href="#"
  onClick={(e) => {
    e.preventDefault();
    setActiveTab('progress');  // 該当タブに切り替え
  }}
>
  すべてみる
</a>
```

---

## 📦 コンポーネント構成（推奨）

```
/pages/MyPage/
├── MyPage.tsx                    # メインページコンポーネント
├── MyPage.types.ts              # 型定義
├── components/
│   ├── TabNavigation.tsx        # タブナビゲーション
│   ├── SectionHeader.tsx        # セクション見出し
│   ├── ProgressSection.tsx      # 進行中セクション
│   ├── FavoriteSection.tsx      # お気に入りセクション
│   └── HistorySection.tsx       # 閲覧履歴セクション
└── MyPage.module.css            # スタイル（オプション）
```

---

## 📏 数値一覧（まとめ）

### ページレベル
| 項目 | 値 |
|------|-----|
| 最大幅 | 1200px |
| 外側パディング（デスクトップ） | 40px |
| 外側パディング（スマホ） | 20px |
| コンテンツパディング（デスクトップ） | 32px |
| コンテンツパディング（スマホ） | 20px |
| 背景色 | #F8F9FA |
| コンテンツ背景色 | #FFFFFF |
| 角丸 | 12px |

### ヘッダー
| 項目 | 値 |
|------|-----|
| タイトルフォントサイズ | 28px |
| タイトルフォントウェイト | 700 |
| 下マージン | 24px |
| ボタン間ギャップ | 16px |

### タブナビゲーション
| 項目 | 値 |
|------|-----|
| タブ間ギャップ | 32px (デスクトップ), 16px (スマホ) |
| フォントサイズ | 16px |
| フォントウェイト | 600 |
| アクティブ色 | #1A1A1A |
| 非アクティブ色 | #999999 |
| アクティブ下線 | 2px solid #1A1A1A |
| パディング下 | 16px |
| 下マージン | 40px |

### セクション
| 項目 | 値 |
|------|-----|
| セクション間マージン | 56px |
| 見出しフォントサイズ | 20px (デスクトップ), 18px (スマホ) |
| 見出しフォントウェイト | 700 |
| 見出し下マージン | 20px |
| サブ見出しフォントサイズ | 16px |
| サブ見出し下マージン | 16px |
| 「すべてみる」フォントサイズ | 14px |

### カード配置
| 項目 | 値 |
|------|-----|
| 進行中グリッド列数 | 2 (デスクトップ), 1 (スマホ) |
| カード横ギャップ | 24px |
| カード縦ギャップ | 16px |

---

## ✅ 実装チェックリスト

完成したら以下を確認してください：

### レイアウト
- [ ] ページ全体の最大幅が1200pxで中央揃え
- [ ] 適切な余白が設定されている
- [ ] 背景色が正しく適用されている

### タブナビゲーション
- [ ] タブがクリックで切り替わる
- [ ] アクティブなタブに下線が表示される
- [ ] タブの色が正しく変化する

### セクション
- [ ] 各セクションの見出しが正しく表示される
- [ ] 「すべてみる」リンクが機能する
- [ ] セクション間の余白が適切

### カード配置
- [ ] 進行中セクションが2列グリッドで表示される
- [ ] お気に入り・閲覧履歴が縦並びで表示される
- [ ] カード間のギャップが適切

### レスポンシブ
- [ ] スマホ表示で1列になる
- [ ] パディングが適切に調整される
- [ ] タブが横スクロール可能（必要に応じて）

---

## 🎨 使用する既存コンポーネント

以下のコンポーネントは**既に実装済み**なので、importして使用してください：

```tsx
import { ProgressLesson } from '@/components/ProgressLesson';
import { ArticleCard } from '@/components/ArticleCard';
import { FavoriteArticleCard } from '@/components/FavoriteArticleCard';
```

---

## 💡 実装のヒント

### CSS Gridの使い方

```tsx
// 進行中セクション（2列）
<div style={{
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
  gap: '24px',
}}>
  {lessons.map(lesson => (
    <ProgressLesson key={lesson.id} {...lesson} />
  ))}
</div>
```

### Flexboxの使い方

```tsx
// お気に入りセクション（縦並び）
<div style={{
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',
}}>
  {favorites.map(article => (
    <FavoriteArticleCard key={article.id} {...article} />
  ))}
</div>
```

---

**作成日**: 2025年12月17日  
**対象**: Claude Code  
**プロジェクト**: BONO UI/UXダッシュボード  
**デザイン元**: Figma (node-id: 50-1282)
