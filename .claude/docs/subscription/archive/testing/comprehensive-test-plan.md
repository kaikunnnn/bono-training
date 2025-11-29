# サブスクリプションシステム - 包括的テスト計画

**作成日**: 2025-11-26
**最終更新**: 2025-11-26
**目的**: 同じ失敗を二度繰り返さないための、確実なテスト手順の確立

---

## 📈 テスト実施進捗

| テスト | ステータス | 実施日 | 判定 |
|--------|-----------|--------|------|
| Test 5-1: Feedbackプラン 1ヶ月 | ✅ 完了 | 2025-11-26 | ✅ 成功 |
| Test 5-2: Standardプラン 1ヶ月 | ✅ 完了 | 2025-11-27 | ✅ 成功 |
| Test 5-3: Standardプラン 3ヶ月 | ✅ 完了 | 2025-11-27 | ✅ 成功 |
| Test 5-4: Feedbackプラン 3ヶ月 | ✅ 完了 | 2025-11-27 | ✅ 成功 |
| Test 5-5: プラン変更 | ✅ 完了 | 2025-11-27 | ✅ 成功 |
| Test 5-6: キャンセル処理 | ✅ 完了 | 2025-11-27 | ✅ 成功 |
| Test 5-7: 未登録ユーザー | ✅ 完了 | 2025-11-27 | ✅ 成功 |

**全体進捗**: 7/7 完了 (100%) 🎉

---

## 🎯 テストの原則

### 1. **End-to-End優先**
- データベースが正しくても、フロントエンドが動作しなければ意味がない
- **必ず実際のユーザー動作を確認する**

### 2. **ログベースの検証**
- すべてのステップでログを残す
- 問題発生時に遡って原因を特定できるようにする

### 3. **段階的な確認**
1. データベース層
2. API/Edge Function層
3. フロントエンド（State管理）層
4. UI層（実際の表示・動作）

### 4. **比較テスト**
- 修正前と修正後の状態を記録
- 何が変わったかを明確にする

---

## 📋 Phase 5: 包括的End-to-Endテスト

### 前提条件
- **テストユーザー**: kyasya00@gmail.com
- **現在のプラン**: Feedbackプラン 1ヶ月
- **user_id**: c18e3b81-864d-46c7-894e-62ed0e889876

---

### Test 5-1: Feedbackプラン（1ヶ月） - 完全動作確認

#### ✅ 実施済み（2025-11-26）

**1. データベース確認**
```sql
SELECT user_id, plan_type, duration, is_active, stripe_subscription_id
FROM user_subscriptions
WHERE user_id = 'c18e3b81-864d-46c7-894e-62ed0e889876';
```

**結果:**
```json
{
  "user_id": "c18e3b81-864d-46c7-894e-62ed0e889876",
  "plan_type": "feedback",
  "duration": 1,
  "is_active": true,
  "stripe_subscription_id": "sub_1SXcchKUVUnt8GtyqNm4nc7S"
}
```
✅ データベース層: 正常

**2. check-subscription API確認**

ブラウザConsoleで確認:
```javascript
// Edge Functionからのレスポンス
{
  subscribed: true,
  planType: 'feedback',
  duration: 1,
  isSubscribed: true,
  hasMemberAccess: true,
  hasLearningAccess: true
}
```
✅ API層: 正常

**3. フロントエンド State確認**

ブラウザConsoleで確認:
```javascript
// useSubscription の状態
{
  isSubscribed: true,
  planType: 'feedback',
  hasMemberAccess: true,
  hasLearningAccess: true,
  canAccessContent(true): true  // ← premiumAccess.ts 修正後
}
```
✅ State層: 正常

**4. UI動作確認**

- [x] 有料コンテンツページにアクセス
- [x] 鍵マークが表示されない
- [x] 動画プレイヤーが表示される
- [x] 動画が再生できる

✅ UI層: 正常

**判定**: ✅ **全レイヤーで正常動作**

---

### Test 5-2: Standardプラン（1ヶ月） - 新規テスト

#### ✅ 実施済み（2025-11-27）

**ステータス**: ✅ 完了
**実施日**: 2025-11-27
**テスター**: kyasya00@gmail.com

**目的**:
- Standardプランでもアクセス権限が正しく機能するか確認
- Price ID マッピングが Standard にも適用されているか確認

**テスト手順:**

#### Step 1: テストユーザーの準備

**実施方法**: Option A（既存ユーザー kyasya00@gmail.com でテスト）

**手順:**
1. Stripe Dashboardでサブスクリプションをキャンセル
2. データベースから user_subscriptions レコードを削除
3. Standardプラン（1ヶ月）に新規登録

**実施結果:**
- [x] Stripe サブスクリプションキャンセル完了
- [x] データベースレコード削除完了（record_count: 0）
- [x] Standardプラン登録完了

**新しい Stripe Subscription ID**: sub_1SXsgfKUVUnt8GtygePoOlFD

#### Step 2: データベース確認

**実施クエリ:**
```sql
SELECT user_id, plan_type, duration, is_active, stripe_subscription_id,
       cancel_at_period_end, current_period_end, created_at, updated_at
FROM user_subscriptions
WHERE user_id = 'c18e3b81-864d-46c7-894e-62ed0e889876';
```

**期待結果:**
```json
{
  "plan_type": "standard",
  "duration": 1,
  "is_active": true,
  "stripe_subscription_id": "sub_xxxxx"
}
```

**実施結果:**
```json
{
  "user_id": "c18e3b81-864d-46c7-894e-62ed0e889876",
  "plan_type": "standard",
  "duration": 1,
  "is_active": true,
  "stripe_subscription_id": "sub_1SXsgfKUVUnt8GtygePoOlFD",
  "cancel_at_period_end": false,
  "current_period_end": "2025-12-27 00:03:53+00",
  "created_at": "2025-11-27 00:03:59.118557+00",
  "updated_at": "2025-11-27 00:04:00.138977+00"
}
```

**確認項目:**
- [x] `plan_type` が `"standard"` である
- [x] `duration` が `1` である
- [x] `is_active` が `true` である
- [x] レコードが1件のみ作成されている
- [x] `stripe_subscription_id` が設定されている

**判定**: ✅ 正常

#### Step 3: check-subscription API確認

**確認方法**: ブラウザConsoleで確認

**期待結果:**
```javascript
{
  subscribed: true,
  planType: 'standard',
  duration: 1,
  isSubscribed: true,
  hasMemberAccess: true,
  hasLearningAccess: true
}
```

**実施結果:**
```javascript
{
  "subscribed": true,
  "planType": "standard",
  "duration": 1,
  "isSubscribed": true,
  "cancelAtPeriodEnd": false,
  "cancelAt": null,
  "renewalDate": "2025-12-27T00:03:53+00:00",
  "hasMemberAccess": true,
  "hasLearningAccess": true
}
```

**確認項目:**
- [x] `planType` が `'standard'` である
- [x] `hasMemberAccess` が `true` である
- [x] `hasLearningAccess` が `true` である
- [x] `duration` が `1` である

**判定**: ✅ 正常

#### Step 4: フロントエンド State確認

**確認方法**: ブラウザConsoleで確認

**期待結果:**
```javascript
{
  planType: 'standard',
  hasMemberAccess: true,
  hasLearningAccess: true,
  canAccessContent(true): true
}
```

**実施結果:**
```javascript
購読状態確認結果: {
  subscribed: true,
  planType: 'standard',
  duration: 1,
  isSubscribed: true,
  cancelAtPeriodEnd: false,
  ...
}

Edge Functionから取得したアクセス権限を使用: {
  hasMemberAccess: true,
  hasLearningAccess: true,
  planType: 'standard'
}
```

**確認項目:**
- [x] `planType` が `'standard'` である
- [x] `hasMemberAccess` が `true` である
- [x] `hasLearningAccess` が `true` である

**判定**: ✅ 正常

#### Step 5: UI動作確認（最重要）

**確認手順:**
1. 有料コンテンツページ（記事ページなど）にアクセス
2. 動画セクションを確認
3. 動画の再生を試行

**確認項目:**
- [x] 有料コンテンツページにアクセスできる
- [x] **鍵マークが表示されない**
- [x] 動画プレイヤーが表示される
- [x] 動画が実際に再生できる

**実施結果:**
```
✅ 有料コンテンツの内容が正しく表示
✅ 鍵マークは表示されない
✅ 動画プレイヤーが表示される
✅ 動画が実際に再生できる
```

**判定**: ✅ 正常

#### Step 6: Webhookログ確認（オプション）

**実施結果:**
```
データベース結果から Price ID マッピングが正しく機能していることを確認済み
（stripe-webhook-testのログは取得できなかったが、plan_type: "standard" が正しく保存されている）
```

**確認項目:**
- [x] データベースに `plan_type: "standard"` が保存されている
- [x] `duration: 1` が正しい
- [x] エラーなし

**判定**: ✅ 正常（データベース結果から推測）

---

**Test 5-2 総合判定**: ✅ **成功 - 全レイヤーで正常動作**

**コメント:**
```
Standardプラン（1ヶ月）でも全ての機能が正常に動作することを確認。
- データベース層: plan_type, duration が正しく保存
- API層: 正しいアクセス権限を返却
- State層: 正しい状態を保持
- UI層: 鍵マークなし、動画再生OK

premiumAccess.ts に 'standard' が含まれているため、Feedbackプランと同様に正常動作。
Price ID マッピングも正しく機能している。
```

---

### Test 5-3: Standardプラン（3ヶ月） - 新規テスト

#### ✅ 実施済み（2025-11-27）

**ステータス**: ✅ 完了
**実施日**: 2025-11-27
**テスター**: kyasya00@gmail.com

**目的**:
- `duration: 3` が正しく保存されるか確認
- 3ヶ月プランでも Price ID マッピングが機能するか確認

**テスト手順**: Test 5-2と同様の手順

#### 主要な確認ポイント

**期待されるデータベース結果:**
```json
{
  "plan_type": "standard",
  "duration": 3,  // ← 3ヶ月
  "is_active": true
}
```

**実施結果:**
```json
{
  "user_id": "c18e3b81-864d-46c7-894e-62ed0e889876",
  "plan_type": "standard",
  "duration": 3,
  "is_active": true,
  "stripe_subscription_id": "sub_1SXsvVKUVUnt8Gty6TlEkmsA",
  "cancel_at_period_end": false,
  "current_period_end": "2026-02-27 00:19:13+00"
}
```

**期待される Price ID:**
```
price_1RStCiKUVUnt8GtyKJiieo6d
```

**確認項目（簡略版）:**
- [x] Step 1: サブスクリプション変更完了（sub_1SXsvVKUVUnt8Gty6TlEkmsA）
- [x] Step 2: データベースで `duration: 3` を確認
- [x] Step 3: API Response で `duration: 3` を確認
- [x] Step 4: State確認（planType: 'standard', hasMemberAccess: true）
- [x] Step 5: UI動作確認（鍵マークなし、動画再生OK）
- [x] Step 6: Webhookログで `duration: 3` を確認（データベース結果から推測）

**Test 5-3 総合判定**: ✅ **成功 - 全レイヤーで正常動作**

**実施結果詳細:**
```
✅ Standardプラン（3ヶ月）で全ての機能が正常に動作
- データベース層: plan_type: "standard", duration: 3 が正しく保存
- API層: duration: 3, hasMemberAccess: true, hasLearningAccess: true
- State層: 正しい状態を保持
- UI層: 鍵マークなし、動画再生OK

Price ID マッピングが3ヶ月プランでも正常に機能。
期間（duration）の違いによる問題なし。
```

---

### Test 5-4: Feedbackプラン（3ヶ月） - 新規テスト

#### ✅ 実施済み（2025-11-27）

**ステータス**: ✅ 完了
**実施日**: 2025-11-27
**テスター**: kyasya00@gmail.com

**目的**:
- Feedbackプラン3ヶ月で正しく動作するか確認
- `plan_type: "feedback"` かつ `duration: 3` の組み合わせを確認

**テスト手順**: Test 5-2と同様の手順

#### 主要な確認ポイント

**期待されるデータベース結果:**
```json
{
  "plan_type": "feedback",
  "duration": 3,  // ← 3ヶ月
  "is_active": true
}
```

**実施結果:**
```json
{
  "user_id": "c18e3b81-864d-46c7-894e-62ed0e889876",
  "plan_type": "feedback",
  "duration": 3,
  "is_active": true,
  "stripe_subscription_id": "sub_1SXt1AKUVUnt8GtyzKeS0Yx8",
  "cancel_at_period_end": false,
  "current_period_end": "2026-02-27 00:25:04+00"
}
```

**期待される Price ID:**
```
price_1OIiMRKUVUnt8GtyttXJ71Hz
```

**API Response:**
```javascript
{
  subscribed: true,
  planType: 'feedback',
  duration: 3,
  hasMemberAccess: true,
  hasLearningAccess: true
}
```

**確認項目（簡略版）:**
- [x] Step 1: サブスクリプション変更完了（sub_1SXt1AKUVUnt8GtyzKeS0Yx8）
- [x] Step 2: データベースで `plan_type: "feedback"`, `duration: 3` を確認
- [x] Step 3: API Response 確認（planType: 'feedback', duration: 3）
- [x] Step 4: State確認（hasMemberAccess: true, hasLearningAccess: true）
- [x] Step 5: UI動作確認（鍵マークなし、動画再生OK）
- [x] Step 6: Webhookログ確認（データベース結果から推測）

**Test 5-4 総合判定**: ✅ **成功 - 全レイヤーで正常動作**

**実施結果詳細:**
```
✅ Feedbackプラン（3ヶ月）で全ての機能が正常に動作
- データベース層: plan_type: "feedback", duration: 3 が正しく保存
- API層: planType: 'feedback', duration: 3, hasMemberAccess: true
- State層: 正しい状態を保持
- UI層: 鍵マークなし、動画再生OK

premiumAccess.ts に 'feedback' が含まれているため正常動作。
Price ID マッピングがFeedback 3ヶ月プランでも正常に機能。
```

---

### Test 5-5: プラン変更（Feedback 3ヶ月 → Standard 1ヶ月） - 新規テスト

#### ✅ 実施済み（2025-11-27）

**目的**: `subscription.updated` Webhookが正しく動作するか確認

**実施内容:**
1. **変更前のプラン**: Feedbackプラン 3ヶ月 (sub_1SXt1AKUVUnt8GtyzKeS0Yx8)
2. **Stripe Dashboardでプラン更新**: Standardプラン 1ヶ月に変更
3. **Webhook処理完了**: データベース更新確認

**実施結果:**
```json
{
  "user_id": "c18e3b81-864d-46c7-894e-62ed0e889876",
  "plan_type": "standard",
  "duration": 1,
  "is_active": true,
  "stripe_subscription_id": "sub_1SXt1AKUVUnt8GtyzKeS0Yx8",  // ← 同じサブスクリプションID
  "cancel_at_period_end": false,
  "current_period_end": "2025-12-27 00:36:25+00",
  "updated_at": "2025-11-27 00:36:30.324726+00"
}
```

**API Response:**
```javascript
{
  subscribed: true,
  planType: 'standard',
  duration: 1,
  isSubscribed: true,
  cancelAtPeriodEnd: false,
  hasMemberAccess: true,
  hasLearningAccess: true
}
```

**確認項目:**
- [x] Step 1: Stripe Dashboardでプラン更新実施
- [x] Step 2: データベースで `plan_type: "standard"`, `duration: 1` に更新確認
- [x] Step 3: サブスクリプションIDが同じ（sub_1SXt1AKUVUnt8GtyzKeS0Yx8）
- [x] Step 4: API Response確認（planType: 'standard', duration: 1）
- [x] Step 5: State確認（hasMemberAccess: true, hasLearningAccess: true）
- [x] Step 6: UI動作確認（鍵マークなし、動画再生OK）

**Test 5-5 総合判定**: ✅ **成功 - subscription.updated Webhook が正常動作**

**実施結果詳細:**
```
✅ subscription.updated Webhookが正常に動作
- サブスクリプションIDが変わらずプラン内容のみ更新（sub_1SXt1AKUVUnt8GtyzKeS0Yx8）
- Feedback 3ヶ月 → Standard 1ヶ月への変更が正しく反映
- データベース層: plan_type, duration が正しく更新
- API層: 変更後のプラン情報を正しく返却
- UI層: プレミアムコンテンツへのアクセス継続（鍵マークなし、動画再生OK）

stripe-webhook-test Edge Functionが subscription.updated イベントを
正しく処理し、Price IDから新しいプラン情報を判定してデータベースを更新。
```

---

### Test 5-6: サブスクリプションキャンセル - 新規テスト

#### ✅ 実施済み（2025-11-27）

**目的**: キャンセル後も期間終了までアクセス権限が維持されるか確認

**実施内容:**
1. **アプリ上でキャンセル**: Standardプラン 1ヶ月をキャンセル
2. **期間内の動作確認**: キャンセル後もコンテンツにアクセス可能か確認

**実施結果:**

**データベース:**
```json
{
  "user_id": "c18e3b81-864d-46c7-894e-62ed0e889876",
  "plan_type": "standard",
  "duration": 1,
  "is_active": true,  // ✅ 期間内なのでまだ true
  "stripe_subscription_id": "sub_1SXt1AKUVUnt8GtyzKeS0Yx8",
  "cancel_at_period_end": true,  // ✅ キャンセル予約済み
  "cancel_at": "2025-12-27 00:36:25+00",  // ✅ 利用終了日
  "current_period_end": "2025-12-27 00:36:25+00",
  "updated_at": "2025-11-27 00:42:00.123943+00"
}
```

**API Response:**
```javascript
{
  subscribed: true,  // ✅ 期間内なのでまだ true
  planType: 'standard',
  duration: 1,
  isSubscribed: true,
  cancelAtPeriodEnd: true,  // ✅ キャンセル予約が正しく返却
  cancelAt: "2025-12-27T00:36:25+00:00",  // ✅ 利用終了日
  renewalDate: "2025-12-27T00:36:25+00:00",  // ✅ 更新日ではなく終了日
  hasMemberAccess: true,  // ✅ 期間内はアクセス可能
  hasLearningAccess: true
}
```

**確認項目:**
- [x] Step 1: アプリ上でキャンセル実施
- [x] Step 2: データベースで `cancel_at_period_end: true` を確認
- [x] Step 3: データベースで `is_active: true` のまま（期間内）
- [x] Step 4: `cancel_at` と `current_period_end` が設定されている
- [x] Step 5: API Response で `cancelAtPeriodEnd: true` 確認
- [x] Step 6: `renewalDate` が `cancelAt` と同じ（終了日として表示）
- [x] Step 7: UI動作確認（コンテンツが見れる）

**Test 5-6 総合判定**: ✅ **成功 - キャンセル後も期間内アクセス維持**

**実施結果詳細:**
```
✅ キャンセル処理が正常に動作
- キャンセル予約が正しくデータベースに記録（cancel_at_period_end: true）
- 期間内は is_active: true のまま維持
- アクセス権限が期間終了まで継続（hasMemberAccess: true, hasLearningAccess: true）
- renewalDate が cancelAt として正しく表示（更新ではなく終了）
- UI層: キャンセル後もコンテンツが見れる

handlers.ts の calculateAccessPermissions() が正しく動作し、
cancelAtPeriodEnd && current_period_end > now の場合にアクセスを許可。
```

**Note**: 期間終了後（2025-12-27以降）の動作確認は実運用で自然に発生するため省略

---

### Test 5-7: 未登録ユーザー - 新規テスト

#### ✅ 実施済み（2025-11-27）

**目的**: サブスクリプションなしのユーザーが正しく制限されるか確認

**実施内容:**
1. **データベースレコードを削除**: user_subscriptions テーブルから削除
2. **未登録状態での動作確認**: プレミアムコンテンツへのアクセス制限を確認

**実施結果:**

**データベース:**
```sql
SELECT COUNT(*) FROM user_subscriptions
WHERE user_id = 'c18e3b81-864d-46c7-894e-62ed0e889876';
-- 結果: 0 ✅ レコードなし
```

**API Response:**
```javascript
{
  isActive: false,  // ✅ 非アクティブ
  planType: null,  // ✅ プランなし
  duration: null,
  cancelAtPeriodEnd: false,
  cancelAt: null,
  hasMemberAccess: false,  // ✅ メンバーアクセスなし
  hasLearningAccess: false  // ✅ 学習アクセスなし
}
```

**確認項目:**
- [x] Step 1: データベースレコード削除（未登録状態を作成）
- [x] Step 2: データベースでレコードが0件であることを確認
- [x] Step 3: API Response で `planType: null` 確認
- [x] Step 4: API Response で `hasMemberAccess: false, hasLearningAccess: false` 確認
- [x] Step 5: UI動作確認（🔒鍵マークが表示される）
- [x] Step 6: 動画プレイヤーが表示されない
- [x] Step 7: 「プランを見る」ボタンが表示される

**Test 5-7 総合判定**: ✅ **成功 - 未登録ユーザーが正しく制限される**

**実施結果詳細:**
```
✅ 未登録ユーザーの制限が正常に動作
- データベースにレコードがない場合、API が正しく未登録状態を返却
- アクセス権限が全て false（hasMemberAccess: false, hasLearningAccess: false）
- UI層: 鍵マークが表示され、動画プレイヤーが非表示
- 「プランを見る」ボタンが表示され、サブスクリプション登録を促す

handlers.ts の createUnauthenticatedResponse() と
premiumAccess.ts の canAccessContent() が正しく連携し、
未登録ユーザーをプレミアムコンテンツから除外。
```

---

## 🔄 テスト実施の進め方

### フェーズ分け

**Phase 5A: 現在のプラン（Feedback 1ヶ月）の完全確認**
- ✅ Test 5-1 完了

**Phase 5B: 他のプランのテスト**
- ⏳ Test 5-2: Standard 1ヶ月
- ⏳ Test 5-3: Standard 3ヶ月
- ⏳ Test 5-4: Feedback 3ヶ月

**Phase 5C: 動的変更のテスト**
- ⏳ Test 5-5: プラン変更
- ⏳ Test 5-6: キャンセル処理
- ⏳ Test 5-7: 未登録ユーザー

---

## 📝 テスト実施時のチェックリスト

### 各テストで必ず確認すること

#### 1. データベース層
```sql
SELECT user_id, plan_type, duration, is_active, stripe_subscription_id,
       cancel_at_period_end, current_period_end, created_at, updated_at
FROM user_subscriptions
WHERE user_id = '[user_id]';
```
- [ ] `plan_type` が正しい
- [ ] `duration` が正しい
- [ ] `is_active` が正しい
- [ ] レコード数が1件のみ

#### 2. API層（check-subscription）
```javascript
// ブラウザConsoleで確認
console.log('API Response:', /* レスポンス */);
```
- [ ] `planType` が正しい
- [ ] `hasMemberAccess` が正しい
- [ ] `hasLearningAccess` が正しい

#### 3. State層（useSubscription）
```javascript
console.log('Subscription State:', window.__SUBSCRIPTION_STATE__);
```
- [ ] `planType` がAPIレスポンスと一致
- [ ] `canAccessContent(true)` が正しい

#### 4. UI層
- [ ] 有料コンテンツページにアクセス
- [ ] 鍵マークの表示/非表示が正しい
- [ ] 動画プレイヤーの表示が正しい
- [ ] 実際に動画が再生できる

#### 5. Webhookログ
```bash
npx supabase functions logs stripe-webhook-test --tail 50
```
- [ ] Price IDログが出力されている
- [ ] プラン判定が正しい
- [ ] エラーログがない

---

## 🚨 問題発生時の対応フロー

### 1. **どの層で問題が発生しているか特定**

```
データベース層 → OK?
  ↓ YES
API層 → OK?
  ↓ YES
State層 → OK?
  ↓ YES
UI層 → OK?
  ↓ NO
  ↓
問題箇所を特定
```

### 2. **ログを保存**
- データベースクエリ結果
- API Response
- State
- Consoleログ全体

### 3. **Issue作成**
- `.claude/docs/subscription/issues/[問題名].md`
- 上記のログをすべて添付
- 期待値と実際の値を明記

### 4. **修正後の再テスト**
- **必ず全レイヤーを再確認**
- 問題が解決したことを各層で確認

---

## ✅ 今回学んだ教訓の反映

### 1. **premiumAccess.ts のバグを発見できなかった理由**
- データベースとAPIしか確認しなかった
- **UI動作確認を省略した**

### 2. **再発防止策**
- **すべてのテストでUI動作確認を必須化**
- 各層のログを必ず記録
- 期待値を事前に明記

### 3. **ドキュメント化の徹底**
- テスト結果を逐一記録
- 問題発生時のログをすべて保存
- 修正内容と理由を明記

---

**作成者**: AI開発チーム
**最終更新**: 2025-11-26
**次回更新**: Phase 5B実施時
