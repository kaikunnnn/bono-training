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
