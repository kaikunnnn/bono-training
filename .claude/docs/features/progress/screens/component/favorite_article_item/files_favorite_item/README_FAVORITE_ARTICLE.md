# Favorite Article Card Component

## 📦 提供ファイル一覧

Claude Codeに渡すファイルは以下の通りです：

### 【必須】実装に必要なファイル

1. **CLAUDE_CODE_INSTRUCTION.md** ⭐最重要
   - Claude Code向けの詳細な実装指示書
   - デザイン仕様、レイアウト、Props定義など全て記載
   - **まずこれを読んでください**

2. **FavoriteArticleCard.tsx**
   - 実装済みコンポーネント（インラインスタイル版）
   - そのまま使えるReactコンポーネント

3. **FavoriteArticleCard.types.ts**
   - TypeScript型定義
   - カテゴリカラー定義
   - ユーティリティ関数

### 【参考】実装例とデモ

4. **FavoriteArticleCard.examples.tsx**
   - 7パターンの使用例
   - Supabase連携の例も含む

5. **favorite-article-demo.html**
   - ブラウザで開いて動作確認できるデモ
   - 完成イメージを視覚的に確認可能

---

## 🎯 Claude Codeへの指示方法

### パターンA: ゼロから実装してもらう場合

```
添付の CLAUDE_CODE_INSTRUCTION.md を読んで、
FavoriteArticleCard コンポーネントを実装してください。

実装要件:
- React + TypeScript
- インラインスタイル使用
- お気に入り機能付き
```

### パターンB: 既存コードを参考にしてもらう場合

```
添付の FavoriteArticleCard.tsx を参考に、
このコンポーネントをプロジェクトに組み込んでください。

必要に応じて:
- スタイルをTailwind CSSに変換
- Styled Componentsに変換
- 既存のデザインシステムに合わせて調整
```

### パターンC: カスタマイズしてもらう場合

```
FavoriteArticleCard コンポーネントを以下のように
カスタマイズしてください:

1. カードの幅を600pxに変更
2. カテゴリタグを削除
3. 記事のサムネイル画像を追加
4. ダークモード対応

参考ファイル: FavoriteArticleCard.tsx
```

---

## 📊 コンポーネント概要

### デザイン仕様
- **サイズ**: 443px × 68px
- **レイアウト**: 横長カード型
- **要素**: アイコン、カテゴリタグ、タイトル、説明文、お気に入りボタン

### 主要機能
✅ カスタマイズ可能なアイコン（テキスト/絵文字/画像）  
✅ カテゴリ別カラーリング  
✅ お気に入りトグル機能  
✅ クリック可能なカード  
✅ ホバーエフェクト  
✅ アクセシビリティ対応  

### 技術スタック
- React 18+
- TypeScript
- インラインスタイル（Tailwind対応可）

---

## 🚀 クイックスタート

### 1. デモで動作確認
```bash
# favorite-article-demo.html をブラウザで開く
open favorite-article-demo.html
```

### 2. コンポーネントを使う
```tsx
import { FavoriteArticleCard } from './FavoriteArticleCard';

function App() {
  return (
    <FavoriteArticleCard
      category="ビジュアル"
      title="送る視線①：ビジュアル"
      description="by「3種盛」ではじめるUIデザイン入門"
      onFavoriteToggle={(isFavorite) => console.log(isFavorite)}
    />
  );
}
```

---

## 📝 実装チェックリスト

Claude Codeに実装してもらった後、以下を確認してください：

- [ ] 指定サイズ（443px × 68px）で表示される
- [ ] 全要素が正しく配置されている
- [ ] お気に入りボタンが動作する
- [ ] ホバー時の影が変化する
- [ ] カテゴリカラーがカスタマイズ可能
- [ ] TypeScriptの型エラーがない
- [ ] アクセシビリティ属性が設定されている

---

## 🎨 カスタマイズ例

### 幅を変更
```tsx
// FavoriteArticleCard.tsx の width を変更
width: '600px',  // 443px → 600px
```

### Tailwind CSSに変換
```tsx
// 実装例は FavoriteArticleCard.examples.tsx を参照
// または CLAUDE_CODE_INSTRUCTION.md の仕様に従って実装
```

### ダークモード対応
```tsx
const isDark = true;
backgroundColor: isDark ? '#1F1F1F' : '#FFFFFF',
color: isDark ? '#E5E5E5' : '#1A1A1A',
```

---

## 🔗 関連コンポーネント

- **ProgressLesson** - 進捗表示カード（先に実装済み）
- 両方を組み合わせてダッシュボードUIを構築可能

---

## 📞 サポート

実装中に質問があれば：
1. CLAUDE_CODE_INSTRUCTION.md を再確認
2. favorite-article-demo.html で完成形を確認
3. FavoriteArticleCard.examples.tsx で使用例を確認

---

**作成日**: 2025年12月17日  
**プロジェクト**: BONO UI/UXダッシュボード  
**デザイン元**: Figma (node-id: 2-2180)
