#!/bin/bash

# 画像リソース存在チェックスクリプト
# Usage: ./scripts/check-image-resources.sh

echo "📸 画像リソース存在チェック開始..."

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# カウンター
TOTAL_CHECKED=0
MISSING_FILES=0
FOUND_FILES=0

# content/training配下のフロントマターから画像パスを抽出
echo "🔍 トレーニングファイルを検索中..."

find content/training -name "*.md" | while read -r file; do
    # thumbnailとbackground_svgパスを抽出
    grep -E "^(thumbnail|background_svg):" "$file" | while IFS= read -r line; do
        # パスを抽出 (引用符を除去)
        path=$(echo "$line" | sed -n 's/.*:\s*['"'"'"]*\([^'"'"'"]*\)['"'"'"]*$/\1/p')
        
        if [[ $path == /* ]]; then
            # 絶対パス（/assets/...）の場合
            full_path="public${path}"
        else
            # 相対パスまたはHTTP(s)の場合はスキップ
            continue
        fi
        
        ((TOTAL_CHECKED++))
        
        if [[ -f "$full_path" ]]; then
            echo -e "${GREEN}✓${NC} $full_path"
            ((FOUND_FILES++))
        else
            echo -e "${RED}✗${NC} $full_path (参照元: $file)"
            ((MISSING_FILES++))
        fi
    done
done

echo ""
echo "📊 検証結果:"
echo -e "  総チェック数: ${YELLOW}$TOTAL_CHECKED${NC}"
echo -e "  存在するファイル: ${GREEN}$FOUND_FILES${NC}"
echo -e "  欠損ファイル: ${RED}$MISSING_FILES${NC}"

if [[ $MISSING_FILES -gt 0 ]]; then
    echo ""
    echo -e "${RED}⚠️  欠損ファイルが見つかりました。上記のファイルを作成してください。${NC}"
    exit 1
else
    echo ""
    echo -e "${GREEN}🎉 すべての画像リソースが正常に存在します！${NC}"
    exit 0
fi