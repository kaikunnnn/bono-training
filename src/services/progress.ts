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

/**
 * レッスンの進捗情報
 */
export interface LessonProgress {
  lessonId: string;
  totalArticles: number;
  completedArticles: number;
  percentage: number; // 0-100
  completedArticleIds: string[];
  lastUpdatedAt: string | null; // 最新の進捗更新日時
}

/**
 * レッスンの進捗状況を取得
 * @param lessonId レッスンID
 * @param articleIds そのレッスンに含まれる全記事ID
 * @returns レッスンの進捗情報
 */
export async function getLessonProgress(
  lessonId: string,
  articleIds: string[]
): Promise<LessonProgress> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || articleIds.length === 0) {
      return {
        lessonId,
        totalArticles: articleIds.length,
        completedArticles: 0,
        percentage: 0,
        completedArticleIds: [],
        lastUpdatedAt: null,
      };
    }

    // そのレッスンの記事で完了しているものを取得（更新日時も含める）
    const { data } = await supabase
      .from('article_progress')
      .select('article_id, updated_at')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .eq('status', 'completed')
      .in('article_id', articleIds)
      .order('updated_at', { ascending: false });

    const completedArticleIds = data?.map(item => item.article_id) || [];
    const completedCount = completedArticleIds.length;
    const percentage = Math.round((completedCount / articleIds.length) * 100);
    // 最新の更新日時を取得
    const lastUpdatedAt = data && data.length > 0 ? data[0].updated_at : null;

    return {
      lessonId,
      totalArticles: articleIds.length,
      completedArticles: completedCount,
      percentage,
      completedArticleIds,
      lastUpdatedAt,
    };
  } catch (error) {
    console.error('Get lesson progress error:', error);
    return {
      lessonId,
      totalArticles: articleIds.length,
      completedArticles: 0,
      percentage: 0,
      completedArticleIds: [],
      lastUpdatedAt: null,
    };
  }
}

/**
 * 複数のレッスンの進捗を一括取得（バッチクエリ版）
 * @param lessons レッスン情報の配列 { lessonId, articleIds }
 * @param userId オプション: 認証済みユーザーID（渡すと認証チェックをスキップ）
 * @returns レッスン進捗のマップ
 */
export async function getMultipleLessonProgress(
  lessons: Array<{ lessonId: string; articleIds: string[] }>,
  userId?: string
): Promise<Record<string, LessonProgress>> {
  const progressMap: Record<string, LessonProgress> = {};

  // デフォルト値を設定
  lessons.forEach(lesson => {
    progressMap[lesson.lessonId] = {
      lessonId: lesson.lessonId,
      totalArticles: lesson.articleIds.length,
      completedArticles: 0,
      percentage: 0,
      completedArticleIds: [],
      lastUpdatedAt: null,
    };
  });

  try {
    // ユーザーIDが渡されていない場合のみ認証チェック
    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return progressMap;
      uid = user.id;
    }

    // 全レッスンIDを取得
    const lessonIds = lessons.map(l => l.lessonId);
    if (lessonIds.length === 0) return progressMap;

    // 1回のクエリで全レッスンの完了記事を取得
    const { data } = await supabase
      .from('article_progress')
      .select('lesson_id, article_id, updated_at')
      .eq('user_id', uid)
      .eq('status', 'completed')
      .in('lesson_id', lessonIds)
      .order('updated_at', { ascending: false });

    if (!data) return progressMap;

    // レッスンごとにグループ化
    const groupedByLesson: Record<string, Array<{ article_id: string; updated_at: string }>> = {};
    data.forEach(item => {
      if (!groupedByLesson[item.lesson_id]) {
        groupedByLesson[item.lesson_id] = [];
      }
      groupedByLesson[item.lesson_id].push({
        article_id: item.article_id,
        updated_at: item.updated_at,
      });
    });

    // 各レッスンの進捗を計算
    lessons.forEach(lesson => {
      const completedItems = groupedByLesson[lesson.lessonId] || [];
      // そのレッスンに属する記事のみをフィルタ
      const validCompleted = completedItems.filter(item =>
        lesson.articleIds.includes(item.article_id)
      );
      const completedArticleIds = validCompleted.map(item => item.article_id);
      const completedCount = completedArticleIds.length;
      const percentage = lesson.articleIds.length > 0
        ? Math.round((completedCount / lesson.articleIds.length) * 100)
        : 0;
      const lastUpdatedAt = validCompleted.length > 0 ? validCompleted[0].updated_at : null;

      progressMap[lesson.lessonId] = {
        lessonId: lesson.lessonId,
        totalArticles: lesson.articleIds.length,
        completedArticles: completedCount,
        percentage,
        completedArticleIds,
        lastUpdatedAt,
      };
    });

    return progressMap;
  } catch (error) {
    console.error('Get multiple lesson progress error:', error);
    return progressMap;
  }
}

/**
 * 記事IDが完了済みかどうかをチェック
 * @param articleId 記事ID
 * @returns 完了済みならtrue
 */
export async function isArticleCompleted(articleId: string): Promise<boolean> {
  const status = await getArticleProgress(articleId);
  return status === 'completed';
}

/**
 * レッスン進捗のステータス
 */
export type LessonStatus = 'not_started' | 'in_progress' | 'completed';

/**
 * レッスンを完了状態にする
 * 100%達成後にユーザーが「レッスンを完了する」ボタンをクリックした時に呼ばれる
 * @param lessonId レッスンID (Sanity lesson._id)
 * @returns {success: boolean}
 */
export async function markLessonAsCompleted(
  lessonId: string
): Promise<{ success: boolean }> {
  try {
    // 1. 認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'ログインが必要です',
        description: '進捗を保存するにはログインしてください',
        variant: 'destructive',
      });
      return { success: false };
    }

    // 2. lesson_progressをupsert（存在すれば更新、なければ作成）
    const now = new Date().toISOString();
    const { error } = await supabase
      .from('lesson_progress')
      .upsert(
        {
          user_id: user.id,
          lesson_id: lessonId,
          status: 'completed',
          completed_at: now,
          updated_at: now,
        },
        {
          onConflict: 'user_id,lesson_id',
        }
      );

    if (error) throw error;

    toast({
      title: 'レッスンを完了しました！',
      description: 'おめでとうございます！',
    });
    return { success: true };
  } catch (error) {
    console.error('Mark lesson as completed error:', error);
    toast({
      title: 'エラーが発生しました',
      description: 'もう一度お試しください',
      variant: 'destructive',
    });
    return { success: false };
  }
}

/**
 * レッスンの完了ステータスを取得
 * @param lessonId レッスンID
 * @returns レッスンのステータス
 */
export async function getLessonStatus(
  lessonId: string
): Promise<LessonStatus> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 'not_started';

    const { data } = await supabase
      .from('lesson_progress')
      .select('status')
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId)
      .maybeSingle();

    return (data?.status as LessonStatus) || 'not_started';
  } catch (error) {
    console.error('Get lesson status error:', error);
    return 'not_started';
  }
}

/**
 * 複数レッスンの完了ステータスを一括取得
 * @param lessonIds レッスンIDの配列
 * @param userId オプション: 認証済みユーザーID（渡すと認証チェックをスキップ）
 * @returns レッスンIDとステータスのマップ
 */
export async function getMultipleLessonStatus(
  lessonIds: string[],
  userId?: string
): Promise<Record<string, LessonStatus>> {
  const statusMap: Record<string, LessonStatus> = {};

  // デフォルト値を設定
  lessonIds.forEach(id => {
    statusMap[id] = 'not_started';
  });

  try {
    // ユーザーIDが渡されていない場合のみ認証チェック
    let uid = userId;
    if (!uid) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return statusMap;
      uid = user.id;
    }

    if (lessonIds.length === 0) return statusMap;

    const { data } = await supabase
      .from('lesson_progress')
      .select('lesson_id, status')
      .eq('user_id', uid)
      .in('lesson_id', lessonIds);

    if (data) {
      data.forEach(item => {
        statusMap[item.lesson_id] = item.status as LessonStatus;
      });
    }

    return statusMap;
  } catch (error) {
    console.error('Get multiple lesson status error:', error);
    return statusMap;
  }
}

/**
 * レッスンの完了状態を解除する
 * @param lessonId レッスンID (Sanity lesson._id)
 * @param showToast トーストを表示するかどうか（デフォルト: false）
 * @returns {success: boolean}
 */
export async function removeLessonCompletion(
  lessonId: string,
  showToast: boolean = false
): Promise<{ success: boolean }> {
  try {
    console.log('[removeLessonCompletion] Starting with lessonId:', lessonId);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.log('[removeLessonCompletion] No user found');
      return { success: false };
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('lesson_progress')
      .update({
        status: 'in_progress',
        completed_at: null,
        updated_at: now,
      })
      .eq('user_id', user.id)
      .eq('lesson_id', lessonId);

    if (error) {
      console.error('[removeLessonCompletion] Update error:', error);
      throw error;
    }

    console.log('[removeLessonCompletion] Successfully removed lesson completion');

    if (showToast) {
      toast({
        title: 'レッスン完了を解除しました',
        description: '記事の完了状態を変更したため、レッスン完了も解除されました',
      });
    }
    return { success: true };
  } catch (error) {
    console.error('Remove lesson completion error:', error);
    return { success: false };
  }
}
