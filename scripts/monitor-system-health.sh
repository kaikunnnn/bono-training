#!/bin/bash

# 🔍 システムヘルス監視スクリプト
# Usage: ./scripts/monitor-system-health.sh

set -e

# カラーコード
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# メトリクス
HEALTH_SCORE=100
TOTAL_CHECKS=0
FAILED_CHECKS=0
WARNING_CHECKS=0

echo -e "${BLUE}🔍 BONO Training システムヘルス監視${NC}"
echo "=============================================="
echo -e "監視開始時刻: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

# ヘルススコア計算
calculate_health_score() {
    if [[ $TOTAL_CHECKS -eq 0 ]]; then
        HEALTH_SCORE=0
        return
    fi
    
    local error_weight=20
    local warning_weight=5
    local deduction=$((FAILED_CHECKS * error_weight + WARNING_CHECKS * warning_weight))
    
    HEALTH_SCORE=$((100 - deduction))
    if [[ $HEALTH_SCORE -lt 0 ]]; then
        HEALTH_SCORE=0
    fi
}

# チェック実行関数
run_health_check() {
    local check_name="$1"
    local check_command="$2"
    local description="$3"
    local is_critical="$4"
    
    ((TOTAL_CHECKS++))
    echo -e "  🔍 $check_name"
    echo "     $description"
    
    if eval "$check_command" > /dev/null 2>&1; then
        echo -e "     ${GREEN}✅ 正常${NC}"
        return 0
    else
        if [[ "$is_critical" == "true" ]]; then
            echo -e "     ${RED}❌ 異常 (重要)${NC}"
            ((FAILED_CHECKS++))
        else
            echo -e "     ${YELLOW}⚠️ 警告${NC}"
            ((WARNING_CHECKS++))
        fi
        return 1
    fi
}

# ファイルシステムチェック
check_filesystem() {
    echo -e "\n${BLUE}📁 ファイルシステムヘルス${NC}"
    
    run_health_check \
        "コンテンツディレクトリ" \
        "test -d content/training" \
        "トレーニングコンテンツディレクトリの存在確認" \
        "true"
    
    run_health_check \
        "スクリプトディレクトリ" \
        "test -d scripts" \
        "検証スクリプトディレクトリの存在確認" \
        "true"
    
    run_health_check \
        "必須スクリプト存在確認" \
        "test -f scripts/validate-frontmatter.sh && test -f scripts/check-image-resources.sh" \
        "検証スクリプトファイルの存在確認" \
        "true"
    
    run_health_check \
        "スクリプト実行権限" \
        "test -x scripts/validate-frontmatter.sh" \
        "スクリプトファイルの実行権限確認" \
        "false"
}

# データ整合性クイックチェック
check_data_integrity() {
    echo -e "\n${BLUE}🔗 データ整合性クイックチェック${NC}"
    
    run_health_check \
        "トレーニングファイル構造" \
        "find content/training -name 'index.md' | head -1 | xargs test -f" \
        "少なくとも1つのトレーニングindex.mdが存在" \
        "true"
    
    run_health_check \
        "フロントマター構文" \
        "find content/training -name 'index.md' | head -1 | xargs grep -q '^---'" \
        "フロントマターの基本構文確認" \
        "true"
    
    # 基本的なYAML構文チェック
    local sample_file=$(find content/training -name "index.md" | head -1)
    if [[ -n "$sample_file" ]]; then
        run_health_check \
            "YAML構文検証" \
            "sed -n '/^---$/,/^---$/p' '$sample_file' | sed '1d;\$d' | python3 -c 'import yaml, sys; yaml.safe_load(sys.stdin)'" \
            "サンプルファイルのYAML構文確認" \
            "false"
    fi
}

# パフォーマンスメトリクス
check_performance() {
    echo -e "\n${BLUE}⚡ パフォーマンスメトリクス${NC}"
    
    # ファイル数カウント
    local training_count=$(find content/training -maxdepth 1 -type d ! -path content/training | wc -l)
    local task_count=$(find content/training -name "content.md" | wc -l)
    
    echo -e "  📊 統計情報:"
    echo -e "     トレーニング数: ${YELLOW}$training_count${NC}"
    echo -e "     タスク数: ${YELLOW}$task_count${NC}"
    
    run_health_check \
        "適切なコンテンツ量" \
        "test $training_count -gt 0 && test $task_count -gt 0" \
        "最低限のコンテンツが存在" \
        "true"
    
    # ディスク使用量チェック
    local disk_usage=$(du -sh content/training 2>/dev/null | cut -f1 || echo "0K")
    echo -e "     コンテンツサイズ: ${YELLOW}$disk_usage${NC}"
    
    run_health_check \
        "適切なファイルサイズ" \
        "test $(du -sk content/training | cut -f1) -lt 51200" \
        "コンテンツサイズが50MB未満" \
        "false"
}

# セキュリティチェック
check_security() {
    echo -e "\n${BLUE}🔒 セキュリティチェック${NC}"
    
    run_health_check \
        "実行可能ファイルチェック" \
        "! find content/training -name '*.md' -executable | grep -q ." \
        "コンテンツファイルに不適切な実行権限がない" \
        "false"
    
    run_health_check \
        "機密情報パターンチェック" \
        "! grep -r -i -E '(api[_-]?key|secret|password|token)' content/training/ --include='*.md'" \
        "コンテンツに機密情報パターンが含まれていない" \
        "true"
    
    run_health_check \
        "外部URL安全性" \
        "! grep -r 'http://' content/training/ --include='*.md'" \
        "非セキュアなHTTPリンクが含まれていない" \
        "false"
}

# システム依存性チェック
check_dependencies() {
    echo -e "\n${BLUE}🔧 システム依存性${NC}"
    
    run_health_check \
        "Python3利用可能" \
        "which python3" \
        "YAML検証用Python3が利用可能" \
        "false"
    
    run_health_check \
        "PyYAMLインストール" \
        "python3 -c 'import yaml'" \
        "YAML解析ライブラリが利用可能" \
        "false"
    
    run_health_check \
        "Node.js利用可能" \
        "which node" \
        "Node.js実行環境が利用可能" \
        "false"
    
    run_health_check \
        "Git利用可能" \
        "which git" \
        "Gitコマンドが利用可能" \
        "false"
}

# アラート判定
generate_alerts() {
    echo -e "\n${BLUE}🚨 アラート判定${NC}"
    
    calculate_health_score
    
    if [[ $HEALTH_SCORE -ge 90 ]]; then
        echo -e "  ${GREEN}🟢 システム状態: 良好 (スコア: $HEALTH_SCORE/100)${NC}"
    elif [[ $HEALTH_SCORE -ge 70 ]]; then
        echo -e "  ${YELLOW}🟡 システム状態: 注意 (スコア: $HEALTH_SCORE/100)${NC}"
        echo -e "  ${YELLOW}⚠️ 一部の項目で改善が推奨されます${NC}"
    elif [[ $HEALTH_SCORE -ge 50 ]]; then
        echo -e "  ${RED}🟠 システム状態: 警告 (スコア: $HEALTH_SCORE/100)${NC}"
        echo -e "  ${RED}⚠️ 重要な問題が検出されました。早急な対応が必要です${NC}"
    else
        echo -e "  ${RED}🔴 システム状態: 危険 (スコア: $HEALTH_SCORE/100)${NC}"
        echo -e "  ${RED}❌ システムに重大な問題があります。即座に対応してください${NC}"
    fi
}

# メインレポート生成
generate_report() {
    echo -e "\n${BLUE}📊 ヘルスチェック結果サマリー${NC}"
    echo "=============================================="
    echo -e "総チェック数: ${YELLOW}$TOTAL_CHECKS${NC}"
    echo -e "正常: ${GREEN}$((TOTAL_CHECKS - FAILED_CHECKS - WARNING_CHECKS))${NC}"
    echo -e "警告: ${YELLOW}$WARNING_CHECKS${NC}"
    echo -e "エラー: ${RED}$FAILED_CHECKS${NC}"
    echo -e "ヘルススコア: ${YELLOW}$HEALTH_SCORE/100${NC}"
    echo ""
    echo -e "レポート生成時刻: $(date '+%Y-%m-%d %H:%M:%S')"
    
    # ログファイルへの出力（オプション）
    if [[ -n "${LOG_TO_FILE:-}" ]]; then
        {
            echo "BONO Training Health Check Report"
            echo "================================="
            echo "Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
            echo "Total Checks: $TOTAL_CHECKS"
            echo "Passed: $((TOTAL_CHECKS - FAILED_CHECKS - WARNING_CHECKS))"
            echo "Warnings: $WARNING_CHECKS"
            echo "Errors: $FAILED_CHECKS"
            echo "Health Score: $HEALTH_SCORE/100"
        } >> "${LOG_TO_FILE}"
    fi
}

# メイン実行
main() {
    check_filesystem
    check_data_integrity
    check_performance
    check_security
    check_dependencies
    generate_alerts
    generate_report
    
    # 終了コード設定
    if [[ $HEALTH_SCORE -ge 70 ]]; then
        exit 0
    elif [[ $HEALTH_SCORE -ge 50 ]]; then
        exit 1
    else
        exit 2
    fi
}

# 実行
main