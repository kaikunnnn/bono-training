import { supabase } from "@/integrations/supabase/client";
import { getTrainingMetaFromStorage, getMdxContentFromStorage } from "./storage";
import { Tables } from "@/integrations/supabase/types";
import { Task, Training, TrainingDetailData, TaskDetailData } from "@/types/training";
import { loadMdxContent } from "@/utils/mdxLoader";

/**
 * トレーニング詳細を取得する
 */
export async function getTrainingDetail(slug: string): Promise<TrainingDetailData | null> {
  try {
    // まずStorageからメタデータを取得
    const metaData = await getTrainingMetaFromStorage(slug);
    
    // データベースからトレーニング情報を取得
    const { data: trainingData, error: trainingError } = await supabase
      .from('training')
      .select('*, task(*)')
      .eq('slug', slug)
      .maybeSingle(); // single()の代わりにmaybeSingle()を使用

    if (trainingError && trainingError.code !== 'PGRST116') {
      // PGRST116以外のエラーの場合はエラーを投げる
      console.error('トレーニングデータ取得エラー:', trainingError);
      
      // Storageからのデータがある場合はそれを使用
      if (metaData) {
        return {
          id: `storage-${slug}`,
          slug: slug,
          title: metaData.frontmatter.title,
          description: metaData.frontmatter.description || metaData.content.split('\n')[0],
          type: metaData.frontmatter.type || 'skill',
          difficulty: metaData.frontmatter.difficulty || '初級',
          tags: metaData.frontmatter.tags || [],
          tasks: [], // タスクリストは別途取得
          thumbnailImage: metaData.frontmatter.thumbnailImage
        };
      }
      return null;
    }

    // データベースにデータがない場合はStorageのデータのみを使用
    if (!trainingData && metaData) {
      return {
        id: `storage-${slug}`,
        slug: slug,
        title: metaData.frontmatter.title,
        description: metaData.frontmatter.description || metaData.content.split('\n')[0],
        type: metaData.frontmatter.type || 'skill',
        difficulty: metaData.frontmatter.difficulty || '初級',
        tags: metaData.frontmatter.tags || [],
        tasks: [], // タスクリストは別途取得
        thumbnailImage: metaData.frontmatter.thumbnailImage
      };
    }

    // メタデータとデータベースの情報をマージ
    const mergedData: TrainingDetailData = {
      id: trainingData?.id || `storage-${slug}`,
      slug: trainingData?.slug || slug,
      title: metaData?.frontmatter.title || trainingData?.title || slug,
      description: metaData?.frontmatter.description || trainingData?.description || '',
      type: metaData?.frontmatter.type || trainingData?.type || 'skill',
      difficulty: metaData?.frontmatter.difficulty || trainingData?.difficulty || '初級',
      tags: metaData?.frontmatter.tags || trainingData?.tags || [],
      tasks: trainingData?.task as Task[] || [],
      thumbnailImage: metaData?.frontmatter.thumbnailImage,
      has_premium_content: trainingData?.task?.some((task: Task) => task.is_premium) || false
    };

    return mergedData;
  } catch (error) {
    console.error('トレーニング詳細取得エラー:', error);
    return null;
  }
}

/**
 * ユーザーのタスク進捗状況を取得する
 */
export async function getUserTaskProgress(userId: string, trainingId: string) {
  if (!userId || !trainingId) return null;

  try {
    const { data: progressData, error: progressError } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId);

    if (progressError) {
      console.error('進捗データ取得エラー:', progressError);
      return null;
    }

    // 進捗データをマップ形式に変換
    const progressMap = progressData.reduce((acc, progress) => {
      acc[progress.task_id] = {
        status: progress.status,
        completed_at: progress.completed_at
      };
      return acc;
    }, {});

    return { progressMap };
  } catch (error) {
    console.error('進捗データ取得エラー:', error);
    return null;
  }
}

/**
 * タスクの進捗状態を更新する
 */
export async function updateTaskProgress(
  userId: string,
  taskId: string,
  status: 'todo' | 'done' | 'in-progress'
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        task_id: taskId,
        status,
        completed_at: status === 'done' ? new Date().toISOString() : null
      });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('進捗更新エラー:', error);
    return { error: error instanceof Error ? error : new Error('進捗の更新に失敗しました') };
  }
}

/**
 * トレーニングのタスク詳細を取得する
 */
export async function getTrainingTaskDetail(trainingSlug: string, taskSlug: string): Promise<TaskDetailData | null> {
  try {
    // データベースからトレーニングとタスク情報を取得
    const { data: trainingData, error: trainingError } = await supabase
      .from('training')
      .select('*, task!inner(*)')
      .eq('slug', trainingSlug)
      .eq('task.slug', taskSlug)
      .maybeSingle(); // single()の代わりにmaybeSingle()を使用

    if (trainingError && trainingError.code !== 'PGRST116') {
      console.error('タスクデータ取得エラー:', trainingError);
      
      // データベースから取得できない場合はStorageから取得を試みる
      try {
        const mdxData = await loadMdxContent(trainingSlug, taskSlug);
        const trainingMeta = await getTrainingMetaFromStorage(trainingSlug);
        
        if (mdxData && trainingMeta) {
          return {
            id: `storage-${taskSlug}`,
            training_id: `storage-${trainingSlug}`,
            slug: taskSlug,
            title: mdxData.frontmatter.title,
            order_index: mdxData.frontmatter.order_index || 1,
            is_premium: mdxData.frontmatter.is_premium || false,
            preview_sec: mdxData.frontmatter.preview_sec || 30,
            content: mdxData.content,
            video_full: mdxData.frontmatter.video_full || null,
            video_preview: mdxData.frontmatter.video_preview || null,
            created_at: null,
            next_task: null,
            prev_task: null,
            trainingTitle: trainingMeta.frontmatter.title,
            trainingSlug: trainingSlug
          };
        }
      } catch (storageError) {
        console.error('Storageからのタスクデータ取得エラー:', storageError);
      }
      
      return null;
    }

    // データベースにデータがない場合はStorageから取得を試みる
    if (!trainingData) {
      try {
        const mdxData = await loadMdxContent(trainingSlug, taskSlug);
        const trainingMeta = await getTrainingMetaFromStorage(trainingSlug);
        
        if (mdxData && trainingMeta) {
          return {
            id: `storage-${taskSlug}`,
            training_id: `storage-${trainingSlug}`,
            slug: taskSlug,
            title: mdxData.frontmatter.title,
            order_index: mdxData.frontmatter.order_index || 1,
            is_premium: mdxData.frontmatter.is_premium || false,
            preview_sec: mdxData.frontmatter.preview_sec || 30,
            content: mdxData.content,
            video_full: mdxData.frontmatter.video_full || null,
            video_preview: mdxData.frontmatter.video_preview || null,
            created_at: null,
            next_task: null,
            prev_task: null,
            trainingTitle: trainingMeta.frontmatter.title,
            trainingSlug: trainingSlug
          };
        }
      } catch (storageError) {
        console.error('Storageからのタスクデータ取得エラー:', storageError);
      }
      
      return null;
    }

    const task = trainingData.task[0];
    if (!task) {
      console.error('タスクが見つかりません');
      return null;
    }

    // タスクの前後関係を取得
    const { data: allTasks } = await supabase
      .from('task')
      .select('id, slug, order_index')
      .eq('training_id', trainingData.id)
      .order('order_index');

    const currentIndex = allTasks?.findIndex(t => t.id === task.id) ?? -1;
    const prevTask = currentIndex > 0 ? allTasks?.[currentIndex - 1].slug : null;
    const nextTask = currentIndex < (allTasks?.length ?? 0) - 1 ? allTasks?.[currentIndex + 1].slug : null;

    // Storageからコンテンツを取得
    let content = '';
    try {
      const mdxData = await loadMdxContent(trainingSlug, taskSlug);
      content = mdxData.content;
    } catch (mdxError) {
      console.error('MDXコンテンツ取得エラー:', mdxError);
      content = task.content || '';
    }

    return {
      ...task,
      content,
      trainingTitle: trainingData.title,
      trainingSlug: trainingData.slug,
      prev_task: prevTask,
      next_task: nextTask
    };
  } catch (error) {
    console.error('タスク詳細取得エラー:', error);
    return null;
  }
}