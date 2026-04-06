# TrainingCard

**最終更新**: 2026-04-06
**実装ファイル**: `src/components/top/TrainingCard.tsx`
**Figma**: [PRD🏠_topUI_newBONO2026 - トレーニングカード](https://www.figma.com/design/43rIPBQ9lm2b4DO2gElXCO/)

---

## 概要

トップページのヒーローセクションに表示される、ロードマップへの誘導カード。
3D回転するアイキャッチと大きな背景タイトルが特徴。

**WHY（なぜ）**: 視覚的インパクトでユーザーの興味を引き、ロードマップ詳細へ誘導する

**WHEN（いつ使う）**:
- ✅ トップページのヒーローセクション
- ✅ ロードマップ紹介LP
- ❌ 一覧ページ（代わりに RoadmapCardV2 を使用）
- ❌ ダッシュボード（代わりに RoadmapCardCompact を使用）

---

## デザイン仕様

### サイズ（レスポンシブ）
- **モバイル**: 300×407px
- **タブレット**: 350×476px
- **デスクトップ**: 420×570px

### レイアウト
- 角丸: 28px (mobile), 32px (tablet/desktop)
- シャドウ: `0px 1px 12px 0px rgba(0,0,0,0.08)`
- ホバー: `scale(1.05)` + `0px 8px 24px 0px rgba(0,0,0,0.16)`
- トランジション: `0.6s cubic-bezier(0.34, 1.56, 0.64, 1)` (バウンス)

### 構成要素
1. **左上ラベル**: カテゴリ（例: "情報設計"）
2. **右上ラベル**: "トレーニング" バッジ
3. **中央大タイトル**: 背景の大きな文字（例: "情報設計のきほん"）
4. **3D回転アイキャッチ**: 中央の立体的なカード
5. **下部説明文**: ロードマップの説明

---

## 使用方法

### 基本

```tsx
import TrainingCard, { TRAINING_CARDS_DATA } from '@/components/top/TrainingCard';

// 1枚だけ表示
<TrainingCard data={TRAINING_CARDS_DATA[0]} />

// 全カード表示（横スクロール）
<div className="flex gap-5 overflow-x-auto">
  {TRAINING_CARDS_DATA.map((cardData) => (
    <TrainingCard key={cardData.id} data={cardData} />
  ))}
</div>
```

### データ構造

```typescript
interface TrainingCardData {
  id: string;                    // 'info-arch', 'uiux-career', etc.
  category: string;              // 左上ラベル（例: "情報設計"）
  categoryColor: string;         // カテゴリ色（例: "#774000"）
  badge: string;                 // 右上ラベル（例: "トレーニング"）
  badgeOpacity: number;          // バッジの透明度
  backgroundColor: string;       // 背景色
  backgroundGradient?: string;   // 背景グラデーション（優先）
  largeTitle: string;            // 中央の大タイトル
  largeTitleColor: string;       // 大タイトルの色
  description: string;           // 下部説明文
  descriptionOpacity: number;    // 説明文の透明度
  eyecatchType: 'info-arch' | 'uiux-career' | 'ux-design' | 'ui-visual';
  roadmapSlug: string;           // リンク先（例: "information-architecture"）
  eyecatchPosition: {            // アイキャッチの配置
    left: number;
    top: number;
    width: number;
    height: number;
  };
}
```

### 固定データ（4枚）

現在、以下の4枚のカードデータが定義済み：

1. **UIUX転職** (`uiux-career`)
2. **ユーザー価値** (`ux-design`)
3. **情報設計のきほん** (`info-arch`)
4. **UIビジュアル** (`ui-visual`)

詳細は `src/components/top/TrainingCard.tsx:140-226` 参照

---

## レスポンシブ対応

カードは自動的にスケールします：
- モバイル: `scale(0.714)` (300/420)
- タブレット: `scale(0.833)` (350/420)
- デスクトップ: `scale(1.0)`

アイキャッチも連動してスケール。

---

## デザイントークン

### 使用している色トークン
- カテゴリ色: カスタムカラー（カードごとに異なる）
  - 情報設計: `#774000`
  - UIUX転職: `#5e6871`
  - ユーザー価値: `#525382`
  - UIビジュアル: `#08381d`

### 使用しているフォント
- カテゴリラベル: Noto Sans JP, Bold, 14-16px
- 大タイトル: Noto Sans JP, Bold, 54-96px, italic
- 説明文: Noto Sans JP, Bold, 10-12px

### 余白・間隔
- カード間gap: `gap-5` (20px)
- 内部余白: カスタム配置（absolute positioning）

---

## 実装パターン

### パターン1: トップページ（中央揃え + スクロール）

```tsx
<div className="absolute left-1/2 -translate-x-1/2 top-[616px] w-full">
  <div className="relative">
    {/* スクロール時フェードアウト（オプション） */}
    {isScrolledLeft && (
      <div className="absolute left-0 w-8 bg-gradient-to-r from-[#F9F9F7] ..." />
    )}

    <div className="overflow-x-auto scrollbar-hide">
      <div className="flex gap-5 px-48">
        {TRAINING_CARDS_DATA.map((cardData) => (
          <TrainingCard key={cardData.id} data={cardData} />
        ))}
      </div>
    </div>
  </div>
</div>
```

### パターン2: LP（グリッド配置）

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
  {TRAINING_CARDS_DATA.map((cardData) => (
    <TrainingCard key={cardData.id} data={cardData} />
  ))}
</div>
```

---

## AIへの指示例

### ✅ 良い例

```
「トップページのヒーローセクションを作って。
TrainingCard（.claude/design-system/components/TrainingCard.md参照）を
横スクロールで4枚並べて。デスクトップは中央揃え、左右192px余白。」
```

→ AIが正確に理解・実装できる

### ❌ 悪い例

```
「トップページにカード4枚並べて」
```

→ どのカード？どう並べる？AIが推測してしまう

---

## 関連コンポーネント

- **RoadmapCardV2**: ロードマップ一覧・詳細ページ用
- **RoadmapCardCompact**: ダッシュボード・サイドバー用
- **ContentCard**: 記事・レッスン用

---

## 注意事項

- ⚠️ `TRAINING_CARDS_DATA` は固定データ（動的生成不可）
- ⚠️ アイキャッチは個別コンポーネント（`InfoArchEyecatch`等）が必要
- ⚠️ 新しいカードを追加する場合は、アイキャッチコンポーネントも作成必須

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2026-04-06 | 初版作成（TrainingCardの仕様を文書化） |
