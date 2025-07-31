# テスト用トレーニングコンテンツ作成プロジェクト

## 概要

既存の情報設計とUXデザインカテゴリに、新しいダミーコンテンツを作成してルーティングとデータ表示のテストを行う。

## 目的

- `/training`、`/training/:trainingSlug`、`/training/:trainingSlug/:taskSlug` のルーティング動作確認
- トレーニング一覧、詳細、タスク詳細の表示機能テスト
- プレミアムコンテンツ制御の動作確認
- Edge Functionとローカルコンテンツ取得の連携テスト

## 作成するトレーニング

### 1. 情報設計カテゴリ
- **トレーニング名**: `ec-product-catalog`
- **タイトル**: "ECサイト商品カタログをデザインしよう"
- **タスク数**: 3つ

### 2. UXデザインカテゴリ
- **トレーニング名**: `mobile-banking-ux`
- **タイトル**: "モバイルバンキングアプリのUX改善"
- **タスク数**: 3つ

## 実装チェックリスト

- [ ] ECサイト商品カタログトレーニング
  - [ ] `content/training/ec-product-catalog/index.md`
  - [ ] `content/training/ec-product-catalog/tasks/requirements-analysis/content.md`
  - [ ] `content/training/ec-product-catalog/tasks/information-architecture/content.md`
  - [ ] `content/training/ec-product-catalog/tasks/ui-wireframe/content.md`

- [ ] モバイルバンキングUXトレーニング
  - [ ] `content/training/mobile-banking-ux/index.md`
  - [ ] `content/training/mobile-banking-ux/tasks/user-research/content.md`
  - [ ] `content/training/mobile-banking-ux/tasks/persona-journey/content.md`
  - [ ] `content/training/mobile-banking-ux/tasks/prototype-testing/content.md`

## テスト観点

1. **トレーニング一覧表示** (`/training`)
   - 4つのトレーニングカードが表示される
   - カテゴリ別グループ化が機能する
   - 各カードのリンクが動作する

2. **トレーニング詳細表示** (`/training/:trainingSlug`)
   - メタデータが正しく表示される
   - タスク一覧が表示される
   - タスクナビゲーションが動作する

3. **タスク詳細表示** (`/training/:trainingSlug/:taskSlug`)
   - コンテンツが正しくレンダリングされる
   - プレミアムコンテンツ制御が動作する
   - 前後タスクナビゲーションが動作する

## 実装後の確認手順

1. `/training` にアクセスして新しいトレーニングが表示されることを確認
2. 各トレーニングカードをクリックして詳細ページに遷移することを確認
3. 各タスクをクリックしてタスク詳細ページが表示されることを確認
4. プレミアムコンテンツのゲート機能が動作することを確認
5. Edge Functionでの取得とローカルフォールバックが動作することを確認