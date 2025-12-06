# Stripe Customer Portal 設定ガイド

**目的**: プラン変更を可能にするためのCustomer Portal設定

---

## 🔧 設定手順

### 1. Customer Portalにアクセス

**URL**: https://dashboard.stripe.com/test/settings/billing/portal

**注意**: テストモードであることを確認してください（左上に「テストモード」の表示）

---

### 2. Customer Portalを有効化

**確認項目**:
- [ ] Customer Portalが有効になっているか
- [ ] 「Activate test link」ボタンが押されているか

**設定方法**:
1. ページ上部の「Activate test link」をクリック（初回のみ）
2. Customer Portalが有効化される

---

### 3. プラン変更機能の有効化

**セクション**: "Subscription changes"

**確認項目**:
- [ ] 「Allow customers to switch plans」がONになっているか
- [ ] プロレーション（日割り計算）が有効か

**設定方法**:
1. "Subscription changes"セクションを開く
2. 「Allow customers to switch plans」をON
3. "Proration behavior"を確認:
   - **推奨**: "Always invoice" または "Create prorations"
   - これにより日割り計算が自動適用される

---

### 4. 表示するプランの設定

**セクション**: "Products"

**確認項目**:
- [ ] Standard プランが表示されるか
- [ ] Feedback プランが表示されるか
- [ ] 1ヶ月と3ヶ月の両方の価格が表示されるか

**設定方法**:
1. "Products"セクションを開く
2. 「Select products」をクリック
3. 表示したいプランを選択:
   - Standard 1ヶ月（Price ID: `STRIPE_TEST_STANDARD_1M_PRICE_ID`）
   - Standard 3ヶ月（Price ID: `STRIPE_TEST_STANDARD_3M_PRICE_ID`）
   - Feedback 1ヶ月（Price ID: `STRIPE_TEST_FEEDBACK_1M_PRICE_ID`）
   - Feedback 3ヶ月（Price ID: `STRIPE_TEST_FEEDBACK_3M_PRICE_ID`）
4. 保存

**注意**:
- Price IDは環境変数に設定されているものと一致させる
- テストモードの価格を選択する

---

### 5. その他の設定

#### キャンセル機能
**セクション**: "Cancellations"

**確認項目**:
- [ ] 「Allow customers to cancel subscriptions」がONか

**推奨設定**:
- ON（ユーザーが自分で解約できる）
- "Cancel at period end"（期間終了時にキャンセル）

---

#### 支払い方法の更新
**セクション**: "Payment methods"

**確認項目**:
- [ ] 「Allow customers to update payment methods」がONか

**推奨設定**:
- ON（ユーザーがクレジットカード情報を更新できる）

---

#### リダイレクトURL
**セクション**: "Business information"

**確認項目**:
- [ ] "Default return URL"が設定されているか

**設定値**:
```
http://localhost:5173/subscription
```

**注意**:
- 開発環境: `http://localhost:5173/subscription`
- 本番環境: `https://yourdomain.com/subscription`
- 環境ごとに設定が必要

---

## ✅ 設定確認チェックリスト

### 必須項目
- [ ] Customer Portalが有効化されている
- [ ] プラン変更機能（Subscription changes）がON
- [ ] 日割り計算（Proration）が有効
- [ ] Standard/Feedbackプランが表示される
- [ ] 1ヶ月/3ヶ月の価格が両方表示される
- [ ] リダイレクトURLが設定されている

### 推奨項目
- [ ] キャンセル機能がON
- [ ] 支払い方法の更新がON

---

## 🧪 動作確認方法

### テスト手順

1. **既存契約者でログイン**
   - メールアドレス: `takumi.kai.skywalker@gmail.com`
   - パスワード: （既存のパスワード）

2. **`/subscription`ページにアクセス**

3. **別のプランを選択**
   - 現在: Standard 1ヶ月
   - 選択: Feedback 1ヶ月

4. **「このプランに変更」ボタンをクリック**

5. **Customer Portalに遷移することを確認**
   - URLが `https://billing.stripe.com/session/...` になる
   - Stripe提供のUIが表示される

6. **Customer Portal内で確認**
   - [ ] 現在のプラン（Standard 1ヶ月）が表示される
   - [ ] 「Update plan」または「Change plan」ボタンがある
   - [ ] クリックすると利用可能なプランが表示される
   - [ ] Standard/Feedbackプランが両方表示される
   - [ ] 1ヶ月/3ヶ月の価格が表示される

7. **プラン変更を実行**
   - Feedback 1ヶ月を選択
   - 日割り計算後の金額が表示される
   - 「変更する」ボタンをクリック
   - `/subscription`ページに戻る

8. **変更が反映されているか確認**
   - `/account`ページで新しいプラン（Feedback）が表示される
   - データベースの`user_subscriptions`テーブルを確認
   - `plan_type`が`feedback`に更新されている

---

## ⚠️ よくある問題

### 問題1: Customer Portalにアクセスできない

**症状**:
- 「Stripe顧客情報が見つかりません」エラー
- 404エラー

**原因**:
- `stripe_customers`テーブルにユーザーのレコードがない
- Stripe Customer IDが正しくない

**解決方法**:
1. データベースを確認:
```sql
SELECT * FROM stripe_customers WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a';
```
2. レコードがない場合は、一度新規登録（チェックアウト）を実行
3. チェックアウト完了後、`stripe_customers`テーブルにレコードが作成される

---

### 問題2: プラン変更のオプションが表示されない

**症状**:
- Customer Portalで「Update plan」ボタンがない
- プランのリストが表示されない

**原因**:
- Stripeダッシュボードでプランが設定されていない
- "Subscription changes"が無効

**解決方法**:
1. https://dashboard.stripe.com/test/settings/billing/portal を開く
2. "Subscription changes"をON
3. "Products"で表示するプランを選択
4. 保存

---

### 問題3: 日割り計算が適用されない

**症状**:
- プラン変更時に全額請求される
- クレジットが付与されない

**原因**:
- Proration behaviorが無効

**解決方法**:
1. "Subscription changes"セクションを開く
2. "Proration behavior"を"Create prorations"に設定
3. 保存

---

## 📋 設定後の確認

### データベースの確認

**テーブル**: `user_subscriptions`

```sql
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  stripe_subscription_id,
  updated_at
FROM user_subscriptions
WHERE user_id = '71136a45-a876-48fa-a16a-79b031226b8a';
```

**期待される結果**:
- `plan_type`: 変更後のプラン（例: `feedback`）
- `is_active`: `true`
- `updated_at`: 最近の日時

---

### Stripe Webhookの確認

**URL**: https://dashboard.stripe.com/test/webhooks

**確認項目**:
- [ ] `customer.subscription.updated`イベントが発火している
- [ ] ステータスが200 OK
- [ ] リクエスト/レスポンスを確認

**イベント内容**:
```json
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "id": "sub_xxx",
      "customer": "cus_xxx",
      "items": {
        "data": [{
          "price": {
            "id": "price_xxx",
            "unit_amount": 1480
          }
        }]
      }
    }
  }
}
```

---

## 🎯 完了条件

- [ ] Customer Portalが正常に表示される
- [ ] プラン変更のオプションが表示される
- [ ] 日割り計算が正しく適用される
- [ ] 変更後に`/subscription`ページに戻る
- [ ] データベースが正しく更新される
- [ ] Webhookイベントが正常に処理される

---

**作成日**: 2025-11-17
**更新日**: 2025-11-17
