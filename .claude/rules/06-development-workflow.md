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

開発環境（localhost）でサブスク機能を確認するには `environment = 'test'` のレコードが必要。
MCP の `execute_sql` で作成する:

```sql
-- テスト用サブスク作成（standard 1ヶ月）
INSERT INTO user_subscriptions (
  user_id, plan_type, is_active, stripe_subscription_id, stripe_customer_id,
  duration, cancel_at_period_end, current_period_end, environment
) VALUES (
  '<user_id>',        -- auth.users から取得
  'standard',         -- standard or feedback
  true,
  'sub_test_dev_xxx', -- テスト用のダミーID
  'cus_test_dev',
  1,                  -- 1 or 3
  false,
  '2026-06-01 00:00:00+00',
  'test'
);

-- テスト用サブスク削除（テスト終了後）
DELETE FROM user_subscriptions
WHERE user_id = '<user_id>' AND environment = 'test';
```

**注意**: MCP は本番DBに接続するため、`environment = 'test'` を必ず指定すること。
`environment = 'live'` のレコードは絶対に変更しない。
