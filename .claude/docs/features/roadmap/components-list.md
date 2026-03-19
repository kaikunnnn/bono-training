# ロードマップ一覧ページ - コンポーネント仕様

**パス**: `/roadmaps`
**ステータス**: 実装中

---

## ページ全体のFigma

| 項目 | 内容 |
|------|------|
| Figma URL | - |
| node-id | - |

---

## コンポーネント一覧

### 1. RoadmapCard

ロードマップ一覧で使用するカードコンポーネント。

| 項目 | 内容 |
|------|------|
| Figma URL | https://www.figma.com/design/oNJwxeYUNaRWggDGAUi94D/product---new-BONO-ui-2026?node-id=900-39673 |
| node-id | 900-39673 |
| 実装ファイル | `src/components/roadmap/RoadmapCard.tsx` |
| プレビューページ | `/dev/roadmap-card` |
| ステータス | ✅ 実装完了 |

**Props**:
```typescript
interface RoadmapCardProps {
  slug: string;              // URLスラッグ（必須）
  title: string;             // タイトル（必須）
  description: string;       // 説明文（必須）
  thumbnailUrl?: string;     // サムネイル画像URL
  stepCount: number;         // ステップ数（必須）
  stepUnit?: string;         // ステップ単位（デフォルト: "ヶ月"）
  estimatedDuration: string; // 目安期間（必須、例: "1-2"）
  durationUnit?: string;     // 期間単位（デフォルト: "ヶ月"）
  gradientType?: GradientType; // グラデーションタイプ（デフォルト: "teal"）
  basePath?: string;         // リンク先ベースパス（デフォルト: "/roadmaps/"）
}

type GradientType = 'teal' | 'blue' | 'purple' | 'orange' | 'green' | 'pink';
```

**グラデーションバリエーション**:
| タイプ | From | To | 用途 |
|--------|------|-----|------|
| teal | #304750 | #5d5b65 | UIビジュアル基礎（デフォルト） |
| blue | #354a5f | #565a65 | UXデザイン系 |
| purple | #4a4058 | #5d5b65 | 上級・応用系 |
| orange | #5a4235 | #5d5960 | 実践・アウトプット系 |
| green | #3a4d42 | #585d5a | 初心者・入門系 |
| pink | #504050 | #605a62 | キャリア系 |

**デザイン特徴**:
- グラデーション背景（ロードマップタイプで色が変わる）
- 4px白ボーダー、24px角丸
- 特殊形状のサムネイルエリア（SVGクリップパス）
- ステップ数・目安期間の統計表示
- 全体がクリッカブル（リンク）
- ホバー時のスケールアニメーション

**備考**:
- サムネイルの特殊形状は`clipPath`で実装
- グラデーションは低彩度・ミディアムダークで統一感を維持

---

## 実装メモ

### 2025-03-16
- RoadmapCardコンポーネント実装完了
- 6種類のグラデーションバリエーション作成
- `/dev/roadmap-card`プレビューページ作成
