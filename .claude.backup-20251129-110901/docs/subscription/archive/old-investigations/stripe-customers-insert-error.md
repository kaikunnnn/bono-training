# Stripe Customers テーブル INSERT エラー - 解決タスク

**作成日**: 2025-11-21
**ステータス**: 🔴 未解決（継続中）

---

## 🚨 問題の概要

`create-checkout` Edge Function で、`stripe_customers` テーブルへの INSERT が失敗し続けている。

### エラーメッセージ

```json
{
    "error": "顧客情報の保存に失敗しました",
    "details": "Error: 顧客情報の保存に失敗しました\n    at Server.<anonymous> (file:///var/tmp/sb-compile-edge-runtime/functions/create-checkout/index.ts:91:15)\n    at eventLoopTick (ext:core/01_core.js:175:7)\n    at async Server.#respond (https://deno.land/std@0.190.0/http/server.ts:220:18)"
}
```

### Supabase ログのエラー詳細

```
event loop error: Error: Deno.core.runMicrotasks() is not supported in this environment
    at Object.core.runMicrotasks (https://deno.land/std@0.177.1/node/_core.ts:23:11)
    at processTicksAndRejections (https://deno.land/std@0.177.1/node/_next_tick.ts:50:10)
    at https://deno.land/std@0.177.1/node/process.ts:288:7
    at innerInvokeEventListeners (ext:deno_web/02_event.js:757:7)
    at invokeEventListeners (ext:deno_web/02_event.js:804:5)
    at dispatch (ext:deno_web/02_event.js:661:9)
    at dispatchEvent (ext:deno_web/02_event.js:1041:12)
    at dispatchBeforeUnloadEvent (ext:runtime/bootstrap.js:425:15)
```

---

## 🔍 試した解決策（すべて失敗）

### 1. サービスロール用のRLSポリシーを追加
```sql
CREATE POLICY "Service role can insert stripe customers"
ON stripe_customers
FOR INSERT
TO service_role
WITH CHECK (true);
```
**結果**: ❌ 失敗 - 同じエラーが継続

### 2. authenticated ロール用のRLSポリシーに変更
```sql
CREATE POLICY "Allow insert for authenticated users"
ON stripe_customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```
**結果**: ❌ 失敗 - 同じエラーが継続

### 3. Edge FunctionでSERVICE_ROLE_KEYを使用するように変更

**変更前**:
```typescript
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
```

**変更後**:
```typescript
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
```

**デプロイ**: `npx supabase functions deploy create-checkout`
**結果**: 🟡 検証待ち（ユーザーが次回テスト予定）

---

## 📋 解決タスクリスト

> **📌 Todo連携**: このドキュメントのタスクは `.claude/todos.json` と連携しています
>
> - **現在のPhase**: Phase 1（SERVICE_ROLE_KEY変更後のテスト）
> - **Todo状態**: `stripe_customers INSERT エラーの解決を完了させる` [in_progress]

---

### ✅ 完了した対応

- [x] RLSポリシーを`service_role`用に追加 → **失敗**
- [x] RLSポリシーを`authenticated`用に変更 → **失敗**
- [x] Edge FunctionでSERVICE_ROLE_KEYを使用するように変更 → **デプロイ完了、検証待ち**

---

### 🔄 Phase 1: 環境確認（現在のフェーズ）

**Todo**: `Phase 1: SERVICE_ROLE_KEY変更後のテストを実行` [pending → 次に実行]

- [x] Edge Functionのデプロイが正常に完了していることを確認
  - ✅ `npx supabase functions deploy create-checkout` 実行済み
- [x] `SUPABASE_SERVICE_ROLE_KEY` 環境変数が設定されていることを確認
  - ✅ `npx supabase secrets list` で確認済み
- [ ] **🎯 次のアクション**: ブラウザで決済ボタンをクリックしてテスト
  - `/subscription` ページをリロード
  - 「今すぐ始める」ボタンをクリック
  - **成功**: Stripeチェックアウトページに遷移 → Phase完了
  - **失敗**: Phase 2に進む

---

### 🔍 Phase 2: エラーが継続する場合の診断

**Todo**: `Phase 2: エラーが継続する場合、Edge Functionログとデータベース制約を確認` [pending]

**Phase 1が失敗した場合のみ実行**

#### 2.1 ログ確認
```bash
npm run logs:checkout
```

確認項目：
- [ ] Edge Functionのログに詳細なエラーメッセージが出ているか
- [ ] `SUPABASE_SERVICE_ROLE_KEY`が実際に使用されているか（ログに表示）
- [ ] INSERT SQL文の詳細

#### 2.2 データベース確認
```sql
-- stripe_customersテーブルの制約を確認
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'stripe_customers';
```

確認項目：
- [ ] `user_id, environment` の複合UNIQUE制約が存在するか
- [ ] NOT NULL制約が適切に設定されているか
- [ ] PRIMARY KEY制約が存在するか

#### 2.3 RLSポリシー再確認
```sql
SELECT * FROM pg_policies WHERE tablename = 'stripe_customers';
```

確認項目：
- [ ] ポリシーが正しく設定されているか
- [ ] SERVICE_ROLE_KEYを使用する場合、ポリシーは無視されることを理解

---

### 🔧 Phase 3: 代替アプローチ（Phase 2で原因不明の場合）

**Todo**: `Phase 3: upsert onConflict条件と複合UNIQUE制約を検証` [pending]

**Phase 2でも解決しない場合のみ実行**

#### 3.1 複合UNIQUE制約の追加
```sql
-- 制約が存在しない場合は追加
ALTER TABLE stripe_customers
ADD CONSTRAINT unique_user_environment
UNIQUE (user_id, environment);
```

#### 3.2 RLSの一時的な無効化（テスト目的）
```sql
ALTER TABLE stripe_customers DISABLE ROW LEVEL SECURITY;
```

- [ ] RLS無効化後にテスト実行
- [ ] 成功した場合、RLSポリシーに問題があることが確定
- [ ] テスト後は必ずRLSを再有効化：
```sql
ALTER TABLE stripe_customers ENABLE ROW LEVEL SECURITY;
```

#### 3.3 upsert処理の変更検証
- [ ] `onConflict` 条件が正しいか確認
- [ ] 通常のINSERTに変更してテスト
- [ ] 既存レコードの有無を事前確認してからINSERT/UPDATE

---

### 🏗️ Phase 4: 根本的な再設計（Phase 3でも解決しない場合）

**最終手段 - Phase 3でも解決しない場合のみ**

#### 4.1 Database Functionを使用
```sql
CREATE OR REPLACE FUNCTION upsert_stripe_customer(
  p_user_id UUID,
  p_stripe_customer_id TEXT,
  p_environment TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- RLSをバイパス
AS $$
BEGIN
  INSERT INTO stripe_customers (user_id, stripe_customer_id, environment)
  VALUES (p_user_id, p_stripe_customer_id, p_environment)
  ON CONFLICT (user_id, environment)
  DO UPDATE SET
    stripe_customer_id = EXCLUDED.stripe_customer_id,
    updated_at = NOW();
END;
$$;
```

- [ ] Database Functionを作成
- [ ] Edge FunctionからDatabase Functionを呼び出す
- [ ] テスト実行

#### 4.2 Direct SQL実行
- [ ] Supabase Admin APIを使用
- [ ] SQL文を直接実行する方法に変更

---

## 🔧 現在のコード状態

### Edge Function: `create-checkout/index.ts` (44-47行目)

```typescript
// Supabaseクライアントの作成（サービスロールキーを使用してRLSをバイパス）
const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const supabaseClient = createClient(supabaseUrl, supabaseServiceKey);
```

### INSERT処理: `create-checkout/index.ts` (104-115行目)

```typescript
// 作成した顧客情報をDBに保存（upsertで既存レコードがあっても対応、環境を含む）
const { error: insertError } = await supabaseClient
  .from("stripe_customers")
  .upsert({
    user_id: user.id,
    stripe_customer_id: customer.id,
    environment: environment
  }, { onConflict: 'user_id,environment' });

if (insertError) {
  logDebug("Stripe顧客情報のDB保存に失敗:", insertError);
  throw new Error("顧客情報の保存に失敗しました");
}
```

### RLSポリシー（現在の状態）

```sql
-- authenticatedユーザー用のポリシー
CREATE POLICY "Allow insert for authenticated users"
ON stripe_customers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow select for own records"
ON stripe_customers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow update for own records"
ON stripe_customers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);
```

---

## 📌 重要な注意点

1. **SERVICE_ROLE_KEYを使用する場合、RLSは完全にバイパスされる**
   - authenticatedロール用のポリシーは不要
   - セキュリティはEdge Function内のロジックで担保する必要がある

2. **upsertのonConflict条件**
   - `user_id,environment` の複合UNIQUE制約が必要
   - 制約が存在しない場合、upsertは失敗する

3. **Deno runtime エラー**
   - `Deno.core.runMicrotasks() is not supported` エラーは副次的な問題
   - 主要なエラーはINSERT失敗

---

## ✅ 次のアクション

1. **ユーザーにテストを依頼**
   - ブラウザで `/subscription` ページをリロード
   - 「今すぐ始める」ボタンをクリック
   - 結果を報告してもらう

2. **成功した場合**
   - このドキュメントを完了済みとしてマーク
   - TESTING.md の Test 0 を継続

3. **失敗した場合**
   - Phase 2 の診断タスクを実行
   - より詳細なログを取得
   - データベーススキーマを確認

---

## 📊 タスク進捗管理

### 現在の状態

| Phase | タスク | 状態 | Todo連携 |
|-------|--------|------|----------|
| Phase 1 | SERVICE_ROLE_KEY変更後のテスト | 🟡 検証待ち | `Phase 1: SERVICE_ROLE_KEY変更後のテストを実行` [pending] |
| Phase 2 | ログとDB制約確認 | ⚪ 未着手 | `Phase 2: エラーが継続する場合、Edge Functionログとデータベース制約を確認` [pending] |
| Phase 3 | onConflict条件と制約検証 | ⚪ 未着手 | `Phase 3: upsert onConflict条件と複合UNIQUE制約を検証` [pending] |
| Phase 4 | 根本的な再設計 | ⚪ 未着手 | （Phase 3失敗時のみ） |

### 凡例
- 🟢 完了
- 🟡 進行中/検証待ち
- 🔴 失敗
- ⚪ 未着手

### 次のアクション（優先順位順）

1. **🎯 最優先**: ユーザーがブラウザで決済ボタンをクリックしてテスト
   - 成功 → このドキュメントを完了としてクローズ
   - 失敗 → Phase 2に進む

2. **Phase 2（Phase 1失敗時）**:
   - `npm run logs:checkout` でログ確認
   - データベース制約確認のSQLを実行
   - エラーの根本原因を特定

3. **Phase 3（Phase 2で原因不明時）**:
   - 複合UNIQUE制約を追加
   - RLSを一時的に無効化してテスト
   - upsert処理を変更

4. **Phase 4（最終手段）**:
   - Database Function作成
   - またはDirect SQL実行に変更

---

**最終更新**: 2025-11-21 04:00 (JST)
**ドキュメント作成者**: Claude
**関連ファイル**:
- Edge Function: `supabase/functions/create-checkout/index.ts`
- マイグレーション: 最新のRLSポリシー変更
- Todo管理: `.claude/todos.json`
