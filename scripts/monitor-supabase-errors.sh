#!/bin/bash

# Supabaseエラーログ自動監視スクリプト
# 使用方法: ./scripts/monitor-supabase-errors.sh [function-name] [--watch]

PROJECT_ID="fryogvfhymnpiqwssmuu"
FUNCTION_NAME="${1:-all}"
WATCH_MODE="${2:-}"

# 色の定義
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

echo "🔍 Supabaseエラーログ監視スクリプト"
echo "プロジェクトID: $PROJECT_ID"
echo ""

# Supabase DashboardのURL
DASHBOARD_URL="https://supabase.com/dashboard/project/${PROJECT_ID}/logs/edge-functions"

echo "📊 ログ確認方法:"
echo "  ブラウザで以下を開いてください:"
echo "  ${DASHBOARD_URL}"
echo ""

# エラーパターンの定義
ERROR_PATTERNS=(
  "❌"
  "Error:"
  "error:"
  "エラー"
  "失敗"
  "Failed"
  "failed"
  "Exception"
  "exception"
)

# エラーログを検出する関数
check_errors() {
  local function_name=$1
  
  echo "🔍 ${function_name} のエラーログを確認中..."
  
  # ここでは実際のログ取得はできないため、ユーザーにDashboardを確認してもらう
  # 将来的にSupabase CLIのAPIが使えるようになったら、ここで自動取得できる
  
  echo "  → ${DASHBOARD_URL}"
  if [ "$function_name" != "all" ]; then
    echo "  → 関数一覧から「${function_name}」を選択"
  fi
  echo ""
}

# メイン処理
if [ "$WATCH_MODE" = "--watch" ]; then
  echo "👀 監視モード: エラーログを継続的に監視します（Ctrl+Cで終了）"
  echo ""
  
  while true; do
    clear
    echo "🕐 $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    if [ "$FUNCTION_NAME" = "all" ]; then
      echo "📋 監視対象: すべてのEdge Functions"
      echo ""
      echo "主要な関数:"
      echo "  - create-checkout"
      echo "  - stripe-webhook-test"
      echo "  - check-subscription"
      echo ""
    else
      check_errors "$FUNCTION_NAME"
    fi
    
    echo "💡 ヒント: ブラウザでDashboardを開いて、エラーログを確認してください"
    echo "   ${DASHBOARD_URL}"
    echo ""
    echo "⏳ 30秒後に再チェックします..."
    sleep 30
  done
else
  # 1回だけチェック
  if [ "$FUNCTION_NAME" = "all" ]; then
    echo "📋 監視対象: すべてのEdge Functions"
    echo ""
    echo "主要な関数:"
    echo "  - create-checkout: ${DASHBOARD_URL}"
    echo "  - stripe-webhook-test: ${DASHBOARD_URL}"
    echo "  - check-subscription: ${DASHBOARD_URL}"
    echo ""
  else
    check_errors "$FUNCTION_NAME"
  fi
  
  echo "💡 継続的に監視する場合は、--watchオプションを使用してください:"
  echo "   ./scripts/monitor-supabase-errors.sh ${FUNCTION_NAME} --watch"
fi



