# キャンセル後アクセス機能 - ステップバイステップ実装ガイド

**作成日**: 2025-11-26
**目的**: 間違いなく実装するための詳細手順書
**関連**: [cancelled-access-implementation-plan.md](./cancelled-access-implementation-plan.md)

---

## 🎯 このドキュメントの使い方

- ✅ 各ステップを**順番通り**に実施
- ✅ チェックボックスで進捗管理
- ✅ **1ステップ完了したら次のステップへ**
- ⚠️ エラーが出たら**すぐに停止**して原因調査

---

## Phase 1: 事前調査（実装前の最終確認）

### Step 1.1: Test 4実施時のWebhookログ確認

**目的**: キャンセル時にどのイベントが発火したか確認

#### 🔧 実施手順

```bash
# 1. Supabase Edge Functions Logsを取得
```

**MCP経由で実行**:
```typescript
mcp__supabase__get_logs({ service: "edge-function" })
```

**確認ポイント**:
```
□ customer.subscription.updated イベントが発火しているか
□ customer.subscription.deleted イベントが発火しているか
□ それぞれのタイムスタンプを確認
□ どのイベントで is_active が false になったか
```

**期待される結果**:
```
✅ customer.subscription.updated のみ発火（cancel_at_period_end: true）
❌ customer.subscription.deleted が即座に発火（これが原因）
```

**記録**:
```
発火したイベント:
1. _______________________
2. _______________________

is_active が false になったタイミング:
_______________________
```

---

### Step 1.2: 現在のデータベース状態確認

**目的**: Test 4のユーザーの現在の状態を確認

#### 🔧 実施手順

**SQL実行**:
```sql
-- Supabase SQL Editorで実行
SELECT
  user_id,
  plan_type,
  is_active,
  cancel_at_period_end,
  current_period_end,
  stripe_subscription_id,
  updated_at
FROM user_subscriptions
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

**確認ポイント**:
```
□ plan_type が正しく設定されているか
□ cancel_at_period_end が true か
□ current_period_end が未来の日付か
□ is_active の値を確認
```

**記録**:
```
plan_type: _____________
is_active: _____________
cancel_at_period_end: _____________
current_period_end: _____________
```

---

### Step 1.3: 現在のアクセス権限ロジックの動作確認

**目的**: calculateAccessPermissions の現在の動作を理解

#### 🔧 実施手順

**確認用SQL**:
```sql
-- アクセス権限をシミュレート
SELECT
  user_id,
  plan_type,
  is_active,
  cancel_at_period_end,
  current_period_end,
  CASE
    -- 現在のロジック
    WHEN is_active = true THEN 'ACCESS_GRANTED (現在のロジック)'
    WHEN is_active = false THEN 'ACCESS_DENIED (現在のロジック)'
    ELSE 'UNKNOWN'
  END AS current_logic,
  CASE
    -- 期待されるロジック
    WHEN is_active = true THEN 'ACCESS_GRANTED'
    WHEN cancel_at_period_end = true AND current_period_end > NOW() THEN 'ACCESS_GRANTED (期間内)'
    ELSE 'ACCESS_DENIED'
  END AS expected_logic
FROM user_subscriptions
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

**確認ポイント**:
```
□ current_logic と expected_logic が異なることを確認
□ 修正により expected_logic の動作になることを理解
```

**✅ Phase 1 完了チェック**:
```
□ Webhookログを確認した
□ データベース状態を確認した
□ 現在のロジックと期待されるロジックの差分を理解した
□ Phase 2 に進む準備ができた
```

---

## Phase 2: コード修正（慎重に進める）

### ⚠️ 修正前の準備

```bash
# 1. 現在のブランチを確認
git branch

# 2. feature/user_dashboard ブランチにいることを確認
# もし違うブランチにいたら:
# git checkout feature/user_dashboard

# 3. 修正前のファイルをバックアップ（任意）
cp supabase/functions/check-subscription/handlers.ts supabase/functions/check-subscription/handlers.ts.backup
```

---

### Step 2.1: calculateByPlanType ヘルパー関数を追加

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

**挿入位置**: Line 21の直後（`calculateAccessPermissions` の後）

#### 🔧 実施手順

**1. ファイルを開く**:
```bash
# Read ツールで確認
Read: /supabase/functions/check-subscription/handlers.ts
Lines: 9-25
```

**2. 以下のコードを Line 21 の直後に挿入**:

```typescript
/**
 * プランタイプに基づいてアクセス権限を計算
 * （ロジックを分離して再利用可能に）
 */
function calculateByPlanType(planType: string): {
  hasMemberAccess: boolean;
  hasLearningAccess: boolean;
} {
  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);

  return { hasMemberAccess, hasLearningAccess };
}
```

**3. 確認**:
```
□ 関数名が calculateByPlanType であること
□ 戻り値の型が正しく定義されていること
□ planType の配列が元のロジックと同じであること
```

---

### Step 2.2: calculateAccessPermissions の関数シグネチャを更新

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

**修正箇所**: Line 9-11

#### 🔧 実施手順

**BEFORE (Line 9-11)**:
```typescript
function calculateAccessPermissions(planType: string | null, isActive: boolean): { hasMemberAccess: boolean; hasLearningAccess: boolean } {
  if (!isActive || !planType) {
    return { hasMemberAccess: false, hasLearningAccess: false };
```

**AFTER**:
```typescript
function calculateAccessPermissions(
  planType: string | null,
  isActive: boolean,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: string | null
): {
  hasMemberAccess: boolean;
  hasLearningAccess: boolean;
} {
  // プランタイプがない場合はアクセス不可
  if (!planType) {
    return { hasMemberAccess: false, hasLearningAccess: false };
```

**変更点**:
```
□ パラメータに cancelAtPeriodEnd を追加
□ パラメータに currentPeriodEnd を追加
□ 戻り値の型定義を複数行に分割（読みやすさ向上）
□ コメント「プランタイプがない場合はアクセス不可」を追加
□ 条件を「!planType」のみに変更（isActive のチェックを削除）
```

---

### Step 2.3: アクティブ会員の判定ロジックを追加

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

**修正箇所**: Line 13-20（元の内容を置き換え）

#### 🔧 実施手順

**BEFORE (Line 13-20)**:
```typescript
  }

  // メンバーアクセス: すべての有料プラン
  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);

  // 学習アクセス: standard, growth, feedback
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);

  return { hasMemberAccess, hasLearningAccess };
}
```

**AFTER**:
```typescript
  }

  // ケース1: アクティブな会員
  if (isActive) {
    return calculateByPlanType(planType);
  }

  // 後続のロジックに続く（次のステップで追加）
}
```

**変更点**:
```
□ 「ケース1: アクティブな会員」コメントを追加
□ isActive === true の場合は calculateByPlanType を呼び出し
□ 元の hasMemberAccess / hasLearningAccess の直接計算を削除
```

---

### Step 2.4: キャンセル済み期間内判定ロジックを追加

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

**挿入位置**: Step 2.3 で追加した「後続のロジックに続く」コメントの場所

#### 🔧 実施手順

**追加するコード**:
```typescript
  // ケース2: キャンセル済みだが期間内
  if (cancelAtPeriodEnd && currentPeriodEnd) {
    const periodEnd = new Date(currentPeriodEnd);
    const now = new Date();

    if (periodEnd > now) {
      // 期間内はアクセス可能
      return calculateByPlanType(planType);
    }
  }

  // ケース3: それ以外（期間終了、未登録など）
  return { hasMemberAccess: false, hasLearningAccess: false };
}
```

**確認ポイント**:
```
□ cancelAtPeriodEnd && currentPeriodEnd の両方をチェック
□ new Date() で日付オブジェクトを作成
□ periodEnd > now で期間内を判定
□ 期間内なら calculateByPlanType を呼び出し
□ それ以外は false を返す
□ 関数の閉じ括弧 } があること
```

**✅ calculateAccessPermissions 修正完了チェック**:
```
□ 関数シグネチャに4つのパラメータがある
□ ケース1（アクティブ会員）のロジックがある
□ ケース2（キャンセル済み期間内）のロジックがある
□ ケース3（それ以外）のロジックがある
□ calculateByPlanType を呼び出している
```

---

### Step 2.5: handleAuthenticatedRequest の呼び出し部分を修正

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

**修正箇所**: Line 94-95（元の位置から変わっている可能性あり）

#### 🔧 実施手順

**1. 修正箇所を探す**:
```typescript
// この行を探す:
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(planType, isSubscribed);
```

**2. BEFORE**:
```typescript
// アクセス権限を計算
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(planType, isSubscribed);
```

**3. AFTER**:
```typescript
// アクセス権限を計算
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(
  planType,
  isSubscribed,
  cancelAtPeriodEnd,
  currentPeriodEnd
);
```

**確認ポイント**:
```
□ パラメータが4つになっている
□ 3番目のパラメータが cancelAtPeriodEnd
□ 4番目のパラメータが currentPeriodEnd
□ これらの変数が既に定義されていることを確認（Line 85-87付近）
```

---

### Step 2.6: handleStripeSubscriptionCheck の3箇所を修正

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

**修正箇所**: Line 156, 177, 201（元の位置から変わっている可能性あり）

#### 🔧 実施手順 - 修正箇所1

**検索**: `calculateAccessPermissions("standard", true);`（1つ目）

**BEFORE (Line 156付近)**:
```typescript
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions("standard", true);
```

**AFTER**:
```typescript
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(
  "standard",
  true,
  false,  // cancelAtPeriodEnd
  null    // currentPeriodEnd
);
```

**確認**: `□ 完了`

---

#### 🔧 実施手順 - 修正箇所2

**検索**: `calculateAccessPermissions(response.planType, response.subscribed);`

**BEFORE (Line 177付近)**:
```typescript
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(response.planType, response.subscribed);
```

**AFTER**:
```typescript
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(
  response.planType,
  response.subscribed,
  false,  // cancelAtPeriodEnd (Stripeから取得する場合は要確認)
  null    // currentPeriodEnd (Stripeから取得する場合は要確認)
);
```

**確認**: `□ 完了`

---

#### 🔧 実施手順 - 修正箇所3

**検索**: `calculateAccessPermissions("standard", true);`（2つ目）

**BEFORE (Line 201付近)**:
```typescript
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions("standard", true);
```

**AFTER**:
```typescript
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(
  "standard",
  true,
  false,  // cancelAtPeriodEnd
  null    // currentPeriodEnd
);
```

**確認**: `□ 完了`

---

### ✅ Phase 2 完了チェック

**修正内容の最終確認**:
```
□ calculateByPlanType ヘルパー関数を追加した
□ calculateAccessPermissions の関数シグネチャを更新した
□ ケース1（アクティブ会員）のロジックを追加した
□ ケース2（キャンセル済み期間内）のロジックを追加した
□ ケース3（それ以外）のロジックを追加した
□ handleAuthenticatedRequest の呼び出しを修正した
□ handleStripeSubscriptionCheck の3箇所を修正した
```

**構文チェック**:
```bash
# TypeScriptの構文チェック
npx tsc --noEmit supabase/functions/check-subscription/handlers.ts
```

**エラーが出た場合**:
```
□ エラーメッセージを確認
□ 修正箇所を再確認
□ 必要に応じて元に戻す（.backup ファイルから復元）
```

---

## Phase 3: デプロイとテスト

### Step 3.1: Edge Function をデプロイ

#### 🔧 実施手順

**1. デプロイ前の確認**:
```bash
# 現在の check-subscription フォルダの状態確認
ls -la supabase/functions/check-subscription/

# 期待されるファイル:
# - index.ts
# - handlers.ts (修正済み)
# - utils.ts
# - types.ts
# - subscription-service/
```

**2. デプロイ実行**:
```bash
supabase functions deploy check-subscription
```

**3. デプロイ結果確認**:
```
□ デプロイが成功した（エラーが出ていない）
□ デプロイ完了のメッセージが表示された
□ URLが表示された: https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/check-subscription
```

**エラーが出た場合**:
```
❌ デプロイ失敗 → エラーメッセージを確認
□ 構文エラー → handlers.ts を再確認
□ 環境変数エラー → Supabase Secrets を確認
□ その他 → ログを詳細確認
```

---

### Step 3.2: Test 4のユーザーでアクセス確認（期間内）

**目的**: キャンセル済みだが期間内のユーザーがアクセスできることを確認

#### 🔧 実施手順

**1. フロントエンドからログイン**:
```
□ Test 4 のユーザーでログイン
  Email: _________________
  Password: _________________
```

**2. プレミアムコンテンツにアクセス**:
```
□ メンバー限定のレッスンにアクセス
□ プレミアム動画にアクセス
□ ロック画面が表示されないことを確認
□ 動画が再生できることを確認
```

**3. check-subscription レスポンス確認**:
```bash
# ブラウザのDevToolsで確認
# Network タブ → check-subscription のレスポンス
```

**期待されるレスポンス**:
```json
{
  "subscribed": true,  // または false
  "planType": "feedback",
  "isSubscribed": true,  // または false
  "hasMemberAccess": true,  // ← ★これが true であること
  "hasLearningAccess": true, // ← ★これが true であること
  "cancelAtPeriodEnd": true,
  "renewalDate": "2025-12-26T00:00:00.000Z"
}
```

**確認ポイント**:
```
□ hasMemberAccess が true
□ hasLearningAccess が true
□ cancelAtPeriodEnd が true
□ プレミアムコンテンツにアクセスできる
```

---

### Step 3.3: エッジケーステスト

#### テストケース1: 期間終了直前

**目的**: 期間終了1分前でもアクセス可能であることを確認

**実施手順**:

**1. データベースの `current_period_end` を一時的に変更**:
```sql
-- 1分後に期間終了するように設定
UPDATE user_subscriptions
SET current_period_end = NOW() + INTERVAL '1 minute'
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

**2. フロントエンドでアクセス確認**:
```
□ プレミアムコンテンツにアクセス可能
□ hasMemberAccess が true
```

**3. 元に戻す**:
```sql
UPDATE user_subscriptions
SET current_period_end = '2025-12-26 07:26:59+00'
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

---

#### テストケース2: 期間終了直後

**目的**: 期間終了1分後はアクセス不可であることを確認

**実施手順**:

**1. データベースの `current_period_end` を一時的に変更**:
```sql
-- 1分前に期間終了したように設定
UPDATE user_subscriptions
SET current_period_end = NOW() - INTERVAL '1 minute'
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

**2. フロントエンドでアクセス確認**:
```
□ プレミアムコンテンツにアクセス不可
□ ロック画面が表示される
□ hasMemberAccess が false
```

**3. 元に戻す**:
```sql
UPDATE user_subscriptions
SET current_period_end = '2025-12-26 07:26:59+00'
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

---

### Step 3.4: 回帰テスト（既存機能が壊れていないか確認）

**目的**: Test 1-5 すべてが引き続き正常動作することを確認

#### 🔧 実施手順

**Test 1: 新規登録**:
```
□ 新規ユーザーでサブスクリプション登録
□ プレミアムコンテンツにアクセス可能
□ hasMemberAccess が true
```

**Test 2A: ダウングレード**:
```
□ プラン変更（Feedback 3M → Standard 1M）
□ プレミアムコンテンツにアクセス可能
□ hasMemberAccess が true
□ planType が "standard" に変更
```

**Test 2B: アップグレード**:
```
□ プラン変更（Standard 1M → Feedback 1M）
□ プレミアムコンテンツにアクセス可能
□ hasMemberAccess が true
□ planType が "feedback" に変更
```

**Test 3A: 期間延長**:
```
□ 期間変更（1M → 3M）
□ プレミアムコンテンツにアクセス可能
□ duration が 3 に変更
```

**Test 3B: 期間短縮**:
```
□ 期間変更（3M → 1M）
□ プレミアムコンテンツにアクセス可能
□ duration が 1 に変更
```

**Test 4: キャンセル（修正対象）**:
```
□ サブスクリプションをキャンセル
□ キャンセル直後もプレミアムコンテンツにアクセス可能 ← ★修正後の動作
□ hasMemberAccess が true ← ★修正後の動作
□ cancelAtPeriodEnd が true
□ 期間終了後はアクセス不可
```

**Test 5: 二重課金防止**:
```
□ 新しいサブスクリプション作成
□ 古いサブスクリプションが非アクティブ化
□ 新しいサブスクリプションのみアクティブ
```

**すべてのテスト通過**:
```
□ Test 1 通過
□ Test 2A 通過
□ Test 2B 通過
□ Test 3A 通過
□ Test 3B 通過
□ Test 4 通過（修正後の動作）
□ Test 5 通過
```

---

### ✅ Phase 3 完了チェック

```
□ Edge Function を正常にデプロイした
□ Test 4 のユーザーでアクセス確認した（期間内）
□ エッジケーステストを実施した（期間終了直前・直後）
□ 回帰テスト（Test 1-5）をすべて実施した
□ すべてのテストが通過した
```

---

## Phase 4: ドキュメント更新

### Step 4.1: system-specification.md にキャンセル後アクセス仕様を追加

**ファイル**: `.claude/docs/subscription/specifications/system-specification.md`

**追加箇所**: 適切なセクション（例: 「実装済み機能」の後）

#### 🔧 実施手順

**追加するセクション**:

```markdown
### キャンセル後のアクセス制御

#### 動作仕様

サブスクリプションをキャンセルした場合:

1. **期間内アクセス**:
   - `cancel_at_period_end = true` の場合
   - `current_period_end` (契約期間終了日) までプレミアムコンテンツにアクセス可能
   - UI上「キャンセル済み」と表示されるが、コンテンツは閲覧可能

2. **期間終了後**:
   - `current_period_end` を過ぎた時点でアクセス不可
   - ロック画面が表示される

#### 技術実装

**Edge Function**: `check-subscription`

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

```typescript
function calculateAccessPermissions(
  planType: string | null,
  isActive: boolean,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: string | null
) {
  // プランタイプがない場合はアクセス不可
  if (!planType) {
    return { hasMemberAccess: false, hasLearningAccess: false };
  }

  // ケース1: アクティブな会員
  if (isActive) {
    return calculateByPlanType(planType);
  }

  // ケース2: キャンセル済みでも期間内ならアクセス可能
  if (cancelAtPeriodEnd && currentPeriodEnd) {
    const periodEnd = new Date(currentPeriodEnd);
    const now = new Date();

    if (periodEnd > now) {
      return calculateByPlanType(planType);  // 期間内はアクセス可能
    }
  }

  // ケース3: それ以外はアクセス不可
  return { hasMemberAccess: false, hasLearningAccess: false };
}
```

**データベース**:
- `cancel_at_period_end`: キャンセル予定フラグ
- `current_period_end`: 契約期間終了日（アクセス可能期限）

**実装日**: 2025-11-26
```

**確認**:
```
□ セクションを追加した
□ コードブロックが正しく表示される
□ 実装日を記載した
```

---

### Step 4.2: user-flow-test.md の Test 4 結果を更新

**ファイル**: `.claude/docs/subscription/testing/user-flow-test.md`

**修正箇所**: Test 4 のセクション

#### 🔧 実施手順

**1. Test 4 の「テスト結果」セクションを探す**

**2. 以下のように更新**:

**BEFORE**:
```markdown
- [×] コンテンツにはキャンセル日まで引き続きアクセス可能
  - → このブランチでレッスンのメンバー限定表示がきちんと実装されているか把握してないが、有料コンテンツは見れない状態でした。
  - 他のプランに登録し直してみると、メンバー限定のロックが外れているのでこの部分は実装されてないことが判明しました。
```

**AFTER**:
```markdown
- [✅] コンテンツにはキャンセル日まで引き続きアクセス可能
  - → **修正完了**: 2025-11-26 にキャンセル後アクセス機能を実装
  - `current_period_end` までプレミアムコンテンツにアクセス可能
  - 期間終了後は正しくロック画面が表示される
  - 実装詳細: [cancelled-access-implementation-plan.md](../../plans/cancelled-access-implementation-plan.md)
```

**3. Edge Functions Logs セクションを更新**:

**追加**:
```markdown
#### 修正後のレスポンス (2025-11-26)

```json
{
  "subscribed": true,
  "planType": "feedback",
  "isSubscribed": true,
  "hasMemberAccess": true,  // ← キャンセル後もアクセス可能
  "hasLearningAccess": true,
  "cancelAtPeriodEnd": true,
  "renewalDate": "2025-12-26T00:00:00.000Z"
}
```
```

**4. テスト日時を更新**:
```markdown
**テスト実施日**: 2025-11-26 (初回), 2025-11-26 (修正後再テスト)
```

**確認**:
```
□ Test 4 の結果を「✅」に変更した
□ 修正完了の記載を追加した
□ 修正後のレスポンスを追加した
□ テスト日時を更新した
```

---

### ✅ Phase 4 完了チェック

```
□ system-specification.md にキャンセル後アクセス仕様を追加した
□ user-flow-test.md の Test 4 結果を更新した
□ ドキュメントの整合性を確認した
```

---

## 🎉 全Phase完了チェック

```
□ Phase 1: 事前調査完了
□ Phase 2: コード修正完了
□ Phase 3: デプロイ・テスト完了
□ Phase 4: ドキュメント更新完了
```

**最終確認**:
```
□ キャンセル後も current_period_end までアクセス可能
□ current_period_end 以降はアクセス不可
□ 既存のアクティブユーザーに影響なし
□ Test 1-5 すべて通過
□ ドキュメント更新完了
```

---

## 🚨 トラブルシューティング

### エラー発生時の対処法

#### デプロイエラー

**症状**: `supabase functions deploy` でエラー

**対処**:
```bash
# 1. 構文チェック
npx tsc --noEmit supabase/functions/check-subscription/handlers.ts

# 2. エラーメッセージを確認
# 3. handlers.ts を再確認
# 4. 必要に応じてバックアップから復元
cp supabase/functions/check-subscription/handlers.ts.backup supabase/functions/check-subscription/handlers.ts
```

---

#### アクセスできない

**症状**: 修正後もプレミアムコンテンツにアクセスできない

**対処**:
```
1. check-subscription のレスポンスを確認
   - hasMemberAccess が false の場合 → ロジックエラー
   - hasMemberAccess が true の場合 → フロントエンドの問題

2. データベースの状態を確認
   - cancel_at_period_end が true か
   - current_period_end が未来の日付か

3. Edge Functions Logs を確認
   - エラーが出ていないか
```

---

#### 既存ユーザーに影響

**症状**: Test 1-5 のいずれかが失敗

**対処**:
```
1. 失敗したテストを特定
2. check-subscription のレスポンスを確認
3. calculateAccessPermissions のロジックを再確認
4. 必要に応じて修正をロールバック
```

---

**作成者**: AI開発チーム
**最終更新**: 2025-11-26
**目的**: 間違いなく実装するための詳細ガイド
