# Deep Link無効化 - 根本原因分析（2025-11-28）

## 概要

Test 2B（プラン変更：Standard → Feedback）で、Checkout画面が「新規登録」として表示され、プロレーション（差額計算）が表示されない問題が発生。

調査の結果、**2025-11-28 09:08（コミット 78b96c1）にDeep Link機能が意図的に無効化されていた**ことが判明。

---

## タイムライン

| 日付 | 時刻 | コミット | 内容 | 影響 |
|------|------|---------|------|------|
| 2025-11-27以前 | - | - | Deep Link機能が有効 | プラン変更時にCustomer Portalでプロレーション表示 |
| 2025-11-28 | 09:08 | 78b96c1 | **Deep Link無効化** | ❌ プラン変更がCheckoutに変更（新規登録扱い） |
| 2025-11-28 | 11:28 | - | Test 2B実施 | ❌ Checkout画面で「Subscribe to グロースプラン」表示 |

---

## 根本原因

### 1. **Deep Link二重課金問題の発覚**

**コミット 78b96c1 のメッセージより**:
```
✨ Option 3実装: Stripe Checkoutでプラン変更

Deep Link問題（二重課金）を解決するため、プラン変更をStripe Checkoutで実装:
...
関連: Error Case 2 (Deep Link二重課金問題)
```

**Error Case 2の詳細**:
- **テストケース**: Test 3A - Standard 1ヶ月→3ヶ月
- **問題**: Deep Link使用時に二重課金が発生
  - Stripeに2つのアクティブなサブスクリプション
  - 旧サブスク（1ヶ月）がキャンセルされず
  - 新サブスク（3ヶ月）が作成された

**原因**:
> Stripe Customer Portalの`subscription_update_confirm` flow_dataは、既存サブスクリプションの更新を保証しない。
> ユーザーの操作によって「新規作成」される可能性がある。

---

### 2. **Option 3への切り替え決定**

**Option 3の実装内容**:

#### バックエンド変更（create-customer-portal/index.ts）
```diff
- // Deep Link モードかどうかを判定
- const isDeepLinkMode = !!(planType && duration);
+ // Deep Link モードを無効化（Option 3実装により使用しない）
+ // プラン変更は /subscription ページから create-checkout を使用
+ const isDeepLinkMode = false;
```

#### フロントエンド変更（src/pages/Subscription.tsx）
```diff
- import { createCheckoutSession, getCustomerPortalUrl } from '@/services/stripe';
+ import { createCheckoutSession } from '@/services/stripe';

  // 既存契約者かどうかで分岐
  if (isSubscribed) {
-   // Deep Link モード: 選択されたプラン情報を渡す
-   const portalUrl = await getCustomerPortalUrl(returnUrl, selectedPlanType, selectedDuration);
+   // Success URLに ?updated=true を追加（プラン変更完了を示す）
+   const returnUrl = window.location.origin + '/subscription?updated=true';
+   const { url, error } = await createCheckoutSession(returnUrl, selectedPlanType, selectedDuration);
```

---

### 3. **Option 3の安全性の根拠**

コミットメッセージには「プロレーション表示あり（Checkout画面）」と記載されていたが、**これは誤り**だった。

**実際の挙動**:
- `create-checkout/index.ts` は常に `mode: "subscription"` で新規Checkoutを作成
- 既存サブスクのキャンセルは `metadata.replace_subscription_id` に記録され、**Webhook経由で後処理**
- Checkout画面では「新規登録」として表示される
- **プロレーションは表示されない**

**コードの証拠（create-checkout/index.ts:180-209）**:
```typescript
// 既存サブスクリプションIDをmetadataに追加（Webhookでキャンセルするため）
// これにより、Checkout完了「後」に既存サブスクがキャンセルされる
// ユーザーがCheckout画面で離脱しても既存サブスクは残るため安全
if (activeSubscriptions.length > 0) {
  sessionMetadata.replace_subscription_id = activeSubscriptions[0].stripe_subscription_id;
}

// セッション設定オブジェクト
const sessionConfig: any = {
  customer: stripeCustomerId,
  payment_method_types: ["card"],
  line_items: [
    {
      price: priceId,
      quantity: 1,
    },
  ],
  mode: "subscription",  // ← 常に新規登録モード
  success_url: `${returnUrl}?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: cancelUrl,
  metadata: sessionMetadata,
};
```

---

## なぜこの問題が起こったのか

### 1. **誤った前提: Option 3はプロレーションを表示する**

**コミットメッセージ（78b96c1）の記載**:
```
## 安全性
- ✅ 二重課金防止: create-checkoutの既存ロジック活用 (Line 194-289)
- ✅ Fail-Safe設計: キャンセル失敗時はCheckout作成しない
- ✅ 顧客ID検証済み
- ✅ プロレーション表示あり（Checkout画面）  ← ❌ これは誤り
```

**実際**:
- Stripe Checkoutの `mode: "subscription"` は**新規サブスクリプション専用**
- 既存サブスクの更新には `mode: "subscription_update"` が必要（但し、これはCheckout Sessionでは使用不可）
- プロレーション表示は **Customer Portal** または **Subscription Update API** でのみ可能

---

### 2. **二重課金防止 vs ユーザー体験のトレードオフ**

| 要件 | Deep Link | Option 3 (現状) |
|------|-----------|----------------|
| **二重課金防止** | ❌ 不完全（Stripe任せ） | ✅ 完全（明示的キャンセル） |
| **プロレーション表示** | ✅ 表示される | ❌ 表示されない |
| **ユーザー確認** | ✅ 差額を確認できる | ❌ 「新規登録」に見える |

**判断基準**:
- 当時は「二重課金防止」を最優先事項として、Deep Linkを無効化した
- しかし、**ユーザーが差額を確認できない**という重大な問題が見過ごされた

---

### 3. **Test 3Aで発覚したが、Test 2Bで発覚しなかった理由**

**推測**:
- Test 3A（Standard 1ヶ月→3ヶ月）では二重課金が発生し、すぐに問題が発覚
- しかし、Test 2B（Standard → Feedback）では実施されていなかった可能性
- または、Test 2Bでも「新規登録」表示だったが、プロレーション表示の重要性が認識されていなかった

---

## なぜDeep Linkが実装できなくなったのか

### 誤解: Deep Linkは完全に使えない

**実際**:
- Deep Link自体は**正常に動作する機能**
- 問題は「**Stripe Customer Portalが更新を保証しない**」という仕様上の制約

### 正しい理解: Deep Linkは条件付きで使用可能

**Deep Linkが安全に使える条件**:
1. ✅ プロレーション表示が必要
2. ✅ ユーザーに差額を確認させたい
3. ⚠️ 二重課金リスクを**Webhook + 手動確認**で管理する覚悟がある

**Deep Linkが使えない条件**:
1. ❌ 二重課金リスクを完全にゼロにしたい
2. ❌ 自動的な整合性保証が必須

---

## 正しい解決策

### Option 2（修正版）: Deep Link + 安全性強化

**アプローチ**:
1. ✅ Deep Linkを再度有効化（プロレーション表示のため）
2. ✅ Webhookで二重課金を検知・自動修正
3. ✅ 管理画面で異常を通知

**実装**:

#### 1. create-customer-portal/index.ts
```typescript
// Line 55を修正
const isDeepLinkMode = !!(planType && duration);  // 再度有効化
```

#### 2. stripe-webhook/index.ts（強化）
```typescript
// checkout.session.completed イベント
if (event.type === 'checkout.session.completed') {
  const session = event.data.object;

  // 1. 顧客の全サブスクリプションを取得
  const subscriptions = await stripe.subscriptions.list({
    customer: session.customer,
    status: 'active',
  });

  // 2. アクティブなサブスクが2つ以上 = 二重課金
  if (subscriptions.data.length > 1) {
    console.error('⚠️ 二重課金検知:', {
      customer: session.customer,
      subscriptions: subscriptions.data.map(s => s.id),
    });

    // 3. 古いサブスクを自動キャンセル
    const oldestSub = subscriptions.data.sort((a, b) => a.created - b.created)[0];
    await stripe.subscriptions.cancel(oldestSub.id, {
      prorate: true,
    });

    console.log('✅ 古いサブスクを自動キャンセル:', oldestSub.id);
  }
}
```

#### 3. src/pages/Subscription.tsx
```typescript
// 既存契約者の場合、Customer Portalに戻す
if (isSubscribed) {
  const returnUrl = window.location.origin + '/subscription?updated=true';
  const portalUrl = await getCustomerPortalUrl(returnUrl, selectedPlanType, selectedDuration);

  if (portalUrl) {
    window.location.href = portalUrl;
  }
}
```

---

## 再発防止策

### 1. **二択の決断ルール**

プラン変更の実装では、以下の2つから選ぶ：

| オプション | プロレーション表示 | 二重課金防止 | 推奨ケース |
|-----------|------------------|-------------|-----------|
| **Deep Link** | ✅ あり | ⚠️ Webhook + 監視 | ユーザー体験優先 |
| **Option 3** | ❌ なし | ✅ 完全 | 安全性優先 |

**決定基準**:
- ユーザーが差額を確認できることが**必須要件**なら → **Deep Link**
- 二重課金を技術的に完全防止することが**必須要件**なら → **Option 3**

---

### 2. **テストケースの強化**

#### Test 2B: プラン変更（Standard → Feedback）

**チェック項目**:
- [ ] Checkout/Portal画面の表示内容
  - [ ] 「新規登録」ではなく「プラン変更」と表示される
  - [ ] プロレーション（差額）が表示される
  - [ ] 次回請求額が表示される
- [ ] 決済完了後
  - [ ] 旧サブスクがキャンセルされている
  - [ ] 新サブスクのみアクティブ
  - [ ] Stripe Dashboardで二重課金が発生していない

---

### 3. **ドキュメント整備**

#### `.claude/docs/subscription/plans/plan-change-options.md` を作成

**内容**:
- Option 1: Subscription Update API（直接更新）
- Option 2: Customer Portal + Deep Link（プロレーション表示）
- Option 3: Checkout + Webhook（二重課金完全防止）

各オプションの**メリット・デメリット・推奨ケース**を明記。

---

### 4. **開発チェックリスト更新**

`.claude/docs/subscription/development-checklist.md` に追加:

#### プラン変更実装時の確認項目

- [ ] **ユーザー要件確認**
  - [ ] プロレーション表示は必須か？
  - [ ] 二重課金の完全防止は必須か？
- [ ] **実装方式の決定**
  - [ ] Deep Link vs Option 3 のどちらを選ぶか明確化
  - [ ] 選択理由をドキュメント化
- [ ] **テスト実施**
  - [ ] Checkout/Portal画面で表示内容を確認
  - [ ] 決済完了後、Stripe Dashboardで二重課金チェック
  - [ ] データベースの整合性確認

---

## 学んだ教訓

### 1. **「安全性」と「ユーザー体験」は両立しない場合がある**

- 二重課金防止を完全にすると、プロレーション表示ができなくなる
- どちらを優先するかは**ユーザー要件次第**
- 両方を完璧にしようとすると、無理な実装になる

### 2. **コミットメッセージの「プロレーション表示あり」は確認不足**

- コードレビューで実際のStripe Checkout動作を確認すべきだった
- `mode: "subscription"` は新規登録専用であることを見落とした

### 3. **テストケースでUIの表示内容を明示的にチェックすべき**

- データベースが正しくても、ユーザーが見る画面が間違っていれば意味がない
- Test 2Bで「Checkout画面の表示」を確認項目に入れるべきだった

### 4. **過去の実装を「無効化」する時は、理由を必ずドキュメント化**

- Deep Link無効化の理由（Error Case 2）はドキュメントに記載されていた
- しかし、**「プロレーション表示ができなくなる」というトレードオフ**が明記されていなかった

---

## 今後のアクション

### 即時対応（今回のTest 2B修正）

1. ✅ 根本原因分析完了（本ドキュメント）
2. ⏸️ ユーザーに方針確認
   - Deep Link再有効化（プロレーション表示優先）
   - Option 3継続（二重課金防止優先）
3. ⏸️ 選択した方針に基づき実装
4. ⏸️ Test 2B再実行

### 中長期対応

1. ⏸️ `.claude/docs/subscription/plans/plan-change-options.md` 作成
2. ⏸️ `development-checklist.md` 更新
3. ⏸️ Webhook二重課金検知機能の実装（Deep Link選択時）

---

**作成日**: 2025-11-28
**作成者**: Claude (AI Assistant)
**関連コミット**: 78b96c1
**関連ドキュメント**:
- `.claude/docs/subscription/plans/plan-change-option3-implementation.md`
- `.claude/docs/subscription/testing/user-flow-test.md` (Error Case 2)
