#!/bin/bash

# エラーログを自動チェックして、エディタで開けるファイルに保存
# 使用方法: ./scripts/auto-check-errors.sh [function-name]

PROJECT_ID="fryogvfhymnpiqwssmuu"
FUNCTION_NAME="${1:-all}"
LOGS_DIR=".claude/logs"

# ログディレクトリを作成
mkdir -p "$LOGS_DIR"

# 主要な関数のリスト
declare -a FUNCTIONS=("create-checkout" "stripe-webhook-test" "check-subscription" "stripe-webhook")

create_log_file() {
  local func=$1
  local file_path="${LOGS_DIR}/${func}-logs.md"
  local dashboard_url="https://supabase.com/dashboard/project/${PROJECT_ID}/logs/edge-functions/${func}"
  
  cat > "$file_path" << EOF
# ${func} のログ

## 📊 ログ確認方法

以下のURLをブラウザで開いて、ログを確認してください:

${dashboard_url}

## 💡 ヒント

1. ブラウザで上記のURLを開く
2. エラーログ（❌マーク）を探す
3. エラーメッセージをコピーして、このファイルに貼り付ける

## 📝 エラーログ（手動で貼り付け）

ここにエラーログを貼り付けてください:

\`\`\`
[エラーログをここに貼り付け]
\`\`\`

## 🔍 確認すべきポイント

- [ ] エラーログがないか確認
- [ ] エラーメッセージをコピー
- [ ] エラーの原因を特定
- [ ] 修正方法を検討

---
最終更新: $(date '+%Y-%m-%d %H:%M:%S')
EOF

  echo "✅ ${file_path} を作成しました"
}

if [ "$FUNCTION_NAME" = "all" ]; then
  echo "📋 すべての関数のログファイルを作成中..."
  for func in "${FUNCTIONS[@]}"; do
    create_log_file "$func"
  done
  echo ""
  echo "📁 ログファイルの場所: ${LOGS_DIR}"
  echo "💡 エディタで開いて、エラーログを貼り付けてください"
else
  create_log_file "$FUNCTION_NAME"
  echo ""
  echo "📁 ログファイル: ${LOGS_DIR}/${FUNCTION_NAME}-logs.md"
  echo "💡 エディタで開いて、エラーログを貼り付けてください"
fi



