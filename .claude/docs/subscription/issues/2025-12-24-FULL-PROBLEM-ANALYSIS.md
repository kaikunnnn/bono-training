# サブスクリプション同期問題 - 全問題分析と対処計画

**作成日**: 2025-12-24
**ステータス**: 🔄 進行中（Phase 1, 2 完了）

---

## 📊 実行結果サマリー

### Phase 1: アクティブサブスクの同期 ✅ 完了（2025-12-24）

**実行結果**:
- 更新完了: 3件
- スキップ: 0件
- エラー: 0件

**対象ユーザー**:
- renrenkon.800@gmail.com ✅ 修正完了
- 他2件

### Phase 2: 期限切れユーザーの処理 ✅ 完了（2025-12-24）

**実行結果**:
- 非アクティブ化完了: 52件（キャンセル済み＆利用期間終了）
- current_period_end更新: 30件（Stripeでアクティブ）
- エラー: 0件

---

## 📊 現状データの全体像（修正前）

### Supabase user_subscriptions テーブル（live環境）

| 状態 | 件数 | 説明 |
|------|------|------|
| 🔴 inactive + sub_id なし | **1,785** | Stripe情報が同期されていない |
| ✅ active + sub_id あり | 250 | 正常に動作中 |
| ⚠️ inactive + sub_id あり | 2 | キャンセル処理済みまたは部分同期 |
| **合計** | **2,037** | |

### 期限（current_period_end）の状態

| 状態 | 件数 | 説明 |
|------|------|------|
| 期限未設定 | 1,785 | Stripe情報が同期されていない（問題1と同じ） |
| 期限内 | 171 | 正常 |
| 🔴 期限切れ but active | **81** | 無料でアクセス可能な状態 |
| **合計** | **2,037** | |

---

## 🔴 特定された全問題一覧

### 問題1: Stripe情報が同期されていないユーザー ✅ 解決済み

**症状**:
- `is_active: false`
- `stripe_subscription_id: null`

**対処**: Phase 1で修正（3件同期完了）

---

### 問題2: 期限切れなのに is_active=true ✅ 解決済み

**症状**:
- `is_active: true`
- `current_period_end` が過去の日付

**対処**: Phase 2で修正
- 52件: キャンセル済み → `is_active: false`
- 30件: Stripeでアクティブ → `current_period_end` 更新

---

### 問題3: DBトリガーのデフォルト値が不適切 ⏳ 未対応

**現状**:
```sql
plan_type: 'standard'  -- 無料ユーザーでも standard になる
is_active: false
```

**対処**: Phase 3で対応予定

---

### 問題4: 新規課金ユーザー（移行後）がSupabaseに存在しない ⏳ 未対応

**対象**: 約51件（maru.r2.09@gmail.com など）
- 移行実施日（2025-11-19）以降に課金開始したユーザー
- auth.users にレコードがない

**対処**: Phase 5で対応予定

---

## 📋 対処計画

### Phase 1: アクティブサブスクの同期 ✅ 完了

**スクリプト**: `scripts/fix-subscription-sync.ts`
**結果**: `scripts/results/fix-subscription-sync-result-*.json`

---

### Phase 2: 期限切れ・キャンセル済みの処理 ✅ 完了

**スクリプト**: `scripts/fix-expired-subscriptions.ts`
**結果**: `scripts/results/fix-expired-subscriptions-result-*.json`

---

### Phase 3: DBトリガーの修正 ⏳ 未実施

**目的**: 新規ユーザーに誤ったデフォルト値が設定されないようにする

**処理内容**:
```sql
-- 変更前
plan_type: 'standard'

-- 変更後
plan_type: NULL  -- または 'free'
```

**リスク**: 低（新規ユーザーにのみ影響）

---

### Phase 4: ユーザー確認 ⏳ 未実施

**目的**: renrenkon.800@gmail.com に修正完了を確認してもらう

---

### Phase 5: 新規課金ユーザーの移行 ✅ 完了（2025-12-24）

**目的**: 移行後（2025-11-19以降）に課金開始したユーザーをSupabaseに追加

**実行結果**:
- 作成完了: 50件
- スキップ（既存）: 201件
- エラー: 2件（テストアカウント、無視可）

**スクリプト**: `scripts/migrate-new-stripe-users.ts`
**結果ファイル**: `scripts/results/migrate-new-stripe-users-result-2025-12-24T09-43-13-228Z.json`

**注意**: 新規作成されたユーザーはパスワードリセットが必要
- https://bono.design/reset-password から案内

---

## 🛠 作成済みスクリプト

| スクリプト | 用途 | 状態 |
|-----------|------|------|
| `scripts/fix-subscription-sync.ts` | Phase 1: アクティブサブスク同期 | ✅ 完了 |
| `scripts/fix-expired-subscriptions.ts` | Phase 2: 期限切れ処理 | ✅ 完了 |

---

## 📝 次のアクション

1. [x] Phase 1 実行
2. [x] Phase 2 実行
3. [x] Phase 3: DBトリガー修正
4. [ ] Phase 4: renrenkon.800@gmail.com に確認依頼（依頼済み、回答待ち）
5. [x] Phase 5: 新規課金ユーザーの移行（50件完了）
6. [ ] 新規作成ユーザー50名へのパスワードリセット案内

---

## 更新履歴

| 日時 | 内容 |
|------|------|
| 2025-12-24 18:45 | Phase 5 完了（50件移行成功） |
| 2025-12-24 18:30 | Phase 3 完了（DBトリガー・NOT NULL制約修正） |
| 2025-12-24 18:00 | Phase 1, 2 完了。ステータス更新 |
| 2025-12-24 | 全問題分析と対処計画を作成 |
