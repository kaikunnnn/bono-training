# サブスクリプション同期問題 調査記録

**発生日**: 2025-12-24
**報告者**: ユーザーテストで発覚
**ステータス**: 🔴 調査中

---

## 問題の概要

### 対象ユーザー
- **メールアドレス**: renrenkon.800@gmail.com
- **Stripe顧客ID**: cus_R4SGJ7BOlYoWQS
- **ユーザー種別**: 出戻りユーザー（過去に契約→キャンセル→再契約）

### 症状

| 項目 | 期待される状態 | 実際の状態 |
|------|---------------|-----------|
| Stripe課金 | 有効 | ✅ 有効（スタンダードプラン[1ヶ月JP]） |
| アカウント情報画面 | 「スタンダードプラン」表示 | ❌ 「無料」と表示 |
| コンソールログ | `subscribed: true` | ❌ `subscribed: false` |
| レッスン制御 | 有料のみ表示 | ❌ 全レッスンが見えている |

### コンソールログの詳細

```javascript
購読状態確認結果:
{
  subscribed: false,
  planType: 'standard',
  duration: 1,
  isSubscribed: false,
  cancelAtPeriodEnd: false,
  ...
}
```

**注目点**: `planType: 'standard'` なのに `subscribed: false`

---

## Stripe側の状態

### サブスクリプション履歴（3件）

| # | プラン | ステータス | 頻度 | 備考 |
|---|--------|-----------|------|------|
| 1 | スタンダードプラン[1ヶ月JP] | **有効** | 毎月 | 現在アクティブ |
| 2 | スタンダードプラン[1ヶ月JP] | キャンセル済み | 毎月 | 過去の契約 |
| 3 | スタンダードプラン[3ヶ月JP] | キャンセル済み | 3ヶ月 | 過去の契約 |

### 支払い履歴

| 金額 | ステータス | 説明 | 日付 |
|------|-----------|------|------|
| ¥5,478 | 成功 | Subscription creation | 11/24 17:34 |
| ¥6,800 | 成功 | Subscription creation | 06/17 19:50 |
| ¥14,800 | キャンセル済み | フィードバック単発 | 04/02 19:24 |
| ¥13,134 | 成功 | Subscription update | 01/21 21:03 |

### 顧客情報
- **顧客ID**: cus_R4SGJ7BOlYoWQS
- **利用開始日**: 2024/10/21
- **請求書メール**: renrenkon.800@gmail.com

---

## 疑われる原因

### 仮説1: Supabase側にサブスクリプションデータがない/古い
- Webhook連携が失敗している可能性
- 出戻りユーザーの再契約がDBに反映されていない

### 仮説2: customer_idとuser_idの紐付けがない
- 新しいSupabaseアカウントとStripeのcustomer_idが紐付いていない

### 仮説3: subscriptionsテーブルのstatusが更新されていない
- 過去のキャンセル済みレコードのみ存在
- 新しい有効なサブスクリプションが追加されていない

### 仮説4: レッスン制御ロジックの問題
- `subscribed: false` でも全レッスンが見える
- 制御が正しく機能していない

---

## 次のアクション

1. [ ] Supabaseの`profiles`テーブルでユーザー確認
2. [ ] Supabaseの`subscriptions`テーブルの状態確認
3. [ ] `stripe_customer_id`の紐付け確認
4. [ ] Webhook履歴の確認（Edge Function logs）
5. [ ] レッスン制御ロジックの確認

---

## 調査結果

### auth.users テーブル
```
id: 4c103d86-fa2e-4643-bef8-0ce2b1fb5237
email: renrenkon.800@gmail.com
created_at: 2025-11-19 09:00:24
```

### stripe_customers テーブル
```
user_id: 4c103d86-fa2e-4643-bef8-0ce2b1fb5237
stripe_customer_id: cus_R4SGJ7BOlYoWQS  ← Stripeと一致 ✅
environment: live
```

### user_subscriptions テーブル ← 🔴 問題箇所
```
user_id: 4c103d86-fa2e-4643-bef8-0ce2b1fb5237
plan_type: standard
is_active: false           ← 本来 true であるべき
stripe_subscription_id: null   ← 本来 sub_xxx が入るべき
stripe_customer_id: null       ← 本来 cus_xxx が入るべき
updated_at: 2025-11-19     ← アカウント作成時から更新されていない
```

### webhook_events テーブル
```
最古のイベント: 2025-12-02 05:07:49
最新のイベント: 2025-12-23 16:20:38
総イベント数: 439
```

---

## 🔴 根本原因の特定

### 原因1: DBトリガーによるデフォルト値問題

**発見したトリガー:**
```sql
-- トリガー名: on_auth_user_created_subscription
-- テーブル: auth.users
-- 関数: handle_new_user_subscription

CREATE OR REPLACE FUNCTION "public"."handle_new_user_subscription"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    is_active,
    plan_type,              -- ← 問題: 常に 'standard'
    stripe_subscription_id
  ) VALUES (
    NEW.id,
    false,                  -- ← 常に false
    'standard',             -- ← 常に 'standard'（本来は null であるべき）
    NULL
  );
  RETURN NEW;
END;
$$;
```

**問題点:**
- `auth.users` にレコードが作成されると、自動的に `user_subscriptions` に初期レコードが作成される
- `plan_type` が無条件で `'standard'` に設定される
- これが「無料ユーザーなのに planType: 'standard'」の原因

### 原因2: 移行スクリプト Step 3 が未実行

**移行処理の設計:**
1. Step 1: auth.users にユーザー作成 ✅ 完了
2. Step 2: stripe_customers に紐付け作成 ✅ 完了（一部）
3. Step 3: user_subscriptions にサブスク情報同期 ❌ 未実行

**時系列:**
1. 2025-11-19: 移行スクリプトで auth.users にユーザー作成
2. 2025-11-19: DBトリガーが発火 → `user_subscriptions` に `is_active: false, plan_type: 'standard'` を挿入
3. 2025-11-19: Step 3 が実行されなかった → Stripe情報が反映されない
4. 2025-11-24 17:34: ユーザーが旧BONOサイトで課金 → 新システムには反映されない
5. 2025-12-02: Webhookシステム稼働開始（しかし既存ユーザーには効果なし）
6. 2025-12-24: ユーザーが「無料」と表示される問題を報告

**テストアカウントが動作した理由:**
- kyasya00@gmail.com: 12/6にWebhookまたは手動で更新
- takumi.kai.skywalker@gmail.com: 12/5にWebhookまたは手動で更新
- 両方とも12/2以降のWebhook稼働後に更新されたため正常

### 影響範囲

**移行時（11/19）に作成された約1,785ユーザー**が以下の状態：
- `is_active: false`
- `plan_type: 'standard'`（誤）
- `stripe_subscription_id: null`
- `stripe_customer_id: null`

**うち、Stripeで有効なサブスクを持つユーザーはサービス利用不可**

---

## 修正方針

### 即時対応（renrenkon.800@gmail.com）
1. Stripeから有効なサブスク情報を取得
2. `user_subscriptions` テーブルを手動で更新
   - `is_active: true`
   - `stripe_subscription_id: sub_xxx`
   - `stripe_customer_id: cus_R4SGJ7BOlYoWQS`
   - `current_period_end: xxx`

### 全体対応（影響を受けた全ユーザー）
1. Stripeから全アクティブサブスクを取得（list subscriptions API）
2. 各サブスクの customer_id → stripe_customers テーブル → user_id を特定
3. user_subscriptions テーブルを更新
4. 修正スクリプトを作成して一括実行

### DBトリガーの修正（将来の問題防止）
`handle_new_user_subscription` 関数を修正：
- `plan_type` のデフォルトを `null` に変更
- または `'free'` に変更

---

## 更新履歴

| 日時 | 内容 |
|------|------|
| 2025-12-24 | 根本原因特定: DBトリガー + 移行Step3未実行 |
| 2025-12-24 | 初版作成（問題の記録） |
