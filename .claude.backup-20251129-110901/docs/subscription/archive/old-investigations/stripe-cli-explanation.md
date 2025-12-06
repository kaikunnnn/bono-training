# Stripe CLI についての正しい理解

## ❌ 誤解されやすい説明

「Stripe CLI はローカル開発用のツールで、実際の本番 Edge Function には使えません」

→ **これは誤解です。** 正確には：

## ✅ 正しい理解

### Stripe CLI とは

Stripe CLI は、**ローカル開発環境で Webhook をテストするためのツール**です。

### 現在のプロジェクトでの状況

**このプロジェクトでは、Stripe CLI は不要です。**

理由：

1. **Supabase Edge Functions を使用している**

   - Webhook エンドポイント: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`
   - Stripe Dashboard で直接この URL を設定している

2. **Webhook の流れ**

   ```
   Stripe → Supabase Edge Functions (stripe-webhook-test)
   ```

   - Stripe CLI は関係ない
   - Stripe Dashboard で設定した Webhook エンドポイントが直接呼ばれる

3. **Stripe CLI が必要な場合**
   - ローカル開発サーバー（例: `localhost:3000`）で Webhook を受信したい場合
   - しかし、このプロジェクトでは Supabase Edge Functions を使っているので不要

---

## 📋 実際の Webhook 設定

### テスト環境

1. **Stripe Dashboard（テストモード）で設定**

   - Webhook エンドポイント: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`
   - シークレット: `STRIPE_WEBHOOK_SECRET_TEST`（Supabase の環境変数）

2. **決済テストの流れ**
   ```
   ユーザーが決済完了
   → StripeがWebhookイベントを送信
   → Supabase Edge Functions (stripe-webhook-test) が受信
   → データベースを更新
   ```

### 本番環境

1. **Stripe Dashboard（本番モード）で設定**
   - Webhook エンドポイント: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`
   - シークレット: `STRIPE_WEBHOOK_SECRET_LIVE`（Supabase の環境変数）

---

## 🎯 まとめ

- **Stripe CLI は不要**: このプロジェクトでは Supabase Edge Functions を使っているため
- **Webhook は自動的に動作**: Stripe Dashboard で設定したエンドポイントが直接呼ばれる
- **ローカル開発**: ブラウザで実際の決済テストを行えば、Webhook は自動的に Supabase Edge Functions に届く

---

## 💡 もし Stripe CLI を使う場合

ローカル開発サーバーで Webhook を受信したい場合のみ：

```bash
# Stripe CLIでローカルにWebhookを転送
stripe listen --forward-to localhost:3000/api/webhooks
```

しかし、このプロジェクトでは：

- Supabase Edge Functions を使っている
- ローカル開発サーバーに Webhook エンドポイントがない
- したがって、Stripe CLI は不要


