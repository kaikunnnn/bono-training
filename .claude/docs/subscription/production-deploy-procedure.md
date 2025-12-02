# 本番デプロイ手順書

**作成日**: 2025-12-01
**目的**: サブスクリプション機能の本番デプロイ手順

---

## 前提条件

- [ ] ローカルでの全機能テスト完了
- [ ] `production-deploy-checklist.md` の確認項目を事前確認
- [ ] Stripe本番アカウントにアクセス可能

---

## Phase 1: 環境変数の設定

### 1.1 STRIPE_MODE を live に設定

```bash
npx supabase secrets set STRIPE_MODE=live --project-ref fryogvfhymnpiqwssmuu
```

**確認コマンド**:
```bash
npx supabase secrets list --project-ref fryogvfhymnpiqwssmuu | grep STRIPE_MODE
```

### 1.2 環境変数の確認（既存）

以下が既に設定されていることを確認:

```bash
npx supabase secrets list --project-ref fryogvfhymnpiqwssmuu
```

確認項目:
- `STRIPE_LIVE_SECRET_KEY` ✅
- `STRIPE_TEST_SECRET_KEY` ✅
- `STRIPE_WEBHOOK_SECRET_LIVE` ✅
- `STRIPE_WEBHOOK_SECRET_TEST` ✅
- `STRIPE_STANDARD_1M_PRICE_ID` ✅
- `STRIPE_STANDARD_3M_PRICE_ID` ✅
- `STRIPE_FEEDBACK_1M_PRICE_ID` ✅
- `STRIPE_FEEDBACK_3M_PRICE_ID` ✅

---

## Phase 2: Edge Functionsのデプロイ

### 2.1 修正済みFunctionsのデプロイ

```bash
# update-subscription（環境変数名統一済み）
npx supabase functions deploy update-subscription --project-ref fryogvfhymnpiqwssmuu

# preview-subscription-change（環境判定追加済み）
npx supabase functions deploy preview-subscription-change --project-ref fryogvfhymnpiqwssmuu
```

### 2.2 全Functionsの確認（オプション）

他のFunctionsに変更がある場合は一括デプロイ:

```bash
# 全Edge Functionsをデプロイ
npx supabase functions deploy --project-ref fryogvfhymnpiqwssmuu
```

### 2.3 デプロイ確認

```bash
# Edge Functions一覧を確認
npx supabase functions list --project-ref fryogvfhymnpiqwssmuu
```

---

## Phase 3: 動作確認

### 3.1 Edge Functionログの確認

Supabase Dashboard → Edge Functions → Logs

確認ポイント:
- `STRIPE_MODE env var: live` と表示されること
- エラーが発生していないこと

### 3.2 本番テスト（最小限）

1. **check-subscription の動作確認**
   - 既存ユーザーでログイン
   - `/subscription` ページにアクセス
   - コンソールでエラーがないことを確認

2. **新規登録テスト**（可能な場合）
   - テストユーザーで新規登録
   - Stripe Dashboardで確認
   - DB確認（`environment = 'live'` であること）

---

## Phase 4: 監視

### 4.1 ログ監視

デプロイ後24時間は以下を監視:

```bash
# Edge Functionログを取得
# Supabase Dashboard → Edge Functions → Logs

# または MCP経由
# mcp__supabase__get_logs service=edge-function
```

### 4.2 エラー監視

- Stripe Dashboard → Webhooks → 失敗したイベント
- Supabase Dashboard → Edge Functions → エラーログ

---

## ロールバック手順

### 問題発生時

#### 1. STRIPE_MODEをtestに戻す（即時対応）

```bash
npx supabase secrets set STRIPE_MODE=test --project-ref fryogvfhymnpiqwssmuu
```

#### 2. Edge Functionの前バージョンに戻す

Supabase Dashboard → Edge Functions → 該当Function → Deployments → 前バージョンを選択

#### 3. 問題調査

```bash
# ログを確認
npx supabase functions logs <function-name> --project-ref fryogvfhymnpiqwssmuu
```

---

## 実行記録

| Phase | 実行日時 | 実行者 | 結果 |
|-------|---------|--------|------|
| 1. 環境変数設定 | | | |
| 2. Edge Functions デプロイ | | | |
| 3. 動作確認 | | | |
| 4. 監視開始 | | | |

---

## コマンドクイックリファレンス

```bash
# 環境変数設定
npx supabase secrets set STRIPE_MODE=live --project-ref fryogvfhymnpiqwssmuu

# 環境変数確認
npx supabase secrets list --project-ref fryogvfhymnpiqwssmuu

# Edge Functionデプロイ
npx supabase functions deploy <function-name> --project-ref fryogvfhymnpiqwssmuu

# Edge Function一覧
npx supabase functions list --project-ref fryogvfhymnpiqwssmuu

# ロールバック（環境変数）
npx supabase secrets set STRIPE_MODE=test --project-ref fryogvfhymnpiqwssmuu
```

---

**最終更新**: 2025-12-01
