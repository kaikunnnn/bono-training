# 閲覧履歴機能 仕様書

**作成日**: 2025-01-20
**ステータス**: 仕様確定

---

## 概要

ユーザーが閲覧した記事の履歴を自動記録し、マイページで確認できる機能。

## 設計方針

**方式A: シンプル** を採用

- DB保存: 最大50件
- 表示: 最新20件

## データベース設計

### テーブル: `article_view_history`

| カラム | 型 | 説明 |
|--------|-----|------|
| user_id | UUID | ユーザーID (PK) |
| article_id | TEXT | Sanity CMSの記事ID (PK) |
| viewed_at | TIMESTAMPTZ | 閲覧日時 |

**主キー**: `(user_id, article_id)` - 同じ記事は1件のみ保存（再閲覧時は日時更新）

### インデックス

```sql
CREATE INDEX idx_article_view_history_user_viewed
  ON article_view_history(user_id, viewed_at DESC);
```

### RLS (Row Level Security)

```sql
-- ユーザーは自分の履歴のみ閲覧・操作可能
ALTER TABLE article_view_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own history" ON article_view_history
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own history" ON article_view_history
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own history" ON article_view_history
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own history" ON article_view_history
  FOR DELETE USING (auth.uid() = user_id);
```

## 制限ロジック

### 保存時（50件制限）

```sql
-- 履歴追加後、50件を超えた古い履歴を削除
DELETE FROM article_view_history
WHERE user_id = $1
  AND article_id NOT IN (
    SELECT article_id FROM article_view_history
    WHERE user_id = $1
    ORDER BY viewed_at DESC
    LIMIT 50
  );
```

### 取得時（20件表示）

```sql
SELECT * FROM article_view_history
WHERE user_id = $1
ORDER BY viewed_at DESC
LIMIT 20;
```

## フロントエンド

### 記録タイミング

- 記事詳細ページを開いた時に記録
- 同じ記事の再閲覧は `viewed_at` を更新（UPSERT）

### 表示

- マイページの「閲覧履歴」タブに最新20件を表示
- 記事カード形式で一覧表示

## 実装タスク

1. [x] DBマイグレーション作成・適用
2. [x] サービス層実装 (`src/services/viewHistory.ts`)
3. [x] 記事詳細ページに記録処理追加
4. [x] マイページに履歴一覧表示
