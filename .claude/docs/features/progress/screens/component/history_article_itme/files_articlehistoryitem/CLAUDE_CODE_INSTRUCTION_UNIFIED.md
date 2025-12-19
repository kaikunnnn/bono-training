# 【Claude Code 実装指示書】Article Card コンポーネント（統合版）

## 📸 完成イメージ

### パターン1: 基本版（スターアイコンなし）
記事を表示するだけのシンプルなカード

### パターン2: お気に入り版（スターアイコンあり）
お気に入り機能付きの記事カード

---

## 🎯 実装するコンポーネント

### 1. ArticleCard（基本版）
- **用途**: 記事リスト表示
- **機能**: クリック可能な記事カード
- **特徴**: スターアイコンなし

### 2. FavoriteArticleCard（拡張版）
- **用途**: お気に入り管理が必要な記事リスト
- **機能**: ArticleCard + お気に入りトグル
- **特徴**: スターアイコンあり

---

## 📐 共通デザイン仕様

### 全体サイズ
- **幅**: 443px
- **高さ**: 68px
- **背景色**: #FFFFFF（白）
- **角丸**: 12px
- **影**: 0px 2px 8px rgba(0, 0, 0, 0.08)
- **パディング**: 16px

### レイアウト構造

```
基本版:
┌─────────────────────────────────────────────────────┐
│ [Icon] [Category]  Title                            │
│  CC      ビジュアル   送る視線①：ビジュアル              │
│                    by「3種盛」ではじめるUIデザイン入門   │
└─────────────────────────────────────────────────────┘

お気に入り版:
┌─────────────────────────────────────────────────────┐
│ [Icon] [Category]  Title                      [⭐]  │
│  CC      ビジュアル   送る視線①：ビジュアル              │
│                    by「3種盛」ではじめるUIデザイン入門   │
└─────────────────────────────────────────────────────┘
```

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
- 前面に指定テキスト（例: "CC"）（グレー、太字）
  fontSize: 14px
  fontWeight: 700
  color: #999999

// または画像URL対応
```

### 2. カテゴリタグ（アイコンの右）

```typescript
padding: 4px 12px
background: #E8F5E9 (薄い緑 - カスタマイズ可能)
borderRadius: 4px
fontSize: 12px
fontWeight: 600
color: #2E7D32 (濃い緑 - カスタマイズ可能)
marginLeft: 12px (アイコンからの距離)
```

### 3. コンテンツエリア（中央）

#### タイトル（上段）
```typescript
fontSize: 16px
fontWeight: 700
color: #1A1A1A
lineHeight: 1.4
marginBottom: 4px
overflow: hidden
textOverflow: ellipsis
whiteSpace: nowrap
```

#### 説明文（下段）
```typescript
fontSize: 13px
fontWeight: 400
color: #666666
lineHeight: 1.4
overflow: hidden
textOverflow: ellipsis
whiteSpace: nowrap
```

### 4. お気に入りアイコン（右端）※お気に入り版のみ

```typescript
size: 32px × 32px
fontSize: 20px
color: #FFC107 (黄色・アクティブ時)
color: #E0E0E0 (グレー・非アクティブ時)
marginLeft: 16px
cursor: pointer
transition: all 0.2s ease

// ホバー時
transform: scale(1.1)
```

---

## 💻 実装方針（推奨）

### アプローチ1: 基本コンポーネント + 拡張（推奨）

```typescript
// 1. ArticleCard.tsx - 基本版を実装
export const ArticleCard = (props) => {
  // スターアイコンなしの実装
}

// 2. FavoriteArticleCard.tsx - ArticleCardを拡張
export const FavoriteArticleCard = (props) => {
  // ArticleCardのレイアウトを使用
  // スターボタンを追加
}
```

**メリット**: コードの重複が少ない、保守しやすい

### アプローチ2: 単一コンポーネント + オプション

```typescript
// ArticleCard.tsx - プロパティで切り替え
export const ArticleCard = ({ showFavorite = false, ...props }) => {
  // showFavorite が true ならスターアイコン表示
}
```

**メリット**: 1つのコンポーネントで完結、シンプル

---

## 📝 Props定義

### ArticleCard（基本版）

```typescript
interface ArticleCardProps {
  // アイコン
  icon?: string;              // アイコン画像URL or テキスト (default: "CC")
  iconBgColor?: string;       // アイコン背景色 (default: "#F5F5F5")
  
  // カテゴリ
  category: string;           // カテゴリ名
  categoryColor?: {
    bg: string;              // 背景色 (default: "#E8F5E9")
    text: string;            // テキスト色 (default: "#2E7D32")
  };
  
  // コンテンツ
  title: string;              // タイトル
  description: string;        // 説明文
  
  // その他
  onClick?: () => void;       // カードクリック時のコールバック
  className?: string;         // カスタムクラス名
  articleId?: string;         // 記事ID
}
```

### FavoriteArticleCard（お気に入り版）

```typescript
interface FavoriteArticleCardProps extends ArticleCardProps {
  // お気に入り機能
  isFavorite?: boolean;       // お気に入り状態 (default: false)
  onFavoriteToggle?: (isFavorite: boolean) => void; // トグル時のコールバック
}
```

---

## 🏗️ 実装テンプレート

### ArticleCard.tsx（基本版）

```tsx
import React, { useState } from 'react';

interface ArticleCardProps {
  icon?: string;
  iconBgColor?: string;
  category: string;
  categoryColor?: { bg: string; text: string };
  title: string;
  description: string;
  onClick?: () => void;
  className?: string;
}

export const ArticleCard: React.FC<ArticleCardProps> = ({
  icon = 'CC',
  iconBgColor = '#F5F5F5',
  category,
  categoryColor = { bg: '#E8F5E9', text: '#2E7D32' },
  title,
  description,
  onClick,
  className = '',
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const isImageIcon = icon.startsWith('http');

  return (
    <div
      role="article"
      aria-label={`${title} - ${category}`}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '443px',
        height: '68px',
        backgroundColor: '#FFFFFF',
        borderRadius: '12px',
        padding: '16px',
        boxShadow: isHovered && onClick
          ? '0px 4px 16px rgba(0, 0, 0, 0.12)'
          : '0px 2px 8px rgba(0, 0, 0, 0.08)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'box-shadow 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}
    >
      {/* アイコンエリア */}
      <div style={{
        width: '40px',
        height: '40px',
        backgroundColor: iconBgColor,
        borderRadius: '8px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {isImageIcon ? (
          <img src={icon} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <>
            <span style={{
              position: 'absolute',
              fontSize: '8px',
              fontWeight: '600',
              color: '#CCCCCC',
              letterSpacing: '0.5px',
            }}>
              COPY
            </span>
            <span style={{
              position: 'relative',
              fontSize: '14px',
              fontWeight: '700',
              color: '#999999',
              zIndex: 1,
            }}>
              {icon}
            </span>
          </>
        )}
      </div>

      {/* カテゴリタグ */}
      <div style={{
        padding: '4px 12px',
        backgroundColor: categoryColor.bg,
        borderRadius: '4px',
        fontSize: '12px',
        fontWeight: '600',
        color: categoryColor.text,
        flexShrink: 0,
        whiteSpace: 'nowrap',
      }}>
        {category}
      </div>

      {/* コンテンツエリア */}
      <div style={{
        flex: 1,
        minWidth: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '16px',
          fontWeight: '700',
          color: '#1A1A1A',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {title}
        </h3>
        <p style={{
          margin: 0,
          fontSize: '13px',
          fontWeight: '400',
          color: '#666666',
          lineHeight: '1.4',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          {description}
        </p>
      </div>
    </div>
  );
};
```

### FavoriteArticleCard.tsx（お気に入り版）

```tsx
import React, { useState } from 'react';
import { ArticleCard } from './ArticleCard';

interface FavoriteArticleCardProps {
  icon?: string;
  iconBgColor?: string;
  category: string;
  categoryColor?: { bg: string; text: string };
  title: string;
  description: string;
  isFavorite?: boolean;
  onFavoriteToggle?: (isFavorite: boolean) => void;
  onClick?: () => void;
  className?: string;
}

export const FavoriteArticleCard: React.FC<FavoriteArticleCardProps> = ({
  isFavorite: initialFavorite = false,
  onFavoriteToggle,
  ...articleProps
}) => {
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [isFavoriteHovered, setIsFavoriteHovered] = useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = !isFavorite;
    setIsFavorite(newState);
    onFavoriteToggle?.(newState);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <ArticleCard {...articleProps} />
      
      {/* お気に入りボタン（絶対配置でオーバーレイ） */}
      <button
        type="button"
        onClick={handleFavoriteClick}
        onMouseEnter={() => setIsFavoriteHovered(true)}
        onMouseLeave={() => setIsFavoriteHovered(false)}
        aria-label={isFavorite ? 'お気に入りから削除' : 'お気に入りに追加'}
        aria-pressed={isFavorite}
        style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: `translateY(-50%) ${isFavoriteHovered ? 'scale(1.1)' : 'scale(1)'}`,
          width: '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'transparent',
          border: 'none',
          cursor: 'pointer',
          fontSize: '20px',
          color: isFavorite ? '#FFC107' : '#E0E0E0',
          transition: 'all 0.2s ease',
          padding: 0,
        }}
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
  visual: { bg: '#E8F5E9', text: '#2E7D32' },
  coding: { bg: '#E3F2FD', text: '#1565C0' },
  design: { bg: '#F3E5F5', text: '#6A1B9A' },
  typography: { bg: '#FBE9E7', text: '#D84315' },
  ux: { bg: '#FFF9C4', text: '#F57F17' },
  default: { bg: '#E8F5E9', text: '#2E7D32' },
} as const;
```

---

## 🧪 使用例

### 基本版の使用

```tsx
<ArticleCard
  category="ビジュアル"
  title="送る視線①：ビジュアル"
  description="by「3種盛」ではじめるUIデザイン入門"
  onClick={() => console.log('記事を開く')}
/>
```

### お気に入り版の使用

```tsx
<FavoriteArticleCard
  category="ビジュアル"
  title="送る視線①：ビジュアル"
  description="by「3種盛」ではじめるUIデザイン入門"
  isFavorite={false}
  onFavoriteToggle={(isFavorite) => console.log(isFavorite)}
  onClick={() => console.log('記事を開く')}
/>
```

### 混在表示

```tsx
<div>
  {/* 通常の記事リスト */}
  <ArticleCard {...article1} />
  <ArticleCard {...article2} />
  
  {/* お気に入り管理が必要な記事 */}
  <FavoriteArticleCard {...article3} isFavorite={true} />
</div>
```

---

## ✅ 実装チェックリスト

完成したら以下を確認してください：

### ArticleCard（基本版）
- [ ] 指定サイズ（443px × 68px）で表示される
- [ ] すべての要素が正しく配置されている
- [ ] カテゴリタグの色がカスタマイズ可能
- [ ] ホバー時のアニメーションが動作する
- [ ] クリック可能な場合はcursor: pointer
- [ ] TypeScriptの型エラーがない

### FavoriteArticleCard（お気に入り版）
- [ ] ArticleCardと同じサイズで表示される
- [ ] スターアイコンが右端に表示される
- [ ] スターアイコンがクリックで切り替わる
- [ ] スターアイコンホバー時の拡大が動作する
- [ ] カードクリックとスタークリックが干渉しない
- [ ] アクセシビリティ属性が正しく設定されている

---

## 🔄 実装の選択肢

### オプションA: 2つの独立コンポーネント（推奨）
- ArticleCard.tsx
- FavoriteArticleCard.tsx
- **メリット**: 明確な責任分離、保守しやすい

### オプションB: 1つのコンポーネント + Props
```tsx
<ArticleCard showFavorite={true} />
```
- **メリット**: シンプル、ファイル数が少ない

### オプションC: 共通コンポーネント + 2つのラッパー
- ArticleCardBase.tsx（共通部分）
- ArticleCard.tsx（ラッパー）
- FavoriteArticleCard.tsx（ラッパー）
- **メリット**: 最も柔軟、再利用性が高い

---

## 📚 ファイル構成例

```
/components/article-cards/
├── ArticleCard.tsx              # 基本版
├── FavoriteArticleCard.tsx      # お気に入り版
├── ArticleCard.types.ts         # 型定義
├── ArticleCard.styles.ts        # スタイル（オプション）
└── index.ts                     # エクスポート
```

---

## 🤔 よくある質問

### Q1: どちらのアプローチを使うべき？
**A**: プロジェクトの規模による
- 小規模: オプションB（1つのコンポーネント）
- 中〜大規模: オプションA（2つの独立コンポーネント）

### Q2: 既存のFavoriteArticleCardがある場合は？
**A**: ArticleCardを抽出してリファクタリング推奨
```tsx
// 既存のFavoriteArticleCardから共通部分を抽出
// → ArticleCardとして分離
// → FavoriteArticleCardは薄いラッパーに
```

### Q3: スターアイコンの位置調整は？
**A**: `position: absolute` と `right`, `top` で微調整

---

## 📞 実装サポート

実装中に疑問が出た場合：
1. このドキュメントの実装テンプレートを確認
2. 提供されているデモHTMLで完成形を確認
3. examples.tsx で使用例を確認

---

**作成日**: 2025年12月17日  
**対象**: Claude Code  
**プロジェクト**: BONO UI/UXダッシュボード  
**デザイン元**: Figma  
- 基本版: node-id=51-1616  
- お気に入り版: node-id=2-2180
