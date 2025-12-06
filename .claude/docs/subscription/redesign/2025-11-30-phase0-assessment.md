# Phase 0: 緊急現状精査レポート

**日付**: 2025-11-30
**ステータス**: ✅ 完了
**所要時間**: 約15分

---

## 📊 Executive Summary

サブスクリプション実装の全面見直しに向けて、現状の環境・データ・実装状態を精査しました。

**重大な発見**:
1. ✅ 環境変数は正しく設定済み
2. ✅ Supabaseサービスは全て起動中
3. ✅ Edge Functions自体は存在する
4. ⚠️ **feedbackプランのデータが存在しない**
5. ⚠️ **STRIPE_MODEが未設定** → デフォルトで'test'になる
6. ❓ update-subscriptionが実際に動作するか未検証

---

## Phase 0-1: 環境変数の確認 ✅

### Stripe関連

| 環境変数 | 状態 | 値の有無 |
|---------|------|---------|
| STRIPE_TEST_SECRET_KEY | ✅ 設定済み | sk_test_51HDQT3... |
| STRIPE_TEST_WEBHOOK_SECRET | ✅ 設定済み | whsec_cedcf6a3... |
| VITE_STRIPE_PUBLISHABLE_KEY | ✅ 設定済み | pk_test_51HDQT3... |

### Price ID（TEST環境）

| プラン | 期間 | 環境変数 | 状態 |
|--------|------|---------|------|
| Standard | 1M | STRIPE_TEST_STANDARD_1M_PRICE_ID | ✅ price_1OIiOUKUVUnt8GtyOfXEoEvW |
| Standard | 3M | STRIPE_TEST_STANDARD_3M_PRICE_ID | ✅ price_1OIiPpKUVUnt8Gty0OH3Pyip |
| Feedback | 1M | STRIPE_TEST_FEEDBACK_1M_PRICE_ID | ✅ price_1OIiMRKUVUnt8GtyMGSJIH8H |
| Feedback | 3M | STRIPE_TEST_FEEDBACK_3M_PRICE_ID | ✅ price_1OIiMRKUVUnt8GtyttXJ71Hz |

### Price ID（フロントエンド用: VITE_プレフィックス）

| プラン | 期間 | 環境変数 | 状態 |
|--------|------|---------|------|
| Standard | 1M | VITE_STRIPE_STANDARD_1M_PRICE_ID | ✅ price_1OIiOUKUVUnt8GtyOfXEoEvW |
| Standard | 3M | VITE_STRIPE_STANDARD_3M_PRICE_ID | ✅ price_1OIiPpKUVUnt8Gty0OH3Pyip |
| Feedback | 1M | VITE_STRIPE_FEEDBACK_1M_PRICE_ID | ✅ price_1OIiMRKUVUnt8GtyMGSJIH8H |
| Feedback | 3M | VITE_STRIPE_FEEDBACK_3M_PRICE_ID | ✅ price_1OIiMRKUVUnt8GtyttXJ71Hz |

### Supabase関連

| 環境変数 | 状態 | 値 |
|---------|------|-----|
| SUPABASE_URL | ✅ 設定済み | http://127.0.0.1:54321 (ローカル) |
| SUPABASE_ANON_KEY | ✅ 設定済み | eyJhbGciOiJIUzI1Ni... |
| SUPABASE_SERVICE_ROLE_KEY | ✅ 設定済み | eyJhbGciOiJIUzI1Ni... |

### ⚠️ 重要な発見

**STRIPE_MODEが未設定**

```bash
# .envファイルにSTRIPE_MODEの定義がない
# → Edge Functionsでは以下のコードでデフォルト'test'になる

const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';
```

**影響**:
- 現在は意図せずTEST環境で動作している
- LIVE環境への切り替え時に混乱の可能性
- 明示的に設定すべき

**推奨**: `.env`に`STRIPE_MODE=test`を追加

---

## Phase 0-2: Edge Functions状態確認 ✅

### Supabase Services

```
✅ Edge Functions: http://127.0.0.1:54321/functions/v1 (起動中)
✅ Database: postgresql://postgres:postgres@127.0.0.1:54322/postgres (起動中)
✅ Studio: http://127.0.0.1:54323 (起動中)
```

### Edge Functions一覧

| Function名 | 存在 | 説明 |
|-----------|------|------|
| create-checkout | ✅ | 新規サブスク登録用Checkoutセッション作成 |
| update-subscription | ✅ | プラン変更処理 |
| stripe-webhook | ✅ | Stripe Webhookイベント処理 |
| create-customer-portal | ✅ | Stripeカスタマーポータル生成 |
| check-subscription | ✅ | サブスク状態確認 |
| get-plan-prices | ✅ | プラン価格取得 |
| preview-subscription-change | ✅ | プラン変更プレビュー |

**発見**: 必要なEdge Functionsは全て存在する。

---

## Phase 0-3: データベース状態確認 ✅

### テーブル構造

#### user_subscriptions

| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | PK |
| user_id | uuid | NO | ユーザーID |
| plan_type | text | NO | プランタイプ |
| duration | integer | YES | 期間（1 or 3） |
| is_active | boolean | NO | アクティブ状態 |
| stripe_subscription_id | text | YES | Stripe Subscription ID |
| stripe_customer_id | text | YES | Stripe Customer ID |
| environment | text | YES | 環境（test/live） |
| plan_members | boolean | YES | メンバー権限 |
| cancel_at_period_end | boolean | YES | 期間終了時キャンセル |
| cancel_at | timestamp | YES | キャンセル日時 |
| current_period_end | timestamp | YES | 現在の期間終了日 |
| created_at | timestamp | NO | 作成日時 |
| updated_at | timestamp | NO | 更新日時 |

#### stripe_customers

| カラム名 | データ型 | NULL許可 | 説明 |
|---------|---------|---------|------|
| id | uuid | NO | PK |
| user_id | uuid | NO | ユーザーID |
| stripe_customer_id | varchar | NO | Stripe Customer ID |
| environment | text | YES | 環境（test/live） |
| created_at | timestamp | NO | 作成日時 |
| updated_at | timestamp | NO | 更新日時 |

**評価**: ✅ テーブル構造は適切。environmentフィールドも存在。

---

### 既存データ分析

#### プランタイプ別集計

| plan_type | duration | environment | is_active | 件数 |
|-----------|----------|-------------|-----------|------|
| standard | 1 | live | true | 194 |
| standard | 1 | live | false | 1788 |
| standard | 1 | test | true | 1 |
| standard | 3 | live | active | 52 |

**合計**: 2,035件のサブスクリプションレコード

#### 🔴 重大な発見

1. **feedbackプランが存在しない**
   - データベースに`plan_type='feedback'`のレコードが1件もない
   - 仕様では standard と feedback の2つのプランがあるはず
   - **原因推測**: feedbackプランの実装・テストが未完了の可能性

2. **communityプランは存在しない**
   - ユーザーが報告した「communityプランになる」問題
   - データベースには`plan_type='community'`は存在しない
   - **原因推測**: フロントエンド表示の問題、またはEdge Functionのロジック問題

3. **TEST環境のデータが少ない**
   - test環境: 1件のみ（standard 1M）
   - live環境: 2,034件
   - **原因**: 開発・テストが主にLIVE環境で行われていた可能性

---

## ❓ Phase 0-4: 実際の動作テスト（未実施）

### テスト対象

1. **新規サブスク登録フロー**
   - /subscriptionページを開く
   - プランを選択
   - Stripe Checkoutへ遷移
   - テスト決済
   - 成功ページの確認
   - データベース登録の確認

2. **プラン変更フロー**
   - 既存サブスクからプラン変更
   - update-subscription Edge Functionの動作確認
   - エラーログの収集

3. **キャンセルフロー**
   - カスタマーポータルへの遷移
   - キャンセル処理
   - データベース更新の確認

**ステータス**: ⏸️ 保留中（Phase 0レポート完成後に実施予定）

---

## 📋 Phase 0-5: 問題リスト

### 🔴 Critical（即対応必要）

#### ISSUE-P0-001: update-subscription 500エラー
- **症状**: プラン変更時に500 Internal Server Error
- **ユーザー報告**: kyasya00@gmail.com
- **詳細**: [2025-11-30-update-subscription-500-investigation.md](../issues/2025-11-30-update-subscription-500-investigation.md)
- **ステータス**: 調査中（サーバーログが一切出力されない）

#### ISSUE-P0-002: feedbackプランのデータが存在しない
- **症状**: データベースにfeedbackプランのレコードが0件
- **影響**: feedbackプランの新規登録・変更が未テスト
- **原因推測**: 実装が未完了、またはPrice IDの問題
- **優先度**: 🔴 高（仕様との不一致）

#### ISSUE-P0-003: 全機能が動作していない（ユーザー報告）
- **新規登録**: ❌ 動作せず
- **プラン変更**: ❌ 動作せず
- **キャンセル**: ❌ 動作せず
- **ステータス**: Phase 0-4の動作テストで検証予定

---

### 🟡 Medium（要対応）

#### ISSUE-P0-004: STRIPE_MODE未設定
- **症状**: .envにSTRIPE_MODEの定義がない
- **影響**: デフォルトで'test'になるが、意図が不明確
- **対応**: `.env`に明示的に`STRIPE_MODE=test`を追加
- **優先度**: 🟡 中

#### ISSUE-P0-005: TEST環境のデータが少ない
- **症状**: test環境のサブスクが1件のみ
- **影響**: テストが不十分な可能性
- **対応**: TEST環境でのテストデータ作成
- **優先度**: 🟡 中

---

### 🟢 Low（確認・改善）

#### ISSUE-P0-006: 'community'プラン参照が残存
- **症状**: コード内に'community'への参照が残っている
- **影響**: 現時点で実害なし（データには存在しない）
- **対応**: コードクリーンアップ
- **優先度**: 🟢 低
- **詳細**: [2025-11-30-root-cause-analysis-final.md](../issues/2025-11-30-root-cause-analysis-final.md)

---

## 🎯 Phase 1以降の方針

### 優先順位

1. **Phase 1**: 動作テストの実施（Phase 0-4）
   - 実際に各フローを試して問題を特定
   - エラーログの収集
   - 問題の切り分け

2. **Phase 2**: update-subscription 500エラーの解決
   - サーバーログが出ない原因究明
   - Function起動状態の確認
   - 修正・検証

3. **Phase 3**: feedbackプランの実装確認
   - feedbackプランが登録できるか検証
   - Price IDの確認
   - テストデータ作成

4. **Phase 4**: 新規登録フローの修正
   - communityプラン問題の解決
   - 正しいプランで登録されるか検証

5. **Phase 5**: 全体的な動作確認
   - 全てのユーザージャーニーのテスト
   - ドキュメント更新

---

## ✅ Phase 0完了条件

- [x] 環境変数の確認完了
- [x] Edge Functions状態確認完了
- [x] データベース構造確認完了
- [x] 既存データ分析完了
- [ ] 実際の動作テスト（Phase 1に移行）
- [x] 問題リスト作成完了
- [x] Phase 0レポート作成完了

---

## 📝 Next Steps

### Immediate Actions

1. **Phase 1開始**: 実際の動作テスト
   - 新規サブスク登録を試す
   - エラーを記録
   - スクリーンショット取得

2. **STRIPE_MODE設定**
   ```bash
   # .envに追加
   STRIPE_MODE=test
   ```

3. **ユーザーに報告**
   - Phase 0の発見事項を共有
   - Phase 1の方針を確認

---

**作成日時**: 2025-11-30 19:30
**作成者**: Claude Code
**レビュー**: 未実施
**ステータス**: Phase 0完了、Phase 1へ移行準備
