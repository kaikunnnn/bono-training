# update-subscription 500エラー調査レポート

**日付**: 2025-11-30
**重大度**: 🔴 Critical
**ステータス**: 🔄 調査中（Step 1完了）

---

## 📊 Executive Summary

kyasya00@gmail.com のユーザーがプラン変更（standard → feedback）を試みた際、update-subscription Edge Functionから500 Internal Server Errorが返される問題を調査中。

現時点で、**update-subscription Edge Functionのサーバー側ログが一切存在しない**という重大な発見があり、Functionが正しく起動していない可能性が高い。

---

## 🔍 問題の概要

### 症状

1. ユーザーが `/subscription` ページで「スタンダード → フィードバック」プラン変更を試行
2. フロントエンドから `POST /functions/v1/update-subscription` リクエスト送信
3. **500 Internal Server Error** が返される
4. リトライ機構により計4回失敗（初回 + 3リトライ）

### エラーログ（フロントエンド）

```
stripe.ts:361 POST http://127.0.0.1:54321/functions/v1/update-subscription 500 (Internal Server Error)

プラン変更を確定します {currentPlan: 'standard', currentDuration: 1, newPlan: 'feedback', newDuration: 1}

❌ プラン変更に失敗しました: プラン変更中にエラーが発生しました
Retrying... (attempt 1/3)
Retrying... (attempt 2/3)
Retrying... (attempt 3/3)
```

---

## 📋 Step 1: 事実確認の結果

### ✅ 確認できた事実

#### 1. データベース状態 (kyasya00@gmail.com)

| 項目 | 値 |
|------|-----|
| 現在のプラン | standard (1ヶ月) |
| environment | test |
| stripe_subscription_id | sub_1SZ4FxKUVUnt8Gtyq8BXpG01 |
| is_active | true |
| stripe_customer_id | cus_TW4uyipBmGEE0a |

**ソース**: bash_id 0fe90e のログ（06:37:22時点）

#### 2. エラー発生時の操作

- ユーザーは **standard → feedback** への変更を試みた
- duration: 1ヶ月のまま変更なし
- フロントエンドで500エラーが4回発生（初回 + 3リトライ）

#### 3. update-subscription/index.ts コード分析

**結論**: コード自体に明らかなバグはない

- ✅ 環境変数取得ロジックは正しい（Lines 56-58, 121-131）
- ✅ エラーハンドリングは適切（Lines 197-209）
- ✅ デバッグログが適切に配置されている（Lines 14-16, 29, 53, 68, 105, 133, 142, 163, 198）

**コードの主要部分**:

```typescript
// Lines 56-58: 環境に応じたStripe APIキー選択
const stripeSecretKey = environment === "test"
  ? Deno.env.get("STRIPE_TEST_SECRET_KEY")
  : Deno.env.get("STRIPE_SECRET_KEY");

// Lines 121-131: 環境に応じたPrice ID選択
const envPrefix = environment === "test" ? "STRIPE_TEST" : "STRIPE";
let envVarName = `${envPrefix}_${planTypeUpper}_${durationSuffix}_PRICE_ID`;
let priceId = Deno.env.get(envVarName);

if (!priceId) {
  envVarName = `VITE_${envPrefix}_${planTypeUpper}_${durationSuffix}_PRICE_ID`;
  priceId = Deno.env.get(envVarName);
}
```

#### 4. 環境変数の確認

**結論**: 必要な環境変数は全て設定済み

```bash
STRIPE_TEST_FEEDBACK_1M_PRICE_ID=price_1OIiMRKUVUnt8GtyMGSJIH8H
STRIPE_TEST_FEEDBACK_3M_PRICE_ID=price_1OIiMRKUVUnt8GtyttXJ71Hz
VITE_STRIPE_FEEDBACK_1M_PRICE_ID=price_1OIiMRKUVUnt8GtyMGSJIH8H
VITE_STRIPE_FEEDBACK_3M_PRICE_ID=price_1OIiMRKUVUnt8GtyttXJ71Hz
```

#### 5. Supabase Services ステータス

```
Edge Functions: http://127.0.0.1:54321/functions/v1 (起動中)
Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres (起動中)
```

---

## ❗ 重大な発見

### update-subscriptionのサーバー側ログが一切存在しない

**確認方法**: bash_id 0fe90e のログ全体を確認したが、以下のログが一切出力されていない：

1. Line 29: `logDebug("プラン変更リクエスト受信", ...)`
2. Line 53: `logDebug("ユーザー認証成功", ...)`
3. Line 68: `logDebug("Stripe クライアント初期化完了", ...)`
4. Line 198: `logDebug("プラン変更エラー:", error)`

**考えられる原因**:

1. update-subscription Edge Functionがリクエストを受け取っていない
2. update-subscription Edge Functionが起動していない
3. 別のエンドポイントにリクエストが送られている
4. Edge Function内で即座にクラッシュしている（import文やグローバルスコープでエラー）

---

## 🤔 Step 2: 仮説の立案

### 仮説A: update-subscription Edge Functionが起動していない

**根拠**:
- サーバー側ログが一切ない
- `npx supabase start` は全Edge Functionsを起動するはずだが、update-subscriptionだけ起動していない可能性

**検証方法**:
- Edge Function一覧を確認
- 手動で update-subscription を起動してみる

**優先度**: 🔴 高

---

### 仮説B: フロントエンドから誤ったエンドポイントにリクエストしている

**根拠**:
- 500エラーは返ってくる（何らかのレスポンスはある）
- サーバー側ログがない（update-subscriptionには到達していない）

**検証方法**:
- フロントエンドのコード (stripe.ts) を確認
- ネットワークタブでリクエストURLを確認

**優先度**: 🟡 中

---

### 仮説C: Edge Function内で即座にクラッシュしている

**根拠**:
- logDebugすら実行されていない
- import文やグローバルスコープでエラーが発生している可能性

**検証方法**:
- Edge Functionのimport文を確認
- グローバルスコープのコードを確認
- 手動でcurlコマンドでリクエストを送ってみる

**優先度**: 🟡 中

---

## 📝 Next Steps

### Step 2: 仮説の検証（未実施）

1. **仮説Aの検証**: update-subscription Edge Functionが起動しているか確認
2. **仮説Bの検証**: フロントエンドのリクエスト先URLを確認
3. **仮説Cの検証**: 手動でupdate-subscriptionを呼び出してエラーを再現

### Step 3: 根本原因の特定（未実施）

検証結果に基づいて根本原因を特定

### Step 4: 修正プランの作成（未実施）

根本原因に基づいた修正プランを作成

### Step 5: 実装と検証（未実施）

修正プランを実装し、動作確認

---

## 🔗 関連ドキュメント

- `.claude/docs/subscription/issues/2025-11-30-root-cause-analysis-final.md` - 'community' プランバグの根本原因分析
- `.claude/docs/subscription/issues/2025-11-30-community-default-bug.md` - 'community' デフォルト値バグ
- `supabase/functions/update-subscription/index.ts` - 問題のEdge Function

---

## 📊 調査タイムライン

| 時刻 | アクション | 結果 |
|------|----------|------|
| 09:00 | Step 1開始: 事実確認 | - |
| 09:05 | update-subscription/index.ts コード分析 | コードに明らかなバグなし |
| 09:10 | 環境変数確認 | 全て正しく設定済み |
| 09:15 | サーバーログ確認 | **ログが一切存在しない** ← 重大な発見 |
| 09:20 | Step 1完了 | 仮説立案へ移行 |

---

**作成日時**: 2025-11-30 09:20
**作成者**: Claude Code
**レビュー**: 未実施
**ステータス**: Step 1完了、Step 2へ移行予定
