# サブスクリプション タスクトラッカー

**最終更新**: 2025-12-24
**ステータス**: アクティブ

---

## 🚀 リリース前タスク（必須）

現在、リリース前必須タスクはありません。

---

## ✅ 完了タスク（最新）

### Task 7: サブスクリプション同期問題の修正 ✅ 完了

**問題**: 複数のサブスクリプション同期問題が発生
**完了日**: 2025-12-24

**修正内容**:
1. ✅ Phase 1: 既存ユーザーのStripeサブスク同期（3件）
2. ✅ Phase 2: 期限切れユーザーの処理（82件）
3. ✅ Phase 3: DBトリガー修正（plan_type: NULL対応）
4. ✅ Phase 5: 新規課金ユーザー移行（50件）

**作成スクリプト**:
- `scripts/fix-subscription-sync.ts`
- `scripts/fix-expired-subscriptions.ts`
- `scripts/migrate-new-stripe-users.ts`

**詳細**: `.claude/docs/subscription/issues/2025-12-24-FULL-PROBLEM-ANALYSIS.md`

---

### Task: 差分ユーザー移行（Memberstack → Supabase） ✅ 完了

**完了日**: 2025-12-24（Task 7のPhase 5で対応）

**結果**:
- 50件の新規ユーザーを移行完了
- ログイン時に移行ユーザー判定機能（Task 6）でパスワードリセットを案内

---

### Task 6: 移行ユーザー判定機能 ✅ 完了

**問題**: 移行ユーザーがログイン失敗時に通常のエラーメッセージが表示され混乱する
**完了日**: 2025-12-06

**実装内容**:
1. ✅ Edge Function `check-migrated-user` を作成・デプロイ
   - RPC関数 `check_user_migration_status` を使用してauth.usersを直接クエリ
2. ✅ `src/pages/Auth.tsx` に移行ユーザー判定を追加
3. ✅ `src/pages/Training/Login.tsx` に移行ユーザー判定を追加
4. ✅ 移行ユーザーには専用メッセージ（パスワード再設定への誘導）を表示

**動作確認**:
- `denicro1104@gmail.com`（移行ユーザー）→ 専用メッセージ表示 ✅
- 新規ユーザー → 通常エラーメッセージ ✅

---

### Task 5: ISSUE-103 3ヶ月プランの金額表示を修正 ✅ 完了

**問題**: 3ヶ月プランの金額表示が誤解を招く
**完了日**: 2025-12-04

**修正内容**:
- `src/components/subscription/PlanCard.tsx`: 価格表示ロジックを修正
  - 3ヶ月プランの場合、月額換算（合計÷3）を表示
  - サブテキストを「3ヶ月一括 17,400円」形式に変更

**修正前**: 「17,400円/月（一括 52,200円）」
**修正後**: 「5,800円/月（3ヶ月一括 17,400円）」

---

### Task 4: ISSUE-204 /subscriptionでキャンセル状態を表示 ✅ 完了

**問題**: /subscriptionページでキャンセル状態が表示されない
**完了日**: 2025-12-04

**修正内容**:
1. ✅ `src/pages/Subscription.tsx`: `cancelAtPeriodEnd`を取得しPlanCardに渡す
2. ✅ `src/components/subscription/PlanCard.tsx`:
   - `isCanceled`プロパティを追加
   - キャンセル済みの場合はオレンジバッジ「現在のプラン【キャンセル済み】」を表示
   - ボーダー色もオレンジに変更

---

### Task 3: ISSUE-203 成功画面に期間を表示 ✅ 完了

**問題**: プラン変更成功画面で期間（1ヶ月/3ヶ月）が表示されない
**完了日**: 2025-12-04

**修正内容**:
1. ✅ `src/pages/Subscription.tsx` (252行目): タイムアウト時の`navigate()`に`duration`パラメータを追加
2. ✅ `src/components/subscription/SubscriptionSuccessContent.tsx`: 表示形式を「スタンダードプラン（3ヶ月）への変更が完了しました」に修正
3. ✅ `src/pages/SubscriptionSuccess.tsx`: `duration`をcontextから取得して渡すよう修正

---

### Task 2: ENV-004 MCP環境不一致対策 ✅ 完了

**問題**: MCPが常に本番環境を見ているのに、フロントエンドはローカル環境を見ていてデータ不整合が発生
**完了日**: 2025-12-03

**実装した対策**:
1. ✅ **npm scripts追加** (`package.json`)
   - `npm run mcp:disable` - MCPを無効化（開発時）
   - `npm run mcp:enable` - MCPを有効化（本番確認時）
   - `npm run mcp:status` - 現在の状態を表示

2. ✅ **切り替えスクリプト** (`scripts/mcp-toggle.js`)
   - `.cursor/mcp.json` ⇔ `.cursor/mcp.json.disabled` のリネーム

3. ✅ **CLAUDE.mdに運用ルール追加**
   - 開発時はMCP無効、本番確認時のみ有効

4. ✅ **開発開始時の警告** (`scripts/check-mcp-status.js`)
   - `npm run dev`実行時にMCPが有効なら警告表示

---

### Task 1: ENV-001 恒久対策 ✅ 完了

**問題**: 開発中に本番環境と開発環境の区別がつかない
**完了日**: 2025-12-03

**実装した対策**:
1. ✅ **CI/CDチェック** (`.github/workflows/ci.yml`)
   - `127.0.0.1:54321`、`localhost:54321`、`FORCED_LOCAL`パターンを検出
   - PR時に自動チェック、検出したらブロック

2. ✅ **本番ビルド時チェック** (`vite.config.ts`)
   - Vercel環境でビルド時に`VITE_SUPABASE_URL`をチェック
   - ローカルURLが含まれていたらビルド失敗

3. ✅ **開発時バナー** (`src/components/dev/DevEnvironmentBanner.tsx`)
   - `import.meta.env.DEV`が`true`の場合のみ表示
   - 画面左下に「🔧 DEV (local)」バナー
   - クリックで非表示

---

## ✅ 完了タスク（過去）

### 2025-12-02: サブスクリプション再構築プロジェクト

- ✅ Phase 0: 緊急現状精査
- ✅ Phase 1.5: 緊急修正
- ✅ Phase 1: 動作テスト
- ✅ Phase 2: 問題の修正
- ✅ Phase 3: 全体動作確認
- ✅ Phase 4: ドキュメント更新
- ✅ Phase 5: 本番デプロイ
- ✅ 本番環境検証（Phase A/B/C 全完了）

**詳細**: `redesign/MASTER-PLAN.md`

---

## 📝 Issue参照

未対応Issueの詳細は以下を参照:
- `user-experience/issues.md`

---

**更新者**: Claude Code
