#!/bin/bash

# 🚀 全検証スクリプト実行ツール
# Usage: ./scripts/run-all-validations.sh

set -e

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 検証結果カウンター
TOTAL_SCRIPTS=0
PASSED_SCRIPTS=0
FAILED_SCRIPTS=0

echo -e "${BLUE}🚀 BONO Training コンテンツ品質総合検証${NC}"
echo "=============================================="
echo -e "実行時刻: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# スクリプト実行関数
run_validation_script() {
    local script_name="$1"
    local script_path="$2"
    local description="$3"
    
    ((TOTAL_SCRIPTS++))
    
    echo -e "${BLUE}📋 $description${NC}"
    echo "スクリプト: $script_path"
    echo "----------------------------------------"
    
    if [[ ! -f "$script_path" ]]; then
        echo -e "${RED}❌ スクリプトファイルが存在しません: $script_path${NC}"
        ((FAILED_SCRIPTS++))
        return 1
    fi
    
    if [[ ! -x "$script_path" ]]; then
        echo -e "${YELLOW}⚠️ スクリプトに実行権限がありません。権限を付与中...${NC}"
        chmod +x "$script_path"
    fi
    
    local start_time=$(date +%s)
    
    if "$script_path"; then
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${GREEN}✅ $script_name 完了 (${duration}秒)${NC}"
        ((PASSED_SCRIPTS++))
        return 0
    else
        local end_time=$(date +%s)
        local duration=$((end_time - start_time))
        echo -e "${RED}❌ $script_name 失敗 (${duration}秒)${NC}"
        ((FAILED_SCRIPTS++))
        return 1
    fi
}

# 検証スクリプト一覧
validation_scripts=(
    "フロントマター検証:scripts/validate-frontmatter.sh:フロントマターの構造と必須フィールドをチェック"
    "画像リソース検証:scripts/check-image-resources.sh:画像ファイルの存在と参照整合性をチェック"
    "データ整合性検証:scripts/validate-data-consistency.sh:トレーニングとタスクのデータ整合性をチェック"
    "総合コンテンツ検証:scripts/validate-training-content.sh:コンテンツ全体の構造と品質をチェック"
)

# 各検証スクリプトの実行
echo -e "${BLUE}🔍 検証スクリプト実行開始${NC}"
echo ""

for script_info in "${validation_scripts[@]}"; do
    IFS=':' read -r script_name script_path description <<< "$script_info"
    
    echo ""
    run_validation_script "$script_name" "$script_path" "$description"
    echo ""
done

# 結果サマリー
echo ""
echo -e "${BLUE}📊 検証結果サマリー${NC}"
echo "=============================================="
echo -e "総スクリプト数: ${YELLOW}$TOTAL_SCRIPTS${NC}"
echo -e "成功: ${GREEN}$PASSED_SCRIPTS${NC}"
echo -e "失敗: ${RED}$FAILED_SCRIPTS${NC}"

if [[ $FAILED_SCRIPTS -eq 0 ]]; then
    echo ""
    echo -e "${GREEN}🎉 すべての品質検証に合格しました！${NC}"
    echo -e "${GREEN}プロダクションデプロイ可能な品質レベルです。${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ $FAILED_SCRIPTS 個の検証で問題が見つかりました${NC}"
    echo -e "${YELLOW}上記のエラーを修正してから再実行してください${NC}"
    exit 1
fi