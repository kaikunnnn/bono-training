#!/bin/bash
# Ghost パスワードリセットスクリプト
# 使用方法: ./scripts/ghost-reset-password.sh <新しいパスワード>

set -e

DOCKER_CMD="/Applications/Docker.app/Contents/Resources/bin/docker"
NEW_PASSWORD="${1:-password123}"

echo "=== Ghost パスワードリセット ==="
echo ""

# Dockerが起動しているか確認
if ! $DOCKER_CMD info > /dev/null 2>&1; then
    echo "❌ Docker Desktopが起動していません"
    echo "   Docker Desktopを起動してから再実行してください"
    exit 1
fi

# Ghostコンテナが起動しているか確認
CONTAINER_NAME=$($DOCKER_CMD compose ps -q ghost 2>/dev/null || echo "")
if [ -z "$CONTAINER_NAME" ]; then
    echo "❌ Ghostコンテナが起動していません"
    echo "   'docker compose up -d ghost' を実行してください"
    exit 1
fi

echo "📧 現在のユーザー情報を取得中..."
echo ""

# ユーザー情報を取得
USER_INFO=$($DOCKER_CMD compose exec -T ghost sqlite3 /var/lib/ghost/content/data/ghost-local.db \
    "SELECT id, name, email FROM users WHERE id = 1;" 2>/dev/null || echo "")

if [ -z "$USER_INFO" ]; then
    echo "❌ ユーザーが見つかりません"
    echo "   Ghostの初期セットアップを先に完了してください"
    echo "   URL: http://localhost:2368/ghost"
    exit 1
fi

echo "ユーザー情報: $USER_INFO"
echo ""
echo "🔐 パスワードをリセット中..."

# Ghost CLIを使ってパスワードをリセット
$DOCKER_CMD compose exec -T ghost node -e "
const crypto = require('crypto');

// bcrypt互換のハッシュ生成（Ghost内部形式）
const password = '$NEW_PASSWORD';
const hash = require('crypto').createHash('sha256').update(password).digest('hex');

console.log('新しいパスワード: $NEW_PASSWORD');
console.log('注意: Ghostを再起動してください');
"

# SQLiteで直接パスワードを更新（bcryptハッシュが必要）
# Ghostコンテナ内でbcryptを使用
$DOCKER_CMD compose exec -T ghost sh -c "
cd /var/lib/ghost && node -e \"
const bcrypt = require('bcryptjs');
const sqlite3 = require('better-sqlite3');

const db = new sqlite3('/var/lib/ghost/content/data/ghost-local.db');
const hash = bcrypt.hashSync('$NEW_PASSWORD', 10);

db.prepare('UPDATE users SET password = ? WHERE id = 1').run(hash);
db.close();

console.log('✅ パスワードを更新しました');
console.log('');
console.log('📝 ログイン情報:');
const user = require('better-sqlite3')('/var/lib/ghost/content/data/ghost-local.db').prepare('SELECT email FROM users WHERE id = 1').get();
console.log('   Email: ' + user.email);
console.log('   Password: $NEW_PASSWORD');
console.log('');
console.log('🔗 ログインURL: http://localhost:2368/ghost');
\"
"

echo ""
echo "=== 完了 ==="
