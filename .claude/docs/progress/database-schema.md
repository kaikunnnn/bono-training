# データベーススキーマ

**作成日**: 2025-12-06
**ステータス**: Phase 2 完了

---

## 概要

進捗管理に関連する3つのテーブルが存在:

| テーブル名 | 用途 | RLS | 主キー |
|-----------|------|-----|--------|
| `user_progress` | Training タスク進捗 | ❌ 無効 | `(user_id, task_id)` |
| `article_progress` | 記事完了状態 | ❌ 無効 | `(user_id, article_id)` |
| `lesson_progress` | レッスン完了状態 | ❌ 無効 | `(user_id, lesson_id)` |

---

## 1. user_progress テーブル（Training用）

### カラム構造

| カラム名 | 型 | NULL許可 | デフォルト | 説明 |
|---------|-----|---------|-----------|------|
| `user_id` | uuid | NO | - | ユーザーID（PK, FK） |
| `task_id` | uuid | NO | - | タスクID（PK, FK） |
| `status` | text | YES | `'todo'` | 進捗ステータス |
| `completed_at` | timestamptz | YES | - | 完了日時 |

### インデックス

| インデックス名 | カラム | 種類 |
|---------------|--------|------|
| `user_progress_pkey` | `(user_id, task_id)` | PRIMARY KEY (UNIQUE) |

### 外部キー

| 制約名 | カラム | 参照先 | ON DELETE |
|--------|--------|--------|-----------|
| `user_progress_user_id_fkey` | `user_id` | `auth.users(id)` | (不明) |
| `user_progress_task_id_fkey` | `task_id` | `task(id)` | CASCADE |

### 注意点

- `status` は `text` 型（enum ではない）→ 型安全性なし
- `created_at`, `updated_at` カラムなし → 監査履歴なし

---

## 2. article_progress テーブル（Article用）

### カラム構造

| カラム名 | 型 | NULL許可 | デフォルト | 説明 |
|---------|-----|---------|-----------|------|
| `user_id` | uuid | NO | - | ユーザーID（PK, FK） |
| `article_id` | text | NO | - | 記事ID（PK） |
| `lesson_id` | text | NO | - | レッスンID |
| `status` | text | NO | `'not_started'` | 進捗ステータス |
| `completed_at` | timestamptz | YES | - | 完了日時 |
| `created_at` | timestamptz | NO | `now()` | 作成日時 |
| `updated_at` | timestamptz | NO | `now()` | 更新日時 |

### インデックス

| インデックス名 | カラム | 種類 |
|---------------|--------|------|
| `article_progress_pkey` | `(user_id, article_id)` | PRIMARY KEY (UNIQUE) |
| `idx_article_progress_user` | `(user_id)` | INDEX |
| `idx_article_progress_lesson` | `(user_id, lesson_id)` | INDEX |
| `idx_article_progress_status` | `(user_id, status)` | INDEX |
| `idx_article_progress_updated` | `(user_id, updated_at DESC)` | INDEX |

### 外部キー

| 制約名 | カラム | 参照先 | ON DELETE |
|--------|--------|--------|-----------|
| `article_progress_user_id_fkey` | `user_id` | `auth.users(id)` | (不明) |

### 注意点

- `article_id`, `lesson_id` は `text` 型 → 外部キー制約なし
- 記事・レッスンが削除されても孤児レコードが残る可能性

---

## 3. lesson_progress テーブル

### カラム構造

| カラム名 | 型 | NULL許可 | デフォルト | 説明 |
|---------|-----|---------|-----------|------|
| `user_id` | uuid | NO | - | ユーザーID（PK, FK） |
| `lesson_id` | text | NO | - | レッスンID（PK） |
| `status` | text | NO | `'not_started'` | 進捗ステータス |
| `started_at` | timestamptz | YES | - | 開始日時 |
| `completed_at` | timestamptz | YES | - | 完了日時 |
| `created_at` | timestamptz | NO | `now()` | 作成日時 |
| `updated_at` | timestamptz | NO | `now()` | 更新日時 |

### インデックス

| インデックス名 | カラム | 種類 |
|---------------|--------|------|
| `lesson_progress_pkey` | `(user_id, lesson_id)` | PRIMARY KEY (UNIQUE) |
| `idx_lesson_progress_user` | `(user_id)` | INDEX |
| `idx_lesson_progress_status` | `(user_id, status)` | INDEX |
| `idx_lesson_progress_updated` | `(user_id, updated_at DESC)` | INDEX |

### 外部キー

| 制約名 | カラム | 参照先 | ON DELETE |
|--------|--------|--------|-----------|
| `lesson_progress_user_id_fkey` | `user_id` | `auth.users(id)` | (不明) |

### 注意点

- `lesson_id` は `text` 型 → 外部キー制約なし

---

## RLS（Row Level Security）ポリシー

### ⚠️ 重大な問題: RLS が無効

```sql
-- 全てのテーブルで RLS が無効
SELECT tablename, rowsecurity FROM pg_tables
WHERE tablename IN ('article_progress', 'lesson_progress', 'user_progress');

-- 結果:
-- user_progress     | false
-- article_progress  | false
-- lesson_progress   | false
```

### セキュリティリスク

1. **他ユーザーのデータ閲覧可能**
   - 認証済みユーザーなら誰でも全ユーザーの進捗を SELECT 可能

2. **他ユーザーのデータ改ざん可能**
   - 認証済みユーザーなら誰でも全ユーザーの進捗を UPDATE/DELETE 可能

3. **なりすまし INSERT 可能**
   - 他人の `user_id` を指定して進捗を INSERT 可能

### 推奨される RLS ポリシー

```sql
-- RLS を有効化
ALTER TABLE article_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;

-- SELECT ポリシー: 自分のデータのみ閲覧可能
CREATE POLICY "Users can view own progress" ON article_progress
  FOR SELECT USING (auth.uid() = user_id);

-- INSERT ポリシー: 自分のデータのみ作成可能
CREATE POLICY "Users can insert own progress" ON article_progress
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- UPDATE ポリシー: 自分のデータのみ更新可能
CREATE POLICY "Users can update own progress" ON article_progress
  FOR UPDATE USING (auth.uid() = user_id);

-- DELETE ポリシー: 自分のデータのみ削除可能
CREATE POLICY "Users can delete own progress" ON article_progress
  FOR DELETE USING (auth.uid() = user_id);

-- lesson_progress, user_progress にも同様のポリシーを適用
```

---

## ER図（概念）

```
┌─────────────────┐
│   auth.users    │
│─────────────────│
│ id (uuid) PK    │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐  ┌────────────────────┐
│  │  user_progress   │  │ article_progress │  │  lesson_progress   │
│  │──────────────────│  │──────────────────│  │────────────────────│
│  │ user_id (FK)     │  │ user_id (FK)     │  │ user_id (FK)       │
│  │ task_id (FK)     │  │ article_id       │  │ lesson_id          │
│  │ status           │  │ lesson_id        │  │ status             │
│  │ completed_at     │  │ status           │  │ started_at         │
│  └────────┬─────────┘  │ completed_at     │  │ completed_at       │
│           │            │ created_at       │  │ created_at         │
│           │            │ updated_at       │  │ updated_at         │
│           ▼            └──────────────────┘  └────────────────────┘
│  ┌──────────────────┐
│  │      task        │        ※ article, lesson テーブルへの
│  │──────────────────│           外部キー制約は存在しない
│  │ id (uuid) PK     │
│  └──────────────────┘
│
└─────────────────────────────────────────────────────────────┘
```

---

## 発見した問題点まとめ

### 1. セキュリティ問題（Critical）

| 問題 | 影響 | 優先度 |
|------|------|--------|
| RLS 無効 | 他ユーザーのデータ閲覧・改ざん可能 | 🔴 最優先 |

### 2. データ整合性問題（Medium）

| 問題 | 影響 | 優先度 |
|------|------|--------|
| `article_id` に外部キーなし | 記事削除時に孤児レコード | 🟡 中 |
| `lesson_id` に外部キーなし | レッスン削除時に孤児レコード | 🟡 中 |
| `status` が text 型 | 不正な値が入る可能性 | 🟡 中 |

### 3. 設計の不一致（Low）

| 問題 | 影響 | 優先度 |
|------|------|--------|
| `user_progress` に `created_at` なし | 監査履歴不完全 | 🟢 低 |
| テーブル間で `status` 値が異なる | 混乱の原因 | 🟢 低 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-06 | Phase 2 調査完了 - RLS無効を発見 |
| 2025-12-06 | テンプレート作成 |
