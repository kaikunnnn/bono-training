# 📋 トレーニングコンテンツ作成ガイドライン

## 概要

このガイドは、BONOプラットフォームで高品質なトレーニングコンテンツを作成・維持するための標準化された手順を定義します。

---

## 🎯 コンテンツ作成プロセス

### 1. 事前準備

#### トレーニング企画
- [ ] **学習目標の明確化**: 受講者が身につけるべきスキルを具体的に定義
- [ ] **ターゲット設定**: 想定受講者のレベル・経験を特定
- [ ] **所要時間の見積**: realistic な学習時間を算出
- [ ] **成果物の定義**: 完了時に作成する成果物を明確化

#### 技術要件確認
- [ ] **難易度レベル**: `easy`、`normal`、`hard` から選択
- [ ] **トレーニングタイプ**: `challenge`、`skill`、`portfolio` から選択
- [ ] **プレミアム設定**: 無料/有料コンテンツの方針決定

### 2. ファイル構造作成

#### 必須ディレクトリ構造
```
content/training/[training-slug]/
├── index.md                    # メインファイル（必須）
├── tasks/                      # タスクディレクトリ
│   ├── [task-1-slug]/
│   │   └── content.md         # タスクコンテンツ（必須）
│   ├── [task-2-slug]/
│   │   └── content.md
│   └── ...
└── assets/                     # トレーニング専用アセット（任意）
    ├── images/
    └── downloads/
```

#### ファイル命名規則
- **トレーニングスラグ**: `kebab-case`形式（例: `ec-product-catalog`）
- **タスクスラグ**: `kebab-case`形式（例: `requirements-analysis`）
- **画像ファイル**: `[training-slug]-[purpose].[ext]`（例: `ec-catalog-hero.svg`）

### 3. フロントマター設定

#### index.md フロントマター（必須項目）
```yaml
---
title: "具体的で魅力的なタイトル"                    # 必須
description: "学習内容と価値を明確に説明"             # 必須  
type: "challenge|skill|portfolio"                  # 必須
difficulty: "easy|normal|hard"                    # 必須
category: "UIデザイン|UXデザイン|情報設計|Figma"    # 必須
tags: ["UI", "実践", "デザインシステム"]            # 必須（配列）
isPremium: false                                  # 必須（boolean）
order_index: 1                                   # 必須（number）
thumbnail: "/assets/backgrounds/[bg-file].svg"   # 必須
icon: "🎨"                                       # 必須
skills:                                          # 必須（オブジェクト配列）
  - title: "習得スキル名"
    description: "詳細説明文"
    reference_link: "https://example.com"              # 任意
estimated_total_time: "3-4時間"                  # 必須
task_count: 3                                    # 必須（number）
---
```

#### tasks/*/content.md フロントマター（必須項目）
```yaml
---
title: "タスクの具体的なタイトル"        # 必須
description: "タスクの内容と目的"       # 必須
order: 1                              # 必須（number）
isPremium: false                      # 必須（boolean）
video_url: ""                         # 必須（空文字でも可）
---
```

### 4. コンテンツ品質基準

#### テキストコンテンツ
- [ ] **導入部**: 学習目標と価値を明確に提示
- [ ] **構造化**: 見出し・リスト・コードブロックで読みやすく整理
- [ ] **実践性**: 具体例・ケーススタディを含める
- [ ] **段階的学習**: 難易度が段階的に上がる設計

#### 技術的品質
- [ ] **Markdown文法**: 正しいMarkdown記法を使用
- [ ] **リンク検証**: 外部リンクの有効性確認
- [ ] **画像最適化**: 適切なサイズ・形式での配置

#### アクセシビリティ
- [ ] **alt属性**: すべての画像に説明文を設定
- [ ] **見出し構造**: 論理的な見出しレベル（h1→h2→h3）
- [ ] **色彩配慮**: 色だけに依存しない情報伝達

### 5. 画像・アセット管理

#### 背景画像要件
- **ファイル形式**: SVG推奨（PNG/JPGも可）
- **アスペクト比**: 16:9（推奨）
- **サイズ**: 1920×1080px（最大）
- **カラー**: BONOブランドカラーに準拠
- **配置**: `public/assets/backgrounds/` ディレクトリ

#### アイコン設定
- **絵文字**: Unicode絵文字（🎨、📱、🛒など）
- **外部アイコン**: Fluent UI Emojisを推奨
- **一貫性**: 同カテゴリ内での統一感

---

## ✅ 品質チェックリスト

### 作成完了前チェック
- [ ] すべての必須フロントマター項目が設定済み
- [ ] ファイル命名規則に準拠
- [ ] 画像リソースが正しく配置・参照されている
- [ ] Markdown記法が正しく使用されている
- [ ] 外部リンクが有効
- [ ] 学習時間の見積が現実的
- [ ] タスク間の論理的な関連性が確保されている

### 公開前最終チェック
- [ ] ローカル環境での表示確認
- [ ] 各デバイス（PC・タブレット・モバイル）での表示確認
- [ ] 他の開発者によるレビュー実施
- [ ] 自動検証スクリプトの通過

---

## 🔧 開発ツール・スクリプト

### 自動検証
```bash
# コンテンツ全体の検証
./scripts/validate-training-content.sh

# 画像リソースの確認
./scripts/check-image-resources.sh

# フロントマターの検証
./scripts/validate-frontmatter.sh
```

### 推奨エディタ設定
- **VS Code拡張**: Markdown All in One、YAML
- **プレビュー**: Markdown Preview Enhanced
- **フォーマッタ**: Prettier（Markdown用設定）

---

## 🚨 よくある間違いと対処法

### Skills フィールドエラー
**エラー**: `skills.0: Expected object, received string`

**原因**: 文字列配列を使用
```yaml
# ❌ 間違い
skills: ["UIコンポーネント設計", "デザインシステム"]
```

**修正**: オブジェクト配列に変更
```yaml
# ✅ 正解
skills:
  - title: "UIコンポーネント設計"
    description: "ボタン、入力フィールド、リストアイテムなどの基本的なUIコンポーネントの設計原則"
  - title: "デザインシステム"
    description: "一貫性のあるデザイン原則とコンポーネントライブラリの構築手法"
```

---

## 📚 参考リソース

### 既存コンテンツ例
- **良い例**: `content/training/todo-app/` - 構造・品質の参考
- **改善例**: `content/training/ec-product-catalog/` - 最新基準準拠

### 外部ガイドライン
- [Markdown Guide](https://www.markdownguide.org/)
- [WCAG 2.1 Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [BONO Design System](./design-system.md)

---

**更新日**: 2024年1月31日  
**バージョン**: 1.0  
**責任者**: コンテンツ開発チーム