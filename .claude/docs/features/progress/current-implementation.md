# 現状の実装詳細

**作成日**: 2025-12-06
**ステータス**: Phase 1 完了

---

## 概要: 2つの進捗システム

このプロジェクトには**2つの独立した進捗システム**が存在する:

| システム | テーブル | サービス | 用途 |
|----------|---------|----------|------|
| Training進捗 | `user_progress` | `src/services/training/progress.ts` | タスク完了管理 |
| Article進捗 | `article_progress` | `src/services/progress.ts` | 記事完了管理 |

---

## 1. Training進捗システム

### 1.1 サービス層

**ファイルパス**: `src/services/training/progress.ts`

```typescript
// タスク進捗の更新（upsertパターン）
export const updateTaskProgress = async (
  userId: string,
  taskId: string,
  status: 'done' | 'todo' | 'in-progress'
): Promise<void> => {
  const { error } = await supabase
    .from('user_progress')
    .upsert(
      {
        user_id: userId,
        task_id: taskId,
        status,
        completed_at: status === 'done' ? new Date().toISOString() : null,
      },
      {
        onConflict: 'user_id,task_id',
      }
    );

  if (error) {
    console.error('Failed to update task progress:', error);
    throw error;
  }
};

// タスク進捗の取得
export const getUserTaskProgress = async (userId: string): Promise<TaskProgress[]> => {
  const { data, error } = await supabase
    .from('user_progress')
    .select('*')
    .eq('user_id', userId);

  if (error) {
    console.error('Failed to fetch user progress:', error);
    throw error;
  }

  return data || [];
};
```

**特徴**:
- `upsert` + `onConflict` を使用（効率的）
- `userId` は呼び出し元から渡される（コンポーネントで認証チェック済み前提）
- ステータスは `'done' | 'todo' | 'in-progress'` の3種類

### 1.2 コンポーネント層

**ファイルパス**: `src/components/training/TaskActionButton.tsx`

```typescript
interface TaskActionButtonProps {
  taskId: string;
  userId: string;  // 呼び出し元から受け取る
  currentStatus?: string;
  onStatusChange?: (newStatus: string) => void;
}

export const TaskActionButton = ({
  taskId,
  userId,
  currentStatus,
  onStatusChange,
}: TaskActionButtonProps) => {
  const [status, setStatus] = useState<string>(currentStatus || 'todo');
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    const newStatus = status === 'done' ? 'todo' : 'done';
    setIsLoading(true);
    try {
      await updateTaskProgress(userId, taskId, newStatus as 'done' | 'todo');
      setStatus(newStatus);
      onStatusChange?.(newStatus);
      toast.success(newStatus === 'done' ? '完了しました' : '未完了に戻しました');
    } catch (error) {
      toast.error('更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };
  // ...
};
```

**特徴**:
- `userId` は props で受け取る（コンポーネント内で認証チェックしない）
- ローカルステート `status` で即時UI更新
- `onStatusChange` コールバックで親に通知

---

## 2. Article進捗システム

### 2.1 サービス層

**ファイルパス**: `src/services/progress.ts`

```typescript
// 記事完了のトグル（SELECT → INSERT/UPDATE パターン）
export const toggleArticleCompletion = async (
  articleId: string,
  lessonId: string
): Promise<{ completed: boolean }> => {
  // 関数内で認証チェック
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // 既存レコードをチェック
  const { data: existing } = await supabase
    .from('article_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('article_id', articleId)
    .single();

  if (existing) {
    // 既存あり → ステータスをトグル
    const newStatus = existing.status === 'completed' ? 'not_started' : 'completed';
    const { error } = await supabase
      .from('article_progress')
      .update({
        status: newStatus,
        completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existing.id);

    if (error) throw error;
    return { completed: newStatus === 'completed' };
  } else {
    // 既存なし → INSERT
    const { error } = await supabase.from('article_progress').insert({
      user_id: user.id,
      article_id: articleId,
      lesson_id: lessonId,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    if (error) throw error;
    return { completed: true };
  }
};

// 記事進捗の取得
export const getArticleProgress = async (
  articleId: string
): Promise<ArticleProgress | null> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('article_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('article_id', articleId)
    .single();

  if (error && error.code !== 'PGRST116') {
    console.error('Failed to fetch article progress:', error);
  }

  return data || null;
};

// レッスン進捗の取得（複数記事）
export const getLessonProgress = async (
  lessonId: string
): Promise<ArticleProgress[]> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return [];

  const { data, error } = await supabase
    .from('article_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('lesson_id', lessonId);

  if (error) {
    console.error('Failed to fetch lesson progress:', error);
    return [];
  }

  return data || [];
};
```

**特徴**:
- 関数内で `supabase.auth.getUser()` を呼んで認証チェック
- SELECT → 条件分岐 → INSERT/UPDATE（2回のDB呼び出し）
- ステータスは `'completed' | 'not_started' | 'in_progress'` enum

### 2.2 コンポーネント層

**ファイルパス**: `src/pages/ArticleDetail.tsx`

```typescript
const ArticleDetail = () => {
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [progressUpdateTrigger, setProgressUpdateTrigger] = useState(0);

  // 完了状態の初期取得
  useEffect(() => {
    const fetchProgress = async () => {
      if (!articleId) return;
      const progress = await getArticleProgress(articleId);
      setIsCompleted(progress?.status === 'completed');
    };
    fetchProgress();
  }, [articleId]);

  // 完了トグル
  const handleCompleteToggle = async () => {
    if (!articleId || !lessonId) return;
    setIsLoading(true);
    try {
      const result = await toggleArticleCompletion(articleId, lessonId);
      setIsCompleted(result.completed);
      // 兄弟コンポーネントの更新をトリガー
      setProgressUpdateTrigger((prev) => prev + 1);
      toast.success(result.completed ? '記事を完了しました' : '完了を取り消しました');
    } catch (error) {
      toast.error('進捗の更新に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };
  // ...
};
```

**特徴**:
- コンポーネント内で認証チェックしない（サービス層に委譲）
- `progressUpdateTrigger` で兄弟コンポーネント（進捗バーなど）を更新

---

## 3. 型定義（Supabase Types）

**ファイルパス**: `src/integrations/supabase/types.ts`

### 3.1 user_progress（Training用）

```typescript
user_progress: {
  Row: {
    completed_at: string | null
    created_at: string
    id: string
    status: string | null  // ← string（enumではない）
    task_id: string
    updated_at: string
    user_id: string
  }
  Insert: {
    completed_at?: string | null
    created_at?: string
    id?: string
    status?: string | null
    task_id: string
    updated_at?: string
    user_id: string
  }
  Update: {
    completed_at?: string | null
    created_at?: string
    id?: string
    status?: string | null
    task_id?: string
    updated_at?: string
    user_id?: string
  }
  Relationships: [
    {
      foreignKeyName: "user_progress_task_id_fkey"
      columns: ["task_id"]
      isOneToOne: false
      referencedRelation: "tasks"
      referencedColumns: ["id"]
    },
  ]
}
```

### 3.2 article_progress（Article用）

```typescript
article_progress: {
  Row: {
    article_id: string
    completed_at: string | null
    created_at: string
    id: string
    lesson_id: string
    status: Database["public"]["Enums"]["progress_status"]  // ← enum
    updated_at: string
    user_id: string
  }
  Insert: {
    article_id: string
    completed_at?: string | null
    created_at?: string
    id?: string
    lesson_id: string
    status?: Database["public"]["Enums"]["progress_status"]
    updated_at?: string
    user_id: string
  }
  Update: {
    article_id?: string
    completed_at?: string | null
    created_at?: string
    id?: string
    lesson_id?: string
    status?: Database["public"]["Enums"]["progress_status"]
    updated_at?: string
    user_id?: string
  }
  Relationships: []  // ← 外部キーなし！
}
```

### 3.3 lesson_progress

```typescript
lesson_progress: {
  Row: {
    completed_at: string | null
    created_at: string
    id: string
    lesson_id: string
    started_at: string | null
    status: Database["public"]["Enums"]["progress_status"]
    updated_at: string
    user_id: string
  }
  // Insert, Update は省略...
  Relationships: []  // ← 外部キーなし！
}
```

### 3.4 progress_status Enum

```typescript
Enums: {
  progress_status: "completed" | "in_progress" | "not_started"
  // ...
}
```

---

## 4. 発見した問題点（Phase 4 で詳細分析）

### 4.1 設計上の問題

1. **2つの進捗システムの存在**
   - Training と Article で別々の実装
   - 統一されていない API パターン

2. **認証チェックの不一致**
   - Training: 呼び出し元でチェック（userId props）
   - Article: サービス層でチェック（getUser()）

3. **ステータス型の不一致**
   - Training: `string | null`（自由形式）
   - Article: `progress_status` enum（型安全）

4. **DB操作パターンの違い**
   - Training: `upsert`（1回のDB呼び出し、効率的）
   - Article: SELECT → INSERT/UPDATE（2回、レース条件のリスク）

### 4.2 データ整合性の懸念

1. **外部キー制約の欠如**
   - `article_progress.Relationships: []` - 記事削除時に孤児レコード？
   - `lesson_progress.Relationships: []` - レッスン削除時に孤児レコード？

2. **RLS ポリシー**
   - Phase 2 で確認必要

3. **レース条件**
   - Article の SELECT → INSERT/UPDATE パターンは同時実行で問題？

---

## 関連ファイル一覧

| カテゴリ | ファイルパス | 役割 |
|---------|-------------|------|
| サービス | `src/services/progress.ts` | Article進捗API |
| サービス | `src/services/training/progress.ts` | Training進捗API |
| コンポーネント | `src/components/training/TaskActionButton.tsx` | タスク完了ボタン |
| ページ | `src/pages/ArticleDetail.tsx` | 記事詳細（完了ボタン含む） |
| 型定義 | `src/integrations/supabase/types.ts` | Supabase型定義 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-06 | Phase 1 調査完了 - 2つの進捗システムを特定 |
| 2025-12-06 | テンプレート作成 |
