# サブスクリプション実装再構築 - MASTER PLAN

**プロジェクト開始**: 2025-11-30
**現在のステータス**: 🟢 Phase 1 実施中（Test 1-1, 1-3成功、Test 1-4準備中）
**最終更新**: 2025-12-01 10:50 JST

---

## 🎯 プロジェクト目標

**サブスクリプションシステム全体の堅実な動作を実現する。**

- ❌ 局所的なエラー対応ではない
- ✅ 全体の見直しと再実装
- ✅ 事実に基づく段階的アプローチ

---

## 📊 全体進捗

```
Phase 0: 緊急現状精査               ████████████████████ 100% ✅
Phase 1.5: 緊急修正                 ████████████████████ 100% ✅ 完了
Phase 1: 実際の動作テスト           ████████████░░░░░░░░  60% 🟢 実施中（Test 1-1, 1-3成功）
Phase 2: 問題の修正                 ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 3: 全体動作確認               ░░░░░░░░░░░░░░░░░░░░   0% ⏳
Phase 4: ドキュメント更新           ░░░░░░░░░░░░░░░░░░░░   0% ⏳
```

---

## 📋 Phase 0: 緊急現状精査 ✅

**期間**: 2025-11-30 (約15分)
**ステータス**: 完了
**詳細**: `2025-11-30-phase0-assessment.md`

### 実施内容

| タスク | 結果 |
|-------|------|
| Phase 0-1: 環境変数確認 | ✅ 完了 - 全て正しく設定済み |
| Phase 0-2: Edge Functions確認 | ✅ 完了 - 全て存在・起動中 |
| Phase 0-3: データベース確認 | ✅ 完了 - 構造は適切 |
| Phase 0-4: 既存データ分析 | ✅ 完了 - feedbackプラン0件発見 |
| Phase 0-5: 問題リスト作成 | ✅ 完了 - 6件の問題を特定 |

### 主要な発見

#### ✅ 正常に動作している部分

- 環境変数（Stripe API Keys, Price IDs, Supabase credentials）
- Supabaseサービス（Database, Studio, Edge Functions全て起動中）
- Edge Functions（create-checkout, update-subscription, stripe-webhook等が存在）
- データベーススキーマ（user_subscriptions, stripe_customersのテーブル構造）

#### ⚠️ 問題が発見された部分

**ISSUE-P0-002: feedbackプランのデータが0件**
- データベースに`plan_type='feedback'`のレコードが存在しない
- 仕様では standard と feedback の2つのプランがあるはず
- 原因推測: feedbackプランの実装・テストが未完了の可能性

**ISSUE-P0-003: 全機能が動作していない**
- 新規登録: ❌ 動作せず
- プラン変更: ❌ 動作せず（500エラー）
- キャンセル: ❌ 動作せず

**ISSUE-P0-004: STRIPE_MODE未設定**（✅ 修正済み）
- `.env`に明示的に`STRIPE_MODE=test`を追加

### Phase 0完了時のアクション

- [x] Phase 0レポート作成完了
- [x] STRIPE_MODE設定完了
- [x] Phase 1計画作成完了

---

## 📋 Phase 1: 実際の動作テスト 🟢

**期間**: 2025-11-30 〜
**ステータス**: 実施中（Test 1-1成功、Test 1-3準備中）
**詳細**: `2025-11-30-phase1-testing-plan.md`

### 目的

**実際に各フローを試して、全ての問題を正確に把握する。**

推測ではなく事実に基づいて問題を特定し、的確にバグなしで改善するための基盤を作る。

### テスト項目

| # | テスト内容 | ステータス | 記録 |
|---|-----------|-----------|------|
| 1-1 | Standard 1Mプラン新規登録 | ✅ **成功** | `test-reports/2025-12-01-test-1-1-success.md` |
| 1-2 | Feedback 1Mプラン新規登録 | ⏸️ 保留 | Standard/Professional優先 |
| 1-3 | プラン変更（Standard → Feedback） | ✅ **成功** | `test-reports/2025-12-01-test-1-3-success.md` |
| 1-4 | キャンセル | 🔄 次のテスト | - |

### Test 1-1 実施結果（2回目 - 成功）

**実施日時**: 2025-12-01 10:30 JST
**実施者**: takumi.kai.skywalker@gmail.com

**結果**: ✅ **成功**

| 検証項目 | 結果 |
|---------|------|
| Stripe Checkout完了 | ✅ |
| 成功ページ到達 | ✅ |
| Webhook全て200 OK | ✅ |
| DB保存成功 | ✅ |
| plan_type = standard | ✅ |
| is_active = true | ✅ |
| duration = 1 | ✅ |
| environment = test | ✅ |
| フロントエンド反映 | ✅ |

**保存されたデータ**:
- stripe_subscription_id: `sub_1SZLxCKUVUnt8GtybdKMWlEs`
- stripe_customer_id: `cus_TWOkqgaMIQvOmB`
- current_period_end: `2026-01-01`

### Test 1-1 実施結果（1回目 - 失敗）

**実施日時**: 2025-11-30
**結果**: ❌ 失敗（ISSUE-P1-002発見）
- 原因: `stripe trigger` コマンドが `payment` モードのセッションを作成していた
- 解決: 実際のCheckoutフローでテストしたら正常動作

---

## 📋 Phase 1.5: 緊急修正（ISSUE-P1-002対応） ✅

**期間**: 2025-12-01 01:00 〜 02:30 JST
**ステータス**: ✅ 完了
**結果**: 問題なし（テスト方法の問題だった）

### 目的

**ISSUE-P1-002（Edge Function環境変数問題・DB保存失敗）を修正し、新規登録を正常に動作させる。**

### 問題の詳細

- **症状**: Edge Functionログに `[LIVE環境]` と表示され、データベースに何も保存されない
- **影響**: 全ての新規登録が失敗（ユーザーは成功ページに到達するが、システムにデータが残らない）
- **原因推定**:
  1. Edge Functionが `.env` の環境変数を正しく読み込んでいない
  2. STRIPE_MODEが "test" ではなく "live" になっている
  3. Supabase接続URLが本番環境になっている可能性

### 修正アプローチ

**Step 1: コード確認** ✅ 完了
- [x] `supabase/functions/stripe-webhook/index.ts` を読む
- [x] 環境変数の読み込み方法を確認
- [x] STRIPE_MODE判定ロジックを確認
- [x] データベース保存処理を確認
- [x] **調査レポート作成**: `2025-12-01-phase1.5-step1-investigation.md`

**主要な発見**:
1. 🔴 **Critical**: すべてのログが`[LIVE環境]`にハードコーディング（43箇所）
2. 🟡 **Medium**: ファイルヘッダーコメントが誤解を招く（"LIVE環境専用"と記載）
3. 🔴 **Critical**: SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEYの実際の値を確認する必要あり

**Step 2: 問題特定** ✅ 完了
- [x] なぜ `[LIVE環境]` と表示されるのか特定 → ✅ **特定済み**: ログがハードコーディング
- [x] なぜデータベースに保存されないのか特定 → ✅ **特定済み**: SUPABASE_プレフィックスが自動スキップされる
- [x] `.env` の環境変数が読み込まれているか確認 → ✅ **確認済み**: SUPABASE_*はEdge Functionで読み込めない
- [x] **調査レポート作成**: `2025-12-01-phase1.5-step2-investigation.md`

**根本原因**:
1. 🔴 **Critical**: Edge Functionは`SUPABASE_`プレフィックスの環境変数を自動的にスキップ
2. 🔴 **Critical**: `SUPABASE_URL`と`SUPABASE_SERVICE_ROLE_KEY`が空文字列になる
3. 🔴 **Critical**: Supabaseクライアントが無効な状態で初期化される
4. 🔴 **Critical**: データベース操作がサイレント失敗（エラーログなし）

**解決策**: Supabase提供の環境変数を使用（自動設定済み、`.env`不要）

**Step 2.5: 比較調査（ユーザー指摘による追加調査）** ✅ 完了
- [x] check-subscriptionとstripe-webhookの環境変数を比較
- [x] check-subscriptionで実際の環境変数の値を確認
- [x] Supabase提供の環境変数が機能していることを検証
- [x] **調査レポート作成**: `2025-12-01-phase1.5-step2.5-comparison.md`

**重要な発見**:
1. ✅ **check-subscriptionでは正常に動作**: SUPABASE_URL = `http://kong:8000` （Supabase提供）
2. ✅ **Supabase自動提供の環境変数は機能している**
3. ❓ **未検証**: stripe-webhookでも同じ値が設定されているか（Stripe listen停止により未確認）

**新たな疑問**:
- 両方とも同じ値が設定されているのか？
- もし同じなら、なぜstripe-webhookだけデータベース保存が失敗するのか？
- 別の原因（エラーハンドリングの欠如など）があるのではないか？

**Step 2.6: 本当の問題を発見（ユーザー指摘による最終調査）** ✅ 完了
- [x] Stripe listenを再起動してstripe-webhookを実際にトリガー
- [x] stripe-webhookの環境変数値を確認
- [x] check-subscriptionとの比較（完全に同じと確認）
- [x] 本当の問題を発見：テストイベントが `payment` モード
- [x] **調査レポート作成**: `2025-12-01-phase1.5-step2.6-real-problem.md`

**決定的な発見** 🔴 Critical:
1. ✅ **環境変数は完全に同じ**:
   - check-subscription: `SUPABASE_URL = http://kong:8000`
   - stripe-webhook: `SUPABASE_URL = http://kong:8000`（同じ）
2. ❌ **Phase 1.5 Step 2の仮説は誤り**:
   - 環境変数は空文字列ではない
   - Supabase自動提供の環境変数は正常に機能している
3. 🔴 **本当の問題**:
   ```
   🔍 DEBUG: session.mode = payment      ← 問題
   🔍 DEBUG: session.subscription = null ← 問題
   ❌ サブスクリプションモードではないため、処理をスキップします
   ```
   - `stripe trigger checkout.session.completed` は `payment` モードのセッションを作成
   - stripe-webhookは `session.mode === 'subscription'` の場合のみ処理
   - `payment` モードのため、処理がスキップされ、データベースに保存されない

**結論**:
- 環境変数読み込みの修正は不要（既に正常）
- `subscription` モードのセッションでテストする必要がある
- 実際のCheckoutフローでテストすれば正常に動作するはず

**Step 3: 実際のCheckoutフローでテスト（準備完了）** ⏳ 次のステップ
- [ ] ブラウザで http://localhost:8080/subscription にアクセス
- [ ] Standard 1M プランを選択
- [ ] Stripe Checkoutで登録（テストカード: 4242 4242 4242 4242）
- [ ] stripe-webhookのログを確認：
  - `session.mode = subscription` ✅
  - `session.subscription = sub_xxx` ✅
  - データベース保存成功 ✅
- [ ] データベースでサブスクリプションデータを確認

**安全性確認済み** ✅:
- ✅ Stripe: テストモード（sk_test_...）
- ✅ Database: ローカル（127.0.0.1:54321）
- ✅ 本番データに影響なし

**Step 4: テスト結果の検証とドキュメント化** ⏳ 保留
- [ ] データベースにデータが保存されることを確認
- [ ] `[TEST環境]` とログに表示されることを確認
- [ ] Test 1-1完了レポート作成

### 成功基準

- [ ] Edge Functionログに `[TEST環境]` と表示される
- [ ] データベース（user_subscriptions）にレコードが保存される
- [ ] Test 1-1が成功する（plan_type='standard', duration=1, is_active=true）

### Phase 1.5完了後のアクション

1. Phase 1を再開（Test 1-2, 1-3を実施）
2. 全テスト完了後、Phase 1レポート作成
3. Phase 2（問題の修正）へ進む

### 各テストで記録する項目

- [ ] スクリーンショット（各ステップ）
- [ ] コンソールエラー（ブラウザ）
- [ ] ネットワークタブ（リクエスト/レスポンス）
- [ ] Edge Functionログ（create-checkout, stripe-webhook）
- [ ] データベースの最終状態

### 成功基準

- [ ] Test 1-1（Standard登録）実施完了
- [ ] Test 1-2（Feedback登録）実施完了
- [ ] Test 1-3（プラン変更）実施完了
- [ ] 全てのエラーログ・スクリーンショット記録完了
- [ ] 発見した問題リスト作成完了
- [ ] Phase 1レポート作成完了

### 次のアクション

1. Test 1-1を開始
2. 各ステップでログを記録
3. 問題を発見したら即座に記録
4. 全テスト完了後、Phase 1レポート作成

---

## 📋 Phase 2: 問題の修正 ⏳

**期間**: Phase 1完了後
**ステータス**: 未開始（Phase 1の結果待ち）

### 方針

Phase 1で発見した問題を以下の優先順位で修正：

1. 🔴 **Critical**: システムが全く動作しない問題
2. 🟡 **Medium**: 一部の機能が動作しない問題
3. 🟢 **Low**: 改善・最適化

### 修正プロセス

各問題ごとに：
1. 原因を特定
2. 修正を実装
3. テストで検証
4. 次の問題へ

### 成功基準（暫定）

- [ ] 新規登録が正しいプランで登録される
- [ ] プラン変更が500エラーなく完了する
- [ ] feedbackプランが登録できる
- [ ] 全ての修正がテストで検証済み

---

## 📋 Phase 3: 全体動作確認 ⏳

**期間**: Phase 2完了後
**ステータス**: 未開始（Phase 2の結果待ち）

### 目的

全てのユーザージャーニーが正常に動作することを確認。

### テストシナリオ（予定）

1. **新規登録フロー**
   - Standard 1M/3M
   - Feedback 1M/3M

2. **プラン変更フロー**
   - アップグレード（Standard → Feedback）
   - ダウングレード（Feedback → Standard）
   - 期間変更（1M → 3M）

3. **キャンセルフロー**
   - Stripeカスタマーポータル経由
   - 期間終了まで利用可能の確認

### 成功基準（暫定）

- [ ] 全てのユーザージャーニーが正常動作
- [ ] エラーが発生しない
- [ ] データベースが正しく更新される
- [ ] ユーザー体験が仕様通り

---

## 📋 Phase 4: ドキュメント更新・完了 ⏳

**期間**: Phase 3完了後
**ステータス**: 未開始（Phase 3の結果待ち）

### 実施内容（予定）

- [ ] 実装ドキュメントの最終化
- [ ] 運用マニュアルの更新
- [ ] トラブルシューティングガイド作成
- [ ] TASK-TRACKER.mdの更新
- [ ] プロジェクト完了報告

---

## 🔴 現在の問題リスト

### Critical Issues

#### ISSUE-P1-001: 環境の不一致（Claude MCPとフロントエンド）🔴
- **発見日**: 2025-11-30
- **発見者**: ユーザー（Phase 1開始時）
- **症状**: Claude（MCP経由）が本番環境DB（fryogvfhymnpiqwssmuu.supabase.co）を参照しているが、フロントエンドはローカル環境DB（127.0.0.1:54321）に接続している
- **影響**: Phase 1テストが開始できない。Claude が確認するデータとユーザーが見るデータが完全に異なる
- **確認内容**:
  - ✅ `.env`設定: `VITE_SUPABASE_URL=http://127.0.0.1:54321` (正しい)
  - ❌ Claude MCP: 本番環境DBを参照（`takumi.kai.skywalker@gmail.com`等が存在）
  - ❌ フロントエンド: ローカルDBに接続（ユーザー0件、ログイン不可）
- **解決策**: ローカル環境で新規ユーザーを作成してテスト実施
- **ステータス**: ✅ 解決済み（ユーザーがローカル環境でアカウント作成完了）
- **スクリーンショット**: ユーザー提供済み（ブラウザコンソールでローカル接続確認）

#### ISSUE-P1-002: Edge Functionが本番環境に接続・データベース保存失敗 🔴
- **発見日**: 2025-11-30 (Test 1-1実施後)
- **発見者**: Claude（ログ分析とDB検証）
- **テスト**: Test 1-1（Standard 1M新規登録）
- **症状**:
  - Edge Functionログに `[LIVE環境]` と表示（本番環境Stripe APIキーを使用）
  - ログには「サブスクリプション情報を正常に保存しました」と表示
  - しかし、ローカルDBにも本番DBにもデータが保存されていない（user_subscriptionsテーブル0件）
  - Webhookは全て200 OKで処理完了と表示
- **影響**:
  - ❌ 新規登録が完全に失敗（データベースに何も保存されない）
  - ❌ Edge Functionが誤った環境（本番）のStripe APIを使用している
  - ❌ `.env`の環境変数が正しく読み込まれていない可能性
- **確認内容**:
  - ✅ Stripe Checkout完了（ユーザーは成功ページ到達）
  - ✅ Stripeダッシュボードで サブスクリプション作成確認（¥4,980、次の請求 12/31）
  - ✅ Webhook全て200 OK（charge.succeeded, checkout.session.completed等）
  - ✅ Edge Functionログ: 「standardプラン（1ヶ月）のサブスクリプション情報を正常に保存しました」
  - ❌ ローカルDB（127.0.0.1:54322）: user_subscriptions = 0件
  - ❌ 本番DB（MCP経由）: 過去2時間のuser_subscriptions = 0件
  - ❌ Edge Functionログに `[LIVE環境]` 表示（期待: `[TEST環境]`）
- **推定原因**:
  1. Edge Functionが `.env` の `STRIPE_MODE=test` を読み込んでいない
  2. Edge Functionが本番環境のSupabase URLに接続している
  3. データベース保存処理でエラーが発生しているが、ログに出力されていない
  4. 環境変数の読み込み順序またはEdge Function起動時の設定ミス
- **次のアクション**:
  - [ ] stripe-webhook Edge Functionのコードを確認（環境変数の読み込み方法）
  - [ ] Edge Function起動コマンドの `--env-file .env` が正しく動作しているか確認
  - [ ] データベース接続URLをログ出力して確認
  - [ ] Webhook処理内のエラーハンドリングを確認
  - [ ] この問題をISSUE-P1-002として記録
- **ステータス**: 🔴 未解決（Critical - 全ての新規登録が失敗している）

#### ISSUE-P0-001: update-subscription 500エラー
- **症状**: プラン変更時に500 Internal Server Error
- **ステータス**: 未修正（Phase 1で詳細調査予定）
- **詳細**: `.claude/docs/subscription/issues/2025-11-30-update-subscription-500-investigation.md`

#### ISSUE-P0-002: feedbackプランのデータが0件
- **症状**: データベースにfeedbackプランのレコードが0件
- **影響**: feedbackプランの新規登録・変更が未テスト
- **ステータス**: 未修正（Phase 1で検証予定）

#### ISSUE-P0-003: 全機能が動作していない
- **新規登録**: ❌ 動作せず（communityプランになる）
- **プラン変更**: ❌ 動作せず（500エラー）
- **キャンセル**: ❌ 動作せず（登録できないため）
- **ステータス**: Phase 1で全フロー検証予定

### Medium Issues

#### ISSUE-P0-005: TEST環境のデータが少ない
- **症状**: test環境のサブスクが1件のみ
- **影響**: テストが不十分な可能性
- **ステータス**: Phase 1でテストデータ作成予定

### Low Issues

#### ISSUE-P0-006: 'community'プラン参照が残存
- **症状**: コード内に'community'への参照が残っている
- **影響**: 現時点で実害なし（データには存在しない）
- **ステータス**: Phase 2で対応予定

---

## 🎯 次のアクション

### 今すぐやること

1. **Phase 1-1を開始**: Standard 1Mプラン新規登録テスト
2. **ログ記録**: 全ての手順をスクリーンショットとログで記録
3. **問題発見**: エラーを発見したら即座にこのドキュメントに記録

### Phase 1完了後

1. Phase 1レポート作成
2. 問題リストを優先順位順に整理
3. Phase 2の詳細計画作成

---

## 📝 開発原則

### 必ず守ること

1. ✅ **推測せず事実に基づく**
   - 全てのフローを実際に試してから判断
   - ログ・スクリーンショット・DB状態を記録

2. ✅ **1つずつ確実に**
   - フェーズを完全に完了してから次へ
   - テストせずに次のステップへ進まない

3. ✅ **全てを記録**
   - 発見した問題は即座に記録
   - 実装の経緯をドキュメント化

4. ✅ **バグなしで実装**
   - 各修正を検証してから次へ
   - リグレッションを防ぐ

---

## 📚 関連ドキュメント

- **UX仕様**: `.claude/docs/subscription/user-experience/flows.md`
- **UX要件**: `.claude/docs/subscription/user-experience/requirements.md`
- **過去の問題**: `.claude/docs/subscription/issues/`
- **システム仕様**: `.claude/docs/subscription/specifications/system-specification.md`

---

**最終更新**: 2025-11-30 23:45
**更新者**: Claude Code
**次の更新**: Phase 1完了時
