# Article Card Components（統合版）

## 📦 提供ファイル一覧

Claude Codeに渡すファイルは以下の通りです：

### 🌟 最重要ファイル

1. **CLAUDE_CODE_INSTRUCTION_UNIFIED.md** ⭐
   - Claude Code向けの超詳細な実装指示書（統合版）
   - 基本版とお気に入り版の両方の仕様を記載
   - **まずこれを読んでください**

### 🎯 実装ファイル

2. **ArticleCard.tsx** - 基本版（スターアイコンなし）
3. **FavoriteArticleCard_Unified.tsx** - お気に入り版（スターアイコンあり）
4. **ArticleCards.types.ts** - TypeScript型定義（統合版）

### 👀 デモファイル

5. **article-cards-unified-demo.html** - 両方を並べて比較できるデモ

---

## 🎯 2つのコンポーネントの違い

| 項目 | ArticleCard（基本版） | FavoriteArticleCard（お気に入り版） |
|------|---------------------|--------------------------------|
| **スターアイコン** | ❌ なし | ✅ あり |
| **お気に入り機能** | ❌ なし | ✅ あり |
| **用途** | シンプルな記事リスト | お気に入り管理が必要な記事リスト |
| **幅** | 443px | 443px（同じ） |
| **高さ** | 68px | 68px（同じ） |
| **その他の機能** | 全て同じ（アイコン、カテゴリ、クリック可能） | 全て同じ |

---

## 🚀 Claude Codeへの指示方法

### パターンA: 両方実装してもらう（推奨）

```
CLAUDE_CODE_INSTRUCTION_UNIFIED.md を読んで、
以下の2つのコンポーネントを実装してください:

1. ArticleCard（基本版 - スターアイコンなし）
2. FavoriteArticleCard（お気に入り版 - スターアイコンあり）

実装方針は「アプローチ1: 基本コンポーネント + 拡張」を採用してください。
```

### パターンB: 既存コードを組み込む

```
以下のファイルをプロジェクトに組み込んでください:
- ArticleCard.tsx
- FavoriteArticleCard_Unified.tsx
- ArticleCards.types.ts

必要に応じてスタイルを調整してください。
```

### パターンC: 片方だけ実装

```
ArticleCard（基本版）だけ実装してください。
後でお気に入り機能が必要になったら拡張します。
```

---

## 📊 使い分けガイド

### ArticleCard（基本版）を使う場合

✅ シンプルな記事リスト表示  
✅ 閲覧のみで編集不要  
✅ お気に入り機能が不要  
✅ 軽量なUIが必要  

**使用例:**
```tsx
<ArticleCard
  category="ビジュアル"
  title="送る視線①：ビジュアル"
  description="by「3種盛」ではじめるUIデザイン入門"
  onClick={() => openArticle()}
/>
```

### FavoriteArticleCard（お気に入り版）を使う場合

✅ ユーザーのお気に入り管理機能  
✅ ブックマーク機能  
✅ 「後で読む」リスト  
✅ マイページでの記事一覧  

**使用例:**
```tsx
<FavoriteArticleCard
  category="ビジュアル"
  title="送る視線①：ビジュアル"
  description="by「3種盛」ではじめるUIデザイン入門"
  isFavorite={true}
  onFavoriteToggle={(isFav) => updateFavorite(isFav)}
  onClick={() => openArticle()}
/>
```

---

## 💻 実装パターン

### パターン1: 2つの独立コンポーネント（推奨）

```
/components/article-cards/
├── ArticleCard.tsx              # 基本版
├── FavoriteArticleCard.tsx      # お気に入り版
├── ArticleCards.types.ts        # 共通型定義
└── index.ts                     # エクスポート
```

**メリット:**
- 明確な責任分離
- 保守しやすい
- それぞれ独立して使える

### パターン2: 単一コンポーネント + Props

```tsx
<ArticleCard showFavorite={true} />
```

**メリット:**
- 1つのコンポーネントで完結
- ファイル数が少ない

### パターン3: 条件付きレンダリング

```tsx
{needsFavorite ? (
  <FavoriteArticleCard {...props} />
) : (
  <ArticleCard {...props} />
)}
```

**メリット:**
- 動的に切り替え可能
- 柔軟性が高い

---

## 🎨 カスタマイズ

### カテゴリカラーのカスタマイズ

```tsx
import { CATEGORY_COLORS } from './ArticleCards.types';

<ArticleCard
  category="ビジュアル"
  categoryColor={CATEGORY_COLORS.visual} // 緑
  // ...
/>

<ArticleCard
  category="コーディング"
  categoryColor={CATEGORY_COLORS.coding} // 青
  // ...
/>
```

### アイコンのカスタマイズ

```tsx
// テキスト
<ArticleCard icon="CC" />

// 絵文字
<ArticleCard icon="🎨" />

// 画像URL
<ArticleCard icon="https://example.com/icon.png" />
```

---

## 📱 レスポンシブ対応

両コンポーネントは固定幅（443px）です。レスポンシブ対応が必要な場合:

```tsx
// 親要素でラップ
<div style={{ maxWidth: '443px', width: '100%' }}>
  <ArticleCard {...props} />
</div>
```

または、コンポーネント内のwidthを変更:

```tsx
width: '100%',      // 443px → 100%
maxWidth: '443px',  // 最大幅を指定
```

---

## 🧪 テストケース

### 基本版

```tsx
describe('ArticleCard', () => {
  it('正しくレンダリングされる', () => {
    render(<ArticleCard category="test" title="test" description="test" />);
    expect(screen.getByRole('article')).toBeInTheDocument();
  });

  it('クリックイベントが発火する', () => {
    const handleClick = jest.fn();
    render(<ArticleCard onClick={handleClick} />);
    fireEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalled();
  });
});
```

### お気に入り版

```tsx
describe('FavoriteArticleCard', () => {
  it('スターアイコンが表示される', () => {
    render(<FavoriteArticleCard />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('お気に入りをトグルできる', () => {
    const handleToggle = jest.fn();
    render(<FavoriteArticleCard onFavoriteToggle={handleToggle} />);
    fireEvent.click(screen.getByRole('button'));
    expect(handleToggle).toHaveBeenCalledWith(true);
  });
});
```

---

## 🔗 関連コンポーネント

- **ProgressLesson** - 進捗表示カード（先に実装済み）

これらを組み合わせてダッシュボードUIを構築できます：

```tsx
<div>
  {/* 進捗カード */}
  <ProgressLesson progress={50} title="センスを盗む技術" />
  
  {/* 記事カード */}
  <ArticleCard title="送る視線①：ビジュアル" />
  
  {/* お気に入り記事カード */}
  <FavoriteArticleCard title="React Hooks完全ガイド" isFavorite={true} />
</div>
```

---

## ✅ 実装完了チェックリスト

### ArticleCard（基本版）
- [ ] 443px × 68px で表示される
- [ ] アイコン、カテゴリ、タイトル、説明文が正しく配置
- [ ] ホバー時の影が動作する
- [ ] クリック可能な場合はカーソルがpointerになる
- [ ] TypeScriptの型エラーがない

### FavoriteArticleCard（お気に入り版）
- [ ] ArticleCardと同じサイズで表示される
- [ ] スターアイコンが右端に表示される
- [ ] スタークリックで色が変わる（グレー⇔黄色）
- [ ] スターホバー時に拡大する
- [ ] カードクリックとスタークリックが干渉しない

---

## 📞 サポート

実装中に疑問が出た場合：
1. **CLAUDE_CODE_INSTRUCTION_UNIFIED.md** を再確認
2. **article-cards-unified-demo.html** で完成形を確認
3. 既存の実装ファイルを参照

---

## 🎁 ボーナス: リファクタリング提案

既存のFavoriteArticleCardがある場合、以下のようにリファクタリングできます：

```tsx
// Before: 1つの大きなコンポーネント
<FavoriteArticleCard showFavorite={false} />

// After: 2つの明確なコンポーネント
<ArticleCard />              // シンプル
<FavoriteArticleCard />      // 機能追加
```

---

**作成日**: 2025年12月17日  
**プロジェクト**: BONO UI/UXダッシュボード  
**バージョン**: 統合版 v1.0  
**デザイン元**: Figma  
- 基本版: node-id=51-1616  
- お気に入り版: node-id=2-2180
