# 環境変数定義

**最終更新**: 2025-11-28

---

## 🎯 このドキュメントの目的

プロジェクトで使用するすべての環境変数を一元管理し、実装やデバッグ時に即座に参照できるようにする。

---

## 📋 環境変数一覧

### Supabase関連

| 変数名 | 用途 | 値の例 | 必須 | 設定場所 |
|--------|------|--------|------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | SupabaseプロジェクトURL | `https://xxx.supabase.co` | ✅ | `.env.local` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | `eyJhbGciOiJIUzI1...` | ✅ | `.env.local` |
| `SUPABASE_SERVICE_ROLE_KEY` | サービスロールキー（サーバー専用） | `eyJhbGciOiJIUzI1...` | ✅ | `.env.local` |

**注意事項**:
- `SERVICE_ROLE_KEY`は絶対にクライアント側で使わない
- 本番環境では必ずVercelの環境変数に設定

---

### Stripe関連

| 変数名 | 用途 | 値の例 | 必須 | 設定場所 |
|--------|------|--------|------|----------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe公開キー | `pk_test_...` | ✅ | `.env.local` |
| `STRIPE_SECRET_KEY` | Stripeシークレットキー | `sk_test_...` | ✅ | `.env.local` |
| `STRIPE_WEBHOOK_SECRET` | Webhook署名検証用 | `whsec_...` | ✅ | `.env.local` |

**重要**:
- 開発環境では`test`キー、本番では`live`キーを使用
- Webhook秘密鍵はStripe CLIまたはダッシュボードから取得

---

### Stripe Price ID（プラン別）

| プラン | Price ID（テスト環境） | Price ID（本番環境） | 備考 |
|--------|----------------------|-------------------|------|
| プレミアム（月額） | `price_xxx` | `price_xxx` | 月額1,980円 |
| プロ（月額） | `price_yyy` | `price_yyy` | 月額4,980円 |

**定義場所**: `lib/stripe/config.ts`

---

### アプリケーション設定

| 変数名 | 用途 | 値の例 | 必須 | 設定場所 |
|--------|------|--------|------|----------|
| `NEXT_PUBLIC_APP_URL` | アプリケーションURL | `http://localhost:3000` | ✅ | `.env.local` |
| `NODE_ENV` | 環境識別 | `development` / `production` | ✅ | 自動設定 |

---

## 🔧 環境変数の設定方法

### ローカル開発環境

1. `.env.local.example`をコピー
   ```bash
   cp .env.local.example .env.local
   ```

2. 各変数に実際の値を設定
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your-key
   STRIPE_SECRET_KEY=sk_test_your-key
   STRIPE_WEBHOOK_SECRET=whsec_your-secret
   
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

3. サーバーを再起動
   ```bash
   npm run dev
   ```

---

### 本番環境（Vercel）

1. Vercel Dashboardで環境変数を設定
2. すべての`test`キーを`live`キーに変更
3. `NEXT_PUBLIC_APP_URL`を本番URLに設定

---

## ⚠️ トラブルシューティング

### エラー: "Supabase client not initialized"

**原因**: `NEXT_PUBLIC_SUPABASE_URL`または`NEXT_PUBLIC_SUPABASE_ANON_KEY`が設定されていない

**解決策**:
1. `.env.local`を確認
2. 変数名のタイプミスをチェック
3. サーバーを再起動

---

### エラー: "Stripe API key invalid"

**原因**: `STRIPE_SECRET_KEY`が間違っているか、本番キーと開発キーが混在

**解決策**:
1. Stripe Dashboardで正しいキーをコピー
2. `sk_test_`（開発）と`sk_live_`（本番）を確認
3. `.env.local`を更新して再起動

---

### エラー: "Webhook signature verification failed"

**原因**: `STRIPE_WEBHOOK_SECRET`が間違っている、またはStripe CLIが起動していない

**解決策**:
1. ローカル開発の場合:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
   表示された`whsec_`で始まるキーを`.env.local`に設定

2. 本番環境の場合:
   Stripe DashboardのWebhook設定から署名秘密鍵を取得

---

## 📝 新しい環境変数を追加する際のルール

1. **このドキュメントに必ず追記する**
2. **`.env.local.example`にもサンプル値を追記**
3. **型定義ファイル（`lib/env.ts`）に追加**
4. **チーム全体に共有**

---

## 🔄 このドキュメントの更新タイミング

- 新しい環境変数を追加した時
- 環境変数の用途が変更された時
- トラブルシューティング情報を追加する時

**環境変数に関する情報は、すべてこのドキュメントに集約してください。**
