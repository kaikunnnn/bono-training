
import { supabase } from "@/integrations/supabase/client";
import { Training } from "@/types/training";
import { TrainingError } from "@/utils/errors";
import { handleEdgeFunctionError, validateEdgeFunctionResponse } from "./error-handlers";

/**
 * トレーニング一覧を取得（Storageベース）
 */
export const getTrainings = async (): Promise<Training[]> => {
  try {
    console.log('Edge Functionからトレーニング一覧を取得');
    
    const { data, error } = await supabase.functions.invoke('get-training-list', {
      body: {}
    });

    if (error) {
      handleEdgeFunctionError(error, 'トレーニング一覧の取得に失敗しました');
    }

    const result = validateEdgeFunctionResponse(data, 'トレーニング一覧');
    console.log('Edge Functionからの応答:', result);
    console.log('最初のtraining:', result[0]);
    console.log('iconの値:', result[0]?.icon);
    
    return result;
    
  } catch (err) {
    // カスタムエラーは再スロー
    if (err instanceof TrainingError) {
      throw err;
    }
    
    console.error('getTrainings 予期しないエラー:', err);
    
    // フォールバック: ダミーデータを返す
    console.log('フォールバック: ダミーデータを使用');
    return [
      {
        id: "todo-app-1",
        slug: "todo-app",
        title: "Todo アプリ UI 制作",
        description: "実践的な Todo アプリの UI デザインを学ぶ",
        type: "challenge" as 'challenge',
        difficulty: "normal",
        tags: ["ui", "todo", "実践"],
        icon: "📱",
        thumbnailImage: 'https://source.unsplash.com/random/200x100'
      }
    ];
  }
};
