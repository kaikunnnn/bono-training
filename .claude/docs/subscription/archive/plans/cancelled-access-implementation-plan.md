# キャンセル後アクセス機能 - 実装計画書

**作成日**: 2025-11-26
**ステータス**: 📝 計画中
**優先度**: 🚨 CRITICAL
**関連Issue**: [cancelled-subscription-access-issue.md](../issues/cancelled-subscription-access-issue.md)

---

## 🎯 実装目標

サブスクリプションをキャンセルした後も、`current_period_end` (契約期間終了日) までプレミアムコンテンツにアクセス可能にする。

---

## 📋 実装の前提条件

### 既存システムを壊さないための確認事項

1. ✅ 現在アクティブなユーザーのアクセスは引き続き正常動作
2. ✅ 新規登録ユーザーのアクセスは引き続き正常動作
3. ✅ プラン変更ユーザーのアクセスは引き続き正常動作
4. ✅ 期間終了後のユーザーは正しくアクセス拒否される

### データベースの現状

`user_subscriptions` テーブルに既に必要なカラムが存在:

```sql
-- 既存カラム（変更不要）
cancel_at_period_end BOOLEAN,     -- キャンセル予定フラグ
cancel_at TIMESTAMP,               -- キャンセル予定日時
current_period_end TIMESTAMP,     -- 現在の契約期間終了日
is_active BOOLEAN,                 -- サブスクリプション有効フラグ
plan_type VARCHAR(50)              -- プランタイプ
```

**重要**: データベーススキーマの変更は不要

---

## 🛠️ 実装手順

### Phase 1: 事前調査 (実装前の確認)

#### 1.1 Webhookログの確認

**目的**: Test 4実施時のWebhookイベント発火順序を確認

**確認内容**:
```bash
# Test 4 (キャンセル) 実施時のWebhookログを取得
# タイムスタンプ: 2025-11-26 前後

期待されるイベント順序:
1. customer.subscription.updated (cancel_at_period_end: true)
2. customer.subscription.deleted (期間終了後のみ)

実際のイベント順序を確認:
- キャンセル直後に customer.subscription.deleted が発火していないか？
- customer.subscription.updated で正しく cancel_at_period_end が設定されているか？
```

**確認コマンド** (MCP経由):
```typescript
mcp__supabase__get_logs({ service: "edge-function" })
// 2025-11-26 のログを確認
// "customer.subscription" を含むログをフィルタ
```

#### 1.2 現在の実装の動作確認

**テストケース**:

| ケース | is_active | cancel_at_period_end | current_period_end | 期待されるアクセス | 現在の動作 |
|--------|-----------|---------------------|-------------------|------------------|-----------|
| アクティブ会員 | true | false | 2026-01-26 | ✅ 可能 | ✅ 可能 |
| キャンセル済み(期間内) | true | true | 2025-12-26 | ✅ 可能 | ❓ 確認必要 |
| キャンセル済み(期間外) | false | true | 2025-11-25 | ❌ 不可 | ❌ 不可 |
| 期間終了 | false | false | 2025-11-25 | ❌ 不可 | ❌ 不可 |

**確認SQL**:
```sql
-- キャンセル済みユーザーのアクセス権限をシミュレート
SELECT
  user_id,
  plan_type,
  is_active,
  cancel_at_period_end,
  current_period_end,
  CASE
    WHEN is_active = true THEN 'ACTIVE'
    WHEN cancel_at_period_end = true AND current_period_end > NOW() THEN 'CANCELLED_BUT_VALID'
    ELSE 'EXPIRED'
  END AS access_status
FROM user_subscriptions
WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';
```

---

### Phase 2: コード修正 (慎重に進める)

#### 2.1 calculateAccessPermissions 関数の修正

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

**変更内容**:

**BEFORE (Line 9-21)**:
```typescript
function calculateAccessPermissions(planType: string | null, isActive: boolean): {
  hasMemberAccess: boolean;
  hasLearningAccess: boolean
} {
  if (!isActive || !planType) {
    return { hasMemberAccess: false, hasLearningAccess: false };
  }

  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);

  return { hasMemberAccess, hasLearningAccess };
}
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
  hasLearningAccess: boolean
} {
  // プランタイプがない場合はアクセス不可
  if (!planType) {
    return { hasMemberAccess: false, hasLearningAccess: false };
  }

  // ケース1: アクティブな会員
  if (isActive) {
    return calculateByPlanType(planType);
  }

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

/**
 * プランタイプに基づいてアクセス権限を計算
 * （ロジックを分離して再利用可能に）
 */
function calculateByPlanType(planType: string): {
  hasMemberAccess: boolean;
  hasLearningAccess: boolean
} {
  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);

  return { hasMemberAccess, hasLearningAccess };
}
```

**変更点**:
1. 関数シグネチャに `cancelAtPeriodEnd` と `currentPeriodEnd` を追加
2. `calculateByPlanType` ヘルパー関数を抽出（DRY原則）
3. キャンセル済みでも期間内ならアクセス可能なロジックを追加

#### 2.2 handleAuthenticatedRequest 関数の修正

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

**変更箇所**: Line 94-95

**BEFORE**:
```typescript
// アクセス権限を計算
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(planType, isSubscribed);
```

**AFTER**:
```typescript
// アクセス権限を計算
const { hasMemberAccess, hasLearningAccess } = calculateAccessPermissions(
  planType,
  isSubscribed,
  cancelAtPeriodEnd,
  currentPeriodEnd
);
```

**変更点**:
- `calculateAccessPermissions` 呼び出しに `cancelAtPeriodEnd` と `currentPeriodEnd` を追加

#### 2.3 handleStripeSubscriptionCheck 関数の修正

**ファイル**: `/supabase/functions/check-subscription/handlers.ts`

**変更箇所**: Line 156, 177, 201

**BEFORE (Line 156)**:
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

**BEFORE (Line 177)**:
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

**BEFORE (Line 201)**:
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

**注意点**:
- Stripe APIからサブスクリプション情報を取得する場合、`cancel_at_period_end` と `current_period_end` も取得する必要がある
- `processStripeSubscription` 関数の修正も検討

---

### Phase 3: テスト (段階的に実施)

#### 3.1 ユニットテスト (手動確認)

**calculateAccessPermissions 関数のテストケース**:

```typescript
// テストケース1: アクティブ会員
calculateAccessPermissions('standard', true, false, null)
// 期待: { hasMemberAccess: true, hasLearningAccess: true }

// テストケース2: キャンセル済み（期間内）
calculateAccessPermissions('standard', false, true, '2025-12-26T00:00:00Z')
// 期待: { hasMemberAccess: true, hasLearningAccess: true }

// テストケース3: キャンセル済み（期間外）
calculateAccessPermissions('standard', false, true, '2025-11-25T00:00:00Z')
// 期待: { hasMemberAccess: false, hasLearningAccess: false }

// テストケース4: 未登録
calculateAccessPermissions(null, false, false, null)
// 期待: { hasMemberAccess: false, hasLearningAccess: false }

// テストケース5: planType なし
calculateAccessPermissions(null, true, false, '2025-12-26T00:00:00Z')
// 期待: { hasMemberAccess: false, hasLearningAccess: false }
```

#### 3.2 統合テスト (Edge Function 経由)

**テスト手順**:

1. **準備**: Test 4のユーザーアカウントを使用
   - `user_id`: `e118477b-9d42-4d5c-80b9-ad66f73b6b02`
   - キャンセル済み: `cancel_at_period_end: true`
   - 期間終了日: `current_period_end: 2025-12-26`

2. **Edge Function デプロイ**:
   ```bash
   supabase functions deploy check-subscription
   ```

3. **アクセス確認**:
   ```bash
   # check-subscription を呼び出し
   curl -X GET https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/check-subscription \
     -H "Authorization: Bearer <JWT_TOKEN>"

   # 期待されるレスポンス:
   {
     "subscribed": true,  // または false
     "planType": "feedback",
     "isSubscribed": true,  // または false
     "hasMemberAccess": true,  ← ★ これが true であること
     "hasLearningAccess": true, ← ★ これが true であること
     "cancelAtPeriodEnd": true,
     "renewalDate": "2025-12-26T00:00:00.000Z"
   }
   ```

4. **フロントエンドでアクセス確認**:
   - プレミアムコンテンツページにアクセス
   - ビデオが再生可能であることを確認
   - ロック画面が表示されないことを確認

#### 3.3 エッジケーステスト

| テストケース | 設定 | 期待される動作 |
|------------|------|---------------|
| **期間終了直前** | `current_period_end: NOW() + 1分` | ✅ アクセス可能 |
| **期間終了直後** | `current_period_end: NOW() - 1分` | ❌ アクセス不可 |
| **再登録後** | 新しいサブスクリプション作成 | ✅ アクセス可能 |
| **アクティブ会員** | `is_active: true, cancel_at_period_end: false` | ✅ アクセス可能 |
| **期間終了済み** | `is_active: false, current_period_end: 過去` | ❌ アクセス不可 |

#### 3.4 既存機能の回帰テスト

**確認項目**:

1. ✅ Test 1 (新規登録) - プレミアムコンテンツアクセス可能
2. ✅ Test 2A (ダウングレード) - プレミアムコンテンツアクセス可能
3. ✅ Test 2B (アップグレード) - プレミアムコンテンツアクセス可能
4. ✅ Test 3A (期間延長) - プレミアムコンテンツアクセス可能
5. ✅ Test 3B (期間短縮) - プレミアムコンテンツアクセス可能
6. ✅ Test 4 (キャンセル) - **期間内アクセス可能** ← 修正対象
7. ✅ Test 5 (二重課金防止) - 最新サブスクリプションのみアクセス可能

---

### Phase 4: ドキュメント更新

#### 4.1 仕様書の更新

**ファイル**: `subscription/specifications/system-specification.md`

**追加セクション**:

```markdown
### キャンセル後のアクセス制御

#### 動作仕様

サブスクリプションをキャンセルした場合:

1. **期間内アクセス**:
   - `cancel_at_period_end = true` の場合
   - `current_period_end` までプレミアムコンテンツにアクセス可能
   - UI上「キャンセル済み」と表示されるが、コンテンツは閲覧可能

2. **期間終了後**:
   - `current_period_end` を過ぎた時点でアクセス不可
   - ロック画面が表示される

#### 技術実装

**Edge Function**: `check-subscription`

```typescript
function calculateAccessPermissions(
  planType: string | null,
  isActive: boolean,
  cancelAtPeriodEnd: boolean,
  currentPeriodEnd: string | null
) {
  // キャンセル済みでも期間内ならアクセス可能
  if (cancelAtPeriodEnd && currentPeriodEnd) {
    const periodEnd = new Date(currentPeriodEnd);
    const now = new Date();

    if (periodEnd > now) {
      return calculateByPlanType(planType);
    }
  }
  // ...
}
```

**データベース**:
- `cancel_at_period_end`: キャンセル予定フラグ
- `current_period_end`: 契約期間終了日（アクセス可能期限）
```

#### 4.2 テスト結果の更新

**ファイル**: `subscription/testing/user-flow-test.md`

**Test 4 の結果を更新**:

```markdown
### Test 4: キャンセル

#### テスト結果

- [✅] サブスクリプションのキャンセル成功
- [✅] `cancel_at_period_end` フラグが `true` に設定
- [✅] **コンテンツにはキャンセル日まで引き続きアクセス可能** ← 修正後
- [✅] `/account` ページに「キャンセル済み」表示
- [✅] Customer Portal に「キャンセル済み」表示

#### Edge Functions Logs

```
POST | 200 | check-subscription
Response: {
  "hasMemberAccess": true,  ← キャンセル後もアクセス可能
  "hasLearningAccess": true,
  "cancelAtPeriodEnd": true,
  "renewalDate": "2025-12-26T00:00:00.000Z"
}
```

#### データベース確認

```sql
SELECT * FROM user_subscriptions WHERE user_id = 'e118477b-9d42-4d5c-80b9-ad66f73b6b02';

| plan_type | is_active | cancel_at_period_end | current_period_end |
|-----------|-----------|---------------------|-------------------|
| feedback  | false     | true                | 2025-12-26        |
```

#### プレミアムコンテンツアクセステスト

- ✅ ビデオ再生可能
- ✅ ロック画面非表示
- ✅ 2025-12-26 まではアクセス可能
- ✅ 2025-12-27 以降はアクセス不可
```

---

## ⚠️ リスクと対策

### リスク1: 既存のアクティブユーザーへの影響

**リスク**:
- 修正により、アクティブユーザーのアクセスが不正に制限される可能性

**対策**:
1. Phase 3.4 で回帰テストを必ず実施
2. `is_active = true` の場合は従来通り無条件でアクセス許可
3. `cancel_at_period_end` のチェックは `is_active = false` の場合のみ

### リスク2: Webhookの処理順序

**リスク**:
- `customer.subscription.deleted` が予期せず即座に発火し、`is_active` が `false` になる

**対策**:
1. Phase 1.1 でWebhookログを必ず確認
2. 必要に応じて `handleSubscriptionDeleted` の修正を実施

### リスク3: タイムゾーンの問題

**リスク**:
- `currentPeriodEnd` と `NOW()` の比較でタイムゾーン差異が発生

**対策**:
1. すべての日時を UTC で統一
2. `new Date()` は UTC を使用（JavaScriptのデフォルト）
3. データベースの `current_period_end` も UTC で保存

### リスク4: Edge Function のデプロイ失敗

**リスク**:
- 修正したEdge Functionがデプロイに失敗し、サービスが停止

**対策**:
1. ローカル環境で事前にテスト
2. デプロイ前にバックアップを取得
3. デプロイ後すぐに動作確認

---

## 📅 実装スケジュール

| Phase | タスク | 所要時間 | 担当 |
|-------|--------|---------|-----|
| **Phase 1** | 事前調査 | 30分 | AI |
| 1.1 | Webhookログ確認 | 15分 | AI |
| 1.2 | 現在の実装動作確認 | 15分 | AI |
| **Phase 2** | コード修正 | 1時間 | AI |
| 2.1 | `calculateAccessPermissions` 修正 | 30分 | AI |
| 2.2 | `handleAuthenticatedRequest` 修正 | 15分 | AI |
| 2.3 | `handleStripeSubscriptionCheck` 修正 | 15分 | AI |
| **Phase 3** | テスト | 1.5時間 | AI + User |
| 3.1 | ユニットテスト | 30分 | AI |
| 3.2 | 統合テスト | 30分 | AI |
| 3.3 | エッジケーステスト | 15分 | AI |
| 3.4 | 回帰テスト | 15分 | User |
| **Phase 4** | ドキュメント更新 | 30分 | AI |
| 4.1 | 仕様書更新 | 15分 | AI |
| 4.2 | テスト結果更新 | 15分 | AI |

**合計所要時間**: 約3.5時間

---

## ✅ 完了条件

1. ✅ キャンセル後も `current_period_end` までプレミアムコンテンツアクセス可能
2. ✅ `current_period_end` 以降はアクセス不可
3. ✅ 既存のアクティブユーザーに影響なし
4. ✅ Test 1-5 の回帰テストすべて成功
5. ✅ ドキュメント更新完了

---

## 🔗 関連ドキュメント

- [cancelled-subscription-access-issue.md](../issues/cancelled-subscription-access-issue.md) - 問題の詳細分析
- [system-specification.md](../specifications/system-specification.md) - サブスクリプションシステム仕様
- [user-flow-test.md](../testing/user-flow-test.md) - ユーザーフローテスト結果

---

**作成者**: AI開発チーム
**最終更新**: 2025-11-26
**次のアクション**: Phase 1 開始 - Webhookログ確認
