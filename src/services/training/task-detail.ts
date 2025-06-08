
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
