# PageHeader

**最終更新**: 2026-04-06
**実装ファイル**: `src/components/common/PageHeader.tsx`
**Figma**: [PRD🏠_topUI_newBONO2026](https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/)

---

## 概要

一覧ページ・リストページで使用される共通ヘッダーコンポーネント。
ラベル、タイトル、説明文、ボタンエリアを含む。

**WHY（なぜ）**: ページの目的と内容を一目で理解できるようにする

**WHEN（いつ使う）**:
- ✅ 一覧ページ（Q&A、フィードバック、ナレッジ等）
- ✅ リストページ（レッスン一覧、ロードマップ一覧）
- ✅ ラベル + タイトル + 説明が必要なページ
- ❌ 詳細ページ（代わりに専用のHeroコンポーネントを使用）
- ❌ トップページ（代わりに独自のヒーローセクションを使用）

---

## デザイン仕様

### サイズ（レスポンシブ）

**モバイル**:
- タイトル: 28px
- margin-top: -48px（上部余白を削減）
- margin-bottom: 40px

**デスクトップ**:
- タイトル: 48px
- margin-top: 48px
- margin-bottom: 88px

### レイアウト

- 配置: 中央揃え（`text-center`, `items-center`）
- 最大幅: 説明文は367px
- 内部gap: 20px（`gap-5`）

### タイポグラフィ

**ラベル**:
- サイズ: 14px（`text-sm`）
- 色: `text-text-muted`
- 行間: snug

**タイトル**:
- サイズ: 28px (mobile), 48px (desktop)
- 色: `text-text-primary`
- フォント: Rounded M+ (丸ゴシック)
- ウェイト: Bold
- 行間: tight

**説明文**:
- サイズ: 15px
- 色: `text-text-muted`
- 行間: normal
- 最大幅: 367px

### アニメーション

- フェードイン: opacity 0→1
- スライドアップ: y 20px→0
- トランジション: 0.5s
- ライブラリ: Framer Motion

---

## 使用方法

### 基本

```tsx
import PageHeader from '@/components/common/PageHeader';

function QuestionsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="Q&A"
          title="みんなの質問"
          description="UIUXデザインに関する質問をみんなで解決しよう"
        />
        {/* コンテンツ */}
      </div>
    </Layout>
  );
}
```

### Props

```typescript
interface PageHeaderProps {
  /** ラベル（例: "Q&A", "Feedback"） */
  label: string;

  /** ページタイトル */
  title: string;

  /** 説明文 */
  description: string;

  /** ボタンエリア（ReactNodeで柔軟に対応） */
  children?: ReactNode;
}
```

---

## 実装パターン

### パターン1: シンプルなヘッダー（ボタンなし）

```tsx
import PageHeader from '@/components/common/PageHeader';

function KnowledgePage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="ナレッジ"
          title="デザインの知識"
          description="UIUX設計に役立つ知識をまとめています"
        />
        {/* 記事一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: ボタンが不要な一覧ページ

### パターン2: ボタン付きヘッダー

```tsx
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

function QuestionsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="Q&A"
          title="みんなの質問"
          description="UIUXデザインに関する質問をみんなで解決しよう"
        >
          <Button size="lg">
            <Plus className="w-4 h-4 mr-2" />
            質問を投稿
          </Button>
        </PageHeader>
        {/* 質問一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: 新規作成ボタンなどのCTAが必要なページ

### パターン3: 複数ボタン

```tsx
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Plus, Filter } from 'lucide-react';

function FeedbacksPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="フィードバック"
          title="デザインレビュー"
          description="みんなのデザインにフィードバックしよう"
        >
          <div className="flex gap-3">
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              絞り込み
            </Button>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              投稿する
            </Button>
          </div>
        </PageHeader>
        {/* フィードバック一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: 複数のアクションボタンが必要なページ

### パターン4: リンクボタン

```tsx
import PageHeader from '@/components/common/PageHeader';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Plus } from 'lucide-react';

function LessonsPage() {
  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <PageHeader
          label="レッスン"
          title="学習コンテンツ"
          description="実践的なUIUXデザインを学ぼう"
        >
          <Button asChild>
            <Link to="/lessons/new">
              <Plus className="w-4 h-4 mr-2" />
              新しいレッスン
            </Link>
          </Button>
        </PageHeader>
        {/* レッスン一覧 */}
      </div>
    </Layout>
  );
}
```

**使用シーン**: ボタンがリンク先に遷移する場合

---

## レスポンシブ対応

PageHeaderは自動的にレスポンシブ対応します：

- **モバイル**: タイトル28px、margin-top -48px（コンパクト）
- **タブレット・デスクトップ**: タイトル48px、margin-top 48px（ゆったり）

説明文の最大幅367pxは全画面サイズで共通。

---

## デザイントークン

### 使用している色トークン

- ラベル: `text-text-muted`
- タイトル: `text-text-primary`
- 説明文: `text-text-muted`

### 使用しているフォント

- ラベル: Noto Sans JP, 14px, snug
- タイトル: Rounded M+, Bold, 28-48px, tight
- 説明文: Noto Sans JP, 15px, normal

### 余白・間隔

- 上部margin: -48px (mobile), 48px (desktop)
- 下部margin: 40px (mobile), 88px (desktop)
- 内部gap: 20px (`gap-5`)

---

## アニメーション仕様

```typescript
// Framer Motion設定
initial={{ opacity: 0, y: 20 }}    // 初期状態: 透明 + 下に20px
animate={{ opacity: 1, y: 0 }}     // アニメーション後: 表示 + 元の位置
transition={{ duration: 0.5 }}     // 0.5秒かけてアニメーション
```

**効果**: ページ読み込み時にふわっと上にスライドしながらフェードイン

---

## AIへの指示例

### ✅ 良い例

```
「Q&A一覧ページを作って。
PageHeader（.claude/design-system/components/PageHeader.md参照）を使って、
label="Q&A", title="みんなの質問", description="..."で。
children に質問投稿ボタンを配置して。」
```

→ AIが正確に理解・実装できる

### ❌ 悪い例

```
「ページにヘッダー作って、タイトルと説明入れて」
```

→ どのコンポーネント？どのスタイル？AIが推測してしまう

---

## 関連コンポーネント

- **CategoryNav**: ページヘッダー直下に配置するカテゴリナビゲーション
- **SectionHeading**: ページ内のセクション見出し（PageHeaderより小さい）
- **Button**: ボタンエリア（children）で使用
- **Layout**: PageHeaderを含むページ全体のレイアウト

---

## 注意事項

- ⚠️ モバイルは `margin-top: -48px` で上部余白を削減（レイアウトに配慮が必要）
- ⚠️ タイトルフォントは Rounded M+（丸ゴシック）が必要
- ⚠️ Framer Motionが必須依存関係
- ⚠️ children は中央揃えの flex コンテナでラップされる

---

## アクセシビリティ

- タイトルは `<h1>` タグで適切な文書構造
- ラベルは意味的な役割を持つ `<span>`
- 色コントラスト基準準拠（WCAG AA）

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-04-06 | 初版作成（PageHeaderの仕様を文書化） |
