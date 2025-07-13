# 課金周りのテスト結果 7/13

エラーが多くありうまく決済ができてないように見える

---

## 新規登録 → プラン登録

### プランページではじめるでエラー

- 非ログイン → プランのページで 1 ヶ月プランを選択して「アカウントを作成して始める」を押したら以下のエラー

#### エラー内容

### アカウントログイン

- メール認証が必要な状態になってる？
- 必要ないので撤廃する

---

## マイページ /profile

マイページ自体は表示されるが、アカウント周りの情報が表示されない。Console を見るとエラーが出ていた。
ログイン中のアカウントのメールアドレスはきちんと表示される。

### /profile - ユーザー情報の取得がエラーになっている気がする

### /training/profile ユーザーデータの取得ができない

---

## training/profile の表示

そもそもエラーで表示できていない

#### エラー内容

App - SubscriptionProvider loaded: true
index-uXNNARyt.js:278 Edge Function からトレーニング詳細を取得: profile
index-uXNNARyt.js:230 Auth state changed: SIGNED_IN
index-uXNNARyt.js:230 Auth state changed: INITIAL_SESSION
index-uXNNARyt.js:230 購読状態確認結果: {error: true, message: 'サーバー内部エラーが発生しました', subscribed: false, planType: null}
index-uXNNARyt.js:230 Edge Function から取得したアクセス権限を使用: {hasMemberAccess: false, hasLearningAccess: false, planType: null}
index-uXNNARyt.js:230 購読状態確認結果: {error: true, message: 'サーバー内部エラーが発生しました', subscribed: false, planType: null}
index-uXNNARyt.js:230 Edge Function から取得したアクセス権限を使用: {hasMemberAccess: false, hasLearningAccess: false, planType: null}
index-uXNNARyt.js:230 購読状態確認結果: {error: true, message: 'サーバー内部エラーが発生しました', subscribed: false, planType: null}
index-uXNNARyt.js:230 Edge Function から取得したアクセス権限を使用: {hasMemberAccess: false, hasLearningAccess: false, planType: null}
index-uXNNARyt.js:228 POST https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/get-training-detail 404 (Not Found)
(anonymous) @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:228
i @ index-uXNNARyt.js:228
Promise.then
d @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:228
TO @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:223
(anonymous) @ index-uXNNARyt.js:223
(anonymous) @ index-uXNNARyt.js:223
EI @ index-uXNNARyt.js:223
invoke @ index-uXNNARyt.js:223
f5 @ index-uXNNARyt.js:278
queryFn @ index-uXNNARyt.js:278
r @ index-uXNNARyt.js:196
g @ index-uXNNARyt.js:196
start @ index-uXNNARyt.js:196
fetch @ index-uXNNARyt.js:196
Mi @ index-uXNNARyt.js:196
onSubscribe @ index-uXNNARyt.js:196
subscribe @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
tb @ index-uXNNARyt.js:38
Pu @ index-uXNNARyt.js:40
ys @ index-uXNNARyt.js:40
Pv @ index-uXNNARyt.js:40
Ho @ index-uXNNARyt.js:38
** @ index-uXNNARyt.js:40
er @ index-uXNNARyt.js:40
Rb @ index-uXNNARyt.js:40
C @ index-uXNNARyt.js:25
M @ index-uXNNARyt.js:25
index-uXNNARyt.js:278 Edge Function エラー詳細: {error: FunctionsHttpError: Edge Function returned a non-2xx status code
at yI.<anonymous> (https://pre…, errorType: 'object', errorName: 'FunctionsHttpError', errorMessage: 'Edge Function returned a non-2xx status code', errorStack: 'FunctionsHttpError: Edge Function returned a non-2…ng.lovable.app/assets/index-uXNNARyt.js:223:5414)', …}
ex @ index-uXNNARyt.js:278
f5 @ index-uXNNARyt.js:278
await in f5
queryFn @ index-uXNNARyt.js:278
r @ index-uXNNARyt.js:196
g @ index-uXNNARyt.js:196
start @ index-uXNNARyt.js:196
fetch @ index-uXNNARyt.js:196
Mi @ index-uXNNARyt.js:196
onSubscribe @ index-uXNNARyt.js:196
subscribe @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
tb @ index-uXNNARyt.js:38
Pu @ index-uXNNARyt.js:40
ys @ index-uXNNARyt.js:40
Pv @ index-uXNNARyt.js:40
Ho @ index-uXNNARyt.js:38
** @ index-uXNNARyt.js:40
er @ index-uXNNARyt.js:40
Rb @ index-uXNNARyt.js:40
C @ index-uXNNARyt.js:25
M @ index-uXNNARyt.js:25
index-uXNNARyt.js:278 Edge Function からトレーニング詳細を取得: profile
index-uXNNARyt.js:228 POST https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/get-training-detail 404 (Not Found)
(anonymous) @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:228
i @ index-uXNNARyt.js:228
Promise.then
d @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:228
TO @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:223
(anonymous) @ index-uXNNARyt.js:223
(anonymous) @ index-uXNNARyt.js:223
EI @ index-uXNNARyt.js:223
invoke @ index-uXNNARyt.js:223
f5 @ index-uXNNARyt.js:278
queryFn @ index-uXNNARyt.js:278
r @ index-uXNNARyt.js:196
g @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
Promise.then
(anonymous) @ index-uXNNARyt.js:196
Promise.catch
g @ index-uXNNARyt.js:196
start @ index-uXNNARyt.js:196
fetch @ index-uXNNARyt.js:196
Mi @ index-uXNNARyt.js:196
onSubscribe @ index-uXNNARyt.js:196
subscribe @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
tb @ index-uXNNARyt.js:38
Pu @ index-uXNNARyt.js:40
ys @ index-uXNNARyt.js:40
Pv @ index-uXNNARyt.js:40
Ho @ index-uXNNARyt.js:38
** @ index-uXNNARyt.js:40
er @ index-uXNNARyt.js:40
Rb @ index-uXNNARyt.js:40
C @ index-uXNNARyt.js:25
M @ index-uXNNARyt.js:25
index-uXNNARyt.js:278 Edge Function エラー詳細: {error: FunctionsHttpError: Edge Function returned a non-2xx status code
at yI.<anonymous> (https://pre…, errorType: 'object', errorName: 'FunctionsHttpError', errorMessage: 'Edge Function returned a non-2xx status code', errorStack: 'FunctionsHttpError: Edge Function returned a non-2…ng.lovable.app/assets/index-uXNNARyt.js:223:5414)', …}
ex @ index-uXNNARyt.js:278
f5 @ index-uXNNARyt.js:278
await in f5
queryFn @ index-uXNNARyt.js:278
r @ index-uXNNARyt.js:196
g @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
Promise.then
(anonymous) @ index-uXNNARyt.js:196
Promise.catch
g @ index-uXNNARyt.js:196
start @ index-uXNNARyt.js:196
fetch @ index-uXNNARyt.js:196
Mi @ index-uXNNARyt.js:196
onSubscribe @ index-uXNNARyt.js:196
subscribe @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
tb @ index-uXNNARyt.js:38
Pu @ index-uXNNARyt.js:40
ys @ index-uXNNARyt.js:40
Pv @ index-uXNNARyt.js:40
Ho @ index-uXNNARyt.js:38
** @ index-uXNNARyt.js:40
er @ index-uXNNARyt.js:40
Rb @ index-uXNNARyt.js:40
C @ index-uXNNARyt.js:25
M @ index-uXNNARyt.js:25
index-uXNNARyt.js:278 Edge Function からトレーニング詳細を取得: profile
index-uXNNARyt.js:228 POST https://fryogvfhymnpiqwssmuu.supabase.co/functions/v1/get-training-detail 404 (Not Found)
(anonymous) @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:228
i @ index-uXNNARyt.js:228
Promise.then
d @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:228
TO @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:228
(anonymous) @ index-uXNNARyt.js:223
(anonymous) @ index-uXNNARyt.js:223
(anonymous) @ index-uXNNARyt.js:223
EI @ index-uXNNARyt.js:223
invoke @ index-uXNNARyt.js:223
f5 @ index-uXNNARyt.js:278
queryFn @ index-uXNNARyt.js:278
r @ index-uXNNARyt.js:196
g @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
Promise.then
(anonymous) @ index-uXNNARyt.js:196
Promise.catch
g @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
Promise.then
(anonymous) @ index-uXNNARyt.js:196
Promise.catch
g @ index-uXNNARyt.js:196
start @ index-uXNNARyt.js:196
fetch @ index-uXNNARyt.js:196
Mi @ index-uXNNARyt.js:196
onSubscribe @ index-uXNNARyt.js:196
subscribe @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
tb @ index-uXNNARyt.js:38
Pu @ index-uXNNARyt.js:40
ys @ index-uXNNARyt.js:40
Pv @ index-uXNNARyt.js:40
Ho @ index-uXNNARyt.js:38
** @ index-uXNNARyt.js:40
er @ index-uXNNARyt.js:40
Rb @ index-uXNNARyt.js:40
C @ index-uXNNARyt.js:25
M @ index-uXNNARyt.js:25
index-uXNNARyt.js:278 Edge Function エラー詳細: {error: FunctionsHttpError: Edge Function returned a non-2xx status code
at yI.<anonymous> (https://pre…, errorType: 'object', errorName: 'FunctionsHttpError', errorMessage: 'Edge Function returned a non-2xx status code', errorStack: 'FunctionsHttpError: Edge Function returned a non-2…ng.lovable.app/assets/index-uXNNARyt.js:223:5414)', …}
ex @ index-uXNNARyt.js:278
f5 @ index-uXNNARyt.js:278
await in f5
queryFn @ index-uXNNARyt.js:278
r @ index-uXNNARyt.js:196
g @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
Promise.then
(anonymous) @ index-uXNNARyt.js:196
Promise.catch
g @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
Promise.then
(anonymous) @ index-uXNNARyt.js:196
Promise.catch
g @ index-uXNNARyt.js:196
start @ index-uXNNARyt.js:196
fetch @ index-uXNNARyt.js:196
Mi @ index-uXNNARyt.js:196
onSubscribe @ index-uXNNARyt.js:196
subscribe @ index-uXNNARyt.js:196
(anonymous) @ index-uXNNARyt.js:196
tb @ index-uXNNARyt.js:38
Pu @ index-uXNNARyt.js:40
ys @ index-uXNNARyt.js:40
Pv @ index-uXNNARyt.js:40
Ho @ index-uXNNARyt.js:38
** @ index-uXNNARyt.js:40
er @ index-uXNNARyt.js:40
Rb @ index-uXNNARyt.js:40
C @ index-uXNNARyt.js:25
M @ index-uXNNARyt.js:25
index-uXNNARyt.js:230 Auth state changed: SIGNED_IN
index-uXNNARyt.js:230 購読状態確認結果: {error: true, message: 'サーバー内部エラーが発生しました', subscribed: false, planType: null}
index-uXNNARyt.js:230 Edge Function から取得したアクセス権限を使用: {hasMemberAccess: false, hasLearningAccess: false, planType: null}

---

## ログイン後：プランページからプランの課金について

Stripe Checkout まで開いてページ表示上は課金ができているように見えるが、実際 Console にはエラーが出ていたり、Stripe では課金が確認できるが、Supabase ではそれらしき情報がわからなかったりした。

### Stripe 決済画面へは行くが

以下のようなエラー表示をしていた

#### Stripe Checkout のページに来たばかりの時のエラー

> <link rel=preload> uses an unsupported `as` value
> cs_test_a1sFut0JcE8S…TFTnkCUFPOfwR5icg:6 Uncaught (in promise) Error: Cannot find module './en'

    at cs_test_a1sFut0JcE8S…FPOfwR5icg:6:302452

> POST https://play.google.com/log?format=json&hasfast=true&authuser=0 net::ERR_BLOCKED_BY_CONTENT_BLOCKER

#### Stripe Checkout のページでカード情報を入力すると

課金ができたようなアニメーションが入り、その後 /profile ページにリダイレクトされるが
/profile では課金できているステータスは表示されず
"""サブスクリプション情報
現在のプラン

フリープラン
登録中のプランはありません"""
の表示。Condole はマイページ /profile のエラーになっていて、そもそもデータを取得できてない気がする。

### 課金できているか Supabase と Stripe をチェック

#### Stripe では

- 支払いは完了しているような表示になっている。最近のアクティビティで支払い成功を確認

#### Supabase では

- table editor のページに表示されるページではそもそもそれらしい情報を全く確認できなかった

---

# 課金システム統合仕様書

## BONO デザイン学習プラットフォーム

作成日: 2025 年 7 月 13 日  
バージョン: 1.0

---

## 1. 現状分析

### 1.1 確認された問題点

テスト実施日: 2025 年 7 月 13 日

#### エラー一覧

1. **Edge Function エラー**

   - `get-training-detail` が 404 エラー (Edge Function が存在しない)
   - `check-subscription` でサーバー内部エラーが発生

2. **認証関連**

   - メール認証が有効になっており、ユーザーがすぐにログインできない
   - 新規登録後の自動ログインが機能しない

3. **決済フロー**

   - Stripe では決済成功しているが、Supabase にデータが保存されない
   - プロフィールページで課金ステータスが「フリープラン」のまま表示される
   - Stripe Webhook が正しく機能していない

4. **データ整合性**
   - `user_subscriptions`テーブルにサブスクリプション情報が保存されない
   - `stripe_customers`テーブルとの紐付けが機能していない

### 1.2 影響範囲

- 新規ユーザーが有料プランに登録できない
- 既存ユーザーも有料コンテンツにアクセスできない
- `/training`配下のプレミアムコンテンツが表示されない

---

## 2. 達成目標

### 2.1 最終目標

ユーザーが課金を行い、その課金ステータスに基づいて適切なコンテンツにアクセスできるようにする。

### 2.2 具体的な達成基準

1. **認証フロー**

   - [ ] 新規登録後、メール認証なしですぐにログインできる
   - [ ] 登録完了後、自動的にログイン状態になる

2. **決済フロー**

   - [ ] 非ログインユーザーがプラン選択 → アカウント登録 → 決済まで一連の流れで完了できる
   - [ ] 選択したプラン情報が登録画面に引き継がれる
   - [ ] アカウント作成後、自動的に Stripe Checkout が起動する
   - [ ] Stripe での決済完了後、自動的に Supabase にデータが保存される
   - [ ] プロフィールページで正しいプラン名が表示される
   - [ ] 決済完了後、即座に有料コンテンツにアクセスできる

3. **コンテンツアクセス制御**
   - [ ] 無料ユーザーには`/training`のプレミアムタスクで制限表示される
   - [ ] 有料ユーザー（members 権限）は全コンテンツを閲覧できる
   - [ ] 動画コンテンツの出し分けが正しく機能する

---

## 3. プラン体系と権限

### 3.1 プラン構成

| プラン    | 月額料金 | 権限              | アクセス可能コンテンツ           |
| --------- | -------- | ----------------- | -------------------------------- |
| free      | 無料     | なし              | 無料コンテンツのみ               |
| community | 1,480 円 | member            | メンバー限定コンテンツ           |
| standard  | 4,000 円 | member + learning | 学習コンテンツ＋メンバー限定     |
| growth    | 9,800 円 | member + learning | 全コンテンツ＋フィードバック機能 |

### 3.2 権限判定ロジック

```javascript
// 権限の判定方法
const hasMemberAccess = ["standard", "growth", "community"].includes(planType);
const hasLearningAccess = ["standard", "growth"].includes(planType);
```

---

## 4. 段階的実装計画

### Phase 1: 基盤修正（即対応必要）

**目標**: エラーを解消し、基本的な決済フローを機能させる  
**所要時間**: 2-3 時間

#### 4.1.1 Edge Function 修正

```typescript
// 1. get-training-detailをデプロイ
supabase functions deploy get-training-detail

// 2. check-subscriptionのエラー修正
supabase functions deploy check-subscription
```

#### 4.1.2 メール認証の無効化

```sql
-- Supabase管理画面のSQLエディタで実行
UPDATE auth.config
SET enable_signup = true,
    enable_confirmations = false
WHERE id = 'default';
```

#### 4.1.3 必要なテーブル確認

```sql
-- テーブル構造の確認
SELECT * FROM user_subscriptions LIMIT 1;
SELECT * FROM stripe_customers LIMIT 1;
SELECT * FROM subscriptions LIMIT 1;
```

### Phase 2: Webhook 修正（1 日目）

**目標**: Stripe の決済情報を Supabase に正しく保存する  
**所要時間**: 3-4 時間

#### 4.2.1 Stripe Webhook 設定

- Stripe 管理画面で Webhook エンドポイントを設定
- エンドポイント URL: `https://[your-project].supabase.co/functions/v1/stripe-webhook`
- 監視イベント:
  - `checkout.session.completed`
  - `invoice.paid`
  - `customer.subscription.deleted`

#### 4.2.2 Webhook ハンドラー修正

```typescript
// stripe-webhook/index.ts の主要処理
async function handleCheckoutCompleted(session) {
  // 1. 顧客情報の保存/更新
  // 2. user_subscriptionsテーブルの更新
  // 3. プランタイプと権限の設定
}
```

### Phase 3: コンテンツアクセス制御（2 日目）

**目標**: プレミアムコンテンツの出し分けを実装  
**所要時間**: 4-5 時間

#### 4.3.1 Training Guard コンポーネント

```typescript
// TrainingGuard.tsx
const TrainingGuard = ({ children, isPremium }) => {
  const { hasMemberAccess } = useSubscription();

  if (isPremium && !hasMemberAccess) {
    return <PremiumContentBanner />;
  }

  return children;
};
```

#### 4.3.2 タスクコンテンツの出し分け

```typescript
// TaskDetailページでの実装
const content = hasMemberAccess
  ? fullContent
  : content.split("<!-- PREMIUM_ONLY -->")[0];
```

### Phase 4: 統合テスト（3 日目）

**目標**: 全体の動作確認と最適化  
**所要時間**: 2-3 時間

#### 4.4.1 E2E テストシナリオ

1. 新規登録 → プラン選択 → 決済 → コンテンツアクセス
2. 既存ユーザー → プラン変更 → 権限更新確認
3. 解約フロー → アクセス権限の喪失確認

---

## 5. テスト手順

### 5.1 決済フローテスト

```bash
# テスト用クレジットカード
カード番号: 4242 4242 4242 4242
有効期限: 任意の将来日付
CVC: 任意の3桁
```

### 5.2 権限確認テスト

1. **無料ユーザーとして**

   - `/training/[slug]/[premium-task]`にアクセス
   - プレミアムバナーが表示されることを確認

2. **有料ユーザーとして**
   - 同じ URL にアクセス
   - 全コンテンツが表示されることを確認

---

## 6. 監視項目

### 6.1 ログ確認箇所

- Supabase Edge Function Logs
- Stripe Webhook Logs
- ブラウザのコンソールログ

### 6.2 エラー対応フロー

1. エラーログを確認
2. 該当する Phase の実装を再確認
3. 必要に応じてロールバック

---

## 7. リスクと対策

| リスク                     | 影響度 | 対策                           |
| -------------------------- | ------ | ------------------------------ |
| Webhook の重複処理         | 高     | idempotency キーの実装         |
| 権限判定の不整合           | 高     | キャッシュクリアとリトライ機構 |
| Edge Function タイムアウト | 中     | 処理の非同期化                 |

---

## 8. 成功基準

### 8.1 定量的指標

- [ ] 決済成功率 95%以上
- [ ] Edge Function エラー率 1%未満
- [ ] ページロード時間 3 秒以内

### 8.2 定性的指標

- [ ] ユーザーが迷わず決済できる
- [ ] 権限に応じた適切なコンテンツ表示
- [ ] エラー時の分かりやすいメッセージ表示

---

## 付録: 実装チェックリスト

### A. 即対応項目（Phase 1）

- [ ] `get-training-detail` Edge Function の作成とデプロイ
- [ ] `check-subscription` のエラー修正
- [ ] メール認証の無効化
- [ ] テーブル構造の確認

### B. 1 日目完了項目（Phase 2）

- [ ] Stripe Webhook 設定
- [ ] Webhook ハンドラーの実装
- [ ] データベース更新ロジックの実装
- [ ] エラーハンドリングの追加

### C. 2 日目完了項目（Phase 3）

- [ ] TrainingGuard コンポーネントの実装
- [ ] プレミアムコンテンツバナーの作成
- [ ] 動画プレーヤーの権限制御
- [ ] コンテンツ出し分けロジックの実装

### D. 3 日目完了項目（Phase 4）

- [ ] E2E テストの実施
- [ ] パフォーマンス最適化
- [ ] ドキュメントの更新
- [ ] 本番環境へのデプロイ

---

この仕様書に基づいて、AI エンジニアと協力しながら段階的に実装を進めてください。各 Phase の完了時には必ずテストを行い、次の Phase に進む前に動作確認を行うことが重要です。
