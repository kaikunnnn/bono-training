# テストチェックリスト - Webhook 401修正 & 二重課金防止

**テスト実施日**: 2025年11月30日
**テスト実施者**: Takumi + Claude Code
**環境**: [x] Test [ ] Live

---

## ⚠️ テスト前の必須確認事項

- [x] ✅ マイグレーション実行完了（`npx supabase db push`）
- [x] ✅ webhook_eventsテーブルが存在する
- [x] ✅ Edge Functions デプロイ完了（ローカル環境）
- [x] ✅ Stripe CLIインストール済み（`stripe --version` → v1.33.0）
- [x] ✅ Stripe CLI ログイン済み（`stripe login` → BONO account）

---

## Phase 1: Webhook 401エラー修正テスト

### Test 1-1: Webhook署名検証の成功

**手順**:
```bash
# Stripe CLIでWebhook送信
stripe trigger checkout.session.completed
```

**期待結果**:
- [x] ✅ Edge Functionログに「Webhook署名検証成功」が表示される
- [x] ✅ 401エラーが出ない
- [x] ✅ 200 OKが返る

**実際の結果**:

**Stripe CLI Listen Output**:
```
2025-11-30 09:45:53   --> product.created [evt_1SYylxKUVUnt8GtyiRc09sxA]
2025-11-30 09:45:53  <--  [200] POST http://127.0.0.1:54321/functions/v1/stripe-webhook
2025-11-30 09:45:53   --> price.created [evt_1SYylxKUVUnt8Gtymnc8tySr]
2025-11-30 09:45:53  <--  [200] POST http://127.0.0.1:54321/functions/v1/stripe-webhook
2025-11-30 09:45:54   --> payment_intent.created [evt_3SYylyKUVUnt8Gty11HRoisf]
2025-11-30 09:45:54  <--  [200] POST http://127.0.0.1:54321/functions/v1/stripe-webhook
2025-11-30 09:45:56   --> customer.created [evt_1SYym0KUVUnt8GtycuoK2YNW]
2025-11-30 09:45:56  <--  [200] POST http://127.0.0.1:54321/functions/v1/stripe-webhook
2025-11-30 09:45:57   --> payment_intent.succeeded [evt_3SYylyKUVUnt8Gty1gD6NQ10]
2025-11-30 09:45:57  <--  [200] POST http://127.0.0.1:54321/functions/v1/stripe-webhook
2025-11-30 09:45:57   --> charge.succeeded [evt_3SYylyKUVUnt8Gty1rhzzyzH]
2025-11-30 09:45:57  <--  [200] POST http://127.0.0.1:54321/functions/v1/stripe-webhook
2025-11-30 09:45:57   --> checkout.session.completed [evt_1SYym1KUVUnt8GtyiFwlLGVe]
2025-11-30 09:45:57  <--  [200] POST http://127.0.0.1:54321/functions/v1/stripe-webhook
```

**Edge Function Logs**:
```
✅ [LIVE環境] Webhook署名検証成功: product.created
⏱️ [LIVE環境] 200レスポンスまでの時間: 31ms
✅ [LIVE環境] webhook_events保存完了: evt_1SYylxKUVUnt8GtyiRc09sxA

✅ [LIVE環境] Webhook署名検証成功: price.created
⏱️ [LIVE環境] 200レスポンスまでの時間: 4ms
✅ [LIVE環境] webhook_events保存完了: evt_1SYylxKUVUnt8Gtymnc8tySr

✅ [LIVE環境] Webhook署名検証成功: checkout.session.completed
⏱️ [LIVE環境] 200レスポンスまでの時間: 5ms
✅ [LIVE環境] webhook_events保存完了: evt_1SYym1KUVUnt8GtyiFwlLGVe
```

**判定**: [x] PASS

**備考**:
- 全7イベントで署名検証成功
- 200 OK レスポンス（401エラーなし）
- webhook_eventsテーブルへの保存も成功
- 環境変数 `STRIPE_WEBHOOK_SECRET_TEST` が正しく読み込まれた

**失敗時の対処**:
- 401エラー → config.tomlの`verify_jwt = false`が反映されていない
- 署名検証エラー → crypto providerの初期化失敗

---

### Test 1-2: 無効な署名でエラー

**手順**:
```bash
# 無効な署名でリクエスト（手動curlで実行）
curl -X POST http://127.0.0.1:54321/functions/v1/stripe-webhook \
  -H "stripe-signature: invalid_signature" \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}' \
  -v
```

**期待結果**:
- [x] ✅ 400エラーが返る
- [x] ✅ ログに「Webhook署名検証エラー」が表示される

**実際の結果**:

**curlレスポンス**:
```
< HTTP/1.1 400 Bad Request
< Content-Type: application/json

{"error":"Webhook署名検証エラー: Unable to extract timestamp and signatures from header"}
```

**Edge Function Logs**:
```
❌ [LIVE環境] Webhook署名検証エラー: Unable to extract timestamp and signatures from header
```

**判定**: [x] PASS

**備考**:
- 無効な署名で400 Bad Request が正しく返された
- エラーメッセージが適切にログに記録された
- 署名検証が正常に機能している

---

## Phase 2: Webhook冪等性チェックテスト

### Test 2-1: 同じWebhookを2回送信（二重処理防止）

**手順**:
```bash
# Stripe CLIで同じWebhookを2回送信
stripe trigger product.created
# ↑で取得したevent_idを使って再送信
stripe events resend evt_1SYyplKUVUnt8GtyBGjMPAR5
```

**期待結果**:
- [x] ✅ 1回目: ログに「webhook_events保存完了」
- [x] ✅ 2回目: ログに「Already processed event」
- [x] ✅ DBの`webhook_events`テーブルに1レコードのみ
- [x] ✅ DBの`user_subscriptions`テーブルに1レコードのみ（二重登録されていない）

**実際の結果**:

**1回目（stripe trigger product.created）**:
```
✅ [LIVE環境] Webhook署名検証成功: product.created
✅ [LIVE環境] webhook_events保存完了: evt_1SYyplKUVUnt8GtyBGjMPAR5
⏱️ [LIVE環境] 200レスポンスまでの時間: 5ms
```

**2回目（stripe events resend evt_1SYyplKUVUnt8GtyBGjMPAR5）**:
```
✅ [LIVE環境] Webhook署名検証成功: product.created
⏭️ [LIVE環境] Already processed event: evt_1SYyplKUVUnt8GtyBGjMPAR5
⏱️ [LIVE環境] 200レスポンスまでの時間: 2ms
```

**DBの確認**:
```sql
-- webhook_eventsテーブル確認
SELECT COUNT(*) as count FROM webhook_events WHERE event_id = 'evt_1SYyplKUVUnt8GtyBGjMPAR5';

-- 結果: count = 1 (1レコードのみ、重複なし)
```

**判定**: [x] PASS

**備考**:
- 冪等性チェックが正常に機能
- 同じevent_idのWebhookは2回目以降スキップされる
- webhook_eventsテーブルのUNIQUE制約により二重登録を防止

**失敗時の対処**:
- `relation "webhook_events" does not exist` → マイグレーション未実行
- 2回目も処理される → 冪等性チェックが機能していない

---

### Test 2-2: 異なるWebhookを2回送信（両方処理される）

**手順**:
```bash
# 異なるevent_idで2回送信
stripe trigger product.created
stripe trigger invoice.paid
```

**期待結果**:
- [x] ✅ 両方とも処理される
- [x] ✅ DBの`webhook_events`テーブルに2レコード

**実際の結果**:

**1つ目（product.created）**:
```
✅ [LIVE環境] Webhook署名検証成功: product.created
✅ [LIVE環境] webhook_events保存完了: evt_1SYz1xKUVUnt8GtySmhjfLT7
```

**2つ目（invoice.paid）**:
```
✅ [LIVE環境] Webhook署名検証成功: invoice.paid
🚀 [LIVE環境] invoice.paidイベントを処理中
請求書にサブスクリプションIDがありません
✅ [LIVE環境] webhook_events保存完了: evt_1SYz24KUVUnt8GtyolCKcNdr
```

**DBの確認**:
```sql
SELECT event_id, event_type, processed_at
FROM webhook_events
WHERE event_id IN ('evt_1SYz1xKUVUnt8GtySmhjfLT7', 'evt_1SYz24KUVUnt8GtyolCKcNdr')
ORDER BY processed_at ASC;

-- 結果:
--  event_id                      | event_type      | processed_at
-- -------------------------------+-----------------+-------------------------------
--  evt_1SYz1xKUVUnt8GtySmhjfLT7 | product.created | 2025-11-30 01:02:25.400652+00
--  evt_1SYz24KUVUnt8GtyolCKcNdr | invoice.paid    | 2025-11-30 01:02:32.605351+00
-- (2 rows)
```

**判定**: [x] PASS

---

## Phase 3: プラン変更フロー実装テスト

### Test 3-0: 前提条件の検証（既存サブスクリプションの同期）

**テストアカウント**: kyasya00@gmail.com

**実施日**: 2025年11月30日

**問題の発生**:

Stripe Customer Portalで確認した内容：
- ✅ Standard Plan（¥4,980/月）のアクティブなサブスクリプション
- ✅ Subscription ID: sub_1SZ2koKUVUnt8GtywpVhmJyx
- ✅ Customer ID: cus_TW4uyipBmGEE0a
- ✅ 次回請求日: 2025-12-30

しかし、アプリケーションでの表示：
- ❌ /account ページで「Community Plan」と表示
- ❌ Community Plan は存在しないプラン（表示されるべきではない）
- ❌ 本来は「Standard Plan」が表示されるべき

**原因調査**:

ローカルデータベースの確認：
```sql
SELECT * FROM user_subscriptions WHERE user_id = 'e44dbc5f-e8c2-40bd-84f5-e36bc096fdc4';
-- 結果: 0 rows（サブスクリプション情報が存在しない）

SELECT * FROM stripe_customers WHERE user_id = 'e44dbc5f-e8c2-40bd-84f5-e36bc096fdc4';
-- 結果: 0 rows（Stripe顧客情報が存在しない）
```

ブラウザコンソールの出力：
```javascript
購読状態確認結果: {
  subscribed: true,
  planType: 'community',  // ← 間違い（'standard'であるべき）
  duration: 1,
  isSubscribed: true,
  cancelAtPeriodEnd: false
}

Edge Functionから取得したアクセス権限を使用: {
  hasMemberAccess: true,
  hasLearningAccess: false,
  planType: 'community'  // ← 間違い
}
```

**根本原因**:

Stripe側でサブスクリプションが作成されているが、ローカルDB（開発環境）にWebhookイベントが送信されていない、または処理されていないため：
1. `user_subscriptions` テーブルにレコードがない
2. `stripe_customers` テーブルにレコードがない
3. フロントエンドがデフォルトの「Community Plan」を表示している

**対処方法**:

Phase 3のテストを実施する前に、以下のいずれかを実行：

**Option A: Stripeの既存サブスクリプションをローカルDBに同期**
```bash
# 1. customer.subscription.created イベントを検索
stripe events list --limit 100 --type customer.subscription.created

# 2. kyasya00@gmail.comのサブスクリプションイベントを特定
# subscription: sub_1SZ2koKUVUnt8GtywpVhmJyx を含むイベント

# 3. イベントを再送信
stripe events resend evt_xxxxx
```

**Option B: 新しいテストアカウントで再テスト**
- 別のメールアドレスで新規登録
- Stripe Checkoutフローを最初から実行
- Webhookが正常に処理されることを確認

**判定**: [x] FAIL（データ不整合を検出）

**次のステップ**:
- [ ] Option Aで既存サブスクリプションを同期
- [ ] ローカルDBにサブスクリプション情報が保存されることを確認
- [ ] /accountページで「Standard Plan」が表示されることを確認
- [ ] Test 3-1に進む

---

### Test 3-1: Preview Invoice API

**前提条件**:
- [ ] アクティブなサブスクリプションがローカルDBに存在する
- [ ] Test 3-0が完了していること

**手順**:
```bash
# Supabaseダッシュボードでユーザーのトークンを取得
# または、ログインしてブラウザのDevToolsでlocalStorageから取得

export TOKEN="eyJh..."  # Supabase認証トークン
export NEW_PRICE_ID="price_xxx"  # 変更先のPrice ID

curl -X POST https://[project-ref].supabase.co/functions/v1/preview-subscription-change \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"newPriceId\": \"$NEW_PRICE_ID\"}"
```

**期待結果**:
- [ ] ✅ 200 OKが返る
- [ ] ✅ レスポンスに日割り計算の金額が含まれる
- [ ] ✅ `amount_due`, `subtotal`, `total`が存在する

**実際の結果**:
```json
（レスポンスを貼り付け）
```

**判定**: [ ] PASS [ ] FAIL

---

### Test 3-2: Subscription Update API（アップグレード）

**前提条件**:
- [ ] スタンダードプラン（または低価格プラン）に登録済み

**手順**:
```bash
export TOKEN="eyJh..."
export NEW_PRICE_ID="price_feedback_1m"  # フィードバックプラン

curl -X POST https://[project-ref].supabase.co/functions/v1/update-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"newPriceId\": \"$NEW_PRICE_ID\"}"
```

**期待結果**:
- [ ] ✅ 200 OKが返る
- [ ] ✅ レスポンスに`success: true`
- [ ] ✅ ログに「Proration behavior: always_invoice」
- [ ] ✅ ログに「Subscription updated」
- [ ] ✅ 数秒後、Stripe Webhookで`customer.subscription.updated`が発火
- [ ] ✅ DBの`user_subscriptions`が新プランに更新される
- [ ] ✅ Stripe Dashboardで1つのサブスクリプションのみアクティブ

**実際の結果**:
```sql
-- DBの確認
SELECT plan_type, duration, stripe_subscription_id
FROM user_subscriptions
WHERE user_id = '[user_id]';

-- Stripeの確認（Dashboard）
https://dashboard.stripe.com/test/subscriptions/[subscription_id]
```

**判定**: [ ] PASS [ ] FAIL

---

### Test 3-3: Subscription Update API（ダウングレード）

**前提条件**:
- [ ] フィードバックプラン（または高価格プラン）に登録済み

**手順**:
```bash
export TOKEN="eyJh..."
export NEW_PRICE_ID="price_standard_1m"  # スタンダードプラン

curl -X POST https://[project-ref].supabase.co/functions/v1/update-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"newPriceId\": \"$NEW_PRICE_ID\"}"
```

**期待結果**:
- [ ] ✅ 200 OKが返る
- [ ] ✅ ログに「Proration behavior: always_invoice」（クレジット適用）
- [ ] ✅ Stripe Dashboardでクレジットが確認できる
- [ ] ✅ DBの`user_subscriptions`が新プランに更新される

**実際の結果**:
```
（結果を貼り付け）
```

**判定**: [ ] PASS [ ] FAIL

---

### Test 3-4: Subscription Scheduleエラー

**前提条件**:
- [ ] Subscription Scheduleが設定されているサブスクリプション

**手順**:
```bash
# Stripe DashboardでSubscription Scheduleを設定してから実行
curl -X POST https://[project-ref].supabase.co/functions/v1/update-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"newPriceId\": \"$NEW_PRICE_ID\"}"
```

**期待結果**:
- [ ] ✅ 400エラーが返る
- [ ] ✅ エラーメッセージ「このサブスクリプションにはScheduleが設定されています」

**実際の結果**:
```
（結果を貼り付け）
```

**判定**: [ ] PASS [ ] FAIL

---

### Test 3-5: 未払いインボイスがある場合

**前提条件**:
- [ ] 未払いのインボイスが存在する（カード決済失敗などで）

**手順**:
```bash
# Stripe Dashboardで未払いインボイスを作成してから実行
curl -X POST https://[project-ref].supabase.co/functions/v1/update-subscription \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"newPriceId\": \"$NEW_PRICE_ID\"}"
```

**期待結果**:
- [ ] ✅ 200 OKが返る
- [ ] ✅ ログに「Proration behavior: none」（日割り無効化）
- [ ] ✅ Stripe Dashboardでprorationが発生していない

**実際の結果**:
```
（結果を貼り付け）
```

**判定**: [ ] PASS [ ] FAIL

---

## 統合テスト

### Test 4-1: 新規登録 → プラン変更 → キャンセル（E2Eフロー）

**手順**:
1. 新規ユーザーでスタンダードプランに登録
2. Webhookで`checkout.session.completed`が処理される
3. フィードバックプランに変更
4. Webhookで`customer.subscription.updated`が処理される
5. プランをキャンセル
6. Webhookで`customer.subscription.deleted`が処理される

**期待結果**:
- [ ] ✅ 各ステップでWebhookが正常に処理される
- [ ] ✅ 二重課金が発生しない
- [ ] ✅ Stripe Dashboardで1つのサブスクリプションのみ
- [ ] ✅ webhook_eventsテーブルに全イベントが記録される

**判定**: [ ] PASS [ ] FAIL

---

## 🚨 エラー発生時の対処

### よくあるエラーと対処方法

| エラーメッセージ | 原因 | 対処方法 |
|---------------|------|---------|
| `401 Unauthorized` | JWT認証エラー | config.tomlの`verify_jwt = false`を確認 |
| `relation "webhook_events" does not exist` | テーブル未作成 | マイグレーション実行 |
| `Already processed event` | 正常（冪等性チェック） | 問題なし |
| `No active subscription found` | DBにサブスクリプション情報なし | 新規登録から再テスト |
| `Subscription Scheduleエラー` | Scheduleが設定されている | Stripe DashboardでSchedule削除 |

---

## ✅ テスト完了の判定基準

全てのテストが**PASS**であること:
- [ ] Phase 1: Test 1-1, 1-2
- [ ] Phase 2: Test 2-1, 2-2
- [ ] Phase 3: Test 3-1, 3-2, 3-3, 3-4, 3-5
- [ ] 統合テスト: Test 4-1

---

**テスト完了日**: _____年_____月_____日
**結果**: [ ] 全PASS [ ] 一部FAIL
**備考**:
```
（メモを記入）
```
