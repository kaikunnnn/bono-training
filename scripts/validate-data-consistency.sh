#!/bin/bash

# 🔗 データ整合性チェックツール
# Usage: ./scripts/validate-data-consistency.sh

set -e

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# カウンター
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
CHECKED_TRAININGS=0

echo -e "${BLUE}🔗 データ整合性チェック開始...${NC}"
echo "=================================="

# YAML値抽出関数
extract_yaml_value() {
    local file="$1"
    local key="$2"
    
    sed -n '/^---$/,/^---$/p' "$file" | sed '1d;$d' | grep "^$key:" | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | sed 's/^["'"'"']//;s/["'"'"']$//' | head -1
}

# 配列値抽出関数
extract_yaml_array() {
    local file="$1"
    local key="$2"
    
    # 配列の開始行を見つける
    local start_line=$(grep -n "^$key:" "$file" | cut -d: -f1)
    if [[ -z "$start_line" ]]; then
        return 1
    fi
    
    # インライン配列の場合 [item1, item2]
    local inline_array=$(sed -n "${start_line}p" "$file" | grep -o '\[.*\]')
    if [[ -n "$inline_array" ]]; then
        echo "$inline_array" | sed 's/\[//;s/\]//;s/"//g' | tr ',' '\n' | sed 's/^[[:space:]]*//;s/[[:space:]]*$//'
        return 0
    fi
    
    # YAML配列の場合
    sed -n "${start_line},/^[^[:space:]-]/p" "$file" | grep "^[[:space:]]*-" | sed 's/^[[:space:]]*-[[:space:]]*//' | sed 's/^["'"'"']//;s/["'"'"']$//'
}

# トレーニングとタスクの整合性チェック
check_training_task_consistency() {
    echo -e "\n${BLUE}📋 トレーニング↔タスク整合性チェック${NC}"
    
    find content/training -name "index.md" | while read -r training_file; do
        local training_dir=$(dirname "$training_file")
        local training_name=$(basename "$training_dir")
        local has_errors=0
        
        ((CHECKED_TRAININGS++))
        echo -e "  📁 $training_name"
        
        # フロントマターからtask_countを取得
        local declared_task_count=$(extract_yaml_value "$training_file" "task_count")
        
        # 実際のタスクファイル数をカウント
        local actual_task_count=0
        if [[ -d "$training_dir/tasks" ]]; then
            actual_task_count=$(find "$training_dir/tasks" -name "content.md" | wc -l)
        fi
        
        # task_count整合性チェック
        if [[ -n "$declared_task_count" && "$declared_task_count" != "$actual_task_count" ]]; then
            echo -e "    ${RED}✗${NC} task_count不整合: 宣言=$declared_task_count, 実際=$actual_task_count"
            ((TOTAL_ERRORS++))
            has_errors=1
        fi
        
        # 各タスクのorder値の連続性チェック
        if [[ -d "$training_dir/tasks" ]]; then
            local orders=()
            find "$training_dir/tasks" -name "content.md" | while read -r task_file; do
                local order=$(extract_yaml_value "$task_file" "order")
                if [[ -n "$order" ]]; then
                    orders+=("$order")
                fi
            done
            
            # orderの重複チェック
            local unique_orders=($(printf '%s\n' "${orders[@]}" | sort -nu))
            if [[ ${#orders[@]} -ne ${#unique_orders[@]} ]]; then
                echo -e "    ${RED}✗${NC} タスクorder値に重複があります"
                ((TOTAL_ERRORS++))
                has_errors=1
            fi
            
            # order値の連続性チェック（1から始まる）
            local expected_order=1
            for order in $(printf '%s\n' "${orders[@]}" | sort -n); do
                if [[ "$order" != "$expected_order" ]]; then
                    echo -e "    ${YELLOW}⚠${NC} タスクorder値が連続していません: 期待=$expected_order, 実際=$order"
                    ((TOTAL_WARNINGS++))
                    break
                fi
                ((expected_order++))
            done
        fi
        
        # skills配列と実際のスキル記述の整合性チェック
        local skills_array=($(extract_yaml_array "$training_file" "skills" 2>/dev/null))
        if [[ ${#skills_array[@]} -gt 0 ]]; then
            echo -e "    ${GREEN}✓${NC} skills配列: ${#skills_array[@]}個のスキル定義"
        else
            echo -e "    ${YELLOW}⚠${NC} skills配列が定義されていません"
            ((TOTAL_WARNINGS++))
        fi
        
        if [[ $has_errors -eq 0 ]]; then
            echo -e "    ${GREEN}✓${NC} 整合性チェック完了"
        fi
    done
}

# 画像参照の整合性チェック
check_image_references() {
    echo -e "\n${BLUE}🖼️ 画像参照整合性チェック${NC}"
    
    # フロントマターで参照されている画像
    find content/training -name "*.md" | while read -r file; do
        local relative_path=$(echo "$file" | sed 's|content/training/||')
        
        # thumbnail, background_svg, iconの参照をチェック
        for field in "thumbnail" "background_svg" "icon"; do
            local image_path=$(extract_yaml_value "$file" "$field")
            
            if [[ -n "$image_path" && "$image_path" =~ ^/assets/ ]]; then
                local full_path="public${image_path}"
                if [[ ! -f "$full_path" ]]; then
                    echo -e "  ${RED}✗${NC} $relative_path: $field画像が存在しません: $image_path"
                    ((TOTAL_ERRORS++))
                else
                    echo -e "  ${GREEN}✓${NC} $relative_path: $field画像存在確認"
                fi
            elif [[ -n "$image_path" && "$image_path" =~ ^https?:// ]]; then
                echo -e "  ${YELLOW}⚠${NC} $relative_path: $field外部画像 (確認推奨): $image_path"
                ((TOTAL_WARNINGS++))
            fi
        done
    done
}

# フロントマター構造の深層チェック
check_frontmatter_structure() {
    echo -e "\n${BLUE}📝 フロントマター構造深層チェック${NC}"
    
    find content/training -name "index.md" | while read -r file; do
        local training_name=$(basename "$(dirname "$file")")
        echo -e "  📄 $training_name"
        
        # guide構造の検証
        if grep -q "^guide:" "$file"; then
            # guide.stepsの存在確認
            if grep -A 20 "^guide:" "$file" | grep -q "steps:"; then
                echo -e "    ${GREEN}✓${NC} guide.steps構造が存在"
            else
                echo -e "    ${YELLOW}⚠${NC} guide.stepsが定義されていません"
                ((TOTAL_WARNINGS++))
            fi
            
            # guide.lessonの確認
            if grep -A 20 "^guide:" "$file" | grep -q "lesson:"; then
                echo -e "    ${GREEN}✓${NC} guide.lesson構造が存在"
            else
                echo -e "    ${YELLOW}⚠${NC} guide.lessonが定義されていません"
                ((TOTAL_WARNINGS++))
            fi
        else
            echo -e "    ${RED}✗${NC} guide構造が存在しません"
            ((TOTAL_ERRORS++))
        fi
        
        # fallback_gradientまたはbackground_svgの存在確認
        local has_background_svg=$(extract_yaml_value "$file" "background_svg")
        local has_fallback_gradient=$(grep -q "fallback_gradient:" "$file" && echo "true" || echo "false")
        
        if [[ -z "$has_background_svg" && "$has_fallback_gradient" == "false" ]]; then
            echo -e "    ${RED}✗${NC} background_svgまたはfallback_gradientが必要です"
            ((TOTAL_ERRORS++))
        else
            echo -e "    ${GREEN}✓${NC} 背景設定が存在"
        fi
    done
}

# YAML構文エラーチェック
check_yaml_syntax() {
    echo -e "\n${BLUE}⚙️ YAML構文エラーチェック${NC}"
    
    find content/training -name "*.md" | while read -r file; do
        local relative_path=$(echo "$file" | sed 's|content/training/||')
        
        # フロントマターを抽出してYAML検証
        local frontmatter=$(sed -n '/^---$/,/^---$/p' "$file" | sed '1d;$d')
        
        if [[ -n "$frontmatter" ]]; then
            # 基本的なYAML構文チェック
            echo "$frontmatter" | python3 -c "
import sys
import yaml
try:
    yaml.safe_load(sys.stdin)
    print('${GREEN}✓${NC} $relative_path: YAML構文OK')
except yaml.YAMLError as e:
    print('${RED}✗${NC} $relative_path: YAML構文エラー - ' + str(e))
    sys.exit(1)
" 2>/dev/null || {
                echo -e "  ${RED}✗${NC} $relative_path: YAML構文エラーが検出されました"
                ((TOTAL_ERRORS++))
            }
        fi
    done
}

# メイン実行
main() {
    check_training_task_consistency
    check_image_references
    check_frontmatter_structure
    check_yaml_syntax
    
    echo -e "\n${BLUE}📊 データ整合性チェック結果${NC}"
    echo "=================================="
    echo -e "チェック対象: ${YELLOW}$CHECKED_TRAININGS${NC} トレーニング"
    echo -e "エラー: ${RED}$TOTAL_ERRORS${NC}"
    echo -e "警告: ${YELLOW}$TOTAL_WARNINGS${NC}"
    
    if [[ $TOTAL_ERRORS -gt 0 ]]; then
        echo -e "\n${RED}❌ データ整合性チェックで重大なエラーが発見されました${NC}"
        exit 1
    elif [[ $TOTAL_WARNINGS -gt 0 ]]; then
        echo -e "\n${YELLOW}⚠️ 警告が見つかりました。品質向上のため確認を推奨します${NC}"
        exit 0
    else
        echo -e "\n${GREEN}🎉 すべてのデータ整合性チェックに合格しました！${NC}"
        exit 0
    fi
}

# 実行
main