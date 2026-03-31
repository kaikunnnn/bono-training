# グラデーション実装の問題分析

**作成日**: 2026-03-31
**ステータス**: 調査完了 → 修正待ち

---

## 概要

ロードマップ関連のグラデーション実装に複数の問題があり、整理と統一が必要。

---

## 問題1: 複数の型定義が競合

### 現状

| ファイル | 型名 | 値の数 | 主な用途 |
|----------|------|--------|----------|
| `sanity-roadmap.ts` | `GradientPreset` | 7個 | Sanityデータ型、RoadmapHero |
| `RoadmapCard.tsx` | `GradientType` | 24個 | ロードマップカード（旧） |
| `RoadmapCardV2.tsx` | `GradientPreset` | 6個 | ロードマップカード（新） |

### 具体的な違い

```typescript
// sanity-roadmap.ts
type GradientPreset = "galaxy" | "infoarch" | "sunset" | "ocean" | "teal" | "rose" | "uivisual";

// RoadmapCard.tsx
type GradientType = 'teal' | 'uivisual' | 'blue' | 'purple' | 'orange' | 'green' | 'pink'
  | 'cyber' | 'galaxy' | 'neon' | 'sunset' | 'aurora' | 'thermal' | 'midnight'
  | 'emerald' | 'rose' | 'ocean' | 'lavender' | 'coral' | 'infoarch';

// RoadmapCardV2.tsx
type GradientPreset = 'galaxy' | 'infoarch' | 'sunset' | 'ocean' | 'teal' | 'rose';
// ※ 'uivisual' がない！
```

### 影響

- `uivisual` が `RoadmapCardV2` で未定義 → 使用するとundefinedエラー
- 同じ名前の型が複数存在 → 混乱、バグの原因

---

## 問題2: 同じプリセット名で異なる色定義

### `galaxy` の例

| ファイル | 色定義 |
|----------|--------|
| `sanity-roadmap.ts` | `#667eea → #764ba2` (鮮やかな紫) |
| `RoadmapCard.tsx` | `#35303f → #2d2a35` (暗いグレー紫) |
| `RoadmapCardV2.tsx` | `#211f38 → #66465f → #2e2734` (暗い紫/ピンク) |

### `teal` の例

| ファイル | 色定義 |
|----------|--------|
| `sanity-roadmap.ts` | `#14b8a6 → #06b6d4` (鮮やかなティール) |
| `RoadmapCard.tsx` | `#304750 → #5d5b65` (暗いティール/グレー) |
| `RoadmapCardV2.tsx` | `#304750 → #5d5b65` (暗いティール/グレー) |

### 影響

- 同じ `galaxy` でもコンポーネントによって全く違う色になる
- デザインの一貫性がない

---

## 問題3: Layout ヘッダーグラデーションが見えない

### 現状の構造

```
┌─────────────────────────────────────────────────────────┐
│ Layout outer div: bg-base (#F9F9F7) - 不透明な背景色    │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ グラデーション: fixed z-0, 全幅                     │ │
│ └─────────────────────────────────────────────────────┘ │
│ ┌─────────┐ ┌───────────────────────────────────────┐   │
│ │Sidebar  │ │ Main content: z-[1]                   │   │
│ │ z-10    │ │ → 不透明な背景でグラデーションを覆う   │   │
│ │         │ │                                        │   │
│ └─────────┘ └───────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

### スクリーンショットの状態

- **サイドバー上部**: グラデーション見える（ピンク/紫色）✓
- **メインコンテンツ**: 白/灰色の無地背景、グラデーション見えない ✗

### 原因

1. グラデーション: `fixed z-0`（最背面）
2. メインコンテンツ: `relative z-[1]`（グラデーションより上）
3. メインコンテンツの背景: `bg-base`（不透明な #F9F9F7）
4. → メインコンテンツの不透明背景がグラデーションを隠している

### 期待される動作

デスクトップでも、メインコンテンツ上部にグラデーションが透けて見えるべき

---

## 問題4: グラデーション使用箇所が分散

### 関連ファイル一覧

| ファイル | 役割 |
|----------|------|
| `src/types/sanity-roadmap.ts` | Sanity型定義 + `GRADIENT_PRESETS` |
| `src/components/roadmap/RoadmapCard.tsx` | カード（旧）+ `GRADIENTS` |
| `src/components/roadmap/RoadmapCardV2.tsx` | カード（新）+ `GRADIENTS` |
| `src/components/roadmap/detail/RoadmapHero.tsx` | ヒーロー（sanity-roadmap使用） |
| `src/hooks/useRoadmaps.ts` | データ取得 |
| `src/services/roadmapService.ts` | サービス層 |
| `src/pages/roadmaps/index.tsx` | 一覧ページ |
| `src/pages/dev/RoadmapGradientPreview.tsx` | 開発プレビュー |
| `src/pages/dev/RoadmapCardPreview.tsx` | カードプレビュー |
| `src/pages/dev/RoadmapCardV2Preview.tsx` | カードV2プレビュー |

---

## 推奨アクション

### Phase 1: 型定義の統一（優先度: 高）

1. **単一の真実の源を決定**
   - `src/types/gradients.ts` を新規作成
   - 全てのグラデーション型をここで定義

2. **統一する型定義**
   ```typescript
   // src/types/gradients.ts
   export type GradientPreset =
     | 'galaxy'
     | 'infoarch'
     | 'sunset'
     | 'ocean'
     | 'teal'
     | 'rose'
     | 'uivisual';  // tealのエイリアス

   export interface GradientDef {
     from: string;
     to: string;
     mid?: string;
   }

   export const GRADIENTS: Record<GradientPreset, GradientDef> = {
     // 統一された色定義
   };
   ```

3. **各コンポーネントを更新**
   - `RoadmapCard.tsx` → `src/types/gradients.ts` をimport
   - `RoadmapCardV2.tsx` → `src/types/gradients.ts` をimport
   - `sanity-roadmap.ts` → `src/types/gradients.ts` をimport

### Phase 2: 色の統一（優先度: 高）

1. **デザイナーに確認**
   - 各プリセットの正しい色を決定
   - Figmaとの整合性を確認

2. **暫定対応（デザイナー確認前）**
   - RoadmapCardV2 の色定義を基準とする（最新のデザイン）
   - または sanity-roadmap.ts の色定義を基準とする（Figma準拠と思われる）

### Phase 3: Layout グラデーション修正（優先度: 中）

1. **オプションA**: メインコンテンツ上部を半透明に
   - 上部 148px を `bg-transparent` または `bg-white/50` に

2. **オプションB**: グラデーションをメインコンテンツ内に移動
   - Layout のグラデーションを削除
   - 各ページで必要に応じてグラデーションを追加

3. **オプションC**: 現状維持（モバイルのみ効果）
   - デスクトップではサイドバー領域のみ
   - モバイルでは Pattern D でヘッダーに表示

---

## 確認用コマンド

```bash
# グラデーション関連ファイルを検索
grep -r "GradientPreset\|GradientType\|GRADIENTS" src/

# 色コードを検索（例: galaxy）
grep -r "#667eea\|#35303f\|#211f38" src/
```

---

## 次のステップ

1. [ ] このドキュメントをユーザーに共有
2. [ ] 優先度と方針を確認
3. [ ] Phase 1 から順に実装
