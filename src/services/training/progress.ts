
import { supabase } from "@/integrations/supabase/client";

/**
 * ユーザーの進捗状況を取得
 */
export const getUserTaskProgress = async (userId: string, trainingId: string) => {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .select('task_id, status, completed_at')
      .eq('user_id', userId);

    if (error) throw error;
    
    const progressMap: Record<string, any> = {};
    data?.forEach(item => {
      progressMap[item.task_id] = {
        status: item.status,
        completed_at: item.completed_at
      };
    });
    
    return { progressMap, userId, trainingId };
  } catch (error) {
    console.error('進捗状況取得エラー:', error);
    return { error: (error as Error).message, userId, trainingId };
  }
};

/**
 * タスクの進捗状況を更新
 */
export const updateTaskProgress = async (userId: string, taskId: string, status: 'done' | 'todo' | 'in-progress') => {
  try {
    const completed_at = status === 'done' ? new Date().toISOString() : null;
    
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        task_id: taskId,
        status,
        completed_at
      }, { onConflict: 'user_id,task_id' });

    if (error) throw error;
    return { success: true, status };
  } catch (error) {
    console.error('進捗状況更新エラー:', error);
    return { error: (error as Error).message, success: false };
  }
};
