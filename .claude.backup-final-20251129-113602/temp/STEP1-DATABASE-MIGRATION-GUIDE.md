# ステップ1: データベースのdurationカラム追加ガイド

**実施日**: 2025-11-16
**所要時間**: 5分
**目的**: `user_subscriptions`テーブルに`duration`カラムを追加

---

## 📋 実施手順

### 1. Supabase Dashboardを開く

1. ブラウザで https://supabase.com/dashboard にアクセス
2. プロジェクト「bono-training」を選択
3. 左サイドバーから「SQL Editor」をクリック

---

### 2. SQLスクリプトを実行

#### 方法A: ファイルから実行（推奨）

1. SQL Editorで「New query」をクリック
2. 以下のファイルの内容をコピー:
   ```
   .claude/temp/apply-duration-migration.sql
   ```
3. SQL Editorにペースト
4. 右下の「Run」ボタンをクリック

#### 方法B: 直接入力

以下のSQLを直接入力して実行:

```sql
-- durationカラムを追加
ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS duration INTEGER DEFAULT 1;

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_plan_duration
ON user_subscriptions(plan_type, duration);

-- コメントを追加
COMMENT ON COLUMN user_subscriptions.duration IS 'プランの契約期間（月単位）。1 = 1ヶ月、3 = 3ヶ月';
```

---

### 3. 実行結果の確認

#### 期待される結果

**ステップ1（実行前のテーブル構造）**:
```
column_name           | data_type | is_nullable | column_default
----------------------|-----------|-------------|---------------
user_id               | uuid      | NO          | ...
plan_type             | text      | YES         | NULL
is_active             | boolean   | YES         | ...
... (durationカラムは存在しない)
```

**ステップ5（実行後のテーブル構造）**:
```
column_name           | data_type | is_nullable | column_default
----------------------|-----------|-------------|---------------
user_id               | uuid      | NO          | ...
plan_type             | text      | YES         | NULL
duration              | integer   | YES         | 1        ← 追加された！
is_active             | boolean   | YES         | ...
```

**ステップ6（既存データの確認）**:
```
user_id  | plan_type | duration | is_active | stripe_subscription_id
---------|-----------|----------|-----------|----------------------
xxxxxxx  | feedback  | 1        | true      | sub_xxxxxx
xxxxxxx  | standard  | 1        | true      | sub_xxxxxx
```

すべての既存レコードの`duration`が`1`（デフォルト値）になっていることを確認してください。

---

### 4. エラーが発生した場合

#### エラー1: 「column "duration" already exists」

**意味**: durationカラムは既に存在しています。

**対処**:
- これは正常な状態です。
- 確認用のSQLを実行してカラムが存在することを確認:
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name = 'duration';
```

#### エラー2: 「permission denied」

**意味**: 権限がありません。

**対処**:
- Supabaseのプロジェクトオーナーでログインしているか確認
- または、Supabase CLIで実行（次のセクション参照）

---

## ✅ 完了条件チェックリスト

以下の確認SQLを実行して、すべてOKであることを確認してください:

### チェック1: durationカラムが存在する
```sql
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name = 'duration';
```

**期待される結果**:
```
column_name | data_type | column_default
------------|-----------|---------------
duration    | integer   | 1
```

**結果**: [ ] OK / [ ] NG

---

### チェック2: インデックスが作成されている
```sql
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'user_subscriptions' AND indexname = 'idx_user_subscriptions_plan_duration';
```

**期待される結果**:
```
indexname                              | indexdef
---------------------------------------|------------------------------------------
idx_user_subscriptions_plan_duration  | CREATE INDEX ... ON user_subscriptions...
```

**結果**: [ ] OK / [ ] NG

---

### チェック3: 既存データのdurationがすべて1になっている
```sql
SELECT
  COUNT(*) as total_records,
  COUNT(duration) as records_with_duration,
  AVG(duration) as avg_duration
FROM user_subscriptions;
```

**期待される結果**:
- `total_records` = `records_with_duration`（すべてのレコードにduration値がある）
- `avg_duration` = 1（すべてデフォルト値）

**結果**: [ ] OK / [ ] NG

---

## 📝 実施結果の記録

### 実施日時
- [ ] 実施済み
- 実施日時: _________________

### 実行したSQL
- [ ] apply-duration-migration.sql を実行
- [ ] 手動でSQLを入力して実行

### 結果
- [ ] 成功（durationカラムが追加された）
- [ ] 既に存在していた（問題なし）
- [ ] エラーが発生した

### エラー内容（該当する場合）
```
[エラーメッセージを記載]
```

### データベースの状態
- durationカラムの存在: [ ] YES / [ ] NO
- インデックスの存在: [ ] YES / [ ] NO
- 既存データのduration値: [ ] すべて1 / [ ] その他

### メモ
```
[特記事項があれば記載]
```

---

## 🔄 次のステップ

### ステップ1が完了したら

1. このファイルの「実施結果の記録」セクションを埋める
2. `subscription-fix-plan.md` のステップ1を完了としてマーク
3. ステップ2（二重課金の原因調査）に進む

---

## 🆘 トラブルシューティング

### Q: Supabase Dashboardにログインできない
**A**:
1. https://supabase.com/dashboard でログイン
2. プロジェクトが表示されない場合、招待リンクを確認

### Q: SQL Editorが見つからない
**A**:
1. プロジェクトダッシュボードを開く
2. 左サイドバーの「SQL Editor」をクリック
3. 見つからない場合、「Database」→「SQL」を探す

### Q: durationカラムが既に存在する
**A**:
- これは正常です！
- 確認SQLを実行して、データが正しいことを確認してください

---

**作成者**: Claude Code
**作成日**: 2025-11-16
**関連ファイル**:
- `supabase/migrations/20250107_add_duration_to_subscriptions.sql`
- `.claude/temp/apply-duration-migration.sql`
