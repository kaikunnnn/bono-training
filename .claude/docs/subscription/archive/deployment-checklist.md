# サブスクリプションシステム - デプロイチェックリスト

**作成日**: 2025-11-27
**最終更新**: 2025-11-27
**対象**: 本番環境へのデプロイを実施する開発者

---

## 📋 目次

1. [デプロイ前チェックリスト](#デプロイ前チェックリスト)
2. [デプロイ手順](#デプロイ手順)
3. [デプロイ後の確認](#デプロイ後の確認)
4. [ロールバック手順](#ロールバック手順)
5. [トラブルシューティング](#トラブルシューティング)

---

## デプロイ前チェックリスト

### ✅ 必須確認事項

#### 1. テスト完了確認

- [ ] 全7テストが成功している（`.claude/docs/subscription/testing/comprehensive-test-plan.md` 参照）
  - [ ] Test 5-1: Feedbackプラン 1ヶ月
  - [ ] Test 5-2: Standardプラン 1ヶ月
  - [ ] Test 5-3: Standardプラン 3ヶ月
  - [ ] Test 5-4: Feedbackプラン 3ヶ月
  - [ ] Test 5-5: プラン変更
  - [ ] Test 5-6: キャンセル処理
  - [ ] Test 5-7: 未登録ユーザー

#### 2. コード確認

- [ ] Price ID マッピングが正しい（`supabase/functions/stripe-webhook-test/index.ts`）
  ```typescript
  const PRICE_ID_TO_PLAN = {
    'price_1RStBiKUVUnt8GtynMfKweby': { planType: 'standard', duration: 1 },
    'price_1RStCiKUVUnt8GtyKJiieo6d': { planType: 'standard', duration: 3 },
    'price_1OIiMRKUVUnt8GtyMGSJIH8H': { planType: 'feedback', duration: 1 },
    'price_1OIiMRKUVUnt8GtyttXJ71Hz': { planType: 'feedback', duration: 3 },
  };
  ```

- [ ] premiumAccess.ts に全プランタイプが含まれている
  ```typescript
  return planType === 'standard' ||
         planType === 'growth' ||
         planType === 'community' ||
         planType === 'feedback';  // ← 'feedback' が含まれているか確認
  ```

- [ ] check-subscription のアクセス権限ルールが正しい
  ```typescript
  const hasMemberAccess = ['standard', 'growth', 'community', 'feedback'].includes(planType);
  const hasLearningAccess = ['standard', 'growth', 'feedback'].includes(planType);
  ```

#### 3. 環境変数確認

**本番環境のSupabase**:

- [ ] `STRIPE_SECRET_KEY` が設定されている
  ```bash
  supabase secrets list --project-ref YOUR_PROJECT_REF
  ```

- [ ] `STRIPE_WEBHOOK_SECRET` が設定されている
  ```bash
  supabase secrets list --project-ref YOUR_PROJECT_REF
  ```

**取得方法**:
- Stripe Secret Key: Stripe Dashboard → Developers → API keys → Secret key
- Webhook Secret: Stripe Dashboard → Developers → Webhooks → Signing secret

#### 4. データベース確認

- [ ] `user_subscriptions` テーブルが存在する
  ```sql
  SELECT table_name
  FROM information_schema.tables
  WHERE table_name = 'user_subscriptions';
  ```

- [ ] テーブルスキーマが正しい
  ```sql
  \d user_subscriptions
  ```

  **必須カラム**:
  - `user_id` (uuid)
  - `plan_type` (text)
  - `duration` (integer)
  - `is_active` (boolean)
  - `stripe_subscription_id` (text)
  - `cancel_at_period_end` (boolean)
  - `current_period_end` (timestamp with time zone)

#### 5. Stripe設定確認

- [ ] Stripe Webhook URLが設定されている
  - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook-test`
  - イベント:
    - `customer.subscription.created`
    - `customer.subscription.updated`
    - `customer.subscription.deleted`

- [ ] Stripe Productsが作成されている
  - Standardプラン（1ヶ月・3ヶ月）
  - Feedbackプラン（1ヶ月・3ヶ月）

- [ ] Stripe Pricesが作成されている
  - 各ProductにPriceが設定されている
  - Price IDがコードと一致している

---

## デプロイ手順

### Step 1: バックアップ作成

**重要**: デプロイ前に必ず現在の状態をバックアップ

1. **データベースバックアップ**
   ```bash
   # Supabase Dashboardから手動バックアップを作成
   # Settings → Database → Backups → Create backup
   ```

2. **現在のEdge Functionコードを保存**
   ```bash
   # 念のため現在のコードをローカルに保存
   cp -r supabase/functions supabase/functions.backup
   ```

3. **Git commitを作成**
   ```bash
   git add .
   git commit -m "Pre-deployment: サブスクリプションシステム完成版"
   git tag v1.0-subscription-system
   ```

### Step 2: Edge Functionsデプロイ

#### 2-1. stripe-webhook-test のデプロイ

```bash
# 本番環境にデプロイ
supabase functions deploy stripe-webhook-test --project-ref YOUR_PROJECT_REF

# デプロイ成功確認
# 出力: Deployed Function stripe-webhook-test version: xxx
```

#### 2-2. check-subscription のデプロイ

```bash
# 本番環境にデプロイ
supabase functions deploy check-subscription --project-ref YOUR_PROJECT_REF

# デプロイ成功確認
# 出力: Deployed Function check-subscription version: xxx
```

#### 2-3. 環境変数の再設定（必要に応じて）

```bash
# Stripe Secret Keyを設定
supabase secrets set STRIPE_SECRET_KEY=sk_live_... --project-ref YOUR_PROJECT_REF

# Stripe Webhook Secretを設定
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref YOUR_PROJECT_REF
```

### Step 3: フロントエンドデプロイ

**注意**: フロントエンドのデプロイ方法はプロジェクトにより異なります

#### Vercel/Netlifyの場合:

```bash
# ビルドして問題ないか確認
npm run build

# 本番環境にデプロイ
# Vercelの場合
vercel --prod

# Netlifyの場合
netlify deploy --prod
```

#### 手動デプロイの場合:

```bash
# ビルド
npm run build

# ビルド成果物を本番サーバーにアップロード
# (方法はサーバー構成により異なる)
```

### Step 4: Stripe Webhook URLの更新

1. **Stripe Dashboardを開く**
   - Developers → Webhooks

2. **新しいWebhookエンドポイントを追加**（テスト環境と分ける場合）
   - Endpoint URL: `https://YOUR_PROD_PROJECT_REF.supabase.co/functions/v1/stripe-webhook-test`
   - Events to send:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`

3. **Webhook Secretを取得**
   - 作成したWebhook → Signing secret → Reveal
   - このSecretをコピー

4. **Webhook Secretを環境変数に設定**
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_... --project-ref YOUR_PROJECT_REF
   ```

---

## デプロイ後の確認

### ✅ 動作確認チェックリスト

#### 1. Edge Functions動作確認

**check-subscription**:

```bash
# ログ確認
supabase functions logs check-subscription --project-ref YOUR_PROJECT_REF

# 手動テスト（ブラウザで実行）
# 1. アプリにログイン
# 2. ブラウザConsoleを開く
# 3. 以下のログが出るか確認:
#    "購読状態確認結果: {...}"
```

**stripe-webhook-test**:

```bash
# ログ確認
supabase functions logs stripe-webhook-test --project-ref YOUR_PROJECT_REF

# Stripe Dashboardでテストイベント送信
# 1. Developers → Webhooks → Test webhook
# 2. customer.subscription.created を送信
# 3. Responseが200 OKであることを確認
```

#### 2. データベース確認

```sql
-- user_subscriptions テーブルが存在するか
SELECT COUNT(*) FROM user_subscriptions;

-- テストユーザーのレコードが正しいか（テスト後）
SELECT * FROM user_subscriptions
WHERE user_id = '[test_user_id]';
```

#### 3. 簡易End-to-Endテスト

**⚠️ 重要**: 実際のクレジットカードで少額テスト推奨

1. **テストユーザーでログイン**

2. **プラン登録**
   - 「プランを見る」→ Standardプラン 1ヶ月 を選択
   - Stripe Checkoutで支払い（テストカード使用可）
   - サクセスページに戻ることを確認

3. **データベース確認**
   ```sql
   SELECT * FROM user_subscriptions
   WHERE user_id = '[test_user_id]';
   ```

   **期待値**:
   - `plan_type: 'standard'`
   - `duration: 1`
   - `is_active: true`

4. **プレミアムコンテンツアクセス**
   - プレミアムページにアクセス
   - 鍵マークが表示されない
   - 動画が再生できる

5. **コンソールログ確認**
   ```javascript
   // ブラウザConsoleに以下が出力されるか
   {
     subscribed: true,
     planType: 'standard',
     hasMemberAccess: true,
     hasLearningAccess: true
   }
   ```

6. **キャンセルテスト**
   - アプリ上でキャンセル
   - キャンセル後もコンテンツが見れるか確認

#### 4. エラーログ確認

```bash
# 過去1時間のエラーログを確認
supabase functions logs stripe-webhook-test --project-ref YOUR_PROJECT_REF | grep "ERROR"
supabase functions logs check-subscription --project-ref YOUR_PROJECT_REF | grep "ERROR"
```

**エラーがある場合**: [トラブルシューティング](#トラブルシューティング)参照

---

## ロールバック手順

### 緊急時のロールバック

**デプロイ後に致命的な問題が発生した場合**

#### Step 1: Edge Functionsのロールバック

```bash
# 以前のバージョンにロールバック
# （Supabase Dashboardから実施）
# 1. Edge Functions → 該当Function → Deployments
# 2. 以前のデプロイメントを選択 → Rollback
```

または

```bash
# バックアップから復元
supabase functions deploy stripe-webhook-test --project-ref YOUR_PROJECT_REF
# (バックアップしたコードをデプロイ)
```

#### Step 2: フロントエンドのロールバック

```bash
# Gitの以前のコミットに戻す
git revert HEAD
git push origin main

# Vercel/Netlifyで再デプロイ
vercel --prod
```

#### Step 3: データベースのロールバック（必要に応じて）

```bash
# Supabase Dashboardからバックアップを復元
# Settings → Database → Backups → Restore
```

### ロールバック後の確認

- [ ] Edge Functionsが以前のバージョンになっているか
- [ ] フロントエンドが正常に動作するか
- [ ] 既存ユーザーがコンテンツにアクセスできるか

---

## トラブルシューティング

### 問題1: デプロイ後にEdge Functionがエラー

**症状**:
```
supabase functions logs stripe-webhook-test
ERROR: ...
```

**確認事項**:

1. **環境変数が設定されているか**
   ```bash
   supabase secrets list --project-ref YOUR_PROJECT_REF
   ```

   **期待値**:
   - `STRIPE_SECRET_KEY`: `sk_live_...` または `sk_test_...`
   - `STRIPE_WEBHOOK_SECRET`: `whsec_...`

2. **TypeScript構文エラーがないか**
   ```bash
   cd supabase/functions/stripe-webhook-test
   deno check index.ts
   ```

3. **Supabase CLIのバージョンが最新か**
   ```bash
   supabase --version
   npm install -g supabase
   ```

**解決方法**:
- 環境変数が未設定 → `supabase secrets set` で設定
- 構文エラー → コードを修正して再デプロイ

### 問題2: Stripe Webhookが届かない

**症状**:
- ユーザーが登録してもデータベースが更新されない
- Stripe Dashboardでwebhookエラーが表示される

**確認事項**:

1. **Webhook URLが正しいか**
   - Stripe Dashboard → Developers → Webhooks
   - Endpoint URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/stripe-webhook-test`

2. **イベントが正しく設定されているか**
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

3. **Webhook Secretが正しいか**
   ```bash
   supabase secrets list --project-ref YOUR_PROJECT_REF | grep STRIPE_WEBHOOK_SECRET
   ```

4. **Edge Functionログを確認**
   ```bash
   supabase functions logs stripe-webhook-test --project-ref YOUR_PROJECT_REF
   ```

**解決方法**:
- Webhook URLが間違っている → Stripe Dashboardで修正
- Webhook Secretが間違っている → 再設定
- Edge Functionがエラー → ログを確認して修正

### 問題3: フロントエンドからEdge Functionにアクセスできない

**症状**:
- ブラウザConsoleに `fetch failed` エラー
- check-subscription APIが呼べない

**確認事項**:

1. **CORS設定が正しいか**
   - `supabase/functions/check-subscription/index.ts` に `corsHeaders` が設定されているか

2. **認証トークンが正しく送信されているか**
   - ブラウザConsole → Network → check-subscription → Headers
   - `Authorization: Bearer ...` が含まれているか

3. **Edge FunctionのURLが正しいか**
   - `src/hooks/useSubscription.ts` または API呼び出し箇所を確認
   - URL: `https://YOUR_PROJECT_REF.supabase.co/functions/v1/check-subscription`

**解決方法**:
- CORS エラー → `corsHeaders` を追加
- 認証エラー → Supabaseの認証実装を確認
- URL間違い → 正しいURLに修正

### 問題4: ユーザーがコンテンツにアクセスできない

**症状**:
- データベースに `is_active: true` があるのに鍵マークが表示される

**確認事項**:

1. **check-subscription レスポンス確認**
   - ブラウザConsole → ログを確認
   ```javascript
   {
     hasMemberAccess: false,  // ← false になっている
     hasLearningAccess: false
   }
   ```

2. **premiumAccess.ts 確認**
   - `src/utils/premiumAccess.ts` を開く
   - `canAccessContent()` に該当プランタイプが含まれているか
   ```typescript
   return planType === 'standard' ||
          planType === 'growth' ||
          planType === 'community' ||
          planType === 'feedback';  // ← これがないとアクセス不可
   ```

3. **データベースの `plan_type` 確認**
   ```sql
   SELECT plan_type FROM user_subscriptions
   WHERE user_id = '[user_id]';
   ```

**解決方法**:
- `premiumAccess.ts` に該当プランタイプがない → 追加して再デプロイ
- データベースの `plan_type` が間違っている → Price IDマッピングを確認

---

## デプロイ後のモニタリング

### 定期確認項目

#### 毎日確認

- [ ] Stripe Webhook成功率
  - Stripe Dashboard → Developers → Webhooks → イベント履歴
  - エラー率が5%未満であることを確認

- [ ] Edge Functionエラー率
  ```bash
  supabase functions logs stripe-webhook-test --project-ref YOUR_PROJECT_REF | grep "ERROR" | wc -l
  ```

#### 週次確認

- [ ] user_subscriptions テーブルのレコード数
  ```sql
  SELECT COUNT(*) FROM user_subscriptions WHERE is_active = true;
  ```

- [ ] キャンセル率
  ```sql
  SELECT
    COUNT(*) FILTER (WHERE cancel_at_period_end = true) AS canceled,
    COUNT(*) AS total,
    ROUND(COUNT(*) FILTER (WHERE cancel_at_period_end = true)::numeric / COUNT(*) * 100, 2) AS cancel_rate
  FROM user_subscriptions
  WHERE is_active = true;
  ```

### アラート設定（推奨）

- Stripe Webhookエラー率が10%を超えたらアラート
- Edge Functionエラーが10件/時間を超えたらアラート
- アクティブサブスクリプション数が急減したらアラート

---

## 参考資料

- [開発者向けガイド](.claude/docs/subscription/developer-guide.md)
- [包括的テスト計画](.claude/docs/subscription/testing/comprehensive-test-plan.md)
- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Stripe Webhooks Best Practices](https://stripe.com/docs/webhooks/best-practices)

---

**作成者**: AI開発チーム
**最終更新**: 2025-11-27
