# 現在のデータ状況

**確認日**: 2025-11-19
**目的**: 移行前の現状を記録

---

## 📊 Supabaseテーブルの現状

### データ件数（SQL実行結果）

| テーブル名 | 件数 | 状態 |
|-----------|------|------|
| `stripe_customers` | 8件 | テストデータ |
| `user_subscriptions` | 1件 | テストデータ |
| `subscriptions` | 7件 | テストデータ |

### 判定

**全てテストデータ**と判断されます。

**理由**:
- 件数が非常に少ない（既存顧客2,162人に対して8件のみ）
- 最近作成されたデータ（2025/11/17-18）
- 新実装のテスト中のデータ

### 移行前の対応

✅ **これらのテストデータは削除してOK**

移行スクリプト実行前に以下を実行：
```sql
-- テストデータをクリア
DELETE FROM subscriptions;
DELETE FROM user_subscriptions;
DELETE FROM stripe_customers;
```

---

## 💳 Stripeの現状（本番データ）

### 顧客サンプル1: 春奈 宮地

**基本情報**:
- Customer ID: `cus_TRW1X1sonM5NPt`
- Email: `harunaru888@gmail.com`
- 作成日: 2025/11/18

**サブスクリプション**:
- Subscription ID: （ログから推定: sub_xxxxx）
- Price ID: `price_1RStCiKUVUnt8GtyKJiieo6d`
- プラン: スタンダードプラン[3ヶ月JP]
- 価格: ¥17,400（3ヶ月一括）= **¥5,800/月**
- 頻度: 3ヶ月ごと
- 次回請求日: 2026/02/18
- ステータス: 有効（Active）
- キャンセル予定: なし

**支払い履歴**:
- 2025/11/18 09:45 - ¥17,400 成功（Subscription creation）
- 支払い方法: Visa ••••6744

**メタデータ**:
```json
{
  "msAppId": "app_cl9jkke7100ij0vkwg01c7s4v",
  "msMemberId": "mem_cmi3umdrk0inl0tt2bpfj4lfy"
}
```

---

### 顧客サンプル2: Tanology

**基本情報**:
- Customer ID: `cus_TRLl1ny6J3pRBp`
- Email: `amiried@icloud.com`
- 作成日: 2025/11/17

**サブスクリプション**:
- Subscription ID: （ログから推定: sub_xxxxx）
- Price ID: `price_1RStBiKUVUnt8GtynMfKweby`
- プラン: スタンダードプラン[1ヶ月JP]
- 価格: ¥6,800/月
- 頻度: 毎月
- 次回請求日: 2025/12/17
- ステータス: 有効（Active）
- キャンセル予定: なし

**支払い履歴**:
- 2025/11/17 23:07 - ¥6,800 成功（Subscription creation）
- 支払い方法: Visa ••••4027

**メタデータ**:
```json
{
  "msAppId": "app_cl9jkke7100ij0vkwg01c7s4v",
  "msMemberId": "mem_cmi37wcp10b8t0ssd99h26c6i"
}
```

---

## 📋 Stripeプラン構成

### 判明している情報

**テストと同じ構成**とのことなので、`.env`ファイルから確認：

| プラン名 | 期間 | 価格 | Price ID | 備考 |
|---------|------|------|----------|------|
| Standard | 1ヶ月 | ¥6,800/月 | `price_1RStBiKUVUnt8GtynMfKweby` | サンプル2で確認 |
| Standard | 3ヶ月 | ¥5,800/月 | `price_1RStCiKUVUnt8GtyKJiieo6d` | サンプル1で確認 |
| Feedback | 1ヶ月 | ¥1,480/月 | `price_1OIiMRKUVUnt8GtyMGSJIH8H` | .envから |
| Feedback | 3ヶ月 | ¥1,280/月 | `price_1OIiMRKUVUnt8GtyttXJ71Hz` | .envから |

### ⚠️ 重要な発見

**既存顧客のプランと、テスト実装のプランが異なる！**

| 項目 | 既存顧客（本番） | テスト実装 | 差額 |
|------|---------------|-----------|------|
| Standard 1ヶ月 | ¥6,800/月 | ¥4,000/月 | -¥2,800 |
| Standard 3ヶ月 | ¥5,800/月 | ¥3,800/月 | -¥2,000 |

**対応方針**:
1. 既存顧客（250人）は既存Price IDを維持
2. テスト実装のPrice IDは削除または別プランとして管理
3. 新規顧客向けに新Price IDを作成するか検討

---

## 🔍 MemberStackのメタデータ

### 確認事項

両方の顧客に以下のメタデータが存在：
```json
{
  "msAppId": "app_cl9jkke7100ij0vkwg01c7s4v",
  "msMemberId": "mem_xxxxx"
}
```

**重要**:
- `msAppId`: MemberStackのアプリケーションID（全ユーザー共通）
- `msMemberId`: MemberStackのメンバーID（ユーザーごとに異なる）

**移行時の対応**:
- Stripe Customer IDだけでなく、MemberStack Member IDも紐付けに使える可能性
- メタデータを保持しておけば、後でMemberStackと照合可能

---

## 📊 データ分析結果

### 1. 既存顧客の状況

**総数**: 2,162人（ヒアリングより）
**アクティブサブスクリプション**: 250件（ヒアリングより）
**確認できたサンプル**: 2件

**サンプルからの推定**:
- 全員がMemberStackメタデータを持っている可能性が高い
- Stripe上に顧客データとサブスクリプションデータが存在
- メールアドレスでの紐付けが可能

---

### 2. Supabaseの状況

**現状**: ほぼ空（テストデータのみ8件）

**移行前の準備**:
```sql
-- 1. テストデータをクリア
DELETE FROM subscriptions;
DELETE FROM user_subscriptions;
DELETE FROM stripe_customers;

-- 2. データ件数を確認（0件になっていることを確認）
SELECT COUNT(*) FROM stripe_customers;
SELECT COUNT(*) FROM user_subscriptions;
SELECT COUNT(*) FROM subscriptions;
```

---

### 3. 価格の不一致問題

**問題**:
- 既存顧客: ¥6,800/月、¥5,800/月
- テスト実装: ¥4,000/月、¥3,800/月

**影響**:
- 既存顧客を新Price IDに移行すると値下げになる
- 課金額が変わると顧客に影響

**対策**:
1. **既存顧客は既存Price IDを維持**（推奨）
   - 現在のサブスクリプションIDをそのまま使用
   - 価格変更なし

2. **新価格でリリース**
   - 新規顧客のみ新Price ID（¥4,000/月、¥3,800/月）を使用
   - 既存顧客には影響なし

---

## 🎯 移行戦略の確定

### Phase 1: データ同期（バックグラウンド）

#### Step 1: Supabaseのクリーンアップ
```sql
DELETE FROM subscriptions;
DELETE FROM user_subscriptions;
DELETE FROM stripe_customers;
```

#### Step 2: Stripeデータのエクスポート
- 顧客データ（2,162人）
- サブスクリプションデータ（250件 + 解約済みユーザー）

#### Step 3: Supabase Authユーザーの作成
- 2,162人分のAuthアカウントを作成
- メールアドレスをキーに使用

#### Step 4: データの同期
- `stripe_customers` テーブルに2,162件
- `user_subscriptions` テーブルに250件（アクティブのみ）
- `subscriptions` テーブルに履歴

---

### Phase 2: 並行稼働

#### 既存サイト
- MemberStack + Stripe
- 既存Price ID（¥6,800/月、¥5,800/月）
- そのまま稼働

#### 新サイト
- Supabase + Stripe
- 同じStripeアカウント、同じサブスクリプション
- テスト稼働

---

### Phase 3: 完全移行

- ユーザーを新サイトに誘導
- 既存サイトを停止
- MemberStackを廃止

---

## 📝 次のアクション

### すぐにやること

1. **Stripeデータの完全エクスポート**
   - Stripe Dashboard → 顧客 → エクスポート（CSV）
   - Stripe Dashboard → サブスクリプション → エクスポート（CSV）

2. **移行スクリプトの作成**
   - Supabase Authユーザー作成スクリプト
   - データ同期スクリプト

3. **サンプルデータでテスト**
   - 10件のサンプルで移行テスト
   - データの整合性確認

---

## ⚠️ 重要な確認事項

### 質問1: 価格について

既存顧客（¥6,800/月）とテスト実装（¥4,000/月）で価格が異なりますが、どうしますか？

- [ ] **オプションA**: 既存顧客は既存価格を維持（推奨）
- [ ] **オプションB**: 全員を新価格に統一（値下げ）
- [ ] **オプションC**: その他

### 質問2: MemberStackについて

MemberStackは移行後も使い続けますか？

- [ ] **はい**: データを保持
- [ ] **いいえ**: 完全に廃止

---

**次回報告時に必要な情報**:
- StripeからエクスポートしたCSVファイル（顧客 & サブスクリプション）
- 上記2つの質問への回答

---

**作成日**: 2025-11-19
**次回更新**: エクスポートデータ取得後
