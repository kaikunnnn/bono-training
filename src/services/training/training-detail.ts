
import { supabase } from "@/integrations/supabase/client";
import { TrainingDetailData } from "@/types/training";
import { TrainingError } from "@/utils/errors";
import { handleEdgeFunctionError, validateEdgeFunctionResponse } from "./error-handlers";

/**
 * トレーニング詳細情報を取得（Storageベース）
 */
export const getTrainingDetail = async (slug: string): Promise<TrainingDetailData> => {
  try {
    console.log(`Edge Functionからトレーニング詳細を取得: ${slug}`);
    
    if (!slug || slug.trim() === '') {
      throw new TrainingError('トレーニングスラッグが指定されていません', 'INVALID_REQUEST', 400);
    }
    
    const { data, error } = await supabase.functions.invoke('get-training-detail', {
      body: { slug }
    });

    if (error) {
      handleEdgeFunctionError(error, 'トレーニング詳細の取得に失敗しました');
    }

    return validateEdgeFunctionResponse(data, 'トレーニング詳細') as TrainingDetailData;
    
  } catch (err) {
    // カスタムエラーは再スロー
    if (err instanceof TrainingError) {
      throw err;
    }
    
    console.error('getTrainingDetail 予期しないエラー:', err);
    throw new TrainingError('トレーニング詳細の取得中に予期しないエラーが発生しました', 'UNKNOWN_ERROR');
  }
};
