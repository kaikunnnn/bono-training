# データ移行テストガイド

**作成日**: 2025-11-19
**目的**: 段階的に安全にデータ移行を行う

---

## 🎯 テスト戦略

### Phase 0: 1件テスト（最初）
- **対象**: 春奈 宮地 (harunaru888@gmail.com)
- **目的**: スクリプトの動作確認
- **所要時間**: 10分

### Phase 1: 10件テスト（次）
- **対象**: 最初の10件の顧客
- **目的**: バッチ処理の確認
- **所要時間**: 15分

### Phase 2: 全件移行（最後）
- **対象**: 全2,162件
- **目的**: 本番移行
- **所要時間**: 2-3時間

---

## 📋 Phase 0: 1件テスト

### Step 1: テスト用CSVの確認

すでに作成済み:
- `stripe-customers-test.csv` (1件)
- `stripe-subscriptions-test.csv` (1件)

確認:
```bash
cat stripe-customers-test.csv
cat stripe-subscriptions-test.csv
```

### Step 2: Script 1 - Authユーザー作成

```bash
npx tsx scripts/migrate-create-auth-users.ts stripe-customers-test.csv
```

**期待される結果**:
```
📊 Total customers to migrate: 1
📁 Reading from: stripe-customers-test.csv

✅ Created user: harunaru888@gmail.com (xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx)

========================================
Migration Summary - Auth Users
========================================
Total: 1
✅ Success: 1
⏭️  Skipped: 0
❌ Error: 0
========================================
```

**確認**:
- Supabase Dashboard → Authentication → Users
- `harunaru888@gmail.com` が追加されているか
- User Metadata に `migrated_from: "stripe"` があるか

---

### Step 3: Script 2 - stripe_customersテーブル

```bash
npx tsx scripts/migrate-stripe-customers.ts stripe-customers-test.csv
```

**期待される結果**:
```
📊 Total customers to sync: 1
📁 Reading from: stripe-customers-test.csv

✅ Synced: harunaru888@gmail.com → cus_TRW1X1sonM5NPt

========================================
Migration Summary - Stripe Customers
========================================
✅ Success: 1 / 1
❌ Error: 0
========================================
```

**確認**:
```sql
SELECT * FROM stripe_customers
WHERE stripe_customer_id = 'cus_TRW1X1sonM5NPt';
```

---

### Step 4: Script 3 - user_subscriptionsテーブル

```bash
npx tsx scripts/migrate-subscriptions.ts stripe-subscriptions-test.csv
```

**期待される結果**:
```
📊 Total subscriptions to migrate: 1
📁 Reading from: stripe-subscriptions-test.csv

✅ Migrated subscription: sub_1SUd2hKUVUnt8Gty4JNvXddR (active)

========================================
Migration Summary - Subscriptions
========================================
✅ Success: 1 / 1
❌ Error: 0
========================================
```

**確認**:
```sql
SELECT
  u.email,
  sc.stripe_customer_id,
  us.stripe_subscription_id,
  us.plan_type,
  us.duration,
  us.is_active,
  us.current_period_end
FROM auth.users u
JOIN stripe_customers sc ON u.id = sc.user_id
JOIN user_subscriptions us ON u.id = us.user_id
WHERE u.email = 'harunaru888@gmail.com';
```

**期待される結果**:
```
email: harunaru888@gmail.com
stripe_customer_id: cus_TRW1X1sonM5NPt
stripe_subscription_id: sub_1SUd2hKUVUnt8Gty4JNvXddR
plan_type: standard
duration: 3
is_active: true
current_period_end: 2026-02-18T00:45:00.000Z
```

---

### Step 5: 動作確認（重要！）

#### 5-1. ログインテスト

1. **パスワードリセットメールを送信**
   - Supabase Dashboard → Authentication → Users
   - `harunaru888@gmail.com` をクリック
   - 「Send password recovery email」をクリック

2. **メールを確認**
   - 春奈さんにパスワード設定メールが届く
   - リンクをクリックしてパスワードを設定

3. **ログインテスト**
   - 新サイトでログイン
   - サブスクリプション情報が表示されるか確認

#### 5-2. サブスクリプション情報の表示

以下が正しく表示されるか確認:
- ✅ プラン名: Standard
- ✅ 期間: 3ヶ月
- ✅ 次回更新日: 2026年2月18日
- ✅ ステータス: アクティブ

#### 5-3. メンバー限定コンテンツのアクセス

- ✅ メンバー限定コンテンツが閲覧できるか

---

### ✅ Phase 0 チェックリスト

全てクリアしたら次のPhaseへ:

- [ ] Script 1 実行成功
- [ ] Script 2 実行成功
- [ ] Script 3 実行成功
- [ ] Supabaseにデータが正しく保存されている
- [ ] ログインできる
- [ ] サブスクリプション情報が正しく表示される
- [ ] メンバー限定コンテンツにアクセスできる

---

## 📋 Phase 1: 10件テスト

### Step 1: 10件のテスト用CSVを作成

```bash
head -n 11 stripe-customers.csv > stripe-customers-10.csv
head -n 11 stripe-subscriptions.csv > stripe-subscriptions-10.csv
```

### Step 2: スクリプトを実行

```bash
npx tsx scripts/migrate-create-auth-users.ts stripe-customers-10.csv
npx tsx scripts/migrate-stripe-customers.ts stripe-customers-10.csv
npx tsx scripts/migrate-subscriptions.ts stripe-subscriptions-10.csv
```

### Step 3: 確認

```sql
-- 移行されたユーザー数を確認
SELECT COUNT(*) FROM auth.users
WHERE raw_user_meta_data->>'migrated_from' = 'stripe';

-- サブスクリプション数を確認
SELECT COUNT(*) FROM user_subscriptions
WHERE stripe_subscription_id IS NOT NULL;
```

**期待される結果**:
- Authユーザー: 10件（既存テストユーザーは除く）
- user_subscriptions: 10件前後（サブスクリプションがないユーザーもいる可能性）

---

## 📋 Phase 2: 全件移行

### ⚠️ 注意事項

- 全2,162件の移行には**2-3時間**かかります
- エラーが発生してもスクリプトは継続します
- エラーログは自動保存されます

### Step 1: 全件移行を実行

```bash
# 1. Authユーザー作成（約30分）
npx tsx scripts/migrate-create-auth-users.ts stripe-customers.csv

# 2. stripe_customers同期（約20分）
npx tsx scripts/migrate-stripe-customers.ts stripe-customers.csv

# 3. user_subscriptions同期（約20分）
npx tsx scripts/migrate-subscriptions.ts stripe-subscriptions.csv
```

### Step 2: 結果確認

```sql
-- 全体のデータ数を確認
SELECT
  'auth.users' as table_name,
  COUNT(*) as count
FROM auth.users
WHERE raw_user_meta_data->>'migrated_from' = 'stripe'
UNION ALL
SELECT 'stripe_customers', COUNT(*) FROM stripe_customers
UNION ALL
SELECT 'user_subscriptions', COUNT(*) FROM user_subscriptions
WHERE stripe_subscription_id IS NOT NULL;
```

**期待される結果**:
- auth.users: 2,162件前後
- stripe_customers: 2,162件前後
- user_subscriptions: 250件前後（アクティブなサブスクリプションのみ）

### Step 3: エラーログの確認

エラーがあった場合:
```bash
cat migration-errors-auth.json
cat migration-errors-customers.json
cat migration-errors-subscriptions.json
```

---

## 🔄 ロールバック方法

### 移行したデータを削除する場合

```sql
-- 移行されたAuthユーザーのみ削除
-- ⚠️ 注意: この操作は取り消せません

-- まずuser_idを確認
SELECT id, email FROM auth.users
WHERE raw_user_meta_data->>'migrated_from' = 'stripe'
LIMIT 5;

-- 関連データを削除
DELETE FROM user_subscriptions
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE raw_user_meta_data->>'migrated_from' = 'stripe'
);

DELETE FROM stripe_customers
WHERE user_id IN (
  SELECT id FROM auth.users
  WHERE raw_user_meta_data->>'migrated_from' = 'stripe'
);

-- Authユーザーを削除（Supabase DashboardまたはAdmin APIで実行）
```

---

## 🐛 トラブルシューティング

### エラー: "User already exists"

**原因**: 既に同じメールアドレスのユーザーが存在
**対応**: スキップされるので問題なし

### エラー: "Customer not found"

**原因**: Script 2が実行されていない
**対応**: Script 2を先に実行

### エラー: "Invalid date"

**原因**: CSVの日付フォーマットが異なる
**対応**: CSVのサンプルを確認してスクリプトを調整

---

## 📝 次のステップ

Phase 0が成功したら:

1. **Phase 1に進む** - 10件テスト
2. **Phase 2に進む** - 全件移行
3. **並行稼働開始** - 既存サイトと新サイトを同時稼働
4. **1週間モニタリング** - 問題がないか確認
5. **完全移行** - 既存サイトを停止

---

**現在の状態**: Phase 0 準備完了 ✅
**次のアクション**: Script 1を実行してください
