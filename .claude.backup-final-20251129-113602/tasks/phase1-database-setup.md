# フェーズ1: データベース・基盤整備 - 詳細実装計画

## 📋 概要

- **目的**: 進捗管理・ブックマーク機能のためのデータベーステーブルを作成
- **所要時間**: 0.5日
- **RLS設定**: 後回し（フェーズ2-4の実装後に設定）

---

## 🎯 このフェーズで作成するもの

### 1. テーブル
- `lesson_progress`: レッスン進捗を管理
- `article_progress`: 記事進捗を管理
- `article_bookmarks`: 記事ブックマークを管理

### 2. トリガー
- `updated_at` 自動更新トリガー（3テーブル共通）

### 3. インデックス
- 各テーブルに検索用のインデックスを作成

### 4. TypeScript型定義
- `src/integrations/supabase/types.ts` の更新

---

## 📝 ステップバイステップ実装手順

### ステップ1: マイグレーションファイルの作成

**ファイル名**: `supabase/migrations/20250103_create_progress_tables.sql`

**実装内容**:

```sql
-- ============================================
-- 進捗管理・ブックマーク機能のテーブル作成
-- ============================================

-- ---------------------------------------------
-- 1. updated_at 自動更新用の関数（共通）
-- ---------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------
-- 2. lesson_progress テーブル
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS lesson_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, lesson_id)
);

-- lesson_progress のインデックス
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_status ON lesson_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_updated ON lesson_progress(user_id, updated_at DESC);

-- lesson_progress の updated_at 自動更新トリガー
CREATE TRIGGER update_lesson_progress_updated_at
    BEFORE UPDATE ON lesson_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------
-- 3. article_progress テーブル
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS article_progress (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  lesson_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- article_progress のインデックス
CREATE INDEX IF NOT EXISTS idx_article_progress_user ON article_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_article_progress_lesson ON article_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_article_progress_status ON article_progress(user_id, status);
CREATE INDEX IF NOT EXISTS idx_article_progress_updated ON article_progress(user_id, updated_at DESC);

-- article_progress の updated_at 自動更新トリガー
CREATE TRIGGER update_article_progress_updated_at
    BEFORE UPDATE ON article_progress
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------
-- 4. article_bookmarks テーブル
-- ---------------------------------------------
CREATE TABLE IF NOT EXISTS article_bookmarks (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, article_id)
);

-- article_bookmarks のインデックス
CREATE INDEX IF NOT EXISTS idx_article_bookmarks_user ON article_bookmarks(user_id, created_at DESC);

-- ---------------------------------------------
-- 完了メッセージ
-- ---------------------------------------------
DO $$
BEGIN
    RAISE NOTICE '✅ 進捗管理テーブルの作成が完了しました';
END $$;
```

**変更点（ドキュメントからの修正）**:
- ✅ `article_progress.quest_id` を削除（シンプル化）
- ✅ `article_bookmarks.lesson_id` を削除（シンプル化）
- ✅ `updated_at` 自動更新トリガーを追加
- ✅ タイムスタンプを `TIMESTAMPTZ`（タイムゾーン付き）に変更

---

### ステップ2: Supabase Dashboardでの実行

#### 手順

1. **Supabase Dashboardにログイン**
   - https://supabase.com/dashboard にアクセス
   - プロジェクト `fryogvfhymnpiqwssmuu` を開く

2. **SQL Editorを開く**
   - 左サイドバーから「SQL Editor」をクリック
   - 「New query」をクリック

3. **SQLをコピー&ペースト**
   - 上記の `20250103_create_progress_tables.sql` の内容をコピー
   - SQL Editorにペースト

4. **実行**
   - 「Run」ボタン（または Cmd+Enter）をクリック
   - 成功すると「Success. No rows returned」と表示される
   - 最後に「✅ 進捗管理テーブルの作成が完了しました」というメッセージが表示される

5. **確認**
   - 左サイドバーから「Table Editor」をクリック
   - 以下の3つのテーブルが表示されることを確認：
     - `lesson_progress`
     - `article_progress`
     - `article_bookmarks`

#### エラーが出た場合

- エラーメッセージをコピーして私に共有してください
- 既にテーブルが存在する場合は `CREATE TABLE IF NOT EXISTS` で回避されるはずですが、念のため確認します

---

### ステップ3: テストデータの投入

テーブル作成後、以下のSQLでテストデータを投入します。

**前提**: あなたのユーザーIDが必要です。以下のSQLで取得してください：

```sql
-- あなたのユーザーIDを取得
SELECT id, email FROM auth.users LIMIT 5;
```

取得したユーザーIDを使って、テストデータを投入：

```sql
-- ============================================
-- テストデータの投入
-- ============================================

-- ⚠️ 'YOUR_USER_ID_HERE' を実際のユーザーIDに置き換えてください

-- 1. レッスン進捗のテストデータ
INSERT INTO lesson_progress (user_id, lesson_id, status, started_at, completed_at)
VALUES
  ('YOUR_USER_ID_HERE', 'lesson-design-basics', 'completed', NOW() - INTERVAL '7 days', NOW() - INTERVAL '5 days'),
  ('YOUR_USER_ID_HERE', 'lesson-figma-intro', 'in_progress', NOW() - INTERVAL '3 days', NULL),
  ('YOUR_USER_ID_HERE', 'lesson-prototyping', 'not_started', NULL, NULL)
ON CONFLICT (user_id, lesson_id) DO NOTHING;

-- 2. 記事進捗のテストデータ
INSERT INTO article_progress (user_id, article_id, lesson_id, status, completed_at)
VALUES
  ('YOUR_USER_ID_HERE', 'article-001', 'lesson-design-basics', 'completed', NOW() - INTERVAL '5 days'),
  ('YOUR_USER_ID_HERE', 'article-002', 'lesson-design-basics', 'completed', NOW() - INTERVAL '5 days'),
  ('YOUR_USER_ID_HERE', 'article-003', 'lesson-figma-intro', 'in_progress', NULL),
  ('YOUR_USER_ID_HERE', 'article-004', 'lesson-figma-intro', 'not_started', NULL)
ON CONFLICT (user_id, article_id) DO NOTHING;

-- 3. ブックマークのテストデータ
INSERT INTO article_bookmarks (user_id, article_id)
VALUES
  ('YOUR_USER_ID_HERE', 'article-001'),
  ('YOUR_USER_ID_HERE', 'article-003')
ON CONFLICT (user_id, article_id) DO NOTHING;

-- 確認クエリ
SELECT 'lesson_progress' AS table_name, COUNT(*) AS count FROM lesson_progress WHERE user_id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'article_progress', COUNT(*) FROM article_progress WHERE user_id = 'YOUR_USER_ID_HERE'
UNION ALL
SELECT 'article_bookmarks', COUNT(*) FROM article_bookmarks WHERE user_id = 'YOUR_USER_ID_HERE';
```

**期待される結果**:
```
table_name         | count
-------------------|-------
lesson_progress    | 3
article_progress   | 4
article_bookmarks  | 2
```

---

### ステップ4: TypeScript型定義の更新

#### 方法A: Supabase CLIで自動生成（推奨）

Supabase CLIをインストール：
```bash
brew install supabase/tap/supabase
```

型定義を自動生成：
```bash
cd /Users/kaitakumi/Documents/bono-training
npx supabase login
npx supabase gen types typescript --project-id fryogvfhymnpiqwssmuu > src/integrations/supabase/types.ts
```

#### 方法B: 手動で型定義を追加

`src/integrations/supabase/types.ts` に以下を追加：

```typescript
// 既存のTablesに追加

lesson_progress: {
  Row: {
    user_id: string
    lesson_id: string
    status: 'not_started' | 'in_progress' | 'completed'
    started_at: string | null
    completed_at: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    user_id: string
    lesson_id: string
    status?: 'not_started' | 'in_progress' | 'completed'
    started_at?: string | null
    completed_at?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    user_id?: string
    lesson_id?: string
    status?: 'not_started' | 'in_progress' | 'completed'
    started_at?: string | null
    completed_at?: string | null
    created_at?: string
    updated_at?: string
  }
  Relationships: []
}

article_progress: {
  Row: {
    user_id: string
    article_id: string
    lesson_id: string
    status: 'not_started' | 'in_progress' | 'completed'
    completed_at: string | null
    created_at: string
    updated_at: string
  }
  Insert: {
    user_id: string
    article_id: string
    lesson_id: string
    status?: 'not_started' | 'in_progress' | 'completed'
    completed_at?: string | null
    created_at?: string
    updated_at?: string
  }
  Update: {
    user_id?: string
    article_id?: string
    lesson_id?: string
    status?: 'not_started' | 'in_progress' | 'completed'
    completed_at?: string | null
    created_at?: string
    updated_at?: string
  }
  Relationships: []
}

article_bookmarks: {
  Row: {
    user_id: string
    article_id: string
    created_at: string
  }
  Insert: {
    user_id: string
    article_id: string
    created_at?: string
  }
  Update: {
    user_id?: string
    article_id?: string
    created_at?: string
  }
  Relationships: []
}
```

---

### ステップ5: 動作確認

型定義が更新されたら、TypeScriptで型チェックが通ることを確認：

```bash
npm run typecheck
```

エラーが出なければ成功です！

---

## ✅ 完了チェックリスト

- [ ] マイグレーションファイル作成（`20250103_create_progress_tables.sql`）
- [ ] Supabase DashboardでSQL実行
- [ ] テーブルが作成されたことを確認（Table Editorで確認）
- [ ] テストデータ投入
- [ ] テストデータが正しく挿入されたことを確認
- [ ] TypeScript型定義の更新（方法Aまたは方法B）
- [ ] `npm run typecheck` でエラーなし

---

## 🎉 フェーズ1完了後の状態

- ✅ 3つのテーブルが作成された
- ✅ `updated_at` が自動更新される
- ✅ テストデータが投入された
- ✅ TypeScript型定義が更新された
- ⏳ RLSはまだ設定していない（フェーズ2-4後に設定）

**次のステップ**: フェーズ2のブックマーク機能実装に進みます！

---

## 🔧 トラブルシューティング

### エラー: `relation "lesson_progress" already exists`
- テーブルが既に存在しています
- `DROP TABLE IF EXISTS lesson_progress CASCADE;` を実行してから再度マイグレーションを実行

### エラー: `permission denied for schema public`
- RLSポリシーの問題の可能性
- Supabase Dashboardの「Authentication」→「Policies」で確認

### エラー: テストデータが投入できない
- ユーザーIDが正しいか確認
- `SELECT id FROM auth.users WHERE email = 'your-email@example.com';` で確認

### TypeScript型定義が反映されない
- エディタを再起動
- TypeScriptサーバーを再起動（VSCodeなら Cmd+Shift+P → "Reload Window"）

---

## 📚 参考資料

- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview#sql-editor)
- [PostgreSQL Triggers](https://www.postgresql.org/docs/current/sql-createtrigger.html)
- [Supabase CLI Type Generation](https://supabase.com/docs/guides/api/generating-types)
