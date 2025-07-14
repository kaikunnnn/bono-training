# 📋 Phase 1 デプロイメントガイド

このガイドでは、BONOデザイン学習プラットフォームのPhase 1（基盤修正）のデプロイメント手順を説明します。

## 🚨 デプロイメント前の確認事項

### 1. 必要なツール
- [Supabase CLI](https://github.com/supabase/cli) がインストールされている
- Node.js 18以上がインストールされている
- プロジェクトの管理者権限がある

### 2. 環境変数の確認
以下の環境変数が設定されていることを確認してください：
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY` (オプション、Phase 2で必要)

## 🔧 Phase 1 デプロイメント手順

### ステップ 1: Supabase CLIでログイン
```bash
supabase login
```

### ステップ 2: プロジェクトへのリンク
```bash
supabase link --project-ref fryogvfhymnpiqwssmuu
```

### ステップ 3: データベースマイグレーション実行
```bash
supabase db push
```

**重要**: このコマンドで `20250713_create_subscription_tables.sql` マイグレーションが適用されます。

### ステップ 4: Edge Functions のデプロイ
```bash
# 全てのEdge Functionsをデプロイ
supabase functions deploy

# 個別にデプロイする場合
supabase functions deploy check-subscription
supabase functions deploy get-training-detail
```

### ステップ 5: 環境変数の設定（本番環境）
```bash
# Stripe Secret Key (Phase 2以降で必要)
supabase secrets set STRIPE_SECRET_KEY=sk_live_...

# その他の環境変数があれば設定
supabase secrets set CUSTOM_VAR=value
```

### ステップ 6: 認証設定の確認
Supabase管理画面で以下の設定を確認してください：

1. **Authentication → Settings**
   - "Enable email confirmations" を **無効** に設定
   - "Enable sign ups" を **有効** に設定

2. **Authentication → URL Configuration**
   - Site URL: `https://your-domain.com`
   - Redirect URLs: 必要に応じて設定

## 🧪 デプロイメント後のテスト

### 1. Edge Functions のテスト
```bash
npm run test:edge-functions
```

### 2. 手動テスト
以下のURLにアクセスして動作確認：

**check-subscription テスト**
```bash
curl -X POST \
  https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/check-subscription \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

**get-training-detail テスト**
```bash
curl -X POST \
  https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/get-training-detail \
  -H "Content-Type: application/json" \
  -d '{"slug": "profile"}'
```

## 📊 期待される結果

### check-subscription からの正常レスポンス
```json
{
  "subscribed": false,
  "planType": "free",
  "isSubscribed": false,
  "hasMemberAccess": false,
  "hasLearningAccess": false
}
```

### get-training-detail からの正常レスポンス
```json
{
  "success": true,
  "data": {
    "id": "profile-1",
    "slug": "profile",
    "title": "Profile",
    "tasks": [],
    "has_premium_content": false
  }
}
```

## 🔍 トラブルシューティング

### エラー: "relation user_subscriptions does not exist"
**原因**: データベースマイグレーションが実行されていない
**解決**: `supabase db push` を実行してマイグレーションを適用

### エラー: "SUPABASE_URL環境変数が設定されていません"
**原因**: Edge Function内で環境変数が設定されていない
**解決**: Supabase管理画面で環境変数を設定

### エラー: "Edge Function returned a non-2xx status code"
**原因**: Edge Function内でエラーが発生
**解決**: Supabase管理画面のLogs → Edge Functionsでエラーログを確認

## 🌐 本番環境での追加設定

### 1. CORS設定の確認
Edge Functions で適切なCORSヘッダーが設定されていることを確認

### 2. RLS（Row Level Security）ポリシーの確認
```sql
-- ユーザーが自分の購読情報のみ閲覧可能
SELECT * FROM user_subscriptions WHERE user_id = auth.uid();
```

### 3. インデックスの確認
```sql
-- パフォーマンスのためのインデックス
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
```

## 🔄 Phase 2 への準備

Phase 1のデプロイメントが完了したら、以下を確認してください：

1. ✅ Edge Functions がすべて正常に動作している
2. ✅ データベーステーブルが正しく作成されている
3. ✅ 認証フローが正常に動作している
4. ✅ コンソールエラーが解消されている

## 📞 サポート

問題が発生した場合は、以下の情報を含めてサポートに連絡してください：

1. エラーメッセージの詳細
2. Supabase Edge Function ログ
3. ブラウザのコンソールログ
4. 実行したコマンドの詳細

---

**注意**: このガイドは Phase 1 専用です。Phase 2以降では追加のデプロイメント手順が必要になります。