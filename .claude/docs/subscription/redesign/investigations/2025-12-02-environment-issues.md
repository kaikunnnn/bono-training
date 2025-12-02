# 環境問題の緊急修正

**作成日**: 2025-12-02 JST
**ステータス**: ENV-002対応中（2/3完了）

---

## 問題一覧

| # | 問題 | 影響 | 優先度 | ステータス |
|---|------|------|--------|-----------|
| ENV-001 | VercelでローカルURLが使われる | フロントエンド全体 | 🔴 Critical | ✅ 解決済み |
| ENV-003 | TypeError unit_amount | 料金ページ表示不可 | 🔴 Critical | ✅ 解決済み |
| ENV-002 | Stripe Webhook 401エラー | 全Webhook失敗 | 🔴 Critical | ⏳ 対応待ち |

---

## ENV-001: VercelローカルURL問題 ✅ 解決済み

### 症状

- 本番環境（Vercel）のコンソールに `http://127.0.0.1:54321` が表示される
- フロントエンドがローカルSupabaseに接続しようとしている

### 根本原因

- コミット`cab52b9`で修正済みだったが、**ブラウザキャッシュ**が古いJSファイルを保持
- 修正内容: `vite.config.ts`から`FORCED_LOCAL_URL`を削除、`client.ts`からデバッグログを削除

### 解決方法

- **シークレットモード（incognito）** でアクセスすることで解決
- 通常ブラウザでもキャッシュクリア後は正常動作

### ステータス

✅ **解決済み**（2025-12-02）

---

## ENV-003: TypeError unit_amount ✅ 解決済み

### 症状

- `/subscription` ページが白い画面
- コンソールエラー: `TypeError: Cannot read properties of undefined (reading 'unit_amount')`

### 根本原因

- **Feedbackプランの価格IDがSupabase Secretsに未設定**
- `price_cache`テーブルにFeedbackプランの価格が存在しなかった
- `get-plan-prices` Edge Functionが価格を取得できず、フロントエンドでクラッシュ

### 解決方法

1. **Stripe Price IDをSupabase Secretsに設定**:
   ```bash
   npx supabase secrets set STRIPE_STANDARD_1M_PRICE_ID=price_1RStBiKUVUnt8GtynMfKweby --project-ref fryogvfhymnpiqwssmuu
   npx supabase secrets set STRIPE_STANDARD_3M_PRICE_ID=price_1RStCiKUVUnt8GtyKJiieo6d --project-ref fryogvfhymnpiqwssmuu
   npx supabase secrets set STRIPE_FEEDBACK_1M_PRICE_ID=price_1RStgOKUVUnt8GtyVPVelPg3 --project-ref fryogvfhymnpiqwssmuu
   npx supabase secrets set STRIPE_FEEDBACK_3M_PRICE_ID=price_1RSuB1KUVUnt8GtyAwgTK4Cp --project-ref fryogvfhymnpiqwssmuu
   ```

2. **Edge Functionを再デプロイ**:
   ```bash
   npx supabase functions deploy get-plan-prices --project-ref fryogvfhymnpiqwssmuu
   ```

### 結果

- ✅ 料金プランが正常に表示
- ✅ スタンダード: 6,800円/月
- ✅ フィードバック: 15,800円/月

### ステータス

✅ **解決済み**（2025-12-02）

---

## ENV-002: Webhook 401エラー ⏳ 対応待ち

### 症状

- 本番環境の `stripe-webhook` Edge Function が13件連続 401 Unauthorized
- 他のEdge Functions（check-subscription等）は200 OK

### ログ分析

```
Edge Function ログ (直近24時間)
├── stripe-webhook      : 13件連続 401 Unauthorized ❌
├── check-subscription  : 200 OK ✅
├── stripe-webhook-test : 200 OK ✅
└── 他のEdge Functions  : 200 OK ✅
```

### 仮説

- Stripe DashboardのWebhook Signing Secretと、Supabase Secretsの `STRIPE_WEBHOOK_SECRET_LIVE` の値が不一致

### 対応手順

1. Stripe Dashboard → Webhooks → 本番用Endpoint → Signing Secret を確認
2. `whsec_` で始まる文字列を取得
3. Supabase Secretsに再設定:
   ```bash
   npx supabase secrets set STRIPE_WEBHOOK_SECRET_LIVE=whsec_xxxxx --project-ref fryogvfhymnpiqwssmuu
   ```
4. Edge Functionを再デプロイ:
   ```bash
   npx supabase functions deploy stripe-webhook --project-ref fryogvfhymnpiqwssmuu
   ```

### ステータス

⏳ **対応待ち**（Stripe Dashboard確認が必要）

---

## 解決履歴

| 日時 | 問題 | 解決方法 |
|------|------|---------|
| 2025-12-02 | ENV-001 | ブラウザキャッシュクリア（incognito） |
| 2025-12-02 | ENV-003 | Stripe Price IDs をSecrets設定 + デプロイ |

---

**更新**: 2025-12-02 JST
