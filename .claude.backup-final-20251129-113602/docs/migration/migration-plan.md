# 既存データ移行計画書

**作成日**: 2025-11-19
**対象**: Stripe顧客・サブスクリプションデータ → Supabase
**規模**: 顧客数 2,162人 / アクティブなサブスクリプション 250件

---

## 📋 目次

1. [エグゼクティブサマリー](#エグゼクティブサマリー)
2. [現状分析](#現状分析)
3. [移行戦略](#移行戦略)
4. [詳細手順](#詳細手順)
5. [リスク分析](#リスク分析)
6. [ロールバック手順](#ロールバック手順)
7. [テスト計画](#テスト計画)

---

## 📊 エグゼクティブサマリー

### 移行の目的

既存のStripe + MemberStackで管理している顧客・サブスクリプションデータを、新システム（Supabase + Stripe）に移行し、既存ユーザーが引き続き同じサービスを利用できるようにする。

### 移行方針

**段階的移行（ゼロダウンタイム）**

1. **Phase 1**: データ同期（バックグラウンド）
2. **Phase 2**: 並行稼働（旧サイト + 新サイト）
3. **Phase 3**: 完全移行

### 重要な制約

- ✅ サービス停止なし
- ✅ 課金を止めない
- ✅ 既存ユーザー体験を損なわない
- ✅ 移行失敗時も既存システムは継続

### スケジュール

- **準備期間**: 1週間
- **Phase 1**: 3日間
- **Phase 2**: 1-2週間（テスト稼働）
- **Phase 3**: 1週間

---

## 🔍 現状分析

### 既存システム構成

#### Stripe
- **役割**: 決済・サブスクリプション管理
- **顧客数**: 2,162人
- **アクティブサブスクリプション**: 250件

#### MemberStack
- **役割**: 会員管理・認証
- **連携**: Stripeと連携してサブスクリプション状態を管理
- **重要**: ユーザーはMemberStackにログイン、課金はStripe

#### データの保存場所

| データ種類 | Stripe | MemberStack | 備考 |
|-----------|--------|-------------|------|
| 顧客情報 | ✅ Master | ✅ Sync | Stripeがメイン |
| サブスクリプション | ✅ Master | ✅ Sync | Stripeがメイン |
| ユーザー認証 | - | ✅ Master | MemberStackが管理 |
| メールアドレス | ✅ | ✅ | 同じ |

### 新システム構成

#### Supabase
- **Supabase Auth**: ユーザー認証
- **PostgreSQL**: データベース
- **Edge Functions**: サーバーレス処理

#### Stripe
- **役割**: 決済・サブスクリプション管理（変更なし）
- **既存のStripeアカウントをそのまま使用**

---

## 🎯 移行戦略

### 戦略の選択

**選択した戦略**: **段階的移行（並行稼働）**

**理由**:
1. ゼロダウンタイムが必須
2. 既存ユーザーへの影響を最小化
3. テスト期間を十分に確保
4. ロールバックが容易

### 移行しないもの

- **Stripeデータ**: 移行せず、そのまま使用
- **サブスクリプションID**: 変更せず、既存IDを維持
- **課金スケジュール**: 変更なし

### 移行するもの

- **ユーザー認証**: MemberStack → Supabase Auth
- **データベース**: MemberStack → Supabase PostgreSQL
- **サブスクリプション状態**: Stripe → Supabase (同期)

---

## 📝 詳細手順

### Phase 1: データ同期（バックグラウンド）

**目的**: 既存Stripeデータを新Supabaseに同期

**期間**: 3日間

#### Step 1-1: 事前準備（1日目）

**タスク**:
1. Supabaseテーブルの現在のデータを確認
2. テストデータがあれば削除
3. 移行スクリプトの準備

**確認コマンド**:
```sql
-- 現在のデータ数を確認
SELECT COUNT(*) FROM stripe_customers;
SELECT COUNT(*) FROM user_subscriptions;

-- テストデータを削除（必要な場合）
DELETE FROM user_subscriptions WHERE created_at > '2025-01-01';
DELETE FROM stripe_customers WHERE created_at > '2025-01-01';
```

#### Step 1-2: Stripeデータのエクスポート（1日目）

**タスク**:
1. Stripe Dashboardから顧客データをエクスポート
2. サブスクリプションデータをエクスポート

**方法**:
```
Stripe Dashboard → Customers → Export → CSV
Stripe Dashboard → Subscriptions → Export → CSV
```

**必要なデータ**:
- Customer ID
- Email
- Subscription ID
- Plan ID / Price ID
- Status (active, canceled, etc.)
- Current Period End
- Cancel at Period End

#### Step 1-3: Supabase Authユーザーの作成（2-3日目）

**⚠️ 最重要タスク**

既存顧客はSupabase Authに登録されていないため、全員分のAuthアカウントを作成する必要があります。

**方法1: Supabase Admin APIを使用（推奨）**

```typescript
// scripts/create-auth-users.ts
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY! // Admin権限が必要
);

async function createAuthUser(email: string, stripeCustomerId: string) {
  // 1. Authユーザーを作成（パスワードは初回ログイン時に設定）
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email: email,
    email_confirm: true, // メール確認をスキップ
    user_metadata: {
      stripe_customer_id: stripeCustomerId,
      migrated_from: 'memberstack',
      migrated_at: new Date().toISOString()
    }
  });

  if (authError) {
    console.error(`Failed to create user: ${email}`, authError);
    return null;
  }

  return authData.user;
}
```

**方法2: パスワードリセットリンクを送信**

```typescript
async function sendPasswordResetLink(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: 'https://new-site.com/reset-password'
  });

  if (error) {
    console.error(`Failed to send reset link: ${email}`, error);
  }
}
```

#### Step 1-4: stripe_customersテーブルの同期（2-3日目）

```typescript
// Authユーザー作成後、stripe_customersテーブルに紐付け
async function syncStripeCustomers(customers: any[]) {
  for (const customer of customers) {
    const { email, stripe_customer_id } = customer;

    // Authユーザーを検索
    const { data: users } = await supabase.auth.admin.listUsers();
    const authUser = users?.users.find(u => u.email === email);

    if (!authUser) {
      console.error(`Auth user not found: ${email}`);
      continue;
    }

    // stripe_customersテーブルに保存
    const { error } = await supabase
      .from('stripe_customers')
      .upsert({
        user_id: authUser.id,
        stripe_customer_id: stripe_customer_id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Failed to sync customer: ${email}`, error);
    }
  }
}
```

#### Step 1-5: user_subscriptionsテーブルの同期（2-3日目）

```typescript
async function syncUserSubscriptions(subscriptions: any[]) {
  for (const sub of subscriptions) {
    const { customer_email, subscription_id, plan, status, current_period_end, cancel_at_period_end } = sub;

    // Authユーザーを検索
    const { data: users } = await supabase.auth.admin.listUsers();
    const authUser = users?.users.find(u => u.email === customer_email);

    if (!authUser) {
      console.error(`Auth user not found: ${customer_email}`);
      continue;
    }

    // プランタイプと期間を判定
    const { planType, duration } = determinePlanTypeAndDuration(plan);

    // user_subscriptionsテーブルに保存
    const { error } = await supabase
      .from('user_subscriptions')
      .upsert({
        user_id: authUser.id,
        stripe_subscription_id: subscription_id,
        stripe_customer_id: sub.customer_id,
        plan_type: planType,
        duration: duration,
        is_active: status === 'active',
        cancel_at_period_end: cancel_at_period_end,
        current_period_end: new Date(current_period_end * 1000).toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`Failed to sync subscription: ${customer_email}`, error);
    }
  }
}

function determinePlanTypeAndDuration(planId: string): { planType: string, duration: number } {
  // Stripe Price IDからプランタイプと期間を判定
  // 例: price_standard_1m → { planType: 'standard', duration: 1 }
  // 実際のPrice IDに応じて実装
  return { planType: 'standard', duration: 1 };
}
```

---

### Phase 2: 並行稼働（1-2週間）

**目的**: 旧サイトと新サイトを同時稼働させてテスト

**期間**: 1-2週間

#### Step 2-1: 新サイトのテストリリース

1. 新サイトを別ドメインでデプロイ（例: `new.example.com`）
2. 既存サイトはそのまま稼働（例: `example.com`）

#### Step 2-2: Stripeデータの自動同期

**Webhookで自動同期を設定**:

既にWebhookは実装済みなので、既存のStripeイベントが新Supabaseに自動で反映される。

```typescript
// supabase/functions/stripe-webhook/index.ts
// 既に実装済み
case "customer.subscription.updated":
  await handleSubscriptionUpdated(stripe, supabase, event.data.object);
  break;
```

#### Step 2-3: テストユーザーによる検証

**検証項目**:
- [ ] 既存ユーザーが新サイトにログインできる
- [ ] サブスクリプション状態が正しく表示される
- [ ] 解約済みユーザーも正しく表示される
- [ ] 課金が正常に継続される

---

### Phase 3: 完全移行（1週間）

**目的**: ユーザーを新サイトに誘導

**タスク**:
1. 旧サイトに「新サイトに移行しました」のバナーを表示
2. 自動リダイレクトを設定
3. 旧サイトを段階的に停止

---

## ⚠️ リスク分析

### リスク1: メールアドレスの不一致

**問題**: StripeとMemberStackでメールアドレスが異なる可能性

**影響**: 中
**対策**:
- Stripe Customer IDを優先的に使用
- メールアドレスは補助的に使用
- 不一致があった場合は手動で確認

---

### リスク2: プラン価格の不一致

**問題**: 既存プラン（¥6,800/月）と新プラン（¥4,980/月）の価格が異なる

**影響**: 高
**対策**:
- 既存ユーザーは既存価格を維持
- 新Stripe Price IDを作成せず、既存Price IDをそのまま使用
- 新プランは新Price IDで管理

**実装**:
```typescript
// 既存Price IDをそのまま使用
const LEGACY_PRICES = {
  standard_1m: 'price_existing_6800',  // 既存の¥6,800/月
  standard_3m: 'price_existing_5800',  // 既存の¥5,800/月
  // ...
};
```

---

### リスク3: Supabase Authユーザー作成の失敗

**問題**: 2,162人分のAuthユーザー作成に失敗する可能性

**影響**: 高
**対策**:
- バッチ処理で少しずつ作成
- エラーログを記録
- リトライ機能を実装

**実装**:
```typescript
async function batchCreateAuthUsers(emails: string[], batchSize = 10) {
  for (let i = 0; i < emails.length; i += batchSize) {
    const batch = emails.slice(i, i + batchSize);

    for (const email of batch) {
      try {
        await createAuthUser(email);
      } catch (error) {
        console.error(`Failed: ${email}`, error);
        // エラーログをCSVに保存
      }
    }

    // レート制限を回避するため、待機
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

---

### リスク4: データ同期の遅延

**問題**: Webhookによる自動同期が遅延する可能性

**影響**: 低
**対策**:
- 手動で同期スクリプトを定期実行
- 不整合を検出する監視スクリプトを作成

---

## 🔄 ロールバック手順

### Phase 1でのロールバック

**状況**: データ同期に失敗

**手順**:
1. Supabaseテーブルをクリア
   ```sql
   DELETE FROM user_subscriptions;
   DELETE FROM stripe_customers;
   DELETE FROM auth.users WHERE email_confirmed_at IS NULL;
   ```
2. 再度データ同期を実行

**影響**: なし（ユーザーには影響しない）

---

### Phase 2でのロールバック

**状況**: 新サイトに重大なバグ

**手順**:
1. 新サイトへのリダイレクトを停止
2. 旧サイトをそのまま稼働
3. 問題を修正後、再度Phase 2を開始

**影響**: なし（旧サイトが稼働し続ける）

---

### Phase 3でのロールバック

**状況**: 完全移行後に問題発覚

**手順**:
1. 旧サイトを再起動
2. DNSを旧サイトに戻す
3. ユーザーに告知

**影響**: 中（一時的なサービス停止）

---

## ✅ テスト計画

### テスト1: データ同期の検証

**目的**: Stripeデータが正しくSupabaseに同期されるか確認

**手順**:
1. サンプルデータ（10件）で同期テスト
2. 同期されたデータを確認
   ```sql
   SELECT * FROM stripe_customers LIMIT 10;
   SELECT * FROM user_subscriptions LIMIT 10;
   ```
3. メールアドレス、Customer ID、Subscription IDが一致することを確認

**成功基準**:
- [ ] 10件全てが正しく同期される
- [ ] データの不整合が0件

---

### テスト2: ログインテスト

**目的**: 既存ユーザーが新サイトにログインできるか確認

**手順**:
1. テストユーザー（5人）でログインを試行
2. パスワードリセットリンクからパスワード設定
3. ログイン成功を確認

**成功基準**:
- [ ] 5人全員がログインできる

---

### テスト3: サブスクリプション表示テスト

**目的**: サブスクリプション状態が正しく表示されるか確認

**手順**:
1. アクティブなサブスクリプションを持つユーザーでログイン
2. `/account` ページでプラン表示を確認
3. 解約済みユーザーでもテスト

**成功基準**:
- [ ] プラン名が正しく表示される
- [ ] 期間が正しく表示される
- [ ] 解約済みバッジが表示される

---

### テスト4: 課金継続テスト

**目的**: 既存の課金が継続されるか確認

**手順**:
1. 更新日が近いサブスクリプションを選定
2. 更新日を待つ
3. Stripe Dashboardで課金が実行されたか確認
4. Webhookで新Supabaseに反映されたか確認

**成功基準**:
- [ ] 課金が正常に実行される
- [ ] Supabaseに自動で反映される

---

## 📊 成功の定義

### 必須条件

- [ ] 全ての既存顧客がログインできる
- [ ] 全てのサブスクリプションが正しく表示される
- [ ] 課金が正常に継続される
- [ ] データの不整合が10件以下

### 許容できるエラー

- 1〜5件程度のエラーは手動で修正
- 10件以下なら許容

---

## 📅 スケジュール

### Week 1: 準備期間

| 日 | タスク | 担当 | 状態 |
|----|--------|------|------|
| 1 | Supabaseテーブル確認 | Dev | ⏳ |
| 2-3 | Stripeデータエクスポート | Dev | ⏳ |
| 4-5 | 移行スクリプト作成 | Dev | ⏳ |
| 6-7 | サンプルデータでテスト | Dev | ⏳ |

### Week 2: Phase 1

| 日 | タスク | 担当 | 状態 |
|----|--------|------|------|
| 1 | Authユーザー作成（バッチ1） | Dev | ⏳ |
| 2 | Authユーザー作成（バッチ2） | Dev | ⏳ |
| 3 | データ同期・検証 | Dev | ⏳ |

### Week 3-4: Phase 2

| 期間 | タスク | 担当 | 状態 |
|------|--------|------|------|
| 1-2週間 | 新サイトテストリリース | Dev | ⏳ |
| | テストユーザーによる検証 | QA | ⏳ |
| | フィードバック収集・修正 | Dev | ⏳ |

### Week 5: Phase 3

| 日 | タスク | 担当 | 状態 |
|----|--------|------|------|
| 1-3 | ユーザー誘導開始 | Marketing | ⏳ |
| 4-7 | 完全移行 | Dev | ⏳ |

---

## 📝 次のアクション

### すぐにやるべきこと

1. **Supabaseテーブルの現在のデータ確認**
   - SQL実行してデータ数を確認
   - テストデータの有無を確認

2. **Stripeデータのエクスポート**
   - Stripe Dashboardから顧客データをCSVでエクスポート
   - サブスクリプションデータをCSVでエクスポート

3. **MemberStackの調査**
   - APIドキュメントを確認
   - データエクスポート方法を確認

4. **移行スクリプトの作成**
   - `scripts/migrate-stripe-data.ts` を作成
   - バッチ処理の実装

---

**作成者**: Claude Code
**最終更新**: 2025-11-19
