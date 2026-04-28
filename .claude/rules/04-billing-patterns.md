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

## チェックリスト（課金機能の実装時）

- [ ] Edge Function 失敗時のフォールバックがあるか
- [ ] ローカル環境（Edge Function なし）でも動作するか
- [ ] テスト環境で確認後に本番デプロイしたか
