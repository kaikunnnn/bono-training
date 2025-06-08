
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
    
    // フォールバック: ダミーデータを返す
    console.log('フォールバック: ダミーデータを使用');
    const trainingDetailData: TrainingDetailData = {
      id: `${slug}-1`,
      slug: slug,
      title: "Todo アプリ UI 制作",
      description: "実践的な Todo アプリの UI デザインを学ぶ",
      type: "challenge",
      difficulty: "normal",
      tags: ["ui", "todo", "実践"],
      tasks: [
        {
          id: `${slug}-task-1`,
          slug: "introduction",
          title: "トレーニングの紹介",
          is_premium: false,
          order_index: 1,
          training_id: `${slug}-1`,
          created_at: null,
          video_full: "https://example.com/full.mp4",
          video_preview: "https://example.com/preview.mp4",
          preview_sec: 30,
          next_task: "ui-layout-basic01",
          prev_task: null
        },
        {
          id: `${slug}-task-2`,
          slug: "ui-layout-basic01",
          title: "画面構成の基本",
          is_premium: true,
          order_index: 2,
          training_id: `${slug}-1`,
          created_at: null,
          video_full: "https://example.com/full.mp4",
          video_preview: "https://example.com/preview.mp4",
          preview_sec: 30,
          next_task: null,
          prev_task: "introduction"
        }
      ],
      skills: [],
      prerequisites: [],
      has_premium_content: true,
      thumbnailImage: 'https://source.unsplash.com/random/200x100'
    };

    return trainingDetailData;
  }
};
