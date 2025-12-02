# 実装ログ - Webhook 401修正 & 二重課金防止

**実装日**: 2025-11-29
**目的**: Webhook 401エラー解消 + 二重課金防止 + プラン変更フロー実装

---

## ⚠️ 重要: デプロイ前の確認事項

### 🔴 **必須**: マイグレーション実行
```bash
npx supabase db push
```
**webhook_eventsテーブルが作成されていないと、全てのWebhookが失敗します**

### 🔴 **必須**: config.toml反映
Supabaseプロジェクトの設定に`verify_jwt = false`が反映されているか確認

---

## 📝 変更ファイル一覧

### Phase 1: Webhook 401エラー修正

| ファイル | 変更内容 | 影響範囲 | リスク |
|---------|---------|---------|--------|
| `supabase/config.toml` | `[functions.stripe-webhook]`<br>`verify_jwt = false` 追加 | Webhook認証 | 🟡 中<br>（失敗しても現状維持） |
| `supabase/functions/stripe-webhook/index.ts` | - Line 9: Stripe import追加<br>- Line 35: `createSubtleCryptoProvider()`<br>- Line 66-72: `constructEventAsync()`にcrypto provider追加 | Webhook署名検証 | 🟡 中<br>（Deno環境で必須） |
| `supabase/functions/stripe-webhook/stripe-webhook.test.ts` | 新規作成: 6個のテストケース | テストのみ | 🟢 低 |

**Phase 1のログ出力**:
- ✅ Line 73: `Webhook署名検証成功`
- ❌ Line 75: `Webhook署名検証エラー`

---

### Phase 2: Webhook冪等性チェック

| ファイル | 変更内容 | 影響範囲 | リスク |
|---------|---------|---------|--------|
| `supabase/migrations/20251129_add_webhook_events_table.sql` | 新規作成: webhook_eventsテーブル | DB | 🔴 **高**<br>（マイグレーション失敗中） |
| `supabase/functions/stripe-webhook/index.ts` | - Line 87-111: 冪等性チェック追加<br>- Line 133-149: event_id保存処理追加 | Webhook処理 | 🔴 **高**<br>（テーブル未作成でエラー） |

**Phase 2のログ出力**:
- ⏭️ Line 101: `Already processed event: {eventId}`（二重処理防止）
- ✅ Line 148: `webhook_events保存完了: {eventId}`
- ❌ Line 145: `webhook_events保存エラー`

**⚠️ 既知の問題**:
```
ERROR: duplicate key value violates unique constraint "buckets_pkey"
```
→ マイグレーション実行が失敗。**webhook_eventsテーブルが作成されていない**

---

### Phase 3: プラン変更フロー実装

| ファイル | 変更内容 | 影響範囲 | リスク |
|---------|---------|---------|--------|
| `supabase/functions/preview-subscription-change/index.ts` | 新規作成: Preview Invoice API<br>- Flexible Billing Mode対応<br>- `createPreview()` 使用 | 新機能 | 🟢 低<br>（既存機能に影響なし） |
| `supabase/functions/update-subscription/index.ts` | 全面書き換え:<br>- Line 93-106: Subscription Schedule確認<br>- Line 108-116: 未払いインボイス確認<br>- Line 119-132: Subscription Update | プラン変更 | 🟡 中<br>（既存のプラン変更に影響） |

**Phase 3のログ出力**:
- Line 117: `Proration behavior: {behavior} (invoice status: {status})`
- ✅ Line 134: `Subscription updated: {subscriptionId}`
- ❌ Line 151: `Update subscription error`

---

### Phase 4: キャンセルフロー実装

| ファイル | 変更内容 | 影響範囲 | リスク |
|---------|---------|---------|--------|
| `supabase/migrations/20251129_add_canceled_at_column.sql` | 新規作成: canceled_atカラムを追加 | DB | 🟢 低<br>（カラム追加のみ） |
| `supabase/functions/stripe-webhook/index.ts` | Line 479: `canceled_at`をDB更新に追加 | Webhook処理 | 🟢 低<br>（既存処理に追加） |
| `supabase/functions/create-customer-portal/index.test.ts` | 新規作成: Customer Portal Session API自動テスト（4個） | テストのみ | 🟢 低 |
| `supabase/functions/stripe-webhook/stripe-webhook.test.ts` | Test 7-8追加: customer.subscription.deletedテスト | テストのみ | 🟢 低 |

**Phase 4のログ出力**:
- ✅ Line 487: `サブスクリプション削除を正常に処理しました`（canceled_at保存完了）
- ❌ Line 485: `ユーザーサブスクリプション情報の更新エラー`

**既存のUI**:
- ✅ `src/components/account/SubscriptionInfo.tsx`: 「サブスクリプションを管理」ボタン既に実装済み
- ✅ `src/services/stripe.ts`: `getCustomerPortalUrl()`関数が既に実装済み
- ✅ `supabase/functions/create-customer-portal/index.ts`: Customer Portal Session作成API既に実装済み

---

### Phase 5: 既存の新規登録フロー維持

| ファイル | 変更内容 | 影響範囲 | リスク |
|---------|---------|---------|--------|
| `supabase/functions/create-checkout/index.ts` | Line 98-118: 既存サブスクリプションチェック追加<br>→ アクティブサブスクリプションがある場合は400エラーを返す | 新規登録フロー | 🟢 低<br>（新規ユーザーのみに影響） |
| `supabase/functions/update-subscription/index.ts` | Line 23-55: `planType`と`duration`を受け取るように修正<br>→ 環境変数からPrice IDを取得 | プラン変更API | 🟡 中<br>（インターフェース変更） |
| `src/pages/Subscription.tsx` | Line 7: `updateSubscription`をインポート追加<br>Line 177-224: `handleConfirmPlanChange`を修正<br>→ Checkoutではなく`updateSubscription` APIを呼ぶ | プラン変更UI | 🟡 中<br>（既存契約者の動作変更） |

**Phase 5-1: create-checkoutの確認**
- ✅ 既存サブスクリプションがある場合は400エラーを返す
- ✅ エラーメッセージに「/account ページで管理してください」を含む

**Phase 5-2: フロントエンド分岐ロジック実装**
- ✅ バックエンド: update-subscription APIのインターフェースを修正
- ✅ フロントエンド: handleConfirmPlanChangeを修正（updateSubscription呼び出し）
- ✅ ボタンラベル: 現状維持（「選択する」「プラン変更」で十分）
- ✅ エラーハンドリング: 既に適切に実装済み

**Phase 5-3: 自動テスト作成**
- ✅ バックエンドテスト: `supabase/functions/create-checkout/index.test.ts`
  - Test 1: 未登録ユーザーでCheckout Session作成
  - Test 2: 既存アクティブサブスクリプションの動作確認
  - Test 3: metadata（user_id, plan_type, duration）設定確認
  - Test 4: cancel_url設定確認
- ✅ フロントエンドテスト: `src/pages/__tests__/Subscription.test.tsx`
  - Test 3: subscribed = false で「選択する」ボタン表示
  - Test 4: subscribed = true で「プラン変更」ボタン表示
  - Test 5: 現在のプランに「現在のプラン」バッジ表示
  - Test 6: 期間タブ（1ヶ月/3ヶ月）表示
  - Test 7: 料金プラン（Standard, Feedback）表示

**Phase 5のログ出力**:
- ✅ create-checkout Line 107: `{N}件のアクティブサブスクリプションを検出 - エラーを返します`
- ✅ update-subscription Line 45: `Price ID環境変数 {envVarName}: {priceId}`
- ✅ Subscription.tsx Line 203: `プラン変更を受け付けました`（成功時）

**フロー分岐**:
1. **新規ユーザー** (`isSubscribed === false`):
   - Checkoutボタン: 「選択する」
   - クリック → `createCheckoutSession()` → Stripe Checkout
   - 決済完了 → Webhook → DB更新

2. **既存契約者** (`isSubscribed === true`):
   - プラン変更ボタン: 「プラン変更」
   - クリック → 確認モーダル → `updateSubscription()` → Stripe API
   - 3秒後に自動リロード → Webhook完了を確認

---

### Phase 6: Webhook処理の強化

#### Phase 6-1: 非同期処理パターン実装

| ファイル | 変更内容 | 影響範囲 | リスク |
|---------|---------|---------|--------|
| `supabase/functions/stripe-webhook/index.ts` | - Line 44: `requestStartTime`でパフォーマンス測定開始<br>- Line 113-137: 200レスポンスを即座に返すように変更<br>- Line 130: `processWebhookAsync()`を非同期実行<br>- Line 150-218: `processWebhookAsync()`関数を新規作成 | Webhook処理全体 | 🟡 中<br>（パフォーマンス改善） |

**Phase 6-1の実装詳細**:

**変更前の同期処理フロー** (問題):
```
1. 署名検証 (同期)
2. 冪等性チェック (同期)
3. イベント処理 (同期・重い) ← 3秒以上かかることがある
4. webhook_events保存 (同期)
5. 200レスポンス返却 ← ここまで3秒以上かかる
```
→ **問題**: Stripeは5秒以内に200が返らないとリトライしてしまう

**変更後の非同期処理フロー** (解決):
```
1. 署名検証 (同期)
2. 冪等性チェック (同期)
3. ✅ 200レスポンス即座に返却 ← 1秒以内
4. イベント処理 (非同期・バックグラウンド)
5. webhook_events保存 (非同期)
```
→ **解決**: 200レスポンスを1秒以内に返却、Stripeのリトライを防止

**Phase 6-1のログ出力**:
- ⏱️ Line 118: `200レスポンスまでの時間: {responseTime}ms` (目標: 1000ms以内)
- ✅ Line 201: `webhook_events保存完了: {eventId}` (非同期処理)
- ⏱️ Line 206: `非同期処理完了時間: {asyncProcessingTime}ms` (目標: 3000ms以内)
- ⚠️ Line 210: `非同期処理が目標時間（3000ms）を超過` (警告)
- ❌ Line 132: `Webhook非同期処理エラー` (非同期処理失敗時)

**パフォーマンス目標**:
- 🎯 200レスポンス返却: **1秒以内**
- 🎯 非同期処理完了: **3秒以内**

**実装のポイント**:
1. `processWebhookAsync()`は`await`せずに実行 → 200レスポンスをブロックしない
2. `.catch()`でエラーハンドリング → 非同期エラーもログに記録
3. `Date.now()`でパフォーマンス測定 → 目標達成を確認

---

#### Phase 6-2: エラーハンドリング強化

| ファイル | 変更内容 | 影響範囲 | リスク |
|---------|---------|---------|--------|
| `supabase/functions/stripe-webhook/index.ts` | - Line 213-239: `processWebhookAsync()`の詳細エラーログ<br>- Line 385-398: `handleCheckoutCompleted()`のエラーコンテキスト<br>- Line 519-531: `handleInvoicePaid()`のエラーコンテキスト<br>- Line 589-600: `handleSubscriptionDeleted()`のエラーコンテキスト<br>- Line 722-735: `handleSubscriptionUpdated()`のエラーコンテキスト | エラーログ全体 | 🟢 低<br>（ログ改善のみ） |

**Phase 6-2の実装詳細**:

**変更前のエラーログ** (問題):
```typescript
console.error("チェックアウト完了処理エラー:", error.message);
```
→ **問題**: エラーが発生したときに、どのイベント、どのユーザー、どのサブスクリプションで起きたかわからない

**変更後の詳細エラーログ** (解決):
```typescript
console.error("❌ [LIVE環境] チェックアウト完了処理エラー");
console.error(`📋 エラーコンテキスト:`, {
  event_type: "checkout.session.completed",
  session_id: session.id,
  subscription_id: session.subscription,
  user_id: session.metadata?.user_id || "unknown",
  plan_type: session.metadata?.plan_type || "unknown",
  duration: session.metadata?.duration || "unknown",
  error_message: error.message,
  error_stack: error.stack,
});
```
→ **解決**: エラー発生時に完全なコンテキスト情報を記録、原因特定が容易に

**Phase 6-2のログ出力例**:
```
❌ [LIVE環境] 非同期処理失敗 (1234ms)
📋 エラーコンテキスト: {
  event_id: "evt_1234567890",
  event_type: "checkout.session.completed",
  environment: "live",
  processing_time_ms: 1234,
  error_message: "Database connection timeout",
  error_stack: "Error: Database connection timeout\n    at ..."
}
🔍 エラー詳細: {
  name: "Error",
  message: "Database connection timeout",
  stack: "Error: Database connection timeout\n    at ..."
}
```

**エラーコンテキストに含まれる情報**:
- ✅ `event_id`: Webhookイベント ID
- ✅ `event_type`: イベントタイプ（checkout.session.completed等）
- ✅ `user_id`: ユーザー ID（可能な場合）
- ✅ `subscription_id`: サブスクリプション ID
- ✅ `customer_id`: Stripe顧客 ID
- ✅ `error_message`: エラーメッセージ
- ✅ `error_stack`: スタックトレース
- ✅ `processing_time_ms`: 処理時間

**メリット**:
1. 🔍 **問題の即座特定**: エラーログから即座に原因を特定可能
2. 🐛 **デバッグ効率化**: ユーザーIDやサブスクリプションIDがあるため、特定ユーザーの問題をすぐ再現
3. 📊 **エラー分析**: エラータイプごとの集計が可能
4. ⚡ **対応速度向上**: Supabase Edge Function Logsで完全な情報を確認

---

#### Phase 6-3: Realtime通知実装

| ファイル | 変更内容 | 影響範囲 | リスク |
|---------|---------|---------|--------|
| `src/pages/Subscription.tsx` | - Line 6: `useAuth` hookをimport<br>- Line 22: `user`を取得<br>- Line 209-276: `handleConfirmPlanChange()`をRealtime対応に変更 | プラン変更UI | 🟡 中<br>（ユーザー体験改善） |

**Phase 6-3の実装詳細**:

**変更前の問題点**:
```typescript
// setTimeout-based reload（3つの問題）
setTimeout(() => {
  window.location.reload();
}, 3000);
```

**問題1: タイミング問題**
- Webhookが3秒で完了する保証がない
- 3秒より早く完了 → 無駄な待機時間
- 3秒より遅く完了 → 古いデータを表示

**問題2: UX問題**
- `window.location.reload()`でページ全体が再読み込み
- 画面が一瞬フラッシュして不快な体験

**問題3: エラー検知問題**
- Webhookが失敗しても3秒後にリロード
- ユーザーは成功したと勘違いする可能性

---

**変更後の解決策（Realtime通知）**:

```typescript
// Phase 6-3: Realtime通知でWebhook完了を待つ
if (!user) {
  throw new Error('ユーザー情報が取得できません');
}

let updateDetected = false;
let timeoutId: NodeJS.Timeout;

// プラン変更を検知するためのチャンネルを個別に設定
const changeDetectionChannel = supabase
  .channel('plan_change_detection')
  .on('postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'user_subscriptions',
      filter: `user_id=eq.${user.id}`
    },
    (payload) => {
      console.log('✅ プラン変更をRealtime検知:', payload);
      updateDetected = true;

      // タイムアウトをクリア
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      // 成功メッセージ
      toast({
        title: "プラン変更が完了しました",
        description: "新しいプランが適用されました。",
      });

      // ローディング終了
      setIsLoading(false);
      setSelectedNewPlan(null);

      // チャンネルをクリーンアップ
      changeDetectionChannel.unsubscribe();
    }
  )
  .subscribe();

// 10秒のタイムアウト設定
timeoutId = setTimeout(() => {
  if (!updateDetected) {
    console.warn('⚠️ プラン変更のタイムアウト（10秒経過）');

    toast({
      title: "処理に時間がかかっています",
      description: "プラン変更の処理が完了していない可能性があります。ページを更新してご確認ください。",
      variant: "destructive",
    });

    setIsLoading(false);
    setSelectedNewPlan(null);
    changeDetectionChannel.unsubscribe();
  }
}, 10000); // 10秒
```

**実装のポイント**:

1. **Supabase Realtime使用**:
   - `user_subscriptions`テーブルのUPDATEイベントを監視
   - ユーザーIDでフィルター（`filter: user_id=eq.${user.id}`）
   - Webhookが完了してDB更新されると即座に検知

2. **10秒タイムアウト**:
   - Webhook処理が10秒以内に完了しない場合はエラー通知
   - `updateDetected`フラグで重複処理を防止

3. **ページリロード不要**:
   - `useSubscription` hookがすでにRealtime subscriptionを設定済み
   - DB更新時に自動的にUIが更新される（リロード不要）

4. **クリーンアップ**:
   - 成功時・タイムアウト時にチャンネルをunsubscribe
   - メモリリークを防止

---

**実装の流れ**:

```
1. ユーザーが「プラン変更」を確定
   ↓
2. update-subscription API呼び出し
   ↓
3. Realtime subscriptionをセットアップ
   ↓
4. トースト表示: 「変更を処理中です...」
   ↓
【並行処理】
├─ Stripe APIでサブスクリプション更新
│   ↓
├─ Webhookが発火（customer.subscription.updated）
│   ↓
├─ Webhook handler（非同期処理）
│   ↓
├─ DB更新（user_subscriptionsテーブル）
│   ↓
└─ Realtime通知 ← 【ここで検知】
   ↓
5. トースト表示: 「プラン変更が完了しました」
   ↓
6. ローディング終了・チャンネルクリーンアップ
```

**タイムアウトケース**:

```
1～3: 同じ
   ↓
【Webhookが10秒以内に完了しない】
   ↓
4. タイムアウト検知
   ↓
5. トースト表示: 「処理に時間がかかっています」
   ↓
6. ローディング終了・チャンネルクリーンアップ
```

---

**Phase 6-3で解決した問題**:

| 問題 | 変更前（setTimeout） | 変更後（Realtime） |
|------|---------------------|-------------------|
| タイミング問題 | ❌ 固定3秒待機 | ✅ DB更新を即座に検知 |
| UX問題 | ❌ ページ全体リロード（画面フラッシュ） | ✅ リロード不要（スムーズ） |
| エラー検知問題 | ❌ 失敗しても3秒後にリロード | ✅ 10秒タイムアウトでエラー通知 |
| ユーザー体験 | ❌ 最低3秒待機 | ✅ Webhook完了次第即座に反映 |

**メリット**:
1. 🚀 **高速**: Webhookが1秒で完了すれば1秒で反映（固定3秒待機なし）
2. 🎯 **確実**: DB更新を実際に検知してから成功メッセージ表示
3. ⚡ **スムーズ**: ページリロード不要でシームレスな体験
4. 🛡️ **エラー検知**: 10秒経過してもDB更新がなければエラー通知

---

## 🔍 テスト時の確認ポイント

### Phase 1テスト

**確認方法**:
```bash
# Stripe CLIでWebhook送信
stripe trigger checkout.session.completed
```

**成功の証**:
- [ ] Edge Functionログで「✅ Webhook署名検証成功」
- [ ] 401エラーが出ない
- [ ] DBのuser_subscriptionsが更新される

**失敗時のデバッグ**:
- ❌ 401エラー → config.tomlの`verify_jwt = false`が反映されていない
- ❌ 署名検証エラー → crypto providerの初期化失敗

---

### Phase 2テスト

**⚠️ 前提条件**: webhook_eventsテーブルが作成済み

**確認方法**:
```bash
# 同じWebhookを2回送信
stripe trigger checkout.session.completed
stripe trigger checkout.session.completed  # 2回目
```

**成功の証**:
- [ ] 1回目: ✅ webhook_events保存完了
- [ ] 2回目: ⏭️ Already processed event
- [ ] DBのuser_subscriptionsに1レコードのみ（二重登録されていない）

**失敗時のデバッグ**:
- ❌ `relation "webhook_events" does not exist` → マイグレーション未実行
- ❌ 2回目も処理される → 冪等性チェックが機能していない

---

### Phase 3テスト

**確認方法**:
```bash
# Preview API呼び出し
curl -X POST https://.../preview-subscription-change \
  -H "Authorization: Bearer {token}" \
  -d '{"newPriceId": "price_xxx"}'

# Update API呼び出し
curl -X POST https://.../update-subscription \
  -H "Authorization: Bearer {token}" \
  -d '{"newPriceId": "price_xxx"}'
```

**成功の証**:
- [ ] Preview APIが日割り金額を返す
- [ ] Update APIが成功（200 OK）
- [ ] Stripeで`customer.subscription.updated` Webhookが発火
- [ ] DBのuser_subscriptionsが更新される

**失敗時のデバッグ**:
- ❌ `Subscription Schedule` エラー → Scheduleが設定されている（手動解除が必要）
- ❌ `No active subscription found` → DBにサブスクリプション情報がない
- ❌ Proration behavior = 'none'（意図せず） → 未払いインボイスがある

---

## 🚨 デプロイ時の手順

### Step 1: マイグレーション問題の解決

**問題のあるマイグレーション**:
- `20241208_create_training_content_bucket.sql`
- `20241215_create_training_content_bucket.sql`

**対処方法**:
1. 既に存在するバケットをINSERTしようとしているので、これらのマイグレーションをスキップ
2. または、マイグレーションファイルを修正:
```sql
INSERT INTO storage.buckets (id, name, public)
VALUES ('training-content', 'training-content', false)
ON CONFLICT (id) DO NOTHING;  -- ← 追加
```

### Step 2: デプロイ順序

```bash
# 1. マイグレーション実行
npx supabase db push

# 2. Edge Functions デプロイ
npx supabase functions deploy stripe-webhook
npx supabase functions deploy preview-subscription-change
npx supabase functions deploy update-subscription

# 3. Webhookテスト
stripe trigger checkout.session.completed

# 4. プラン変更テスト（手動）
```

---

## 📊 影響範囲マップ

```
Phase 1: Webhook 401修正
  ↓
  影響: 全てのWebhook処理
  リスク: 中（失敗しても現状維持）

Phase 2: 冪等性チェック
  ↓
  影響: 全てのWebhook処理
  リスク: 高（テーブル未作成で全失敗）
  前提条件: マイグレーション成功

Phase 3: プラン変更
  ↓
  影響: プラン変更機能のみ
  リスク: 低（新機能）
```

---

## 🔧 ロールバック手順

### Phase 2をロールバック（webhook_events依存を削除）

```bash
# stripe-webhook/index.ts から以下を削除:
# - Line 87-111 (冪等性チェック)
# - Line 133-149 (event_id保存)
```

### Phase 3をロールバック

```bash
# Edge Functions削除
npx supabase functions delete preview-subscription-change
npx supabase functions delete update-subscription

# update-subscription/index.ts を元のバージョンに戻す
git checkout HEAD~1 supabase/functions/update-subscription/index.ts
```

---

**このドキュメントを見れば、どのファイルが何のために変更されたかすぐわかります。**
