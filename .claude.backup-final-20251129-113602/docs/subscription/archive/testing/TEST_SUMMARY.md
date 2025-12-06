# テストサマリー - 2025-11-28 更新

## 📊 全体状況

### 🔴 重大な修正（2025-11-28）

**問題 1**: Test 2B 実施時にブラウザバックで既存プランが解除されるバグを発見

**根本原因**: create-checkout が Checkout 作成「前」に既存サブスクをキャンセルしていた

**修正内容**: Checkout 完了「後」に Webhook でキャンセルするよう変更

- create-checkout/index.ts: Lines 194-289 のキャンセルロジックを削除
- metadata に `replace_subscription_id` を追加
- Webhook（checkout.session.completed）でキャンセル（既に実装済み）

**デプロイ**: ✅ 完了（2025-11-28 02:36）

---

**問題 2**: Webhook 環境変数バグ - 決済完了後に DB が更新されない

**根本原因**: stripe-webhook/index.ts で `ENVIRONMENT='live'` がハードコードされていた

- テストモードの Webhook 署名検証が失敗 → 401 Unauthorized
- イベントハンドラが実行されない → DB が更新されない

**修正内容**: 環境変数による環境判定に修正

- stripe-webhook/index.ts:15-16 を環境変数使用に変更
- `const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';`

**デプロイ**: ✅ 完了（2025-11-28 02:36）

**詳細**: `.claude/docs/subscription/issues/2025-11-28-webhook-environment-bug.md`

---

### ✅ 今回実施するテスト（2025-11-28 修正後）

**kyasya00@gmail.com でテスト実施:**

- ✅ データベース白紙化完了
- ✅ Webhook 修正デプロイ完了（version 161）

**テスト順序:**

1. **Test 1**: 新規登録 🔥
2. **Test 2B-離脱**: ブラウザバックテスト（修正検証）
3. **Test 2B**: Standard → Feedback（通常フロー）

### ⏸️ 未実施テスト

- Test 2A: Feedback → Standard（ダウングレード）
- Test 3A: 期間変更 1 ヶ月 →3 ヶ月（延長）
- Test 3B: 期間変更 3 ヶ月 →1 ヶ月（短縮）
- Test 4: キャンセル
- Test 5: 二重課金防止

---

## 📋 テスト一覧（詳細）

### Test 1: ログイン済みユーザーの新規登録

**目的**: 新規ユーザーがサブスクリプションに登録できることを確認

**前提条件**:

- 認証済みユーザー（kyasya00@gmail.com）
- サブスクリプションなし（DB 白紙）

**手順**:

1. `/subscription` ページにアクセス
2. プラン選択（例: スタンダード 1 ヶ月）
3. Stripe Checkout 画面で支払い
4. `/subscription/success` にリダイレクト
5. サブスクリプション有効化を確認

**検証項目**:

- [○] Checkout セッション作成成功
- [○] 支払い完了
- [ ] DB に新規サブスクレコード作成
- [ ] `is_active=true`
- [ ] `environment='test'`
- [ ] アクセス権限が正しい
- [ ] Webhook 200 OK（ログ確認）

**期待結果**: 新規サブスクリプション作成成功

#### ✅ テスト結果（記入欄）

**実施日時**: 2025-11-28 **12**:\_21\_\_\_

**選択プラン**: スタンダード 1 ヶ月

**Console 出力**:

```
購読状態確認結果: {subscribed: true, planType: 'standard', duration: 1, isSubscribed: true, cancelAtPeriodEnd: false, …}
Edge Functionから取得したアクセス権限を使用: {hasMemberAccess: true, hasLearningAccess: true, planType: 'standard'}
```

**Stripe Dashboard 確認**:

- Customer ID: cus_TVIqdyp7mGOOib
- Subscription ID: sub_1SYIEyKUVUnt8Gty1b8qsP1a
- ステータス: active
- プラン: スタンダードプラン 1 ヶ月

**Database 確認**:

```sql
-- 確認用SQL
SELECT stripe_subscription_id, plan_type, duration, is_active, environment
FROM user_subscriptions
WHERE user_id = 'c18e3b81-864d-46c7-894e-62ed0e889876';
```

| stripe_subscription_id       | plan_type | duration | is_active | environment |
| ---------------------------- | --------- | -------- | --------- | ----------- |
| sub_1SYIEyKUVUnt8Gty1b8qsP1a | standard  | 1        | true      | test        |

**Webhook Log 確認**:

```
version: ____
status_code: ____
event_type: ____
  ✅ 確認ポイント

  1. バージョン: version="161" ✅
    - 修正済みの最新バージョンが稼働中
  2. ステータスコード: 200 OK ✅
    - 全てのリクエストが成功
  3. Edge Function: check-subscription
    - ⚠️ これは stripe-webhook
  ではなく、サブスクリプション確認用のFunction
   ---
  ⚠️ 注意

  現在のログには stripe-webhook
  のログが表示されていません。

  これは：
  - まだStripe Checkoutを実行していないため、Web
  hookが発火していない
  - または、最新のログに含まれていない
```

**結果**: ✅ 成功

**備考**:

---

### Test 2A: プラン変更 - ダウングレード（Feedback → Standard）

**目的**: プラン変更（高 → 低）でプロレーションが正しく計算されることを確認

**前提条件**:

- アクティブなフィードバックプラン（1 ヶ月）

**手順**:

1. `/subscription` でスタンダード 1 ヶ月を選択
2. **Option 3**: Stripe Checkout 画面に遷移
3. プロレーション確認
4. 支払い完了
5. `/subscription?updated=true` にリダイレクト

**検証項目**:

- [ ] Stripe に**1 つだけ**アクティブなサブスク（スタンダード）
- [ ] 旧サブスク（フィードバック）がキャンセル済み
- [ ] プロレーション金額が正しい
- [ ] DB: `plan_type='standard'`

**期待結果**: ダウングレード成功、二重課金なし

#### ✅ テスト結果（記入欄）

**実施日時**: 2025-11-** \_\_**:\_\_\_\_

**結果**: ⏸️ 未実施 / ✅ 成功 / ❌ 失敗

**備考**:

---

### Test 2B: プラン変更 - アップグレード（Standard → Feedback）

**目的**: プラン変更（低 → 高）でプロレーションが正しく計算されることを確認

**重要**: **Feedback（フィードバック/グロースプラン）が上位プラン**です

**前提条件**:

- アクティブなスタンダードプラン（1 ヶ月）

**手順**:

1. `/subscription` でフィードバック 1 ヶ月を選択
2. **Option 3**: Stripe Checkout 画面に遷移
3. プロレーション確認（差額が表示される）
4. 支払い完了
5. `/subscription?updated=true` にリダイレクト

**検証項目**:

- [×] Checkout に「Subscribe to グロースプラン」ではなく**プラン更新**の表示
- [ ] プロレーション（差額）が計算されている
- [ ] Stripe に**1 つだけ**アクティブなサブスク（フィードバック）
- [ ] 旧サブスク（スタンダード）がキャンセル済み
- [ ] DB: `plan_type='feedback'`, `is_active=true`
- [ ] Webhook 200 OK

**期待結果**: アップグレード成功、二重課金なし

#### ✅ テスト結果（記入欄）

**実施日時**: 2025-11- 12:28

**Checkout 画面の表示**:

- [○] "Subscribe to グロースプラン"（新規登録） ← ❌ これだと間違い
- [×] プラン更新の表示 + 差額計算 ← ✅ これが正しい

**Console 出力**:

```
既存契約者: Stripe Checkoutでプラン変更します
購読状態確認結果:
Edge Functionから取得したアクセス権限を使用:
```

**Stripe Dashboard 確認**:

- フィードバック（グロースプラン）: ステータス **\_\_\_\_**
- スタンダードプラン: ステータス **\_\_\_\_**

**Database 確認**:

```sql
SELECT stripe_subscription_id, plan_type, duration, is_active, environment
FROM user_subscriptions
WHERE user_id = 'c18e3b81-864d-46c7-894e-62ed0e889876';
```

- plan_type: **\*\***\_\_\_\_**\*\***
- is_active: \_\_\_\_
- environment: \_\_\_\_

**結果**: ⏸️ 未実施 / ✅ 成功 / ❌ 失敗

**備考**:

---

### Test 2B-離脱: ブラウザバックテスト 🔥

**目的**: Checkout 画面からブラウザバックしても既存プランが維持されることを確認

**重要**: これは修正検証のための最優先テスト

**前提条件**:

- アクティブなスタンダードプラン（1 ヶ月）

**手順**:

1. `/subscription` でフィードバック 1 ヶ月を選択
2. Stripe Checkout 画面に遷移
3. **ブラウザバックで `/subscription` に戻る**（支払いせずに離脱）
4. 既存プランが維持されているか確認

**検証項目**:

- [ ] Stripe Dashboard: スタンダード 1 ヶ月が**まだアクティブ**
- [ ] DB: `is_active=true`, `plan_type='standard'`, `duration=1`
- [ ] `/subscription` ページ: 「現在のプラン: スタンダード（1 ヶ月）」表示
- [ ] Console: `subscribed: true` （無課金状態になっていない）

**期待結果**: 既存プランが維持される（無課金状態にならない）

**修正前の問題**: ブラウザバックで既存プランが解除され、無課金状態になっていた

#### ✅ テスト結果（記入欄）

**実施日時**: 2025-11-** \_\_**:\_\_\_\_

**ブラウザバック後の Console 出力**:

```
購読状態確認結果:
Edge Functionから取得したアクセス権限を使用:
```

**Stripe Dashboard 確認**:

- スタンダードプラン: ステータス **\_\_\_\_**
- フィードバックプラン: **\_\_\_\_**（存在しないはず）

**Database 確認**:

```sql
SELECT stripe_subscription_id, plan_type, duration, is_active
FROM user_subscriptions
WHERE user_id = 'c18e3b81-864d-46c7-894e-62ed0e889876';
```

- plan_type: **\*\***\_\_\_\_**\*\***
- is_active: \_\_\_\_

**/subscription ページ表示**:

- 現在のプラン表示: **\*\***\_\_\_\_**\*\***

**結果**: ⏸️ 未実施 / ✅ 成功 / ❌ 失敗

**備考**:

---

### Test 3A: 期間変更 - 延長（1 ヶ月 → 3 ヶ月）

**目的**: 同じプラン内で期間変更（短 → 長）が正しく動作することを確認

**前提条件**:

- アクティブなスタンダード 1 ヶ月プラン

**手順**:

1. `/subscription` で期間タブ「3 ヶ月」を選択
2. スタンダードプランの「このプランに変更する」ボタンをクリック
3. **Option 3**: Stripe Checkout 画面に遷移
4. プロレーション確認
5. 支払い完了

**検証項目**:

- [ ] Console log: 「既存契約者: Stripe Checkout でプラン変更します」
- [ ] Checkout 画面が表示される（Portal 画面ではない）
- [ ] プロレーション金額が正しい
- [ ] Stripe Dashboard で**アクティブなサブスクが 1 つだけ**
- [ ] 旧サブスク（1 ヶ月）がキャンセル済み
- [ ] DB: `plan_type='standard'`, `duration=3`, `is_active=true`

**期待結果**: 期間延長成功、**二重課金なし**

#### ✅ テスト結果（記入欄）

**実施日時**: 2025-11-** \_\_**:\_\_\_\_

**結果**: ⏸️ 未実施 / ✅ 成功 / ❌ 失敗

**備考**:

---

### Test 3B: 期間変更 - 短縮（3 ヶ月 → 1 ヶ月）

**目的**: 同じプラン内で期間変更（長 → 短）が正しく動作することを確認

**前提条件**:

- アクティブなスタンダード 3 ヶ月プラン

**手順**:

1. `/subscription` で期間タブ「1 ヶ月」を選択
2. スタンダードプランの「このプランに変更する」ボタンをクリック
3. **Option 3**: Stripe Checkout 画面に遷移
4. プロレーション確認
5. 支払い完了（クレジット残高がある場合は即座に完了）

**検証項目**:

- [ ] Stripe に**1 つだけ**アクティブなサブスク（1 ヶ月）
- [ ] クレジット残高が正しく計算されている
- [ ] DB: `duration=1`

**期待結果**: 期間短縮成功、二重課金なし

#### ✅ テスト結果（記入欄）

**実施日時**: 2025-11-** \_\_**:\_\_\_\_

**結果**: ⏸️ 未実施 / ✅ 成功 / ❌ 失敗

**備考**:

---

### Test 4: キャンセル

**目的**: サブスクリプションのキャンセルが正しく動作することを確認

**前提条件**:

- アクティブなサブスクリプション

**手順**:

1. アカウントページから「キャンセル」ボタンをクリック
2. Customer Portal 画面に遷移
3. キャンセル確認
4. キャンセル完了

**検証項目**:

- [ ] Stripe: `cancel_at_period_end=true`
- [ ] DB: `cancel_at_period_end=true`
- [ ] 期間終了まではアクセス可能
- [ ] 期間終了後にアクセス不可

**期待結果**: キャンセル成功、期間終了まで利用可能

#### ✅ テスト結果（記入欄）

**実施日時**: 2025-11-** \_\_**:\_\_\_\_

**結果**: ⏸️ 未実施 / ✅ 成功 / ❌ 失敗

**備考**:

---

### Test 5: 二重課金防止

**目的**: 同時に複数のプラン変更を実行しても二重課金が発生しないことを確認

**前提条件**:

- アクティブなスタンダード 1 ヶ月プラン

**手順**:

1. ブラウザタブ 1: スタンダード 3 ヶ月に変更（Checkout 画面表示）
2. ブラウザタブ 2: フィードバック 1 ヶ月に変更（Checkout 画面表示）
3. タブ 1 で支払い完了
4. タブ 2 で支払い完了

**検証項目**:

- [ ] Stripe に**1 つだけ**アクティブなサブスク（フィードバック 1 ヶ月）
- [ ] スタンダード 3 ヶ月サブスクがキャンセル済み
- [ ] 最後に支払ったプランが有効

**期待結果**: 二重課金なし、最後のプランのみ有効

#### ✅ テスト結果（記入欄）

**実施日時**: 2025-11-** \_\_**:\_\_\_\_

**結果**: ⏸️ 未実施 / ✅ 成功 / ❌ 失敗

**備考**:

---

## 📜 テスト履歴（過去の実施結果）

### Test 1: 新規登録（2025-11-28 11:26 実施）

**結果**: ✅ 成功

**選択プラン**: スタンダード 1 ヶ月

**Console 出力**:

```
購読状態確認結果: {subscribed: true, planType: 'standard', duration: 1, isSubscribed: true, cancelAtPeriodEnd: false, …}
Edge Functionから取得したアクセス権限を使用: {hasMemberAccess: true, hasLearningAccess: true, planType: 'standard'}
```

**Stripe Dashboard**:

- Customer ID: cus_TVHwudkif4mNkJ
- Subscription ID: sub_1SYHMnKUVUnt8GtyQRYWgE3f
- プラン: スタンダードプラン - 有効

---

### Test 2B-離脱: ブラウザバックテスト（2025-11-28 11:28 実施）

**結果**: ❌ 失敗（Webhook 環境変数バグにより）

**問題内容**:

- 決済完了後、DB が更新されず `subscribed: false` になった
- /account ページで「無料」プラン表示

**Stripe Dashboard 状況**:

- グロースプラン（フィードバック）: 有効 - 12/28 に ￥ 5,020
- スタンダードプラン: キャンセル済み

**Database 状況**:

- `is_active=false` のまま（Webhook が 401 エラーで実行されなかった）

**原因**: stripe-webhook/index.ts で `ENVIRONMENT='live'` がハードコード

- テストモードの Webhook 署名検証が失敗
- 401 Unauthorized → イベントハンドラ未実行 → DB 未更新

**修正**: ✅ 完了（2025-11-28 02:36）

- 環境変数使用に変更: `const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';`

**詳細**: `.claude/docs/subscription/issues/2025-11-28-webhook-environment-bug.md`

---

## 🐛 既知の問題と修正履歴

### 🔴 Critical Bug Fix 1: ブラウザバックで既存プラン解除（2025-11-28）

**ステータス**: ✅ 修正完了・デプロイ完了

**問題**:

- Test 2B 実施時、Checkout 画面でブラウザバックすると既存プランが解除される
- ユーザーが無課金状態になる重大なバグ

**根本原因**:

- create-checkout が Checkout 作成「前」に既存サブスクをキャンセルしていた
- Checkout 離脱時、既存サブスクはキャンセル済み・新サブスクは未作成の状態になる

**修正内容**:

- create-checkout/index.ts: Lines 194-289 のキャンセルロジックを削除
- metadata に `replace_subscription_id` を追加
- Webhook（checkout.session.completed）で Checkout 完了「後」にキャンセル

**効果**:

- ✅ Checkout 離脱時も既存プランが維持される
- ✅ 支払い完了「後」にキャンセルされるため安全
- ✅ 二重課金期間が最小限（数秒〜数分、Webhook 即座実行）

**詳細**: `.claude/docs/subscription/issues/browser-back-bug-analysis.md`

---

### 🔴 Critical Bug Fix 2: Webhook 環境変数バグ（2025-11-28）

**ステータス**: ✅ 修正完了・デプロイ完了

**問題**:

- 決済完了後、DB が更新されない
- `subscribed: false` のまま、サービスにアクセスできない

**根本原因**:

- stripe-webhook/index.ts で `ENVIRONMENT='live'` がハードコード
- テストモードの Webhook 署名検証が失敗（401 Unauthorized）
- イベントハンドラが実行されず、DB 更新されず

**修正内容**:

- stripe-webhook/index.ts:15-16 を環境変数使用に変更
- `const ENVIRONMENT = (Deno.env.get('STRIPE_MODE') || 'test') as 'test' | 'live';`
- Version 161 デプロイ完了

**なぜ発生したか**:

- 2025-11-27 のコミット 50217e0 で環境変数分離を実装
- しかし `stripe-webhook` が修正から漏れた（`stripe-webhook-test` のみ修正）
- 類似ファイル名の罠

**再発防止策**:

- 開発チェックリスト作成: `.claude/docs/subscription/development-checklist.md`
- 環境変数使用箇所の全ファイル確認を徹底
- デプロイ後のログ確認を必須化

**詳細**: `.claude/docs/subscription/issues/2025-11-28-webhook-environment-bug.md`

---

## 📚 関連ドキュメント

### 🔥 重要ドキュメント

- **issues/2025-11-28-webhook-environment-bug.md**: Webhook 環境変数バグの完全分析

  - 時系列分析
  - 根本原因（修正漏れ）
  - 再発防止策

- **development-checklist.md**: Edge Functions 開発チェックリスト

  - 編集前・編集中・デプロイ前・デプロイ後のチェックリスト
  - 環境変数確認コマンド集
  - 緊急時の対応手順

- **issues/browser-back-bug-analysis.md**: ブラウザバックバグの完全分析レポート
  - タスク一覧
  - 根本原因分析（なぜ以前はうまくいっていたのか）
  - 二重課金防止の検証（今回の修正で壊れていないか）
  - タイムライン
  - 教訓と再発防止策

### メインドキュメント

- **user-flow-test.md**: 全テストケースの詳細
- **plan-change-option3-implementation.md**: Option 3 実装計画

### 補助ドキュメント

- **comprehensive-test-plan.md**: 包括的なテスト計画
- **testing-log.md**: テスト実施ログ

---

**最終更新**: 2025-11-28
**作成者**: Claude Code
**Option 3 実装**: ✅ 完了
**ブラウザバックバグ修正**: ✅ 完了（2025-11-28）
**Webhook 環境変数バグ修正**: ✅ 完了（2025-11-28）
**デプロイ**: ✅ 完了（version 161）
**次のテスト**: Test 1 新規登録（kyasya00@gmail.com で実施）
