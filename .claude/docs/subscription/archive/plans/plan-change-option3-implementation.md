# Option 3実装計画: Stripe Checkoutによるプラン変更

## 📅 作成日: 2025-11-27
## 🎯 目的: Deep Link問題を解決し、安全なプラン変更機能を実装する

---

## 🔍 背景

### 発見された問題（Error Case 2）
- **テストケース**: Test 3A - スタンダード1ヶ月→3ヶ月
- **問題**: Deep Link使用時に二重課金が発生
  - Stripeに2つのアクティブなサブスクリプション
  - 旧サブスク（1ヶ月）がキャンセルされず
  - 新サブスク（3ヶ月）が作成された

### 根本原因
Stripe Customer Portalの`subscription_update_confirm` flow_dataは、既存サブスクリプションの更新を保証しない。
ユーザーの操作によって「新規作成」される可能性がある。

---

## 🛡️ Option 3の安全性

### なぜOption 3が安全なのか

#### 1. **二重課金の完全防止** ✅
```typescript
// create-checkout/index.ts:194-289
// 新しいCheckoutを作成する前に、必ず既存サブスクを全てキャンセル
if (activeSubscriptions.length > 0) {
  for (const existingSub of activeSubscriptions) {
    await stripe.subscriptions.cancel(existingSubscriptionId, {
      prorate: true,  // 日割り返金
    });
  }
}
```

**Deep Linkとの決定的な違い**:
| | Deep Link | Option 3 |
|---|---|---|
| キャンセルタイミング | ❌ Stripe Portal任せ | ✅ Checkout前に明示的に実行 |
| 二重課金リスク | ⚠️ 高い | ✅ **ゼロ** |
| エラー時の挙動 | ❌ 新サブスク作成済み | ✅ Checkout作成を中止 |

#### 2. **Fail-Safe設計** ✅
```typescript
// Line 278-286
catch (cancelError) {
  // キャンセル失敗 = Checkout作成しない
  throw new Error(`既存サブスクリプションのキャンセルに失敗しました`);
}
```

**保証**: 既存サブスクが残っている状態で、新しいCheckoutが作られることは**絶対にない**。

#### 3. **顧客ID検証** ✅
```typescript
// Line 226-233
if (existingSubscription.customer !== stripeCustomerId) {
  throw new Error("サブスクリプション情報に不整合があります");
}
```

他のユーザーのサブスクを誤ってキャンセルしないよう保護。

#### 4. **既存機能の再利用** ✅
- 新規登録で既にテスト済み・本番稼働中
- 実績のあるコード（create-checkout/index.ts）

---

## 📋 実装計画

### Phase 1: フロントエンド修正

#### 1.1 `/subscription`ページの修正

**対象ファイル**: `src/pages/Subscription.tsx` (推定)

**現在の動作**:
```typescript
// プラン変更ボタンクリック時
const handlePlanChange = async (planType, duration) => {
  // Deep Linkを使ってCustomer Portalへ遷移
  const url = await getCustomerPortalUrl(
    `${window.location.origin}/subscription`,
    planType,
    duration
  );
  window.location.href = url;
};
```

**修正後**:
```typescript
// プラン変更ボタンクリック時
const handlePlanChange = async (planType, duration) => {
  try {
    // Stripe Checkoutを使用（既存サブスクは自動キャンセル）
    const { url, error } = await createCheckoutSession(
      `${window.location.origin}/subscription?updated=true`,
      planType,
      duration
    );

    if (error) {
      toast.error(`プラン変更の準備に失敗しました: ${error.message}`);
      return;
    }

    // Checkout画面へ遷移
    window.location.href = url;
  } catch (error) {
    console.error('プラン変更エラー:', error);
    toast.error('プラン変更に失敗しました');
  }
};
```

**変更点**:
- ✅ `getCustomerPortalUrl` → `createCheckoutSession`に変更
- ✅ Success URL: `/subscription?updated=true`（プラン変更完了を示す）
- ✅ Cancel URL: `/subscription`（既に設定済み: create-checkout/index.ts:176）

#### 1.2 Success URL処理の追加

**目的**: プラン変更完了後に成功メッセージを表示

```typescript
// /subscription ページ読み込み時
useEffect(() => {
  const params = new URLSearchParams(window.location.search);

  if (params.get('updated') === 'true') {
    toast.success('プランを変更しました！');
    // URLをクリーンアップ
    window.history.replaceState({}, '', '/subscription');
  }
}, []);
```

#### 1.3 UI文言の調整（オプション）

**検討事項**: ユーザーが「更新」と理解できるようにする

**変更案**:
```tsx
<Button onClick={() => handlePlanChange('standard', 3)}>
  このプランに変更する  {/* 元: このプランを選ぶ */}
</Button>
```

---

### Phase 2: バックエンド確認

#### 2.1 create-checkout Edge Functionの動作確認

**ファイル**: `supabase/functions/create-checkout/index.ts`

**確認項目**:
- ✅ Line 194-289: 既存サブスクキャンセルロジック（実装済み）
- ✅ Line 176: cancel_url設定（実装済み）
- ✅ Line 189: success_url設定（実装済み）

**必要な変更**: なし（既存コードで対応可能）

#### 2.2 Webhook動作確認

**ファイル**: `supabase/functions/stripe-webhook/index.ts` (推定)

**確認項目**:
- `checkout.session.completed`: 新サブスク作成時のDB更新
- `customer.subscription.deleted`: 旧サブスクキャンセル時のDB更新

**必要な変更**: なし（既存Webhookで対応可能）

---

### Phase 3: Customer Portal設定の変更

#### 3.1 Deep Link機能の無効化

**対象ファイル**: `supabase/functions/create-customer-portal/index.ts`

**Option A: Deep Link完全削除** (推奨)
```typescript
// Line 53-54: isDeepLinkModeの判定を削除
const isDeepLinkMode = false;  // 常にfalse
```

**Option B: Deep Linkコード削除**
```typescript
// Line 158-207を削除
// Deep Link関連のコードを完全に削除
```

**推奨**: Option B（将来的な混乱を避けるため）

#### 3.2 Customer Portalの用途変更

**変更後の用途**:
- ✅ サブスクリプションのキャンセル
- ✅ 支払い方法の変更
- ✅ 請求履歴の確認
- ❌ プラン変更（/subscriptionページから行う）

---

## 🧪 テスト計画

### Test 3A-R: スタンダード1ヶ月→3ヶ月（再テスト）

**前提条件**:
- ✅ Option 3実装完了
- ✅ アクティブなスタンダード1ヶ月サブスクが存在

**実行手順**:
1. `/subscription`ページでスタンダード3ヶ月プランを選択
2. 「このプランに変更する」ボタンをクリック
3. **期待**: Stripe Checkout画面に遷移
4. Checkout画面でプロレーション金額を確認:
   ```
   スタンダードプラン (3ヶ月): ¥11,940
   スタンダードプラン (1ヶ月)のクレジット: -¥4,958
   今回のお支払い: ¥6,982
   ```
5. 支払い完了
6. `/subscription?updated=true`にリダイレクト
7. 「プランを変更しました！」トースト表示

**検証項目**:
- [ ] Stripeに**1つだけ**アクティブなサブスク（スタンダード3ヶ月）
- [ ] 旧サブスク（1ヶ月）がキャンセル済み
- [ ] データベース: `is_active=true`のサブスクが1つだけ
- [ ] プロレーション金額が正しい
- [ ] 支払い履歴に日割り返金が記録されている

**期待結果**: ✅ 二重課金なし、プラン変更成功

---

### Test 3B-R: スタンダード3ヶ月→1ヶ月（ダウングレード再テスト）

**前提条件**:
- Test 3A-R完了
- アクティブなスタンダード3ヶ月サブスクが存在

**実行手順**:
1. `/subscription`ページでスタンダード1ヶ月プランを選択
2. Checkout画面でプロレーション確認:
   ```
   スタンダードプラン (1ヶ月): ¥4,980
   スタンダードプラン (3ヶ月)のクレジット: -¥11,940
   今回のお支払い: ¥0 (クレジット残高: ¥6,960)
   ```
3. 支払い完了（即座に完了、カード不要）

**検証項目**:
- [ ] Stripeに**1つだけ**アクティブなサブスク（スタンダード1ヶ月）
- [ ] クレジット残高が正しく計算されている
- [ ] データベース: `plan_type='standard'`, `duration=1`

---

### Test 2C: フィードバックからグロースへ変更

**前提条件**:
- アクティブなコミュニティプランサブスクが存在

**実行手順**:
1. `/subscription`ページでグロースプランを選択
2. Checkout画面でプロレーション確認
3. 支払い完了

**検証項目**:
- [ ] Stripeに**1つだけ**アクティブなサブスク（グロース）
- [ ] 旧サブスク（コミュニティ）がキャンセル済み
- [ ] `hasMemberAccess=true`, `hasLearningAccess=true`

---

## 🚨 潜在的な問題と対策

### 問題1: ユーザーがCheckout画面で離脱

**シナリオ**:
1. 既存サブスクがキャンセルされる
2. ユーザーがCheckout画面を閉じる
3. 支払いが完了しない
4. **結果**: サブスクがなくなる

**対策**:
- ✅ `cancel_url`で`/subscription`に戻す（実装済み）
- ✅ ユーザーは再度プランを選べる
- ✅ UIで警告: 「この操作を中断すると、現在のサブスクリプションがキャンセルされます」（オプション）

**重要度**: 🟡 中（ユーザー教育で対応可能）

---

### 問題2: Webhook遅延

**シナリオ**:
1. 支払い完了 → Success URLにリダイレクト
2. Webhookがまだ到着していない
3. ページに「サブスクなし」と表示

**対策**:
- ✅ `session_id`をSuccess URLに含める（実装済み: line 189）
- ✅ フロントエンドで`session_id`から一時的に状態を取得（オプション）
- ✅ または「処理中...」表示（オプション）

**重要度**: 🟢 低（通常は数秒で完了）

---

### 問題3: キャンセル失敗

**シナリオ**:
1. 既存サブスクのキャンセルに失敗
2. エラーが返される
3. Checkoutが作成されない

**対策**:
- ✅ 既に実装済み（Fail-Safe設計: line 278-286）
- ✅ ユーザーにエラーメッセージ表示
- ✅ 再試行可能

**重要度**: 🟢 低（Fail-Safe設計により安全）

---

## 📊 実装優先度

### Phase 1: 必須（Option 3動作に必要）
- 🔴 **高**: `/subscription`ページの修正（`getCustomerPortalUrl` → `createCheckoutSession`）
- 🔴 **高**: Deep Link機能の無効化（`create-customer-portal/index.ts`）

### Phase 2: 推奨（UX向上）
- 🟡 **中**: Success URL処理（`?updated=true`でトースト表示）
- 🟡 **中**: UI文言の調整（「このプランに変更する」）

### Phase 3: オプション（追加の安全策）
- 🟢 **低**: 離脱警告の追加
- 🟢 **低**: 処理中表示の追加

---

## ✅ 完了条件

### 実装完了
- [ ] `/subscription`ページが`createCheckoutSession`を使用
- [ ] Deep Link機能が無効化されている
- [ ] Success URL処理が実装されている

### テスト完了
- [ ] Test 3A-R: ✅ 二重課金なし
- [ ] Test 3B-R: ✅ ダウングレード成功
- [ ] Test 2C: ✅ プラン種別変更成功

### ドキュメント更新
- [ ] Error Case 2に「解決済み」マークを追加
- [ ] 本計画ファイルに実装結果を記録

---

## 📝 参考資料

### 関連ファイル
- `supabase/functions/create-checkout/index.ts` (Line 194-289: 二重課金防止)
- `supabase/functions/create-customer-portal/index.ts` (Line 158-207: Deep Link削除対象)
- `src/services/stripe.ts` (createCheckoutSession関数)

### 関連ドキュメント
- `.claude/docs/subscription/testing/user-flow-test.md` (Error Case 2)
- `.claude/docs/subscription/README.md` (サブスクリプション仕様)

---

**最終更新**: 2025-11-27
**ステータス**: 📋 実装準備完了
