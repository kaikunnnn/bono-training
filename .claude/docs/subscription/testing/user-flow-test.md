# サブスクリプション ユーザーフローテスト

**作成日**: 2025-11-24
**目的**: 実装済みユーザーフローの動作確認

---

## テスト環境

- **テストモード**: Stripe Test Mode
- **テストユーザー**: `test-user@example.com`
- **テストカード**: `4242 4242 4242 4242`

---

## Test 1: ログイン済みユーザーの新規登録

### 前提条件
- [ ] ユーザーがログイン済み
- [ ] サブスクリプション未登録状態

### テスト手順

1. `/subscription` ページにアクセス
2. プランを選択（Standard / Feedback）
3. 期間を選択（1ヶ月 / 3ヶ月）
4. 「今すぐ始める」ボタンをクリック
5. Stripe Checkout ページで決済情報入力
6. 決済完了
7. `/subscription/success` ページにリダイレクト

### 期待される結果

#### ✅ フロントエンド
- [ ] `/subscription` ページで選択したプランが表示される
- [ ] `/subscription/success` ページに正常に遷移
- [ ] サブスクリプション情報が正しく表示される

#### ✅ データベース

**user_subscriptions テーブル**:
```sql
SELECT
  user_id,
  stripe_subscription_id,
  stripe_customer_id,
  plan_type,
  duration,
  status,
  created_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**期待値**:
- user_id: （テストユーザーのID）
- stripe_subscription_id: `sub_xxxxx`
- stripe_customer_id: `cus_xxxxx`
- plan_type: 選択したプラン（'standard' / 'feedback'）
- duration: 選択した期間（1 / 3）
- status: 'active'

#### ✅ Stripe Dashboard
- [ ] 新しいサブスクリプションが作成されている
- [ ] ステータスが 'active'
- [ ] 正しいプラン・金額が設定されている

### 実施結果

**実施日時**:

**フロントエンド結果**:
```
[選択したプラン・期間を記入]
[リダイレクト先URL]
[表示されたサブスクリプション情報]
```

**データベース結果**:
```sql
[SQL クエリの実行結果をここに貼り付け]
```

**Stripe Dashboard**:
```
[Subscription ID]
[ステータス]
[金額]
```

**判定**: ✅ 成功 / ❌ 失敗 / ⚠️ 部分成功

**備考**:
```
[問題点・気づいた点があれば記入]
```

---

## Test 2: プラン変更（Standard 1M → Feedback 1M）

### 前提条件
- [ ] Standard 1ヶ月プランに登録済み

### テスト手順

1. `/subscription` ページにアクセス
2. 「Feedback 1ヶ月」プランの「このプランに変更」ボタンをクリック
3. Customer Portal で変更内容を確認
4. 「確定」ボタンをクリック
5. `/subscription` ページに戻る

### 期待される結果

#### ✅ フロントエンド
- [ ] プラン変更後、Feedback プランが表示される
- [ ] プロレーション（日割り計算）が正しく表示される

#### ✅ データベース

**変更前の状態を記録**:
```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**変更後の状態を確認**:
```sql
SELECT plan_type, duration, stripe_subscription_id, updated_at
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**期待値**:
- plan_type: 'standard' → 'feedback'
- duration: 1（変更なし）
- stripe_subscription_id: （同じID）
- updated_at: （更新されている）

#### ✅ Stripe Dashboard
- [ ] サブスクリプションIDは変わらない
- [ ] Subscription Items が更新されている
- [ ] プロレーションが正しく計算されている

#### ✅ Edge Functions Logs
```bash
npx supabase functions logs stripe-webhook-test --limit 20
```

**期待値**:
- [ ] `POST | 200 | stripe-webhook-test`
- [ ] `customer.subscription.updated` イベントが処理されている
- [ ] エラーなし

### 実施結果

**実施日時**:

**変更前の状態**:
```sql
[変更前のクエリ結果]
```

**変更後の状態**:
```sql
[変更後のクエリ結果]
```

**Stripe Dashboard**:
```
[Subscription ID（変更前後で同じか確認）]
[プロレーション金額]
[新しいプラン]
```

**Edge Functions Logs**:
```
[ログの関連部分を貼り付け]
```

**判定**: ✅ 成功 / ❌ 失敗 / ⚠️ 部分成功

**備考**:
```
[問題点・気づいた点があれば記入]
```

---

## Test 3: 期間変更（1ヶ月 → 3ヶ月）

### 前提条件
- [ ] 任意のプランで 1ヶ月登録済み

### テスト手順

1. `/subscription` ページにアクセス
2. 現在のプランで「3ヶ月」を選択
3. 「このプランに変更」ボタンをクリック
4. Customer Portal で変更内容を確認
5. 「確定」ボタンをクリック

### 期待される結果

#### ✅ フロントエンド
- [ ] 期間が 3ヶ月に変更されている
- [ ] プロレーションが正しく表示される

#### ✅ データベース

**期待値**:
- plan_type: （変更なし）
- duration: 1 → 3
- stripe_subscription_id: （同じID）

### 実施結果

**実施日時**:

**変更前の状態**:
```sql
[変更前のクエリ結果]
```

**変更後の状態**:
```sql
[変更後のクエリ結果]
```

**判定**: ✅ 成功 / ❌ 失敗 / ⚠️ 部分成功

**備考**:
```
[問題点・気づいた点があれば記入]
```

---

## Test 4: キャンセル

### 前提条件
- [ ] 任意のプランに登録済み

### テスト手順

1. `/subscription` ページにアクセス
2. 「サブスクリプションを管理」ボタンをクリック
3. Customer Portal で「キャンセル」を選択
4. キャンセル理由を選択
5. 「キャンセル確定」ボタンをクリック

### 期待される結果

#### ✅ フロントエンド
- [ ] 「キャンセル予定」バッジが表示される
- [ ] キャンセル日（次回更新日）が表示される
- [ ] コンテンツにはキャンセル日まで引き続きアクセス可能

#### ✅ データベース

**期待値**:
- status: 'active'（キャンセル日まではアクティブ）
- cancel_at_period_end: true
- current_period_end: （キャンセル日）

### 実施結果

**実施日時**:

**キャンセル後の状態**:
```sql
SELECT status, cancel_at_period_end, current_period_end
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]';
```

**フロントエンド表示**:
```
[表示されたバッジ・メッセージ]
[キャンセル日]
```

**判定**: ✅ 成功 / ❌ 失敗 / ⚠️ 部分成功

**備考**:
```
[問題点・気づいた点があれば記入]
```

---

## Test 5: 二重課金防止

### 前提条件
- [ ] 既にサブスクリプション登録済み

### テスト手順

1. `/subscription` ページにアクセス
2. 別のプランの「今すぐ始める」ボタンをクリック
3. Stripe Checkout に遷移
4. 決済完了

### 期待される結果

#### ✅ データベース
- [ ] user_subscriptions テーブルに**レコードが1件のみ**存在
- [ ] 古いサブスクリプションが自動的にキャンセルされている

#### ✅ Stripe Dashboard
- [ ] 古いサブスクリプションがキャンセルされている
- [ ] 新しいサブスクリプションのみがアクティブ

### 実施結果

**実施日時**:

**データベース結果**:
```sql
SELECT COUNT(*) as subscription_count
FROM user_subscriptions
WHERE user_id = '[テストユーザーID]' AND status = 'active';

-- 期待値: 1
```

**Stripe Dashboard**:
```
[古いサブスクリプションのステータス]
[新しいサブスクリプションのステータス]
```

**判定**: ✅ 成功 / ❌ 失敗 / ⚠️ 部分成功

**備考**:
```
[問題点・気づいた点があれば記入]
```

---

## テストサマリー

| Test | 実施日 | 結果 | 備考 |
|------|--------|------|------|
| Test 1: 新規登録 | | | |
| Test 2: プラン変更 | | | |
| Test 3: 期間変更 | | | |
| Test 4: キャンセル | | | |
| Test 5: 二重課金防止 | | | |

**総合判定**:

**次のアクション**:
```
[実施後の対応を記入]
```

---

**最終更新**: 2025-11-24
