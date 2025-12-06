# プラン表示不一致問題 - 徹底調査ドキュメント

**作成日**: 2025-11-17
**問題**: Webhookが実行されるが、plan_typeが常に`community`になる

---

## 📋 問題の詳細

### 現象

**テスト実行**: フィードバック 1ヶ月 → スタンダード 3ヶ月に変更

**結果**:
- ✅ Stripe: 変更成功（スタンダード 3ヶ月）
- ❌ データベース: `plan_type: community`, `duration: 3`
- ⚠️ `updated_at`: `2025-11-17 23:58:23` ← Webhookは実行された

### 問題の核心

**Webhookは実行されているが、plan_typeの判定が失敗している**

→ `handleSubscriptionUpdated`関数のelseブロックに入っている
→ `console.warn(\`未知のPrice ID: ${priceId}\`)`が実行されている可能性

---

## 🔍 調査ステップ

### ステップ1: Stripe Webhookイベントログの詳細確認

**実施内容**:
1. Stripeダッシュボード → Webhooks → Events
2. 最新の`customer.subscription.updated`イベント（23:58頃）をクリック
3. 以下を確認:

#### A. Request Body（Stripeが送信したデータ）

確認項目:
```json
{
  "type": "customer.subscription.updated",
  "data": {
    "object": {
      "items": {
        "data": [{
          "price": {
            "id": "price_??????",  // ← この値をコピー
            "unit_amount": ??????   // ← この値をコピー
          }
        }]
      }
    }
  }
}
```

**記録**:
- `price.id`:
- `unit_amount`:

#### B. Response（Edge Functionのログ）

確認項目:
- ステータスコード: 200 OK?
- ログ出力:
  - `プラン変更情報: { subscriptionId, userId, priceId, amount }`
  - `判定結果: { planType, duration, matchedPriceId }`
  - `未知のPrice ID` という警告が出ていないか

**記録**:
- ステータス:
- ログ内容:

---

### ステップ2: Supabase Edge Functionのログ確認

**実施内容**:
1. Supabase Dashboard → Functions → stripe-webhook
2. 「Logs」タブを開く
3. 23:58頃のログを確認

**確認項目**:
- `プラン変更情報`のログ
- `判定結果`のログ
- `未知のPrice ID`の警告
- `user_subscriptions更新エラー`のログ

**記録**:
```
[ここにログをコピペ]
```

---

### ステップ3: 環境変数の実際の値を確認

**問題**: Supabase Secretsのハッシュではなく、**実際の値**が必要

**実施方法A: Supabase Dashboard経由**
1. https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/settings/vault/secrets
2. `STRIPE_TEST_STANDARD_3M_PRICE_ID`を検索
3. 値を確認（マスクされている場合は「Show」をクリック）

**記録**:
- `STRIPE_TEST_STANDARD_1M_PRICE_ID`:
- `STRIPE_TEST_STANDARD_3M_PRICE_ID`:
- `STRIPE_TEST_FEEDBACK_1M_PRICE_ID`:
- `STRIPE_TEST_FEEDBACK_3M_PRICE_ID`:

**実施方法B: 一時的なログ出力**

Edge Functionに一時的にログを追加してデプロイ:

```typescript
// stripe-webhook/index.ts の handleSubscriptionUpdated 内
console.log("環境変数チェック:", {
  STANDARD_1M,
  STANDARD_3M,
  FEEDBACK_1M,
  FEEDBACK_3M,
  actual_priceId: priceId
});
```

---

### ステップ4: .envファイルとの照合

**ローカル環境変数**（`.env`ファイル）:
```
VITE_STRIPE_STANDARD_1M_PRICE_ID=price_1OIiOUKUVUnt8GtyOfXEoEvW
VITE_STRIPE_STANDARD_3M_PRICE_ID=price_1OIiPpKUVUnt8Gty0OH3Pyip
VITE_STRIPE_FEEDBACK_1M_PRICE_ID=price_1OIiMRKUVUnt8GtyMGSJIH8H
VITE_STRIPE_FEEDBACK_3M_PRICE_ID=price_1OIiMRKUVUnt8GtyttXJ71Hz
```

**Supabase Secrets**（Edge Function用）:
- これらが一致しているか確認
- **重要**: Edge FunctionはVITE_プレフィックスなしの変数名を使用

**確認結果**:
- [ ] ローカルとSupabaseで値が一致している
- [ ] Price IDのフォーマットが正しい（`price_`で始まる）

---

### ステップ5: Stripe Productsの実際の設定を確認

**実施内容**:
1. Stripeダッシュボード → Products
2. 「スタンダードプラン」をクリック
3. 「Prices」セクションで各Price IDを確認

**記録**:

#### スタンダードプラン
- 1ヶ月:
  - Amount:
  - Price ID:
  - Recurring: monthly?
- 3ヶ月:
  - Amount:
  - Price ID:
  - Recurring: every 3 months?

#### グロースプラン（= フィードバック）
- 1ヶ月:
  - Amount:
  - Price ID:
  - Recurring: monthly?
- 3ヶ月:
  - Amount:
  - Price ID:
  - Recurring: every 3 months?

---

### ステップ6: データフロー全体の追跡

**プラン変更の完全なフロー**:

```
1. ユーザーが/subscriptionで「スタンダード 3ヶ月」を選択
   ↓
2. Customer Portalに遷移（ディープリンク）
   ↓
3. Customer Portal内でスタンダード 3ヶ月を選択
   ↓
4. Stripeがサブスクリプションを更新
   - 使用されたPrice ID: [ここに記録]
   ↓
5. Stripe Webhookイベント発火: customer.subscription.updated
   - event.data.object.items.data[0].price.id: [ここに記録]
   ↓
6. Supabase Edge Function: stripe-webhook が受信
   - 受信したpriceId: [ここに記録]
   ↓
7. handleSubscriptionUpdated 関数実行
   - 環境変数STANDARD_3M: [ここに記録]
   - priceId === STANDARD_3M? [true/false]
   ↓
8. データベース更新
   - 設定されたplan_type: [ここに記録]
   - 設定されたduration: [ここに記録]
```

**各ステップで値を記録**:
- ステップ4:
- ステップ5:
- ステップ6:
- ステップ7:
- ステップ8:

---

## 🔬 より深い調査項目

### 調査A: Edge Functionのデプロイ状態

**確認内容**:
- 最新のコード変更が実際にデプロイされているか
- デプロイ時刻とテスト実行時刻の比較

**実施方法**:
```bash
# デプロイ履歴を確認
npx supabase functions list
```

**記録**:
- stripe-webhook のデプロイ日時:
- テスト実行日時: 23:58
- デプロイ後にテストした? [yes/no]

---

### 調査B: Webhook エンドポイントの設定

**確認内容**:
- Stripe Webhookエンドポイントが正しいURLを指しているか
- 署名検証が成功しているか

**実施方法**:
1. Stripeダッシュボード → Webhooks
2. エンドポイントをクリック
3. URL、署名シークレット、イベントを確認

**記録**:
- Endpoint URL:
- Listening events: customer.subscription.updated が含まれているか
- Status: Active?

---

### 調査C: 複数のWebhookエンドポイントの存在

**確認内容**:
- 複数のWebhookエンドポイントが設定されていないか
- 古いエンドポイントが残っていないか

**実施方法**:
Stripeダッシュボード → Webhooks → すべてのエンドポイントをリスト

**記録**:
- エンドポイント数:
- 各エンドポイントのURL:
- どれがアクティブか:

---

### 調査D: Metadataの確認

**確認内容**:
- サブスクリプションのMetadataに`plan_type`が設定されているか
- Metadata経由での判定も可能か

**実施方法**:
Stripeダッシュボード → Subscriptions → 現在のサブスクリプション → Metadata

**記録**:
- Metadata:

---

## 🎯 仮説と検証

### 仮説1: 環境変数の名前が間違っている

**仮説**:
- コードでは`STRIPE_TEST_STANDARD_3M_PRICE_ID`を参照
- でも実際の環境変数名は`STRIPE_STANDARD_3M_PRICE_ID`（TESTなし）

**検証方法**:
- ステップ3の環境変数確認で判明

**結果**:
- [ ] 仮説正しい
- [ ] 仮説誤り

---

### 仮説2: Price IDの値が間違っている

**仮説**:
- Supabase Secretsに設定されているPrice IDが古い
- または間違った値が設定されている

**検証方法**:
- ステップ3と5を照合

**結果**:
- [ ] 仮説正しい
- [ ] 仮説誤り

---

### 仮説3: Webhookの処理順序の問題

**仮説**:
- 複数のWebhookイベントが同時発火
- `invoice.paid`など別のイベントが後から実行され、plan_typeを上書き

**検証方法**:
- Stripe Webhookイベントログで、23:58頃に複数イベントがないか確認

**結果**:
- [ ] 仮説正しい
- [ ] 仮説誤り

---

### 仮説4: Edge Functionのキャッシュ問題

**仮説**:
- 古いバージョンのEdge Functionが実行されている
- デプロイが正しく反映されていない

**検証方法**:
- 調査Aで確認
- または、コードに一時的なログを追加して再デプロイ

**結果**:
- [ ] 仮説正しい
- [ ] 仮説誤り

---

### 仮説5: Price IDの比較ロジックの問題

**仮説**:
- `priceId === STANDARD_3M`の比較が失敗している
- 文字列の前後に空白や特殊文字が含まれている

**検証方法**:
```typescript
// 一時的なログ追加
console.log("比較詳細:", {
  priceId_length: priceId.length,
  STANDARD_3M_length: STANDARD_3M?.length,
  priceId_trimmed: priceId.trim(),
  STANDARD_3M_trimmed: STANDARD_3M?.trim(),
  exact_match: priceId === STANDARD_3M,
  trimmed_match: priceId.trim() === STANDARD_3M?.trim()
});
```

**結果**:
- [ ] 仮説正しい
- [ ] 仮説誤り

---

## 📝 次のアクション

### 即座に実施すべきこと

1. **Stripe Webhookイベントログを確認**（ステップ1）
   - 実際のPrice IDを取得
   - Edge Functionのレスポンスログを確認

2. **Supabase Edge Functionログを確認**（ステップ2）
   - 詳細なエラーやログを確認

3. **一時的なデバッグログを追加**
   ```typescript
   // stripe-webhook/index.ts の handleSubscriptionUpdated 内
   console.log("=== デバッグ開始 ===");
   console.log("受信したpriceId:", priceId);
   console.log("環境変数:", {
     STANDARD_1M,
     STANDARD_3M,
     FEEDBACK_1M,
     FEEDBACK_3M
   });
   console.log("比較結果:", {
     is_STANDARD_1M: priceId === STANDARD_1M,
     is_STANDARD_3M: priceId === STANDARD_3M,
     is_FEEDBACK_1M: priceId === FEEDBACK_1M,
     is_FEEDBACK_3M: priceId === FEEDBACK_3M
   });
   console.log("=== デバッグ終了 ===");
   ```

4. **再デプロイしてテスト**
   ```bash
   npx supabase functions deploy stripe-webhook --no-verify-jwt
   ```

5. **もう一度プラン変更をテスト**

---

## 🔄 調査の優先順位

### 優先度: 高（即座に実施）

- [ ] ステップ1: Stripe Webhookイベントログ
- [ ] ステップ2: Supabase Edge Functionログ
- [ ] デバッグログ追加 → 再デプロイ → 再テスト

### 優先度: 中（高が完了後）

- [ ] ステップ3: 環境変数の実際の値
- [ ] ステップ5: Stripe Productsの設定
- [ ] 調査A: デプロイ状態

### 優先度: 低（必要に応じて）

- [ ] ステップ6: データフロー全体追跡
- [ ] 調査B: Webhookエンドポイント
- [ ] 調査C: 複数Webhook
- [ ] 調査D: Metadata

---

## 📊 調査結果の記録

### 実施日時

**開始**: 2025-11-17 23:58（問題発生時）
**調査開始**: 2025-11-18 00:10

### 発見事項

#### 発見1:
**内容**:

**影響**:

**対応**:

#### 発見2:
**内容**:

**影響**:

**対応**:

---

## ✅ 解決策（判明次第記載）

### 根本原因

**特定した原因**:

### 修正内容

**ファイル**:

**変更箇所**:

**修正理由**:

### 検証結果

**テスト日時**:

**結果**:
- [ ] 成功
- [ ] 失敗

---

**作成者**: Claude Code
**最終更新**: 2025-11-17
