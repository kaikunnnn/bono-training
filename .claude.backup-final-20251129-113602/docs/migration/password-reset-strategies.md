# パスワードリセット戦略 - 移行ユーザー向け

**作成日**: 2025-01-19
**対象**: MemberStackからSupabaseへ移行した2,162件のユーザー

---

## 📊 現状の問題

移行スクリプトで作成されたユーザーは:
- ✅ `auth.users` テーブルに存在する
- ✅ メール確認済み（`email_confirm: true`）
- ❌ **パスワードが設定されていない**

**つまり、ユーザーはログインできない状態です。**

---

## 🎯 目標

すべての移行ユーザーに安全にパスワードを設定してもらい、ログインできるようにする。

---

## 🔐 パスワードリセット戦略（5つの方法）

### 戦略1: ログイン画面に移行案内バナーを表示（推奨）⭐

**概要**: ログイン画面で目立つバナーを表示し、既存ユーザーにパスワードリセットを促す。

#### 実装

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

#### スタイル例

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

#### メリット

- ✅ セキュリティ的に安全（メール確認が必要）
- ✅ ユーザーに明確に伝わる
- ✅ 実装が簡単
- ✅ 移行期間後もバナーを残せる（後で削除）

#### デメリット

- ❌ ユーザーがバナーを見逃す可能性がある
- ❌ サポート問い合わせが増える可能性

#### 所要時間

**実装: 1時間**

---

### 戦略2: パスワードリセットメール一斉送信

**概要**: 移行完了後、全ユーザーにパスワード設定用のメールを一斉送信する。

#### 実装

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

#### 実行方法

```bash
# 1. redirectTo URLを本番環境のURLに変更
# scripts/send-password-reset-emails.ts の redirectTo を編集

# 2. スクリプトを実行
npx tsx scripts/send-password-reset-emails.ts
```

#### 予想所要時間

- スクリプト実行: **約35分**（2,162件 × 1秒 = 2,162秒 ≈ 36分）

#### メリット

- ✅ 全ユーザーに確実に通知できる
- ✅ ユーザーが自分でアクションを起こす必要がない
- ✅ メールで詳しい説明ができる

#### デメリット

- ❌ 2,000通以上のメールを送信する必要がある
- ❌ メールが届かない/スパム扱いされるリスク
- ❌ Supabaseのメール送信制限に引っかかる可能性
- ❌ 一斉送信後もログインできないユーザーが出る可能性

#### 所要時間

**実装: 30分、実行: 35分**

---

### 戦略3: 管理者スクリプトでテストアカウントにパスワードを設定

**概要**: テスト用に一部のアカウントにパスワードを直接設定する。

#### 実装

```typescript
// scripts/set-test-passwords.ts

import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";

dotenv.config();

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// テスト用ユーザー（Phase 1の10件）
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
  const testPassword = "TestPassword123!"; // テスト用パスワード

  console.log("🔑 Setting test passwords...\n");

  let successCount = 0;
  let errorCount = 0;

  for (const email of testUsers) {
    try {
      // ユーザーIDを取得
      const { data: users } = await supabase.auth.admin.listUsers();
      const user = users.users.find((u) => u.email === email);

      if (!user) {
        console.log(`❌ User not found: ${email}`);
        errorCount++;
        continue;
      }

      // パスワードを設定
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
  console.log("Test Password Setup Summary");
  console.log("========================================");
  console.log(`✅ Success: ${successCount} / ${testUsers.length}`);
  console.log(`❌ Error: ${errorCount}`);
  console.log(`\n🔑 Test password: ${testPassword}`);
  console.log("========================================\n");
}

setTestPasswords().catch(console.error);
```

#### 実行方法

```bash
npx tsx scripts/set-test-passwords.ts
```

#### メリット

- ✅ 自分でログインしてテストできる
- ✅ 実装が簡単
- ✅ すぐにテストを開始できる

#### デメリット

- ❌ テスト用のみ（本番ユーザーには使えない）
- ❌ セキュリティ的に危険（本番で使用しない）

#### 所要時間

**実装: 20分、実行: 1分**

---

### 戦略4: ログイン失敗時に自動的にパスワードリセットメールを送信

**概要**: ログイン失敗時に「パスワード未設定の可能性があります。リセットメールを送信しますか？」と表示。

#### 実装

```tsx
// src/pages/Login.tsx

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
      // パスワード未設定の可能性を検出
      if (error.message.includes('Invalid login credentials')) {
        // パスワードリセット提案モーダルを表示
        setShowPasswordResetModal(true);
        setError('');
        return;
      }

      setError(error.message);
      return;
    }

    navigate('/');
  } catch (err) {
    setError('ログインに失敗しました');
  } finally {
    setIsLoading(false);
  }
};

const sendPasswordResetEmail = async () => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });

    if (error) throw error;

    setShowPasswordResetModal(false);
    setSuccessMessage('パスワードリセットメールを送信しました。メールをご確認ください。');
  } catch (err) {
    setError('メール送信に失敗しました');
  }
};

// モーダル部分
{showPasswordResetModal && (
  <div className="modal">
    <div className="modal-content">
      <h3>パスワード未設定の可能性があります</h3>
      <p>
        システム移行により、パスワードがリセットされた可能性があります。
        <br />
        パスワードリセットメールを送信しますか？
      </p>
      <div className="modal-actions">
        <button onClick={sendPasswordResetEmail}>メールを送信</button>
        <button onClick={() => setShowPasswordResetModal(false)}>
          キャンセル
        </button>
      </div>
    </div>
  </div>
)}
```

#### メリット

- ✅ ユーザーが気づきやすい
- ✅ その場でパスワードリセットできる
- ✅ セキュリティ的に安全

#### デメリット

- ❌ 実装がやや複雑
- ❌ ログイン失敗時に毎回表示される可能性

#### 所要時間

**実装: 2時間**

---

### 戦略5: FAQ/ヘルプページに移行案内を追加

**概要**: FAQ/ヘルプページに「システム移行後のログイン方法」を追加。

#### 実装

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

#### メリット

- ✅ サポート負担を減らせる
- ✅ ユーザーが自分で解決できる

#### デメリット

- ❌ ユーザーがFAQを見ない可能性
- ❌ これだけでは不十分

#### 所要時間

**実装: 30分**

---

## 📝 推奨アプローチ

**戦略1 + 戦略5の併用**

1. ✅ **ログイン画面に移行案内バナーを表示**（戦略1）
2. ✅ **FAQ/ヘルプページに移行案内を追加**（戦略5）
3. ✅ **（オプション）テスト用にパスワードを設定**（戦略3）

### 実装の優先順位

1. **最優先**: 戦略1（ログイン画面バナー）
2. **高**: 戦略5（FAQ追加）
3. **中**: 戦略3（テスト用パスワード設定）
4. **低**: 戦略2（一斉メール送信）← 必要に応じて
5. **低**: 戦略4（ログイン失敗時の自動提案）← 必要に応じて

---

## ⏱️ 実装スケジュール

| タスク | 所要時間 | 優先度 |
|--------|----------|--------|
| 戦略1: ログイン画面バナー実装 | 1時間 | 最優先 |
| 戦略5: FAQ追加 | 30分 | 高 |
| 戦略3: テスト用パスワード設定 | 20分 | 中 |
| **合計** | **1時間50分** | - |

---

## 🔍 ユーザー体験フロー

### 既存ユーザーがログインする場合

1. ログインページにアクセス
2. 目立つバナーで「パスワード再設定が必要」と案内される
3. 「パスワードを再設定する」ボタンをクリック
4. メールアドレスを入力してリセットメールを送信
5. メールのリンクからパスワードを設定
6. 新しいパスワードでログイン成功 ✅

### バナーを見逃してログインを試みた場合

1. メールアドレスとパスワード（覚えているもの）を入力
2. ログイン失敗
3. エラーメッセージ「パスワードが設定されていません。パスワードを再設定してください」
4. バナーの「パスワードを再設定する」ボタンに気づく
5. 手順4-6と同じ

---

## 📊 期待される結果

- ✅ 95%以上のユーザーが自力でパスワードを再設定できる
- ✅ サポート問い合わせが最小限に抑えられる
- ✅ セキュリティが保たれる
- ✅ ユーザー体験が良い

---

## 🚨 注意事項

### セキュリティ

- ❌ **絶対にやってはいけないこと**: メールアドレスだけでパスワード設定を許可する
- ✅ **必ずやるべきこと**: パスワードリセットメールを実際のユーザーのメールアドレスに送信

### メール送信制限

Supabaseの無料プランでは、メール送信に制限があります:
- 1時間に最大100通
- 1日に最大1,000通

2,162件のメールを送信する場合、**3日間かかります**。

### 移行期間

バナーを表示する期間:
- **推奨: 3ヶ月**
- 3ヶ月後、ほとんどのユーザーがパスワードを設定済みと想定
- バナーを削除してもFAQは残す

---

**次回更新**: 実装完了後
