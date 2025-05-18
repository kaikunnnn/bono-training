
import { supabase } from "@/integrations/supabase/client";
import { loadTrainingMeta } from "@/utils/mdxLoader";

/**
 * トレーニング一覧を取得
 */
export const getTrainings = async () => {
  try {
    // Supabase DBからトレーニングデータを取得
    const { data: supabaseData, error } = await supabase
      .from('training')
      .select('*');

    if (error) throw error;

    // Storageからトレーニングデータも併せて取得
    try {
      const mdxData = await loadAllTrainingMetaFromStorage();
      
      // 両方のデータソースを結合（Supabaseデータを優先）
      const combinedData = [
        ...(supabaseData || []),
        ...mdxData
      ];
      
      // スラッグの重複を削除
      const slugMap = new Map();
      combinedData.forEach(item => {
        if (!slugMap.has(item.slug)) {
          slugMap.set(item.slug, item);
        }
      });
      
      return Array.from(slugMap.values());
    } catch (mdxError) {
      console.error('MDXデータ取得エラー:', mdxError);
      // MDX取得エラーの場合はSupabaseデータのみ返す
      return supabaseData || [];
    }
  } catch (error) {
    console.error('トレーニング一覧取得エラー:', error);
    throw error;
  }
};

/**
 * ストレージからすべてのトレーニングメタデータを取得
 */
async function loadAllTrainingMetaFromStorage() {
  try {
    // エッジ関数経由でトレーニングメタデータを取得
    const { data, error } = await supabase.functions.invoke('get-training-meta', {
      method: 'GET'
    });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('ストレージからのメタデータ取得エラー:', error);
    return [];
  }
}

/**
 * トレーニング詳細情報を取得
 */
export const getTrainingDetail = async (slug: string) => {
  try {
    // まずSupabaseから検索
    const { data: supabaseData, error } = await supabase
      .from('training')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error) {
      if (error.code === 'PGRST116') { // データが見つからない場合
        // ストレージから検索
        try {
          const storageData = await loadTrainingMeta(slug);
          if (storageData) {
            return {
              id: `storage-${slug}`,
              ...storageData
            };
          }
        } catch (storageError) {
          console.error('ストレージからのメタデータ取得エラー:', storageError);
          throw error; // 元のエラーをスロー
        }
      } else {
        throw error;
      }
    }

    return supabaseData;
  } catch (error) {
    console.error('トレーニング詳細取得エラー:', error);
    throw error;
  }
};

/**
 * トレーニングのタスク一覧を取得
 */
export const getTrainingTasks = async (trainingId: string) => {
  try {
    // トレーニングIDがUUID形式かどうかで処理を分ける
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(trainingId);
    
    // Supabase DBからのデータ取得
    if (isUuid) {
      const { data, error } = await supabase
        .from('task')
        .select('*')
        .eq('training_id', trainingId)
        .order('order_index');

      if (error) throw error;
      return data || [];
    } 
    // Storageからのデータ取得
    else {
      // trainingIdがストレージ識別子の場合（例: storage-react-basics）
      const slug = trainingId.replace('storage-', '');
      const trainingData = await loadTrainingMeta(slug, true);
      
      if (trainingData && trainingData.tasks) {
        // Storageから取得したタスク一覧にIDを付与してDBと同じ形式に整形
        return trainingData.tasks.map((task: any, index: number) => ({
          id: `${slug}-task-${index}`,
          training_id: trainingId,
          ...task
        }));
      }
      
      return [];
    }
  } catch (error) {
    console.error('タスク一覧取得エラー:', error);
    throw error;
  }
};

/**
 * タスク詳細を取得
 */
export const getTrainingTaskDetail = async (trainingSlug: string, taskSlug: string) => {
  try {
    // まず、トレーニング詳細を取得
    const training = await getTrainingDetail(trainingSlug);
    
    if (!training) {
      throw new Error('トレーニングが見つかりません');
    }
    
    // トレーニングIDがUUID形式かどうかで処理を分ける
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(training.id);
    
    if (isUuid) {
      // Supabase DBからタスク詳細を取得
      const { data, error } = await supabase
        .from('task')
        .select('*')
        .eq('training_id', training.id)
        .eq('slug', taskSlug)
        .single();

      if (error) throw error;
      return {
        ...data,
        trainingTitle: training.title,
        trainingSlug: trainingSlug
      };
    } else {
      // Storageからタスク詳細を取得
      const trainingData = await loadTrainingMeta(trainingSlug, true);
      
      if (trainingData && trainingData.tasks) {
        const task = trainingData.tasks.find((t: any) => t.slug === taskSlug);
        
        if (!task) {
          throw new Error('タスクが見つかりません');
        }
        
        // 前後のタスクを取得
        const taskIndex = trainingData.tasks.findIndex((t: any) => t.slug === taskSlug);
        const prevTask = taskIndex > 0 ? trainingData.tasks[taskIndex - 1].slug : null;
        const nextTask = taskIndex < trainingData.tasks.length - 1 ? trainingData.tasks[taskIndex + 1].slug : null;
        
        return {
          id: `${trainingSlug}-task-${taskIndex}`,
          training_id: training.id,
          ...task,
          trainingTitle: training.title,
          trainingSlug,
          prev_task: prevTask,
          next_task: nextTask
        };
      }
      
      throw new Error('タスクが見つかりません');
    }
  } catch (error) {
    console.error('タスク詳細取得エラー:', error);
    throw error;
  }
};

/**
 * ユーザーの進捗状況を取得
 */
export const getUserTaskProgress = async (userId: string, trainingId: string) => {
  try {
    // Supabase DBからユーザーの進捗状況を取得
    const { data, error } = await supabase
      .from('user_progress')
      .select('task_id, status, completed_at')
      .eq('user_id', userId);

    if (error) throw error;
    
    // タスクIDごとの進捗状況をマッピング
    const progressMap = {};
    data?.forEach(item => {
      progressMap[item.task_id] = {
        status: item.status,
        completed_at: item.completed_at
      };
    });
    
    return { progressMap, userId, trainingId };
  } catch (error) {
    console.error('進捗状況取得エラー:', error);
    return { error: error.message, userId, trainingId };
  }
};

/**
 * ユーザーの進捗状況を更新
 */
export const updateTaskProgress = async (userId: string, taskId: string, status: 'done' | 'todo' | 'in-progress') => {
  try {
    const completed_at = status === 'done' ? new Date().toISOString() : null;
    
    // upsert操作で進捗状況を更新/挿入
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
    return { error: error.message, success: false };
  }
};
