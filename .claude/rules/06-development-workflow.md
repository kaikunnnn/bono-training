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
- 開発環境: `environment = 'test'` のサブスクのみ参照
