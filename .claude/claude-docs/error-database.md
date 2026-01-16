# エラーデータベース

**最終更新**: 2025-01-16

---

## 🎯 このドキュメントの目的

発生したすべてのエラーと解決策を記録し、同じエラーに遭遇した際に即座に解決できるようにする。

**ルール**:
- エラーに遭遇したら**必ず**このドキュメントに追加
- 解決した方法も**必ず**記録
- 他の人が再現できるように具体的に書く

---

## 📋 エラー記録テンプレート

各エラーは以下の形式で記録してください：

```markdown
### [ERROR-XXX] エラーのタイトル

**発生日**: YYYY-MM-DD
**頻度**: 初回 / 複数回発生
**深刻度**: 🔴 Critical / 🟡 Warning / 🟢 Info

**エラーメッセージ**:
\`\`\`
エラーメッセージをそのまま記載
\`\`\`

**発生条件**:
- どういう操作をした時に発生したか
- 再現手順

**原因**:
なぜこのエラーが発生したか

**解決方法**:
1. ステップ1
2. ステップ2
3. ステップ3

**参考資料**:
- [関連ドキュメント](path/to/doc.md)
- [外部リソース](https://example.com)

**関連する実装計画**:
- [実装計画](../implementation-plans/YYYY-MM-DD-plan-name.md)
```

---

## 🔴 Critical Errors

### [ERROR-001] create-checkout Edge Function 500 Error

**発生日**: 2025-11-28
**頻度**: 複数回発生
**深刻度**: 🔴 Critical

**エラーメッセージ**:
```
Error invoking function create-checkout:
FunctionsHttpError: Edge Function returned a non-2xx status code
Status: 500 Internal Server Error
```

**発生条件**:
- プレミアムプランの「このプランを選択」ボタンをクリック
- `POST /api/subscription/create-checkout`を実行

**原因**:
（調査中）

**試したこと**:
1. Edge Functionのログ確認 → 詳細なエラーログが見つからない
2. 環境変数の確認 → 設定済み
3. Stripe APIキーの確認 → 有効

**次にやること**:
1. Edge Function内のconsole.logを追加してデバッグ
2. try-catchブロックでエラーの詳細をキャッチ
3. Supabaseのログを詳細に確認

**参考資料**:
- [Supabase Edge Functions ドキュメント](https://supabase.com/docs/guides/functions)
- [実装計画](../implementation-plans/2025-11-28-create-checkout-debug.md)

---

### [ERROR-002] get-plan-prices Edge Function 500 Error（解決済み）

**発生日**: 2025-01-13
**頻度**: 複数回発生（Edge Function障害時）
**深刻度**: 🔴 Critical → ✅ 解決済み

**エラーメッセージ**:
```
FunctionsHttpError: Edge Function returned a non-2xx status code
Status: 500 Internal Server Error
Path: /functions/v1/get-plan-prices
```

**発生条件**:
- サブスクリプションページ（/subscription）にアクセス
- Edge Function `get-plan-prices` がStripe APIに接続できない時
- ローカル開発環境でEdge FunctionがStripeに到達できない時

**原因**:
`src/services/pricing.ts` にフォールバック機構がなかった。
Edge Functionが失敗した場合、エラーがそのままユーザーに表示されていた。

**同様のフォールバック機構があった機能**:
- `check-subscription` Edge Function → `user_subscriptions`テーブルから直接取得するフォールバックあり

**なぜ pricing.ts には無かったか**:
- 当初はEdge Functionの信頼性を前提として設計
- 価格情報の取得は比較的シンプルと考えられていた
- check-subscriptionのフォールバックパターンが共有されていなかった

**解決方法**:
`src/services/pricing.ts` に3段階フォールバック機構を実装

1. **Edge Function呼び出し**（第1段階）
   - 正常ケース: Stripeから最新価格を取得

2. **DBフォールバック**（第2段階 - 新規追加）
   - `price_cache`テーブルから価格を取得
   - 環境に応じて`live`/`test`を切り替え
   ```typescript
   const isProduction = import.meta.env.PROD;
   const environment = isProduction ? 'live' : 'test';
   const { data } = await supabase
     .from('price_cache')
     .select('*')
     .eq('environment', environment);
   ```

3. **ハードコードフォールバック**（第3段階 - 新規追加）
   - 本番環境の価格をハードコード
   - price_cacheテーブルの値と同期させる必要あり
   ```typescript
   const livePrices: PlanPrices = {
     standard_1m: { id: 'price_1RStBiKUVUnt8GtynMfKweby', unit_amount: 6800, ... },
     standard_3m: { id: 'price_1RStCiKUVUnt8GtyKJiieo6d', unit_amount: 17400, ... },
     feedback_1m: { id: 'price_1RStgOKUVUnt8GtyVPVelPg3', unit_amount: 15800, ... },
     feedback_3m: { id: 'price_1RSuB1KUVUnt8GtyAwgTK4Cp', unit_amount: 41400, ... },
   };
   ```

**再発防止策**:
1. **課金関連API呼び出しには必ずフォールバック機構を実装**
2. **Stripe価格変更時は`pricing.ts`のハードコード値も更新**
3. **ローカル開発でもサブスクリプション画面が表示できることを確認**

**参考資料**:
- [pricing.ts](../../src/services/pricing.ts) - 修正済みのコード
- [price_cache テーブル](価格キャッシュ用テーブル)

---

## 🟡 Warning Errors

### [ERROR-101] エラータイトル

（同じ形式で追加していく）

---

## 🟢 Info / 解決済み

### [ERROR-201] Stripe Webhook署名検証エラー（解決済み）

**発生日**: 2025-11-XX
**頻度**: 初回
**深刻度**: 🟡 Warning → ✅ 解決済み

**エラーメッセージ**:
```
Webhook signature verification failed
```

**発生条件**:
- Stripeからwebhookを受信した時
- ローカル開発環境

**原因**:
`STRIPE_WEBHOOK_SECRET`が設定されていなかった

**解決方法**:
1. Stripe CLIを起動
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```
2. 表示された`whsec_`で始まるキーをコピー
3. `.env.local`に追加
   ```env
   STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```
4. サーバーを再起動

**参考資料**:
- [環境変数定義](../../project-knowledge/environment-variables.md#stripe-webhook-secret)

---

## 🔍 エラーの検索方法

### エラーメッセージで検索
このファイル内を`Ctrl+F`で検索してください

### カテゴリで検索
- Critical: `### [ERROR-0`
- Warning: `### [ERROR-1`
- Info: `### [ERROR-2`

---

## 📝 新しいエラーを追加する際のルール

1. **エラー番号を採番**
   - Critical: ERROR-001〜099
   - Warning: ERROR-101〜199
   - Info: ERROR-201〜299

2. **必ず記載する項目**
   - エラーメッセージ（そのままコピペ）
   - 発生条件（再現手順）
   - 試したこと（失敗したことも含めて）

3. **解決したら**
   - 解決方法を詳細に記載
   - 該当セクションを「解決済み」に移動
   - タイトルに「（解決済み）」を追加

4. **関連ドキュメントへのリンク**
   - 実装計画
   - 環境変数定義
   - 外部リソース

---

## 🔄 このドキュメントの更新タイミング

- **エラー発生時**: 即座に追加（解決方法は空でもOK）
- **解決時**: 解決方法を詳細に記載
- **定期的**: 古いエラーを整理・アーカイブ

**エラーに遭遇したら、まずこのドキュメントを検索してください。**
**同じエラーの解決策がすでにあるかもしれません。**
