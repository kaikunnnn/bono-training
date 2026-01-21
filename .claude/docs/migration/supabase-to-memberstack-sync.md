# Supabase → Memberstack 逆方向同期

**作成日**: 2025-01-21
**ステータス**: 調査完了 / 実装待ち
**関連ブランチ**: 別ブランチで実装予定

---

## 概要

新サイト（Supabase + Stripe）で発生したアカウント・サブスクリプションイベントを、旧サイト（Memberstack）に自動同期する仕組みの調査結果と実装計画。

### 背景

- 現在: bono サイト（Memberstack + Stripe）→ 新サイト（Supabase + Stripe）へのマイグレーションを実施中
- 要件: 逆方向（Supabase → Memberstack）への同期も必要
- 目的: 移行期間中、両サイトでユーザーが同じコンテンツにアクセスできるようにする

---

## 調査結果

### Memberstack Admin API 仕様

| 項目 | 値 |
|------|-----|
| Base URL | `https://admin.memberstack.com` |
| 認証 | `X-API-KEY` ヘッダー |
| Secret Key | Test: `sk_sb_xxx` / Live: `sk_live_xxx` |
| レート制限 | **25リクエスト/秒**（増加不可） |

### 利用可能なエンドポイント

```
POST   /members                        # メンバー作成
GET    /members                        # メンバー一覧
GET    /members/{id}                   # メンバー取得
PUT    /members/{id}                   # メンバー更新
DELETE /members/{id}                   # メンバー削除
POST   /members/{id}/add-plan          # プラン追加
POST   /members/{id}/remove-plan       # プラン削除
```

### コード例

```javascript
// 認証ヘッダー
const headers = {
  'X-API-KEY': 'sk_live_xxx',
  'Content-Type': 'application/json'
};

// メンバー作成（プラン付き）
const response = await fetch('https://admin.memberstack.com/members', {
  method: 'POST',
  headers,
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'password123',
    plans: [{ planId: 'pln_xxx' }],
    customFields: { name: 'John' },
    metaData: {
      supabaseUserId: 'uuid-xxx',
      stripeCustomerId: 'cus_xxx'
    }
  })
});

// プラン追加
await fetch(`https://admin.memberstack.com/members/${memberId}/add-plan`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ planId: 'pln_xxx' })
});

// プラン削除
await fetch(`https://admin.memberstack.com/members/${memberId}/remove-plan`, {
  method: 'POST',
  headers,
  body: JSON.stringify({ planId: 'pln_xxx' })
});
```

---

## 重大な制限事項

### 有料プランはAPIで追加できない

> "You can add or remove plans via API as long as they are **FREE**."

- `add-plan` エンドポイントは **無料プランのみ** 対応
- 有料プランの追加は **ユーザー自身がStripeチェックアウトで支払い** が必須
- これはMemberstackの設計思想（支払い同意が必要）

### Stripe連携の制限

- **Stripe側で直接作成されたサブスクリプションはMemberstackに自動同期されない**
- Stripeの商品（Products/Prices）はMemberstack側で作成する必要がある
- 既存のStripe顧客をMemberstackメンバーに紐付けるには手動インポートが必要

---

## 実現可能な同期範囲

| 操作 | Supabase → Memberstack | 方法 |
|------|------------------------|------|
| 新規アカウント作成 | ✅ 可能 | `POST /members` |
| 無料プラン割り当て | ✅ 可能 | `POST /members/{id}/add-plan` |
| **有料プラン割り当て** | ❌ **不可能** | API制限 |
| プラン削除（キャンセル） | ✅ 可能 | `POST /members/{id}/remove-plan` |
| メタデータ更新 | ✅ 可能 | `PUT /members/{id}` |

---

## 推奨アプローチ: 無料プラン + Webhook連携

### 設計思想

Memberstackを最終的に捨てる前提で、**移行期間中のアクセス権プロキシ**として扱う。

```
┌─────────────────────────────────────────────────────┐
│  Stripe（課金の真実）                                │
│  - 誰がいくら払っているか                            │
│  - サブスクのステータス                              │
│  - 請求履歴                                         │
└─────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────┐
│  Supabase（新サイト - 真のソース・オブ・トゥルース）   │
│  - ユーザーアカウント                                │
│  - Stripeと紐付いたサブスク状態                      │
│  - user_subscriptions, stripe_customers             │
└─────────────────────────────────────────────────────┘
          │
          ▼ Webhook で同期（一方向）
┌─────────────────────────────────────────────────────┐
│  Memberstack（旧サイト - 移行期間中のアクセス管理）    │
│  - 無料プラン = アクセス権のスイッチ                  │
│  - 課金データは持たない（Stripeとの紐付け不要）        │
│  - 移行完了後は停止                                  │
└─────────────────────────────────────────────────────┘
```

### 同期フロー

```
新サイト（Supabase + Stripe）でサブスク操作
    │
    ├── 新規登録 ──→ Memberstack: メンバー作成 + 無料プラン割り当て
    │
    ├── 更新 ──────→ Memberstack: プラン変更（無料プラン間）
    │
    └── キャンセル ─→ Memberstack: remove-plan
```

### 実装イメージ

```
Stripe: subscription キャンセル/期限切れ
    ↓
Supabase stripe-webhook: 検知
  - customer.subscription.updated (cancel_at_period_end = true)
  - customer.subscription.deleted (期限切れ)
    ↓
Memberstack API 呼び出し
  POST /members/{memberId}/remove-plan
    ↓
無料プラン削除 → アクセス権失効
```

---

## Memberstack側の準備（実装前に必要）

1. **「API用無料プラン」を作成**
   - プラン名例: `API Sync - Standard`, `API Sync - Feedback`
   - 価格: 無料

2. **有料プランと同じアクセス権を設定**
   - 同じコンテンツ・ページへのアクセス許可

3. **複数プランがある場合は、それぞれに対応する無料プランを作成**

---

## 実装タスク（別ブランチで実施）

### Phase 1: 準備
- [ ] Memberstack Admin API キーを取得
- [ ] 環境変数に追加（`MEMBERSTACK_SECRET_KEY`）
- [ ] Memberstack側で無料プランを作成
- [ ] プランIDを環境変数に追加

### Phase 2: Edge Function 拡張
- [ ] `stripe-webhook/index.ts` にMemberstack同期ロジックを追加
- [ ] 以下のイベントでMemberstack APIを呼び出す:
  - `checkout.session.completed` → メンバー作成 + プラン追加
  - `customer.subscription.updated` → プラン変更対応
  - `customer.subscription.deleted` → プラン削除

### Phase 3: データマッピング
- [ ] Supabase user_id ↔ Memberstack member_id のマッピングテーブル作成
- [ ] または user_metadata に memberstack_member_id を保存

### Phase 4: テスト
- [ ] テスト環境で動作確認
- [ ] 本番環境でのテスト

---

## 参考リンク

- [Memberstack Admin REST API - Member Actions](https://developers.memberstack.com/admin-rest-api/member-actions)
- [Memberstack Admin Package (REST)](https://docs.memberstack.com/hc/en-us/articles/17385829931419-Memberstack-Admin-Package-REST)
- [Community: API paid plans limitation](https://docs.memberstack.com/hc/en-us/community/posts/16176747944091-API-to-create-update-member-and-assign-subscription-plan)
- [3 Ways to Cancel a Member's Plan](https://docs.memberstack.com/hc/en-us/articles/11269224717851-3-Ways-to-Cancel-a-Member-s-Plan)

---

## 備考

- **Memberstackを捨てる予定なら、課金データとの紐付けがないことは問題にならない**
- Memberstackは「移行期間中のアクセス権管理」として機能すればよい
- 完全移行後はMemberstackを停止するだけでOK
