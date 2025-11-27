# サブスクリプションシステム - ドキュメント索引

**最終更新**: 2025-11-27
**システムステータス**: ✅ 全テスト完了 (7/7) - デプロイ準備完了

---

## 📚 ドキュメント構成

このドキュメント索引は、サブスクリプションシステムに関するすべてのドキュメントへのナビゲーションを提供します。

### 📁 ドキュメント構成

```
.claude/docs/subscription/
├── README.md                          # 概要（このファイル）
├── developer-guide.md                 # 開発者向けガイド ⭐ NEW
├── deployment-checklist.md            # デプロイチェックリスト ⭐ NEW
├── environment-management.md          # 環境管理ガイド ⭐ NEW
├── testing/
│   ├── comprehensive-test-plan.md     # 包括的テスト計画（全7テスト完了）
│   └── user-flow-test.md              # ユーザーフローテスト
├── issues/
│   └── premium-access-bug.md          # プレミアムアクセスバグ事例
└── plans/
    └── (今後の計画)
```

---

## 🎯 目的別ガイド

### 新規開発者・引き継ぎ時に読むべきドキュメント

1. **この README** - まずここから
2. [specifications/system-specification.md](#1-subscription-system-specificationmd) - システム全体仕様（必読）
3. [specifications/premium-content-access.md](#2-specificationspremium-content-accessmd) - プレミアムコンテンツ仕様
4. [guides/common-errors.md](#4-guidescommon-errorsmd) - よくある間違い集（必読）
5. [環境構築チェックリスト](#環境構築) - 設定漏れ防止

### トラブルシューティング時に読むべきドキュメント

1. [guides/common-errors.md](#4-guidescommon-errorsmd) - エラー別の解決方法
2. [specifications/system-specification.md - トラブルシューティング](#1-specificationssystem-specificationmd) - 問題別の対処法
3. [specifications/premium-content-access.md - トラブルシューティング](#2-specificationspremium-content-accessmd) - プレミアムコンテンツ関連
4. [guides/troubleshooting/webhook-401-error.md](#5-guidestroubleshootingwebhook-401-errormd) - Webhook 401 エラーの詳細
5. 🚨 **[issues/cancelled-subscription-access-issue.md](#7-issuescancelled-subscription-access-issuemd)** - キャンセル後アクセス問題（CRITICAL）

### テスト実施時に読むべきドキュメント

1. [testing/testing-log.md](#3-testingtesting-logmd) - テスト手順とテスト履歴
2. [testing/user-flow-test.md](#6-testinguser-flow-testmd) - ユーザーフローテスト
3. [specifications/premium-content-access.md - テスト手順](#2-specificationspremium-content-accessmd) - プレミアムコンテンツテスト

### 機能追加・改善時に読むべきドキュメント

1. [specifications/system-specification.md](#1-specificationssystem-specificationmd) - 現在の実装詳細
2. [specifications/premium-content-access.md](#2-specificationspremium-content-accessmd) - プレミアムコンテンツ実装
3. [guides/common-errors.md](#4-guidescommon-errorsmd) - 過去の失敗から学ぶ
4. [testing/testing-log.md](#3-testingtesting-logmd) - 過去のテスト結果
5. 📋 **[plans/cancelled-access-implementation-plan.md](#8-planscancelled-access-implementation-planmd)** - キャンセル後アクセス実装計画

---

## 📄 メインドキュメント

### 1. specifications/system-specification.md

**ファイル**: `specifications/system-specification.md`
**サイズ**: 36KB
**最終更新**: 2025-11-24
**バージョン**: 2.1

#### 内容

サブスクリプションシステムの完全仕様書。すべての実装者が最初に読むべきドキュメント。

- ✅ システム概要
- ✅ 実装済み機能（新規登録、プラン変更、キャンセル、二重課金防止など）
- ✅ 技術仕様（フロントエンド、バックエンド、データベース）
- ✅ Edge Functions 詳細（create-checkout, create-customer-portal, stripe-webhook など）
- ✅ **Deep Link 仕様** - Customer Portal へのダイレクト遷移
- ✅ **Webhook 処理詳細** - customer.subscription.updated での plan_type/duration 更新
- ✅ **環境構築チェックリスト** - 設定漏れ防止
- ✅ **トラブルシューティング** - Webhook 401 エラー、Price ID エラーなど
- ✅ 本番環境移行チェックリスト

#### いつ読むか

- 新規参画時（必読）
- 機能追加・改善前
- トラブルシューティング時

---

### 2. specifications/premium-content-access.md

**ファイル**: `specifications/premium-content-access.md`
**サイズ**: 21KB
**最終更新**: 2025-11-24

#### 内容

プレミアムコンテンツのアクセス制御仕様。サブスクリプション加入者のみがアクセスできるメンバー限定コンテンツの詳細。

- ✅ アクセス制御の基本ルール
- ✅ プラン別アクセス権限マトリックス
- ✅ 実装アーキテクチャ（データフロー、コンポーネント構成）
- ✅ 動画コンテンツのアクセス制御
- ✅ ロック画面の表示仕様
- ✅ リアルタイム更新機能
- ✅ Sanity CMS でのプレミアム設定方法
- ✅ テスト手順（5 つのテストケース）
- ✅ トラブルシューティング

#### いつ読むか

- プレミアムコンテンツ機能を理解したいとき
- `isPremium` フラグの実装を確認したいとき
- ロック画面のデザイン・動作を確認したいとき
- Sanity CMS でプレミアム設定を行うとき

---

### 3. testing/testing-log.md

**ファイル**: `testing/testing-log.md`
**サイズ**: 96KB
**最終更新**: 2025-11-24

#### 内容

テスト実施記録の完全版。Test 2E（プラン変更テスト）を含むすべてのテスト履歴。

- ✅ Test 2E 完了記録（Feedback 1M → Standard 1M）
- ✅ Webhook 401 エラーの発見と解決プロセス
- ✅ データベース検証結果
- ✅ プロレーション計算結果
- ✅ 過去のテスト履歴（Phase 1-5）

#### いつ読むか

- テスト実施前（手順確認）
- テスト失敗時（過去の同様のケースを確認）
- 実装検証時（どのようにテストすべきか確認）

---

### 4. guides/common-errors.md

**ファイル**: `guides/common-errors.md`
**サイズ**: 15KB
**作成日**: 2025-11-24

#### 内容

過去の失敗・エラーから学ぶ教訓集。同じ間違いを繰り返さないためのドキュメント。

- 🔴 **Critical エラー**
  - Webhook 401 Unauthorized
  - Price ID が見つからない
- ❌ **実装の誤解**
  - customer.subscription.updated で自動キャンセル（誤り）
  - Deep Link = 新規サブスクリプション作成（誤り）
  - Stripe CLI が必要（誤り）
- ⚠️ **環境構築の失敗**
  - .env と Supabase Secrets の混同
  - Webhook エンドポイントの設定忘れ
- ⚠️ **テストの失敗**
  - フロントエンドだけ確認してデータベースを確認しない
  - Edge Functions ログを確認しない
- ✅ **予防策チェックリスト**

#### いつ読むか

- 新規参画時（必読）
- エラー発生時（類似エラーの解決方法を確認）
- 実装前（同じ間違いを避けるため）

---

### 4. guides/troubleshooting/webhook-401-error.md

**ファイル**: `guides/troubleshooting/webhook-401-error.md`
**サイズ**: 8.5KB
**作成日**: 2025-11-24

#### 内容

Webhook 401 Unauthorized エラーの詳細解決記録。

- 症状（フロントエンド、データベース、Stripe、Edge Functions）
- 根本原因（STRIPE_WEBHOOK_SECRET_TEST 未設定）
- 影響範囲（すべての Webhook イベントが処理されない）
- 解決方法（Step-by-Step）
- 検証結果
- 予防策
- 教訓

#### いつ読むか

- Webhook 401 エラー発生時
- Webhook が動作しない問題のトラブルシューティング時
- 環境構築時（予防のため）

---

### 5. specifications/user-flow-specification.md

**ファイル**: `specifications/user-flow-specification.md`
**サイズ**: 15KB
**最終更新**: 2025-11-20

#### 内容

ユーザーフローの詳細仕様。

- 新規登録フロー
- プラン変更フロー
- キャンセルフロー
- 各フローの画面遷移
- データフロー
- エラーハンドリング

#### いつ読むか

- UI/UX の改善時
- フロー変更を検討する時
- ユーザー体験を理解したい時

---

### 7. issues/cancelled-subscription-access-issue.md

**ファイル**: `issues/cancelled-subscription-access-issue.md`
**サイズ**: 18KB
**作成日**: 2025-11-26
**優先度**: 🚨 CRITICAL
**ステータス**: ✅ 実装完了・デプロイ済み / ⚠️ テスト中に新たな問題発見

#### 内容

Test 4 で発見されたキャンセル後のプレミアムコンテンツアクセス問題の完全分析と実装記録。

- 🚨 問題概要（キャンセル直後にアクセス不可）
- 🔍 原因分析
  - `calculateAccessPermissions` 関数の問題 (handlers.ts:9-21)
  - `is_active` フラグの更新タイミング
  - Webhook 処理の詳細
- 🏗️ システムアーキテクチャ（アクセス制御フロー全体）
- 💡 解決策の方向性（Option 1 & 2）
- 🎯 実装計画（Phase 1-4）
- 📊 影響範囲（影響を受けるユーザー・コンポーネント）
- 🔄 **実装状況**（2025-11-26 更新）
  - ✅ Phase 1-2 完了（関数修正・デプロイ）
  - ⚠️ Phase 3.2 で plan_type 判定問題を発見

#### いつ読むか

- キャンセル後アクセス機能の実装経緯を知りたいとき
- Test 4 の失敗原因を理解したいとき
- プレミアムアクセス制御の仕組みを深く理解したいとき

---

### 8. issues/plan-type-detection-issue.md

**ファイル**: `issues/plan-type-detection-issue.md`
**サイズ**: 8KB
**作成日**: 2025-11-26
**優先度**: 🔴 HIGH
**ステータス**: 🔍 調査中

#### 内容

Test 4 再テスト中に発見された、Feedback プラン（Growth プラン）の plan_type 判定問題。

- 📋 問題概要
  - Feedback プラン（4980 円）が `"standard"` として保存される
  - 本来は `"growth"` であるべき
- 🔍 原因分析
  - プラン構成の整理（Community/Standard/Growth）
  - 現在のプラン判定ロジック（plan-utils.ts）
  - データベース状態と Stripe 価格の矛盾
- 💡 仮説
  - 仮説 1: Webhook 処理時の上書き
  - 仮説 2: 複数回のプラン変更
  - 仮説 3: テスト環境での手動操作
- 🛠️ 一時的な対処（手動修正）
- 🎯 根本解決策（Phase 1-3）
- 📊 影響範囲（誤った plan_type を持つユーザーの抽出クエリ）

#### いつ読むか

- Feedback プラン関連の不具合調査時（必読）
- Webhook 処理を修正する前
- plan_type の判定ロジックを理解したいとき

---

### 9. plans/cancelled-access-implementation-plan.md

**ファイル**: `plans/cancelled-access-implementation-plan.md`
**サイズ**: 20KB
**作成日**: 2025-11-26
**ステータス**: 📝 計画中

#### 内容

キャンセル後アクセス機能の詳細実装計画書。実装前に必読。

- 🎯 実装目標
- 📋 実装の前提条件（既存システムを壊さない）
- 🛠️ 実装手順（Phase 1-4）
  - Phase 1: 事前調査（Webhook ログ確認）
  - Phase 2: コード修正（handlers.ts の修正詳細）
  - Phase 3: テスト（ユニット・統合・回帰テスト）
  - Phase 4: ドキュメント更新
- ⚠️ リスクと対策（4 つのリスクと対応策）
- 📅 実装スケジュール（合計 3.5 時間）
- ✅ 完了条件

#### いつ読むか

- キャンセル後アクセス機能を実装する前（必読）
- 実装中の各 Phase 開始時
- テスト計画を立てるとき

---

## 🗂️ アーカイブドキュメント

以下のドキュメントは `archive/old-investigations/` に移動されています。
歴史的記録として保持されていますが、最新情報は上記のメインドキュメントを参照してください。

### 古い調査・計画ファイル

- `SUBSCRIPTION-IMPLEMENTATION-SPEC.md` - 誤った実装の分析（2025-11-22）
- `stripe-system-specification.md` - 古い仕様書（2025-11-20）
- `debug-subscription-issue.md` - 古いデバッグガイド
- `subscription-issue-investigation.md` - 古い調査記録
- `subscription-not-active-investigation.md` - 古い調査記録
- `SUBSCRIPTION-FIX-PLAN.md` - 古い修正計画
- `stripe-customers-insert-error.md` - 解決済みエラーの記録
- `stripe-environment-implementation-plan.md` - 古い実装計画
- `stripe-environment-separation-plan.md` - 古い実装計画
- `stripe-implementation-review-and-improvements.md` - 古いレビュー
- `stripe-additional-review-points.md` - 古いレビュー
- `stripe-webhook-best-practices.md` - ベストプラクティス（統合済み）
- `payment-tasks-detailed.md` - 古いタスク整理
- `stripe-cli-explanation.md` - CLI 説明（guides/common-errors.md に統合）

### いつ参照するか

- 過去の意思決定の経緯を知りたい時
- 特定の問題の調査履歴を確認したい時

---

## 🚀 クイックスタートガイド

### 環境構築

1. [specifications/system-specification.md - 環境構築チェックリスト](./specifications/system-specification.md#環境構築チェックリスト) を開く
2. チェックリストに従って設定
3. **特に重要**: Webhook Secret の設定を忘れない
4. 動作確認テストを実施

### トラブルシューティング

1. エラーメッセージを確認
2. [guides/common-errors.md](./guides/common-errors.md) で類似エラーを検索
3. 見つからない場合は [specifications/system-specification.md - トラブルシューティング](./specifications/system-specification.md#トラブルシューティング) を確認
4. それでも解決しない場合は Edge Functions Logs を詳細確認

### テスト実施

1. [testing/testing-log.md](./testing/testing-log.md) で該当するテストケースを確認
2. テスト手順に従って実施
3. **必ず**: データベースと Edge Functions Logs を確認
4. 結果を testing/testing-log.md に記録

---

## 📝 ドキュメント更新ルール

### ドキュメントを更新すべきとき

- 新しい機能を追加したとき
- バグを修正したとき
- エラーが発生して解決したとき
- テストを実施したとき

### 更新すべきドキュメント

| 変更内容   | 更新ドキュメント                               |
| ---------- | ---------------------------------------------- |
| 新機能追加 | specifications/system-specification.md         |
| バグ修正   | guides/common-errors.md（教訓を追加）          |
| テスト実施 | testing/testing-log.md                         |
| エラー解決 | guides/common-errors.md + 詳細ドキュメント作成 |

---

## 🔗 関連リンク

### 外部ドキュメント

- [Stripe API ドキュメント](https://stripe.com/docs/api)
- [Stripe Subscriptions](https://stripe.com/docs/billing/subscriptions)
- [Stripe Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Stripe Webhooks](https://stripe.com/docs/webhooks)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)

### Stripe Dashboard

- [テスト環境 Webhooks](https://dashboard.stripe.com/test/webhooks)
- [本番環境 Webhooks](https://dashboard.stripe.com/webhooks)
- [Products & Prices](https://dashboard.stripe.com/test/products)

### Supabase Dashboard

- [Edge Functions](https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/functions)
- [Database](https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/database/tables)
- [Edge Functions Secrets](https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/settings/functions)

---

## 🚨 現在の Critical Issues (2025-11-26)

### Issue 1: キャンセル後のプレミアムコンテンツアクセス機能

**ステータス**: ✅ 実装完了・デプロイ済み / ⚠️ plan_type 問題により完全テスト保留中

**詳細**: [issues/cancelled-subscription-access-issue.md](./issues/cancelled-subscription-access-issue.md)

**実装内容**:

- ✅ `calculateAccessPermissions` 関数を修正
- ✅ `cancel_at_period_end: true` でも `current_period_end` までアクセス可能に変更
- ✅ check-subscription Edge Function をデプロイ済み

**残課題**:

- ⏳ plan_type 判定問題の解決待ち
- ⏳ 完全な動作確認テスト（Test 4 再実施）

---

### Issue 2: Feedback プラン（Growth プラン）の plan_type 判定問題 🔴 NEW

**ステータス**: 🔍 調査中

**詳細**: [issues/plan-type-detection-issue.md](./issues/plan-type-detection-issue.md)

**問題**:

- Feedback プラン（4980 円）が `plan_type: "standard"` として保存される
- 本来は `plan_type: "growth"` であるべき
- プレミアムコンテンツへのアクセスに影響

**原因（仮説）**:

- Webhook 処理で価格からプラン判定する際に問題がある可能性
- または、プラン変更時に正しく更新されていない可能性

**現在の対応**:

- ✅ テストユーザーのデータベースを手動修正（一時対処）
- ⏳ Webhook 処理の調査・修正が必要
- ⏳ 既存ユーザーの一括修正スクリプト作成予定

**影響範囲**:

- Feedback プラン（Growth プラン）のすべてのユーザー
- プレミアムコンテンツアクセス制御

**次のアクション**:

1. Webhook 処理（stripe-webhook-test/index.ts）の詳細調査
2. plan_type 保存ロジックの修正
3. 既存ユーザーの一括修正
4. Test 4 完全再実施

---

## ❓ FAQ

### Q: どのドキュメントから読めばいいですか？

**A**:

1. この README（今読んでいるドキュメント）
2. specifications/system-specification.md（システム全体仕様）
3. guides/common-errors.md（よくある間違い）

この順番で読めば、システムの全体像と注意点を理解できます。

### Q: エラーが発生しました。どうすればいいですか？

**A**:

1. guides/common-errors.md でエラーを検索
2. 見つからない場合は specifications/system-specification.md のトラブルシューティングセクションを確認
3. Edge Functions Logs を確認
4. 解決したら guides/common-errors.md に教訓を追加

### Q: テストはどうすればいいですか？

**A**:
testing/testing-log.md にテストケースと手順が記載されています。テスト実施後は必ずデータベースと Edge Functions Logs を確認してください。

### Q: 新しい機能を追加したいです。何を確認すればいいですか？

**A**:

1. specifications/system-specification.md で現在の実装を確認
2. guides/common-errors.md で過去の失敗例を確認
3. 実装後は specifications/system-specification.md を更新
4. テストを実施して testing/testing-log.md に記録

---

**作成日**: 2025-11-24
**最終更新**: 2025-11-26
**管理者**: AI 開発チーム
**目的**: サブスクリプションシステムの完全なドキュメント体系を提供

## 🚨 重要なお知らせ

**2025-11-26 更新**: Test 4 (キャンセルテスト) で CRITICAL Issue を発見しました。

**問題**: キャンセル後も `current_period_end` までプレミアムコンテンツにアクセス可能にする機能が未実装

**対応**:

- 問題分析完了: [issues/cancelled-subscription-access-issue.md](./issues/cancelled-subscription-access-issue.md)
- 実装計画作成: [plans/cancelled-access-implementation-plan.md](./plans/cancelled-access-implementation-plan.md)
- **次のステップ**: Phase 1 開始 - Webhook ログ確認と実装
