#!/bin/bash

# Edge Functionのログをリアルタイムで監視するスクリプト
# 使い方: ./scripts/watch-edge-function-logs.sh [function-name]

FUNCTION_NAME=${1:-"create-checkout"}

echo "=================================================="
echo "👀 Edge Function ログ監視（リアルタイム）"
echo "=================================================="
echo ""
echo "Function: $FUNCTION_NAME"
echo "Ctrl+C で終了"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# リアルタイムでログを表示
npx supabase functions logs "$FUNCTION_NAME" --follow
