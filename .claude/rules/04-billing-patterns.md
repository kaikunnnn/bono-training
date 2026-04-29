# 課金・サブスクリプション実装ルール

## 3段階フォールバック（必須）

課金関連の API 呼び出しには必ず以下の3段階フォールバックを実装する:

```typescript
try {
  // 1. Edge Function（第1段階）
  const result = await supabase.functions.invoke('xxx');
  if (result.error) throw result.error;
  return result.data;
} catch (error) {
  try {
    // 2. DB フォールバック（第2段階）
    const dbResult = await fetchFromDatabase();
    if (dbResult) return dbResult;
  } catch (dbError) {
    // 3. ハードコード フォールバック（第3段階）
    return getHardcodedValues();
  }
}
```

対象: `getPlanPrices`, `checkSubscription`, `createCheckout`, `cancelSubscription`

## 価格

- Standard 1ヶ月: 6,800円/月
- Standard 3ヶ月: 5,800円/月
- Feedback 1ヶ月: 15,800円/月
- Feedback 3ヶ月: 13,800円/月

価格変更時は以下を同時更新:
1. `price_cache` テーブル（DB キャッシュ）
2. `src/lib/subscription-utils.ts` の `AVAILABLE_PLANS`
3. `src/lib/services/pricing.ts` のハードコード値

## Stripe 環境

- `STRIPE_MODE` 環境変数で test/live 切替
- `user_subscriptions.environment` カラムで test/live データ分離
- 開発環境: `environment = 'test'` のみ参照
- 本番環境: `environment = 'live'` のみ参照

## Edge Function エラーハンドリング（必須）

Edge Function のエラーレスポンスは必ず詳細パースする。汎用メッセージだけで握りつぶしてはいけない:

```typescript
// ❌ 間違い: エラー詳細を捨てている
if (response.error) {
  throw new Error("決済処理の準備に失敗しました。");
}

// ✅ 正しい: Edge Functionのレスポンスボディからエラー詳細を取得
if (response.error) {
  let errorMessage = "決済処理の準備に失敗しました。";
  if (response.data?.error) {
    errorMessage = response.data.error; // Edge Functionが返した実際のメッセージ
  }
  // response.error.context.body からもパース
  throw new Error(errorMessage);
}
```

参考実装: `src/lib/services/stripe.ts` の `createCheckoutSession`

## Edge Function 呼び出し関数の統一パターン（必須）

`stripe.ts` 内の全ての Edge Function 呼び出し関数に同じエラーパースを適用すること。
1つの関数だけ修正して他を放置してはいけない。

対象: `createCheckoutSession`, `updateSubscription`, `getCustomerPortalUrl`

## テストデータのルール（必須）

**Stripe操作を伴うテストでは、ダミーIDのサブスクリプションを使ってはいけない。**

- ❌ `sub_test_xxx`, `cus_test_xxx` のようなダミーID → Stripe APIで500エラー
- ✅ 実際のStripeチェックアウトで作成されたサブスクリプション → プラン変更・キャンセルが動作する

テストデータは以下の手順で作成する:
1. テストアカウントを作成（Auth API経由）
2. そのアカウントでログイン → `/subscription` → テストカードでチェックアウト
3. これにより実際のStripe subscription IDがDBに記録される
4. この状態でプラン変更・ダウングレード・キャンセルをテスト

**DBに直接サブスクを挿入するのはUI表示確認のみ許可。Stripe操作のテストには使えない。**

## `unit_amount` の注意（必須）

Stripeの `unit_amount` は**プラン期間の合計金額**:
- 1ヶ月プラン: `unit_amount` = 月額（例: 6,800円）
- 3ヶ月プラン: `unit_amount` = 3ヶ月合計（例: 17,400円、月額ではない）

日割り計算では `unit_amount / (30 × duration)` で日割り単価を求めること。

## チェックリスト（課金機能の実装時）

- [ ] Edge Function 失敗時のフォールバックがあるか
- [ ] **全ての** Edge Function 呼び出し関数でエラー詳細パースしているか
- [ ] テストデータはStripeチェックアウト経由で作成したか（ダミーIDではないか）
- [ ] `unit_amount` の扱いで duration を考慮しているか
- [ ] ローカル環境（Supabase Local + Stripe Test）でE2Eテスト済みか
- [ ] テスト環境で確認後に本番デプロイしたか
