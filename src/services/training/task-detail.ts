
import { supabase } from "@/integrations/supabase/client";
import { TaskDetailData } from "@/types/training";
import { TrainingError } from "@/utils/errors";
import { handleEdgeFunctionError, validateEdgeFunctionResponse } from "./error-handlers";

/**
 * タスク詳細を取得（Storage + Edge Functionベース）
 */
export const getTrainingTaskDetail = async (trainingSlug: string, taskSlug: string): Promise<TaskDetailData> => {
  console.log(`Storage + Edge Functionからタスク詳細を取得: ${trainingSlug}/${taskSlug}`);
  
  try {
    if (!trainingSlug || !taskSlug) {
      throw new TrainingError('トレーニングスラッグとタスクスラッグが必要です', 'INVALID_REQUEST', 400);
    }
    
    // 新しいEdge Functionを呼び出し
    const { data, error } = await supabase.functions.invoke('get-training-content', {
      body: {
        trainingSlug,
        taskSlug
      }
    });

    console.log('Edge Function レスポンス:', { data, error });

    if (error) {
      handleEdgeFunctionError(error, 'タスク詳細の取得に失敗しました');
    }

    const responseData = validateEdgeFunctionResponse(data, 'タスク詳細');
    
    // レスポンス形式を TaskDetailData 型に合わせて変換
    const taskDetail: TaskDetailData = {
      id: `${trainingSlug}-${taskSlug}`,
      slug: taskSlug,
      title: responseData.meta.title || taskSlug,
      content: responseData.content,
      is_premium: responseData.isPremium,
      order_index: responseData.meta.order || 1,
      training_id: trainingSlug,
      created_at: new Date().toISOString(),
      video_full: responseData.meta.video_full || null,
      video_preview: responseData.meta.video_preview || null,
      preview_sec: responseData.meta.preview_sec || 30,
      trainingTitle: responseData.meta.training_title || trainingSlug,
      trainingSlug: trainingSlug,
      next_task: responseData.meta.next_task || null,
      prev_task: responseData.meta.prev_task || null,
      isPremiumCut: responseData.showPremiumBanner,
      hasAccess: responseData.hasAccess
    };

    console.log('変換済みタスク詳細:', taskDetail);
    
    return taskDetail;
    
  } catch (err) {
    // カスタムエラーは再スロー
    if (err instanceof TrainingError) {
      throw err;
    }
    
    console.error('getTrainingTaskDetail 予期しないエラー:', err);
    throw new TrainingError('タスク詳細の取得中に予期しないエラーが発生しました', 'UNKNOWN_ERROR');
  }
};
