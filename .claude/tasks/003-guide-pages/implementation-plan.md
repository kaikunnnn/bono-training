# 実装計画

## フェーズ1: データ基盤の構築

### 1.1 型定義とカテゴリ設定
- [ ] `src/types/guide.ts` - Guide型の定義
- [ ] `src/lib/guideCategories.ts` - カテゴリ定義

### 1.2 データローダー
- [ ] `src/lib/guideLoader.ts` - Markdownファイルの読み込み
- [ ] `src/hooks/useGuides.ts` - React Query hooks

### 1.3 サンプルコンテンツ作成
- [ ] `content/guide/career/job-change-roadmap/index.md`
- [ ] `content/guide/learning/good-bad-study-methods/index.md`
- [ ] `content/guide/industry/ai-and-designers/index.md`

## フェーズ2: UI コンポーネント

### 2.1 共通コンポーネント
- [ ] `src/components/guide/GuideCard.tsx` - ガイドカード
- [ ] `src/components/guide/GuideGrid.tsx` - グリッド表示
- [ ] `src/components/guide/CategoryBadge.tsx` - カテゴリバッジ
- [ ] `src/components/guide/GuideLayout.tsx` - レイアウト

### 2.2 一覧ページ用コンポーネント
- [ ] `src/components/guide/GuideHero.tsx` - ヒーローセクション
- [ ] `src/components/guide/CategorySection.tsx` - カテゴリセクション
- [ ] `src/components/guide/CategoryFilter.tsx` - フィルター

### 2.3 詳細ページ用コンポーネント
- [ ] `src/components/guide/GuideHeader.tsx` - 記事ヘッダー
- [ ] `src/components/guide/GuideContent.tsx` - Markdownレンダラー
- [ ] `src/components/guide/TableOfContents.tsx` - 目次
- [ ] `src/components/guide/RelatedGuides.tsx` - 関連記事

## フェーズ3: ページ実装

### 3.1 ガイド一覧ページ
- [ ] `src/pages/Guide/index.tsx` - `/guide`
  - カテゴリ別セクション表示
  - フィルター機能
  - ローディング/エラー状態

### 3.2 ガイド詳細ページ
- [ ] `src/pages/Guide/GuideDetail.tsx` - `/guide/:slug`
  - Markdownレンダリング
  - 目次生成
  - 関連記事表示
  - パンくずリスト

### 3.3 カテゴリページ（オプション）
- [ ] `src/pages/Guide/Category.tsx` - `/guide/category/:category`
  - 特定カテゴリの記事一覧

## フェーズ4: ルーティング設定

### 4.1 ルート追加
- [ ] `src/App.tsx` にルート追加
  ```tsx
  <Route path="/guide" element={<GuidePage />} />
  <Route path="/guide/:slug" element={<GuideDetailPage />} />
  <Route path="/guide/category/:category" element={<CategoryPage />} />
  ```

### 4.2 ナビゲーション更新
- [ ] グローバルナビゲーションに「ガイド」リンク追加

## フェーズ5: スタイリング

### 5.1 レスポンシブ対応
- [ ] モバイル表示の最適化
- [ ] タブレット表示の調整

### 5.2 アクセシビリティ
- [ ] キーボードナビゲーション
- [ ] スクリーンリーダー対応
- [ ] カラーコントラスト確認

## フェーズ6: SEO対応

### 6.1 メタタグ
- [ ] `<title>` タグの動的設定
- [ ] `<meta description>` の設定
- [ ] OGP設定

### 6.2 構造化データ
- [ ] JSON-LD の追加（Article schema）

## フェーズ7: テストとデプロイ

### 7.1 テスト
- [ ] 各ページの動作確認
- [ ] レスポンシブ確認
- [ ] パフォーマンステスト

### 7.2 ドキュメント
- [ ] README更新
- [ ] コンテンツ追加方法のドキュメント作成

## 参考実装

既存の `/training` の実装を参考にする：
- `src/pages/Training/index.tsx`
- `src/hooks/useTrainingCache.ts`
- `src/lib/trainingCache.ts`
- `content/training/` のデータ構造

## 見積工数

| フェーズ | 工数 |
|---------|------|
| フェーズ1: データ基盤 | 2-3時間 |
| フェーズ2: UIコンポーネント | 3-4時間 |
| フェーズ3: ページ実装 | 2-3時間 |
| フェーズ4: ルーティング | 0.5時間 |
| フェーズ5: スタイリング | 1-2時間 |
| フェーズ6: SEO対応 | 1時間 |
| フェーズ7: テスト | 1時間 |
| **合計** | **10-15.5時間** |
