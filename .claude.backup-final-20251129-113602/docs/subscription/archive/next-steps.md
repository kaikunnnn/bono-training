# サブスクリプションシステム - 次のステップ計画

**作成日**: 2025-11-27
**最終更新**: 2025-11-27
**現在の状態**: テスト環境で動作中（環境分離実装完了）

---

## 📊 現在の状態

### ✅ 完了していること

1. **環境分離の実装** ✅

   - Edge Functions: `STRIPE_MODE` 環境変数で test/live 判定
   - Frontend: セキュアな環境判定（クライアント側から改ざん不可）
   - localhost: 常にテスト環境
   - Vercel 本番: `STRIPE_MODE=live` で本番環境切替可能

2. **全テスト完了** ✅ (7/7)

   - Test 5-1: Feedback 1 ヶ月 ✅
   - Test 5-2: Standard 1 ヶ月 ✅
   - Test 5-3: Standard 3 ヶ月 ✅
   - Test 5-4: Feedback 3 ヶ月 ✅
   - Test 5-5: プラン変更 ✅
   - Test 5-6: キャンセル ✅
   - Test 5-7: 未登録ユーザー ✅

3. **Edge Functions デプロイ** ✅

   - stripe-webhook-test
   - create-checkout
   - check-subscription

4. **ドキュメント整備** ✅
   - 開発者向けガイド
   - 環境管理ガイド
   - デプロイチェックリスト
   - テスト計画

### 🔄 現在の環境設定

```
┌─────────────────────────────────────────┐
│ 環境           │ 状態                    │
├─────────────────────────────────────────┤
│ localhost      │ テスト環境（自動）       │
│ Vercel Preview │ テスト環境（自動）       │
│ Vercel Prod    │ テスト環境（手動切替可） │
│ Edge Functions │ テスト環境（STRIPE_MODE未設定）│
└─────────────────────────────────────────┘
```

**Supabase Secrets:**

- ✅ `STRIPE_TEST_SECRET_KEY` - 設定済み
- ✅ `STRIPE_LIVE_SECRET_KEY` - 設定済み
- ✅ `STRIPE_WEBHOOK_SECRET_TEST` - 設定済み
- ✅ `STRIPE_WEBHOOK_SECRET_LIVE` - 設定済み
- ❌ `STRIPE_MODE` - **未設定（=テスト環境）**

---

## 🎯 次にやるべきこと

### 優先度: 🔴 高 - すぐにやる

#### Step 1: テスト環境での動作確認 ⏳

**目的**: 環境分離実装後の動作確認

**手順:**

1. **localhost で動作確認**

   ```bash
   # 開発サーバー起動
   npm run dev
   ```

   **確認項目:**

   - [○] ログインできる
   - [×] サブスクリプションページが表示される
   - [ ] チェックアウトボタンをクリック
   - [ ] Stripe Checkout 画面が表示される
   - [ ] テストカード（4242 4242 4242 4242）で決済
   - [ ] サクセスページに遷移
   - [ ] ブラウザコンソールにエラーなし

2. **データベース確認**

   ```sql
   -- 最新のサブスクリプションを確認
   SELECT * FROM user_subscriptions
   WHERE user_id = '[your_user_id]'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

   **確認項目:**

   - [ ] `environment` = 'test'
   - [ ] `plan_type` が正しい
   - [ ] `is_active` = true
   - [ ] `stripe_subscription_id` が存在

3. **Edge Function ログ確認**

   ```bash
   npx supabase functions logs stripe-webhook-test --project-ref fryogvfhymnpiqwssmuu
   ```

   **確認項目:**

   - [ ] `環境判定: test` と表示される
   - [ ] エラーログがない
   - [ ] Webhook が 200 OK で返っている

### 結果

プランに入ってない状態からスタンダード 1 ヶ月プランに/subscription ページから登録しようとすると以下の Console エラーがおこり課金ができません、Stripe ポータルも開かなかったです。

```stripe.ts:32
 POST https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/create-checkout 500 (Internal Server Error)
stripe.ts:40 🔍 Edge Function Response:
{data: null, error: FunctionsHttpError: Edge Function returned a non-2xx status code
    at FunctionsClient.<anonymous>…}
stripe.ts:43 ❌ Checkoutセッション作成エラー: FunctionsHttpError: Edge Function returned a non-2xx status code
    at FunctionsClient.<anonymous> (@supabase_supabase-j…?v=493d39c2:1407:17)
    at Generator.next (<anonymous>)
    at fulfilled (@supabase_supabase-j…?v=493d39c2:1326:24)
stripe.ts:44 ❌ Response data: null
stripe.ts:45 ❌ Response error object: {
  "name": "FunctionsHttpError",
  "context": {}
}
stripe.ts:138 Stripe決済エラー: Error: 決済処理の準備に失敗しました。
    at createCheckoutSession (stripe.ts:124:13)
    at async handleSubscribe (Subscription.tsx:84:32)
Subscription.tsx:95 購読エラー: Error: 決済処理の準備に失敗しました。
    at createCheckoutSession (stripe.ts:124:13)
    at async handleSubscribe (Subscription.tsx:84:32)
```

**所要時間**: 15 分

---

#### Step 2: Vercel デプロイ確認 ⏳

**目的**: Vercel の自動デプロイが成功しているか確認

**手順:**

1. **Vercel Dashboard 確認**

   - https://vercel.com/
   - 最新のデプロイが "Ready" になっているか確認
   - ビルドログにエラーがないか確認

2. **Preview URL でテスト**
   - Preview URL にアクセス
   - Step 1 と同じ動作確認を実施

**所要時間**: 10 分

---

### 優先度: 🟡 中 - 本番化の準備

#### Step 3: Stripe 本番環境の準備 📝

**目的**: 本番環境で実際の課金を行うための準備

**前提条件:**

- [ ] Stripe アカウントの本人確認完了
- [ ] 銀行口座情報の登録完了
- [ ] ビジネス情報の登録完了

**手順:**

1. **Stripe Dashboard で本番モードに切り替え**

   - Stripe Dashboard 左上のスイッチ
   - 「テストモード」→「本番モード」

2. **本番用 Product 作成**

   **Standard プラン:**

   - Product name: "Standard プラン"
   - 1 ヶ月プラン: ¥4,000/月（月次請求）
   - 3 ヶ月プラン: ¥11,400/3 ヶ月（一括請求 = ¥3,800/月）

   **Feedback プラン:**

   - Product name: "Feedback プラン"
   - 1 ヶ月プラン: ¥1,480/月（月次請求）
   - 3 ヶ月プラン: ¥3,840/3 ヶ月（一括請求 = ¥1,280/月）

3. **Price ID を記録**

   - 各 Price の詳細ページから Price ID をコピー
   - 次のステップで使用するのでメモしておく

   ```
   Standard 1M: price_________________
   Standard 3M: price_________________
   Feedback 1M: price_________________
   Feedback 3M: price_________________
   ```

4. **本番用 Webhook 設定**
   - Stripe Dashboard → Developers → Webhooks → Add endpoint
   - Endpoint URL: `https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/stripe-webhook-test`
   - Select events:
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
   - Webhook Signing Secret を記録

**所要時間**: 30 分

**参考**: `.claude/docs/subscription/environment-management.md` の「Step 1: Stripe 本番モードの準備」

---

#### Step 4: コードに本番 Price ID を追加 💻

**目的**: 本番環境の Price ID をコードに登録

**手順:**

1. **`plan-utils.ts` を更新**

   ファイル: `supabase/functions/_shared/plan-utils.ts`

   ```typescript
   export function getPlanInfo(priceId: string): PlanInfo {
     const planMap: Record<string, PlanInfo> = {
       // ✅ テスト環境のPrice ID（既存）
       price_1RStBiKUVUnt8GtynMfKweby: { planType: "standard", duration: 1 },
       price_1RStCiKUVUnt8GtyKJiieo6d: { planType: "standard", duration: 3 },
       price_1OIiMRKUVUnt8GtyMGSJIH8H: { planType: "feedback", duration: 1 },
       price_1OIiMRKUVUnt8GtyttXJ71Hz: { planType: "feedback", duration: 3 },

       // ✅ 本番環境のPrice ID（追加）- Step 3でメモしたIDを入力
       price_LIVE_STANDARD_1M: { planType: "standard", duration: 1 },
       price_LIVE_STANDARD_3M: { planType: "standard", duration: 3 },
       price_LIVE_FEEDBACK_1M: { planType: "feedback", duration: 1 },
       price_LIVE_FEEDBACK_3M: { planType: "feedback", duration: 3 },
     };

     return planMap[priceId] || { planType: "standard", duration: 1 };
   }
   ```

2. **Git コミット & プッシュ**

   ```bash
   git add supabase/functions/_shared/plan-utils.ts
   git commit -m "feat: 本番環境のPrice IDを追加"
   git push origin feature/user_dashboard
   ```

3. **Edge Function 再デプロイ**
   ```bash
   npx supabase functions deploy stripe-webhook-test --project-ref fryogvfhymnpiqwssmuu
   ```

**所要時間**: 10 分

---

#### Step 5: Vercel 環境変数設定 🔧

**目的**: Vercel で環境ごとに異なる Price ID を使用

**手順:**

1. **Vercel Dashboard にアクセス**

   - https://vercel.com/
   - プロジェクトを選択
   - Settings → Environment Variables

2. **各 Price ID の環境別設定**

   **`VITE_STRIPE_STANDARD_1M_PRICE_ID`:**

   - Production: `price_LIVE_STANDARD_1M`（Step 3 でメモした値）
   - Preview: `price_1OIiOUKUVUnt8GtyOfXEoEvW`（テスト用・既存）
   - Development: `price_1OIiOUKUVUVnt8GtyOfXEoEvW`（テスト用・既存）

   **`VITE_STRIPE_STANDARD_3M_PRICE_ID`:**

   - Production: `price_LIVE_STANDARD_3M`
   - Preview: `price_1OIiPpKUVUnt8Gty0OH3Pyip`
   - Development: `price_1OIiPpKUVUnt8Gty0OH3Pyip`

   **`VITE_STRIPE_FEEDBACK_1M_PRICE_ID`:**

   - Production: `price_LIVE_FEEDBACK_1M`
   - Preview: `price_1OIiMRKUVUnt8GtyMGSJIH8H`
   - Development: `price_1OIiMRKUVUnt8GtyMGSJIH8H`

   **`VITE_STRIPE_FEEDBACK_3M_PRICE_ID`:**

   - Production: `price_LIVE_FEEDBACK_3M`
   - Preview: `price_1OIiMRKUVUnt8GtyttXJ71Hz`
   - Development: `price_1OIiMRKUVUnt8GtyttXJ71Hz`

3. **設定方法**
   - 既存の環境変数を編集（Edit）
   - 各環境（Production/Preview/Development）にチェックを入れる
   - 環境ごとに異なる値を入力
   - Save

**所要時間**: 15 分

**参考**: `.claude/docs/subscription/environment-management.md` の「Step 2: Vercel 環境変数設定」

---

### 優先度: 🟢 低 - 本番化の実行

#### Step 6: 本番環境への切り替え 🚀

**⚠️ 警告**: この手順を実行すると、**実際のお金が動きます**

**前提条件:**

- [ ] Step 1-5 がすべて完了している
- [ ] テスト環境で問題なく動作している
- [ ] Stripe 本番モードの準備が完了している
- [ ] 本番 Price ID がコードに追加されている
- [ ] Vercel 環境変数が設定されている

**手順:**

1. **Supabase Secrets に `STRIPE_MODE=live` を追加**

   **Supabase Dashboard:**

   - Settings → Edge Functions → Secrets
   - Add new secret
   - Name: `STRIPE_MODE`
   - Value: `live`
   - Save

   **または CLI:**

   ```bash
   npx supabase secrets set STRIPE_MODE=live --project-ref fryogvfhymnpiqwssmuu
   ```

2. **Edge Functions が環境変数を読み込むまで待機**

   - 数分かかる場合があります
   - ログで確認:
     ```bash
     npx supabase functions logs stripe-webhook-test --project-ref fryogvfhymnpiqwssmuu
     ```
   - 「環境判定: live」と表示されれば OK

3. **Vercel を Production にデプロイ**

   ```bash
   # main ブランチにマージ
   git checkout main
   git merge feature/user_dashboard
   git push origin main
   ```

4. **少額テスト実施**

   - **実際のクレジットカード**を使用
   - 最小プラン（Feedback 1 ヶ月 ¥1,480）で登録
   - サクセスページに遷移するか確認

5. **データベース確認**

   ```sql
   SELECT * FROM user_subscriptions
   WHERE user_id = '[test_user_id]'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

   **確認項目:**

   - [ ] `environment` = 'live' ← 重要！
   - [ ] `plan_type` が正しい
   - [ ] `is_active` = true

6. **Stripe Dashboard 確認**

   - 本番モードでサブスクリプションが作成されているか
   - Webhook が 200 OK で返っているか

7. **テストサブスクリプションをキャンセル**
   - Stripe Dashboard でキャンセル
   - または、アプリからキャンセル

**所要時間**: 30 分

**参考**: `.claude/docs/subscription/environment-management.md` の「テスト環境から本番環境への移行」

---

## 📋 チェックリスト形式のサマリー

### 今すぐやること（優先度: 🔴 高）

- [ ] **Step 1**: localhost で動作確認（15 分）
- [ ] **Step 2**: Vercel デプロイ確認（10 分）

### 本番化の準備（優先度: 🟡 中）

- [ ] **Step 3**: Stripe 本番環境の準備（30 分）

  - [ ] 本番モードに切り替え
  - [ ] Product/Price 作成
  - [ ] Price ID 記録
  - [ ] Webhook 設定

- [ ] **Step 4**: コードに本番 Price ID 追加（10 分）

  - [ ] `plan-utils.ts` 更新
  - [ ] Git コミット & プッシュ
  - [ ] Edge Function 再デプロイ

- [ ] **Step 5**: Vercel 環境変数設定（15 分）
  - [ ] Production 環境に本番 Price ID 設定
  - [ ] Preview/Development はテスト用維持

### 本番環境への切り替え（優先度: 🟢 低）

- [ ] **Step 6**: 本番環境への切り替え（30 分）
  - [ ] `STRIPE_MODE=live` 設定
  - [ ] Production デプロイ
  - [ ] 少額テスト
  - [ ] データベース確認（environment='live'）
  - [ ] Stripe Dashboard 確認

---

## 🔄 ロールバック方法（問題発生時）

### 本番環境 → テスト環境に戻す

**緊急時の手順:**

1. **Supabase Secrets から `STRIPE_MODE` を削除**

   ```bash
   npx supabase secrets unset STRIPE_MODE --project-ref fryogvfhymnpiqwssmuu
   ```

2. **Edge Functions が自動的に 'test' にフォールバック**

   - デフォルト値が 'test' なので、環境変数削除で即座に戻る

3. **動作確認**
   ```bash
   npx supabase functions logs stripe-webhook-test --project-ref fryogvfhymnpiqwssmuu
   ```
   - 「環境判定: test」と表示されれば OK

**所要時間**: 5 分

---

## 📊 進捗管理

### 現在の進捗

```
[=============================>              ] 70%

完了:
✅ 環境分離実装
✅ 全テスト完了
✅ Edge Functions デプロイ
✅ ドキュメント整備

残り:
⏳ テスト環境での動作確認
⏳ 本番環境の準備
⏳ 本番環境への切り替え
```

### 次のマイルストーン

- **短期目標**: Step 1-2 完了（テスト環境確認）
- **中期目標**: Step 3-5 完了（本番環境準備）
- **長期目標**: Step 6 完了（本番環境稼働）

---

## 📚 関連ドキュメント

- [環境管理ガイド](environment-management.md) - 環境切り替えの詳細
- [開発者向けガイド](developer-guide.md) - システムアーキテクチャ
- [デプロイチェックリスト](deployment-checklist.md) - 詳細なデプロイ手順
- [テスト計画](testing/comprehensive-test-plan.md) - テスト仕様

---

## 💡 重要な注意事項

### 環境の確認方法

**現在どの環境で動いているか確認:**

```bash
# Edge Function のログで確認
npx supabase functions logs stripe-webhook-test --project-ref fryogvfhymnpiqwssmuu

# 「環境判定: test」または「環境判定: live」と表示される
```

**データベースで確認:**

```sql
SELECT DISTINCT environment FROM user_subscriptions;
-- 'test' のみ → テスト環境
-- 'test' と 'live' → 両方動作中
-- 'live' のみ → 本番環境のみ
```

### トラブル時の連絡先

- **Stripe サポート**: https://support.stripe.com/
- **Supabase サポート**: https://supabase.com/support
- **このプロジェクトのドキュメント**: `.claude/docs/subscription/`

---

**最終更新**: 2025-11-27
**次回更新予定**: Step 1-2 完了後
