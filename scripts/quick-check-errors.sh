#!/bin/bash

# クイックエラーチェックスクリプト
# Supabase Dashboardのエラーログを素早く確認するためのヘルパー

PROJECT_ID="fryogvfhymnpiqwssmuu"

echo "🚨 Supabaseエラーログ クイックチェック"
echo ""

# 主要な関数のログURL
declare -A FUNCTION_URLS=(
  ["create-checkout"]="https://supabase.com/dashboard/project/${PROJECT_ID}/logs/edge-functions/create-checkout"
  ["stripe-webhook-test"]="https://supabase.com/dashboard/project/${PROJECT_ID}/logs/edge-functions/stripe-webhook-test"
  ["check-subscription"]="https://supabase.com/dashboard/project/${PROJECT_ID}/logs/edge-functions/check-subscription"
  ["stripe-webhook"]="https://supabase.com/dashboard/project/${PROJECT_ID}/logs/edge-functions/stripe-webhook"
)

echo "📊 主要なEdge Functionsのログ:"
echo ""

for func in "${!FUNCTION_URLS[@]}"; do
  echo "  🔗 ${func}:"
  echo "     ${FUNCTION_URLS[$func]}"
  echo ""
done

echo "💡 ブラウザで上記のURLを開いて、エラーログ（❌マーク）を確認してください"
echo ""

# macOSの場合、ブラウザで開く
if [[ "$OSTYPE" == "darwin"* ]]; then
  echo "🌐 ブラウザで開きますか？ (y/n)"
  read -r response
  if [[ "$response" =~ ^[Yy]$ ]]; then
    open "${FUNCTION_URLS[create-checkout]}"
  fi
fi



