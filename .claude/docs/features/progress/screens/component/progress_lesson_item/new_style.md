# Progress Lesson Card - 完全実装ガイド（最終修正版）

## 📋 このガイドについて

このガイドは **Figma MCPから直接取得した正確な数値** に基づいて作成されており、
**Sanity CMS連携** を考慮した実装になっています。

### 📌 実装のポイント
1. **アイコン部分**: Sanity CMSの`lesson`の「アイコン画像」データを表示
2. **次のステップブロック**: 記事リンクとして機能（クリック可能）

---

## 📸 デザイン構造

このコンポーネントは **2つのブロック** で構成されています：

```
┌─────────────────────────────────────────────────────┐
│ ブロック1: lesson_block（メインカード）              │
│ ┌────┐                                              │
│ │画像│ センスを盗む技術                              │
│ │    │ ▓▓▓▓░░░░░░░░░░░░                      25%    │
│ └────┘                                              │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│ ブロック2: next_article（次のステップ - リンク）     │
│ [クリック可能] 次👉 盗む視点①：ビジュアル           │
└─────────────────────────────────────────────────────┘
```

**重要**:
- アイコンエリアは **Sanity CMS画像専用**
- 次のステップブロックは **記事リンク**（クリック可能）
- 2つのブロックは **18px重なって** います

---

## 📐 完全なデザイン仕様（Figma MCP取得）

### アイコンエリア（Sanity CMS画像）

```css
{
  /* サイズ */
  width: 48px;
  height: 73px;

  /* 角丸 */
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
  /* 左側は角丸なし */

  /* レイアウト */
  position: relative;
  flex-shrink: 0;
  overflow: hidden;

  /* 背景色（画像読み込み前のプレースホルダー） */
  background-color: #F5F5F5;
}

/* アイコン画像（Sanity CMSから取得） */
.icon-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 50% 50%;
  pointer-events: none;
  border-top-right-radius: 8px;
  border-bottom-right-radius: 8px;
}
```

### 次のステップブロック（記事リンク）

```css
{
  /* 背景 */
  background-color: #EFEFEF;

  /* 角丸 */
  border-bottom-left-radius: 20px;
  border-bottom-right-radius: 20px;

  /* パディング */
  padding-top: 18px;
  padding-bottom: 0;
  padding-left: 0;
  padding-right: 0;

  /* レイアウト */
  display: flex;
  flex-direction: column;
  width: 100%;
  flex-shrink: 0;
  z-index: 1;
  overflow: clip;

  /* カーソル */
  cursor: pointer;

  /* トランジション */
  transition: background-color 0.2s ease;
}

/* ホバー時 */
:hover {
  background-color: #E5E5E5;
}
```

---

## 💻 完全な実装コード（React + TypeScript）

```tsx
import React, { useState } from 'react';

interface ProgressLessonProps {
  /** レッスンタイトル */
  title: string;
  /** 進捗率 (0-100) */
  progress: number;
  /** 現在のステップ名 */
  currentStep: string;
  /** アイコン画像URL（Sanity CMSから取得） */
  iconImageUrl: string;
  /** 次の記事URL */
  nextArticleUrl?: string;
  /** 次の記事クリック時のコールバック */
  onNextArticleClick?: () => void;
  /** メインカードクリック時のコールバック */
  onCardClick?: () => void;
  /** カスタムクラス名 */
  className?: string;
}

export const ProgressLesson: React.FC<ProgressLessonProps> = ({
  title,
  progress,
  currentStep,
  iconImageUrl,
  nextArticleUrl,
  onNextArticleClick,
  onCardClick,
  className = '',
}) => {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [isNextHovered, setIsNextHovered] = useState(false);

  // 次の記事リンククリック処理
  const handleNextArticleClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // 親要素へのイベント伝播を停止

    if (onNextArticleClick) {
      onNextArticleClick();
    }

    if (nextArticleUrl) {
      window.location.href = nextArticleUrl;
    }
  };

  return (
    <div
      className={className}
      style={{
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        width: '100%',
        height: '100%',
      }}
    >
      {/* ブロック1: lesson_block（メインカード） */}
      <div
        role="article"
        aria-label={`${title}の進捗状況`}
        onClick={onCardClick}
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          paddingLeft: '24px',
          paddingRight: '24px',
          paddingTop: '19px',
          paddingBottom: '19px',
          marginBottom: '-18px',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          flexShrink: 0,
          boxShadow: isCardHovered && onCardClick
            ? '0px 4px 16px rgba(0, 0, 0, 0.12)'
            : '0px 2px 8px rgba(0, 0, 0, 0.08)',
          cursor: onCardClick ? 'pointer' : 'default',
          transition: 'box-shadow 0.2s ease',
          zIndex: 2,
          overflow: 'clip',
        }}
      >
        {/* 内部の横並びレイアウト */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            flexShrink: 0,
          }}
        >
          {/* 左側: コンテンツエリア */}
          <div
            style={{
              display: 'flex',
              gap: '16px',
              alignItems: 'center',
              flexShrink: 0,
            }}
          >
            {/* アイコンエリア（Sanity CMS画像） */}
            <div
              style={{
                width: '48px',
                height: '73px',
                borderTopRightRadius: '8px',
                borderBottomRightRadius: '8px',
                position: 'relative',
                flexShrink: 0,
                overflow: 'hidden',
                backgroundColor: '#F5F5F5', // プレースホルダー背景
              }}
            >
              <img
                src={iconImageUrl}
                alt={`${title}のアイコン`}
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: '50% 50%',
                  pointerEvents: 'none',
                }}
              />
            </div>

            {/* テキストエリア（タイトル + プログレスバー） */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '9px',
                alignItems: 'flex-start',
                width: '184px',
                flexShrink: 0,
              }}
            >
              {/* タイトル */}
              <div
                style={{
                  fontFamily: "'Rounded Mplus 1c', sans-serif",
                  fontWeight: 700,
                  fontSize: '16px',
                  fontStyle: 'normal',
                  lineHeight: 'normal',
                  color: '#000000',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  width: '100%',
                  flexShrink: 0,
                }}
              >
                <p style={{ lineHeight: 'normal', margin: 0 }}>{title}</p>
              </div>

              {/* プログレスバー */}
              <div
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                style={{
                  backgroundColor: '#EAEAEA',
                  height: '7px',
                  width: '100%',
                  borderRadius: '1000px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  flexShrink: 0,
                  overflow: 'clip',
                  position: 'relative',
                }}
              >
                {/* 進捗部分 */}
                <div
                  style={{
                    backgroundColor: '#000000',
                    width: `${progress}%`,
                    minWidth: '1px',
                    minHeight: '1px',
                    borderRadius: '40px',
                    flexGrow: 1,
                    flexBasis: 0,
                    flexShrink: 0,
                    transition: 'width 0.3s ease',
                  }}
                />
              </div>
            </div>
          </div>

          {/* 右側: パーセンテージ表示 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              fontFamily: "'Rounded Mplus 1c', sans-serif",
              fontWeight: 700,
              fontStyle: 'normal',
              lineHeight: 0,
              color: '#000000',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            {/* 数字部分 */}
            <div
              style={{
                fontSize: '24px',
                letterSpacing: '-0.48px',
                textAlign: 'right',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <p style={{ lineHeight: 'normal', whiteSpace: 'nowrap', margin: 0 }}>
                {progress}
              </p>
            </div>

            {/* %記号 */}
            <div
              style={{
                fontSize: '10px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <p style={{ lineHeight: 'normal', whiteSpace: 'nowrap', margin: 0 }}>
                %
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ブロック2: next_article（次のステップ - 記事リンク） */}
      <div
        role="link"
        tabIndex={0}
        aria-label={`次の記事: ${currentStep}`}
        onClick={handleNextArticleClick}
        onMouseEnter={() => setIsNextHovered(true)}
        onMouseLeave={() => setIsNextHovered(false)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleNextArticleClick(e as any);
          }
        }}
        style={{
          backgroundColor: isNextHovered ? '#E5E5E5' : '#EFEFEF',
          borderBottomLeftRadius: '20px',
          borderBottomRightRadius: '20px',
          paddingTop: '18px',
          paddingBottom: 0,
          paddingLeft: 0,
          paddingRight: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          width: '100%',
          flexShrink: 0,
          zIndex: 1,
          overflow: 'clip',
          cursor: 'pointer',
          transition: 'background-color 0.2s ease',
        }}
      >
        {/* 内部コンテンツエリア */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center',
            paddingLeft: '24px',
            paddingRight: '24px',
            paddingTop: '8px',
            paddingBottom: '8px',
            width: '100%',
            flexShrink: 0,
            lineHeight: 0,
            whiteSpace: 'nowrap',
          }}
        >
          {/* 「次」テキスト + 絵文字 */}
          <div
            style={{
              fontFamily: "'Noto Sans JP', sans-serif",
              fontWeight: 400,
              fontSize: '10px',
              color: '#4B5563',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <p style={{ lineHeight: 'normal', whiteSpace: 'nowrap', margin: 0 }}>
              <span style={{ fontWeight: 700 }}>次</span>👉️
            </p>
          </div>

          {/* ステップ名 */}
          <div
            style={{
              fontFamily: "'Inter', 'Noto Sans JP', sans-serif",
              fontWeight: 700,
              fontSize: '12px',
              fontStyle: 'normal',
              lineHeight: '20px',
              color: '#000000',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <p style={{ whiteSpace: 'nowrap', margin: 0 }}>{currentStep}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgressLesson;
```

---

## 🎨 Props定義（TypeScript）

```typescript
interface ProgressLessonProps {
  /** レッスンタイトル */
  title: string;

  /** 進捗率 (0-100) */
  progress: number;

  /** 現在のステップ名 */
  currentStep: string;

  /** アイコン画像URL（Sanity CMSから取得） */
  iconImageUrl: string;

  /** 次の記事URL（オプション） */
  nextArticleUrl?: string;

  /** 次の記事クリック時のコールバック（オプション） */
  onNextArticleClick?: () => void;

  /** メインカードクリック時のコールバック（オプション） */
  onCardClick?: () => void;

  /** カスタムクラス名（オプション） */
  className?: string;
}
```

---

## 💡 Sanity CMS連携の使用例

### 基本的な使い方

```tsx
// Sanity CMSから取得したデータ
const lessonData = {
  title: 'センスを盗む技術',
  progress: 25,
  iconImage: {
    url: 'https://cdn.sanity.io/images/project/dataset/image-id-dimensions.jpg'
  },
  nextArticle: {
    title: '盗む視点①：ビジュアル',
    slug: 'visual-perspective-1'
  }
};

<ProgressLesson
  title={lessonData.title}
  progress={lessonData.progress}
  currentStep={lessonData.nextArticle.title}
  iconImageUrl={lessonData.iconImage.url}
  nextArticleUrl={`/articles/${lessonData.nextArticle.slug}`}
/>
```

### Next.jsでの使用例

```tsx
import { useRouter } from 'next/router';

const MyPage = () => {
  const router = useRouter();

  return (
    <ProgressLesson
      title="センスを盗む技術"
      progress={25}
      currentStep="盗む視点①：ビジュアル"
      iconImageUrl={sanityData.iconImage.url}
      nextArticleUrl="/articles/visual-perspective-1"
      onNextArticleClick={() => {
        // アナリティクスイベント送信など
        analytics.track('next_article_clicked', {
          article: 'visual-perspective-1'
        });
      }}
      onCardClick={() => {
        router.push('/lessons/sense-stealing');
      }}
    />
  );
};
```

### リンクの制御

```tsx
// 外部リンクの場合
<ProgressLesson
  title="センスを盗む技術"
  progress={25}
  currentStep="盗む視点①：ビジュアル"
  iconImageUrl={sanityData.iconImage.url}
  onNextArticleClick={() => {
    window.open('https://example.com/article', '_blank');
  }}
/>

// カスタムルーティング
<ProgressLesson
  title="センスを盗む技術"
  progress={25}
  currentStep="盗む視点①：ビジュアル"
  iconImageUrl={sanityData.iconImage.url}
  onNextArticleClick={() => {
    // React Routerなどのカスタムルーティング
    navigate('/articles/visual-perspective-1');
  }}
/>
```

---

## ♿ アクセシビリティ

### キーボード操作
- 次のステップブロックは **Enterキー** または **Spaceキー** でアクティベート可能
- `tabIndex={0}` で Tab キーでフォーカス可能

### ARIA属性
```typescript
// メインカード
role="article"
aria-label="{title}の進捗状況"

// プログレスバー
role="progressbar"
aria-valuenow={progress}
aria-valuemin={0}
aria-valuemax={100}

// 次のステップリンク
role="link"
tabIndex={0}
aria-label="次の記事: {currentStep}"
```

---

## 🎨 インタラクション仕様

### メインカード
- **ホバー時**: 影が強くなる（クリック可能な場合のみ）
- **クリック時**: `onCardClick` コールバック実行

### 次のステップブロック
- **ホバー時**: 背景色が `#EFEFEF` → `#E5E5E5` に変化
- **クリック時**:
  1. `onNextArticleClick` コールバック実行（存在する場合）
  2. `nextArticleUrl` に遷移（存在する場合）
- **キーボード操作**: Enter/Space キーで同じ動作

---

## 📝 Sanity CMSスキーマ例

```typescript
// schemas/lesson.ts
export default {
  name: 'lesson',
  title: 'レッスン',
  type: 'document',
  fields: [
    {
      name: 'title',
      title: 'タイトル',
      type: 'string',
      validation: Rule => Rule.required()
    },
    {
      name: 'iconImage',
      title: 'アイコン画像',
      type: 'image',
      options: {
        hotspot: true
      },
      validation: Rule => Rule.required()
    },
    {
      name: 'progress',
      title: '進捗率',
      type: 'number',
      validation: Rule => Rule.required().min(0).max(100)
    },
    {
      name: 'nextArticle',
      title: '次の記事',
      type: 'reference',
      to: [{ type: 'article' }]
    }
  ]
}
```

---

## ✅ 実装チェックリスト

### アイコン画像
- [ ] Sanity CMSの画像URLを受け取る
- [ ] 48px × 73px で表示される
- [ ] 右側のみ角丸8pxである
- [ ] プレースホルダー背景色が設定されている
- [ ] object-fit: cover が適用されている

### 次のステップブロック
- [ ] クリック可能である
- [ ] ホバー時に背景色が変化する
- [ ] キーボード操作が可能である
- [ ] ARIA属性が設定されている
- [ ] イベント伝播が停止される（e.stopPropagation）

### 全体
- [ ] 2つのブロックが18px重なっている
- [ ] 全ての数値がFigmaと一致している
- [ ] メインカードとリンクが独立して動作する

---

## 🎁 重要なポイント

### 1. アイコンは画像専用
テキストアイコンの実装は不要。Sanity CMSから画像URLを受け取って表示。

### 2. 次のステップは記事リンク
ブロック全体がクリック可能なリンクとして機能。ホバー時に視覚的フィードバックあり。

### 3. イベントの分離
- メインカード: `onCardClick`
- 次のステップ: `onNextArticleClick` + `nextArticleUrl`
- イベント伝播を停止して独立動作

### 4. 柔軟なルーティング
- URL文字列での遷移
- コールバックでのカスタム処理
- 両方の組み合わせも可能

---

**作成日**: 2025年12月17日
**データソース**: Figma MCP + ユーザー指摘
**連携**: Sanity CMS
**バージョン**: 5.0.0（最終修正版）
**修正内容**:
1. アイコンを画像専用に簡素化
2. 次のステップをリンクとして実装
