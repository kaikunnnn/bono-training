#!/bin/bash

# 🔍 フロントマター専用検証スクリプト
# Usage: ./scripts/validate-frontmatter.sh [file_path]

set -e

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# YAML解析関数
parse_yaml() {
    local file="$1"
    local key="$2"
    
    # フロントマターからキーの値を抽出
    sed -n '/^---$/,/^---$/p' "$file" | sed '1d;$d' | grep "^$key:" | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | head -1
}

# 配列フィールドの検証
validate_array_field() {
    local file="$1"
    local field="$2"
    
    local value=$(parse_yaml "$file" "$field")
    
    if [[ -z "$value" ]]; then
        echo -e "    ${RED}✗${NC} '$field' フィールドが存在しません"
        return 1
    fi
    
    # 配列形式のチェック（[...]またはYAML配列形式）
    if [[ "$value" =~ ^\[.*\]$ ]] || grep -A 10 "^$field:" "$file" | grep -q "^[[:space:]]*-"; then
        echo -e "    ${GREEN}✓${NC} '$field' は有効な配列です"
        return 0
    else
        echo -e "    ${RED}✗${NC} '$field' は配列形式である必要があります: $value"
        return 1
    fi
}

# Boolean フィールドの検証
validate_boolean_field() {
    local file="$1"
    local field="$2"
    
    local value=$(parse_yaml "$file" "$field")
    
    if [[ -z "$value" ]]; then
        echo -e "    ${RED}✗${NC} '$field' フィールドが存在しません"
        return 1
    fi
    
    if [[ "$value" == "true" || "$value" == "false" ]]; then
        echo -e "    ${GREEN}✓${NC} '$field': $value"
        return 0
    else
        echo -e "    ${RED}✗${NC} '$field' はboolean値(true/false)である必要があります: $value"
        return 1
    fi
}

# 数値フィールドの検証
validate_number_field() {
    local file="$1"
    local field="$2"
    
    local value=$(parse_yaml "$file" "$field")
    
    if [[ -z "$value" ]]; then
        echo -e "    ${RED}✗${NC} '$field' フィールドが存在しません"
        return 1
    fi
    
    if [[ "$value" =~ ^[0-9]+$ ]]; then
        echo -e "    ${GREEN}✓${NC} '$field': $value"
        return 0
    else
        echo -e "    ${RED}✗${NC} '$field' は数値である必要があります: $value"
        return 1
    fi
}

# 文字列フィールドの検証
validate_string_field() {
    local file="$1"
    local field="$2"
    local required="$3"
    
    local value=$(parse_yaml "$file" "$field")
    
    if [[ -z "$value" ]]; then
        if [[ "$required" == "true" ]]; then
            echo -e "    ${RED}✗${NC} 必須フィールド '$field' が存在しません"
            return 1
        else
            echo -e "    ${YELLOW}⚠${NC} 任意フィールド '$field' が設定されていません"
            return 0
        fi
    fi
    
    # 引用符を除去
    value=$(echo "$value" | sed 's/^["'"'"']//;s/["'"'"']$//')
    
    if [[ -n "$value" ]]; then
        echo -e "    ${GREEN}✓${NC} '$field': $value"
        return 0
    else
        echo -e "    ${RED}✗${NC} '$field' は空文字列ではいけません"
        return 1
    fi
}

# 列挙値フィールドの検証
validate_enum_field() {
    local file="$1"
    local field="$2"
    local valid_values="$3"
    
    local value=$(parse_yaml "$file" "$field")
    value=$(echo "$value" | sed 's/^["'"'"']//;s/["'"'"']$//')
    
    if [[ -z "$value" ]]; then
        echo -e "    ${RED}✗${NC} '$field' フィールドが存在しません"
        return 1
    fi
    
    if [[ " $valid_values " =~ " $value " ]]; then
        echo -e "    ${GREEN}✓${NC} '$field': $value"
        return 0
    else
        echo -e "    ${RED}✗${NC} '$field' は有効な値である必要があります: $value (有効値: $valid_values)"
        return 1
    fi
}

# メインファイルの検証
validate_main_frontmatter() {
    local file="$1"
    local errors=0
    
    echo -e "  ${BLUE}📋 メインファイル検証: $(basename "$(dirname "$file")")/index.md${NC}"
    
    # フロントマターの存在確認
    if ! grep -q "^---" "$file"; then
        echo -e "    ${RED}✗${NC} フロントマターが見つかりません"
        return 1
    fi
    
    # 必須文字列フィールド
    validate_string_field "$file" "title" "true" || ((errors++))
    validate_string_field "$file" "description" "true" || ((errors++))
    validate_string_field "$file" "category" "true" || ((errors++))
    validate_string_field "$file" "icon" "true" || ((errors++))
    validate_string_field "$file" "thumbnail" "true" || ((errors++))
    validate_string_field "$file" "estimated_total_time" "true" || ((errors++))
    
    # 列挙値フィールド
    validate_enum_field "$file" "type" "challenge skill portfolio" || ((errors++))
    validate_enum_field "$file" "difficulty" "easy normal hard" || ((errors++))
    
    # Boolean フィールド
    validate_boolean_field "$file" "isPremium" || ((errors++))
    
    # 数値フィールド
    validate_number_field "$file" "order_index" || ((errors++))
    validate_number_field "$file" "task_count" || ((errors++))
    
    # 配列フィールド
    validate_array_field "$file" "tags" || ((errors++))
    validate_array_field "$file" "skills" || ((errors++))
    
    return $errors
}

# タスクファイルの検証
validate_task_frontmatter() {
    local file="$1"
    local errors=0
    
    echo -e "  ${BLUE}📋 タスクファイル検証: $(echo "$file" | sed 's|content/training/||')${NC}"
    
    # フロントマターの存在確認
    if ! grep -q "^---" "$file"; then
        echo -e "    ${RED}✗${NC} フロントマターが見つかりません"
        return 1
    fi
    
    # 必須文字列フィールド
    validate_string_field "$file" "title" "true" || ((errors++))
    validate_string_field "$file" "description" "true" || ((errors++))
    
    # Boolean フィールド
    validate_boolean_field "$file" "isPremium" || ((errors++))
    
    # 数値フィールド
    validate_number_field "$file" "order" || ((errors++))
    
    # video_url（空文字列OK）
    validate_string_field "$file" "video_url" "false" || ((errors++))
    
    return $errors
}

# メイン処理
main() {
    local target_file="$1"
    local total_errors=0
    
    echo -e "${BLUE}🔍 フロントマター検証開始...${NC}"
    echo "=================================="
    
    if [[ -n "$target_file" ]]; then
        # 特定ファイルの検証
        if [[ ! -f "$target_file" ]]; then
            echo -e "${RED}❌ ファイルが存在しません: $target_file${NC}"
            exit 1
        fi
        
        if [[ "$(basename "$target_file")" == "index.md" ]]; then
            validate_main_frontmatter "$target_file" || ((total_errors++))
        elif [[ "$target_file" =~ tasks/.*/content\.md$ ]]; then
            validate_task_frontmatter "$target_file" || ((total_errors++))
        else
            echo -e "${YELLOW}⚠ 不明なファイル形式: $target_file${NC}"
        fi
    else
        # 全ファイルの検証
        echo -e "\n${BLUE}📄 メインファイル検証${NC}"
        find content/training -name "index.md" | while read -r file; do
            validate_main_frontmatter "$file" || ((total_errors++))
        done
        
        echo -e "\n${BLUE}📝 タスクファイル検証${NC}"
        find content/training -path "*/tasks/*/content.md" | while read -r file; do
            validate_task_frontmatter "$file" || ((total_errors++))
        done
    fi
    
    echo -e "\n${BLUE}📊 検証結果${NC}"
    echo "=================================="
    
    if [ "$total_errors" -gt 0 ]; then
        echo -e "${RED}❌ $total_errors 個のエラーが見つかりました${NC}"
        exit 1
    else
        echo -e "${GREEN}🎉 すべてのフロントマターが正常です！${NC}"
        exit 0
    fi
}

# 実行
main "$1"