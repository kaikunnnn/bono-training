# SectionHeading

**最終更新**: 2026-04-06
**実装ファイル**: `src/components/common/SectionHeading.tsx`
**Figma**: [PRD🏠_topUI_newBONO2026 - node-id: 47:13833](https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/)

---

## 概要

ページ内のセクション見出しコンポーネント。
ラベル、タイトル、説明文、下線を含む柔軟なレイアウト。

**WHY（なぜ）**: ページ内の各セクションの目的と内容を明確に区切る

**WHEN（いつ使う）**:
- ✅ ページ内のセクション見出し（"関連ロードマップ"、"人気の記事"等）
- ✅ カテゴリ別コンテンツのヘッダー
- ✅ ラベル + タイトル + 説明が必要な小見出し
- ❌ ページ全体の見出し（代わりに PageHeader を使用）
- ❌ カード内の見出し（代わりに適切なテキストスタイルを使用）

---

## デザイン仕様

### サイズ（レスポンシブ）

**タイトル**:
- モバイル: 18px
- デスクトップ: 20px

### レイアウト

**left揃え（デフォルト）**:
```
┌─────────────────────────────┐
│ ラベル                       │
│ セクションタイトル            │
│ 説明文...                    │
│ ──────────────               │
└─────────────────────────────┘
```

**center揃え**:
```
┌─────────────────────────────┐
│         ラベル               │
│    セクションタイトル         │
│       説明文...              │
│    ──────────────            │
└─────────────────────────────┘
```

### タイポグラフィ

**ラベル**:
- サイズ: 14px（`text-sm`）
- ウェイト: Bold
- 色: `var(--text-muted)`
- 行高: 27px

**タイトル**:
- サイズ: 18px (mobile), 20px (desktop)
- フォント: Rounded M+ (丸ゴシック)
- ウェイト: ExtraBold
- 色: `#293525`
- 行高: 36px（`leading-9`）

**説明文（textスタイル）**:
- サイズ: 16px（`text-base`）
- ウェイト: Normal
- 色: `#293525/80`
- 行高: 27px

**説明文（badgeスタイル）**:
- 専用コンポーネント: DescriptionBadge
- アイコン付き背景ボックス

### 下線

- 高さ: 1px（`h-px`）
- 色: `bg-gray-300`
- 透明度: 35%（`opacity-35`）
- 角丸: `rounded-sm`

---

## 使用方法

### 基本

```tsx
import SectionHeading from '@/components/common/SectionHeading';

function MyPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SectionHeading
          title="関連ロードマップ"
        />
        {/* コンテンツ */}
      </div>
    </Layout>
  );
}
```

### Props

```typescript
interface SectionHeadingProps {
  /** セクションタイトル */
  title: string;

  /** ラベル（タイトル上の小さいテキスト。例: "コンテンツ", "読みもの"） */
  label?: string;

  /** 説明文 */
  description?: string;

  /** 説明文のスタイル: 'text'=普通のテキスト, 'badge'=バッジスタイル */
  descriptionStyle?: 'text' | 'badge';

  /** 下線を表示するか（デフォルト: true） */
  showUnderline?: boolean;

  /** テキストの配置（デフォルト: left） */
  align?: 'left' | 'center';

  /** 追加のクラス名 */
  className?: string;
}
```

---

## 実装パターン

### パターン1: シンプルな見出し（タイトルのみ）

```tsx
import SectionHeading from '@/components/common/SectionHeading';

function RoadmapDetailPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        {/* メインコンテンツ */}

        <SectionHeading title="関連ロードマップ" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ロードマップカード */}
        </div>
      </div>
    </Layout>
  );
}
```

**使用シーン**: 最もシンプルなセクション区切り

### パターン2: ラベル + タイトル

```tsx
import SectionHeading from '@/components/common/SectionHeading';

function TopPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SectionHeading
          label="読みもの"
          title="最新の記事"
        />
        {/* 記事一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: カテゴリ情報を付加したい場合

### パターン3: 説明文付き（textスタイル）

```tsx
import SectionHeading from '@/components/common/SectionHeading';

function KnowledgePage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SectionHeading
          label="ナレッジ"
          title="UIデザインの基礎"
          description="UIデザインの基本原則と実践的なテクニックをまとめました"
          descriptionStyle="text"
        />
        {/* コンテンツ */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: セクションの詳細説明が必要な場合

### パターン4: 説明文付き（badgeスタイル）

```tsx
import SectionHeading from '@/components/common/SectionHeading';

function RoadmapsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SectionHeading
          title="転職・キャリアチェンジしたい"
          description="未経験からデザイナーへ、キャリアアップを目指したい方向けの地図"
          descriptionStyle="badge"
        />
        {/* ロードマップ一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: 説明文を目立たせたい場合

### パターン5: 中央揃え + 下線なし

```tsx
import SectionHeading from '@/components/common/SectionHeading';

function LandingPage() {
  return (
    <div>
      <section className="py-20">
        <div className="container mx-auto px-4">
          <SectionHeading
            title="サービスの特徴"
            description="3つのポイントで理解する"
            align="center"
            showUnderline={false}
            className="mb-12"
          />
          {/* 特徴カード */}
        </div>
      </section>
    </div>
  );
}
```

**使用シーン**: ランディングページのセクション見出し

### パターン6: 下線のみ非表示

```tsx
import SectionHeading from '@/components/common/SectionHeading';

function BlogPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <SectionHeading
          title="人気の記事"
          showUnderline={false}
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 記事カード */}
        </div>
      </div>
    </Layout>
  );
}
```

**使用シーン**: 視覚的な区切りが不要な場合

---

## レスポンシブ対応

SectionHeadingは自動的にレスポンシブ対応します：

- **モバイル**: タイトル18px
- **デスクトップ**: タイトル20px

その他の要素（ラベル、説明文、下線）は全画面共通。

---

## デザイントークン

### 使用している色トークン

- ラベル: `var(--text-muted)`
- タイトル: `#293525`
- 説明文（text）: `#293525/80`
- 下線: `bg-gray-300` + `opacity-35`

### 使用しているフォント

- ラベル: Noto Sans JP, Bold, 14px, line-height 27px
- タイトル: Rounded M+, ExtraBold, 18-20px, line-height 36px
- 説明文: Noto Sans JP, Normal, 16px, line-height 27px

### 余白・間隔

- 全体gap: 12px（`gap-3`）
- ラベル↔タイトル: 0px（`gap-0`、隣接配置）
- 説明文↔下線: 4px（`mt-1`、説明文がある場合のみ）

---

## 内包コンポーネント

### DescriptionBadge
- 場所: `src/components/common/DescriptionBadge.tsx`
- 役割: 説明文をバッジスタイルで表示
- 使用条件: `descriptionStyle="badge"` の時のみ

### PencilRulerPixelIcon
- 場所: `src/components/icons/PencilRulerPixelIcon.tsx`
- 役割: DescriptionBadge内のアイコン
- サイズ: 16×16px

---

## AIへの指示例

### ✅ 良い例

```
「ロードマップ詳細ページを作って。
ページ下部に SectionHeading（.claude/design-system/components/SectionHeading.md参照）で
"関連ロードマップ" のセクションを追加。下に RoadmapCardV2 を3枚並べて。」
```

→ AIが正確に理解・実装できる

### ❌ 悪い例

```
「セクション見出し作って」
```

→ どのコンポーネント？どのスタイル？AIが推測してしまう

---

## 関連コンポーネント

- **PageHeader**: ページ全体の見出し（SectionHeadingより大きい）
- **CategoryNav**: SectionHeadingとセットで使われることが多い
- **DescriptionBadge**: badgeスタイルの説明文
- **PencilRulerPixelIcon**: DescriptionBadge内のアイコン

---

## 注意事項

- ⚠️ タイトルは `<h2>` タグ（ページ全体の見出しは `<h1>`）
- ⚠️ タイトルフォントは Rounded M+（丸ゴシック）が必要
- ⚠️ DescriptionBadge は `descriptionStyle="badge"` の時のみ使用
- ⚠️ 下線の margin-top は説明文の有無で自動調整

---

## アクセシビリティ

- タイトルは `<h2>` タグで適切な文書構造
- ラベルは意味的な役割を持つ `<p>` タグ
- 色コントラスト基準準拠（WCAG AA）

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-04-06 | 初版作成（SectionHeadingの仕様を文書化） |
