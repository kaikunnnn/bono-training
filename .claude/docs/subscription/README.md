# サブスクリプションシステム - ドキュメント索引

**最終更新**: 2025-11-24
**システムステータス**: ✅ 本番稼働可能（Deep Link & Webhook 完全対応）

---

## 📚 ドキュメント構成

このドキュメント索引は、サブスクリプションシステムに関するすべてのドキュメントへのナビゲーションを提供します。

---

## 🎯 目的別ガイド

### 新規開発者・引き継ぎ時に読むべきドキュメント

1. **このREADME** - まずここから
2. [specifications/system-specification.md](#1-subscription-system-specificationmd) - システム全体仕様（必読）
3. [guides/common-errors.md](#3-common-errorsmd) - よくある間違い集（必読）
4. [環境構築チェックリスト](#環境構築) - 設定漏れ防止

### トラブルシューティング時に読むべきドキュメント

1. [guides/common-errors.md](#3-common-errorsmd) - エラー別の解決方法
2. [specifications/system-specification.md - トラブルシューティング](#1-subscription-system-specificationmd) - 問題別の対処法
3. [guides/troubleshooting/webhook-401-error.md](#4-webhook-401-errormd) - Webhook 401エラーの詳細

### テスト実施時に読むべきドキュメント

1. [testing/testing-log.md](#2-testing-logmd) - テスト手順とテスト履歴
2. [specifications/user-flow-specification.md](#5-subscription-user-flow-specificationmd) - ユーザーフロー仕様

### 機能追加・改善時に読むべきドキュメント

1. [specifications/system-specification.md](#1-subscription-system-specificationmd) - 現在の実装詳細
2. [guides/common-errors.md](#3-common-errorsmd) - 過去の失敗から学ぶ
3. [testing/testing-log.md](#2-testing-logmd) - 過去のテスト結果

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
- ✅ **トラブルシューティング** - Webhook 401エラー、Price ID エラーなど
- ✅ 本番環境移行チェックリスト

#### いつ読むか

- 新規参画時（必読）
- 機能追加・改善前
- トラブルシューティング時

---

### 2. testing/testing-log.md

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

### 3. guides/common-errors.md

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
- `stripe-cli-explanation.md` - CLI説明（guides/common-errors.mdに統合）

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

| 変更内容 | 更新ドキュメント |
|---------|----------------|
| 新機能追加 | specifications/system-specification.md |
| バグ修正 | guides/common-errors.md（教訓を追加） |
| テスト実施 | testing/testing-log.md |
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

## ❓ FAQ

### Q: どのドキュメントから読めばいいですか？

**A**: 
1. このREADME（今読んでいるドキュメント）
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
**管理者**: AI開発チーム
**目的**: サブスクリプションシステムの完全なドキュメント体系を提供
