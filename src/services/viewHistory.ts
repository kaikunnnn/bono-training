import { supabase } from '@/integrations/supabase/client';
import { client } from '@/lib/sanity';
import type { Article } from '@/types/sanity';

const MAX_HISTORY_COUNT = 50;
const DISPLAY_LIMIT = 20;

/**
 * 記事閲覧を記録する
 * - 同じ記事は1件のみ保存（再閲覧時は日時を更新）
 * - 50件を超えた古い履歴は自動削除
 * @param articleId 記事ID (Sanity article._id)
 */
export async function recordViewHistory(articleId: string): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // UPSERT: 存在すれば更新、なければ追加
    const { error: upsertError } = await supabase
      .from('article_view_history')
      .upsert(
        {
          user_id: user.id,
          article_id: articleId,
          viewed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,article_id',
        }
      );

    if (upsertError) {
      console.error('View history upsert error:', upsertError);
      return;
    }

    // 50件を超えた古い履歴を削除
    await cleanupOldHistory(user.id);
  } catch (error) {
    console.error('Record view history error:', error);
  }
}

/**
 * 古い履歴を削除（50件を超えた分）
 */
async function cleanupOldHistory(userId: string): Promise<void> {
  try {
    // 全履歴を取得して件数確認
    const { data: allHistory, error: fetchError } = await supabase
      .from('article_view_history')
      .select('article_id, viewed_at')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false });

    if (fetchError || !allHistory || allHistory.length <= MAX_HISTORY_COUNT) {
      return; // 50件以下なら削除不要
    }

    // 50件目以降の古い履歴のIDを取得
    const idsToDelete = allHistory
      .slice(MAX_HISTORY_COUNT)
      .map(h => h.article_id);

    if (idsToDelete.length === 0) return;

    // 古い履歴を削除
    const { error } = await supabase
      .from('article_view_history')
      .delete()
      .eq('user_id', userId)
      .in('article_id', idsToDelete);

    if (error) {
      console.error('Cleanup old history error:', error);
    }
  } catch (error) {
    console.error('Cleanup history error:', error);
  }
}

/**
 * 閲覧履歴の記事ID一覧を取得（最新20件）
 */
export async function getViewHistoryIds(): Promise<string[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    const { data, error } = await supabase
      .from('article_view_history')
      .select('article_id')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(DISPLAY_LIMIT);

    if (error) throw error;

    return data?.map(h => h.article_id) || [];
  } catch (error) {
    console.error('Get view history error:', error);
    return [];
  }
}

export interface ViewedArticle extends Article {
  thumbnailUrl?: string;
  resolvedThumbnailUrl?: string;
  viewedAt?: string;
  questInfo?: {
    _id: string;
    questNumber: number;
    title: string;
    lessonInfo?: {
      _id: string;
      title: string;
      slug: {
        current: string;
      };
    };
  };
}

/**
 * 閲覧履歴の記事詳細を取得（最新20件）
 * @returns 閲覧した記事の配列（Sanityから取得、閲覧日時順）
 */
export async function getViewHistory(): Promise<ViewedArticle[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];

    // 1. Supabaseから閲覧履歴を取得（ID + 閲覧日時）
    const { data: historyData, error } = await supabase
      .from('article_view_history')
      .select('article_id, viewed_at')
      .eq('user_id', user.id)
      .order('viewed_at', { ascending: false })
      .limit(DISPLAY_LIMIT);

    if (error) throw error;
    if (!historyData || historyData.length === 0) return [];

    const articleIds = historyData.map(h => h.article_id);
    const viewedAtMap = new Map(historyData.map(h => [h.article_id, h.viewed_at]));

    // 2. SanityからArticle情報を取得
    const query = `*[_type == "article" && _id in $ids] {
      _id,
      _type,
      title,
      slug,
      thumbnail,
      thumbnailUrl,
      "resolvedThumbnailUrl": coalesce(
        thumbnailUrl,
        thumbnail.asset->url
      ),
      videoDuration,
      articleNumber,
      excerpt,
      content,
      learningObjectives,
      quest,
      publishedAt,
      author,
      tags,
      isPremium,
      "questInfo": *[_type == "quest" && references(^._id)][0] {
        _id,
        questNumber,
        title,
        "lessonInfo": *[_type == "lesson" && references(^._id)][0] {
          _id,
          title,
          slug
        }
      }
    }`;

    const articles: ViewedArticle[] = await client.fetch(query, { ids: articleIds });

    // 3. 閲覧日時を付与し、閲覧日時順にソート
    const articlesWithViewedAt = articles.map(article => ({
      ...article,
      viewedAt: viewedAtMap.get(article._id),
    }));

    // articleIdsの順序（=閲覧日時降順）で並び替え
    articlesWithViewedAt.sort((a, b) => {
      const indexA = articleIds.indexOf(a._id);
      const indexB = articleIds.indexOf(b._id);
      return indexA - indexB;
    });

    return articlesWithViewedAt;
  } catch (error) {
    console.error('Get view history articles error:', error);
    return [];
  }
}

/**
 * 閲覧履歴をクリア（全削除）
 */
export async function clearViewHistory(): Promise<boolean> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('article_view_history')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Clear view history error:', error);
    return false;
  }
}
