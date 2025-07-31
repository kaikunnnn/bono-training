# テスト用トレーニングコンテンツ実装ガイド

## 実装手順

### 1. ファイル作成順序

#### Phase 1: ECサイト商品カタログトレーニング
```bash
# 1. メインディレクトリとindex.md
content/training/ec-product-catalog/
└── index.md

# 2. タスクディレクトリとコンテンツ
content/training/ec-product-catalog/tasks/
├── requirements-analysis/
│   └── content.md
├── information-architecture/
│   └── content.md
└── ui-wireframe/
    └── content.md
```

#### Phase 2: モバイルバンキングUXトレーニング
```bash
# 1. メインディレクトリとindex.md
content/training/mobile-banking-ux/
└── index.md

# 2. タスクディレクトリとコンテンツ
content/training/mobile-banking-ux/tasks/
├── user-research/
│   └── content.md
├── persona-journey/
│   └── content.md
└── prototype-testing/
    └── content.md
```

### 2. 各ファイルの実装内容

#### ECサイト商品カタログ (`ec-product-catalog`)

**index.md**
- フロントマター: overview.mdの設定通り
- コンテンツ: トレーニング概要、学習目標、想定シナリオ

**tasks/requirements-analysis/content.md**
- フロントマター: task-requirements-analysis.mdの設定通り
- 無料コンテンツ: ユーザーリサーチ基礎、リサーチ手法
- プレミアムマーカー: `<!-- PREMIUM_CONTENT_START -->`
- プレミアムコンテンツ: 実践ワークショップ、ケーススタディ

**tasks/information-architecture/content.md**
- フロントマター: task-information-architecture.mdの設定通り
- 全体がプレミアムコンテンツ（`isPremium: true`）
- コンテンツ全体に`<!-- PREMIUM_CONTENT_START -->`を配置

**tasks/ui-wireframe/content.md**
- フロントマター: task-ui-wireframe.mdの設定通り
- 無料コンテンツ: ワイヤーフレーム基礎、レスポンシブ設計
- プレミアムマーカー: `<!-- PREMIUM_CONTENT_START -->`
- プレミアムコンテンツ: 高度なインタラクション、実装連携

#### モバイルバンキングUX (`mobile-banking-ux`)

**index.md**
- フロントマター: overview.mdの設定通り
- コンテンツ: トレーニング概要、金融アプリ特有の課題

**tasks/user-research/content.md**
- フロントマター: task-user-research.mdの設定通り
- 無料コンテンツ: 金融アプリユーザー特徴、リサーチ手法
- プレミアムマーカー: `<!-- PREMIUM_CONTENT_START -->`
- プレミアムコンテンツ: 実践的リサーチ設計、データ分析

**tasks/persona-journey/content.md**
- フロントマター: task-persona-journey.mdの設定通り
- 全体がプレミアムコンテンツ（`isPremium: true`）
- コンテンツ全体に`<!-- PREMIUM_CONTENT_START -->`を配置

**tasks/prototype-testing/content.md**
- フロントマター: task-prototype-testing.mdの設定通り
- 無料コンテンツ: プロトタイプ設計、テスト設計基礎
- プレミアムマーカー: `<!-- PREMIUM_CONTENT_START -->`
- プレミアムコンテンツ: 高度な技術、結果分析、改善提案

### 3. テスト検証項目

#### ルーティングテスト
- [ ] `/training` - 4つのトレーニングカードが表示される
- [ ] `/training/ec-product-catalog` - ECトレーニング詳細が表示される
- [ ] `/training/mobile-banking-ux` - UXトレーニング詳細が表示される
- [ ] 各タスクページが正常に表示される

#### データ取得テスト
- [ ] Edge Function経由でのコンテンツ取得
- [ ] ローカルフォールバック機能
- [ ] フロントマター解析
- [ ] プレミアムコンテンツ制御

#### UI表示テスト
- [ ] トレーニングカードのデザイン
- [ ] カテゴリ別グループ化
- [ ] 難易度・所要時間の表示
- [ ] プレミアムバッジの表示

#### プレミアムコンテンツテスト
- [ ] `<!-- PREMIUM_CONTENT_START -->`マーカーの動作
- [ ] `isPremium: true`タスクの全体制御
- [ ] 無料ユーザーでのゲートバナー表示
- [ ] 有料ユーザーでの全コンテンツ表示

### 4. 実装後の確認フロー

1. **ローカル環境での動作確認**
   - `npm run dev`でローカルサーバー起動
   - 各ページにアクセスして表示確認

2. **Edge Function動作確認**
   - Supabase Storageへのコンテンツアップロード
   - `get-training-list`関数の動作確認
   - `get-training-detail`関数の動作確認

3. **プレミアムコンテンツ制御確認**
   - 無料アカウントでのアクセス
   - 有料アカウントでのアクセス
   - ゲートバナーの表示確認

4. **レスポンシブ確認**
   - デスクトップ表示
   - タブレット表示
   - モバイル表示

### 5. トラブルシューティング

#### よくある問題と対処法

**フロントマター解析エラー**
- YAML形式の記法確認
- インデントと構文の確認
- Zodスキーマとの整合性確認

**プレミアムマーカー未動作**
- `<!-- PREMIUM_CONTENT_START -->`の正確な記述
- 前後の改行確認
- content-splitter.tsの処理確認

**ルーティングエラー**
- App.tsxのルート設定確認
- ファイルパスとslugの整合性確認
- 404フォールバック設定確認

### 6. パフォーマンス確認

- [ ] ページ読み込み速度
- [ ] Edge Function応答時間
- [ ] 画像読み込み最適化
- [ ] キャッシュ効果確認

この実装ガイドに従って、段階的にテスト用コンテンツを作成し、各機能の動作確認を確実に行うことができます。