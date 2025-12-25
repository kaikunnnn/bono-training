# サブスクリプション同期問題 - 全体まとめ

**作成日**: 2025-12-24
**ステータス**: 🔴 修正待ち

---

## 📊 現状のデータ状況

### Supabaseのテーブル状況

| テーブル | 件数 | 状態 |
|----------|------|------|
| `auth.users` | 2,046 | ✅ 移行完了 |
| `stripe_customers` (live) | 2,043 | ✅ ほぼ完了 |
| `user_subscriptions` (live) | 2,037 | ⚠️ 問題あり |
| └ `is_active = true` | 250 | ✅ 正常 |
| └ `stripe_subscription_id = NULL` | 1,785 | 🔴 **問題あり** |
| └ `is_active = false AND sub_id = NULL` | 1,785 | 🔴 **修正必要** |

### 問題の要約

**1,785人のユーザーが以下の状態:**
- `is_active: false`（課金していないと判定される）
- `stripe_subscription_id: null`（Stripeと紐付いていない）
- `plan_type: 'standard'`（誤ったデフォルト値）

**このうち、Stripeで有効なサブスクを持つユーザーは:**
- アプリでは「無料プラン」と表示される
- 有料レッスンにアクセスできない（またはアクセス制御が効いていない）

---

## 🔍 発覚した経緯

### 報告内容（renrenkon.800@gmail.com）

1. パスワードリセット後、ログイン成功
2. アカウント情報画面で「無料」と表示
3. コンソールログ: `subscribed: false, planType: 'standard'`
4. Stripeダッシュボード: 有効なサブスク（¥5,478/月）が存在

### 調査で判明した事実

| 確認項目 | 結果 |
|----------|------|
| Stripe課金 | ✅ 有効（11/24から） |
| `auth.users` | ✅ 存在（11/19作成） |
| `stripe_customers` | ✅ 紐付けあり（cus_R4SGJ7BOlYoWQS） |
| `user_subscriptions.is_active` | ❌ **false**（本来true） |
| `user_subscriptions.stripe_subscription_id` | ❌ **null**（本来sub_xxx） |
| `user_subscriptions.updated_at` | ❌ **11/19のまま**（更新されていない） |

---

## 🔴 根本原因

### 原因1: DBトリガーが誤ったデフォルト値を設定

```sql
-- トリガー: on_auth_user_created_subscription
-- auth.usersにレコードが作成されると自動実行

CREATE OR REPLACE FUNCTION "public"."handle_new_user_subscription"()
RETURNS "trigger" AS $$
BEGIN
  INSERT INTO public.user_subscriptions (
    user_id,
    is_active,
    plan_type,              -- ← 問題: 'standard' がデフォルト
    stripe_subscription_id
  ) VALUES (
    NEW.id,
    false,                  -- ← 常に false
    'standard',             -- ← 常に 'standard'
    NULL
  );
  RETURN NEW;
END;
$$;
```

**問題点:**
- 新規ユーザー作成時、`plan_type: 'standard'` が無条件で設定される
- 無料ユーザーでも `standard` と表示される
- `is_active: false` のまま

### 原因2: 移行Step 3が未実行

**移行プロセスの設計:**

| Step | スクリプト | 内容 | 状態 |
|------|-----------|------|------|
| 1 | `migrate-create-auth-users.ts` | auth.users作成 | ✅ 完了 |
| 2 | `migrate-stripe-customers.ts` | stripe_customers同期 | ⚠️ 一部完了 |
| 3 | `migrate-subscriptions.ts` | user_subscriptions同期 | ❌ **未実行** |

**Phase 2 移行レポート（2025-11-28）より:**
- Step 1: 2,022/2,162件 成功（93.5%）
- Step 2, 3: 「未実行」と明記されている

### 原因3: 旧サイトでの課金がWebhookで届かなかった

**時系列:**
1. **2025-11-19**: 移行スクリプトでauth.users作成 → トリガーでuser_subscriptions作成
2. **2025-11-24**: ユーザーが**旧BONOサイト**で課金 → 新システムにWebhookなし
3. **2025-12-02**: 新システムのWebhook稼働開始
4. **2025-12-24**: 問題発覚

**Webhook履歴:**
- 最古のイベント: 2025-12-02 05:07:49
- ユーザーの課金日: 2025-11-24 → **記録されていない**

---

## 📈 影響範囲

### 確実に影響を受けているユーザー

| カテゴリ | 件数 | 説明 |
|----------|------|------|
| 問題のあるレコード | 1,785 | `is_active=false` かつ `sub_id=null` |
| 正常に動作中 | 250 | `is_active=true` |

### 250人が正常な理由

- 12/2以降にサブスクを開始/更新 → Webhookで同期された
- テスト時に手動で更新された
  - kyasya00@gmail.com: 12/6更新
  - takumi.kai.skywalker@gmail.com: 12/5更新

### 1,785人の実際の状況（推定）

| 状況 | 推定割合 | 対応 |
|------|----------|------|
| Stripeで有効なサブスクあり | 不明 | 🔴 **修正必要** |
| Stripeでサブスクなし（無料ユーザー） | 大多数 | デフォルト値の修正のみ |
| Stripeで過去にサブスク→キャンセル済み | 一部 | 確認必要 |

---

## ✅ 解決の方向性

### Phase 1: 即時対応（影響ユーザーの修正）

**目標**: Stripeで有効なサブスクを持つユーザーのuser_subscriptionsを修正

**手順:**
1. Stripeから全アクティブサブスクリプションを取得
2. 各サブスクのcustomer_id → stripe_customers → user_id を特定
3. user_subscriptionsを更新
   - `is_active: true`
   - `stripe_subscription_id: sub_xxx`
   - `stripe_customer_id: cus_xxx`
   - `current_period_end: xxx`
   - `plan_type`: Price IDから判定

**作成済みスクリプト**: `scripts/fix-subscription-sync.ts`

### Phase 2: 将来の問題防止（DBトリガー修正）

**目標**: 新規ユーザー作成時に誤ったデフォルト値が設定されないようにする

**選択肢:**

| オプション | 変更内容 | メリット | デメリット |
|------------|----------|----------|------------|
| A | `plan_type` を `null` に | シンプル | フロントエンドで null ハンドリング必要 |
| B | `plan_type` を `'free'` に | 明示的 | 新しい値の追加 |
| C | トリガー削除 | 問題の根本解決 | 別途レコード作成が必要 |

**推奨: オプションB** - `plan_type: 'free'` に変更

### Phase 3: 全体検証

**目標**: 修正後の動作確認

1. renrenkon.800@gmail.com で動作確認
2. 他の影響ユーザーでサンプル確認
3. アカウント情報画面の表示確認
4. レッスンアクセス制御の確認

---

## 🛠 修正スクリプト

### 作成済み: `scripts/fix-subscription-sync.ts`

**機能:**
- Stripeから全アクティブサブスクを取得
- stripe_customersテーブルでuser_idを特定
- user_subscriptionsを更新

**使用方法:**
```bash
# ドライラン（変更なし、影響範囲確認）
STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/fix-subscription-sync.ts --dry-run

# 本番実行
STRIPE_SECRET_KEY=sk_live_xxx npx tsx scripts/fix-subscription-sync.ts
```

**必要な環境変数:**
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase URL
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase Service Role Key
- `STRIPE_SECRET_KEY`: Stripe本番Secret Key（sk_live_xxx）

---

## ⚠️ リスクと注意点

### 修正実行時のリスク

| リスク | 対策 |
|--------|------|
| 間違ったユーザーを更新 | ドライランで事前確認 |
| 本番データ破損 | バックアップ取得（Supabaseダッシュボードから） |
| Stripe APIレート制限 | 100件ずつ取得、適切な間隔 |

### 確認すべき事項

1. **Stripe本番キーの確認**
   - `sk_live_` で始まること
   - 本番環境のキーであること

2. **影響範囲の事前確認**
   - ドライランで更新対象を確認
   - 想定と大きく異なる場合は一旦停止

3. **テストユーザーでの動作確認**
   - renrenkon.800@gmail.com を優先的に確認

---

## 📋 実行チェックリスト

### 実行前

- [ ] Supabaseのバックアップを確認
- [ ] Stripe本番キー（sk_live_xxx）を用意
- [ ] ドライランを実行して影響範囲を確認
- [ ] 結果が妥当か確認（更新対象数など）

### 実行中

- [ ] 本番スクリプトを実行
- [ ] エラーがないか監視
- [ ] 完了までログを確認

### 実行後

- [ ] renrenkon.800@gmail.com でログイン確認
- [ ] アカウント情報画面の表示確認
- [ ] コンソールログで `subscribed: true` を確認
- [ ] 他のユーザーでサンプル確認

---

## 📝 関連ドキュメント

- 調査詳細: `.claude/docs/subscription/issues/2025-12-24-subscription-sync-issue.md`
- 移行レポート: `.claude/docs/migration/phase2-full-migration-report.md`
- 修正スクリプト: `scripts/fix-subscription-sync.ts`

---

---

## 🔴 追加で発見した問題点

### 問題A: stripe_customersにあるがuser_subscriptionsにないユーザー（7件）

| メール | 状態 |
|--------|------|
| udkm1023@gmail.com 等 | テスト用アカウント |
| kyasya00-test@gmail.com | テスト用アカウント |

**対応**: テスト用なので無視してOK

---

### 問題B: is_active=false だが stripe_subscription_id がある（2件）

| メール | 状態 |
|--------|------|
| koara.xx1133xx@gmail.com | stripe_customer_id=null |
| jemesouvienkeiki@ezweb.ne.jp | 正常にキャンセル処理済み |

**対応**:
- Stripeでアクティブなら修正スクリプトで更新される
- Stripeでキャンセル済みなら正しい状態

---

### 問題C: 🔴 期限切れなのに is_active=true のまま（81件）

**例:**
- tangoayano32@gmail.com: 期限 11/20 → まだ active
- po.chom.pom@gmail.com: 期限 12/8 → まだ active

**原因**: Webhookで `customer.subscription.deleted` イベントが処理されていない可能性

**対応**:
1. 修正スクリプト実行時にStripeでキャンセル済みなら更新されない（正しい）
2. ただし、Supabase側の `is_active` を `false` に更新する処理が必要

---

### 問題D: 🔴 修正スクリプトの考慮漏れ

**現在のスクリプト**: Stripeの `status: active` のみ取得

**漏れているケース:**

| Stripeステータス | 意味 | 対応 |
|------------------|------|------|
| `active` | アクティブ | ✅ 対応済み |
| `trialing` | トライアル中 | ❌ **追加必要** |
| `past_due` | 支払い遅延 | ⚠️ 要検討 |
| `canceled` | キャンセル済み | Supabase側を `is_active=false` に |

---

### 問題E: Price ID マッピングの確認

現在のマッピング:
```
price_1RStBiKUVUnt8GtynMfKweby → standard 1ヶ月
price_1RStCiKUVUnt8GtyKJiieo6d → standard 3ヶ月
price_1OIiMRKUVUnt8GtyMGSJIH8H → feedback 1ヶ月
price_1OIiMRKUVUnt8GtyttXJ71Hz → feedback 3ヶ月
price_1OIiLxKUVUnt8GtyPH5xZpnG → standard 1ヶ月（旧）
price_1QArX1KUVUnt8GtyFGwf5g0P → standard 3ヶ月（旧）
```

**確認必要**: 旧BONOサイトで使用していた他のPrice IDがないか

---

## ✅ 修正スクリプトの改善案

### 改善1: trialing ステータスも取得

```typescript
// 現在
status: "active"

// 改善後
status: "active" または "trialing" も取得
```

### 改善2: キャンセル済みサブスクの処理追加

Stripeでキャンセル済みのサブスクについて、Supabase側の `is_active` を `false` に更新

### 改善3: 結果レポートの出力

修正結果をJSONファイルに保存して確認しやすく

---

## 📋 実行前の追加チェックリスト

- [ ] Stripeの全Price IDを確認（旧BONOサイト含む）
- [ ] trialing ステータスのユーザーがいるか確認
- [ ] 期限切れユーザーの処理方針を決定

---

## 更新履歴

| 日時 | 内容 |
|------|------|
| 2025-12-24 | 追加問題点を発見・記載 |
| 2025-12-24 | 初版作成（全体まとめ） |
