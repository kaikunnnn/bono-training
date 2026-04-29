# 開発ワークフロー

## 環境

| サービス | URL |
|---------|-----|
| Next.js dev | http://localhost:3000 |
| Supabase Local | http://localhost:54321 |
| Stripe CLI | `stripe listen --forward-to localhost:54321/functions/v1/stripe-webhook` |

## ビルド確認（コミット前に必ず実行）

```bash
npx tsc --noEmit   # 型チェック（Server/Client境界エラーも検出）
npm run build      # 本番ビルド（最も確実なエラー検出）
npm run lint       # ESLint
```

## コミットメッセージ

```
[種別]: 内容（BON-番号）

種別: feat / fix / refactor / docs / test / chore
例: fix: サブスクチェックの環境フィルタ追加（BON-178）
```

## デプロイ

- **フロントエンド**: PR マージで Vercel 自動デプロイ
- **Edge Function**: `npx supabase functions deploy [name] --project-ref fryogvfhymnpiqwssmuu`
- **DB マイグレーション**: `npx supabase db push --project-ref fryogvfhymnpiqwssmuu`

## MCP 運用

- MCP は常に**本番 DB/Stripe** を参照する
- 開発中はコード操作のみ。データ操作に MCP を使わない
- 本番確認が必要な場合のみ MCP を使用
- Supabase MCP でのSQL実行は本番データに影響するため慎重に

## テスト用情報

- Stripe テストカード: `4242 4242 4242 4242`（有効期限: 任意未来日、CVC: 任意3桁）
- 開発環境: `environment = 'test'` のサブスクのみ参照（`live` は見えない）

## テスト用サブスクリプションの作成

### ユーザー作成（Auth Admin API経由）
```bash
LOCAL_KEY="<service_role_key from supabase start>"
curl -s -X POST "http://127.0.0.1:54321/auth/v1/admin/users" \
  -H "Authorization: Bearer $LOCAL_KEY" \
  -H "apikey: $LOCAL_KEY" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "TestPass123!", "email_confirm": true}'
```

### サブスクリプション作成（実際のStripeチェックアウト経由）

**重要: DBに直接ダミーIDを挿入してはいけない。Stripe操作（プラン変更等）が失敗する。**

1. テストアカウントでログイン
2. `/subscription` → 「選択する」→ テストカード（`4242 4242 4242 4242`）で決済
3. Webhookで実際のStripe subscription IDがDBに記録される
4. この状態でプラン変更・ダウングレード・キャンセルをテスト

### サブスクリプション削除（テスト後のクリーンアップ）
```bash
docker exec supabase_db_fryogvfhymnpiqwssmuu psql -U postgres -d postgres -c "
DELETE FROM user_subscriptions WHERE user_id = '<user_id>';
"
```
