# ガイドページ実装タスク

学習ガイド記事を管理・表示するための `/guide` ページを実装するタスクです。

## 📋 タスクファイル

- **[task.md](./task.md)** - タスク概要と進捗
- **[requirements.md](./requirements.md)** - 詳細な要件定義
- **[data-structure.md](./data-structure.md)** - データ構造とAPI設計
- **[implementation-plan.md](./implementation-plan.md)** - フェーズ別実装計画
- **[cms-comparison.md](./cms-comparison.md)** - CMS検討（Ghost vs Markdown）

## 🎯 概要

転職ロードマップ、AIとデザイナー、学習方法など、記事コンテンツベースの学習ガイドを提供するページを作成します。

### 主な機能

- カテゴリ別ガイド一覧表示
- ガイド詳細ページ（Markdown形式）
- カテゴリフィルター
- 関連記事表示
- SEO対応

## 🏗️ 技術選定

**採用: Markdown方式**

既存の `/training` と同じMarkdownベースのシステムを採用。

### 理由
- ✅ 既存実装を再利用できる
- ✅ 開発コストが低い
- ✅ Git でバージョン管理
- ✅ 運用コスト $0

詳細は [cms-comparison.md](./cms-comparison.md) を参照。

## 📂 想定ディレクトリ構造

```
content/
  guide/
    career/              # キャリア
      job-change-roadmap/
        index.md
    learning/            # 学習方法
      good-bad-study-methods/
        index.md
    industry/            # 業界動向
      ai-and-designers/
        index.md
```

## 🚀 実装フェーズ

1. **データ基盤** - 型定義、ローダー、hooks
2. **UIコンポーネント** - カード、グリッド、レイアウト
3. **ページ実装** - 一覧ページ、詳細ページ
4. **ルーティング** - React Router設定
5. **スタイリング** - レスポンシブ、アクセシビリティ
6. **SEO対応** - メタタグ、構造化データ
7. **テスト** - 動作確認、デプロイ

詳細は [implementation-plan.md](./implementation-plan.md) を参照。

## ⏱️ 見積工数

**10-15.5時間**

## 📝 次のステップ

1. タスク内容を確認・承認
2. 実装開始（フェーズ1から順に）
3. サンプルコンテンツ作成
4. テスト・デプロイ

---

**作成日:** 2025-10-31
**担当:** Claude
