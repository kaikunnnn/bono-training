# アクティブタスク一覧

**最終更新**: 2025-11-26
**目的**: 現在進行中のタスクを一元管理

---

## 📌 使い方

「今やるべきタスクは？」と聞かれたら、このファイルを確認してください。

---

## 🚨 Critical Issues (優先度: 最高)

### 1. サブスクリプション: plan_type 判定問題

**ステータス**: 🔍 調査中
**優先度**: 🔴 CRITICAL
**担当**: AI開発チーム
**詳細ドキュメント**: [.claude/docs/subscription/issues/plan-type-detection-issue.md](../docs/subscription/issues/plan-type-detection-issue.md)

**問題概要**:
- Feedbackプラン（4980円）が `plan_type: "standard"` として保存される
- 本来は `plan_type: "growth"` であるべき
- プレミアムコンテンツへのアクセスに影響

**次のアクション**:
- [ ] Webhook処理のコード調査（`stripe-webhook-test/index.ts`）
- [ ] Webhookログの確認（テストユーザーのサブスクリプション作成時）
- [ ] 修正実装
- [ ] 新規ユーザーでのテスト
- [ ] 既存ユーザーの一括修正スクリプト作成・実行
- [ ] Test 4 再実施（Feedbackプランでのキャンセル後アクセス確認）

**ブロック中のタスク**:
- サブスクリプション Test 4 完全再実施

---

## ⚠️ High Priority Tasks

### 2. データマイグレーション: 失敗ユーザー調査

**ステータス**: 📋 TODO
**優先度**: ⚠️ HIGH
**担当**: AI開発チーム
**作成日**: 2025-11-26

**問題概要**:
ユーザー作成マイグレーションで121名のユーザーが失敗。以下の3パターンに分類される:

1. **既存ユーザーエラー (87件)**: `A user with this email address has already been registered`
   - 実質的には問題なし
   - スクリプトの改善提案が必要

2. **Database error (6件)**: `Database error creating new user`
   - 🔴 **要調査**: データベース整合性の確認が必要
   - 対象ユーザー:
     - `373natsuki@gmail.com` (1度成功後にエラー)
     - `kyasya00000@gmail.com`
     - `kyasya000@gmail.com` (2回)
     - `ysdtkm@icloud.com`
     - `budouoic@gmail.com`
     - `amxxkey@gmail.com`

3. **HTML レスポンス (1件)**: `Unexpected token '<', "<html>..."`
   - `denicro1104@gmail.com`
   - 手動再試行が必要

4. **空のエラー (1件)**: `{}`
   - `pioko.apple@gmail.com`
   - 手動再試行が必要

**次のアクション**:
- [ ] Database error の6名のユーザーをデータベースで確認
- [ ] `373natsuki@gmail.com` の重複登録を調査
- [ ] `denicro1104@gmail.com` を手動で再試行
- [ ] `pioko.apple@gmail.com` を手動で再試行
- [ ] 既存ユーザーチェックのスクリプト改善提案を作成
- [ ] 調査結果をドキュメント化

**調査用SQLクエリ**:
```sql
-- Database error が発生したユーザーの確認
SELECT id, email, created_at, updated_at
FROM auth.users
WHERE email IN (
  '373natsuki@gmail.com',
  'kyasya00000@gmail.com',
  'kyasya000@gmail.com',
  'ysdtkm@icloud.com',
  'budouoic@gmail.com',
  'amxxkey@gmail.com'
)
ORDER BY email;
```

**関連ファイル**:
- エラーログ: `migration-errors-auth.json`
- マイグレーションスクリプト: （パスを要確認）

---

## ✅ 完了済みタスク（直近7日間）

### サブスクリプション: キャンセル後アクセス機能

**完了日**: 2025-11-26
**詳細**: [.claude/docs/subscription/issues/cancelled-subscription-access-issue.md](../docs/subscription/issues/cancelled-subscription-access-issue.md)

**実装内容**:
- ✅ `calculateAccessPermissions` 関数を修正
- ✅ `cancel_at_period_end: true` でも `current_period_end` までアクセス可能に変更
- ✅ check-subscription Edge Function をデプロイ済み

**残課題**:
- plan_type判定問題の解決待ち（タスク#1）

---

## 📅 Backlog（優先度順）

### サブスクリプション: Test 1-5 回帰テスト

**優先度**: 🟡 MEDIUM
**ブロック元**: タスク#1（plan_type判定問題）

**次のアクション**:
- plan_type問題解決後に全テスト再実施

---

### サブスクリプション: ドキュメント最終更新

**優先度**: 🟢 LOW
**ブロック元**: タスク#1（plan_type判定問題）

**次のアクション**:
- system-specification.md にキャンセル後アクセス仕様を追加
- user-flow-test.md の Test 4 結果を最終更新

---

## 🎯 今日やるべきこと

**優先順位**:
1. 🔴 **サブスクリプション: plan_type 判定問題**（タスク#1）
   - Webhook処理の調査から開始
2. ⚠️ **データマイグレーション: 失敗ユーザー調査**（タスク#2）
   - Database error 6名の確認

**判断基準**:
- plan_type問題が解決しないとサブスクリプションの完全テストができない
- データマイグレーション問題は並行作業可能

**推奨アプローチ**:
- plan_type問題の調査を進めつつ、待ち時間にマイグレーション問題を調査

---

## 📝 タスク管理ルール

### タスクの追加

新しいタスクが発生したら:
1. このファイルに追加
2. 優先度を設定（🔴 CRITICAL / ⚠️ HIGH / 🟡 MEDIUM / 🟢 LOW）
3. 詳細ドキュメントがある場合はリンクを追加

### タスクの完了

タスク完了時:
1. 「完了済みタスク」セクションに移動
2. 完了日を記録
3. 関連する詳細ドキュメントを更新

### 定期クリーンアップ

7日以上前に完了したタスクは削除してOK（詳細ドキュメントは残す）

---

**作成日**: 2025-11-26
**管理者**: AI開発チーム
**目的**: 「今やるべきタスクは？」という質問に即答できる仕組み
