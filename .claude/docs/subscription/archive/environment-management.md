# サブスクリプションシステム - 環境管理ガイド

**作成日**: 2025-11-27
**最終更新**: 2025-11-27
**対象**: テスト環境と本番環境の切り替え方法を理解したい開発者

---

## 📖 目次

1. [環境管理の概要](#環境管理の概要)
2. [環境変数による環境分離](#環境変数による環境分離)
3. [現在の環境設定](#現在の環境設定)
4. [環境ごとの設定方法](#環境ごとの設定方法)
5. [テスト環境から本番環境への移行](#テスト環境から本番環境への移行)
6. [トラブルシューティング](#トラブルシューティング)

---

## 環境管理の概要

### なぜ環境を分けるのか

**テスト環境 (test):**
- Stripeのテストモードを使用
- **実際のお金は動かない**
- テストカード番号（4242 4242...）で決済テスト
- 開発・検証に使用
- localhost での開発時に使用

**本番環境 (live):**
- Stripeの本番モードを使用
- **実際のお金が動く**
- ユーザーの実クレジットカードで決済
- Vercel本番デプロイで使用

### このプロジェクトの設計方針

✅ **環境変数 `STRIPE_MODE` で環境を完全分離**
- Edge Functions: `STRIPE_MODE` 環境変数で判定
- Vercel: 環境ごとに異なる Price ID を使用
- localhost: 自動的にテスト環境

---

## 環境変数による環境分離

### 🎯 新しいアーキテクチャ（2025-11-27 改善）

```
┌──────────────────────────────────────────────┐
│  Frontend (Vercel/localhost)                 │
│                                              │
│  Vercel環境変数:                              │
│  ┌──────────────────────────────────────┐   │
│  │ Production環境:                       │   │
│  │  VITE_STRIPE_STANDARD_1M_PRICE_ID    │   │
│  │    = price_LIVE_STANDARD_1M          │   │
│  │                                       │   │
│  │ Development環境:                      │   │
│  │  VITE_STRIPE_STANDARD_1M_PRICE_ID    │   │
│  │    = price_1OIiOUKUVUnt8GtyOfXEoEvW  │   │
│  └──────────────────────────────────────┘   │
│                                              │
│  → チェックアウト時に適切な Price ID を渡す  │
└──────────────────────────────────────────────┘
                    ↓ HTTP Request
┌──────────────────────────────────────────────┐
│  Supabase Edge Functions                     │
│                                              │
│  環境変数から判定:                            │
│  const ENVIRONMENT = Deno.env.get('STRIPE_MODE') || 'test';
│                                              │
│  Supabase Secrets:                           │
│  ┌──────────────────────────────────────┐   │
│  │ 本番環境で設定:                       │   │
│  │  STRIPE_MODE=live                    │   │
│  │  STRIPE_LIVE_SECRET_KEY=sk_live_...  │   │
│  │  STRIPE_WEBHOOK_SECRET_LIVE=whsec... │   │
│  │                                       │   │
│  │ テスト環境（デフォルト）:              │   │
│  │  STRIPE_MODE 未設定 → 'test'         │   │
│  │  STRIPE_TEST_SECRET_KEY=sk_test_...  │   │
│  │  STRIPE_WEBHOOK_SECRET_TEST=whsec... │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

### 主要な変更点

| 項目 | 旧仕組み（問題あり） | 新仕組み（改善済み） |
|------|---------------------|---------------------|
| **Edge Functions** | `const ENVIRONMENT = 'test'`<br>（ハードコード） | `Deno.env.get('STRIPE_MODE')` or `'test'`<br>（環境変数） |
| **Frontend** | `useTestPrice` パラメータ<br>（クライアント側で指定） | Vercel環境変数で Price ID 分離<br>（サーバー側で判定） |
| **localhost開発** | 本番化すると使えなくなる | 常にテスト環境で開発可能 |
| **Vercel本番** | テスト環境のまま | `STRIPE_MODE=live` で本番環境 |

---

## 現在の環境設定

### 🔍 現在の状態（2025-11-27更新後）

#### Edge Functions

**全ての Edge Functions で統一:**
```typescript
// stripe-webhook-test/index.ts
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

// create-checkout/index.ts
const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';

// check-subscription/utils.ts
export function getCurrentEnvironment(): 'test' | 'live' {
  return (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';
}
```

**意味:**
- ✅ `STRIPE_MODE` 環境変数が設定されていない → **テスト環境**
- ✅ `STRIPE_MODE=live` が設定されている → **本番環境**
- ✅ デフォルトは `'test'` で安全

#### Frontend (Vercel)

**環境変数 (.env):**
```bash
# テスト用 Price ID（開発環境・localhost用）
VITE_STRIPE_STANDARD_1M_PRICE_ID=price_1OIiOUKUVUnt8GtyOfXEoEvW
VITE_STRIPE_STANDARD_3M_PRICE_ID=price_1OIiPpKUVUnt8Gty0OH3Pyip
VITE_STRIPE_FEEDBACK_1M_PRICE_ID=price_1OIiMRKUVUnt8GtyMGSJIH8H
VITE_STRIPE_FEEDBACK_3M_PRICE_ID=price_1OIiMRKUVUnt8GtyttXJ71Hz
```

Vercel Dashboard で本番環境用に上書き設定（後述）

---

## 環境ごとの設定方法

### 環境1: localhost開発環境（テスト）

**目的**: 開発時に実際のお金を動かさずテスト

**設定:**
1. **Edge Functions**: 何も設定しない
   - `STRIPE_MODE` 未設定 → 自動的に `'test'`

2. **Frontend (.env.local)**:
   - 既に `.env` にテスト用 Price ID が設定済み
   - 何もしなくてOK

**動作:**
- ✅ Stripe テストモードで動作
- ✅ テストカード（4242 4242...）で決済可能
- ✅ 実際のお金は動かない

### 環境2: Vercel本番環境

**目的**: 実際のユーザーに課金

**設定:**

#### Step 1: Supabase Secrets設定

**Supabase Dashboard → Settings → Edge Functions → Secrets**

以下を追加:
```
STRIPE_MODE=live
STRIPE_LIVE_SECRET_KEY=sk_live_51HDQT3KUVUnt8Gty...（本番Secret Key）
```

既に設定済みのもの:
```
STRIPE_TEST_SECRET_KEY=sk_test_51HDQT3KUVUnt8Gty...
STRIPE_WEBHOOK_SECRET_TEST=whsec_...
STRIPE_WEBHOOK_SECRET_LIVE=whsec_...（本番Webhook Secret）
```

#### Step 2: Vercel環境変数設定

**Vercel Dashboard → Settings → Environment Variables**

各環境で以下を設定:

**Production環境:**
```
VITE_STRIPE_STANDARD_1M_PRICE_ID = price_LIVE_STANDARD_1M
VITE_STRIPE_STANDARD_3M_PRICE_ID = price_LIVE_STANDARD_3M
VITE_STRIPE_FEEDBACK_1M_PRICE_ID = price_LIVE_FEEDBACK_1M
VITE_STRIPE_FEEDBACK_3M_PRICE_ID = price_LIVE_FEEDBACK_3M
```

**Preview/Development環境:**
```
VITE_STRIPE_STANDARD_1M_PRICE_ID = price_1OIiOUKUVUnt8GtyOfXEoEvW
VITE_STRIPE_STANDARD_3M_PRICE_ID = price_1OIiPpKUVUnt8Gty0OH3Pyip
VITE_STRIPE_FEEDBACK_1M_PRICE_ID = price_1OIiMRKUVUnt8GtyMGSJIH8H
VITE_STRIPE_FEEDBACK_3M_PRICE_ID = price_1OIiMRKUVUnt8GtyttXJ71Hz
```

**動作:**
- ✅ Production デプロイ → 本番 Price ID使用 → Edge Function が `STRIPE_MODE=live` で本番モード
- ✅ Preview/Development → テスト Price ID使用 → Edge Function が `STRIPE_MODE` 未設定でテストモード

---

## テスト環境から本番環境への移行

### 前提条件

- [ ] 全テストが成功している（`.claude/docs/subscription/testing/comprehensive-test-plan.md`）
- [ ] Stripeで本番モードを有効化している
- [ ] 本番用のStripe Secret Keyを取得している
- [ ] 本番用のWebhook Secretを取得している
- [ ] 本番用のProduct/Priceを作成している

### 手順

#### Step 1: Stripe本番モードの準備

1. **Stripe Dashboardで本番モードに切り替え**
   - 左上のスイッチ: 「テストモード」→「本番モード」

2. **本番用のProduct/Priceを作成**
   - Standardプラン（1ヶ月・3ヶ月）
   - Feedbackプラン（1ヶ月・3ヶ月）
   - **Price IDをメモ**

3. **本番用のWebhook URLを設定**
   - Developers → Webhooks → Add endpoint
   - URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`
   - Events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - **Signing secretをメモ**

4. **本番用のSecret Keyを取得**
   - Developers → API keys → Secret key
   - **`sk_live_...` をメモ**

#### Step 2: Price IDマッピングの更新

**ファイル**: `supabase/functions/_shared/plan-utils.ts`

```typescript
export function getPlanInfo(priceId: string): PlanInfo {
  const planMap: Record<string, PlanInfo> = {
    // ✅ テスト環境のPrice ID（既存）
    price_1RStBiKUVUnt8GtynMfKweby: { planType: "standard", duration: 1 },
    price_1RStCiKUVUnt8GtyKJiieo6d: { planType: "standard", duration: 3 },
    price_1OIiMRKUVUnt8GtyMGSJIH8H: { planType: "feedback", duration: 1 },
    price_1OIiMRKUVUnt8GtyttXJ71Hz: { planType: "feedback", duration: 3 },

    // ✅ 本番環境のPrice ID（追加）
    price_LIVE_STANDARD_1M: { planType: "standard", duration: 1 },
    price_LIVE_STANDARD_3M: { planType: "standard", duration: 3 },
    price_LIVE_FEEDBACK_1M: { planType: "feedback", duration: 1 },
    price_LIVE_FEEDBACK_3M: { planType: "feedback", duration: 3 },
  };

  return planMap[priceId] || { planType: "standard", duration: 1 };
}
```

コミット＆デプロイ:
```bash
git add supabase/functions/_shared/plan-utils.ts
git commit -m "Add production Price IDs to plan mapping"
supabase functions deploy stripe-webhook-test --project-ref fryogvfhymnpiqwssmuu
```

#### Step 3: Supabase環境変数の設定

**Supabase Dashboard → Settings → Edge Functions → Secrets**

1. **STRIPE_MODE を追加**
   - Name: `STRIPE_MODE`
   - Value: `live`
   - ⚠️ これを設定すると本番モードになります

2. **STRIPE_LIVE_SECRET_KEY を追加**
   - Name: `STRIPE_LIVE_SECRET_KEY`
   - Value: `sk_live_...`（Step 1-4でメモした値）

3. **STRIPE_WEBHOOK_SECRET_LIVE を確認**
   - 既に設定済みか確認
   - 未設定の場合: Step 1-3でメモした値を設定

#### Step 4: Vercel環境変数の設定

**Vercel Dashboard → Settings → Environment Variables**

各Price IDに対して **Production環境のみ** 設定:

| 変数名 | Production値 | Preview/Development値 |
|--------|-------------|----------------------|
| `VITE_STRIPE_STANDARD_1M_PRICE_ID` | `price_LIVE_STANDARD_1M` | テスト用（既存） |
| `VITE_STRIPE_STANDARD_3M_PRICE_ID` | `VITE_STRIPE_STANDARD_3M` | テスト用（既存） |
| `VITE_STRIPE_FEEDBACK_1M_PRICE_ID` | `price_LIVE_FEEDBACK_1M` | テスト用（既存） |
| `VITE_STRIPE_FEEDBACK_3M_PRICE_ID` | `price_LIVE_FEEDBACK_3M` | テスト用（既存） |

設定方法:
1. 既存の環境変数を編集
2. "Production" にチェックを入れて本番用の値を設定
3. "Preview" と "Development" にはテスト用の値（既存）を維持

#### Step 5: Vercelへ再デプロイ

```bash
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

Vercel が自動的にデプロイします。

#### Step 6: 動作確認

1. **少額テスト**
   - 実際のクレジットカードで最小プラン登録
   - サクセスページに遷移するか確認

2. **データベース確認**
   ```sql
   SELECT * FROM user_subscriptions
   WHERE user_id = '[test_user_id]';
   ```

3. **Stripe Dashboardで確認**
   - 本番モードでサブスクリプションが作成されているか
   - Webhookが成功しているか（200 OK）

4. **コンテンツアクセス確認**
   - プレミアムコンテンツが見れるか
   - 鍵マークが表示されないか

---

## 環境別の動作フロー

### テスト環境（localhost/Vercel Preview）

```
1. ユーザーがチェックアウト
   ↓
2. Frontend: テスト用 Price ID を使用
   ↓
3. Edge Function: STRIPE_MODE 未設定 → 'test'
   ↓
4. STRIPE_TEST_SECRET_KEY でStripe呼び出し
   ↓
5. Stripe テストモードで決済（お金動かない）
   ↓
6. subscription.created Webhookが送信
   ↓
7. stripe-webhook-test: STRIPE_MODE 未設定 → 'test'
   ↓
8. STRIPE_TEST_SECRET_KEY 使用
   ↓
9. テスト用Price IDでプラン判定
   ↓
10. user_subscriptions に保存（environment='test'）
```

### 本番環境（Vercel Production）

```
1. ユーザーがチェックアウト
   ↓
2. Frontend: 本番用 Price ID を使用
   ↓
3. Edge Function: STRIPE_MODE='live' → 'live'
   ↓
4. STRIPE_LIVE_SECRET_KEY でStripe呼び出し
   ↓
5. Stripe 本番モードで決済（実際のお金が動く）
   ↓
6. subscription.created Webhookが送信
   ↓
7. stripe-webhook-test: STRIPE_MODE='live' → 'live'
   ↓
8. STRIPE_LIVE_SECRET_KEY 使用
   ↓
9. 本番用Price IDでプラン判定
   ↓
10. user_subscriptions に保存（environment='live'）
```

---

## トラブルシューティング

### 問題1: localhostで本番モードになってしまう

**原因:**
- Supabase Secrets に `STRIPE_MODE=live` が設定されている

**解決方法:**
- Edge Functions はグローバルで共有されます
- localhost開発時は、Supabase Secrets から `STRIPE_MODE` を削除
- または、開発用のSupabaseプロジェクトを別途作成

### 問題2: Vercel本番でテストモードになってしまう

**確認事項:**

1. **Supabase Secrets確認**
   ```
   STRIPE_MODE=live が設定されているか？
   ```

2. **Vercel環境変数確認**
   ```
   Production環境に本番用Price IDが設定されているか？
   ```

3. **Edge Functionログ確認**
   ```bash
   supabase functions logs stripe-webhook-test --project-ref fryogvfhymnpiqwssmuu
   ```

   ログに `環境判定: test` と出ていないか確認

### 問題3: 環境変数が見つからないエラー

**エラーメッセージ:**
```
Error: STRIPE_LIVE_SECRET_KEY is not set
```

**原因:**
- Supabase Secretsに本番用キーが設定されていない
- `STRIPE_MODE=live` なのに `STRIPE_LIVE_SECRET_KEY` がない

**解決方法:**
1. Supabase Dashboard → Settings → Edge Functions → Secrets
2. `STRIPE_LIVE_SECRET_KEY` を追加
3. 値: Stripeの本番Secret Key (`sk_live_...`)

### 問題4: Price IDが見つからないエラー

**エラーメッセージ:**
```
Unknown price ID: price_LIVE_STANDARD_1M
```

**原因:**
- `plan-utils.ts` に本番用Price IDが登録されていない

**解決方法:**
- `supabase/functions/_shared/plan-utils.ts` に本番Price IDを追加
- Edge Functionを再デプロイ

### 問題5: VercelとSupabaseの環境が一致しない

**症状:**
- Vercelでは本番Price IDを送信
- Edge Functionはテストモードで動作
- 決済は成功するが、データベースに保存されない

**確認:**
```bash
# Edge Functionログで環境確認
supabase functions logs stripe-webhook-test

# 「環境判定: test」と出ていたら問題
```

**解決:**
- Supabase Secrets に `STRIPE_MODE=live` を設定
- Edge Function が環境変数を読み込むまで数分かかる場合あり

---

## 環境切り替えチェックリスト

### テスト環境 → 本番環境

- [ ] Stripe本番モードでProduct/Price作成
- [ ] 本番用Webhook URL設定
- [ ] `plan-utils.ts` に本番Price ID追加・デプロイ
- [ ] Supabaseに `STRIPE_MODE=live` 設定
- [ ] Supabaseに `STRIPE_LIVE_SECRET_KEY` 設定
- [ ] Supabaseに `STRIPE_WEBHOOK_SECRET_LIVE` 確認
- [ ] Vercel環境変数で Production に本番Price ID設定
- [ ] Vercel再デプロイ
- [ ] 少額テスト実施
- [ ] データベース確認（environment='live'）
- [ ] コンテンツアクセス確認

### 本番環境 → テスト環境（ロールバック）

- [ ] Supabase Secrets から `STRIPE_MODE` を削除
- [ ] Edge Functions が自動的に `'test'` にフォールバック
- [ ] Vercel環境変数確認（Preview/Development環境はテスト用のまま）
- [ ] テストカードで動作確認

---

## 参考資料

- [開発者向けガイド](developer-guide.md)
- [デプロイチェックリスト](deployment-checklist.md)
- [Stripe Environment Best Practices](https://stripe.com/docs/keys#test-live-modes)
- [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables)

---

**作成者**: AI開発チーム
**最終更新**: 2025-11-27（環境変数化対応）
