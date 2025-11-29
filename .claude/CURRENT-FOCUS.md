# 現在の作業フォーカス

**最終更新**: 2025-11-29
**ステータス**: 🔴 Critical Issue対応中

---

## 🎯 今取り組んでいること

### タスク: Stripe Webhook 401エラー修正

**問題**: プラン変更時に二重課金が発生している

**根本原因**: Stripe Webhookが401エラーで失敗し、古いサブスクリプションがキャンセルされない

**実装計画**: `.claude/docs/subscription/implementation-plans/2025-11-29-webhook-401-fix.md` (作成予定)

---

## 📋 現状サマリー

### 発見された問題

1. **Webhook 401エラー** (根本原因)
   - Stripe Webhookが署名検証で失敗
   - ログ: `POST | 401 | stripe-webhook`

2. **Webhook URLミスマッチ**
   - Stripe Dashboard設定: `stripe-webhook-test`
   - アプリが使用: `stripe-webhook`
   - イベントが正しい関数に届いていない

3. **二重課金**
   - 新しいサブスクリプション作成 ✅
   - 古いサブスクリプションキャンセル ❌ (Webhookが動いていないため)
   - 結果: 2つのアクティブなサブスクリプション

4. **サブスクリプション状態が更新されない**
   - Consoleで `subscribed: false`
   - プラン情報が表示されない

### 調査済み事項

- ✅ Webhook関数が2つ存在 (`stripe-webhook`, `stripe-webhook-test`)
- ✅ データベース状態確認 (1件のみ、`is_active: false`)
- ✅ Stripe Dashboard確認 (2つのアクティブなサブスクリプション)
- ✅ ログ確認 (401エラー複数回発生)

### 未確認事項

- ❓ Supabase Secretsの設定状況
- ❓ `stripe-webhook-test`の用途
- ❓ テストモードと本番モードの使い分け方針

---

## 🎨 実装方針（暫定）

### Option A: 新しいWebhookエンドポイント作成
- Stripe Dashboardで `stripe-webhook` 用のエンドポイント追加
- Signing Secretを取得
- Supabase Secretsに設定

### Option B: 既存エンドポイントのURL変更
- `stripe-webhook-test` → `stripe-webhook` に変更
- リスク: `stripe-webhook-test`が他で使われている可能性

**次のステップ**: ユーザーと方針を決定後、実装計画を作成

---

## 📚 関連ドキュメント

- [現状調査結果](./docs/subscription/specifications/current-status-investigation.md)
- [環境変数定義](./docs/project-knowledge/environment-variables.md)
- [技術マッピング](./docs/project-knowledge/tech-stack-map.md)
- [エラーデータベース](./docs/subscription/troubleshooting/error-database.md)

---

## 🔄 作業履歴

### 2025-11-29

**実施内容**:
- Webhook 401エラーの根本原因特定
- プロジェクト構造を現状に合わせて再編
- `.claude`フォルダのリファクタリング
- 新しい実装ワークフロー導入

**発見した問題**:
- Webhook URLミスマッチ
- 環境変数の不明確な管理

**次回やること**:
1. 実装方針の決定（ユーザーと相談）
2. 実装計画書の作成
3. Webhook設定修正
4. テスト実行

---

## 🚨 ブロッカー

**なし** - ユーザーの方針決定待ち

---

## 📝 メモ

### Stripe環境の使い分け

**テストモード** (現在):
- 開発・テスト用
- 実際のお金は動かない
- `sk_test_...`, `pk_test_...`

**本番モード** (将来):
- 実際の課金処理
- `sk_live_...`, `pk_live_...`

**ゴール**: 同じコードベースで両環境に対応

---

**このドキュメントは作業の進捗に応じて随時更新してください。**
