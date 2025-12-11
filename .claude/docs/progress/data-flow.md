# データフロー

**作成日**: 2025-12-06
**ステータス**: Phase 3 完了

---

## 概要

進捗機能のデータフローは以下のパターンで動作:

1. **完了ボタン押下** → Supabase 直接クエリ → 状態更新 → UI再レンダリング
2. **進捗取得** → Supabase 直接クエリ → 状態更新 → UI表示

**特徴**: Edge Functions を使用せず、クライアントから Supabase に直接クエリを実行。

---

## 1. 記事完了ボタン押下時のフロー

### シーケンス図

```
User          ArticleDetail.tsx      progress.ts          Supabase        article_progress
 |                   |                    |                   |                  |
 |--クリック--------->|                    |                   |                  |
 |                   |--handleCompleteToggle()                |                  |
 |                   |                    |                   |                  |
 |                   |-------toggleArticleCompletion(articleId, lessonId)        |
 |                   |                    |                   |                  |
 |                   |                    |--getUser()------->|                  |
 |                   |                    |<--user------------|                  |
 |                   |                    |                   |                  |
 |                   |                    |--SELECT * WHERE---|----------------->|
 |                   |                    |  user_id, article_id                 |
 |                   |                    |<--existing row?---|------------------|
 |                   |                    |                   |                  |
 |                   |                    |--INSERT or UPDATE-|----------------->|
 |                   |                    |<--success---------|------------------|
 |                   |                    |                   |                  |
 |                   |<--{ completed: boolean }               |                  |
 |                   |                    |                   |                  |
 |                   |--setIsCompleted()  |                   |                  |
 |                   |--setProgressUpdateTrigger(+1)          |                  |
 |                   |--toast.success()   |                   |                  |
 |<--UI更新----------|                    |                   |                  |
```

### コードフロー

**1. ArticleDetail.tsx (コンポーネント)**
```typescript
const handleCompleteToggle = async () => {
  if (!articleId || !lessonId) return;
  setIsLoading(true);
  try {
    const result = await toggleArticleCompletion(articleId, lessonId);
    setIsCompleted(result.completed);
    setProgressUpdateTrigger((prev) => prev + 1);  // 兄弟更新トリガー
    toast.success(result.completed ? '記事を完了しました' : '完了を取り消しました');
  } catch (error) {
    toast.error('進捗の更新に失敗しました');
  } finally {
    setIsLoading(false);
  }
};
```

**2. progress.ts (サービス)**
```typescript
export const toggleArticleCompletion = async (articleId, lessonId) => {
  // 認証チェック
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('User not authenticated');

  // 既存チェック
  const { data: existing } = await supabase
    .from('article_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('article_id', articleId)
    .single();

  if (existing) {
    // UPDATE
    const newStatus = existing.status === 'completed' ? 'not_started' : 'completed';
    await supabase.from('article_progress').update({...}).eq('id', existing.id);
    return { completed: newStatus === 'completed' };
  } else {
    // INSERT
    await supabase.from('article_progress').insert({...});
    return { completed: true };
  }
};
```

---

## 2. 進捗データ取得時のフロー（サイドナビゲーション）

### シーケンス図

```
ArticleDetail       ArticleSideNav        progress.ts        Supabase       article_progress
     |                    |                    |                 |                 |
     |--progressUpdateTrigger変更              |                 |                 |
     |                    |                    |                 |                 |
     |                    |--useEffect()------>|                 |                 |
     |                    |                    |                 |                 |
     |                    |----getLessonProgress(lessonId, articleIds)             |
     |                    |                    |                 |                 |
     |                    |                    |--getUser()----->|                 |
     |                    |                    |<--user----------|                 |
     |                    |                    |                 |                 |
     |                    |                    |--SELECT * WHERE-|---------------->|
     |                    |                    |  user_id AND    |                 |
     |                    |                    |  lesson_id      |                 |
     |                    |                    |<--rows----------|-----------------|
     |                    |                    |                 |                 |
     |                    |<--{ totalArticles, completedArticles, percentage, completedArticleIds }
     |                    |                    |                 |                 |
     |                    |--setProgress()     |                 |                 |
     |                    |--UI再計算----------|                 |                 |
```

### コードフロー

**ArticleSideNav.tsx**
```typescript
const [progress, setProgress] = useState<LessonProgress | null>(null);

useEffect(() => {
  const fetchProgress = async () => {
    if (!article.lessonInfo?._id || !article.lessonInfo?.quests) return;

    // すべてのクエストから記事IDを収集
    const articleIds: string[] = [];
    article.lessonInfo.quests.forEach(quest => {
      if (quest.articles) {
        articleIds.push(...quest.articles.map(a => a._id));
      }
    });

    const lessonProgress = await getLessonProgress(
      article.lessonInfo._id,
      articleIds
    );
    setProgress(lessonProgress);
  };

  fetchProgress();
}, [article.lessonInfo, progressUpdateTrigger]);  // トリガー変更で再取得
```

---

## 3. 状態管理パターン

### 使用技術

- [x] **ローカル useState** - メイン状態管理
- [ ] React Context - 未使用
- [ ] React Query / TanStack Query - 未使用
- [ ] Zustand - 未使用

### グローバル状態

**なし** - 進捗データはページローカルで管理

### ローカル状態

| コンポーネント | 状態 | 用途 |
|--------------|------|------|
| `ArticleDetail.tsx` | `isCompleted` | 現在の記事の完了状態 |
| `ArticleDetail.tsx` | `progressUpdateTrigger` | 兄弟コンポーネント更新用カウンター |
| `ArticleSideNav.tsx` | `progress` | サイドナビの進捗表示用 |
| `LessonDetail.tsx` | `questProgressMap` | クエストごとの進捗マップ |

---

## 4. 兄弟コンポーネント間の同期

### 問題

`ArticleDetail` と `ArticleSideNav` は兄弟関係。
完了ボタン押下時、サイドナビの進捗表示も更新が必要。

### 現在の解決策: トリガーパターン

```
ArticleDetail (親から props で progressUpdateTrigger を受け取る)
     ↓ 完了ボタン押下
     ↓ setProgressUpdateTrigger(prev => prev + 1)
     ↓
ArticleSideNav (props.progressUpdateTrigger が変化)
     ↓ useEffect が発火
     ↓ getLessonProgress() 再実行
     ↓ UI更新
```

### 問題点

1. **毎回全件取得**: トリガー発火時、全記事の進捗を再取得
2. **ネットワーク効率悪い**: 1件の変更で全件再取得
3. **楽観的更新なし**: DB応答を待ってからUI更新

---

## 5. 楽観的更新 vs 悲観的更新

### 現状の実装: 悲観的更新

```typescript
// ArticleDetail.tsx
const handleCompleteToggle = async () => {
  setIsLoading(true);  // ローディング表示
  try {
    const result = await toggleArticleCompletion(articleId, lessonId);  // API待ち
    setIsCompleted(result.completed);  // 成功後にUI更新
    // ...
  } catch (error) {
    toast.error('進捗の更新に失敗しました');  // エラー表示
  }
};
```

**特徴**:
- DB操作が成功してからUI更新
- ユーザーは操作完了まで待つ必要あり
- エラー時のロールバック不要

### 推奨: 楽観的更新（将来改善案）

```typescript
const handleCompleteToggle = async () => {
  const previousState = isCompleted;
  setIsCompleted(!previousState);  // 先にUI更新（楽観的）

  try {
    await toggleArticleCompletion(articleId, lessonId);
  } catch (error) {
    setIsCompleted(previousState);  // 失敗時にロールバック
    toast.error('進捗の更新に失敗しました');
  }
};
```

---

## 6. キャッシュ戦略

### クライアント側

**なし** - 毎回 Supabase にクエリを実行

### サーバー側

**なし** - Supabase のデフォルト動作

### 問題点

1. 同じページで複数回 `getLessonProgress` が呼ばれる
2. キャッシュがないため、毎回 DB クエリ実行
3. パフォーマンス上の非効率

---

## 7. 発見した問題点まとめ

| 問題 | 影響 | 推奨解決策 |
|------|------|-----------|
| 悲観的更新のみ | UX が遅い | 楽観的更新の導入 |
| キャッシュなし | 不要な DB クエリ | React Query 導入 |
| トリガーパターンで全件再取得 | ネットワーク非効率 | 部分更新の実装 |
| グローバル状態なし | コンポーネント間同期が複雑 | Context または Zustand 導入 |

---

## 更新履歴

| 日付 | 内容 |
|------|------|
| 2025-12-06 | Phase 3 調査完了 - データフロー全体像を把握 |
| 2025-12-06 | テンプレート作成 |
