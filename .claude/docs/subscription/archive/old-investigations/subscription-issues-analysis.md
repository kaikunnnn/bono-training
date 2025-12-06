# サブスクリプション機能 問題分析と修正計画

作成日: 2025-11-08
テスト実施日: 2025-11-08 09:40

## 問題の全体像

テスト結果から、以下の**根本的な設計問題**が明らかになりました：

### 🔴 根本原因: Stripe Checkoutの誤用

現在の実装では、既存契約者のプラン変更にも「Stripe Checkout（新規サブスクリプション作成用）」を使用しています。これが以下の問題を引き起こしています：

1. **新規課金画面が表示される** - 既存のカード情報が使われず、クレジットカードの再入力を求められる
2. **プラン差分が見えない** - 既存プランとの違いや金額差が表示されない
3. **二重課金が発生** - 新旧サブスクリプションが同時に存在してしまう
4. **自動キャンセルが失敗** - 古いサブスクリプションが正しくキャンセルされない

---

## 発見された問題の一覧

### 🔴 優先度：高（機能が使えない / 致命的なバグ）

#### 問題1: 二重課金が発生する
**症状:**
- 既存契約者が別プランを選択すると、新旧2つのサブスクリプションが同時にアクティブになる
- ユーザーが二重に課金される状態になる

**影響範囲:** すべての既存契約者

**原因:**
- 古いサブスクリプションの自動キャンセル処理が動作していない
- Webhookの`replace_subscription_id`メタデータが正しく処理されていない可能性

**再現手順:**
1. 既存契約者（例: takumi.kai.skywalker@gmail.com）でログイン
2. 別プラン（フィードバック）を選択
3. Stripeチェックアウトで決済
4. Stripeダッシュボードを確認 → 2つのサブスクリプションがアクティブ

**関連ファイル:**
- `supabase/functions/stripe-webhook/index.ts` (handleCheckoutCompleted関数)
- `supabase/functions/create-checkout/index.ts`

---

#### 問題2: 同じプラン内で期間変更ができない
**症状:**
- 現在フィードバックプラン（1ヶ月）に加入中
- 期間タブを「3ヶ月」に切り替えても、ボタンが「現在のプラン」と表示され非活性になる
- 1ヶ月 → 3ヶ月、3ヶ月 → 1ヶ月の変更ができない

**影響範囲:** すべての既存契約者

**原因:**
- `Subscription.tsx` の `isCurrentPlan` 判定がプランタイプ（standard/feedback）のみで判定している
- 期間（duration）を考慮していない

**該当コード:**
```typescript
// src/pages/Subscription.tsx:129
const isCurrentPlan = isSubscribed && planType === plan.id;
// ❌ durationを比較していない
```

**修正方針:**
```typescript
const isCurrentPlan = isSubscribed && planType === plan.id && currentDuration === selectedDuration;
```

**関連ファイル:**
- `src/pages/Subscription.tsx`
- `src/contexts/SubscriptionContext.tsx` (durationの取得が必要)

---

#### 問題3: Stripe ⇔ Supabase の同期が取れていない
**症状:**
- Stripe上でサブスクリプションをキャンセルしても、`/account` ページではまだアクティブと表示される
- DBの`user_subscriptions`テーブルが更新されていない

**影響範囲:** すべてのユーザー

**原因:**
- `customer.subscription.deleted` Webhookイベントの処理に問題がある可能性
- Webhookが発火していない、またはエラーが発生している

**確認が必要:**
- Webhookログを確認して、`customer.subscription.deleted`イベントが受信されているか
- エラーが発生していないか

**関連ファイル:**
- `supabase/functions/stripe-webhook/index.ts` (handleSubscriptionDeleted関数)

---

#### 問題4: プラン変更後、UIに反映されない
**症状:**
- Stripeチェックアウトで決済完了
- `/account` ページに戻っても、プラン情報が更新されていない（古いプランのまま）

**原因（推測）:**
1. Webhookが正常に処理されていない
2. フロントエンドのSubscriptionContextが更新されていない
3. `/subscription/success` ページでデータをリフレッシュしていない

**関連ファイル:**
- `src/pages/SubscriptionSuccess.tsx` (存在するか確認が必要)
- `src/contexts/SubscriptionContext.tsx`
- `supabase/functions/stripe-webhook/index.ts`

---

### 🟡 優先度：中（不便だが使える / UX問題）

#### 問題5: チェックアウトの「戻る」ボタンで404エラー
**症状:**
- Stripeチェックアウトページで「戻る」をクリック
- `/subscription/success` にリダイレクトされる
- 404エラーが表示される（successページが存在しない）

**原因:**
- `create-checkout` のcancel_urlが正しく設定されていない
- 現在: `returnUrl` (=/subscription/success) が設定されている
- 理想: `/subscription` に戻る

**該当コード:**
```typescript
// supabase/functions/create-checkout/index.ts:151
cancel_url: returnUrl,
// ❌ returnUrlが/subscription/successになっている
```

**修正方針:**
```typescript
success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
cancel_url: returnUrl.replace('/success', ''), // /subscriptionに戻る
```

**関連ファイル:**
- `supabase/functions/create-checkout/index.ts`
- `src/pages/Subscription.tsx` (returnUrl定義)

---

#### 問題6: 既存契約者に新規課金画面が表示される
**症状:**
- 既存契約者が別プランを選択
- Stripeチェックアウトページでクレジットカード情報の再入力を求められる
- プラン差分（変更内容）が表示されない

**影響範囲:** すべての既存契約者

**原因:**
- Stripe Checkoutは新規サブスクリプション作成用のフロー
- 既存契約者のプラン変更には適していない

**理想の動作:**
- 既存のカード情報を使用
- 新旧プランの差分（金額変更、機能の違いなど）を表示
- ユーザーに安心感を与える

**解決策の選択肢:**
1. **Stripe Customer Portalを使う（推奨）**
2. Stripe Subscriptions APIで直接更新する
3. Checkoutフローを改善する（根本解決にならない）

---

### 🟢 優先度：低（質問 / 確認事項）

#### 質問1: データベースマイグレーションは正しく実行されているか？
**ユーザーの質問:**
> これでいいの？

**確認が必要:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'user_subscriptions' AND column_name = 'duration';
```

**期待される結果:**
```
column_name | data_type
------------|----------
duration    | integer
```

もし結果が空なら、マイグレーションが実行されていない。

---

#### 質問2: Stripe Webhookイベントの設定は正しいか？
**現在の設定:**
```
checkout.session.completed
customer.subscription.deleted
customer.subscription.updated ← これは必要？
invoice.paid
```

**推奨設定:**
- `checkout.session.completed` ✅
- `customer.subscription.deleted` ✅
- `invoice.paid` ✅
- `customer.subscription.updated` ⚠️ 現在のコードでは未使用

**確認:**
`customer.subscription.updated`は現在のWebhookハンドラーで処理されていないため、削除してもOKです。ただし、将来的にサブスクリプション更新を追跡したい場合は残しておいてもOK。

---

#### 質問3: .envファイルは確認できないか？
**ユーザーの質問:**
> てかコレってあなたがファイルを確認できないの？ .envファイルね

**回答:**
はい、私は`.env`ファイルを読むことができます。すでに以前に読んで、Price IDの設定を確認しています。

---

### 🔵 その他のエラー

#### エラー1: カスタマーポータルが開けない（kyasya00@gmail.com）
**症状:**
- `/account` で「プランの管理」ボタンをクリック
- 「カスタマーポータルが開けませんでした」というエラー

**原因（推測）:**
- Stripeでこのユーザーのデータが見つからない
- DBの`stripe_customers`テーブルとStripeの顧客データが不整合
- 古いテストデータの可能性

**対処方法:**
1. DBの`stripe_customers`テーブルでkyasya00@gmail.comを検索
2. 該当レコードが存在するか確認
3. `stripe_customer_id`がStripeに存在するか確認
4. 存在しない場合、DBレコードを削除してユーザーに再登録してもらう

---

## 根本的な解決策の提案

### 🎯 推奨アプローチ: Stripe Customer Portalの導入

現在のCheckoutフローは**新規ユーザー専用**とし、**既存契約者のプラン変更はStripe Customer Portalを使用**する設計に変更することを提案します。

#### メリット
1. ✅ カード情報の再入力が不要
2. ✅ プラン差分が自動的に表示される
3. ✅ Stripeが自動的にサブスクリプションを管理（二重課金なし）
4. ✅ キャンセル、再開などの機能も利用可能
5. ✅ 実装がシンプルになる

#### デメリット
1. ❌ UIがStripeのデザインになる（カスタマイズ制限あり）
2. ❌ 実装の変更が必要

#### 実装の変更点
1. `Subscription.tsx`: 既存契約者には「プラン管理」ボタンを表示し、Customer Portalに遷移
2. 新規ユーザーのみCheckoutフローを使用
3. Webhookは現在の実装を維持（Checkoutは新規登録のみなので、二重課金の問題なし）

---

## 修正の優先順位と実行計画

### フェーズ1: 緊急対応（致命的なバグの修正）

#### 1-1. データベースマイグレーションの確認と実行
- 優先度: 🔴 最高
- 所要時間: 5分
- 内容: `duration`カラムが存在するか確認し、なければマイグレーション実行

#### 1-2. テストアカウント（kyasya00@gmail.com）のクリーンアップ
- 優先度: 🔴 高
- 所要時間: 5分
- 内容: 不整合データを削除

#### 1-3. 二重課金の調査とデータ修正
- 優先度: 🔴 最高
- 所要時間: 30分
- 内容:
  - Webhookログを確認
  - `replace_subscription_id`が正しく処理されているか調査
  - 既存の二重課金を手動で修正

### フェーズ2: 根本的な設計変更

#### 2-1. 設計方針の決定
- 優先度: 🔴 高
- 所要時間: 10分
- 内容: 以下のどちらを採用するか決定
  - **オプションA**: Customer Portal を使う（推奨）
  - **オプションB**: 現在のCheckoutフローを改善

#### 2-2. 実装（オプションAの場合）
- 優先度: 🔴 高
- 所要時間: 2時間
- 内容:
  1. `Subscription.tsx`で既存契約者の判定を追加
  2. 既存契約者には「プラン管理」ボタンを表示
  3. Customer Portal URLを取得して遷移
  4. 新規ユーザーは現在のCheckoutフローを維持

### フェーズ3: UX改善

#### 3-1. 同じプラン内の期間変更を可能にする
- 優先度: 🟡 中
- 所要時間: 30分
- 内容: `isCurrentPlan`の判定にdurationを追加

#### 3-2. チェックアウトのcancel_url修正
- 優先度: 🟡 中
- 所要時間: 10分
- 内容: `/subscription`に戻るように修正

#### 3-3. `/subscription/success` ページの作成
- 優先度: 🟡 中
- 所要時間: 30分
- 内容: 決済成功後のページを作成し、データをリフレッシュ

### フェーズ4: 動作確認

#### 4-1. 新規ユーザーのテスト
- 優先度: 🟡 中
- 所要時間: 30分

#### 4-2. 既存契約者のプラン変更テスト
- 優先度: 🔴 高
- 所要時間: 30分

---

## 次のステップ

以下の順番で進めることを提案します：

### ステップ1: 緊急確認（すぐに実行）
1. データベースに`duration`カラムが存在するか確認
2. Webhookログで二重課金の原因を調査
3. テストアカウント（kyasya00@gmail.com）のデータをクリーンアップ

### ステップ2: 設計方針の決定（ユーザーと相談）
- **質問**: 既存契約者のプラン変更に「Stripe Customer Portal」を使うことに賛成ですか？
  - **はい** → オプションAを実装
  - **いいえ** → 代替案を検討

### ステップ3: 実装と修正
設計方針が決まったら、優先度順に1つずつ修正していきます。

---

## 質問

進める前に、以下を確認させてください：

1. **設計方針**: 既存契約者のプラン変更に「Stripe Customer Portal」を使う方針でよろしいですか？
2. **優先順位**: この修正計画の優先順位は適切ですか？変更したい部分はありますか？
3. **テストアカウント**: kyasya00@gmail.comのデータを削除してよろしいですか？

これらの質問に答えていただければ、すぐに作業を開始できます。
