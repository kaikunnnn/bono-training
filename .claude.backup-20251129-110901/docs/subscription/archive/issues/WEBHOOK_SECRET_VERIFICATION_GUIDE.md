# Webhook Secret 確認・設定ガイド

**作成日**: 2025-11-28
**所要時間**: 5分
**重要度**: 🚨 最高

---

## 📋 このガイドの目的

Webhook 401エラーを解消するため、Stripe DashboardのWebhook Secretを確認し、Supabase Secretsに正しく設定します。

---

## ステップ1: Stripe Dashboard でWebhook Secretを確認 🔍

### 1-1. Stripe Dashboardにアクセス

1. ブラウザで https://dashboard.stripe.com/ を開く
2. ログイン
3. **左上の「テストモード」スイッチがONになっているか確認** ⚠️

### 1-2. Webhooksページを開く

1. 左サイドバーから **「開発者」(Developers)** をクリック
2. **「Webhook」** タブをクリック

### 1-3. 該当のEndpointを探す

探すURL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`

**注意**: 
- 同じURLのEndpointが複数ある場合、最新のものを使用
- 古いEndpointは削除推奨

### 1-4. Signing Secretをコピー

1. 該当のEndpoint行をクリック
2. 「Signing secret」セクションを探す
3. **「Reveal」または「Show」ボタンをクリック**
4. 表示された `whsec_...` で始まる文字列をコピー

**重要**: この値は機密情報です。安全に管理してください。

---

## ステップ2: Supabase Secretsに設定 ⚙️

### 2-1. ターミナルでコマンド実行

```bash
# コピーしたSecretを貼り付けて実行
npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST=whsec_ここに貼り付け
```

**例**:
```bash
npx supabase secrets set STRIPE_WEBHOOK_SECRET_TEST=whsec_abc123xyz456def789
```

### 2-2. 設定完了の確認

```bash
npx supabase secrets list
```

出力に `STRIPE_WEBHOOK_SECRET_TEST` が表示されればOK ✅

---

## ステップ3: Edge Functionを再デプロイ 🚀

### 3-1. Webhook Functionをデプロイ

```bash
npx supabase functions deploy stripe-webhook
```

**期待する出力**:
```
Deploying function stripe-webhook...
Function deployed successfully!
```

### 3-2. デプロイ完了の確認

```bash
npx supabase functions list
```

`stripe-webhook` の `version` が更新されていればOK ✅

---

## ステップ4: 動作確認 🧪

### 4-1. テスト決済を実行

1. ブラウザで http://localhost:5173/subscription を開く
2. プランを選択して決済
3. テストカード: `4242 4242 4242 4242`
   - 有効期限: 未来の任意の日付（例: 12/34）
   - CVC: 任意の3桁（例: 123）

### 4-2. Webhookログを確認

以下のコマンドを実行（またはClaude Codeに依頼）:

```bash
# Edge Functionのログを確認
# mcp__supabase__get_logs で service: edge-function
```

**成功の確認**:
```
POST | 200 | stripe-webhook  ← これが表示されればOK!
```

**失敗の場合**:
```
POST | 401 | stripe-webhook  ← まだ401ならSecret不一致
```

### 4-3. データベースを確認

```sql
SELECT * FROM user_subscriptions 
WHERE user_id = 'あなたのユーザーID' 
ORDER BY created_at DESC 
LIMIT 1;
```

`status = 'active'` になっていればOK ✅

### 4-4. フロントエンドで確認

1. `/subscription` ページをリロード
2. 「現在のプラン」が表示されているか確認
3. Console: `subscribed: true` になっているか確認

---

## 🔧 トラブルシューティング

### 問題1: Webhook Endpointが見つからない

**原因**: Endpointが登録されていない

**解決策**: 新規作成が必要
1. Stripe Dashboard → Developers → Webhooks
2. **「エンドポイントを追加」**をクリック
3. URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`
4. リッスンするイベント:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

---

### 問題2: デプロイ後も401エラー

**原因1**: Secretの値が間違っている
- Stripe Dashboardで再度確認
- コピー時に余分なスペースが入っていないか確認

**原因2**: 環境モードが違う
- Stripe Dashboard: テストモードになっているか
- Edge Function: `STRIPE_MODE=test` になっているか

**確認コマンド**:
```bash
npx supabase secrets list | grep STRIPE_MODE
```

---

### 問題3: 複数のEndpointがある

**推奨**: 古いEndpointは削除

1. Stripe Dashboard → Developers → Webhooks
2. 使用していないEndpointの「...」メニュー
3. **「削除」**を選択

**注意**: 削除する前に、そのEndpointが使われていないことを確認

---

## ✅ 完了チェックリスト

- [ ] Stripe DashboardでWebhook Secretを確認
- [ ] Supabase Secretsに `STRIPE_WEBHOOK_SECRET_TEST` を設定
- [ ] `npx supabase secrets list` で設定を確認
- [ ] `npx supabase functions deploy stripe-webhook` でデプロイ
- [ ] Edge Functionログで `POST | 200 | stripe-webhook` を確認
- [ ] テスト決済を実行
- [ ] データベースで `user_subscriptions` が更新されることを確認
- [ ] `/subscription` ページで現在のプランが表示されることを確認

---

## 📞 サポート

問題が解決しない場合:
1. `.claude/docs/subscription/issues/2025-11-28-webhook-environment-bug.md` を参照
2. Claude Codeに「Webhook 401エラーのログを確認して」と依頼

---

**作成日**: 2025-11-28
**最終更新**: 2025-11-28
