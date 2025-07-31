#!/bin/bash

# 📋 トレーニングコンテンツ総合検証スクリプト
# Usage: ./scripts/validate-training-content.sh

set -e

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# カウンター
TOTAL_ERRORS=0
TOTAL_WARNINGS=0
TOTAL_TRAININGS=0

echo -e "${BLUE}📋 トレーニングコンテンツ総合検証開始...${NC}"
echo "=================================="

# 1. 必須ディレクトリ構造の確認
check_directory_structure() {
    echo -e "\n${BLUE}🏗️ ディレクトリ構造チェック${NC}"
    
    if [ ! -d "content/training" ]; then
        echo -e "${RED}✗${NC} content/training ディレクトリが存在しません"
        ((TOTAL_ERRORS++))
        return 1
    fi
    
    local training_dirs=($(find content/training -maxdepth 1 -type d ! -path content/training))
    
    for dir in "${training_dirs[@]}"; do
        local training_name=$(basename "$dir")
        ((TOTAL_TRAININGS++))
        
        echo -e "  📁 ${training_name}"
        
        # index.md の存在確認
        if [ ! -f "$dir/index.md" ]; then
            echo -e "    ${RED}✗${NC} index.md が存在しません"
            ((TOTAL_ERRORS++))
        else
            echo -e "    ${GREEN}✓${NC} index.md"
        fi
        
        # tasks ディレクトリの確認
        if [ ! -d "$dir/tasks" ]; then
            echo -e "    ${YELLOW}⚠${NC} tasks ディレクトリが存在しません"
            ((TOTAL_WARNINGS++))
        else
            local task_count=$(find "$dir/tasks" -name "content.md" | wc -l)
            echo -e "    ${GREEN}✓${NC} tasks ($task_count タスク)"
        fi
    done
}

# 2. フロントマター検証
validate_frontmatter() {
    echo -e "\n${BLUE}📝 フロントマター検証${NC}"
    
    # 必須フィールド定義
    local required_main_fields=("title" "description" "type" "difficulty" "category" "tags" "isPremium" "order_index" "thumbnail" "icon" "skills" "estimated_total_time" "task_count")
    local required_task_fields=("title" "description" "order" "isPremium" "video_url")
    
    # メインファイルの検証
    find content/training -name "index.md" | while read -r file; do
        local training_name=$(dirname "$file" | xargs basename)
        echo -e "  📄 ${training_name}/index.md"
        
        # フロントマターの抽出
        if ! grep -q "^---" "$file"; then
            echo -e "    ${RED}✗${NC} フロントマターが見つかりません"
            ((TOTAL_ERRORS++))
            continue
        fi
        
        local frontmatter=$(sed -n '/^---$/,/^---$/p' "$file" | sed '1d;$d')
        
        # 必須フィールドのチェック
        for field in "${required_main_fields[@]}"; do
            if ! echo "$frontmatter" | grep -q "^$field:"; then
                echo -e "    ${RED}✗${NC} 必須フィールド '$field' が不足"
                ((TOTAL_ERRORS++))
            fi
        done
        
        # 型チェック
        local order_index=$(echo "$frontmatter" | grep "^order_index:" | cut -d: -f2- | xargs)
        if [[ -n "$order_index" && ! "$order_index" =~ ^[0-9]+$ ]]; then
            echo -e "    ${RED}✗${NC} order_index は数値である必要があります: $order_index"
            ((TOTAL_ERRORS++))
        fi
        
        local is_premium=$(echo "$frontmatter" | grep "^isPremium:" | cut -d: -f2- | xargs)
        if [[ -n "$is_premium" && "$is_premium" != "true" && "$is_premium" != "false" ]]; then
            echo -e "    ${RED}✗${NC} isPremium は boolean値である必要があります: $is_premium"
            ((TOTAL_ERRORS++))
        fi
        
        echo -e "    ${GREEN}✓${NC} フロントマター検証完了"
    done
    
    # タスクファイルの検証
    find content/training -path "*/tasks/*/content.md" | while read -r file; do
        local relative_path=$(echo "$file" | sed 's|content/training/||')
        echo -e "  📄 ${relative_path}"
        
        if ! grep -q "^---" "$file"; then
            echo -e "    ${RED}✗${NC} フロントマターが見つかりません"
            ((TOTAL_ERRORS++))
            continue
        fi
        
        local frontmatter=$(sed -n '/^---$/,/^---$/p' "$file" | sed '1d;$d')
        
        for field in "${required_task_fields[@]}"; do
            if ! echo "$frontmatter" | grep -q "^$field:"; then
                echo -e "    ${RED}✗${NC} 必須フィールド '$field' が不足"
                ((TOTAL_ERRORS++))
            fi
        done
        
        echo -e "    ${GREEN}✓${NC} タスクファイル検証完了"
    done
}

# 3. 画像リソース検証
validate_images() {
    echo -e "\n${BLUE}🖼️ 画像リソース検証${NC}"
    
    find content/training -name "*.md" | while read -r file; do
        # thumbnailフィールドの抽出
        local thumbnails=$(grep "^thumbnail:" "$file" | cut -d: -f2- | sed 's/^[[:space:]]*//;s/[[:space:]]*$//' | tr -d '"'"'"'"''"')
        
        if [[ -n "$thumbnails" ]]; then
            echo "$thumbnails" | while read -r thumbnail; do
                if [[ "$thumbnail" =~ ^/assets/ ]]; then
                    local full_path="public${thumbnail}"
                    if [ ! -f "$full_path" ]; then
                        echo -e "  ${RED}✗${NC} 画像が存在しません: $full_path (参照: $file)"
                        ((TOTAL_ERRORS++))
                    else
                        echo -e "  ${GREEN}✓${NC} $thumbnail"
                    fi
                elif [[ "$thumbnail" =~ ^https?:// ]]; then
                    echo -e "  ${YELLOW}⚠${NC} 外部画像: $thumbnail (確認推奨)"
                    ((TOTAL_WARNINGS++))
                fi
            done
        fi
    done
}

# 4. Markdown文法チェック
validate_markdown() {
    echo -e "\n${BLUE}📖 Markdown文法チェック${NC}"
    
    find content/training -name "*.md" | while read -r file; do
        local relative_path=$(echo "$file" | sed 's|content/training/||')
        
        # 見出し構造のチェック
        local h1_count=$(grep -c "^# " "$file" || true)
        if [ "$h1_count" -gt 1 ]; then
            echo -e "  ${YELLOW}⚠${NC} $relative_path: 複数のH1見出しが存在します ($h1_count 個)"
            ((TOTAL_WARNINGS++))
        fi
        
        # リンクの基本チェック
        local broken_links=$(grep -o '\[.*\]()' "$file" || true)
        if [[ -n "$broken_links" ]]; then
            echo -e "  ${RED}✗${NC} $relative_path: 空のリンクが存在します"
            ((TOTAL_ERRORS++))
        fi
        
        echo -e "  ${GREEN}✓${NC} $relative_path: Markdown文法OK"
    done
}

# 5. 実行とレポート
main() {
    check_directory_structure
    validate_frontmatter  
    validate_images
    validate_markdown
    
    echo -e "\n${BLUE}📊 検証結果サマリー${NC}"
    echo "=================================="
    echo -e "総トレーニング数: ${YELLOW}$TOTAL_TRAININGS${NC}"
    echo -e "エラー: ${RED}$TOTAL_ERRORS${NC}"
    echo -e "警告: ${YELLOW}$TOTAL_WARNINGS${NC}"
    
    if [ "$TOTAL_ERRORS" -gt 0 ]; then
        echo -e "\n${RED}❌ 検証に失敗しました。上記のエラーを修正してください。${NC}"
        exit 1
    elif [ "$TOTAL_WARNINGS" -gt 0 ]; then
        echo -e "\n${YELLOW}⚠️ 警告があります。品質向上のため確認を推奨します。${NC}"
        exit 0
    else
        echo -e "\n${GREEN}🎉 すべての検証に合格しました！${NC}"
        exit 0
    fi
}

# 実行
main