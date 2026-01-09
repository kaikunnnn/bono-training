# 旧サイト課金の自動同期機能

**作成日**: 2025-01-07
**ブランチ**: `feature/auto-sync-stripe-users`
**ステータス**: 計画中

---

## 概要

旧サイト（Memberstack）で新規課金したユーザーを、自動的に新サイト（Supabase）に同期する。

## 現状の課題

```
旧サイトで課金
    ↓
Stripe Webhook (customer.subscription.created)
    ↓
新サイトの stripe-webhook Edge Function
    ↓
❌ session.metadata.user_id がない → 処理スキップ
```

**新サイトからの課金はメタデータに `user_id` を設定しているが、旧サイトからの課金にはない。**

---

## 解決策

### フロー（実装後）

```
旧サイトで課金
    ↓
Stripe Webhook (customer.subscription.created)
    ↓
新サイトの stripe-webhook Edge Function
    ↓
1. user_id がない場合
    ↓
2. Stripe Customer からメールアドレスを取得
    ↓
3. Supabase auth.users にメールで検索
    ↓
4a. ユーザーが存在する → そのuser_idを使用
4b. ユーザーが存在しない → 新規作成（migrated_from: "memberstack"）
    ↓
5. stripe_customers, user_subscriptions を更新
    ↓
✅ 同期完了
```

---

## 実装タスク

### Phase 1: Webhook機能拡張（コード変更）

| # | タスク | 工数 | 状態 |
|---|--------|------|------|
| 1.1 | `customer.subscription.created` イベントハンドラー追加 | 30min | 未着手 |
| 1.2 | メールからユーザー検索/作成ロジック実装 | 1h | 未着手 |
| 1.3 | 既存ハンドラーにフォールバック追加（user_idなしでも動作） | 30min | 未着手 |
| 1.4 | ローカルでテスト | 30min | 未着手 |

### Phase 2: Stripe設定（ダッシュボード操作）

| # | タスク | 工数 | 状態 |
|---|--------|------|------|
| 2.1 | Stripe Webhook エンドポイント追加 | 5min | 未着手 |
| 2.2 | 必要なイベントを選択 | 5min | 未着手 |
| 2.3 | Webhook Signing Secret を取得 | 5min | 未着手 |

### Phase 3: デプロイ・検証

| # | タスク | 工数 | 状態 |
|---|--------|------|------|
| 3.1 | Edge Function デプロイ | 10min | 未着手 |
| 3.2 | 本番 Webhook テスト | 15min | 未着手 |
| 3.3 | 動作確認（テスト課金） | 15min | 未着手 |

---

## 技術詳細

### 追加するイベントハンドラー

```typescript
case "customer.subscription.created":
  await handleSubscriptionCreated(stripe, supabase, event.data.object);
  break;
```

### handleSubscriptionCreated の処理

```typescript
async function handleSubscriptionCreated(stripe, supabase, subscription) {
  const customerId = subscription.customer;

  // 1. Stripe Customer 情報を取得
  const customer = await stripe.customers.retrieve(customerId);
  const email = customer.email;

  if (!email) {
    console.error("Customer にメールがありません");
    return;
  }

  // 2. Supabase でユーザーを検索
  let userId;
  const { data: existingUser } = await supabase.auth.admin.getUserByEmail(email);

  if (existingUser) {
    userId = existingUser.id;
  } else {
    // 3. ユーザーが存在しない → 新規作成
    const { data: newUser, error } = await supabase.auth.admin.createUser({
      email: email,
      email_confirm: true,
      user_metadata: {
        migrated_from: "memberstack",
        migrated_at: new Date().toISOString()
      }
    });
    userId = newUser.user.id;
  }

  // 4. stripe_customers, user_subscriptions を更新
  // ... (既存ロジックと同様)
}
```

### Stripe Webhook で必要なイベント

| イベント | 用途 |
|----------|------|
| `customer.subscription.created` | 新規サブスクリプション作成時 |
| `customer.subscription.updated` | プラン変更、キャンセル予約時 |
| `customer.subscription.deleted` | サブスクリプション終了時 |
| `invoice.paid` | 更新支払い完了時 |
| `checkout.session.completed` | 既存（新サイトからの課金） |

---

## リスクと対策

| リスク | 対策 |
|--------|------|
| 同じメールで重複ユーザー作成 | メールで検索してから作成 |
| Webhookの二重処理 | webhook_events テーブルで冪等性担保（既存） |
| 旧サイトと新サイトのWebhookが競合 | 別々のエンドポイントなので問題なし |
| パスワードなしユーザー | `migrated_from` フラグでパスワードリセット誘導（既存） |

---

## 完了条件

- [ ] 旧サイトで課金したユーザーが自動的に新サイトにも作成される
- [ ] 新規ユーザーは `migrated_from: "memberstack"` が設定される
- [ ] ログイン時に「パスワード再設定が必要です」が表示される
- [ ] サブスクリプション情報が正しく同期される

---

## 参考ドキュメント

- `.claude/docs/subscription/migration/MIGRATED-USER-FIX.md` - 移行ユーザー管理
- `supabase/functions/stripe-webhook/index.ts` - 現在のWebhook実装
- `scripts/migrate-new-stripe-users.ts` - 手動マイグレーションスクリプト
