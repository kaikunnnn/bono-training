import { supabase } from '@/integrations/supabase/client';

/**
 * トレーニング一覧を取得する
 * @returns トレーニングデータ
 */
export const getTrainingList = async () => {
  try {
    const { data, error } = await supabase
      .from('training')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('トレーニングデータ取得エラー:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('トレーニングデータ取得エラー:', error);
    return [];
  }
};

/**
 * トレーニング詳細を取得する
 * @param slug スラッグ
 * @returns トレーニング詳細データとタスクデータ
 */
export const getTrainingDetail = async (slug: string) => {
  try {
    // トレーニング情報を取得
    const { data: trainingData, error: trainingError } = await supabase
      .from('training')
      .select('*')
      .eq('slug', slug)
      .single();

    if (trainingError) {
      console.error('トレーニング情報取得エラー:', trainingError);
      throw trainingError;
    }

    // タスク情報を取得
    const { data: taskData, error: taskError } = await supabase
      .from('task')
      .select('*')
      .eq('training_id', trainingData.id)
      .order('order', { ascending: true });

    if (taskError) {
      console.error('タスク情報取得エラー:', taskError);
      throw taskError;
    }

    return {
      training: trainingData,
      tasks: taskData
    };
  } catch (error) {
    console.error('トレーニング詳細取得エラー:', error);
    throw error;
  }
};

/**
 * トレーニングのタスク詳細を取得する
 * @param trainingSlug トレーニングのスラッグ
 * @param taskSlug タスクのスラッグ
 * @returns タスク詳細情報と関連するトレーニング情報
 */
export const getTaskDetail = async (trainingSlug: string, taskSlug: string) => {
  try {
    // トレーニング情報を取得
    const { data: trainingData, error: trainingError } = await supabase
      .from('training')
      .select('*')
      .eq('slug', trainingSlug)
      .single();

    if (trainingError) {
      console.error('トレーニング情報取得エラー:', trainingError);
      throw trainingError;
    }

    // タスク情報を取得
    const { data: taskData, error: taskError } = await supabase
      .from('task')
      .select('*')
      .eq('training_id', trainingData.id)
      .eq('slug', taskSlug)
      .single();

    if (taskError) {
      console.error('タスク情報取得エラー:', taskError);
      throw taskError;
    }

    return {
      task: taskData,
      training: trainingData
    };
  } catch (error) {
    console.error('タスク詳細取得エラー:', error);
    throw error;
  }
};

/**
 * ユーザーのタスク進捗状況を取得する
 * @param userId ユーザーID
 * @param taskId タスクID
 * @returns 進捗状況
 */
export const getTaskProgress = async (userId: string, taskId: string) => {
  if (!userId) return null;
  
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .maybeSingle();

    if (error) {
      console.error('タスク進捗取得エラー:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('タスク進捗取得エラー:', error);
    return null;
  }
};

/**
 * タスクの進捗状況を更新する
 * @param userId ユーザーID
 * @param taskId タスクID
 * @param status 進捗状態
 * @returns 更新結果
 */
export const updateTaskProgress = async (userId: string, taskId: string, status: 'todo' | 'in-progress' | 'done') => {
  if (!userId) return { error: new Error('ユーザーIDが必要です') };
  
  try {
    const now = new Date().toISOString();
    const completed_at = status === 'done' ? now : null;

    const { data, error } = await supabase
      .from('user_progress')
      .upsert(
        {
          user_id: userId,
          task_id: taskId,
          status,
          completed_at
        },
        {
          onConflict: 'user_id,task_id'
        }
      );

    if (error) {
      console.error('タスク進捗更新エラー:', error);
      return { error };
    }

    return { data };
  } catch (error) {
    console.error('タスク進捗更新エラー:', error);
    return { error: error instanceof Error ? error : new Error('不明なエラー') };
  }
};
