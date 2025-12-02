# 現在の実装状況まとめ

**作成日**: 2025-11-19
**ブランチ**: `feature/user_dashboard`
**目的**: データ移行計画のための現在の実装状況を記録

---

## 📊 現在のSupabaseテーブル構造

### 1. `stripe_customers` テーブル

**役割**: StripeのカスタマーIDとSupabaseユーザーIDの紐付け

**カラム構成**（推定）:
```sql
CREATE TABLE stripe_customers (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  stripe_customer_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**使用箇所**:
- `supabase/functions/stripe-webhook/index.ts:205-209`
- Webhook処理でカスタマー情報を保存

---

### 2. `user_subscriptions` テーブル

**役割**: ユーザーのサブスクリプション状態を管理（メインテーブル）

**カラム構成**（実際のマイグレーションから確認）:
```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),

  -- Stripe関連
  stripe_subscription_id TEXT,
  stripe_customer_id TEXT,

  -- プラン情報
  plan_type TEXT NOT NULL,  -- 'standard', 'feedback', 'community'
  duration INTEGER DEFAULT 1,  -- 1 or 3

  -- 状態
  is_active BOOLEAN DEFAULT TRUE,
  plan_members BOOLEAN DEFAULT FALSE,  -- メンバーアクセス権

  -- キャンセル関連（追加予定）
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  cancel_at TIMESTAMPTZ,

  -- 期間情報
  current_period_end TIMESTAMPTZ,  -- 次回更新日

  -- タイムスタンプ
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**インデックス**:
- `idx_user_subscriptions_stripe_customer_id` ON `stripe_customer_id`
- `idx_user_subscriptions_plan_duration` ON `(plan_type, duration)`

**使用箇所**:
- `supabase/functions/create-checkout/index.ts:69-72` - 既存サブスク確認
- `supabase/functions/stripe-webhook/index.ts:213-227` - upsertで保存
- `supabase/functions/check-subscription/index.ts` - ステータス確認

---

### 3. `subscriptions` テーブル

**役割**: サブスクリプション履歴の記録

**カラム構成**（推定）:
```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  stripe_subscription_id TEXT,

  -- 期間
  start_timestamp TIMESTAMPTZ NOT NULL,
  end_timestamp TIMESTAMPTZ,

  -- プラン情報
  plan_members BOOLEAN DEFAULT FALSE,

  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**使用箇所**:
- `supabase/functions/stripe-webhook/index.ts` - 履歴記録用

---

## 🔧 現在の実装フロー

### 新規サブスクリプション作成
```
1. ユーザーが /subscription でプラン選択
   ↓
2. create-checkout Edge Function が呼ばれる
   ↓
3. 既存のアクティブサブスクリプションを確認
   ↓
4. 存在する場合は全てキャンセル（二重課金防止）
   ↓
5. Stripe Checkout Session を作成
   ↓
6. ユーザーが決済完了
   ↓
7. Webhook: checkout.session.completed
   ↓
8. stripe_customers テーブルに upsert
   ↓
9. user_subscriptions テーブルに upsert
   ↓
10. subscriptions テーブルに履歴を記録
```

### データの一意性制約

**現状**:
- `user_subscriptions` テーブルに `user_id` の UNIQUE 制約は**ない**
- `upsert` で `user_id` をキーにして上書き
- **⚠️ 1ユーザーに複数のレコードが存在する可能性あり**

---

## 📍 テストデータの状況

### Q11, Q12の回答から

**`stripe_customers` テーブル**:
- 状態: 不明（要確認）
- テストデータの可能性: あり

**`user_subscriptions` テーブル**:
- 状態: 不明（要確認）
- テストデータの可能性: あり

### 確認が必要な内容

1. **テーブルが空か、データがあるか**
2. **データがある場合、テストデータか本番データか**
3. **複数のレコードが存在するユーザーがいるか**

---

## 🌐 既存システム（Stripe + MemberStack）

### ヒアリング結果から

**顧客数**: 2,162人
**アクティブなサブスクリプション**: 250件
**データ保存場所**:
- Stripe（メイン）
- MemberStack（補助的）

### 既存プラン構成

| プラン名 | 価格       | 期間           | 備考 |
|---------|-----------|---------------|------|
| Standard | ¥6,800/月  | 1ヶ月毎に更新 | - |
| Standard | ¥5,800/月  | 3ヶ月毎に更新 | - |
| Standard | ¥15,800/月 | 1ヶ月毎に更新 | - |
| Standard | ¥13,800/月 | 3ヶ月毎に更新 | - |

**⚠️ 価格が現在の実装と異なる可能性**
- 現在の実装: 4,980円/月、3,800円/月（推定）
- 既存データ: 6,800円/月、5,800円/月、15,800円/月、13,800円/月

### MemberStackについて

**役割**: 不明（要調査）
**推定**:
- 認証・会員管理サービス
- Stripeと連携してサブスクリプション管理
- 独自のユーザーデータベースを持つ可能性

**要調査事項**:
1. MemberStackのデータ構造
2. Stripeとの連携方法
3. メールアドレスの一致状況
4. APIでデータをエクスポート可能か

---

## 🔑 データ紐付けの方針

### 紐付けキー

**優先順位**:
1. **Stripe Customer ID**（最も確実）
2. **メールアドレス**（一般的）

### メールアドレスの扱い

- Stripeの仕様に合わせる
- 大文字小文字の違いは無視（一般的な仕様）

### 重複の可能性

- 同じメールアドレスで複数のStripe顧客: **なし**
- 同じユーザーが複数のサブスクリプション: **なし**

---

## 🚀 移行の方針

### 1. 段階的移行（推奨）

**Phase 1: データ同期**
- 既存Stripeデータを新Supabaseに同期
- 既存サイトはそのまま稼働

**Phase 2: 並行稼働**
- 新サイトをテストリリース
- 既存サイトと新サイトが同時稼働
- 同じアカウントで両方ログイン可能

**Phase 3: 完全移行**
- ユーザーを新サイトに誘導
- 既存サイトを段階的に停止

### 2. ゼロダウンタイム

- サービス停止なしで移行
- 課金を止めない
- 移行失敗時も既存サブスクリプションは継続

---

## ⚠️ 注意事項と懸念

### 1. 価格の不一致

既存プランと新プランの価格が異なる場合の対応:
- 既存ユーザーは既存価格を維持？
- 新価格に統一？
- プランの種類が増える？

### 2. テストデータの混在

移行前に以下を確認:
- 現在のSupabaseテーブルにテストデータがあるか
- テストデータがある場合、削除するか保持するか

### 3. MemberStackとの連携

- MemberStackのデータをどこまで移行するか
- MemberStackは移行後も使い続けるか、完全に廃止するか

### 4. Supabase Authユーザーの作成

既存顧客は誰もSupabase Authに登録していない場合:
- 全ユーザー分のAuthアカウントを作成する必要
- 初回ログイン時にパスワード設定が必要

---

## 📝 次のステップ

### すぐに確認すべきこと

1. **Supabaseテーブルの現在のデータ数**
   ```sql
   SELECT COUNT(*) FROM stripe_customers;
   SELECT COUNT(*) FROM user_subscriptions;
   SELECT COUNT(*) FROM subscriptions;
   ```

2. **MemberStackの調査**
   - 公式ドキュメントを確認
   - APIの有無
   - データエクスポート方法

3. **既存Stripeデータのサンプル取得**
   - Stripe Dashboardから顧客情報をエクスポート
   - サブスクリプション情報をエクスポート

### 移行計画書の作成

上記の情報が揃ったら、以下を作成:
1. 詳細な移行手順書
2. リスク分析とロールバック手順
3. 移行スクリプト
4. テスト計画

---

**最終更新**: 2025-11-19
**次回更新時に追記すべき内容**:
- [ ] Supabaseの現在のデータ状況
- [ ] MemberStackの詳細調査結果
- [ ] 既存Stripeデータのサンプル
