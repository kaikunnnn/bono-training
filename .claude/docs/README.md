# Subscription実装ドキュメント

**最終更新**: 2025-11-18

このディレクトリには、Bono Training サブスクリプション機能の実装に関するドキュメントがまとめられています。

---

## 📁 ドキュメント構成

### 🔴 最重要ドキュメント

#### `TESTING.md` - テストガイド
**Stripe実装をテストする前に必読！**

テスト手順、確認項目、チェックリストを含む統合テストガイドです。
このドキュメントに従ってテストを実施してください。

**含まれる内容**:
- テスト1: プラン変更（feedback → standard）
- テスト2: 期間変更（1ヶ月 → 3ヶ月）
- テスト3: 新規ユーザー
- テスト4: 解約同期（リアルタイム更新）
- テスト5: キャンセルURL

---

### 📘 実装完了レポート

#### `critical-fixes-applied.md`
二重課金防止のCritical修正完了レポート

**内容**:
- 複数サブスクリプション対応
- Webhook重複チェック追加
- upsert変更
- デプロイ完了記録

#### `implementation-summary-tasks4-5.md`
タスク4・5 実装完了レポート

**内容**:
- タスク4: 解約同期改善（Realtime機能追加）
- タスク5: エラーリトライ処理

---

### 📖 実装詳細ドキュメント

#### `double-billing-prevention-implementation.md`
二重課金防止の実装詳細

**内容**:
- 実装方針（Checkout作成前にキャンセル）
- 技術的詳細
- エッジケース対応（10パターン）
- セキュリティ考慮事項

#### `remaining-tasks-priority.md`
残タスクと優先順位

**内容**:
- 完了したタスク一覧
- テスト待ちのタスク
- 今後の開発タスク（中優先・低優先）

---

### 📋 参考ドキュメント

#### `payment-tasks-detailed.md`
決済機能 詳細タスク整理ドキュメント

**内容**:
- 全7タスクの詳細説明
- 実装方針
- 失敗パターンと対策
- 見積もり

#### `stripe-webhook-best-practices.md`
Stripe Webhookベストプラクティス

**内容**:
- Webhookの仕組み
- セキュリティ対策
- エラーハンドリング
- テスト方法

#### `phase6-premium-content-implementation.md`
Phase 6: プレミアムコンテンツアクセス制御

**内容**:
- RLS実装
- アクセス制御ロジック
- UI実装

---

## 🗂️ アーカイブ

`archive/` フォルダには、実装完了済みの古いドキュメントが保管されています。

**含まれるもの**:
- 過去の仕様書
- 実装計画
- 調査レポート
- 古いテスト計画

---

## 📊 現在の実装状況

### ✅ 完了済み（2025-11-18）

| タスク | 状態 | 完了日 |
|--------|------|--------|
| 1. 二重課金防止 | ✅ 完了 | 2025-11-18 |
| 2. cancel_url修正 | ✅ 完了 | 2025-11-18 |
| 3. 期間変更機能 | ✅ 完了 | 2025-11-18 |
| 4. 解約同期改善 | ✅ 完了 | 2025-11-18 |
| 5. エラーリトライ | ✅ 完了 | 2025-11-18 |

### ⏳ テスト待ち

- **全実装のテスト実施** - `TESTING.md` 参照

### 🔵 今後のタスク（オプション）

- タスク6: RLSセキュリティ強化
- タスク7: DB制約追加

---

## 🚀 テストを始める前に

### 1. このREADMEを読む
現在の実装状況を理解する

### 2. `TESTING.md` を開く
テスト手順を確認する

### 3. テスト実施
チェックリストに従ってテストを実施する

### 4. 結果を報告
問題があればドキュメント化する

---

## 📝 実装の背景

### なぜこの実装が必要だったのか

#### 問題1: 二重課金
- **問題**: プラン変更時に既存サブスクリプションがキャンセルされず、2つ同時にアクティブになる
- **解決**: Checkout作成前に既存サブスクリプションを全てキャンセル、Webhookでも二重チェック

#### 問題2: 解約の反映遅延
- **問題**: Stripeで解約してもアカウントページで即座に反映されない
- **解決**: Supabase Realtime Subscriptionsでリアルタイム更新

#### 問題3: ネットワークエラー
- **問題**: 一時的なエラーで決済が失敗する
- **解決**: 指数バックオフリトライを実装

#### 問題4: 期間変更ができない
- **問題**: 同じプラン内で期間変更しようとすると「現在のプラン」と判定される
- **解決**: `isCurrentPlan` 判定にdurationを含める

---

## 🔍 トラブルシューティング

### 問題が発生した場合

1. **Supabase Logs を確認**
   - URL: https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions
   - 関数: `create-checkout`, `stripe-webhook`

2. **Stripe Dashboard を確認**
   - URL: https://dashboard.stripe.com/test/subscriptions
   - Activeサブスクリプションの数を確認

3. **Database を確認**
   - `user_subscriptions` テーブル
   - `is_active=true` のレコード数を確認

4. **ドキュメントを参照**
   - `TESTING.md` - テスト手順
   - `double-billing-prevention-implementation.md` - 実装詳細
   - `critical-fixes-applied.md` - 修正内容

---

## 📚 関連リソース

### Stripe公式ドキュメント
- [Subscriptions API](https://stripe.com/docs/api/subscriptions)
- [Customer Portal](https://stripe.com/docs/billing/subscriptions/customer-portal)
- [Webhooks](https://stripe.com/docs/webhooks)

### Supabase公式ドキュメント
- [Realtime Subscriptions](https://supabase.com/docs/guides/realtime)
- [Edge Functions](https://supabase.com/docs/guides/functions)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)

---

## 🤝 貢献

ドキュメントの改善提案や、新しい問題の発見があれば、以下の手順で報告してください：

1. 問題を明確に記述
2. 再現手順を記載
3. 期待される動作と実際の動作を記載
4. スクリーンショットやログを添付

---

## 📞 サポート

質問や問題がある場合は、以下のドキュメントを参照してください：

- `TESTING.md` - テスト関連
- `double-billing-prevention-implementation.md` - 実装詳細
- `payment-tasks-detailed.md` - タスク詳細

---

**最終更新日**: 2025-11-18
**作成者**: Claude Code
