# Claude Code再起動後のチェックポイント

**更新日時**: 2025-12-01 10:40 JST
**ステータス**: Phase 1 実施中（Test 1-1成功、Test 1-3準備中）

---

## 🎯 現在の状況（一言）

**Test 1-1（Standard 1M新規登録）が成功！次はTest 1-3（プラン変更）を実施する。**

---

## ✅ 完了したこと

### Test 1-1: Standard 1M 新規登録 - 成功

| 項目 | 値 |
|-----|-----|
| user_id | bb59afb9-0fe6-4cdc-a734-78b9fb2671a9 |
| plan_type | standard |
| is_active | true |
| stripe_subscription_id | sub_1SZLxCKUVUnt8GtybdKMWlEs |
| stripe_customer_id | cus_TWOkqgaMIQvOmB |
| duration | 1 |
| environment | test |

**詳細レポート**: `test-reports/2025-12-01-test-1-1-success.md`

---

## 📋 次にやること（再起動後に読む）

### Test 1-3: プラン変更テスト（Standard → Feedback）

**現在の状態**:
- ユーザー: takumi.kai.skywalker@gmail.com
- 現在のプラン: Standard 1M（`sub_1SZLxCKUVUnt8GtybdKMWlEs`）

**テスト手順**:
1. ブラウザで http://localhost:8080/subscription にアクセス
2. 「Feedback 1M」プランを選択
3. プラン変更を実行
4. Edge Functionログを確認
5. データベースでプラン変更を確認

**プラン定義**:
- `standard`: スタンダード（全コンテンツアクセス）
- `feedback`: フィードバック（全コンテンツ + フィードバック機能）

---

## 🔄 起動が必要なサービス

| サービス | コマンド | ポート | 現在のステータス |
|---------|---------|--------|-----------------|
| Frontend | `npm run dev` | 8080 | 🟢 起動中 |
| Supabase Local | `npx supabase start` | 54321 | 🟢 起動中 |
| Edge Function | `npx supabase functions serve stripe-webhook --env-file .env --no-verify-jwt` | - | 🟢 起動中 |
| Stripe CLI | `~/bin/stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-webhook` | - | 🟢 起動中 |

---

## ⚠️ 重要な注意点

### Claude MCPでローカルDB確認しない

Claude MCPは本番DBに接続しているため、ローカルテストの結果確認には使えない。

**ローカルDBの確認方法**:
```bash
# Dockerコンテナ経由でpsql
/Applications/Docker.app/Contents/Resources/bin/docker exec -i supabase_db_fryogvfhymnpiqwssmuu psql -U postgres -d postgres -c "SELECT * FROM user_subscriptions;"

# または Supabase Studio（ブラウザ）
open http://127.0.0.1:54323
```

---

## 📂 関連ドキュメント

| ファイル | 内容 |
|---------|------|
| `MASTER-PLAN.md` | 全体進捗（Phase 1 40%） |
| `test-reports/2025-12-01-test-1-1-success.md` | Test 1-1成功レポート |

---

**再起動後にまずこのファイルを読んでください！**
