# 【Claude Code 実装指示書】Favorite Article Card コンポーネント

## 📸 完成イメージ
![デザイン](reference-design.png)

---

## 🎯 実装するコンポーネント

**コンポーネント名**: `FavoriteArticleCard`

**用途**: BONO学習プラットフォームでお気に入り記事を表示するカードUI

---

## 📐 デザイン仕様

### 全体サイズ
- **幅**: 443px
- **高さ**: 68px
- **背景色**: #FFFFFF（白）
- **角丸**: 12px
- **影**: 0px 2px 8px rgba(0, 0, 0, 0.08)
- **パディング**: 16px

---

## 🏗️ レイアウト構造

```
┌─────────────────────────────────────────────────────────┐
│ [Icon] [Category]  Title                          [⭐] │
│  CC      ビジュアル   送る視線①：ビジュアル                │
│                    by「3種盛」ではじめるUIデザイン入門      │
└─────────────────────────────────────────────────────────┘
```

### 要素の配置（左から右へ）

1. **アイコンエリア** (左端)
2. **カテゴリタグ** (アイコンの右)
3. **コンテンツエリア** (中央・メイン)
   - タイトル（上）
   - 説明文（下）
4. **お気に入りアイコン** (右端)

---

## 🎨 各要素の詳細仕様

### 1. アイコンエリア（左端）

```typescript
// 仕様
size: 40px × 40px
background: #F5F5F5 (薄いグレー)
borderRadius: 8px
position: 左端、上下中央揃え

// 内容
- 背景に "COPY" というテキスト（薄く表示）
- 前面に "CC" というテキスト（グレー、太字）
  fontSize: 14px
  fontWeight: 700
  color: #999999
```

**実装メモ**: 
- 2つのテキストを重ねる（position: relative/absolute使用）
- または、画像URLをpropsで受け取れるようにする

---

### 2. カテゴリタグ（アイコンの右）

```typescript
// 仕様
padding: 4px 12px
background: #E8F5E9 (薄い緑)
borderRadius: 4px
fontSize: 12px
fontWeight: 600
color: #2E7D32 (濃い緑)
marginLeft: 12px (アイコンからの距離)

// テキスト
"ビジュアル"
```

**実装メモ**:
- カテゴリ名と色はpropsでカスタマイズ可能にする
- カテゴリカラーのバリエーション例：
  - ビジュアル: 緑 (#E8F5E9 / #2E7D32)
  - コーディング: 青 (#E3F2FD / #1565C0)
  - デザイン: 紫 (#F3E5F5 / #6A1B9A)

---

### 3. コンテンツエリア（中央）

#### 3-1. タイトル（上段）
```typescript
fontSize: 16px
fontWeight: 700
color: #1A1A1A (ほぼ黒)
lineHeight: 1.4
marginBottom: 4px

// テキスト例
"送る視線①：ビジュアル"
```

#### 3-2. 説明文（下段）
```typescript
fontSize: 13px
fontWeight: 400
color: #666666 (グレー)
lineHeight: 1.4

// テキスト例
"by「3種盛」ではじめるUIデザイン入門"
```

**実装メモ**:
- コンテンツエリアは `flex: 1` で残りのスペースを占有
- marginLeft: 12px (カテゴリタグからの距離)

---

### 4. お気に入りアイコン（右端）

```typescript
// 仕様
size: 24px × 24px
color: #FFC107 (黄色・アクティブ時)
color: #E0E0E0 (グレー・非アクティブ時)
marginLeft: 16px (コンテンツからの距離)
cursor: pointer
transition: all 0.2s ease

// アイコン
⭐ (星マーク)

// ホバー時
transform: scale(1.1)
```

**実装メモ**:
- クリックで状態をトグル
- アニメーション効果を追加

---

## 📝 Props定義

```typescript
interface FavoriteArticleCardProps {
  // アイコン
  icon?: string;              // アイコン画像URL or テキスト (default: "CC")
  iconBgColor?: string;       // アイコン背景色 (default: "#F5F5F5")
  
  // カテゴリ
  category: string;           // カテゴリ名 (例: "ビジュアル")
  categoryColor?: {
    bg: string;              // 背景色 (default: "#E8F5E9")
    text: string;            // テキスト色 (default: "#2E7D32")
  };
  
  // コンテンツ
  title: string;              // タイトル (例: "送る視線①：ビジュアル")
  description: string;        // 説明文 (例: "by「3種盛」では...")
  
  // お気に入り
  isFavorite?: boolean;       // お気に入り状態 (default: false)
  onFavoriteToggle?: () => void; // お気に入りトグル時のコールバック
  
  // その他
  onClick?: () => void;       // カード全体のクリックイベント
}
```

---

## 🎬 インタラクション仕様

### カード全体
- **ホバー時**: 影を強く（box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.12)）
- **クリック**: onClick が指定されていれば cursor: pointer

### お気に入りアイコン
- **ホバー時**: 少し拡大（scale: 1.1）
- **クリック**: 
  - お気に入り状態をトグル
  - onFavoriteToggle コールバックを実行
  - イベント伝播を停止（e.stopPropagation()）

---

## ♿ アクセシビリティ要件

```typescript
// カード全体
role="article"
aria-label={`${title} - ${category}`}

// お気に入りボタン
role="button"
aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
aria-pressed={isFavorite}
```

---

## 📦 実装ファイル構成

以下のファイルを作成してください：

```
/
├── FavoriteArticleCard.tsx        # メインコンポーネント
├── FavoriteArticleCard.types.ts  # TypeScript型定義
├── FavoriteArticleCard.styles.ts # スタイル定義（オプション）
└── FavoriteArticleCard.stories.tsx # Storybook用（オプション）
```

---

## 💻 実装例（テンプレート）

```tsx
import React, { useState } from 'react';

interface FavoriteArticleCardProps {
  icon?: string;
  iconBgColor?: string;
  category: string;
  categoryColor?: {
    bg: string;
    text: string;
  };
  title: string;
  description: string;
  isFavorite?: boolean;
  onFavoriteToggle?: () => void;
  onClick?: () => void;
}

export const FavoriteArticleCard: React.FC<FavoriteArticleCardProps> = ({
  icon = 'CC',
  iconBgColor = '#F5F5F5',
  category,
  categoryColor = { bg: '#E8F5E9', text: '#2E7D32' },
  title,
  description,
  isFavorite: initialFavorite = false,
  onFavoriteToggle,
  onClick,
}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isHovered, setIsHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFavorite(!isFavorite);
    onFavoriteToggle?.();
  };

  return (
    <div
      role="article"
      aria-label={`${title} - ${category}`}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        // ここにスタイルを実装
        // 上記の仕様に従ってください
      }}
    >
      {/* アイコン */}
      <div style={{ /* アイコンスタイル */ }}>
        {icon}
      </div>

      {/* カテゴリタグ */}
      <div style={{ /* カテゴリスタイル */ }}>
        {category}
      </div>

      {/* コンテンツエリア */}
      <div style={{ /* コンテンツエリアスタイル */ }}>
        <h3>{title}</h3>
        <p>{description}</p>
      </div>

      {/* お気に入りアイコン */}
      <button
        onClick={handleFavoriteClick}
        aria-label={isFavorite ? "お気に入りから削除" : "お気に入りに追加"}
        aria-pressed={isFavorite}
        style={{ /* ボタンスタイル */ }}
      >
        ⭐
      </button>
    </div>
  );
};
```

---

## 🎨 カテゴリカラープリセット

```typescript
export const CATEGORY_COLORS = {
  visual: {
    bg: '#E8F5E9',
    text: '#2E7D32',
  },
  coding: {
    bg: '#E3F2FD',
    text: '#1565C0',
  },
  design: {
    bg: '#F3E5F5',
    text: '#6A1B9A',
  },
  typography: {
    bg: '#FBE9E7',
    text: '#D84315',
  },
  ux: {
    bg: '#FFF9C4',
    text: '#F57F17',
  },
} as const;
```

---

## ✅ 実装チェックリスト

完成したら以下を確認してください：

- [ ] 指定されたサイズ（443px × 68px）で表示される
- [ ] すべての要素が正しく配置されている
- [ ] カテゴリタグの色がカスタマイズ可能
- [ ] お気に入りアイコンがクリックで切り替わる
- [ ] ホバー時のアニメーションが動作する
- [ ] TypeScriptの型エラーがない
- [ ] アクセシビリティ属性が正しく設定されている
- [ ] レスポンシブ対応（必要に応じて）

---

## 🧪 テストケース例

```tsx
// 基本表示
<FavoriteArticleCard
  category="ビジュアル"
  title="送る視線①：ビジュアル"
  description="by「3種盛」ではじめるUIデザイン入門"
/>

// お気に入り済み
<FavoriteArticleCard
  category="コーディング"
  categoryColor={CATEGORY_COLORS.coding}
  title="React Hooks完全ガイド"
  description="by フロントエンド実践講座"
  isFavorite={true}
/>

// クリック可能
<FavoriteArticleCard
  category="デザイン"
  title="カラー理論の基礎"
  description="by デザイン基礎シリーズ"
  onClick={() => window.location.href = '/article/123'}
  onFavoriteToggle={() => console.log('お気に入り切り替え')}
/>
```

---

## 📚 参考情報

### Figma デザインファイル
https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D/-UI--progress_ux_dashboard_2025?node-id=2-2180

### 関連コンポーネント
- `ProgressLesson` - 進捗表示カード（先に実装済み）

---

## 🤔 不明点があれば

実装中に疑問が出た場合は、以下を確認してください：
1. このドキュメントの仕様をもう一度確認
2. Figmaデザインファイルを直接確認
3. 既存の `ProgressLesson` コンポーネントの実装を参考にする

---

**作成日**: 2025年12月17日  
**対象**: Claude Code  
**プロジェクト**: BONO UI/UXダッシュボード
