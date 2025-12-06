# ロールバック手順

**作成日**: 2025-12-04

---

## 概要

移行に問題が発生した場合のロールバック手順。

### 重要原則

1. **Stripeデータは触らない** - ロールバックでもStripeは変更しない
2. **部分的ロールバック可能** - 特定ユーザーのみロールバック可能
3. **ログを保持** - ロールバック理由と対象を記録

---

## ロールバック対象

| 対象 | 削除するもの |
|------|--------------|
| auth.users | 移行で作成したユーザー |
| stripe_customers | 移行で作成したレコード |
| user_subscriptions | 移行で作成したレコード |

### 削除しないもの

- Stripeの顧客データ
- Stripeのサブスクリプション
- Stripeの支払い履歴

---

## 単一ユーザーロールバック

### 手順

```typescript
// 1. user_subscriptions から削除
DELETE FROM user_subscriptions
WHERE user_id = '{user_id}';

// 2. stripe_customers から削除
DELETE FROM stripe_customers
WHERE user_id = '{user_id}';

// 3. auth.users から削除
// Supabase Admin API を使用
await supabase.auth.admin.deleteUser(user_id);
```

### スクリプト使用例

```bash
npx tsx scripts/migration/rollback-user.ts --user-id=xxxxx-xxxx-xxxx

# または email で指定
npx tsx scripts/migration/rollback-user.ts --email=user@example.com
```

---

## バッチロールバック

### 特定日時以降の移行をロールバック

```sql
-- 1. 対象ユーザーIDを取得
SELECT user_id FROM user_subscriptions
WHERE created_at >= '2025-12-04T10:00:00Z'
  AND environment = 'live';

-- 2. user_subscriptions 削除
DELETE FROM user_subscriptions
WHERE created_at >= '2025-12-04T10:00:00Z'
  AND environment = 'live';

-- 3. stripe_customers 削除
DELETE FROM stripe_customers
WHERE created_at >= '2025-12-04T10:00:00Z'
  AND environment = 'live';

-- 4. auth.users はスクリプトで削除（Admin API必要）
```

### スクリプト使用例

```bash
# 日時指定でロールバック
npx tsx scripts/migration/rollback-batch.ts --since="2025-12-04T10:00:00Z"

# CSVファイルで指定
npx tsx scripts/migration/rollback-batch.ts --csv=rollback-targets.csv
```

---

## ロールバック前の確認

### チェックリスト

- [ ] ロールバック対象ユーザー数を確認
- [ ] 対象ユーザーがログイン中でないことを確認
- [ ] Memberstackが引き続き利用可能なことを確認
- [ ] ログファイルのバックアップ

### 確認クエリ

```sql
-- ロールバック対象数の確認
SELECT COUNT(*) FROM user_subscriptions
WHERE created_at >= '2025-12-04T10:00:00Z'
  AND environment = 'live';

-- 対象ユーザーの詳細確認
SELECT
  u.email,
  us.plan_type,
  us.is_active,
  us.created_at
FROM user_subscriptions us
JOIN auth.users u ON us.user_id = u.id
WHERE us.created_at >= '2025-12-04T10:00:00Z'
  AND us.environment = 'live'
LIMIT 10;
```

---

## ロールバック実行手順

### Step 1: 準備

```bash
# 1. 対象リストをエクスポート
npx tsx scripts/migration/export-rollback-targets.ts \
  --since="2025-12-04T10:00:00Z" \
  --output=rollback-targets.csv

# 2. 対象数を確認
wc -l rollback-targets.csv
```

### Step 2: ドライラン

```bash
# ドライランモード（実際には削除しない）
npx tsx scripts/migration/rollback-batch.ts \
  --csv=rollback-targets.csv \
  --dry-run
```

### Step 3: 実行

```bash
# 実際にロールバック
npx tsx scripts/migration/rollback-batch.ts \
  --csv=rollback-targets.csv \
  --confirm
```

### Step 4: 確認

```bash
# ロールバック結果を確認
npx tsx scripts/migration/verify-rollback.ts \
  --csv=rollback-targets.csv
```

---

## ロールバック後の対応

### ユーザーへの案内

ロールバック後、ユーザーには以下を案内：

1. 従来のMemberstackでログインしてください
2. 新システムへの移行は後日改めてご案内します
3. サブスクリプションへの影響はありません

### システム確認

- [ ] Memberstackでのログイン動作確認
- [ ] サブスクリプション状態確認（Stripe）
- [ ] 問題の原因調査・修正

---

## 緊急ロールバック

### 全件ロールバック（最終手段）

```sql
-- 警告: 全移行ユーザーを削除
-- 必ずバックアップを取ってから実行

-- 1. 移行ユーザーを特定（メタデータで判別）
CREATE TEMP TABLE migration_users AS
SELECT id FROM auth.users
WHERE raw_user_meta_data->>'migrated_from' = 'memberstack';

-- 2. user_subscriptions 削除
DELETE FROM user_subscriptions
WHERE user_id IN (SELECT id FROM migration_users);

-- 3. stripe_customers 削除
DELETE FROM stripe_customers
WHERE user_id IN (SELECT id FROM migration_users);

-- 4. auth.users 削除（Admin APIで実行）
```

---

## ログ形式

### ロールバックログ

```json
{
  "timestamp": "2025-12-04T12:00:00Z",
  "action": "rollback",
  "user_id": "xxxxx-xxxx-xxxx",
  "email": "user@example.com",
  "reason": "migration_error",
  "deleted_from": [
    "user_subscriptions",
    "stripe_customers",
    "auth.users"
  ],
  "success": true
}
```

### ログファイル保存場所

```
logs/
├── migration/
│   ├── 2025-12-04-migration.log
│   └── 2025-12-04-rollback.log
```

---

## 関連ドキュメント

- [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) - 移行計画
- [DATA-MAPPING.md](./DATA-MAPPING.md) - データマッピング
