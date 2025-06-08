import { supabase } from "@/integrations/supabase/client";
import { TrainingDetailData, TaskDetailData } from "@/types/training";

/**
 * トレーニング一覧を取得
 * TODO: Phase 4-2でEdge Functionに切り替え
 */
export const getTrainings = async () => {
  console.log('TODO: Edge Functionからトレーニング一覧を取得');
  
  // 暫定的なダミーデータ
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
};

/**
 * トレーニング詳細情報を取得
 * TODO: Phase 4-2でEdge Functionに切り替え
 */
export const getTrainingDetail = async (slug: string): Promise<TrainingDetailData> => {
  console.log(`TODO: Edge Functionからトレーニング詳細を取得: ${slug}`);
  
  // 暫定的なダミーデータ
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
};

/**
 * タスク詳細を取得（Edge Functionを使用）
 */
export const getTrainingTaskDetail = async (trainingSlug: string, taskSlug: string): Promise<TaskDetailData> => {
  console.log(`Edge Functionからタスク詳細を取得: ${trainingSlug}/${taskSlug}`);
  
  try {
    // Edge Functionを呼び出し
    const { data, error } = await supabase.functions.invoke('get-training-content', {
      body: {
        trainingSlug,
        taskSlug
      }
    });

    console.log('Edge Function レスポンス:', { data, error });

    if (error) {
      console.error('Edge Function エラー:', error);
      throw new Error(`Edge Function呼び出しエラー: ${error.message}`);
    }

    if (!data?.success || !data?.data) {
      console.error('Edge Function 失敗レスポンス:', data);
      throw new Error(data?.message || 'コンテンツの取得に失敗しました');
    }

    return data.data as TaskDetailData;
    
  } catch (err) {
    console.error('getTrainingTaskDetail エラー:', err);
    
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

/**
 * ユーザーの進捗状況を更新
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
