# Phase 1: 実際の動作テスト計画

**日付**: 2025-11-30
**ステータス**: 🔄 実施中
**前提**: Phase 0完了、STRIPE_MODE=test設定済み

---

## 🎯 Phase 1の目的

**実際に各フローを試して、全ての問題を正確に把握する。**

推測ではなく事実に基づいて問題を特定し、的確にバグなしで改善するための基盤を作る。

---

## 📋 テスト項目

### Test 1-1: Standard 1Mプラン新規登録

**操作手順**:
1. ブラウザで http://localhost:8080/subscription を開く
2. Standard 1ヶ月プランを選択
3. 「プランに登録」ボタンをクリック
4. Stripe Checkoutページへの遷移を確認
5. テストカード（4242 4242 4242 4242）で決済
6. 成功ページへの遷移を確認
7. `/subscription`ページで現在のプラン表示を確認

**記録項目**:
- [ ] 各ステップのスクリーンショット
- [ ] コンソールエラー（あれば）
- [ ] ネットワークタブのリクエスト/レスポンス
- [ ] Edge Functionのログ（create-checkout, stripe-webhook）
- [ ] データベースの最終状態（user_subscriptions, stripe_customers）

**期待結果**:
```
✅ Stripe Checkoutへ正常に遷移
✅ 決済完了
✅ 成功ページへリダイレクト
✅ DBに plan_type='standard', duration=1 で保存
✅ /subscription ページに「現在のプラン: スタンダード（1ヶ月）」表示
```

**実際の結果**:

**実施日時**: 2025-11-30
**実施者**: takumi.kai.skywalker@gmail.com（ローカル環境で新規作成）

**操作実施結果**:
- ✅ Step 1-3: ブラウザで http://localhost:8080/subscription を開いた
- ✅ Step 2: Standard 1ヶ月プランを選択
- ✅ Step 3: 「プランに登録」ボタンをクリック
- ✅ Step 4: Stripe Checkoutページへ正常に遷移
- ✅ Step 5: テストカード（4242 4242 4242 4242）で決済完了
- ✅ Step 6: 成功ページへリダイレクト成功
  - 表示メッセージ: "サブスクリプションが有効になりました。すべてのプレミアムコンテンツにアクセスできます。"
- ❌ Step 7: `/subscription`ページで正しいプラン表示されず

**Stripe確認結果**:
- ✅ Stripeダッシュボードでサブスクリプション作成確認
- ✅ 金額: ¥4,980
- ✅ 次の請求書: 12/31
- ✅ ステータス: アクティブ

**データベース状態（コンソール出力）**:
```
DB直接取得結果: {
  isActive: false,
  planType: null,
  duration: null,
  cancelAtPeriodEnd: false,
  cancelAt: null,
  ...
}

Edge Functionから取得したアクセス権限: {
  hasMemberAccess: false,
  hasLearningAccess: false,
  planType: null
}
```

**🔴 問題点**:
- ❌ 決済は成功したが、データベースが更新されていない
- ❌ `user_subscriptions`テーブルに新規レコードが作成されていない可能性
- ❌ `stripe-webhook` Edge Functionが正常に動作していない可能性
- ❌ 期待: `plan_type='standard', duration=1, is_active=true`
- ❌ 実際: `planType=null, duration=null, isActive=false`

**次のアクション**:
- [ ] Edge Functionのログを確認（stripe-webhook, create-checkout）
- [ ] データベースを直接クエリして、レコードの有無を確認
- [ ] Webhook eventがStripeから送信されているか確認
- [ ] この問題をISSUE-P1-002として記録

**記録項目チェック**:
- [x] 各ステップのスクリーンショット（ユーザー提供）
- [x] コンソール出力（DB直接取得結果、アクセス権限）
- [x] Stripeダッシュボードのスクリーンショット（ユーザー提供）
- [ ] Edge Functionのログ（確認予定）
- [ ] データベースの最終状態（詳細確認予定）

---

### Test 1-2: Feedback 1Mプラン新規登録

**操作手順**:
1. ブラウザで http://localhost:8080/subscription を開く
2. Feedback 1ヶ月プランを選択
3. 「プランに登録」ボタンをクリック
4. Stripe Checkoutページへの遷移を確認
5. テストカード（4242 4242 4242 4242）で決済
6. 成功ページへの遷移を確認
7. `/subscription`ページで現在のプラン表示を確認

**記録項目**:
- [ ] 各ステップのスクリーンショット
- [ ] コンソールエラー（あれば）
- [ ] ネットワークタブのリクエスト/レスポンス
- [ ] Edge Functionのログ（create-checkout, stripe-webhook）
- [ ] データベースの最終状態

**期待結果**:
```
✅ Stripe Checkoutへ正常に遷移
✅ 決済完了
✅ 成功ページへリダイレクト
✅ DBに plan_type='feedback', duration=1 で保存
✅ /subscription ページに「現在のプラン: フィードバック（1ヶ月）」表示
```

**実際の結果**: （テスト実施後に記入）

---

### Test 1-3: プラン変更（Standard → Feedback）

**前提条件**: Test 1-1でStandardプランに登録済み

**操作手順**:
1. `/subscription`ページを開く
2. Feedbackプランの「プラン変更」ボタンをクリック
3. 確認ページ（または直接変更）を確認
4. 変更を確定
5. 成功メッセージの確認
6. `/subscription`ページでプラン表示の更新を確認

**記録項目**:
- [ ] 各ステップのスクリーンショット
- [ ] コンソールエラー（あれば）
- [ ] ネットワークタブのリクエスト/レスポンス（update-subscription API）
- [ ] Edge Functionのログ（update-subscription, stripe-webhook）
- [ ] データベースの変更内容

**期待結果**:
```
✅ プラン変更リクエスト成功（200 OK）
✅ update-subscription Edge Functionが正常動作
✅ DBの plan_type が 'standard' → 'feedback' に更新
✅ Stripeのサブスクリプションが更新される
✅ 即座に画面に反映
```

**実際の結果**: （テスト実施後に記入）

---

## 🔍 エラーログ収集方法

### フロントエンド（ブラウザ）

```
1. Chrome DevTools を開く（F12）
2. Console タブでエラーを確認
3. Network タブで失敗したリクエストを確認
4. スクリーンショット保存
```

### Edge Functions（サーバー）

```bash
# create-checkoutのログ確認
tail -f <create-checkoutのログファイル>

# stripe-webhookのログ確認
tail -f <stripe-webhookのログファイル>

# update-subscriptionのログ確認
tail -f <update-subscriptionのログファイル>
```

または、Bash 0fe90e（create-checkout + stripe-webhook serve）の出力を確認。

### データベース

```sql
-- 最新のサブスクリプションレコードを確認
SELECT * FROM user_subscriptions
WHERE environment = 'test'
ORDER BY created_at DESC
LIMIT 5;

-- ユーザーごとの状態確認
SELECT
  user_id,
  plan_type,
  duration,
  is_active,
  stripe_subscription_id,
  created_at
FROM user_subscriptions
WHERE user_id = '<テストユーザーのID>'
ORDER BY created_at DESC;
```

---

## 📝 発見した問題の記録フォーマット

各テストで問題を発見した場合、以下の形式で記録：

```markdown
### ISSUE-P1-XXX: [問題の簡潔な説明]

**テスト**: Test 1-X
**重大度**: 🔴 Critical / 🟡 Medium / 🟢 Low
**症状**: [何が起きたか]
**期待動作**: [何が起きるべきだったか]
**再現手順**: [どうやったら再現するか]
**エラーメッセージ**: [エラーログ]
**スクリーンショット**: [ファイルパス]
**推定原因**: [考えられる原因]
**次のアクション**: [どう対処するか]
```

---

## 🎯 成功基準

Phase 1は以下が全て達成されたら完了：

- [ ] Test 1-1（Standard登録）実施完了
- [ ] Test 1-2（Feedback登録）実施完了
- [ ] Test 1-3（プラン変更）実施完了
- [ ] 全てのエラーログ・スクリーンショット記録完了
- [ ] 発見した問題リスト作成完了
- [ ] Phase 1レポート作成完了

---

## 📊 Phase 1完了後のアクション

1. **Phase 1レポート作成**
   - 発見した全問題をリスト化
   - 優先順位付け
   - 各問題の影響範囲分析

2. **Phase 2計画策定**
   - Phase 1の結果をもとに修正計画作成
   - 修正の優先順位決定
   - リスク評価

3. **ユーザーへ報告**
   - Phase 1の結果共有
   - Phase 2の方針確認

---

## 🚀 Phase 1開始準備

### 前提条件チェック

- [x] STRIPE_MODE=test が.envに設定済み
- [x] Supabaseサービスが起動中
- [x] Edge Functionsが起動中
- [x] フロントエンド（npm run dev）が起動中
- [x] Stripe Listenが起動中（Webhookテスト用）

### 開始前の確認

```bash
# 1. Supabase状態確認
npx supabase status

# 2. フロントエンド起動確認
curl http://localhost:8080

# 3. Edge Functions起動確認
curl http://127.0.0.1:54321/functions/v1/

# 4. Stripe Listen状態確認
# （別ターミナルでstripe listenが動作中）
```

---

**準備完了。Phase 1-1（Standard 1M新規登録テスト）を開始します。**

---

**作成日時**: 2025-11-30 20:00
**作成者**: Claude Code
**次のステップ**: Test 1-1実施
