# Stripe アカウント大移動 - 本番公開までの残タスク

**作成日**: 2025-01-19
**ステータス**: Phase 2 完了 → 本番公開準備中

---

## 📊 Phase 2 完了状況

### ✅ 完了した内容

- **Auth ユーザー作成**: 2,162件（50件新規 + 2,110件既存）
- **stripe_customers 同期**: 2,162件（100%成功）
- **user_subscriptions 同期**: 247件（91.5%成功）
- **コードレビュー**: 問題なし（優秀な実装）

### ⚠️ 対応待ち

- **Error 23件の顧客**: サブスクリプションCSVに含まれているが、顧客CSVに含まれていない23件の顧客
- **パスワードリセット対応**: 移行されたユーザーのパスワード設定

---

## 📝 本番公開までの残タスク

### タスク0: 移行ユーザーのパスワードリセット対応（新規追加）⭐

**優先度**: 最高
**所要時間**: 2時間

#### 現状の問題

移行スクリプトで作成されたユーザーは:
- ✅ `auth.users` テーブルに存在する
- ✅ メール確認済み（`email_confirm: true`）
- ❌ **パスワードが設定されていない**

**つまり、ユーザーはログインできない状態です。**

#### 推奨アプローチ: ログイン画面に移行案内バナーを表示

##### 1. ログイン画面の実装

```tsx
// src/pages/Login.tsx

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // パスワード未設定の場合のエラーメッセージ
        if (error.message.includes('Invalid login credentials')) {
          setError(
            'パスワードが設定されていません。「パスワードを再設定する」からパスワードを設定してください。'
          );
        } else {
          setError(error.message);
        }
        return;
      }

      navigate('/');
    } catch (err) {
      setError('ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordReset = () => {
    navigate('/reset-password', { state: { email } });
  };

  return (
    <div className="login-page">
      {/* 移行案内バナー */}
      <div className="migration-banner">
        <div className="banner-icon">📢</div>
        <div className="banner-content">
          <h3>システム移行のお知らせ</h3>
          <p>
            既存のユーザー様は、初回ログイン時にパスワードの再設定が必要です。
            <br />
            下記の「パスワードを再設定する」ボタンからパスワードを設定してください。
          </p>
          <button
            className="reset-password-button"
            onClick={handlePasswordReset}
          >
            パスワードを再設定する
          </button>
        </div>
      </div>

      {/* ログインフォーム */}
      <form onSubmit={handleLogin} className="login-form">
        <h2>ログイン</h2>

        {error && <div className="error-message">{error}</div>}

        <div className="form-group">
          <label htmlFor="email">メールアドレス</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="password">パスワード</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'ログイン中...' : 'ログイン'}
        </button>

        <div className="form-footer">
          <a href="/reset-password">パスワードをお忘れの方</a>
          <a href="/signup">新規登録</a>
        </div>
      </form>
    </div>
  );
}

export default LoginPage;
```

##### 2. スタイルの追加

```css
/* src/pages/Login.css */

.migration-banner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 24px;
  border-radius: 12px;
  margin-bottom: 32px;
  display: flex;
  gap: 16px;
  align-items: flex-start;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.banner-icon {
  font-size: 32px;
}

.banner-content h3 {
  margin: 0 0 8px 0;
  font-size: 20px;
  font-weight: 600;
}

.banner-content p {
  margin: 0 0 16px 0;
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.95;
}

.reset-password-button {
  background: white;
  color: #667eea;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-password-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
```

##### 3. FAQ/ヘルプページに案内を追加

```markdown
# よくある質問

## システム移行後、ログインできません

2025年1月にシステムを移行しました。既存のユーザー様は、
パスワードの再設定が必要です。

### パスワードを再設定する方法

1. [ログインページ](https://your-app.com/login) にアクセス
2. 「パスワードを再設定する」ボタンをクリック
3. メールアドレスを入力して送信
4. メールに届いたリンクからパスワードを設定
5. 新しいパスワードでログイン

### それでもログインできない場合

[お問い合わせフォーム](https://your-app.com/contact) からご連絡ください。
```

#### その他の方法（オプション）

##### 方法A: パスワードリセットメール一斉送信

全ユーザーにパスワード設定用のメールを一斉送信する方法です。

```typescript
// scripts/send-password-reset-emails.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function sendPasswordResetEmails() {
  console.log("📧 Fetching migrated users...");

  // 移行されたユーザーを取得
  let allUsers: any[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page: page,
      perPage: 1000,
    });

    if (error) throw error;

    allUsers = allUsers.concat(
      data.users.filter((u) => u.user_metadata?.migrated_from === "stripe")
    );
    hasMore = data.users.length === 1000;
    page++;
  }

  console.log(`📧 Sending password reset emails to ${allUsers.length} users...\n`);

  let successCount = 0;
  let errorCount = 0;
  const errors: Array<{ email: string; error: string }> = [];

  for (const user of allUsers) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        user.email!,
        {
          redirectTo: "https://your-app.com/reset-password",
        }
      );

      if (error) throw error;

      console.log(`✅ Sent to: ${user.email}`);
      successCount++;

      // レート制限対策（1秒に1件）
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error: any) {
      console.error(`❌ Failed: ${user.email}`, error.message);
      errors.push({ email: user.email!, error: error.message });
      errorCount++;
    }
  }

  console.log("\n========================================");
  console.log("Password Reset Email Summary");
  console.log("========================================");
  console.log(`✅ Success: ${successCount} / ${allUsers.length}`);
  console.log(`❌ Error: ${errorCount}`);

  if (errors.length > 0) {
    fs.writeFileSync(
      "./password-reset-errors.json",
      JSON.stringify(errors, null, 2)
    );
    console.log("\n📝 Error log saved to: password-reset-errors.json");
  }

  console.log("========================================\n");
}

sendPasswordResetEmails().catch(console.error);
```

**注意**: Supabaseの無料プランでは、メール送信に制限があります（1時間に最大100通、1日に最大1,000通）。2,162件のメールを送信する場合、**約3日間かかります**。

##### 方法B: テスト用にパスワードを直接設定

Phase 1の10件のアカウントでテストする場合、管理者権限でパスワードを設定できます。

```typescript
// scripts/set-test-passwords.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const testUsers = [
  "harunaru888@gmail.com",
  "amiried@icloud.com",
  "kagakaori31@gmail.com",
  "ipothos.24@gmail.com",
  "kyousakuramti@gmail.com",
  "mina.luna1026@gmail.com",
  "rintaroy777@gmail.com",
  "krm.19990807@gmail.com",
  "fujimiyu57@gmail.com",
  "edit.11.16.mami@gmail.com",
];

async function setTestPasswords() {
  const testPassword = "TestPassword123!";

  console.log("🔑 Setting test passwords...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const email of testUsers) {
    try {
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find((u) => u.email === email);

      if (!user) {
        console.log(`❌ User not found: ${email}`);
        errorCount++;
        continue;
      }

      await supabase.auth.admin.updateUserById(user.id, {
        password: testPassword,
      });

      console.log(`✅ Password set for: ${email}`);
      successCount++;
    } catch (error: any) {
      console.error(`❌ Failed: ${email}`, error.message);
      errorCount++;
    }
  }

  console.log("\n========================================");
  console.log(`✅ Success: ${successCount} / ${testUsers.length}`);
  console.log(`❌ Error: ${errorCount}`);
  console.log(`\n🔑 Test password: ${testPassword}`);
  console.log("========================================\n");
}

setTestPasswords().catch(console.error);
```

#### ユーザー体験フロー

1. ユーザーがログインページにアクセス
2. 目立つバナーで「パスワード再設定が必要」と案内される
3. 「パスワードを再設定する」ボタンをクリック
4. メールアドレスを入力してリセットメールを送信
5. メールのリンクからパスワードを設定
6. 新しいパスワードでログイン成功 ✅

#### セキュリティ上の注意

❌ **絶対にやってはいけないこと**: メールアドレスだけでパスワード設定を許可する
- これは**アカウント乗っ取り**につながります
- 他人がメールアドレスを知っていれば、勝手にパスワードを設定できてしまいます

✅ **必ずやるべきこと**: パスワードリセットメールを実際のユーザーのメールアドレスに送信
- メールを受信できる人だけがパスワードを設定できる
- 安全で標準的な方法です

#### 成功基準

- ログイン画面に移行案内バナーが表示される
- パスワードリセットフローが正常に動作する
- FAQ/ヘルプページに案内が追加される
- テスト用に10件のアカウントにパスワードが設定される

#### 所要時間

- ログイン画面実装: 1時間
- FAQ追加: 30分
- テスト用パスワード設定: 20分
- **合計: 1時間50分**

---

### タスク1: Error 23件の顧客を手動で追加 ⏳

**優先度**: 中
**所要時間**: 30分

#### 実施内容

1. エラーログを確認
   ```bash
   cat migration-errors-subscriptions.json | jq '.[] | .error'
   ```

2. 23件の顧客IDをリストアップ
   - cus_SuMlz8qlbExeOt
   - cus_RloRQlVv97KPRq
   - cus_SJ9WVWiXLuSTDd
   - （他20件）

3. Stripe Dashboardから該当顧客をエクスポート
   - Stripe Dashboard → Customers
   - 各Customer IDで検索
   - 顧客情報をCSVにまとめる

4. 移行スクリプトを再実行
   ```bash
   # 1. 顧客を追加
   npx tsx scripts/migrate-stripe-customers.ts stripe-customers-missing.csv

   # 2. サブスクリプションを再同期
   npx tsx scripts/migrate-subscriptions.ts stripe-subscriptions.csv
   ```

#### 成功基準

- 23件の顧客が `stripe_customers` テーブルに追加される
- 23件のサブスクリプションが `user_subscriptions` テーブルに追加される

---

### タスク2: 本番環境での動作確認 ⏳

**優先度**: 高
**所要時間**: 1時間

#### 実施内容

1. **テスト用パスワードを設定**
   ```bash
   npx tsx scripts/set-test-passwords.ts
   # パスワード: TestPassword123!
   ```

2. **既存ユーザーでログイン**
   - Phase 1でテストした10件のユーザーアカウントでログイン
   - サブスクリプション情報が正しく表示されるか確認

3. **確認項目**
   - [ ] プラン名が正しく表示される（Standard / Feedback）
   - [ ] 期間が正しく表示される（1ヶ月 / 3ヶ月）
   - [ ] 次回更新日が正しく表示される
   - [ ] キャンセル予定の場合、「期間終了時に解約」が表示される
   - [ ] カスタマーポータルへのリンクが機能する

4. **複数のユーザーパターンをテスト**
   - アクティブなサブスクリプション
   - キャンセル予定のサブスクリプション
   - サブスクリプションなし（無料プラン）

#### 成功基準

- 10件のテストユーザー全員で正しくサブスクリプション情報が表示される
- エラーが発生しない

---

### タスク3: 新規ユーザー登録テスト ⏳

**優先度**: 高
**所要時間**: 30分

#### 実施内容

1. **新規アカウント作成**
   - テスト用の新しいメールアドレスで登録
   - Supabase Authを使った登録フローを確認

2. **サブスクリプション購入フロー**
   - 新規登録後、サブスクリプションを購入
   - Stripe Checkoutが正しく動作するか確認
   - Webhookが正しく処理されるか確認

3. **確認項目**
   - [ ] 新規ユーザーが `auth.users` に作成される
   - [ ] `stripe_customers` テーブルにCustomer IDが保存される
   - [ ] `user_subscriptions` テーブルにサブスクリプションが保存される
   - [ ] アカウントページでサブスクリプション情報が表示される

#### 成功基準

- 新規ユーザーの登録からサブスクリプション購入まで正常に動作する
- データベースに正しくデータが保存される

---

### タスク4: Stripe Webhookの本番環境設定 ⏳

**優先度**: 高
**所要時間**: 15分

#### 実施内容

1. **Stripe Dashboardで設定**
   - Stripe Dashboard → Developers → Webhooks
   - 新しいWebhook エンドポイントを追加

2. **Webhook URL**
   ```
   https://[your-supabase-project-id].supabase.co/functions/v1/stripe-webhook
   ```

3. **イベントを選択**
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

4. **Webhook Secretを保存**
   ```bash
   # Supabase Edge Functionsに環境変数を設定
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_xxxxx
   ```

#### 成功基準

- Webhookエンドポイントが正常に登録される
- テストイベントが正しく処理される

---

### タスク5: MemberStackの無効化 ⏳

**優先度**: 高
**所要時間**: 15分

#### 実施内容

1. **フロントエンドからMemberStackスクリプトを削除**
   - `index.html` または該当のコンポーネントから削除
   - MemberStackの初期化コードを削除

2. **MemberStackダッシュボードで無効化**
   - MemberStack Dashboard → Settings
   - プロジェクトを一時停止またはプラン変更

3. **確認項目**
   - [ ] MemberStackのスクリプトが読み込まれない
   - [ ] Supabase Authのみで認証が動作する
   - [ ] 既存ユーザーがログインできる

#### 成功基準

- MemberStackが完全に無効化される
- Supabase Authで全ての認証が動作する

---

### タスク6: 本番公開 ⏳

**優先度**: 最高
**所要時間**: 30分

#### 実施内容

1. **最終確認**
   - [ ] すべてのテストが成功している
   - [ ] 環境変数が正しく設定されている
   - [ ] Webhookが正しく設定されている
   - [ ] MemberStackが無効化されている
   - [ ] ログイン画面に移行案内バナーが表示される

2. **デプロイ**
   ```bash
   # フロントエンドのデプロイ
   npm run build
   # デプロイコマンド（使用しているサービスに応じて）

   # Edge Functionsのデプロイ
   supabase functions deploy check-subscription
   supabase functions deploy create-checkout
   supabase functions deploy create-customer-portal
   supabase functions deploy stripe-webhook
   ```

3. **本番環境での最終確認**
   - 既存ユーザーでログイン
   - 新規ユーザー登録
   - サブスクリプション購入フロー

#### 成功基準

- 本番環境で全ての機能が正常に動作する
- エラーが発生しない

---

### タスク7: 公開後モニタリング ⏳

**優先度**: 最高
**所要時間**: 継続的

#### 実施内容

1. **Supabaseログの監視**
   ```bash
   # Edge Functionsのログを確認
   supabase functions logs stripe-webhook
   supabase functions logs check-subscription
   ```

2. **Stripeダッシュボードの監視**
   - Events → Webhooks
   - Webhookのステータスを確認
   - エラーがないか確認

3. **ユーザーからの問い合わせ対応**
   - サブスクリプション関連の問い合わせに対応
   - ログインできないユーザーのサポート

4. **監視項目**
   - [ ] Webhookの成功率（95%以上を維持）
   - [ ] 新規サブスクリプションの作成
   - [ ] サブスクリプションのキャンセル
   - [ ] ログインエラー
   - [ ] 決済エラー

#### 成功基準

- 24時間エラーなく運用される
- ユーザーから問題の報告がない

---

## 🔍 確認事項（事前チェックリスト）

### 環境変数

以下の環境変数が設定されているか確認:

```bash
# Supabase Edge Functions
supabase secrets list

# 必要な環境変数:
# - STRIPE_SECRET_KEY
# - STRIPE_WEBHOOK_SECRET
# - STRIPE_TEST_STANDARD_1M_PRICE_ID
# - STRIPE_TEST_STANDARD_3M_PRICE_ID
# - STRIPE_TEST_FEEDBACK_1M_PRICE_ID
# - STRIPE_TEST_FEEDBACK_3M_PRICE_ID
# - STRIPE_STANDARD_1M_PRICE_ID (本番用)
# - STRIPE_STANDARD_3M_PRICE_ID (本番用)
# - STRIPE_FEEDBACK_1M_PRICE_ID (本番用)
# - STRIPE_FEEDBACK_3M_PRICE_ID (本番用)
```

### データベースマイグレーション

以下のマイグレーションが適用されているか確認:

```bash
supabase migration list

# 必要なマイグレーション:
# - 20250104_add_stripe_customer_id.sql
# - 20250107_add_duration_to_subscriptions.sql
# - 20250118_add_current_period_end.sql
```

### テストアカウント

Phase 1でテストした10件のアカウント:
1. harunaru888@gmail.com
2. amiried@icloud.com
3. kagakaori31@gmail.com
4. ipothos.24@gmail.com
5. kyousakuramti@gmail.com
6. mina.luna1026@gmail.com
7. rintaroy777@gmail.com
8. krm.19990807@gmail.com
9. fujimiyu57@gmail.com
10. edit.11.16.mami@gmail.com

---

## 📊 移行完了後の最終データ数（予想）

| 項目 | 件数 |
|-----|------|
| **Auth ユーザー** | 2,162件 |
| **stripe_customers** | 2,162件 |
| **user_subscriptions** | 270件（Error 23件対応後） |

---

## ⚠️ 注意事項

### 1. 二重課金防止

現在の実装では、複数のアクティブサブスクリプションを自動的にキャンセルする仕組みが実装されています。これは正常な動作です。

### 2. パスワードリセット

移行されたユーザーは、初回ログイン時にパスワードリセットが必要です。ログイン画面に案内バナーを表示して対応します。

### 3. Realtime機能

`user_subscriptions` テーブルはRealtimeで監視されており、サブスクリプションの変更は即座にフロントエンドに反映されます。

### 4. Webhookのリトライ

Stripe Webhookは失敗時に自動的にリトライされます。Edge Functionが一時的にダウンしても、データは最終的に同期されます。

### 5. 移行案内バナーの表示期間

- **推奨: 3ヶ月**
- 3ヶ月後、ほとんどのユーザーがパスワードを設定済みと想定
- バナーを削除してもFAQは残す

---

## 📞 問題が発生した場合

### Webhookが動作しない

1. Webhook Secretが正しく設定されているか確認
2. Edge FunctionのURLが正しいか確認
3. Stripeダッシュボードでイベントログを確認

### ユーザーがログインできない

1. `auth.users` テーブルにユーザーが存在するか確認
2. パスワードリセットメールを送信
3. エラーログを確認

### サブスクリプション情報が表示されない

1. `user_subscriptions` テーブルにデータが存在するか確認
2. `stripe_customers` テーブルにCustomer IDが存在するか確認
3. Webhookが正しく処理されているか確認

---

## 🎯 最終目標

**全2,162件の顧客データを正常に移行し、新しいSupabase + Stripeシステムで本番運用を開始する**

---

## 📋 タスクの優先順位

| 順位 | タスク | 所要時間 |
|-----|--------|----------|
| 1 | タスク0: パスワードリセット対応 | 2時間 |
| 2 | タスク2: 本番環境での動作確認 | 1時間 |
| 3 | タスク3: 新規ユーザー登録テスト | 30分 |
| 4 | タスク4: Stripe Webhook設定 | 15分 |
| 5 | タスク5: MemberStack無効化 | 15分 |
| 6 | タスク1: Error 23件対応 | 30分 |
| 7 | タスク6: 本番公開 | 30分 |
| 8 | タスク7: 公開後モニタリング | 継続的 |

**合計所要時間: 約5時間**

---

**次回更新**: 本番公開完了後
