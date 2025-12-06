# ステップ2: 二重課金の原因調査ガイド

**実施日**: 2025-11-16
**所要時間**: 30分
**目的**: 二重課金の原因を特定する

---

## 📋 調査の流れ

1. Stripeダッシュボードで二重課金の状態を確認
2. Supabaseデータベースでサブスクリプション情報を確認
3. Webhookログを確認（Supabase Edge Functions）
4. 原因を特定

---

## 🔍 調査1: Stripeダッシュボードで確認

### 手順

1. **https://dashboard.stripe.com/test/subscriptions** を開く
2. 検索ボックスに `takumi.kai.skywalker@gmail.com` を入力
3. 表示されたサブスクリプションを確認

### 記録シート

| # | Subscription ID | Status | Plan | Amount | Created |
|---|----------------|--------|------|--------|---------|
| 1 | sub___________ | Active/Canceled | Standard/Feedback | ___円 | __/__/__ |
| 2 | sub___________ | Active/Canceled | Standard/Feedback | ___円 | __/__/__ |
| 3 | sub___________ | Active/Canceled | Standard/Feedback | ___円 | __/__/__ |

### 確認ポイント

- [ ] アクティブなサブスクリプションが何個ありますか？ _____個
- [ ] もし2個以上なら、どのプランが重複していますか？ _______________
- [ ] それぞれのサブスクリプションの作成日時は？ _______________

---

## 🔍 調査2: Supabaseデータベースで確認

### 手順

1. **Supabase Dashboard → SQL Editor** を開く
2. 以下のSQLを実行

#### SQL 1: ユーザーIDを取得

```sql
SELECT id, email, created_at
FROM auth.users
WHERE email = 'takumi.kai.skywalker@gmail.com';
```

**結果を記録**:
- User ID: `________________________________________`

---

#### SQL 2: user_subscriptionsテーブルを確認

上記で取得したUser IDを使って以下を実行:

```sql
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  stripe_subscription_id,
  stripe_customer_id,
  created_at,
  updated_at
FROM user_subscriptions
WHERE user_id = '[ここに上記のUser IDを入力]'
ORDER BY created_at DESC;
```

**結果を記録**:

| plan_type | duration | is_active | stripe_subscription_id | created_at |
|-----------|----------|-----------|------------------------|------------|
|           |          | true/false|                        |            |
|           |          | true/false|                        |            |

---

#### SQL 3: アクティブなサブスクリプション数を確認

```sql
SELECT
  user_id,
  COUNT(*) as active_subscriptions
FROM user_subscriptions
WHERE user_id = '[ここに上記のUser IDを入力]'
  AND is_active = true
GROUP BY user_id;
```

**結果を記録**:
- アクティブなサブスクリプション数: `_____`個

**期待値**: 1個
**実際**: _____個

- [ ] もし2個以上なら、二重課金が発生しています

---

## 🔍 調査3: Webhookログの確認

### 手順

1. **Supabase Dashboard → Edge Functions** を開く
2. `stripe-webhook` を選択
3. 「Logs」タブをクリック
4. 最新のログを確認

### 確認ポイント

以下のログメッセージを探してください:

#### ✅ 正常なログ（期待されるログ）

```
checkout.session.completed イベントを処理中
既存サブスクリプション sub_xxxxx をキャンセルします
既存サブスクリプション sub_xxxxx をキャンセルしました
```

#### ❌ 問題のあるログ

```
checkout.session.completed イベントを処理中
（既存サブスクリプションのキャンセルに関するログがない）
```

または

```
既存サブスクリプションのキャンセルに失敗: [エラーメッセージ]
```

### 記録シート

**最新のcheckout.session.completedイベント**:
- [ ] 見つかった
- [ ] 見つからない

**ログの内容**:
```
[ここにログをコピペ]
```

**`replace_subscription_id`が含まれていますか？**
- [ ] YES
- [ ] NO

**既存サブスクリプションのキャンセルログがありますか？**
- [ ] YES（正常）
- [ ] NO（問題あり）

**エラーメッセージがありますか？**
- [ ] YES → エラー内容: _______________
- [ ] NO

---

## 🔍 調査4: create-checkoutのメタデータ確認

Webhookで`replace_subscription_id`が受信されているか確認するため、create-checkoutのコードを確認します。

### 確認するファイル

`supabase/functions/create-checkout/index.ts`

### 確認ポイント

以下のようなコードが存在するか:

```typescript
// 既存サブスクリプションの確認
const { data: existingSubscription } = await supabase
  .from('user_subscriptions')
  .select('stripe_subscription_id')
  .eq('user_id', user.id)
  .eq('is_active', true)
  .single();

const metadata: any = {
  user_id: user.id,
  plan_type: planType,
  duration: duration.toString(),
};

// 既存サブスクリプションがある場合、メタデータに追加
if (existingSubscription?.stripe_subscription_id) {
  metadata.replace_subscription_id = existingSubscription.stripe_subscription_id;
}
```

**確認結果**:
- [ ] 上記のコードが存在する
- [ ] 上記のコードが存在しない
- [ ] 似たコードがあるが、少し違う → 違いを記録: _______________

---

## 📊 原因の特定

### パターン1: Webhookで`replace_subscription_id`が処理されていない

**症状**:
- Stripeに2つのアクティブなサブスクリプションがある
- Webhookログに「既存サブスクリプションをキャンセル」のメッセージがない
- `replace_subscription_id`がメタデータに含まれていない

**原因**:
- `create-checkout`で`replace_subscription_id`をメタデータに追加していない
- または、`stripe-webhook`で`replace_subscription_id`を処理していない

**修正方法**: フェーズ2のオプションA（Webhook修正）

---

### パターン2: Webhookでキャンセルに失敗している

**症状**:
- Webhookログに「既存サブスクリプションのキャンセルに失敗」というエラーがある
- `replace_subscription_id`はメタデータに含まれている

**原因**:
- Stripe APIでサブスクリプションのキャンセルに失敗している
- 権限の問題やAPI呼び出しのエラー

**修正方法**: エラーハンドリングの改善

---

### パターン3: データベース更新に失敗している

**症状**:
- Stripeでは古いサブスクリプションがキャンセルされている
- Supabaseの`user_subscriptions`では`is_active = true`のまま

**原因**:
- Webhookでデータベース更新に失敗している

**修正方法**: データベース更新処理の修正

---

## ✅ 調査結果のまとめ

### 二重課金の状態
- [ ] YES - 二重課金が発生している
- [ ] NO - 二重課金は発生していない

### 原因
- [ ] パターン1: `replace_subscription_id`が処理されていない
- [ ] パターン2: Webhookでキャンセルに失敗
- [ ] パターン3: データベース更新に失敗
- [ ] その他: _______________

### 次のアクション
- [ ] フェーズ2オプションA: Webhook修正
- [ ] フェーズ2オプションB: Customer Portal統合
- [ ] その他の修正が必要

---

## 📝 実施結果の記録

### 実施日時
- 実施日時: _________________

### Stripeの状態
- アクティブなサブスクリプション数: _____個
- サブスクリプションID:
  - 1. _____________________
  - 2. _____________________

### Supabaseの状態
- User ID: _____________________
- user_subscriptionsのアクティブレコード数: _____個
- is_active = true のレコード:
  - plan_type: _____, duration: _____, stripe_subscription_id: _____
  - plan_type: _____, duration: _____, stripe_subscription_id: _____

### Webhookログ
- `replace_subscription_id`が含まれている: [ ] YES / [ ] NO
- キャンセル処理のログがある: [ ] YES / [ ] NO
- エラーメッセージ:
```
[エラーがあれば記載]
```

### 特定した原因
```
[原因を記載]
```

### メモ
```
[特記事項があれば記載]
```

---

## 🔄 次のステップ

### 調査が完了したら

1. このファイルの「実施結果の記録」セクションを埋める
2. `subscription-fix-plan.md` のステップ2を完了としてマーク
3. 原因に応じて次のアクションを決定:
   - ステップ3に進む（期間変更の修正）
   - または、フェーズ2（二重課金の根本修正）に進む

---

**作成者**: Claude Code
**作成日**: 2025-11-16
**関連ファイル**:
- `.claude/temp/check-subscription-status.sql`
- `supabase/functions/stripe-webhook/index.ts`
- `supabase/functions/create-checkout/index.ts`
