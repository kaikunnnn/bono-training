#!/bin/bash

# Edge Functionのログを自動取得して表示するスクリプト
# 使い方: ./scripts/check-edge-function-logs.sh [function-name] [limit]

FUNCTION_NAME=${1:-"all"}
LIMIT=${2:-50}

echo "=================================================="
echo "📋 Edge Function ログ取得"
echo "=================================================="
echo ""

if [ "$FUNCTION_NAME" = "all" ]; then
  echo "🔍 全てのEdge Functionのログを取得します（最新${LIMIT}件）"
  echo ""

  # 決済関連の主要なEdge Functionのログを取得
  FUNCTIONS=("create-checkout" "stripe-webhook-test" "create-customer-portal" "check-subscription")

  for func in "${FUNCTIONS[@]}"; do
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Function: $func"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    npx supabase functions logs "$func" --limit "$LIMIT" 2>&1
    echo ""
    echo ""
  done
else
  echo "🔍 $FUNCTION_NAME のログを取得します（最新${LIMIT}件）"
  echo ""
  npx supabase functions logs "$FUNCTION_NAME" --limit "$LIMIT" 2>&1
fi

echo ""
echo "=================================================="
echo "✅ ログ取得完了"
echo "=================================================="
