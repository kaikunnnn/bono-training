/**
 * 花の進捗計算サービス
 * レッスンの完了率を計算し、成長段階を決定
 */

import { supabase } from '@/integrations/supabase/client';
import { LessonProgress, GrowthStage } from '@/types/flower';
import { client as sanityClient } from '@/lib/sanity';

/**
 * 完了率から成長段階を計算
 */
export function calculateGrowthStage(completionRate: number): GrowthStage {
  if (completionRate === 0) return 0;
  if (completionRate <= 25) return 1;
  if (completionRate <= 50) return 2;
  if (completionRate <= 75) return 3;
  if (completionRate < 100) return 4;
  return 5;
}

/**
 * Sanityからレッスンの記事IDリストを取得
 */
async function getArticleIdsFromLesson(lessonId: string): Promise<string[]> {
  const query = `
    *[_type == "lesson" && _id == $lessonId][0] {
      "articles": quests[]->articles[]->_id
    }
  `;

  const result = await sanityClient.fetch(query, { lessonId });

  if (!result || !result.articles) {
    return [];
  }

  // 記事IDを平坦化（ネストされた配列の処理）
  const articleIds = result.articles.flat().filter(Boolean);
  return articleIds;
}

/**
 * Sanityから全レッスンの情報を取得
 */
async function getAllLessonsWithArticles() {
  const query = `
    *[_type == "lesson"] {
      _id,
      title,
      "slug": slug.current,
      category,
      "quests": quests[]-> {
        _id,
        "articles": articles[]->_id
      }
    }
  `;

  const lessons = await sanityClient.fetch(query);
  return lessons;
}

/**
 * Supabaseからユーザーの完了記事IDリストを取得
 */
async function getCompletedArticleIds(userId: string): Promise<string[]> {
  const { data, error } = await supabase
    .from('user_progress')
    .select('task_id')
    .eq('user_id', userId)
    .eq('status', 'done');

  if (error) {
    console.error('Error fetching user progress:', error);
    return [];
  }

  return data?.map((item) => item.task_id) || [];
}

/**
 * 特定のレッスンの進捗を計算
 */
export async function calculateLessonProgress(
  lessonId: string,
  lessonTitle: string,
  lessonSlug: string,
  category: string | undefined,
  userId: string
): Promise<LessonProgress> {
  try {
    // 1. レッスン内の全記事IDを取得
    const allArticleIds = await getArticleIdsFromLesson(lessonId);
    const totalArticles = allArticleIds.length;

    // 2. ユーザーが完了した記事IDを取得
    const completedArticleIds = await getCompletedArticleIds(userId);

    // 3. このレッスンで完了した記事数を計算
    const completedArticles = allArticleIds.filter((id) =>
      completedArticleIds.includes(id)
    ).length;

    // 4. 完了率を計算
    const completionRate = totalArticles > 0
      ? (completedArticles / totalArticles) * 100
      : 0;

    // 5. 成長段階を決定
    const growthStage = calculateGrowthStage(completionRate);

    return {
      lessonId,
      lessonTitle,
      lessonSlug,
      category,
      totalArticles,
      completedArticles,
      completionRate,
      growthStage,
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Error calculating lesson progress:', error);

    // エラー時はデフォルト値を返す
    return {
      lessonId,
      lessonTitle,
      lessonSlug,
      category,
      totalArticles: 0,
      completedArticles: 0,
      completionRate: 0,
      growthStage: 0,
      lastUpdated: new Date().toISOString(),
    };
  }
}

/**
 * ユーザーの全レッスン進捗を取得
 */
export async function getAllLessonsProgress(userId: string): Promise<LessonProgress[]> {
  try {
    // 1. Sanityから全レッスン情報を取得
    const lessons = await getAllLessonsWithArticles();

    // 2. ユーザーが完了した記事IDを一度だけ取得（パフォーマンス最適化）
    const completedArticleIds = await getCompletedArticleIds(userId);

    // 3. 各レッスンの進捗を計算
    const progressList: LessonProgress[] = lessons.map((lesson: any) => {
      // レッスン内の全記事IDを取得
      const allArticleIds: string[] = [];
      if (lesson.quests) {
        lesson.quests.forEach((quest: any) => {
          if (quest.articles) {
            allArticleIds.push(...quest.articles);
          }
        });
      }

      const totalArticles = allArticleIds.length;
      const completedArticles = allArticleIds.filter((id) =>
        completedArticleIds.includes(id)
      ).length;

      const completionRate = totalArticles > 0
        ? (completedArticles / totalArticles) * 100
        : 0;

      const growthStage = calculateGrowthStage(completionRate);

      return {
        lessonId: lesson._id,
        lessonTitle: lesson.title,
        lessonSlug: lesson.slug,
        category: lesson.category,
        totalArticles,
        completedArticles,
        completionRate,
        growthStage,
        lastUpdated: new Date().toISOString(),
      };
    });

    return progressList;
  } catch (error) {
    console.error('Error fetching all lessons progress:', error);
    return [];
  }
}

/**
 * 記事完了時に呼び出す関数
 * user_progressテーブルを更新
 */
export async function markArticleAsComplete(
  userId: string,
  articleId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert(
        {
          user_id: userId,
          task_id: articleId,
          status: 'done',
          completed_at: new Date().toISOString(),
        },
        {
          onConflict: 'user_id,task_id',
        }
      );

    if (error) {
      console.error('Error marking article as complete:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markArticleAsComplete:', error);
    return false;
  }
}
