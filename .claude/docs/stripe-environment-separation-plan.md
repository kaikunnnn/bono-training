# Stripe テスト環境と本番環境の分離実装計画

**作成日**: 2025-11-20
**目的**: テスト環境と本番環境を併用できるようにする

---

## 現状分析

### 問題の発覚

**エラーメッセージ**:
```
No such customer: 'cus_L0JKBpYsVEJwNW';
a similar object exists in live mode, but a test mode key was used to make this request.
```

### 原因

- **データベース**: 本番環境のStripe顧客ID（`cus_L0JKBpYsVEJwNW`）が保存されている
- **Edge Function**: テスト環境のStripe Secret Keyを使用している
- **結果**: 本番の顧客IDをテスト用のAPIキーで呼び出そうとしてエラー

### 現在の状況

1. **プロジェクトフェーズ**: 開発/テスト段階
2. **データベース**: 本番データ（2,162件）とテストデータが混在
3. **テストアカウント**: `takumi.kai.skywalker@gmail.com` (User ID: `71136a45-a876-48fa-a16a-79b031226b8a`)
   - 本番環境にも同じメールアドレスが存在
   - 現在のデータは本番環境のStripe顧客ID（`cus_L0JKBpYsVEJwNW`）

---

## 一般的な方法論

Stripeでテスト環境と本番環境を併用する標準的な方法：

### 方法1: 環境変数による切り替え（推奨）

**メリット**:
- 1つのコードベースで両方の環境に対応
- デプロイ時に環境変数を切り替えるだけ
- 本番データとテストデータが完全に分離される

**デメリット**:
- 環境変数の管理が必要

### 方法2: データベースに環境フラグを保存

**メリット**:
- ユーザーごとに環境を切り替えられる
- 同じデータベースで両方の環境を管理できる

**デメリット**:
- 実装が複雑
- 本番データとテストデータが混在するリスク

### 方法3: 顧客IDのプレフィックスで判定

**メリット**:
- 自動的に環境を判定できる
- 既存データに対応可能

**デメリット**:
- Stripeのテスト顧客IDは通常`cus_...`で本番と同じ形式
- 確実な判定が難しい

---

## 推奨する解決策

**方法1（環境変数による切り替え）+ 顧客IDによる自動判定**を組み合わせる。

### 実装方針

1. **環境変数の追加**
   - `STRIPE_SECRET_KEY`: テスト環境用（既存）
   - `STRIPE_LIVE_SECRET_KEY`: 本番環境用（新規追加）

2. **自動判定ロジック**
   - 顧客IDまたはサブスクリプションIDから環境を判定
   - 判定できない場合は、デフォルトでテスト環境を使用

3. **データベース設計の改善**
   - `stripe_customers`テーブルに`environment`カラムを追加（オプション）
   - 値: `'test'` または `'live'`

---

## 実装計画

### ステップ1: 環境変数の設定

**必要な環境変数**:
```bash
STRIPE_SECRET_KEY=sk_test_xxxxx          # テスト環境用（既存）
STRIPE_LIVE_SECRET_KEY=sk_live_xxxxx     # 本番環境用（新規）
```

**設定方法**:
```bash
npx supabase secrets set STRIPE_LIVE_SECRET_KEY="sk_live_xxxxx"
```

### ステップ2: Edge Functionsの修正

**対象ファイル**:
- `supabase/functions/create-customer-portal/index.ts`
- `supabase/functions/create-checkout/index.ts`
- `supabase/functions/stripe-webhook/index.ts`

**修正内容**:

#### 環境判定ヘルパー関数の追加

```typescript
/**
 * Stripe顧客IDから環境（テスト/本番）を判定する
 * テスト環境の顧客IDかどうかを判定するロジック
 */
function isTestMode(customerId: string | null, subscriptionId?: string): boolean {
  // 1. 環境変数で強制的にモードを指定している場合
  const forceMode = Deno.env.get('STRIPE_FORCE_MODE');
  if (forceMode === 'test') return true;
  if (forceMode === 'live') return false;

  // 2. サブスクリプションIDで判定（Stripeのテストモードは`sub_`の後に特定のパターン）
  // ただし、Stripeのテストと本番で顧客IDの形式は同じなので、
  // 確実な判定は難しい

  // 3. デフォルトはテストモード（安全のため）
  return true;
}

/**
 * 適切なStripe APIキーを取得する
 */
function getStripeKey(isTest: boolean): string {
  if (isTest) {
    return Deno.env.get('STRIPE_SECRET_KEY') || '';
  } else {
    return Deno.env.get('STRIPE_LIVE_SECRET_KEY') || Deno.env.get('STRIPE_SECRET_KEY') || '';
  }
}
```

#### create-customer-portal の修正

```typescript
// Stripeクライアントの初期化を動的に行う
const isTest = isTestMode(stripeCustomerId);
const stripeKey = getStripeKey(isTest);
const stripe = new Stripe(stripeKey, {
  apiVersion: '2023-10-16',
});

console.log('Stripe環境:', isTest ? 'テストモード' : '本番モード');
```

### ステップ3: データベーススキーマの改善（オプション）

**migration SQL**:
```sql
-- stripe_customersテーブルにenvironmentカラムを追加
ALTER TABLE stripe_customers
ADD COLUMN environment TEXT DEFAULT 'live' CHECK (environment IN ('test', 'live'));

-- user_subscriptionsテーブルにもenvironmentカラムを追加
ALTER TABLE user_subscriptions
ADD COLUMN environment TEXT DEFAULT 'live' CHECK (environment IN ('test', 'live'));

-- インデックスを追加
CREATE INDEX idx_stripe_customers_environment ON stripe_customers(environment);
CREATE INDEX idx_user_subscriptions_environment ON user_subscriptions(environment);
```

**移行スクリプト**:
既存データのenvironmentを設定する。

---

## 現時点での暫定対応

### 問題

Stripeの顧客IDだけでは、テスト環境か本番環境かを確実に判定できない。

### 質問

以下のいずれかの方法で進めます：

#### オプションA: 環境変数で手動切り替え（シンプル）

**メリット**: 実装が簡単
**デメリット**: テストと本番を同時に使えない

1. 現在は開発段階なので、`STRIPE_SECRET_KEY`をテスト環境のキーに設定
2. 本番公開時に`STRIPE_SECRET_KEY`を本番環境のキーに切り替え

**実装**:
- Edge Functionsの変更なし
- 環境変数を切り替えるだけ

#### オプションB: データベースにenvironmentカラムを追加（推奨）

**メリット**: テストと本番を同時に使える
**デメリット**: データベーススキーマ変更が必要

1. `stripe_customers`と`user_subscriptions`に`environment`カラムを追加
2. Edge Functionsで`environment`を見て適切なAPIキーを使用
3. 既存の2,162件のデータは`environment='live'`に設定
4. 新規テストデータは`environment='test'`に設定

**実装**:
- データベースマイグレーション
- Edge Functionsの修正
- Checkout時に環境を判定して保存

#### オプションC: ユーザーのメールアドレスで判定

**メリット**: 既存データに対応可能
**デメリット**: メールアドレスの管理が必要

1. テスト用メールアドレスのリストを環境変数に保存
2. ユーザーのメールアドレスがリストに含まれていればテスト環境を使用

**実装**:
```typescript
const TEST_EMAILS = (Deno.env.get('TEST_USER_EMAILS') || '').split(',');
const isTest = TEST_EMAILS.includes(user.email);
```

---

## 推奨案

**オプションB（environmentカラム追加）**を推奨します。

理由：
- テストと本番を同時に使える
- 将来的に拡張しやすい
- データの整合性が保たれる

ただし、緊急で動かす必要がある場合は、**オプションC（メールアドレス判定）**を一時的に使用し、後でオプションBに移行することも可能です。

---

## 実装優先度

### 緊急対応（今すぐ動かす）

**オプションC: メールアドレス判定**

1. 環境変数に本番のStripe Secret Keyを追加
2. テスト用メールアドレスを環境変数に設定
3. Edge Functionsでメールアドレスを見て環境を判定

**所要時間**: 30分

### 恒久対応（今後のために正しく実装）

**オプションB: environmentカラム追加**

1. データベースマイグレーション
2. Edge Functionsの修正
3. 既存データの移行

**所要時間**: 2-3時間

---

## 次のステップ

どの方法で進めるか決定してください：

1. **緊急対応**: オプションC（メールアドレス判定）で今すぐ動かす
2. **恒久対応**: オプションB（environmentカラム追加）で正しく実装する
3. **両方**: まずオプションCで動かし、後でオプションBに移行する

決定後、具体的な実装手順を提示します。
