# Bono Training - Documentation

**最終更新**: 2025-11-19

このディレクトリには、Subscription（サブスクリプション）システムとデータ移行に関するドキュメントが含まれています。

---

## 📚 ドキュメント構成

### 🔄 **データ移行プロジェクト**（進行中）

**📁 migration/** フォルダ
- 既存 Stripe 顧客データ（2,162人、250件）の Supabase への移行
- **詳細は [migration/README.md](./migration/README.md) を参照**

**現在の状況**: Phase 0（1件テスト）の準備完了 ✅

**次にやること**:
1. [migration/migration-test-guide.md](./migration/migration-test-guide.md) を開く
2. Phase 0 の手順に従ってスクリプトを実行
3. 動作確認

---

### 💳 **Subscription システム開発**（ほぼ完了）

#### 🔴 最重要ドキュメント

**TESTING.md** - テストガイド

Stripe実装をテストする前に必読！テスト手順、確認項目、チェックリストを含む統合テストガイドです。

**含まれる内容**:
- テスト1: プラン変更（feedback → standard）
- テスト2: 期間変更（1ヶ月 → 3ヶ月）
- テスト3: 新規ユーザー
- テスト4: 解約同期（リアルタイム更新）
- テスト5: キャンセルURL

---

#### 📘 実装完了レポート

1. **critical-fixes-applied.md** - 二重課金防止のCritical修正完了レポート
   - 複数サブスクリプション対応
   - Webhook重複チェック追加
   - upsert変更
   - デプロイ完了記録

2. **implementation-summary-tasks4-5.md** - タスク4・5 実装完了レポート
   - タスク4: 解約同期改善（Realtime機能追加）
   - タスク5: エラーリトライ処理

---

#### 📖 実装詳細ドキュメント

3. **double-billing-prevention-implementation.md** - 二重課金防止の実装詳細
   - 実装方針（Checkout作成前にキャンセル）
   - 技術的詳細
   - エッジケース対応（10パターン）
   - セキュリティ考慮事項

4. **remaining-tasks-priority.md** - 残タスクと優先順位
   - 完了したタスク一覧
   - テスト待ちのタスク
   - 今後の開発タスク（中優先・低優先）

---

#### 📋 参考ドキュメント

5. **payment-tasks-detailed.md** - 決済機能 詳細タスク整理ドキュメント
   - 全7タスクの詳細説明
   - 実装方針
   - 失敗パターンと対策

6. **stripe-webhook-best-practices.md** - Stripe Webhookベストプラクティス
   - Webhookの仕組み
   - セキュリティ対策
   - エラーハンドリング

7. **phase6-premium-content-implementation.md** - Phase 6: プレミアムコンテンツアクセス制御
   - RLS実装
   - アクセス制御ロジック

---

### 🗂️ アーカイブ

`archive/` フォルダには、実装完了済みの古いドキュメントが保管されています。

---

## 🎯 現在のプロジェクト状況

### 💳 Subscription システム

| カテゴリ | ステータス | ドキュメント |
|---------|----------|------------|
| 二重課金防止 | ✅ 完了 | double-billing-prevention-implementation.md |
| キャンセル機能 | ✅ 完了 | implementation-summary-tasks4-5.md |
| Duration変更 | ✅ 完了 | implementation-summary-tasks4-5.md |
| エラーリトライ | ✅ 完了 | implementation-summary-tasks4-5.md |
| cancel_url修正 | ✅ 完了 | critical-fixes-applied.md |
| テスト実行 | 🔄 進行中 | TESTING.md |

### 🔄 データ移行プロジェクト

| フェーズ | ステータス | 対象 | ドキュメント |
|---------|----------|------|-------------|
| Phase 0 | 🔄 準備完了 | 1件テスト | migration/migration-test-guide.md |
| Phase 1 | ⏳ 待機中 | 10件テスト | migration/migration-test-guide.md |
| Phase 2 | ⏳ 待機中 | 全件移行（2,162件） | migration/migration-test-guide.md |
| Phase 3 | ⏳ 待機中 | 並行稼働 | migration/migration-plan.md |

---

## 🚀 次にやること

### 🥇 優先度1: データ移行 Phase 0（最優先）

**[migration/migration-test-guide.md](./migration/migration-test-guide.md)** を参照

```bash
# Step 1: Auth ユーザー作成
npx tsx scripts/migrate-create-auth-users.ts stripe-customers-test.csv

# Step 2: stripe_customers テーブル
npx tsx scripts/migrate-stripe-customers.ts stripe-customers-test.csv

# Step 3: user_subscriptions テーブル
npx tsx scripts/migrate-subscriptions.ts stripe-subscriptions-test.csv
```

### 🥈 優先度2: Subscription テスト

**TESTING.md** を参照してテストを実施

---

## 🐛 トラブルシューティング

### Subscription システム

1. **二重課金が発生する**
   - → `double-billing-prevention-implementation.md` 参照

2. **キャンセルが反映されない**
   - → `implementation-summary-tasks4-5.md` のキャンセル同期を確認

3. **Webhook エラー**
   - → `stripe-webhook-best-practices.md` 参照

### データ移行

1. **移行エラーが発生する**
   - → `migration/migration-test-guide.md` のトラブルシューティングセクション参照

2. **CSVの形式が異なる**
   - → スクリプトのカラム名を調整

3. **認証エラー**
   - → `.env` の `SUPABASE_SERVICE_ROLE_KEY` を確認

---

## 📝 ドキュメント作成ルール

- 実装完了後、必ず実装サマリーを作成
- テスト計画は事前に作成
- 重要な修正は critical-fixes-applied.md に記録
- 古いドキュメントは archive/ に移動
- 移行関連は migration/ フォルダに配置

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

**次にやること**: [migration/migration-test-guide.md](./migration/migration-test-guide.md) の Phase 0 を実行する

**最終更新日**: 2025-11-19
