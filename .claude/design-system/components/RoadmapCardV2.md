# RoadmapCardV2

**最終更新**: 2026-04-06
**実装ファイル**: `src/components/roadmap/RoadmapCardV2.tsx`
**Figma**: [PRD🏠_topUI_newBONO2026 - node-id: 69-16224](https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/)

---

## 概要

ロードマップ一覧・詳細ページで使用される、ロードマップ情報を視覚的に表示するカード。
グラデーション背景、サムネイル、ステップ数・期間表示が特徴。

**WHY（なぜ）**: ロードマップの概要を一目で理解でき、適切なコースを選択しやすくする

**WHEN（いつ使う）**:
- ✅ ロードマップ一覧ページ (`/roadmaps`)
- ✅ ロードマップ詳細ページの「他のロードマップ」セクション
- ✅ カテゴリ別フィルター表示
- ❌ トップページヒーロー（代わりに TrainingCard を使用）
- ❌ ダッシュボード（代わりに RoadmapCardCompact を使用）

---

## デザイン仕様

### サイズ（レスポンシブ）

**縦型レイアウト**:
- サムネイル高さ: 180px (mobile), 220px (tablet), 280px (desktop)
- 全体の幅: コンテナ幅に応じて可変

**横型レイアウト**:
- サムネイル幅: 320px (lg), 435px (xl)
- サムネイル高さ: 180px (mobile), 220px (tablet), 280px (desktop)

### レイアウト

- 角丸: 32px (mobile), 48px (tablet), 64px (desktop)
- シャドウ: `0px 1px 12px 0px rgba(0,0,0,0.08)`
- ホバー: `scale(1.02)` (縦型) / `scale(1.01)` (横型) + シャドウ強調
- トランジション: `0.3s`

### バリアント

**variant="gradient"** (デフォルト):
- カード全体がグラデーション背景
- 白色のテキスト・アイコン

**variant="white"**:
- 白色背景
- サムネイルのみグラデーション
- 濃色のテキスト・アイコン

### レイアウト方向

**orientation="vertical"** (デフォルト):
- サムネイルが上、コンテンツが下
- モバイル・タブレット・デスクトップで縦型

**orientation="horizontal"**:
- サムネイルが左、コンテンツが右（デスクトップ）
- モバイル・タブレットでは縦型にフォールバック

### サムネイルスタイル

**thumbnailStyle="default"** (デフォルト):
- 角丸長方形
- 内側にボーダーとシャドウ

**thumbnailStyle="wave"**:
- 波形マスク（詳細ページHeroと同じ形状）
- アスペクト比 800:433
- drop-shadow効果

---

## 使用方法

### 基本

```tsx
import RoadmapCardV2 from '@/components/roadmap/RoadmapCardV2';

// シンプルな縦型カード
<RoadmapCardV2
  slug="information-architecture"
  title="情報設計のきほん"
  description="ユーザーが迷わず情報を見つけられるように整理する技術"
  thumbnailUrl="/images/roadmap/info-arch.png"
  estimatedDuration="3-4"
  stepCount={24}
  shortTitle="情報設計"
  gradientPreset="info-arch"
/>
```

### Props

```typescript
interface RoadmapCardV2Props {
  // 必須
  slug: string;                      // URL用（例: "information-architecture"）
  title: string;                     // タイトル（「｜」「|」で改行可能）
  description: string;               // 説明文
  estimatedDuration: string;         // 目安期間（例: "1-2", "6~"）

  // オプション
  thumbnailUrl?: string;             // サムネイル画像URL
  stepCount?: number;                // ステップ数
  shortTitle?: string;               // バッジ表示用短縮名（例: "UXデザイン"）
  gradientPreset?: GradientPreset;   // グラデーションプリセット
  customGradient?: GradientDef;      // カスタムグラデーション（プリセットより優先）
  variant?: 'gradient' | 'white';    // カードのバリアント
  orientation?: 'vertical' | 'horizontal';  // レイアウト方向
  thumbnailStyle?: 'default' | 'wave';      // サムネイルスタイル
  basePath?: string;                 // リンク先のベースパス（デフォルト: '/roadmaps/'）
  label?: string;                    // ラベルテキスト（デフォルト: 'ロードマップ'）
  className?: string;                // 追加のクラス名
}
```

### グラデーションプリセット

```typescript
// 利用可能なプリセット（@/styles/gradients より）
type GradientPreset =
  | 'career-change'           // 転職・キャリアチェンジ
  | 'ux-design'               // UXデザイン
  | 'info-arch'               // 情報設計
  | 'ui-visual'               // UIビジュアル
  | 'ui-design-beginner';     // UI初心者
```

---

## 実装パターン

### パターン1: 一覧ページ（縦型グリッド）

```tsx
import RoadmapCardV2 from '@/components/roadmap/RoadmapCardV2';
import { useRoadmaps } from '@/hooks/useRoadmaps';

function RoadmapsPage() {
  const { roadmaps, loading, error } = useRoadmaps();

  if (loading) return <div>読み込み中...</div>;
  if (error) return <div>エラーが発生しました</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {roadmaps.map((roadmap) => (
        <RoadmapCardV2
          key={roadmap._id}
          slug={roadmap.slug.current}
          title={roadmap.title}
          description={roadmap.shortDescription}
          thumbnailUrl={roadmap.thumbnailImage?.url}
          estimatedDuration={roadmap.estimatedDuration}
          stepCount={roadmap.stepCount}
          shortTitle={roadmap.shortTitle}
          gradientPreset={roadmap.gradientPreset as GradientPreset}
          variant="gradient"
          orientation="vertical"
          thumbnailStyle="default"
        />
      ))}
    </div>
  );
}
```

### パターン2: 詳細ページ（波形サムネイル）

```tsx
<RoadmapCardV2
  slug="ux-design-basic"
  title="ユーザー価値を届ける｜UXデザインのきほん"
  description="サービスの本質的な価値をユーザーに届けるための思考法"
  thumbnailUrl="/images/roadmap/ux-design.png"
  estimatedDuration="4-6"
  stepCount={32}
  shortTitle="UXデザイン"
  gradientPreset="ux-design"
  variant="white"
  orientation="vertical"
  thumbnailStyle="wave"
/>
```

### パターン3: 横型レイアウト（デスクトップのみ）

```tsx
<RoadmapCardV2
  slug="ui-visual"
  title="UIビジュアル"
  description="色・形・配置で視覚的な美しさと使いやすさを両立"
  thumbnailUrl="/images/roadmap/ui-visual.png"
  estimatedDuration="6~"
  stepCount={40}
  shortTitle="UIビジュアル"
  gradientPreset="ui-visual"
  variant="gradient"
  orientation="horizontal"
  thumbnailStyle="default"
/>
```

### パターン4: カスタムグラデーション

```tsx
<RoadmapCardV2
  slug="custom-roadmap"
  title="カスタムロードマップ"
  description="独自のグラデーションカラーを使用"
  estimatedDuration="3-5"
  stepCount={20}
  customGradient={{
    from: '#667eea',
    to: '#764ba2',
    overlay: undefined,
    customGradient: undefined
  }}
  variant="gradient"
/>
```

---

## レスポンシブ対応

カードは自動的にレスポンシブ対応します：

- **モバイル**: 縦型レイアウト（orientation問わず）、サムネイル180px
- **タブレット**: 縦型レイアウト、サムネイル220px
- **デスクトップ**: orientation指定通り、サムネイル280px（縦）/ 320-435px（横）

---

## デザイントークン

### 使用している色トークン

**gradient variant**:
- テキスト: `text-white`
- テキスト（説明）: `text-white/80`
- ボーダー: `border-white`, `border-white/10`, `border-white/30`

**white variant**:
- テキスト: `text-[#293525]`
- テキスト（説明）: `text-[#293525]/80`
- ボーダー: `border-[#293525]`, `border-[#293525]/10`, `border-[#293525]/30`

### 使用しているフォント

- バッジ: Noto Sans JP, Normal, 12px
- タイトル: Noto Sans JP, Bold, 16-20px, line-height 1.65
- 説明文: Noto Sans JP, Normal, 14-16px, line-height 1.8
- ステップ数: Noto Sans JP, Bold, 16px
- 期間: Noto Sans JP, Bold, 16px

### 余白・間隔

- カード内部padding: 16px (mobile), 20px (tablet), 24px (desktop)
- ヘッダー内gap: 8-10px
- フッター要素gap: 18px
- グリッド間隔: `gap-6` (24px)

---

## AIへの指示例

### ✅ 良い例

```
「ロードマップ一覧ページを作って。
RoadmapCardV2（.claude/design-system/components/RoadmapCardV2.md参照）を
グリッド表示で。モバイルは1列、タブレットは2列、デスクトップは3列。
データはuseRoadmaps()フックから取得して。」
```

→ AIが正確に理解・実装できる

### ❌ 悪い例

```
「ロードマップをカードで表示して」
```

→ どのコンポーネント？どのレイアウト？AIが推測してしまう

---

## 関連コンポーネント

- **TrainingCard**: トップページヒーロー用（3D回転アイキャッチ）
- **RoadmapCardCompact**: ダッシュボード・サイドバー用（小型版）
- **ContentCard**: 記事・レッスン用カード

---

## 注意事項

- ⚠️ タイトルは「｜」または「|」で分割すると改行される
- ⚠️ `wave` スタイルは専用のCSSマスク（`.roadmap-card-wave-mask`）が必要
- ⚠️ `orientation="horizontal"` でもモバイル・タブレットは縦型にフォールバック
- ⚠️ グラデーションは `@/styles/gradients` で一元管理（カスタム追加は要相談）

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-04-06 | 初版作成（RoadmapCardV2の仕様を文書化） |
