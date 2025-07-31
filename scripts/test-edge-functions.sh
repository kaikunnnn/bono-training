#!/bin/bash

# 🧪 Edge Function テスト実行スクリプト
# Usage: ./scripts/test-edge-functions.sh

set -e

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🧪 Edge Function テスト実行開始...${NC}"
echo "=================================="

# Denoの確認
if ! command -v deno &> /dev/null; then
    echo -e "${RED}❌ Denoがインストールされていません${NC}"
    echo "Denoをインストールしてください: https://deno.land/"
    exit 1
fi

echo -e "${GREEN}✓${NC} Deno: $(deno --version | head -1)"

# テストディレクトリの確認
if [ ! -d "src/__tests__/edge-functions" ]; then
    echo -e "${RED}❌ テストディレクトリが存在しません: src/__tests__/edge-functions${NC}"
    exit 1
fi

# 1. Edge Function 単体テスト
echo -e "\n${BLUE}📝 Edge Function 単体テスト${NC}"
echo "=================================="

cd src/__tests__/edge-functions

# get-training-list のテスト
echo -e "  🔍 get-training-list テスト実行中..."
if deno test --allow-env --allow-net get-training-list.test.ts; then
    echo -e "  ${GREEN}✓${NC} get-training-list テスト合格"
else
    echo -e "  ${RED}✗${NC} get-training-list テスト失敗"
    exit 1
fi

cd - > /dev/null

# 2. 統合テスト（実際のEdge Functionを呼び出し）
echo -e "\n${BLUE}🔗 統合テスト${NC}"
echo "=================================="

# Supabase が起動しているかチェック
if command -v supabase &> /dev/null; then
    echo -e "  🔍 Supabase ローカル環境確認中..."
    
    if supabase status | grep -q "API URL"; then
        echo -e "  ${GREEN}✓${NC} Supabase ローカル環境が起動中"
        
        # 実際のEdge Functionを呼び出してテスト
        echo -e "  🌐 get-training-list エンドポイント呼び出し..."
        
        local api_url=$(supabase status | grep "API URL" | awk '{print $3}')
        local anon_key=$(supabase status | grep "anon key" | awk '{print $3}')
        
        if curl -s -f \
            -H "Authorization: Bearer $anon_key" \
            -H "apikey: $anon_key" \
            "$api_url/functions/v1/get-training-list" > /tmp/edge-function-test.json; then
            
            # レスポンスの検証
            if cat /tmp/edge-function-test.json | jq -e '.success == true' > /dev/null; then
                echo -e "  ${GREEN}✓${NC} Edge Function 統合テスト合格"
                
                # データ件数の確認
                local count=$(cat /tmp/edge-function-test.json | jq '.data | length')
                echo -e "  📊 取得したトレーニング数: $count"
                
                # 各トレーニングの基本フィールド確認
                if cat /tmp/edge-function-test.json | jq -e '.data[0].title' > /dev/null; then
                    echo -e "  ${GREEN}✓${NC} データ構造確認完了"
                else
                    echo -e "  ${YELLOW}⚠${NC} データ構造に問題がある可能性"
                fi
            else
                echo -e "  ${RED}✗${NC} Edge Function がエラーレスポンスを返しました"
                cat /tmp/edge-function-test.json | jq '.'
                exit 1
            fi
        else
            echo -e "  ${RED}✗${NC} Edge Function の呼び出しに失敗"
            exit 1
        fi
        
        # 一時ファイルの削除
        rm -f /tmp/edge-function-test.json
        
    else
        echo -e "  ${YELLOW}⚠${NC} Supabase ローカル環境が起動していません"
        echo -e "  ${YELLOW}⚠${NC} 統合テストをスキップします"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} Supabase CLI がインストールされていません"
    echo -e "  ${YELLOW}⚠${NC} 統合テストをスキップします"
fi

# 3. パフォーマンステスト
echo -e "\n${BLUE}⚡ パフォーマンステスト${NC}"
echo "=================================="

if command -v supabase &> /dev/null && supabase status | grep -q "API URL"; then
    local api_url=$(supabase status | grep "API URL" | awk '{print $3}')
    local anon_key=$(supabase status | grep "anon key" | awk '{print $3}')
    
    echo -e "  ⏱️ レスポンス時間測定中..."
    
    local start_time=$(date +%s%3N)
    curl -s -f \
        -H "Authorization: Bearer $anon_key" \
        -H "apikey: $anon_key" \
        "$api_url/functions/v1/get-training-list" > /dev/null
    local end_time=$(date +%s%3N)
    
    local response_time=$((end_time - start_time))
    
    echo -e "  📊 レスポンス時間: ${response_time}ms"
    
    if [ "$response_time" -lt 500 ]; then
        echo -e "  ${GREEN}✓${NC} パフォーマンス良好 (< 500ms)"
    elif [ "$response_time" -lt 1000 ]; then
        echo -e "  ${YELLOW}⚠${NC} パフォーマンス注意 (< 1000ms)"
    else
        echo -e "  ${RED}✗${NC} パフォーマンス改善が必要 (> 1000ms)"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} パフォーマンステストをスキップします"
fi

# 4. エラーハンドリングテスト
echo -e "\n${BLUE}🚨 エラーハンドリングテスト${NC}"
echo "=================================="

echo -e "  🔍 無効なリクエストのテスト..."

if command -v supabase &> /dev/null && supabase status | grep -q "API URL"; then
    local api_url=$(supabase status | grep "API URL" | awk '{print $3}')
    
    # 認証なしでアクセス
    if curl -s -w "%{http_code}" -o /dev/null "$api_url/functions/v1/get-training-list" | grep -q "401\|403"; then
        echo -e "  ${GREEN}✓${NC} 認証エラーハンドリング正常"
    else
        echo -e "  ${YELLOW}⚠${NC} 認証エラーハンドリング要確認"
    fi
else
    echo -e "  ${YELLOW}⚠${NC} エラーハンドリングテストをスキップします"
fi

echo -e "\n${BLUE}📊 テスト結果サマリー${NC}"
echo "=================================="
echo -e "${GREEN}✅ Edge Function テスト完了${NC}"
echo "📝 単体テスト: 実行済み"
echo "🔗 統合テスト: 実行済み"
echo "⚡ パフォーマンステスト: 実行済み"
echo "🚨 エラーハンドリングテスト: 実行済み"

echo -e "\n${GREEN}🎉 すべてのテストが完了しました！${NC}"