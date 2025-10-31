# 詳細実装計画（ステップバイステップ）

**目的:** 確実に実装できるよう、各タスクを15-30分の細かいステップに分割

---

## フェーズ0: 環境準備（0.5時間）

### ステップ0.1: 画像最適化パッケージのインストール
- [ ] `npm install --save-dev sharp` 実行
- [ ] インストール成功を確認
- [ ] `package.json` に追加されたことを確認

### ステップ0.2: scriptsディレクトリ作成
- [ ] `scripts/` ディレクトリを作成
- [ ] `.gitignore` に不要なものがないか確認

### ステップ0.3: 画像最適化スクリプト作成
- [ ] `scripts/optimize-images.js` 作成
- [ ] Sharp import とヘルパー関数実装
- [ ] 画像検索ロジック実装
- [ ] 画像圧縮ロジック実装

### ステップ0.4: package.jsonにコマンド追加
- [ ] `"optimize-images": "node scripts/optimize-images.js"` 追加
- [ ] コマンド実行テスト（ダミー画像で）

### ステップ0.5: テンプレートファイル作成
- [ ] `content/guide/_templates/article-template.md` 作成
- [ ] Frontmatterテンプレート記述

**✅ 完了条件:** `npm run optimize-images` が動作する

---

## フェーズ1: データ基盤の構築（2-3時間）

### ステップ1.1: 型定義ファイル作成
- [ ] `src/types/guide.ts` ファイル作成
- [ ] `GuideCategory` 型定義
- [ ] `Guide` インターフェース定義
- [ ] `GuideCategoryInfo` インターフェース定義
- [ ] エクスポート確認

**テスト:** TypeScriptエラーがないか確認

### ステップ1.2: カテゴリ定義ファイル作成
- [ ] `src/lib/guideCategories.ts` ファイル作成
- [ ] `GUIDE_CATEGORIES` 配列定義（4カテゴリ）
- [ ] エクスポート確認
- [ ] 型チェックでエラーがないか確認

### ステップ1.3: データローダーの骨組み作成
- [ ] `src/lib/guideLoader.ts` ファイル作成
- [ ] 必要なimport追加（js-yaml, fs, pathなど）
- [ ] `loadGuides()` 関数の空実装
- [ ] `loadGuide(slug)` 関数の空実装
- [ ] `loadGuidesByCategory(category)` 関数の空実装

### ステップ1.4: Frontmatterパース関数実装
- [ ] `parseFrontmatter(content)` 関数実装
- [ ] 正規表現でFrontmatter抽出
- [ ] js-yamlでパース
- [ ] エラーハンドリング追加
- [ ] テスト用サンプルで動作確認

### ステップ1.5: slug抽出関数実装
- [ ] `extractSlugFromPath(path)` 関数実装
- [ ] パスから正しくslugを抽出
- [ ] エッジケースのテスト

### ステップ1.6: loadGuides()関数の実装
- [ ] `import.meta.glob()` で Markdown読み込み
- [ ] 各ファイルをパースしてGuide配列作成
- [ ] order_indexでソート
- [ ] 動作確認（console.logで確認）

### ステップ1.7: loadGuide(slug)関数の実装
- [ ] `loadGuides()` を呼び出し
- [ ] slugでフィルター
- [ ] 見つからない場合はnullを返す
- [ ] 動作確認

### ステップ1.8: loadGuidesByCategory()関数の実装
- [ ] `loadGuides()` を呼び出し
- [ ] categoryでフィルター
- [ ] 動作確認

### ステップ1.9: React Query hooks作成
- [ ] `src/hooks/useGuides.ts` ファイル作成
- [ ] 必要なimport追加
- [ ] `useGuides()` hook実装
- [ ] `useGuide(slug)` hook実装
- [ ] `useGuidesByCategory(category)` hook実装
- [ ] エクスポート確認

### ステップ1.10: サンプルコンテンツ1作成（キャリア）
- [ ] `content/guide/career/job-change-roadmap/` ディレクトリ作成
- [ ] `index.md` 作成
- [ ] Frontmatter記述（完全版）
- [ ] 本文サンプル記述（500文字程度）
- [ ] `assets/` フォルダ作成
- [ ] ダミー画像配置（hero.jpg）

### ステップ1.11: サンプルコンテンツ2作成（学習方法）
- [ ] `content/guide/learning/good-bad-study-methods/` ディレクトリ作成
- [ ] `index.md` 作成
- [ ] Frontmatter + 本文記述
- [ ] ダミー画像配置

### ステップ1.12: サンプルコンテンツ3作成（業界動向）
- [ ] `content/guide/industry/ai-and-designers/` ディレクトリ作成
- [ ] `index.md` 作成
- [ ] Frontmatter + 本文記述
- [ ] ダミー画像配置

### ステップ1.13: データローダーの動作確認
- [ ] 一時的なテストページ作成
- [ ] `useGuides()` を使ってデータ取得
- [ ] コンソールでデータ確認
- [ ] 3記事が正しく読み込まれるか確認

**✅ 完了条件:** サンプル記事3本がReact Queryで取得できる

---

## フェーズ2: UIコンポーネント（3-4時間）

### ステップ2.1: GuideLayoutコンポーネント作成
- [ ] `src/components/guide/GuideLayout.tsx` 作成
- [ ] 基本的なレイアウト構造実装
- [ ] 既存のTrainingLayoutを参考に
- [ ] エクスポート確認

### ステップ2.2: CategoryBadgeコンポーネント作成
- [ ] `src/components/guide/CategoryBadge.tsx` 作成
- [ ] カテゴリに応じた色分け実装
- [ ] アイコン表示
- [ ] Tailwind CSSでスタイリング
- [ ] Storybookで確認（またはテストページ）

### ステップ2.3: GuideCardコンポーネント作成
- [ ] `src/components/guide/GuideCard.tsx` 作成
- [ ] サムネイル表示
- [ ] タイトル、説明文表示
- [ ] CategoryBadge組み込み
- [ ] メタ情報（読了時間、公開日）表示
- [ ] リンク機能
- [ ] ホバー効果

### ステップ2.4: GuideCardのスタイリング調整
- [ ] レスポンシブ対応
- [ ] カード間の余白調整
- [ ] 画像のアスペクト比固定
- [ ] テキストの行数制限（overflow-ellipsis）

### ステップ2.5: GuideGridコンポーネント作成
- [ ] `src/components/guide/GuideGrid.tsx` 作成
- [ ] グリッドレイアウト実装（3列）
- [ ] GuideCardを使用
- [ ] レスポンシブ（モバイル1列、タブレット2列、デスクトップ3列）
- [ ] ローディング状態
- [ ] 空状態

### ステップ2.6: GuideHeroコンポーネント作成
- [ ] `src/components/guide/GuideHero.tsx` 作成
- [ ] タイトル、説明文表示
- [ ] 既存のTrainingHeroを参考
- [ ] スタイリング

### ステップ2.7: CategorySectionコンポーネント作成
- [ ] `src/components/guide/CategorySection.tsx` 作成
- [ ] セクションヘッダー
- [ ] GuideGrid組み込み
- [ ] 外部リンク（オプション）
- [ ] Separator

### ステップ2.8: CategoryFilterコンポーネント作成（オプション）
- [ ] `src/components/guide/CategoryFilter.tsx` 作成
- [ ] タブまたはボタンでカテゴリ切り替え
- [ ] アクティブ状態のスタイリング
- [ ] イベントハンドラー

### ステップ2.9: GuideHeaderコンポーネント作成
- [ ] `src/components/guide/GuideHeader.tsx` 作成
- [ ] パンくずリスト
- [ ] CategoryBadge表示
- [ ] タイトル表示
- [ ] メタ情報（著者、公開日、読了時間）
- [ ] スタイリング

### ステップ2.10: GuideContentコンポーネント作成
- [ ] `src/components/guide/GuideContent.tsx` 作成
- [ ] react-markdown組み込み
- [ ] rehype-highlight（シンタックスハイライト）
- [ ] rehype-raw（HTML対応）
- [ ] remark-gfm（GitHub Flavored Markdown）
- [ ] カスタムコンポーネント設定

### ステップ2.11: GuideContentのスタイリング
- [ ] 見出しスタイル（h1, h2, h3, h4）
- [ ] 段落スタイル
- [ ] リストスタイル
- [ ] コードブロックスタイル
- [ ] 画像スタイル
- [ ] リンクスタイル
- [ ] 引用スタイル
- [ ] テーブルスタイル
- [ ] Tailwind Typography適用

### ステップ2.12: TableOfContentsコンポーネント作成
- [ ] `src/components/guide/TableOfContents.tsx` 作成
- [ ] Markdownから見出し抽出
- [ ] リンククリックでスムーススクロール
- [ ] アクティブセクションのハイライト
- [ ] スティッキーポジション

### ステップ2.13: RelatedGuidesコンポーネント作成
- [ ] `src/components/guide/RelatedGuides.tsx` 作成
- [ ] relatedGuidesからslug配列取得
- [ ] 各ガイドデータを取得
- [ ] GuideCardで表示（小さいサイズ）
- [ ] グリッドレイアウト（3列）

### ステップ2.14: コンポーネントのindex.ts作成
- [ ] `src/components/guide/index.ts` 作成
- [ ] すべてのコンポーネントをエクスポート
- [ ] インポートの簡略化

**✅ 完了条件:** すべてのコンポーネントが独立して動作する

---

## フェーズ3: ページ実装（2-3時間）

### ステップ3.1: ガイド一覧ページの骨組み作成
- [ ] `src/pages/Guide/index.tsx` 作成
- [ ] 基本的なコンポーネント構造
- [ ] GuideLayout使用
- [ ] useGuides() hook使用

### ステップ3.2: ガイド一覧ページのローディング状態実装
- [ ] Skeletonコンポーネント作成
- [ ] isLoadingの分岐処理
- [ ] 適切なSkeletonデザイン

### ステップ3.3: ガイド一覧ページのエラー状態実装
- [ ] エラーメッセージ表示
- [ ] 再試行ボタン（オプション）

### ステップ3.4: ガイド一覧ページのカテゴリ別表示実装
- [ ] useMemでカテゴリ別にグルーピング
- [ ] 各カテゴリごとにCategorySectionを表示
- [ ] Separatorで区切り

### ステップ3.5: ガイド一覧ページのHero実装
- [ ] GuideHeroを配置
- [ ] テキスト内容設定

### ステップ3.6: ガイド詳細ページの骨組み作成
- [ ] `src/pages/Guide/GuideDetail.tsx` 作成
- [ ] useParamsでslug取得
- [ ] useGuide(slug) hook使用
- [ ] GuideLayout使用

### ステップ3.7: ガイド詳細ページのローディング/エラー状態
- [ ] ローディングSkeleton
- [ ] エラー表示
- [ ] 404表示（記事が見つからない場合）

### ステップ3.8: ガイド詳細ページのヘッダー実装
- [ ] GuideHeader配置
- [ ] パンくずリスト実装
- [ ] メタ情報表示

### ステップ3.9: ガイド詳細ページの本文実装
- [ ] GuideContent配置
- [ ] Markdown本文レンダリング
- [ ] スタイル確認

### ステップ3.10: ガイド詳細ページの目次実装
- [ ] TableOfContents配置
- [ ] サイドバーまたはトップに配置
- [ ] スクロール連動確認

### ステップ3.11: ガイド詳細ページの関連記事実装
- [ ] RelatedGuides配置
- [ ] 関連記事データ取得
- [ ] 表示確認

### ステップ3.12: カテゴリページ作成（オプション）
- [ ] `src/pages/Guide/Category.tsx` 作成
- [ ] useParamsでcategory取得
- [ ] useGuidesByCategory() hook使用
- [ ] GuideGrid表示

### ステップ3.13: ページのレスポンシブ確認
- [ ] モバイル表示確認
- [ ] タブレット表示確認
- [ ] デスクトップ表示確認
- [ ] 必要に応じて調整

**✅ 完了条件:** 一覧ページと詳細ページが動作する

---

## フェーズ4: ルーティング（0.5時間）

### ステップ4.1: ルート定義追加
- [ ] `src/App.tsx` を開く
- [ ] `/guide` ルート追加
- [ ] `/guide/:slug` ルート追加
- [ ] `/guide/category/:category` ルート追加（オプション）
- [ ] インポート追加

### ステップ4.2: ルーティング動作確認
- [ ] `/guide` にアクセス
- [ ] 一覧ページが表示されるか確認
- [ ] 記事カードをクリック
- [ ] 詳細ページに遷移するか確認

### ステップ4.3: サイドナビゲーションにリンク追加
- [ ] グローバルナビゲーションファイルを開く
- [ ] 「ガイド」アイテム追加
- [ ] アイコン設定（compass）
- [ ] リンク確認

### ステップ4.4: アクティブ状態の実装
- [ ] 現在のパスに応じてアクティブスタイル適用
- [ ] 動作確認

**✅ 完了条件:** ナビゲーションから各ページにアクセスできる

---

## ⏸️ フェーズ4.5: デザイン確認と相談

**ここで一旦停止してユーザーと相談**

---

## 各ステップでの確認事項

### 各ステップ完了時にチェック
- [ ] TypeScriptエラーがないか
- [ ] ブラウザのコンソールエラーがないか
- [ ] プレビューで期待通り表示されるか
- [ ] Git commitしておく（細かくcommit）

### トラブル時の対応
1. エラーメッセージを確認
2. ドキュメントを参照
3. 既存の類似実装（/training）を参考
4. 必要に応じてユーザーに質問

---

## 進捗管理

TodoWriteツールで各ステップの進捗を管理します。

**見積時間:**
- フェーズ0: 0.5時間（5ステップ x 6分）
- フェーズ1: 2-3時間（13ステップ x 10-15分）
- フェーズ2: 3-4時間（14ステップ x 12-17分）
- フェーズ3: 2-3時間（13ステップ x 10-15分）
- フェーズ4: 0.5時間（4ステップ x 7分）

**合計: 8.5-11時間**

各ステップは独立しており、1つずつ確実に実装できます。
