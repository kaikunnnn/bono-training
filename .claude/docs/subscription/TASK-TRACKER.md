# サブスクリプション タスクトラッカー

**最終更新**: 2025-12-03
**ステータス**: 作業中

---

## ✅ 完了タスク（最新）

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

## 🔴 現在のタスク（優先順）

### Task 3: ISSUE-203 成功画面に期間を表示

**問題**: プラン変更成功画面で期間（1ヶ月/3ヶ月）が表示されない
**現状**: 「スタンダードプランへの変更が完了しました」
**期待**: 「スタンダードプラン（3ヶ月）への変更が完了しました」

| 項目 | 内容 |
|------|------|
| ステータス | 📋 未着手 |
| 優先度 | 🟡 高 |
| 難易度 | 簡単（1ファイル修正） |
| 修正ファイル | `src/pages/Subscription.tsx` (252行目) |

**修正内容**:
タイムアウト時の`navigate()`に`duration`パラメータを追加

---

### Task 3: ISSUE-204 /subscriptionでキャンセル状態を表示

**問題**: /subscriptionページでキャンセル状態が表示されない
**現状**: 「現在のプラン」（グレーバッジ）のみ
**期待**: 「現在のプラン【キャンセル済み】」（オレンジバッジ）

| 項目 | 内容 |
|------|------|
| ステータス | 📋 未着手 |
| 優先度 | 🟡 高 |
| 難易度 | 中（2ファイル修正） |
| 修正ファイル | `src/pages/Subscription.tsx`, `src/components/subscription/PlanCard.tsx` |

**修正内容**:
1. Subscription.tsx: `cancelAtPeriodEnd`をPlanCardに渡す
2. PlanCard.tsx: Propsに追加、バッジ色とテキストを変更

---

### Task 4: ISSUE-103 3ヶ月プランの金額表示を修正

**問題**: 3ヶ月プランの金額表示が誤解を招く
**現状**: 「17,400円/月（一括 52,200円）」
**期待**: 「5,800円/月（3ヶ月一括 17,400円）」

| 項目 | 内容 |
|------|------|
| ステータス | 📋 未着手 |
| 優先度 | 🟡 中 |
| 難易度 | 中（2ファイル修正） |
| 修正ファイル | `src/pages/Subscription.tsx`, `src/components/subscription/PlanCard.tsx` |

**修正内容**:
1. Subscription.tsx: priceLabel の構築ロジックを修正
2. PlanCard.tsx: 価格表示とサブテキストの計算を修正

---

## ✅ 完了タスク

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
