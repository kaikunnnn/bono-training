# バリデーションスクリプト修正チケット

## 🚨 問題

複数のバリデーションスクリプトがCI/CDパイプラインで失敗：

```
Run ./scripts/run-all-validations.sh
🚀 BONO Training コンテンツ品質総合検証
Error: Process completed with exit code 1.

Run ./scripts/validate-training-content.sh
🛠️ トレーニングコンテンツ総合検証開始...
🏗️ ディレクトリ構造チェック
Error: Process completed with exit code 1.
```

## 🔍 現在の状況分析

### 関連スクリプトファイル
```
scripts/
├── run-all-validations.sh      # 総合検証スクリプト（失敗中）
├── validate-training-content.sh # コンテンツ検証（失敗中）
├── validate-frontmatter.sh     # フロントマター検証
├── validate-data-consistency.sh # データ整合性検証
├── check-image-resources.sh    # 画像リソース検証
└── test-edge-functions.sh      # Edge Functions検証
```

### 推定される問題

#### 1. ディレクトリ構造の変更
- 最近の修正でコンテンツディレクトリ構造が変更
- バリデーションスクリプトが古い構造を期待している可能性

#### 2. 依存関係の問題  
- スクリプト内で使用しているコマンドが見つからない
- 必要な環境変数が設定されていない

#### 3. 権限問題
- スクリプトファイルに実行権限がない
- ファイルアクセス権限の問題

## 📋 調査・修正手順

### Phase 1: 問題特定

#### Step 1: スクリプト実行権限確認
```bash
ls -la scripts/
# 実行権限があるか確認（chmod +x が必要かもしれない）
```

#### Step 2: 個別スクリプト動作確認
```bash
# 個別にスクリプトを実行して、どこで失敗するか特定
./scripts/validate-training-content.sh
./scripts/validate-frontmatter.sh
./scripts/validate-data-consistency.sh
./scripts/check-image-resources.sh
```

#### Step 3: スクリプト内容確認
各スクリプトの内容を確認し、以下をチェック：
- 使用しているコマンドが利用可能か
- ファイルパスが正しいか
- 環境変数が適切に設定されているか

### Phase 2: 具体的修正

#### 修正パターン 1: 実行権限付与
```bash
chmod +x scripts/*.sh
```

#### 修正パターン 2: ディレクトリ構造対応
スクリプト内で参照しているパスを現在の構造に合わせて修正：
```bash
# 旧: content/training/some-folder/
# 新: content/training/ some-folder/  (スペース含む)
```

#### 修正パターン 3: 依存関係確認
スクリプト内で使用している外部コマンドが利用可能か確認：
```bash
# 例: jq, curl, node等の確認
which jq
which curl
which node
```

#### 修正パターン 4: エラーハンドリング改善
スクリプトに適切なエラーハンドリングを追加：
```bash
#!/bin/bash
set -e  # エラー時に終了
set -u  # 未定義変数使用時に終了
```

### Phase 3: CI/CD環境での確認

#### GitHub Actions環境確認
`.github/workflows/`内でスクリプトがどのように呼び出されているか確認

#### 環境変数設定
CI/CD環境で必要な環境変数が設定されているか確認

## 🧪 テスト計画

### ローカル環境テスト
- [ ] 各スクリプトの個別実行
- [ ] `run-all-validations.sh`の実行
- [ ] エラーログの詳細確認

### CI/CD環境テスト
- [ ] GitHub Actionsでのスクリプト実行
- [ ] 各バリデーションステップの通過確認
- [ ] エラー時の適切なログ出力確認

## 📂 修正対象ファイル

### 主要修正ファイル
- `scripts/run-all-validations.sh`
- `scripts/validate-training-content.sh`
- `scripts/validate-frontmatter.sh`
- `scripts/validate-data-consistency.sh`
- `scripts/check-image-resources.sh`

### 設定ファイル
- `.github/workflows/ci.yml`
- `.github/workflows/quality-gate.yml`

## 🔧 修正例

### エラーハンドリング改善例
```bash
#!/bin/bash
set -euo pipefail

echo "🛠️ トレーニングコンテンツ総合検証開始..."

# ディレクトリ存在確認
if [ ! -d "content/training" ]; then
    echo "❌ エラー: content/training ディレクトリが見つかりません"
    exit 1
fi

echo "🏗️ ディレクトリ構造チェック"
# ディレクトリ構造チェック処理...

echo "✅ バリデーション完了"
```

### ディレクトリ構造対応例
```bash
# スペースを含むディレクトリ名に対応
find "content/training" -name "*.md" -type f | while IFS= read -r file; do
    echo "検証中: $file"
    # フロントマター検証処理...
done
```

## ⚠️ 注意事項

### 修正時の確認点
- スクリプト修正後は必ずローカルでテスト実行
- エラーメッセージを分かりやすく改善
- CI/CD環境での動作も確認

### バックアップ
- 修正前にスクリプトファイルのバックアップ作成
- Git履歴で変更内容を明確に記録

## 🔗 関連資料

### スクリプト仕様書
- 各バリデーションスクリプトの目的と期待動作
- エラーパターンと対処法のドキュメント化

### CI/CD設定
- GitHub Actionsワークフロー設定
- 環境変数とシークレット管理

---
**優先度**: 🟡 Medium  
**推定工数**: 1日  
**担当者**: きかく  
**ステータス**: 🟡 対応待ち

**依存関係**: Jest環境修正後に実施推奨