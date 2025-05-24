import { supabase } from "@/integrations/supabase/client";
import { loadTrainingMeta, loadMdxContent } from "@/utils/mdxLoader";
import { TrainingDetailData, TaskDetailData } from "@/types/training";

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
export const getTrainingDetail = async (slug: string): Promise<TrainingDetailData> => {
  try {
    console.log('getTrainingDetail - slug:', slug);

    // まずSupabaseから検索
    const { data: supabaseData, error } = await supabase
      .from('training')
      .select('*')
      .eq('slug', slug)
      .single();

    let training;
    
    if (error && error.code === 'PGRST116') {
      console.log('Supabaseに見つからないため、Storageから検索します:', slug);
      // ストレージから検索
      try {
        const { data: storageData, error: storageError } = await supabase.functions.invoke('get-training-meta', {
          body: { slug, tasks: true }
        });
        
        if (storageError || !storageData) {
          throw new Error(`トレーニング「${slug}」が見つかりませんでした`);
        }
        
        training = {
          id: `storage-${slug}`,
          ...storageData
        };
        console.log('Storageから取得成功:', training);
      } catch (storageError) {
        console.error('ストレージからのメタデータ取得エラー:', storageError);
        throw new Error(`トレーニング「${slug}」が見つかりませんでした`);
      }
    } else if (error) {
      throw error;
    } else {
      training = supabaseData;
      // Supabaseのデータの場合、タスク一覧を別途取得
      const tasks = await getTrainingTasks(training.id);
      training.tasks = tasks;
    }

    // TrainingDetailData形式に整形して返す
    const trainingDetailData: TrainingDetailData = {
      id: training.id,
      slug: training.slug,
      title: training.title || '',
      description: training.description || '',
      type: training.type || 'challenge',
      difficulty: training.difficulty || '初級',
      tags: Array.isArray(training.tags) ? training.tags : [],
      tasks: training.tasks || [], // 必ず配列を設定
      skills: training.skills || [],
      prerequisites: training.prerequisites || [],
      has_premium_content: training.tasks?.some(task => task.is_premium) || false,
      thumbnailImage: training.thumbnailImage || ''
    };

    console.log('最終的なtrainingDetailData:', trainingDetailData);
    return trainingDetailData;
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
export const getTrainingTaskDetail = async (trainingSlug: string, taskSlug: string): Promise<TaskDetailData> => {
  try {
    // まず、トレーニング詳細を取得
    const training = await getTrainingDetail(trainingSlug);
    
    if (!training) {
      throw new Error('トレーニングが見つかりません');
    }
    
    let baseTaskData;
    let mdxContent = '';
    
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
      baseTaskData = data;
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
        
        baseTaskData = {
          id: `${trainingSlug}-task-${taskIndex}`,
          training_id: training.id,
          ...task,
          prev_task: prevTask,
          next_task: nextTask
        };
      } else {
        throw new Error('タスクが見つかりません');
      }
    }
    
    // MDXコンテンツを取得（可能な場合）
    try {
      const mdxData = await loadMdxContent(trainingSlug, taskSlug);
      mdxContent = mdxData.content || '';
    } catch (error) {
      console.warn('MDXコンテンツの取得に失敗しました:', error);
      mdxContent = baseTaskData.content || ''; // 既存のcontentをフォールバックとして使用
    }
    
    // ベースとなるタスクデータとMDXコンテンツを統合し、必要なプロパティがすべて存在することを確保
    const mergedTaskData: TaskDetailData = {
      ...baseTaskData,
      content: mdxContent || baseTaskData.content || '',
      trainingTitle: training.title,
      trainingSlug: trainingSlug,
      // 必須プロパティの存在を確保
      next_task: baseTaskData.next_task || null,
      prev_task: baseTaskData.prev_task || null,
      created_at: baseTaskData.created_at || null,
      video_full: baseTaskData.video_full || null,
      video_preview: baseTaskData.video_preview || null
    };
    
    return mergedTaskData;
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
