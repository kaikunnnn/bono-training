
import { supabase } from "@/integrations/supabase/client";
import { TaskDetailData } from "@/types/training";
import { TrainingError } from "@/utils/errors";
import { handleEdgeFunctionError, validateEdgeFunctionResponse } from "./error-handlers";

/**
 * 安全にプロパティを取得するヘルパー関数
 */
const safeGet = (obj: any, path: string, defaultValue: any = null): any => {
  try {
    return path.split('.').reduce((current, key) => current && current[key], obj) ?? defaultValue;
  } catch (error) {
    console.warn(`safeGet: ${path} の取得に失敗:`, error);
    return defaultValue;
  }
};

/**
 * レスポンスデータの検証と変換
 */
const validateAndTransformResponse = (responseData: any, trainingSlug: string, taskSlug: string): TaskDetailData => {
  if (!responseData) {
    throw new TrainingError('レスポンスデータが空です', 'EMPTY_RESPONSE');
  }

  // 必須フィールドの検証
  const content = safeGet(responseData, 'content', '');
  const meta = safeGet(responseData, 'meta', {});
  
  if (!content && typeof content !== 'string') {
    console.warn('validateAndTransformResponse: コンテンツが文字列ではありません');
  }

  if (!meta || typeof meta !== 'object') {
    console.warn('validateAndTransformResponse: メタデータが無効です');
  }

  // 安全な型変換
  const isPremium = (() => {
    const rawValue = safeGet(responseData, 'isPremium', false);
    if (typeof rawValue === 'boolean') return rawValue;
    if (rawValue === 'true') return true;
    if (rawValue === 'false') return false;
    return Boolean(rawValue);
  })();

  const orderIndex = (() => {
    const rawValue = safeGet(meta, 'order_index', 1);
    if (typeof rawValue === 'number') return rawValue;
    const parsed = parseInt(rawValue, 10);
    return isNaN(parsed) ? 1 : parsed;
  })();

  const previewSec = (() => {
    const rawValue = safeGet(meta, 'preview_sec', 30);
    if (typeof rawValue === 'number') return rawValue;
    const parsed = parseInt(rawValue, 10);
    return isNaN(parsed) ? 30 : parsed;
  })();

  // レスポンス形式を TaskDetailData 型に合わせて変換
  const taskDetail: TaskDetailData = {
    id: `${trainingSlug}-${taskSlug}`,
    slug: taskSlug,
    title: safeGet(meta, 'title', taskSlug),
    content: content,
    is_premium: isPremium,
    order_index: orderIndex,
    training_id: trainingSlug,
    created_at: new Date().toISOString(),
    video_full: safeGet(meta, 'video_full'),
    video_preview: safeGet(meta, 'video_preview'),
    preview_sec: previewSec,
    trainingTitle: safeGet(meta, 'training_title', trainingSlug),
    trainingSlug: trainingSlug,
    next_task: safeGet(meta, 'next_task'),
    prev_task: safeGet(meta, 'prev_task'),
    isPremiumCut: safeGet(responseData, 'showPremiumBanner', false),
    hasAccess: safeGet(responseData, 'hasAccess', true),
    // Storage front-matterから取得した新しいフィールドを追加
    estimated_time: safeGet(meta, 'estimated_time'),
    difficulty: safeGet(meta, 'difficulty'),
    description: safeGet(meta, 'description')
  };

  console.log('validateAndTransformResponse - 変換完了:', {
    inputKeys: Object.keys(responseData),
    metaKeys: Object.keys(meta),
    outputKeys: Object.keys(taskDetail),
    isPremium: {
      raw: safeGet(responseData, 'isPremium'),
      converted: isPremium
    }
  });

  return taskDetail;
};

/**
 * タスク詳細を取得（Storage + Edge Functionベース）
 */
export const getTrainingTaskDetail = async (trainingSlug: string, taskSlug: string): Promise<TaskDetailData> => {
  console.log(`Storage + Edge Functionからタスク詳細を取得: ${trainingSlug}/${taskSlug}`);
  
  try {
    if (!trainingSlug || !taskSlug) {
      throw new TrainingError('トレーニングスラッグとタスクスラッグが必要です', 'INVALID_REQUEST', 400);
    }
    
    if (typeof trainingSlug !== 'string' || typeof taskSlug !== 'string') {
      throw new TrainingError('スラッグは文字列である必要があります', 'INVALID_REQUEST', 400);
    }
    
    // 新しいEdge Functionを呼び出し
    const { data, error } = await supabase.functions.invoke('get-training-content', {
      body: {
        trainingSlug: trainingSlug.trim(),
        taskSlug: taskSlug.trim()
      }
    });

    console.log('Edge Function レスポンス:', { 
      hasData: !!data, 
      hasError: !!error,
      dataKeys: data ? Object.keys(data) : [],
      errorDetails: error 
    });

    if (error) {
      handleEdgeFunctionError(error, 'タスク詳細の取得に失敗しました');
    }

    const responseData = validateEdgeFunctionResponse(data, 'タスク詳細');
    const taskDetail = validateAndTransformResponse(responseData, trainingSlug, taskSlug);
    
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
