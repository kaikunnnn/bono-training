# バックエンド移行ドキュメント

## 概要

main ブランチで動作しているバックエンドシステムを feature/nextjs-migration ブランチに移行した記録。

## 移行日

2026-03-18

---

## 移行したコンポーネント

### 1. Supabase Edge Functions

**ディレクトリ**: `supabase/functions/`

main ブランチから `git checkout main -- supabase/` でコピー。Deno ベースのため Next.js の影響を受けない。

#### 関数一覧（17関数）

| 優先度 | 関数名 | 目的 |
|--------|--------|------|
| CRITICAL | `stripe-webhook` | 決済 webhook（本番） |
| CRITICAL | `stripe-webhook-test` | 決済 webhook（テスト） |
| CRITICAL | `create-checkout` | Stripe チェックアウト作成 |
| CRITICAL | `create-customer-portal` | 請求ポータル |
| CRITICAL | `check-subscription` | サブスクリプション確認 |
| CRITICAL | `update-subscription` | プラン変更 |
| HIGH | `get-content` | コンテンツ取得 |
| HIGH | `get-plan-prices` | 料金表示 |
| MEDIUM | `get-training-content` | トレーニングコンテンツ |
| MEDIUM | `get-training-detail` | トレーニング詳細 |
| MEDIUM | `get-training-list` | トレーニング一覧 |
| MEDIUM | `preview-subscription-change` | プラン変更プレビュー |
| LOW | `check-migrated-user` | ユーザー移行確認 |
| LOW | `clear-migrated-flag` | 移行フラグクリア |
| LOW | `webflow-series` | Webflow連携 |
| LOW | `fetch-ogp` | OGP取得 |

#### 共有ユーティリティ（`_shared/`）

- `stripe-helpers.ts` - Stripe環境管理
- `cors.ts` - CORS設定
- `email-templates.ts` - メールテンプレート
- `memberstack.ts` - Memberstack連携
- `plan-utils.ts` - プラン判定
- `resend.ts` - メール送信

#### TypeScript 除外設定

Deno ベースのため `tsconfig.json` で除外:

```json
{
  "exclude": ["node_modules", "vitest.config.ts", "src/__tests__", "supabase"]
}
```

---

### 2. Questions API（Next.js App Router）

Vercel Serverless 形式から Next.js App Router 形式に変換。

#### 質問投稿 API

**ファイル**: `src/app/api/questions/submit/route.ts`

- Bearer token からユーザー認証
- サブスクリプション状態確認
- Sanity に質問ドキュメント作成
- Slack 通知送信

#### 回答通知 Webhook

**ファイル**: `src/app/api/questions/answer-notification/route.ts`

- Sanity webhook 署名検証
- ユーザーメールアドレス取得
- Resend でメール送信

**注意**: Resend クライアントは遅延初期化（ビルドエラー回避）

```typescript
function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}
```

---

### 3. サービスレイヤー

#### auth.ts

**ファイル**: `src/lib/services/auth.ts`

- `signUpService()` - サインアップ
- `signInService()` - サインイン
- `signOutService()` - サインアウト
- `resetPasswordService()` - パスワードリセット申請
- `updatePasswordService()` - パスワード更新

**変更点**:
- `@/integrations/supabase/client` → `@/lib/supabase/client`
- `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`

#### pricing.ts

**ファイル**: `src/lib/services/pricing.ts`

3段階キャッシュによる Stripe 料金取得:
1. メモリキャッシュ（0ms）
2. localStorage キャッシュ（0-5ms）
3. Edge Function / Stripe API

**変更点**:
- `import.meta.env.VITE_*` → `process.env.NEXT_PUBLIC_*`
- `import.meta.env.PROD` → `process.env.NODE_ENV === 'production'`
- SSR 対応のため `typeof window === 'undefined'` チェック追加

---

### 4. ユーティリティ関数

**ファイル**: `src/lib/subscription.ts`

既存ファイルに以下を追加:

```typescript
// 型定義
export type PlanDuration = 1 | 3;
export type ContentAccessType = "learning" | "member";
export interface PlanInfo { ... }
export interface UserPlanInfo { ... }

// 定数
export const CONTENT_PERMISSIONS: Record<ContentAccessType, PlanType[]>
export const AVAILABLE_PLANS: PlanInfo[]

// 関数
export function hasAccessToContentByPlan(userPlan, contentType): boolean
export function hasMemberAccessByPlan(userPlan): boolean
export function hasLearningAccessByPlan(userPlan): boolean
export function hasTrainingAccess(planType): boolean
export function getPlanBenefits(planType): string[]
export function isValidPlanType(planType): boolean
export function getPlanMonthlyPrice(planType, duration): number
export function getPlanDisplayName(planType): string
```

---

## 環境変数

移行に必要な環境変数:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Sanity
NEXT_PUBLIC_SANITY_PROJECT_ID=
NEXT_PUBLIC_SANITY_DATASET=
SANITY_WRITE_TOKEN=
SANITY_WEBHOOK_SECRET=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=

# Resend
RESEND_API_KEY=

# Slack
SLACK_WEBHOOK_URL=
```

---

## 検証コマンド

### TypeScript コンパイル

```bash
npx tsc --noEmit
```

### ビルド

```bash
npm run build
```

### Edge Functions ローカルテスト

```bash
supabase start
supabase functions serve
```

---

## 残タスク

- [ ] 質問機能ページ（`/questions/*`）の移行
- [ ] 知識ベースページの移行
- [ ] 検索機能の移行
- [ ] イベント機能の移行
