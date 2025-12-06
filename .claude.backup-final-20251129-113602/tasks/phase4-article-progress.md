# フェーズ4: 記事進捗管理（完了ボタン）- 詳細実装計画

## 📋 概要

- **目的**: 記事を「完了」状態にする機能を実装
- **所要時間**: 1-2時間
- **前提条件**: フェーズ1完了（`article_progress` テーブルが存在）

---

## 🎯 このフェーズで実装するもの

### 1. 進捗サービス層
- `src/services/progress.ts` を作成
- 記事の完了/未完了を管理

### 2. UI実装
- ArticleDetailページの「完了にする」ボタンに機能追加
- 完了済み記事は「完了済み ✓」と表示（グリーン）
- ページリロード時に状態を保持

---

## 🧩 ユーザー体験

1. ユーザーが記事を読み終わる
2. ヘッダーの「完了にする」ボタンをクリック
3. トースト通知「この記事を完了にしました」が表示される
4. ボタンが「完了済み ✓」に変わる（グリーン）
5. ページをリロードしても「完了済み」状態が保持される
6. もう一度クリックすると「未完了」に戻る（トグル）

---

## 📝 ステップバイステップ実装手順

### ステップ1: 進捗サービス層の作成

**ファイル**: `src/services/progress.ts`（新規作成）

```typescript
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export interface ArticleProgress {
  user_id: string;
  article_id: string;
  lesson_id: string;
  status: 'not_started' | 'in_progress' | 'completed';
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * 記事を完了状態にする（トグル）
 * @param articleId 記事ID (Sanity article._id)
 * @param lessonId レッスンID (Sanity lesson._id)
 * @returns {success: boolean, isCompleted: boolean}
 */
export async function toggleArticleCompletion(
  articleId: string,
  lessonId: string
): Promise<{ success: boolean; isCompleted: boolean }> {
  try {
    // 1. 認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'ログインが必要です',
        description: '進捗を保存するにはログインしてください',
        variant: 'destructive',
      });
      return { success: false, isCompleted: false };
    }

    // 2. 既存の進捗を確認
    const { data: existing } = await supabase
      .from('article_progress')
      .select('*')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .maybeSingle();

    if (existing && existing.status === 'completed') {
      // 既に完了済み → 未完了に戻す
      const { error } = await supabase
        .from('article_progress')
        .update({
          status: 'not_started',
          completed_at: null,
        })
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (error) throw error;

      toast({
        title: '未完了に戻しました',
        description: 'この記事を未完了にしました',
      });
      return { success: true, isCompleted: false };
    } else if (existing) {
      // 進行中 → 完了にする
      const { error } = await supabase
        .from('article_progress')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (error) throw error;

      toast({
        title: '完了にしました',
        description: 'この記事を完了にしました',
      });
      return { success: true, isCompleted: true };
    } else {
      // 未記録 → 完了として新規作成
      const { error } = await supabase
        .from('article_progress')
        .insert({
          user_id: user.id,
          article_id: articleId,
          lesson_id: lessonId,
          status: 'completed',
          completed_at: new Date().toISOString(),
        });

      if (error) throw error;

      toast({
        title: '完了にしました',
        description: 'この記事を完了にしました',
      });
      return { success: true, isCompleted: true };
    }
  } catch (error) {
    console.error('Article progress error:', error);
    toast({
      title: 'エラーが発生しました',
      description: 'もう一度お試しください',
      variant: 'destructive',
    });
    return { success: false, isCompleted: false };
  }
}

/**
 * 記事の進捗状態を取得
 * @param articleId 記事ID
 * @returns 進捗状態（completed, in_progress, not_started）
 */
export async function getArticleProgress(
  articleId: string
): Promise<'completed' | 'in_progress' | 'not_started'> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'not_started';

    const { data } = await supabase
      .from('article_progress')
      .select('status')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .maybeSingle();

    return data?.status || 'not_started';
  } catch (error) {
    console.error('Get article progress error:', error);
    return 'not_started';
  }
}
```

---

### ステップ2: HeadingSectionコンポーネントの更新

**ファイル**: `src/components/article/HeadingSection.tsx`

#### 変更点

1. **プロップの追加**:
```typescript
interface HeadingSectionProps {
  // 既存のプロップ...
  isCompleted?: boolean;
  completionLoading?: boolean;
}
```

2. **完了ボタンの見た目を変更**:
```typescript
{/* Complete Button */}
<button
  onClick={onComplete}
  disabled={completionLoading}
  className={`flex items-center gap-1 px-3 py-2 rounded-full transition-colors ${
    isCompleted
      ? 'bg-green-100 hover:bg-green-200 text-green-800'
      : 'bg-[#F3F5F5] hover:bg-gray-200 text-[#34373D]'
  } disabled:opacity-50 disabled:cursor-not-allowed`}
  style={{ fontFamily: "Inter, sans-serif" }}
>
  <Check className="w-[18px] h-[18px]" strokeWidth={2} />
  <span
    className={`text-sm font-bold leading-5`}
    style={{ letterSpacing: "-1.07421875%" }}
  >
    {isCompleted ? '完了済み' : '完了にする'}
  </span>
</button>
```

---

### ステップ3: ArticleDetailページの更新

**ファイル**: `src/pages/ArticleDetail.tsx`

#### 変更点

1. **インポート追加**:
```typescript
import { toggleArticleCompletion, getArticleProgress } from '@/services/progress';
```

2. **状態管理の追加**:
```typescript
const [isCompleted, setIsCompleted] = useState(false);
const [completionLoading, setCompletionLoading] = useState(false);
```

3. **進捗状態の初期化**:
```typescript
// 記事の進捗状態を取得
useEffect(() => {
  const checkProgress = async () => {
    if (article?._id) {
      const status = await getArticleProgress(article._id);
      setIsCompleted(status === 'completed');
    }
  };
  checkProgress();
}, [article?._id]);
```

4. **完了トグル処理**:
```typescript
// 完了ボタンのハンドラー
const handleCompleteToggle = async () => {
  if (!article || !article.lessonInfo?._id) return;

  setCompletionLoading(true);
  const result = await toggleArticleCompletion(
    article._id,
    article.lessonInfo._id
  );

  if (result.success) {
    setIsCompleted(result.isCompleted);
  }
  setCompletionLoading(false);
};
```

5. **HeadingSectionに渡す**:
```typescript
<HeadingSection
  // 既存のプロップ...
  onComplete={handleCompleteToggle}
  isCompleted={isCompleted}
  completionLoading={completionLoading}
/>
```

---

## ✅ 完了チェックリスト

- [ ] `src/services/progress.ts` を作成
- [ ] `toggleArticleCompletion()` 関数を実装
- [ ] `getArticleProgress()` 関数を実装
- [ ] HeadingSectionコンポーネントを更新
  - [ ] `isCompleted` プロップを追加
  - [ ] `completionLoading` プロップを追加
  - [ ] ボタンの見た目を状態に応じて変更
- [ ] ArticleDetailページを更新
  - [ ] 進捗サービスをインポート
  - [ ] 状態管理を追加
  - [ ] 進捗状態の初期化
  - [ ] 完了トグル処理を実装
- [ ] 手動テストを実施
  - [ ] 「完了にする」をクリック → 「完了済み」に変わる
  - [ ] ページリロード → 「完了済み」が保持される
  - [ ] 「完了済み」をクリック → 「完了にする」に戻る
  - [ ] Supabase Dashboardでデータを確認
- [ ] コミット

---

## 🎨 デザイン仕様

### 完了ボタンの状態

**未完了**:
```
┌──────────────────┐
│ ✓ 完了にする     │  ← グレー背景
└──────────────────┘
```

**完了済み**:
```
┌──────────────────┐
│ ✓ 完了済み       │  ← グリーン背景
└──────────────────┘
```

---

## 📚 参考情報

### Supabaseクエリ例

```typescript
// 進捗を確認
await supabase
  .from('article_progress')
  .select('*')
  .eq('user_id', userId)
  .eq('article_id', articleId)
  .maybeSingle();

// 完了状態に更新
await supabase
  .from('article_progress')
  .update({
    status: 'completed',
    completed_at: new Date().toISOString(),
  })
  .eq('user_id', userId)
  .eq('article_id', articleId);
```

---

## 🎉 フェーズ4完了後の状態

- ✅ 記事を完了状態にできる
- ✅ 完了状態が視覚的にわかる（グリーンボタン）
- ✅ ページリロード時に状態が保持される
- ✅ 完了/未完了をトグルできる
- ⏳ サイドナビでの完了マーク（フェーズ5で実装）
- ⏳ レッスン進捗の計算（フェーズ5で実装）
- ⏳ マイページでの進捗表示（フェーズ5で実装）

**次のステップ**: フェーズ5のレッスン進捗管理に進みます！
