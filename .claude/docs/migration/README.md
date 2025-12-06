# データ移行プロジェクト

**目的**: Memberstack + Webflow から Supabase Auth + Supabase DB + Stripe への移行
**最終更新**: 2025-12-05
**ステータス**: 🔧 移行ユーザー判定機能を実装中

---

## 🚀 現在の状況

### ✅ データ移行完了（2025-11-19）

| テーブル | 件数 | 状態 |
|----------|------|------|
| auth.users | 2,045件 | ✅ 完了 |
| stripe_customers | 2,042件 | ✅ 完了 |
| user_subscriptions | 2,037件 | ✅ 完了 |

### ✅ Phase A: 運営アカウントテスト完了（2025-12-05）

| テスト項目 | 結果 |
|------------|------|
| ログイン | ✅ |
| サブスク情報表示 | ✅ |
| 限定コンテンツ | ✅（CORS修正後）|
| Stripeポータル | ✅ |

### 🔄 次にやること

1. **移行ユーザー判定機能の実装** ← ★ 今ここ
   - [MIGRATED-USER-DETECTION-PLAN.md](./MIGRATED-USER-DETECTION-PLAN.md)
2. **Phase B**: メンバー10人テスト
3. **Phase C**: 追加テスト（新規登録など）

---

## 📚 ドキュメント構成

### 重要ドキュメント（優先順）

| ドキュメント | 説明 | 状態 |
|--------------|------|------|
| **[MIGRATED-USER-DETECTION-PLAN.md](./MIGRATED-USER-DETECTION-PLAN.md)** | 移行ユーザー判定機能 | ★ 実装予定 |
| [VERIFICATION-TEST-PLAN.md](./VERIFICATION-TEST-PLAN.md) | 検証テスト計画 | Phase A 完了 |
| [MEMBER-TEST-FLOW.md](./MEMBER-TEST-FLOW.md) | メンバーテストフロー | Phase B 用 |
| [MIGRATION-PLAN.md](./MIGRATION-PLAN.md) | 移行計画（全体像） | ✅ 完了 |
| [DATA-MAPPING.md](./DATA-MAPPING.md) | データマッピング詳細 | ✅ 完了 |
| [ROLLBACK-PLAN.md](./ROLLBACK-PLAN.md) | ロールバック手順 | 参照用 |

### 過去の記録

| ドキュメント | 説明 |
|--------------|------|
| [phase1-test-report.md](./phase1-test-report.md) | Phase 1 テストレポート |
| [phase2-full-migration-report.md](./phase2-full-migration-report.md) | Phase 2 移行レポート |
| [migration-test-guide.md](./migration-test-guide.md) | 旧テストガイド |

### 参考資料

| ドキュメント | 説明 |
|--------------|------|
| [data-migration-planning.md](./data-migration-planning.md) | 要件ヒアリング |
| [current-implementation-summary.md](./current-implementation-summary.md) | 現状分析 |
| [current-data-status.md](./current-data-status.md) | データ状況 |
| [migration-next-steps.md](./migration-next-steps.md) | 実装手順詳細 |
| [password-reset-strategies.md](./password-reset-strategies.md) | パスワードリセット戦略 |

---

## ✅ 完了した作業

### Phase 0-2: データ移行（2025-11-19）

- [x] 要件ヒアリング
- [x] 現状分析
- [x] 移行計画の策定
- [x] CSVデータのエクスポート
- [x] 移行スクリプトの作成
- [x] Phase 0: 1件テスト ✅
- [x] Phase 1: 10件テスト ✅
- [x] Phase 2: 全件移行 ✅

### データ整合性確認（2025-12-05）

- [x] 孤児レコードチェック
- [x] 重複レコードチェック
- [x] plan_members 修正（3件）

---

## 📊 移行対象データ

### 既存システム

- **総顧客数**: 2,162 人
- **アクティブサブスクリプション**: 250 件
- **データソース**: Stripe + MemberStack
- **既存プラン**:
  - Standard 1 ヶ月: ¥6,800/月
  - Standard 3 ヶ月: ¥5,800/月
  - Feedback 1 ヶ月: ¥1,480/月
  - Feedback 3 ヶ月: ¥1,280/月

### 新システム

- **Supabase Auth**: ユーザー認証
- **Supabase Database**: データ保存
- **Stripe**: 既存のサブスクリプション ID を維持

---

## ⚠️ 重要な決定事項

### 1. 既存 Stripe サブスクリプション ID を維持

- 新しいサブスクリプションは作成しない
- 価格変更なし
- 課金継続

### 2. テストデータは残す

- 既存の 8 件のテストデータはクリアしない
- テスト環境として活用
- 本番データと混在しても問題なし（メタデータで区別）

### 3. 段階的移行

- Phase 0: 1 件テスト
- Phase 1: 10 件テスト
- Phase 2: 全件移行
- Phase 3: 並行稼働（1-2 週間）
- Phase 4: 完全移行

---

## 🔗 関連リンク

- [Stripe Dashboard](https://dashboard.stripe.com)
- [Supabase Dashboard](https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu)
- [プロジェクトルート](../../)

---

**最終更新**: 2025-11-19
**次回更新**: Phase 0 テスト完了後
