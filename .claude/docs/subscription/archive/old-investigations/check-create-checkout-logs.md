# create-checkout Edge Function のログ確認方法

## 🎯 最も簡単な方法: Supabase Dashboard

### 直接リンク

以下の URL をブラウザで開いてください：

```
https://supabase.com/dashboard/project/fryogvfhymnpiqwssmuu/logs/edge-functions
```

### 手順

1. 上記の URL を開く
2. 左側の関数一覧から **`create-checkout`** をクリック
3. 最新のログを確認

### 確認すべきログ

以下のようなログが表示されるはずです：

```
リクエスト受信: { returnUrl: "...", useTestPrice: true/false, planType: "...", duration: 1/3 }
Stripe環境: test/live
ユーザー認証成功: { userId: "...", email: "..." }
Price ID環境変数 STRIPE_TEST_STANDARD_1M_PRICE_ID: { priceId: "..." }
Checkoutセッション作成完了: { sessionId: "...", url: "...", planType: "...", duration: ... }
```

### エラーログがある場合

以下のようなエラーログを探してください：

```
❌ Error: ...
❌ Checkoutセッション作成エラー: ...
```

---

## 🔍 代替方法: Supabase CLI（現在のバージョンでは利用不可）

現在の Supabase CLI バージョン（2.58.5）では、`functions logs`コマンドが利用できないようです。

### 確認方法

```bash
npx supabase functions --help
```

`logs`コマンドが表示されない場合は、Dashboard を使用してください。

---

## 📊 ログで確認すべきポイント

### 1. 環境判定

- `useTestPrice: true` → テスト環境
- `useTestPrice: false` → 本番環境
- `Stripe環境: test` → テスト環境
- `Stripe環境: live` → 本番環境

### 2. Price ID の取得

- `Price ID環境変数 STRIPE_TEST_STANDARD_1M_PRICE_ID: { priceId: "price_..." }`
- Price ID が正しく取得できているか確認

### 3. エラーの有無

- エラーログがないか確認
- エラーがある場合は、エラーメッセージをコピー

---

## 🚨 よくあるエラー

### エラー 1: "Price ID 環境変数が設定されていません"

**原因:**

- 環境変数が設定されていない

**対処法:**

```bash
npx supabase secrets list | grep STRIPE
```

### エラー 2: "認証されていません"

**原因:**

- 認証トークンが正しく送信されていない

**対処法:**

- フロントエンドの認証状態を確認

### エラー 3: "Stripe 顧客情報の保存に失敗"

**原因:**

- データベースの制約エラー
- RLS（Row Level Security）の問題

**対処法:**

- エラーメッセージの詳細を確認
- データベースの制約を確認

---

## 📝 ログを確認した後の次のステップ

1. **ログの内容をコピー**

   - 特にエラーログがある場合は、エラーメッセージ全体をコピー

2. **問題を特定**

   - エラーメッセージから原因を特定
   - 環境判定が正しいか確認

3. **修正を実施**
   - 原因に応じた修正を実施


