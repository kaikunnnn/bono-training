# 実装計画（更新版）

**最終仕様:** [final-specification.md](./final-specification.md)
**執筆フロー:** [obsidian-workflow.md](./obsidian-workflow.md)
**画像最適化:** [image-optimization.md](./image-optimization.md)

---

## フェーズ0: 環境準備（0.5時間）

### 0.1 画像最適化スクリプト
- [ ] `npm install --save-dev sharp`
- [ ] `scripts/optimize-images.js` 作成
- [ ] `package.json` にコマンド追加
- [ ] 動作テスト

### 0.2 Obsidianセットアップドキュメント
- [ ] セットアップ手順の確認
- [ ] テンプレートファイル作成

---

## フェーズ1: データ基盤の構築（2-3時間）

### 1.1 型定義とカテゴリ設定
- [ ] `src/types/guide.ts` - Guide型の定義
- [ ] `src/lib/guideCategories.ts` - カテゴリ定義

### 1.2 データローダー
- [ ] `src/lib/guideLoader.ts` - Markdownファイルの読み込み
  - Frontmatterパース機能
  - slug自動抽出
  - カテゴリ別フィルター
- [ ] `src/hooks/useGuides.ts` - React Query hooks
  - `useGuides()`
  - `useGuide(slug)`
  - `useGuidesByCategory(category)`

### 1.3 サンプルコンテンツ作成
- [ ] `content/guide/career/job-change-roadmap/index.md`
- [ ] `content/guide/learning/good-bad-study-methods/index.md`
- [ ] `content/guide/industry/ai-and-designers/index.md`
- [ ] サンプル画像の配置と最適化

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

---

## ⏸️ フェーズ4.5: デザイン確認と相談（ユーザー確認待ち）

**📋 実装後、ここで一旦停止してユーザーと相談**

### 確認事項

#### 1. 記事詳細ページのデザイン
- [ ] 現在の実装をプレビュー確認
- [ ] ユーザーからデザイン案を共有
- [ ] デザイン案と実装の比較
- [ ] 調整が必要な箇所を特定

#### 2. リッチテキストのスタイリング
- [ ] Markdownレンダリングの現状確認
  - 見出し（h1, h2, h3）
  - 段落、リスト
  - コードブロック
  - 画像
  - リンク
  - 引用
  - テーブル
- [ ] ユーザーが希望するスタイルを相談
- [ ] 調整方針を決定

#### 3. 調整タスクの作成
- [ ] デザイン調整タスクリスト作成
- [ ] スタイリング調整タスクリスト作成
- [ ] 優先度の決定

**⚠️ このフェーズ完了後、フェーズ5以降を再開**

---

## フェーズ5: デザイン調整（デザイン確認後に実施）

**※ フェーズ4.5での相談内容に基づいて調整**

### 5.1 記事詳細ページのデザイン調整
- [ ] ヘッダーレイアウト調整
- [ ] 本文エリアのスタイル調整
- [ ] サイドバー（目次）のデザイン調整
- [ ] 関連記事セクションの調整

### 5.2 リッチテキストのスタイリング調整
- [ ] 見出しスタイル
- [ ] 段落・行間
- [ ] リストスタイル
- [ ] コードブロックのシンタックスハイライト
- [ ] 画像の表示スタイル
- [ ] リンクスタイル
- [ ] 引用・テーブルのスタイル

### 5.3 レスポンシブ対応
- [ ] モバイル表示の最適化
- [ ] タブレット表示の調整

### 5.4 アクセシビリティ
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

## 見積工数（更新版）

| フェーズ | 工数 | タイミング |
|---------|------|----------|
| フェーズ0: 環境準備 | 0.5時間 | 今すぐ |
| フェーズ1: データ基盤 | 2-3時間 | 今すぐ |
| フェーズ2: UIコンポーネント | 3-4時間 | 今すぐ |
| フェーズ3: ページ実装 | 2-3時間 | 今すぐ |
| フェーズ4: ルーティング | 0.5時間 | 今すぐ |
| **⏸️ フェーズ4.5: デザイン確認** | **ユーザー確認** | **実装後に相談** |
| フェーズ5: デザイン調整 | 1-3時間 | 相談後 |
| フェーズ6: SEO対応 | 1時間 | 相談後 |
| フェーズ7: テスト | 1時間 | 相談後 |
| フェーズ8: ドキュメント整備 | 0.5時間 | 相談後 |
| **第1段階合計（相談前）** | **8.5-11.5時間** | |
| **第2段階合計（相談後）** | **3.5-5.5時間** | |
| **総合計** | **12-17時間** | |

---

## 🎯 実装フロー

### 第1段階：基本実装（今すぐ開始）

1. ✅ 仕様確定（完了）
2. ✅ ワークフロー設計（完了）
3. ✅ 画像最適化設計（完了）
4. ⏭️ **フェーズ0-4: 基本機能実装**
   - データ基盤
   - UIコンポーネント
   - ページ実装
   - ルーティング
   - **プレビュー環境で動作確認**

### ⏸️ 相談タイム

5. 🎨 **フェーズ4.5: デザイン確認と相談**
   - 実装したページをプレビュー
   - 記事詳細ページのデザイン案を共有
   - リッチテキストのスタイリング相談
   - 調整方針を決定

### 第2段階：デザイン調整と仕上げ（相談後）

6. 🎨 **フェーズ5-8: デザイン調整と仕上げ**
   - デザイン反映
   - スタイリング調整
   - SEO対応
   - テスト & デプロイ

---

## 📚 関連ドキュメント

- **[final-specification.md](./final-specification.md)** - 最終仕様書
- **[obsidian-workflow.md](./obsidian-workflow.md)** - 執筆ワークフロー
- **[image-optimization.md](./image-optimization.md)** - 画像最適化
