
import { supabase } from "@/integrations/supabase/client";
import { TaskDetailData } from "@/types/training";
import { TrainingError } from "@/utils/errors";
import { handleEdgeFunctionError, validateEdgeFunctionResponse } from "./error-handlers";

/**
 * タスク詳細を取得（Edge Functionを使用）
 */
export const getTrainingTaskDetail = async (trainingSlug: string, taskSlug: string): Promise<TaskDetailData> => {
  console.log(`Edge Functionからタスク詳細を取得: ${trainingSlug}/${taskSlug}`);
  
  try {
    if (!trainingSlug || !taskSlug) {
      throw new TrainingError('トレーニングスラッグとタスクスラッグが必要です', 'INVALID_REQUEST', 400);
    }
    
    // Edge Functionを呼び出し
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

    return validateEdgeFunctionResponse(data, 'タスク詳細') as TaskDetailData;
    
  } catch (err) {
    // カスタムエラーは再スロー
    if (err instanceof TrainingError) {
      throw err;
    }
    
    console.error('getTrainingTaskDetail 予期しないエラー:', err);
    throw new TrainingError('タスク詳細の取得中に予期しないエラーが発生しました', 'UNKNOWN_ERROR');
  }
};
