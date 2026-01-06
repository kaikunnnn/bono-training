# 移行ユーザーの migrated_from 管理ガイド

**作成日**: 2025-01-05
**最終更新**: 2025-01-06

---

## 概要

移行ユーザーがログイン画面で「パスワードの再設定が必要です」というメッセージを表示するには、`auth.users` テーブルの `raw_user_meta_data` に `migrated_from: "memberstack"` が設定されている必要があります。

この値が設定されていないユーザーは、ログイン失敗時に通常のエラーメッセージしか表示されず、パスワード再設定の案内が表示されません。

### パスワード再設定後の動作

**パスワード再設定が完了すると、`migrated_from` フラグは自動的に削除されます。**

これにより、パスワード再設定済みのユーザーがログインに失敗した場合、「パスワード再設定が必要です」ではなく、通常の「メールアドレスまたはパスワードが正しくありません」というメッセージが表示されます。

---

## 問題の発生原因

### 2025-01-05 に発見された問題

移行スクリプト `scripts/migrate-create-auth-users.ts` の78行目で `migrated_from: "stripe"` と設定されていたが、Edge Function `check-migrated-user` は `migrated_from: "memberstack"` をチェックしていた。

**値の不一致により、45人のユーザーが移行ユーザーとして認識されなかった。**

### 修正済み

- スクリプトを `migrated_from: "memberstack"` に修正済み
- 45人のユーザーのメタデータを手動で修正済み

---

## 診断手順

### 1. 未設定のユーザーを確認

```sql
-- migrated_from が未設定または "memberstack" でないユーザーを確認
SELECT
  email,
  created_at,
  raw_user_meta_data->>'migrated_from' as migrated_from
FROM auth.users
WHERE raw_user_meta_data->>'migrated_from' IS NULL
   OR raw_user_meta_data->>'migrated_from' != 'memberstack'
ORDER BY created_at DESC;
```

### 2. 特定のユーザーを確認

```sql
-- 特定のメールアドレスのユーザーを確認
SELECT
  email,
  raw_user_meta_data->>'migrated_from' as migrated_from,
  raw_user_meta_data
FROM auth.users
WHERE email = 'ユーザーのメールアドレス';
```

### 3. 統計を確認

```sql
-- migrated_from の値の分布を確認
SELECT
  COALESCE(raw_user_meta_data->>'migrated_from', 'NULL') as migrated_from,
  COUNT(*) as count
FROM auth.users
GROUP BY raw_user_meta_data->>'migrated_from'
ORDER BY count DESC;
```

---

## 修正手順

### 単一ユーザーを修正

```sql
-- 特定のユーザーに migrated_from を設定
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"migrated_from": "memberstack"}'::jsonb
WHERE email = 'ユーザーのメールアドレス';
```

### 複数ユーザーを一括修正

```sql
-- migrated_from が未設定のユーザー全員を修正
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"migrated_from": "memberstack"}'::jsonb
WHERE raw_user_meta_data->>'migrated_from' IS NULL
   OR raw_user_meta_data->>'migrated_from' != 'memberstack';
```

### 修正後の確認

```sql
-- 修正後、未設定のユーザーが0人になったことを確認
SELECT COUNT(*) as remaining_unmigrated
FROM auth.users
WHERE raw_user_meta_data->>'migrated_from' IS NULL
   OR raw_user_meta_data->>'migrated_from' != 'memberstack';
```

期待される結果: `remaining_unmigrated = 0`

---

## 関連ファイル

| ファイル | 役割 |
|----------|------|
| `scripts/migrate-create-auth-users.ts` | 移行スクリプト（ユーザー作成時に `migrated_from` を設定） |
| `supabase/functions/check-migrated-user/index.ts` | Edge Function（ログイン失敗時に移行ユーザーかどうかを判定） |
| `supabase/functions/clear-migrated-flag/index.ts` | Edge Function（パスワード再設定後に `migrated_from` を削除） |
| `src/services/auth.ts` | 認証サービス（`updatePasswordService` で `clear-migrated-flag` を呼び出し） |
| `src/pages/Training/Login.tsx` | ログイン画面（移行ユーザー向けメッセージを表示） |
| `src/pages/Auth.tsx` | 認証画面（移行ユーザー向けメッセージを表示） |

### データベース関数

| 関数名 | 役割 |
|--------|------|
| `check_user_migration_status(p_email)` | メールアドレスから移行ユーザーかどうかを判定 |
| `clear_user_migrated_flag(p_user_id)` | ユーザーIDから `migrated_from` と `migrated_at` を削除 |

---

## フロー図

### 移行ユーザーのログインフロー

```
┌─────────────────────────────────────────────────────────────────┐
│                    ログイン画面                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌────────────────┐
                     │ ログイン試行   │
                     └────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       ┌────────────┐                  ┌────────────┐
       │   成功     │                  │   失敗     │
       └────────────┘                  └────────────┘
              │                               │
              ▼                               ▼
       ┌────────────┐                  ┌─────────────────────┐
       │ ホーム画面 │                  │ check-migrated-user │
       │  へ遷移    │                  │   を呼び出し        │
       └────────────┘                  └─────────────────────┘
                                              │
                              ┌───────────────┴───────────────┐
                              ▼                               ▼
                     ┌────────────────┐              ┌────────────────┐
                     │ isMigrated     │              │ isMigrated     │
                     │ = true         │              │ = false        │
                     └────────────────┘              └────────────────┘
                              │                               │
                              ▼                               ▼
                     ┌────────────────────┐          ┌────────────────────┐
                     │「パスワード再設定  │          │ 通常のエラー       │
                     │ が必要です」表示   │          │ メッセージ表示     │
                     └────────────────────┘          └────────────────────┘
```

### パスワード再設定フロー

```
┌─────────────────────────────────────────────────────────────────┐
│               パスワード再設定画面                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
                     ┌────────────────┐
                     │ 新パスワード   │
                     │ 入力・送信     │
                     └────────────────┘
                              │
                              ▼
                     ┌────────────────────────┐
                     │ supabase.auth.         │
                     │ updateUser(password)   │
                     └────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
       ┌────────────┐                  ┌────────────┐
       │   成功     │                  │   失敗     │
       └────────────┘                  └────────────┘
              │                               │
              ▼                               ▼
       ┌─────────────────────┐         ┌────────────────────┐
       │ clear-migrated-flag │         │ エラーメッセージ   │
       │   を呼び出し        │         │ 表示               │
       └─────────────────────┘         └────────────────────┘
              │
              ▼
       ┌─────────────────────┐
       │ migrated_from       │
       │ フラグを削除        │
       └─────────────────────┘
              │
              ▼
       ┌─────────────────────┐
       │ 「パスワードを      │
       │ 更新しました」表示  │
       └─────────────────────┘
```

---

## 判定ロジック

### Edge Function: check-migrated-user

```typescript
// RPC関数 check_user_migration_status を呼び出し
// raw_user_meta_data->>'migrated_from' = 'memberstack' かどうかを判定
```

### Edge Function: clear-migrated-flag

```typescript
// パスワード更新成功後に呼び出される
// RPC関数 clear_user_migrated_flag を呼び出し
// raw_user_meta_data から migrated_from と migrated_at を削除
```

### フロントエンド: Login.tsx / Auth.tsx

```typescript
// ログイン失敗時に check-migrated-user を呼び出し
// isMigrated = true の場合、黄色いアラートボックスで
// 「パスワードの再設定が必要です」を表示
```

### フロントエンド: src/services/auth.ts

```typescript
// updatePasswordService でパスワード更新成功後
// clear-migrated-flag Edge Function を呼び出し
// フラグ削除に失敗してもパスワード更新は成功扱い（ログのみ）
```

---

## 注意事項

1. **必ず `memberstack` を使用すること**
   - `stripe` や他の値では動作しない
   - Edge Function が `memberstack` のみをチェックしているため

2. **新規移行時のチェックリスト**
   - [ ] 移行スクリプトで `migrated_from: "memberstack"` を設定
   - [ ] 移行後、未設定のユーザーがいないか確認
   - [ ] テストユーザーでログイン失敗時のメッセージを確認

3. **問題が発生した場合**
   - このドキュメントの「修正手順」に従って修正
   - 修正後、該当ユーザーにログインを再試行してもらう
