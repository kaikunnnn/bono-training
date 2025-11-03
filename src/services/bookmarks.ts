import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

/**
 * 記事をブックマーク/解除する（トグル）
 * @param articleId 記事ID (Sanity article._id)
 * @param isPremium 記事がプレミアムかどうか（将来のサブスクリプション連携用）
 * @returns {success: boolean, isBookmarked: boolean}
 */
export async function toggleBookmark(
  articleId: string,
  isPremium: boolean = false
): Promise<{ success: boolean; isBookmarked: boolean }> {
  try {
    // 1. 認証チェック
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: 'ログインが必要です',
        description: 'ブックマークするにはログインしてください',
        variant: 'destructive',
      });
      return { success: false, isBookmarked: false };
    }

    // 2. プレミアム記事の場合の警告（フェーズ6で実装予定）
    if (isPremium) {
      console.warn('Premium article bookmark - subscription check will be implemented in Phase 6');
    }

    // 3. 既存のブックマークを確認
    const { data: existing } = await supabase
      .from('article_bookmarks')
      .select('*')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .maybeSingle();

    if (existing) {
      // 既にブックマーク済み → 削除
      const { error } = await supabase
        .from('article_bookmarks')
        .delete()
        .eq('user_id', user.id)
        .eq('article_id', articleId);

      if (error) throw error;

      toast({
        title: 'ブックマークを解除しました',
        description: 'お気に入りから削除されました',
      });
      return { success: true, isBookmarked: false };
    } else {
      // ブックマークされていない → 追加
      const { error } = await supabase
        .from('article_bookmarks')
        .insert({
          user_id: user.id,
          article_id: articleId,
        });

      if (error) throw error;

      toast({
        title: 'ブックマークに追加しました',
        description: 'マイページから確認できます',
      });
      return { success: true, isBookmarked: true };
    }
  } catch (error) {
    console.error('Bookmark error:', error);
    toast({
      title: 'エラーが発生しました',
      description: 'もう一度お試しください',
      variant: 'destructive',
    });
    return { success: false, isBookmarked: false };
  }
}

/**
 * 記事がブックマーク済みかチェック
 * @param articleId 記事ID
 * @returns boolean
 */
export async function isBookmarked(articleId: string): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data } = await supabase
      .from('article_bookmarks')
      .select('article_id')
      .eq('user_id', user.id)
      .eq('article_id', articleId)
      .maybeSingle();

    return !!data;
  } catch (error) {
    console.error('Check bookmark error:', error);
    return false;
  }
}

/**
 * ユーザーのブックマーク一覧を取得
 * @returns ブックマークした記事ID一覧
 */
export async function getBookmarks(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('article_bookmarks')
      .select('article_id')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(b => b.article_id) || [];
  } catch (error) {
    console.error('Get bookmarks error:', error);
    return [];
  }
}
