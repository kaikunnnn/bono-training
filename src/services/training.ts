
import { supabase } from "@/integrations/supabase/client";
import { TrainingDetailData, TaskDetailData } from "@/types/training";
import { 
  AuthError, 
  ForbiddenError, 
  NotFoundError, 
  NetworkError, 
  TrainingError,
  createErrorFromCode 
} from "@/utils/errors";

/**
 * Edge Function レスポンスのエラーハンドリング
 */
function handleEdgeFunctionError(error: any, fallbackMessage: string): never {
  console.error('Edge Function エラー詳細:', error);
  
  // ネットワークエラーの判定
  if (!error || error.name === 'TypeError' || error.message?.includes('Failed to fetch')) {
    throw new NetworkError('ネットワーク接続エラーが発生しました。インターネット接続を確認してください。');
  }
  
  // Supabase Functions の構造化エラー
  if (error.context?.body?.error) {
    const errorData = error.context.body.error;
    const customError = createErrorFromCode(errorData.code, errorData.message);
    throw customError;
  }
  
  // 汎用的なエラーメッセージでフォールバック
  throw new TrainingError(fallbackMessage, 'UNKNOWN_ERROR');
}

/**
 * Edge Function レスポンスの検証
 */
function validateEdgeFunctionResponse(data: any, context: string): any {
  if (!data) {
    throw new TrainingError(`${context}のレスポンスが空です`, 'EMPTY_RESPONSE');
  }
  
  if (data.success === false && data.error) {
    const customError = createErrorFromCode(data.error.code, data.error.message);
    throw customError;
  }
  
  if (!data.success || !data.data) {
    throw new TrainingError(data.message || `${context}のデータ取得に失敗しました`, 'INVALID_RESPONSE');
  }
  
  return data.data;
}

/**
 * トレーニング一覧を取得（Storageベース）
 */
export const getTrainings = async () => {
  try {
    console.log('Edge Functionからトレーニング一覧を取得');
    
    const { data, error } = await supabase.functions.invoke('get-training-list', {
      body: {}
    });

    if (error) {
      handleEdgeFunctionError(error, 'トレーニング一覧の取得に失敗しました');
    }

    return validateEdgeFunctionResponse(data, 'トレーニング一覧');
    
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
        thumbnailImage: 'https://source.unsplash.com/random/200x100'
      }
    ];
  }
};

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
    
    // フォールバック: ダミーデータを返す
    console.log('フォールバック: ダミーデータを使用');
    const taskDetailData: TaskDetailData = {
      id: `${trainingSlug}-${taskSlug}`,
      slug: taskSlug,
      title: taskSlug === "introduction" ? "トレーニングの紹介" : "画面構成の基本",
      content: taskSlug === "introduction" 
        ? "# Todo アプリ：画面構成の基本\n\nこのレッスンでは、Todo アプリの基本的な画面設計を行います。\n\n## 学習のゴール\n\n- ユーザー視点での UI 構成の考え方を理解する\n- 最小限の構成でアプリの目的を伝える設計ができるようになる"
        : "# Todo アプリ：画面構成の基本\n\nこのレッスンでは、Todo アプリの基本的な画面設計を行います。\n\n## 学習のゴール\n\n### 画面構成の基本を意識して以下の目標を目指してみよう\n\n- ユーザー視点での UI 構成の考え方を理解する\n- 最小限の構成でアプリの目的を伝える設計ができるようになる\n\n<!-- PREMIUM_ONLY -->\n\n## プレミアム限定：デザイン改善の実例\n\n以下のような改善テクニックも紹介します：\n\n- 枠線と余白で UI を整理する方法\n- ステータス別のタスク表示に色を使う方法\n- アイコンとテキストの配置で視認性を高める工夫",
      is_premium: taskSlug === "ui-layout-basic01",
      order_index: taskSlug === "introduction" ? 1 : 2,
      training_id: `${trainingSlug}-1`,
      created_at: null,
      video_full: "https://example.com/full.mp4",
      video_preview: "https://example.com/preview.mp4",
      preview_sec: 30,
      trainingTitle: "Todo アプリ UI 制作",
      trainingSlug: trainingSlug,
      next_task: taskSlug === "introduction" ? "ui-layout-basic01" : null,
      prev_task: taskSlug === "ui-layout-basic01" ? "introduction" : null
    };
    
    return taskDetailData;
  }
};

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
