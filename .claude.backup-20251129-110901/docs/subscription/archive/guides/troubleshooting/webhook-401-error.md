# Webhook 401 Unauthorized エラー - 解決記録

**発生日**: 2025-11-24
**影響範囲**: すべての Webhook イベント処理
**重要度**: 🔴 Critical

---

## 概要

Test 2E（プラン変更テスト: Feedback 1M → Standard 1M）実施時に、Stripe Customer Portal でプラン変更を完了したにもかかわらず、データベースの `plan_type` と `duration` が更新されない問題が発生しました。

調査の結果、**`STRIPE_WEBHOOK_SECRET_TEST` が Supabase Secrets に設定されていなかった**ことが根本原因であることが判明しました。

---

## 症状

### 1. フロントエンドの表示

- ✅ Customer Portal は正常に開いた
- ✅ Deep Link でプラン変更確認画面に直接遷移した
- ✅ プラン変更を完了し、「更新されます」ページが表示された
- ✅ `/subscription` ページでプラン表示が更新された（フロントエンドの状態管理）

### 2. データベースの状態

```sql
SELECT plan_type, duration, updated_at, email
FROM user_subscriptions
JOIN auth.users ON user_subscriptions.user_id = auth.users.id
WHERE email = 'takumi.kai.skywalker@gmail.com'
ORDER BY updated_at DESC
LIMIT 1;
```

**結果**:
```json
{
  "plan_type": "feedback",  // ❌ 変更されていない（本来は "standard" になるはず）
  "duration": 1,
  "updated_at": "2025-11-24 01:43:23.123456+00"  // ❌ 更新時刻が古いまま
}
```

### 3. Stripe の状態

- ✅ Stripe Dashboard では正常にプラン変更が完了している
- ✅ Subscription の Price ID が Standard 1M の Price ID に変更されている
- ✅ プロレーション（日割り計算）が正常に計算されている:
  - Credit: -￥9,064（Feedback 1M の残り期間分）
  - Charge: ￥4,514（Standard 1M の残り期間分）

### 4. Edge Functions Logs

```
POST | 401 | stripe-webhook
POST | 401 | stripe-webhook
POST | 401 | stripe-webhook
```

**エラーメッセージ**:
```
Webhook Error: Webhook signature verification failed
```

---

## 根本原因

### Webhook Signature Verification の仕組み

Stripe は Webhook イベントを送信する際、リクエストヘッダーに `stripe-signature` を含めます。この署名は **Webhook Signing Secret**（`whsec_...`）を使って生成されます。

Edge Function 側では、受信したイベントの署名を検証するために、同じ Webhook Signing Secret を使って署名を再計算し、一致するか確認します。

```typescript
// supabase/functions/stripe-webhook-test/index.ts
const sig = req.headers.get('stripe-signature');
const webhookSecret = getWebhookSecret(environment);

const event = stripe.webhooks.constructEvent(
  body,
  sig,
  webhookSecret  // ← この値が設定されていないと 401 エラー
);
```

### 問題の発生理由

`STRIPE_WEBHOOK_SECRET_TEST` が Supabase Secrets に設定されていなかったため、`getWebhookSecret()` 関数がエラーをスローし、Webhook 署名検証に失敗しました。

結果として、すべての Webhook リクエストが `401 Unauthorized` エラーで拒否され、データベースが更新されませんでした。

---

## 影響範囲

### 動作しなかった Webhook イベント

1. **`customer.subscription.updated`** - プラン変更時
   - `plan_type` の更新
   - `duration` の更新
   - `cancel_at_period_end` の更新
   - `cancel_at` の更新

2. **`customer.subscription.deleted`** - キャンセル時
   - `is_active = false` への更新

3. **`checkout.session.completed`** - 新規登録時
   - `user_subscriptions` テーブルへの新規レコード作成
   - `stripe_customers` テーブルへの新規レコード作成

### ユーザーへの影響

- ❌ プラン変更が完了しても、アプリ内でのコンテンツアクセス権限が変更されない
- ❌ キャンセルしても、データベース上は `is_active = true` のまま
- ❌ 新規登録しても、データベースにレコードが作成されず、コンテンツにアクセスできない

**重要**: この問題は、サブスクリプション管理機能全体を無効化する Critical なバグです。

---

## 解決方法

### 1. Stripe Dashboard から Webhook Secret を取得

1. https://dashboard.stripe.com/test/webhooks にアクセス
2. 使用中の Webhook エンドポイントをクリック
3. 「Signing secret」セクションで「Reveal」をクリック
4. `whsec_...` 形式の値をコピー

**取得した値**:
```
whsec_OsDEO0Sk2YT6EkLsdxxfJ2T9H81H1xvT
```

### 2. Supabase Secrets に設定

```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST=whsec_OsDEO0Sk2YT6EkLsdxxfJ2T9H81H1xvT
```

**実行結果**:
```
✓ Finished supabase secrets set.
✓ Environment variables updated successfully.
```

### 3. Edge Function の再起動

Supabase Secrets の変更は即座に反映されるため、Edge Function の再デプロイは不要です。

---

## 検証

### 1. Test 2E 再実行

**前提条件**:
- 現在のプラン: Feedback 1M
- 変更先: Standard 1M

**手順**:
1. `/subscription` ページで「スタンダード（1ヶ月）」を選択
2. Customer Portal でプラン変更を確定
3. データベースを確認

**結果**:
```sql
SELECT plan_type, duration, updated_at, email
FROM user_subscriptions
JOIN auth.users ON user_subscriptions.user_id = auth.users.id
WHERE email = 'takumi.kai.skywalker@gmail.com'
ORDER BY updated_at DESC
LIMIT 1;
```

```json
{
  "plan_type": "standard",  // ✅ 正しく更新された！
  "duration": 1,
  "is_active": true,
  "updated_at": "2025-11-24 02:27:15.300529+00"  // ✅ 更新時刻が最新
}
```

### 2. Edge Functions Logs 確認

```
POST | 200 | stripe-webhook
✅ [STRIPE-WEBHOOK] Event: customer.subscription.updated
✅ [SUBSCRIPTION-UPDATED] Updated subscription: sub_xxxxx
```

### 3. Stripe の Webhook イベント履歴確認

- ✅ `customer.subscription.updated` イベントが正常に処理された
- ✅ Response: 200 OK
- ✅ Proration: -￥9,064 + ￥4,514 = -￥4,550

---

## 予防策

### 1. 環境構築チェックリストの作成

`.claude/docs/SUBSCRIPTION-SYSTEM-SPECIFICATION.md` に「環境構築チェックリスト」を追加しました。

**重要項目**:
- [ ] **STRIPE_WEBHOOK_SECRET_TEST を設定（最重要！）**
- [ ] STRIPE_TEST_SECRET_KEY を設定
- [ ] すべての Price ID を設定
- [ ] Webhook 動作確認を実施

### 2. Webhook 動作確認の自動化

今後の開発では、以下の手順で Webhook が正常に動作しているか確認します:

1. Stripe Dashboard → Webhooks → テストイベントを送信
2. Supabase Edge Functions Logs で `stripe-webhook` を確認
3. ✅ 200 OK が返っているか確認（❌ 401 エラーでないこと）

### 3. ドキュメントの充実

以下のドキュメントに Webhook 401 エラーのトラブルシューティング情報を追加しました:

- `.claude/docs/SUBSCRIPTION-SYSTEM-SPECIFICATION.md` - 問題2: Webhook 401 Unauthorized エラー
- `.claude/docs/TESTING-LOG.md` - Phase 4-2: Webhook 401 エラーの発見と修正

---

## 教訓

### 1. 環境変数の重要性

**Stripe Webhook Secret は最も重要な環境変数の一つです。** この値が設定されていないと、サブスクリプション管理機能全体が動作しません。

### 2. エラーログの確認

フロントエンドやStripeが正常に動作していても、Edge Functions のログを確認することで、バックエンドの問題を早期に発見できます。

### 3. データベースの確認

プラン変更などの重要な操作後は、必ずデータベースを直接確認し、期待通りに更新されているか検証する必要があります。

### 4. ドキュメントの重要性

今回の問題は、環境構築時に Webhook Secret の設定が漏れていたことが原因でした。**詳細なチェックリストとトラブルシューティング情報をドキュメント化することで、再発を防止できます。**

---

## 関連ドキュメント

- [SUBSCRIPTION-SYSTEM-SPECIFICATION.md](./SUBSCRIPTION-SYSTEM-SPECIFICATION.md) - サブスクリプションシステム全体仕様
- [TESTING-LOG.md](./TESTING-LOG.md) - Test 2E 実施記録
- [環境構築チェックリスト](./SUBSCRIPTION-SYSTEM-SPECIFICATION.md#環境構築チェックリスト)

---

**作成日**: 2025-11-24
**最終更新**: 2025-11-24
**ステータス**: ✅ 解決済み・ドキュメント化完了
