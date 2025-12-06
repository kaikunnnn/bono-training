# Phase 5 調査レポート: stripe-webhook 401エラー

**調査日時**: 2025-12-02 JST
**調査者**: Claude Code
**ステータス**: 調査中

---

## 1. 発見した問題

### 症状

本番環境の `stripe-webhook` Edge Function が全て **401 Unauthorized** で失敗している。

### ログ分析

```
Edge Function ログ (直近24時間)
├── stripe-webhook      : 13件連続 401 Unauthorized ❌
├── check-subscription  : 200 OK ✅
├── stripe-webhook-test : 200 OK ✅
└── 他のEdge Functions  : 200 OK ✅
```

### 影響

- Stripeからの全てのWebhookイベントが処理されない
- 新規登録、プラン変更、キャンセルのDB反映が行われない

---

## 2. コード分析

### 401が返されるパス

`stripe-webhook/index.ts:76-82`:
```typescript
} catch (err) {
  console.error(`❌ [LIVE環境] Webhook署名検証エラー: ${err.message}`);
  return new Response(JSON.stringify({ error: `Webhook署名検証エラー: ${err.message}` }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 400,  // ← 注: 400ではなく401が返っている
  });
}
```

**注意**: コードは400を返すように書かれているが、ログでは401が記録されている。
これはSupabaseのインフラレイヤーで401が返されている可能性がある。

### Webhook Secret 取得ロジック

`_shared/stripe-helpers.ts:52-64`:
```typescript
export function getWebhookSecret(environment: StripeEnvironment): string {
  const envVarName = environment === 'test'
    ? 'STRIPE_WEBHOOK_SECRET_TEST'
    : 'STRIPE_WEBHOOK_SECRET_LIVE';

  const secret = Deno.env.get(envVarName);

  if (!secret) {
    throw new Error(`${envVarName} is not set in environment variables`);
  }

  return secret;
}
```

### 環境変数の設定状況

```
npx supabase secrets list --project-ref fryogvfhymnpiqwssmuu

STRIPE_MODE                    : ✅ 設定済み
STRIPE_WEBHOOK_SECRET_LIVE     : ✅ 設定済み
STRIPE_WEBHOOK_SECRET_TEST     : ✅ 設定済み
STRIPE_LIVE_SECRET_KEY         : ✅ 設定済み
```

---

## 3. 仮説

### 仮説 1（最も可能性が高い）: Webhook Secret の値が不一致

**根拠**:
- コードロジックは正しい
- 環境変数は設定されている
- しかし署名検証が失敗している

**可能性**:
1. Stripe Dashboardで新しいWebhook Endpointを有効化した際に、**新しいSigning Secret**が生成された
2. Supabase Secretsに設定されている `STRIPE_WEBHOOK_SECRET_LIVE` の値が**古い**か**間違っている**

### 仮説 2: Stripe DashboardのEndpoint設定が間違っている

**確認が必要な項目**:
- Endpoint URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook`
- イベントタイプ: checkout.session.completed, customer.subscription.updated, invoice.paid, customer.subscription.deleted

### 仮説 3: 401はSupabaseインフラレベルのエラー

**可能性**:
- Edge Functionに到達する前に、Supabaseのゲートウェイで認証エラーになっている
- ただし、これは通常の設定では起こらないはず

---

## 4. 次のアクション

### ユーザーに確認してもらう項目

1. **Stripe Dashboard → Webhooks → 本番用Endpoint を開く**

2. **Endpoint URLを確認**:
   ```
   https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook
   ```

3. **Signing Secret を確認**:
   - 「Reveal」をクリックして表示
   - `whsec_` で始まる文字列

4. **上記のSecretをSupabase Secretsに再設定**:
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET_LIVE=whsec_xxxxx --project-ref fryogvfhymnpiqwssmuu
   ```

5. **Edge Functionsを再デプロイ**:
   ```bash
   npx supabase functions deploy stripe-webhook --project-ref fryogvfhymnpiqwssmuu
   ```

6. **Stripe Dashboard → Webhooks → 「Send test webhook」で動作確認**

---

## 5. 調査メモ

### タイムライン

| 時間 | イベント |
|------|---------|
| 2025-12-02 09:30 | STRIPE_MODE=live を設定 |
| 2025-12-02 09:31 | Edge Functions デプロイ |
| 2025-12-02 ?? | Stripe Webhook 有効化（ユーザー実施） |
| 2025-12-02 ?? | stripe-webhook 401エラー発生開始 |

### 未解明の点

- コードは400を返すように書かれているのに、なぜ401が返っているのか
- Supabaseのログでより詳細なエラーメッセージは取得できないか

---

**更新**: 2025-12-02 JST
