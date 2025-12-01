# 本番デプロイ前チェックリスト

**作成日**: 2025-12-01
**目的**: サブスクリプション機能の本番公開前に確認すべき項目

---

## 1. 環境変数の確認

### 必須環境変数（本番Supabase）

| 環境変数 | 用途 | 確認 |
|---------|------|------|
| `STRIPE_MODE` | 環境切り替え（`live`に設定） | [ ] |
| `STRIPE_LIVE_SECRET_KEY` | 本番Stripe APIキー | [ ] |
| `STRIPE_TEST_SECRET_KEY` | テストStripe APIキー | [ ] |
| `STRIPE_WEBHOOK_SECRET_LIVE` | 本番Webhook署名シークレット | [ ] |
| `STRIPE_WEBHOOK_SECRET_TEST` | テストWebhook署名シークレット | [ ] |

### Price IDs（本番）

| 環境変数 | 用途 | 確認 |
|---------|------|------|
| `STRIPE_STANDARD_1M_PRICE_ID` | Standard 1ヶ月 | [ ] |
| `STRIPE_STANDARD_3M_PRICE_ID` | Standard 3ヶ月 | [ ] |
| `STRIPE_FEEDBACK_1M_PRICE_ID` | Feedback 1ヶ月 | [ ] |
| `STRIPE_FEEDBACK_3M_PRICE_ID` | Feedback 3ヶ月 | [ ] |

### Price IDs（テスト）

| 環境変数 | 用途 | 確認 |
|---------|------|------|
| `STRIPE_TEST_STANDARD_1M_PRICE_ID` | Standard 1ヶ月（テスト） | [ ] |
| `STRIPE_TEST_STANDARD_3M_PRICE_ID` | Standard 3ヶ月（テスト） | [ ] |
| `STRIPE_TEST_FEEDBACK_1M_PRICE_ID` | Feedback 1ヶ月（テスト） | [ ] |
| `STRIPE_TEST_FEEDBACK_3M_PRICE_ID` | Feedback 3ヶ月（テスト） | [ ] |

---

## 2. データベースの確認

| 項目 | 確認 |
|------|------|
| `user_subscriptions.canceled_at` カラム存在 | [ ] |
| `user_subscriptions.environment` カラム存在 | [ ] |
| `user_subscriptions.duration` カラム存在 | [ ] |
| `user_subscriptions.cancel_at_period_end` カラム存在 | [ ] |
| `user_subscriptions.current_period_end` カラム存在 | [ ] |

---

## 3. Edge Functionsの確認

| Function | 用途 | デプロイ | 確認 |
|----------|------|---------|------|
| `create-checkout` | 新規登録Checkout作成 | [ ] | [ ] |
| `stripe-webhook` | Webhookイベント処理 | [ ] | [ ] |
| `update-subscription` | プラン変更 | [ ] | [ ] |
| `check-subscription` | サブスク状態確認 | [ ] | [ ] |
| `create-customer-portal` | 顧客ポータル作成 | [ ] | [ ] |
| `get-plan-prices` | 価格取得 | [ ] | [ ] |

---

## 4. Stripe側の確認

| 項目 | 確認 |
|------|------|
| Webhook URLが正しい本番URLを指している | [ ] |
| Webhook対象イベントが設定済み | [ ] |
| 本番Price IDsが有効 | [ ] |
| Customer Portalが設定済み | [ ] |

### 必要なWebhookイベント

- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.paid`
- `invoice.payment_failed`

---

## 5. コードの確認

| 項目 | 確認 |
|------|------|
| `STRIPE_SECRET_KEY` → `STRIPE_LIVE_SECRET_KEY` 統一済み | [x] |
| `preview-subscription-change` に環境判定追加済み | [x] |
| 全Edge Functionで `STRIPE_MODE` 環境判定あり | [ ] |

---

## 6. 本番テスト

| テスト | 確認 |
|--------|------|
| 新規登録（Standard 1M） | [ ] |
| 新規登録（Feedback 1M） | [ ] |
| プラン変更（アップグレード） | [ ] |
| プラン変更（ダウングレード） | [ ] |
| 期間変更（1M → 3M） | [ ] |
| 期間変更（3M → 1M） | [ ] |
| キャンセル | [ ] |
| 再登録 | [ ] |

---

## 7. ロールバック計画

### 問題発生時の対応

1. **Edge Functionエラー**: 前バージョンに戻す
   ```bash
   # 該当functionの前バージョンを確認
   # Supabase Dashboardから手動でロールバック
   ```

2. **環境変数問題**: `STRIPE_MODE=test` に戻す
   ```bash
   npx supabase secrets set STRIPE_MODE=test --project-ref fryogvfhymnpiqwssmuu
   ```

3. **DBスキーマ問題**: 該当カラムを削除（慎重に）

---

## 確認完了サイン

| 確認者 | 日時 | サイン |
|--------|------|--------|
| | | |

---

**最終更新**: 2025-12-01
