#!/bin/bash

# Supabaseログ確認スクリプト
# 使用方法: ./scripts/check-supabase-logs.sh [function-name]

PROJECT_ID="fryogvfhymnpiqwssmuu"
FUNCTION_NAME="${1:-all}"

echo "🔍 Supabaseログ確認スクリプト"
echo "プロジェクトID: $PROJECT_ID"
echo ""

# Supabase CLIがインストールされているか確認
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLIがインストールされていません"
    echo ""
    echo "インストール方法:"
    echo "  macOS: brew install supabase/tap/supabase"
    echo "  または: npm install -g supabase"
    echo ""
    echo "インストール後、以下でログインしてください:"
    echo "  supabase login"
    echo ""
    exit 1
fi

# プロジェクトにリンクされているか確認
if [ ! -f "supabase/config.toml" ]; then
    echo "❌ Supabaseプロジェクトがリンクされていません"
    echo "以下のコマンドでリンクしてください:"
    echo "  supabase link --project-ref $PROJECT_ID"
    exit 1
fi

echo "📋 利用可能なコマンド:"
echo ""
echo "1. すべてのEdge Functionsのログを確認:"
echo "   supabase functions logs"
echo ""
echo "2. 特定のFunctionのログを確認:"
echo "   supabase functions logs $FUNCTION_NAME"
echo ""
echo "3. リアルタイムでログを監視:"
echo "   supabase functions logs --follow"
echo ""
echo "4. 最新のN件のログを表示:"
echo "   supabase functions logs --limit 50"
echo ""

# 実際にログを取得
if [ "$FUNCTION_NAME" = "all" ]; then
    echo "📊 すべてのEdge Functionsのログを取得中..."
    supabase functions logs --limit 20
else
    echo "📊 $FUNCTION_NAME のログを取得中..."
    supabase functions logs "$FUNCTION_NAME" --limit 20
fi



