# レッスン完了可視化機能 - 璃奈フラワー 仕様書

## 📋 概要

レッスンの進捗を視覚的に表現するため、完了率に応じて成長する3D花「璃奈（りな）フラワー」を実装する。
ユーザーがレッスン内の記事を完了するごとに、花が段階的に成長し、完了した花はマイページで一覧表示される。

---

## 🎯 目的

- レッスンの進捗を直感的に理解できるようにする
- 学習の達成感を視覚的に提供する
- 複数のレッスン完了を促進するゲーミフィケーション要素

---

## 🌸 花の成長段階

### 5段階の成長モデル

| 段階 | 完了率 | 状態 | ビジュアル表現 |
|------|--------|------|---------------|
| 0 | 0% | 種 (Seed) | 土の中の小さな種 |
| 1 | 1-25% | 芽 (Sprout) | 地面から出た小さな芽 |
| 2 | 26-50% | 成長 (Growing) | 茎が伸び、葉が出る |
| 3 | 51-75% | つぼみ (Bud) | つぼみが形成される |
| 4 | 76-99% | 開花中 (Blooming) | 花びらが開き始める |
| 5 | 100% | 満開 (Full Bloom) | 完全に開いた美しい璃奈フラワー |

### 成長アニメーション

- 各段階への移行時：**スムーズな変形アニメーション（1-2秒）**
- リアルタイム更新：記事完了時に即座にアニメーション実行
- アイドル時：**微細な揺れアニメーション**（風に揺れる表現）

---

## 📊 完了率計算ロジック

### データ構造

```typescript
// Lesson の完了率
interface LessonProgress {
  lessonId: string;           // Sanity Lesson ID
  lessonTitle: string;        // レッスンタイトル
  totalArticles: number;      // レッスン内の総記事数
  completedArticles: number;  // 完了した記事数
  completionRate: number;     // 完了率 (0-100)
  growthStage: number;        // 成長段階 (0-5)
  lastUpdated: string;        // 最終更新日時 (ISO 8601)
}

// ユーザーの花コレクション
interface UserFlowerCollection {
  userId: string;
  flowers: LessonProgress[];  // 全レッスンの進捗
  totalFlowersCompleted: number; // 完成した花の数
}
```

### 完了率の計算式

```typescript
completionRate = (completedArticles / totalArticles) × 100

// 成長段階の判定
if (completionRate === 0) => growthStage = 0
else if (completionRate <= 25) => growthStage = 1
else if (completionRate <= 50) => growthStage = 2
else if (completionRate <= 75) => growthStage = 3
else if (completionRate < 100) => growthStage = 4
else if (completionRate === 100) => growthStage = 5
```

### データ取得方法

1. **Sanity CMSからレッスン構造を取得**
   - Lesson > Quest > Article の階層構造
   - 各レッスンに含まれる全記事数をカウント

2. **Supabaseから完了状態を取得**
   - `user_progress` テーブルから、ユーザーが完了した記事IDを取得
   - Article ID と照合して完了数を計算

3. **リアルタイム更新**
   - 記事完了時に `user_progress` テーブルに保存
   - 完了率を再計算し、成長段階を更新
   - UIに反映（アニメーション実行）

---

## 🗄️ データベース設計

### Supabase テーブル拡張

#### 既存テーブル活用
```sql
-- user_progress テーブル（既存）
-- 記事の完了状態を保存
CREATE TABLE user_progress (
  user_id UUID REFERENCES auth.users,
  task_id TEXT,  -- 記事IDとして使用
  status TEXT CHECK (status IN ('done', 'todo', 'in-progress')),
  completed_at TIMESTAMP,
  PRIMARY KEY (user_id, task_id)
);
```

#### 新規テーブル（オプション - キャッシュ用）
```sql
-- lesson_progress テーブル（新規）
-- レッスンごとの完了率をキャッシュ（パフォーマンス最適化用）
CREATE TABLE lesson_progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  lesson_id TEXT NOT NULL,           -- Sanity Lesson ID
  lesson_title TEXT,
  total_articles INTEGER DEFAULT 0,
  completed_articles INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 0.00,
  growth_stage INTEGER DEFAULT 0 CHECK (growth_stage BETWEEN 0 AND 5),
  last_updated TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, lesson_id)
);

-- インデックス
CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_completion ON lesson_progress(user_id, completion_rate);
```

---

## 🎨 UI/UX 設計

### プロフィールページ (`/profile`)

#### レイアウト構成

```
┌─────────────────────────────────────────┐
│  Profile Page                           │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ ユーザー情報                       │ │
│  │ - ID, Email, プラン               │ │
│  └───────────────────────────────────┘ │
│                                         │
│  ┌───────────────────────────────────┐ │
│  │ 🌸 璃奈フラワーコレクション       │ │
│  │                                   │ │
│  │  ┌─────┐  ┌─────┐  ┌─────┐     │ │
│  │  │ 🌼  │  │ 🌱  │  │ 🌷  │     │ │
│  │  │100% │  │ 45% │  │100% │     │ │
│  │  │UI   │  │UX   │  │情報 │     │ │
│  │  └─────┘  └─────┘  └─────┘     │ │
│  │                                   │ │
│  │  現在の進捗中: 2件                │ │
│  │  完了済み: 5件                    │ │
│  └───────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

#### 花の表示仕様

- **3Dビューポート**: 各花は200x250pxの3Dキャンバス内に表示
- **グリッドレイアウト**: レスポンシブグリッド（1-3列）
- **フィルター機能**:
  - 「すべて」「進行中」「完了」
- **ソート機能**:
  - 「最新」「完了率順」「レッスン名順」

#### インタラクション

- **ホバー**: 花が回転し、詳細情報をツールチップ表示
- **クリック**: レッスン詳細ページへ遷移
- **完了時**: 🎉 完了アニメーション + トースト通知

---

## 🛠️ 技術スタック

### 3D レンダリング

- **Three.js** (`^0.160.0`) - 3Dグラフィックスライブラリ
- **@react-three/fiber** (`^8.15.0`) - React向けThree.jsレンダラー
- **@react-three/drei** (`^9.92.0`) - 便利な3Dコンポーネント集

### アニメーション

- **@react-spring/three** - スプリングベースの3Dアニメーション
- **Framer Motion** (既存) - UI要素のアニメーション

### 状態管理

- **React Query** (既存) - サーバー状態管理
- **Zustand** (検討中) - クライアント状態管理

---

## 📦 コンポーネント設計

### ディレクトリ構造

```
src/
├── components/
│   └── flower/
│       ├── RinaFlower3D.tsx          # 3D花コンポーネント
│       ├── FlowerGrowthStages.tsx    # 成長段階の定義
│       ├── FlowerCard.tsx            # 花カード（外枠）
│       ├── FlowerCollection.tsx      # 花の一覧
│       └── FlowerCompletionModal.tsx # 完了時モーダル
├── hooks/
│   ├── useFlowerProgress.ts          # 花の進捗取得
│   └── useLessonCompletion.ts        # レッスン完了率計算
├── services/
│   └── flower/
│       ├── flowerProgress.ts         # 進捗計算ロジック
│       └── flowerStorage.ts          # Supabase連携
└── types/
    └── flower.ts                      # 型定義
```

### 主要コンポーネント

#### 1. `RinaFlower3D.tsx`

```typescript
interface RinaFlower3DProps {
  growthStage: number;        // 0-5
  animate?: boolean;          // アニメーション有効化
  onGrowthComplete?: () => void; // 成長完了コールバック
}

// 3D花のモデルをレンダリング
// 成長段階に応じてジオメトリを変更
```

#### 2. `FlowerCollection.tsx`

```typescript
interface FlowerCollectionProps {
  userId: string;
  filter?: 'all' | 'in-progress' | 'completed';
  sortBy?: 'latest' | 'completion' | 'name';
}

// ユーザーの全レッスンの花を一覧表示
```

#### 3. `useFlowerProgress.ts`

```typescript
const useFlowerProgress = (lessonId: string, userId: string) => {
  // Sanityからレッスン構造を取得
  // Supabaseから完了状態を取得
  // 完了率を計算
  // 成長段階を返す

  return {
    completionRate: number,
    growthStage: number,
    totalArticles: number,
    completedArticles: number,
    isLoading: boolean
  };
};
```

---

## 🎭 3Dモデル設計（プロトタイプ）

### 簡易ジオメトリモデル

各成長段階をプリミティブな形状で表現：

#### Stage 0: 種 (Seed)
```typescript
- SphereGeometry (r=0.1, 茶色)
- 土の表現として PlaneGeometry
```

#### Stage 1: 芽 (Sprout)
```typescript
- CylinderGeometry (茎、細い、緑)
- 2枚の小さな葉 (PlaneGeometry, 回転)
```

#### Stage 2: 成長 (Growing)
```typescript
- CylinderGeometry (茎、長い)
- 4枚の葉 (大きく)
```

#### Stage 3: つぼみ (Bud)
```typescript
- 茎 + 葉
- SphereGeometry (つぼみ、緑がかったピンク)
```

#### Stage 4: 開花中 (Blooming)
```typescript
- 茎 + 葉
- 花びら (ConeGeometry × 5-6枚、部分的に開く)
```

#### Stage 5: 満開 (Full Bloom)
```typescript
- 茎 + 葉
- 花びら (完全に開いた状態)
- 中心部 (SphereGeometry、黄色)
- パーティクルエフェクト（キラキラ）
```

### カラーパレット

```typescript
const RINA_FLOWER_COLORS = {
  seed: '#8B4513',      // 茶色
  stem: '#2D5016',      // 濃緑
  leaf: '#4CAF50',      // 緑
  bud: '#FFB6C1',       // ライトピンク
  petal: '#FF69B4',     // ホットピンク（璃奈カラー）
  center: '#FFD700',    // ゴールド
  sparkle: '#FFFFFF'    // 白（パーティクル）
};
```

---

## 🚀 実装フェーズ（プロトタイプ）

### Phase 1: 基本セットアップ ✅
- [x] Three.js / React Three Fiber インストール
- [x] 基本的な3Dシーンのセットアップ
- [x] テスト用の簡単な形状表示

### Phase 2: 花モデル作成 ✅
- [ ] 5段階の花モデルを作成
- [ ] 成長段階間のアニメーション
- [ ] カメラ・ライティング調整

### Phase 3: データ連携 ✅
- [ ] Sanityからレッスン構造取得
- [ ] Supabaseから完了状態取得
- [ ] 完了率計算ロジック実装
- [ ] `lesson_progress` テーブル作成（オプション）

### Phase 4: UI統合 ✅
- [ ] プロフィールページに花コレクション追加
- [ ] FlowerCard コンポーネント作成
- [ ] フィルター・ソート機能

### Phase 5: リアルタイム更新 ✅
- [ ] 記事完了時のイベントフック
- [ ] 成長アニメーショントリガー
- [ ] 完了時の祝福エフェクト

### Phase 6: テスト・調整 ✅
- [ ] 動作確認
- [ ] パフォーマンス最適化
- [ ] レスポンシブ対応確認

---

## 🔧 今後の拡張可能性

### 将来的な機能追加案

1. **花の種類の多様化**
   - レッスンカテゴリーごとに異なる花
   - UI → バラ、UX → ヒマワリ、情報設計 → チューリップ

2. **花壇（Garden）ビュー**
   - 完了した花を一つの花壇に配置
   - 3D空間を歩き回れるビュー

3. **シェア機能**
   - SNSに花の画像をシェア
   - 完了証明書の自動生成

4. **季節イベント**
   - 特定期間限定の特別な花
   - イベント花のコレクション

5. **マルチプレイヤー要素**
   - 他のユーザーの花壇を訪問
   - 花の交換・ギフト機能

---

## 📝 技術的考慮事項

### パフォーマンス

- **インスタンシング**: 同じ花モデルの再利用
- **LOD (Level of Detail)**: 遠くの花は簡略化
- **レイジーローディング**: 必要な花だけロード

### アクセシビリティ

- 3Dが表示できない環境用のフォールバック
- 完了率の数値表示も併記
- スクリーンリーダー対応

### セキュリティ

- ユーザーは自分の進捗のみ閲覧・編集可能
- RLS (Row Level Security) の設定

---

## 📅 タイムライン（プロトタイプ）

- **Day 1**: 環境セットアップ + 基本3Dシーン
- **Day 2**: 花モデル作成 + アニメーション
- **Day 3**: データ連携 + 完了率計算
- **Day 4**: プロフィールページ統合
- **Day 5**: リアルタイム更新 + テスト

---

## ✅ 成功指標

プロトタイプの評価基準：

1. ✅ 5段階すべての花が正しく表示される
2. ✅ 記事完了時に花が成長する
3. ✅ プロフィールページで花の一覧が見られる
4. ✅ 完了率が正確に計算される
5. ✅ アニメーションがスムーズに動作する
6. ✅ レスポンシブデザインが機能する

---

## 🔗 参考リソース

- [Three.js Documentation](https://threejs.org/docs/)
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- [React Three Drei](https://github.com/pmndrs/drei)
- [Supabase Docs](https://supabase.com/docs)

---

**作成日**: 2025-11-18
**バージョン**: 1.0.0 (Prototype)
**ステータス**: Draft → Review → **Implementation**
